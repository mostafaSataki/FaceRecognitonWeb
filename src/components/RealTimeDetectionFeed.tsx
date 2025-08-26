'use client';

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Detection } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, Activity, AlertCircle, CheckCircle } from 'lucide-react';

interface RealTimeDetectionFeedProps {
  maxItems?: number;
}

export function RealTimeDetectionFeed({ maxItems = 50 }: RealTimeDetectionFeedProps) {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeCameras, setActiveCameras] = useState<string[]>([]);
  const [totalDetections, setTotalDetections] = useState(0);

  useEffect(() => {
    // Initialize WebSocket connection
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000');
    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to WebSocket server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from WebSocket server');
    });

    // Face detection events
    newSocket.on('faceDetected', (data: { cameraId: string; detection: Detection }) => {
      setDetections(prev => {
        const newDetections = [data.detection, ...prev];
        return newDetections.slice(0, maxItems);
      });
      setTotalDetections(prev => prev + 1);
    });

    // Camera control events
    newSocket.on('cameraStarted', (data: { cameraId: string }) => {
      setActiveCameras(prev => [...prev, data.cameraId]);
    });

    newSocket.on('cameraStopped', (data: { cameraId: string }) => {
      setActiveCameras(prev => prev.filter(id => id !== data.cameraId));
    });

    newSocket.on('cameraError', (data: { cameraId: string; error: string }) => {
      console.error('Camera error:', data);
    });

    // Get initial active cameras
    newSocket.emit('getActiveCameras');

    newSocket.on('activeCameras', (cameras: any[]) => {
      setActiveCameras(cameras.map((cam: any) => cam.id));
    });

    return () => {
      newSocket.close();
    };
  }, [maxItems]);

  const clearDetections = () => {
    setDetections([]);
    setTotalDetections(0);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Real-time Detections
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Live
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Offline
                </>
              )}
            </Badge>
            <Button variant="outline" size="sm" onClick={clearDetections}>
              Clear
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Active Cameras: {activeCameras.length}</span>
          <span>Total Detections: {totalDetections}</span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="p-4 space-y-3">
            {detections.length === 0 ? (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No real-time detections</h3>
                <p className="text-gray-600">
                  {isConnected ? 'Waiting for face detections...' : 'Connect to start receiving detections'}
                </p>
              </div>
            ) : (
              detections.map((detection) => (
                <Card key={detection.id} className="p-3 border-l-4 border-l-blue-500">
                  <div className="flex items-start gap-3">
                    {/* Face Image */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg border overflow-hidden">
                        {detection.imagePath ? (
                          <img
                            src={detection.imagePath}
                            alt="Detected face"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Detection Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900 truncate">
                          {detection.camera?.name || 'Unknown Camera'}
                        </h4>
                        <div className="flex items-center gap-2">
                          {detection.confidence && (
                            <Badge variant="outline" className="text-xs">
                              {Math.round(detection.confidence * 100)}%
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(detection.timestamp)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        Detected at {new Date(detection.timestamp).toLocaleTimeString()}
                      </div>

                      {/* Detection Metadata */}
                      {detection.metadata && (
                        <div className="mt-2">
                          <details className="text-sm">
                            <summary className="cursor-pointer text-gray-600 hover:text-gray-900">
                              Detection details
                            </summary>
                            <div className="mt-1 p-2 bg-gray-50 rounded text-xs">
                              {(() => {
                                try {
                                  const metadata = JSON.parse(detection.metadata || '{}');
                                  return (
                                    <div className="space-y-1">
                                      {metadata.box && (
                                        <div>
                                          <span className="font-medium">Position:</span>{' '}
                                          X: {Math.round(metadata.box.x)}, Y: {Math.round(metadata.box.y)},{' '}
                                          W: {Math.round(metadata.box.width)}, H: {Math.round(metadata.box.height)}
                                        </div>
                                      )}
                                      {metadata.keypoints && (
                                        <div>
                                          <span className="font-medium">Keypoints:</span>{' '}
                                          {metadata.keypoints.length} detected
                                        </div>
                                      )}
                                    </div>
                                  );
                                } catch {
                                  return <div>Invalid metadata</div>;
                                }
                              })()}
                            </div>
                          </details>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}