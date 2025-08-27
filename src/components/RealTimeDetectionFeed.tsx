'use client';

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Detection } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { User, Activity, AlertCircle, CheckCircle, ZoomIn, Download, Share2 } from 'lucide-react';

interface RealTimeDetectionFeedProps {
  maxItems?: number;
}

export function RealTimeDetectionFeed({ maxItems = 50 }: RealTimeDetectionFeedProps) {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeCameras, setActiveCameras] = useState<string[]>([]);
  const [totalDetections, setTotalDetections] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedDetection, setSelectedDetection] = useState<Detection | null>(null);

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

    // Enhanced face detection events with image data
    newSocket.on('faceDetected', (data: { 
      cameraId: string; 
      detection: Detection;
      imageData?: string;
    }) => {
      setDetections(prev => {
        // Create enhanced detection with image data
        const enhancedDetection = {
          ...data.detection,
          imagePath: data.imageData || data.detection.imagePath
        };
        
        const newDetections = [enhancedDetection, ...prev];
        return newDetections.slice(0, maxItems);
      });
      setTotalDetections(prev => prev + 1);
      
      // Auto-open dialog for new detections with images
      if (data.imageData && data.detection.confidence && data.detection.confidence > 0.8) {
        setSelectedImage(data.imageData);
        setSelectedDetection(data.detection);
      }
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
    setSelectedImage(null);
    setSelectedDetection(null);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (seconds < 60) return `${seconds} ثانیه پیش`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} دقیقه پیش`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} ساعت پیش`;
    return `${Math.floor(seconds / 86400)} روز پیش`;
  };

  const downloadImage = (imageData: string, detection: Detection) => {
    const link = document.createElement('a');
    link.download = `تشخیص-چهره-${detection.id}.jpg`;
    link.href = imageData;
    link.click();
  };

  const shareImage = async (imageData: string, detection: Detection) => {
    if (navigator.share) {
      try {
        const response = await fetch(imageData);
        const blob = await response.blob();
        const file = new File([blob], `تشخیص-چهره-${detection.id}.jpg`, { type: 'image/jpeg' });
        
        await navigator.share({
          title: 'تشخیص چهره',
          text: `چهره در ${new Date(detection.timestamp).toLocaleString('fa-IR')} از دوربین ${detection.camera?.name} تشخیص داده شد`,
          files: [file]
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const getDirectionText = (direction?: string) => {
    switch (direction) {
      case 'ENTRY': return 'ورود';
      case 'EXIT': return 'خروج';
      default: return 'ناشناخته';
    }
  };

  return (
    <>
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              تشخیص چهره زنده
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? (
                  <>
                    <CheckCircle className="w-3 h-3 ml-1" />
                    زنده
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 ml-1" />
                    آفلاین
                  </>
                )}
              </Badge>
              <Button variant="outline" size="sm" onClick={clearDetections}>
                پاک کردن
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>دوربین‌های فعال: {activeCameras.length}</span>
            <span>کل تشخیص‌ها: {totalDetections}</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-96">
            <div className="p-4 space-y-3">
              {detections.length === 0 ? (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">تشخیص زنده‌ای وجود ندارد</h3>
                  <p className="text-gray-600">
                    {isConnected ? 'در انتظار تشخیص چهره...' : 'برای دریافت تشخیص‌ها متصل شوید'}
                  </p>
                </div>
              ) : (
                detections.map((detection) => (
                  <Card key={detection.id} className="p-3 border-r-4 border-r-blue-500 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      {/* Enhanced Face Image */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg border-2 border-blue-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                          {detection.imagePath ? (
                            <Dialog>
                              <DialogTrigger asChild>
                                <button 
                                  className="w-full h-full relative group"
                                  onClick={() => {
                                    setSelectedImage(detection.imagePath!);
                                    setSelectedDetection(detection);
                                  }}
                                >
                                  <img
                                    src={detection.imagePath}
                                    alt="چهره تشخیص داده شده"
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                                    <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </button>
                              </DialogTrigger>
                            </Dialog>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Detection Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-gray-900 truncate">
                            {detection.camera?.name || 'دوربین ناشناخته'}
                          </h4>
                          <div className="flex items-center gap-2">
                            {detection.confidence && (
                              <Badge 
                                variant={detection.confidence > 0.8 ? "default" : "secondary"} 
                                className="text-xs"
                              >
                                {Math.round(detection.confidence * 100)}%
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(detection.timestamp)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-2">
                            <span>تشخیص در {new Date(detection.timestamp).toLocaleTimeString('fa-IR')}</span>
                            {detection.direction && (
                              <Badge variant="outline" className="text-xs">
                                {getDirectionText(detection.direction)}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Quick Actions */}
                        {detection.imagePath && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadImage(detection.imagePath!, detection)}
                              className="h-6 px-2 text-xs"
                            >
                              <Download className="w-3 h-3 ml-1" />
                              ذخیره
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => shareImage(detection.imagePath!, detection)}
                              className="h-6 px-2 text-xs"
                            >
                              <Share2 className="w-3 h-3 ml-1" />
                              اشتراک
                            </Button>
                          </div>
                        )}

                        {/* Detection Metadata */}
                        {detection.metadata && (
                          <div className="mt-2">
                            <details className="text-sm">
                              <summary className="cursor-pointer text-gray-600 hover:text-gray-900">
                                جزئیات تشخیص
                              </summary>
                              <div className="mt-1 p-2 bg-gray-50 rounded text-xs">
                                {(() => {
                                  try {
                                    const metadata = JSON.parse(detection.metadata || '{}');
                                    return (
                                      <div className="space-y-1">
                                        {metadata.box && (
                                          <div>
                                            <span className="font-medium">موقعیت:</span>{' '}
                                            X: {Math.round(metadata.box.x)}, Y: {Math.round(metadata.box.y)},{' '}
                                            W: {Math.round(metadata.box.width)}, H: {Math.round(metadata.box.height)}
                                          </div>
                                        )}
                                        {metadata.keypoints && (
                                          <div>
                                            <span className="font-medium">نقاط کلیدی:</span>{' '}
                                            {metadata.keypoints.length} مورد تشخیص داده شد
                                          </div>
                                        )}
                                      </div>
                                    );
                                  } catch {
                                    return <div>متادیت نامعتبر</div>;
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

      {/* Enhanced Image Modal */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center justify-between">
              <span>جزئیات تشخیص چهره</span>
              <div className="flex items-center gap-2">
                {selectedDetection?.confidence && (
                  <Badge variant={selectedDetection.confidence > 0.8 ? "default" : "secondary"}>
                    {Math.round(selectedDetection.confidence * 100)}% اطمینان
                  </Badge>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Image Display */}
              <div className="flex items-center justify-center">
                {selectedImage && (
                  <div className="relative">
                    <img
                      src={selectedImage}
                      alt="چهره تشخیص داده شده"
                      className="max-w-full max-h-96 rounded-lg shadow-lg"
                    />
                    <div className="absolute top-2 left-2 flex gap-2">
                      {selectedDetection && (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => downloadImage(selectedImage, selectedDetection)}
                          >
                            <Download className="w-4 h-4 ml-1" />
                            دانلود
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => shareImage(selectedImage, selectedDetection)}
                          >
                            <Share2 className="w-4 h-4 ml-1" />
                            اشتراک
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Detection Information */}
              <div className="space-y-4">
                {selectedDetection && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">اطلاعات تشخیص</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">دوربین:</span>
                          <span className="font-medium">{selectedDetection.camera?.name || 'ناشناخته'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">زمان:</span>
                          <span className="font-medium">
                            {new Date(selectedDetection.timestamp).toLocaleString('fa-IR')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">جهت:</span>
                          <span className="font-medium">
                            {getDirectionText(selectedDetection.direction)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">اطمینان:</span>
                          <span className="font-medium">
                            {selectedDetection.confidence ? `${Math.round(selectedDetection.confidence * 100)}%` : 'نامشخص'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {selectedDetection.metadata && (
                      <div>
                        <h3 className="font-semibold text-lg mb-2">جزئیات فنی</h3>
                        <div className="bg-gray-50 rounded-lg p-3 text-sm">
                          {(() => {
                            try {
                              const metadata = JSON.parse(selectedDetection.metadata || '{}');
                              return (
                                <div className="space-y-2">
                                  {metadata.box && (
                                    <div>
                                      <span className="font-medium">کادر محصورکننده:</span>
                                      <div className="text-xs text-gray-600 mt-1">
                                        X: {Math.round(metadata.box.x)}, Y: {Math.round(metadata.box.y)}<br />
                                        عرض: {Math.round(metadata.box.width)}, ارتفاع: {Math.round(metadata.box.height)}
                                      </div>
                                    </div>
                                  )}
                                  {metadata.keypoints && (
                                    <div>
                                      <span className="font-medium">نقاط کلیدی تشخیص داده شده:</span>
                                      <div className="text-xs text-gray-600 mt-1">
                                        {metadata.keypoints.length} نقطه چهره شناسایی شد
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            } catch {
                              return <div className="text-xs text-gray-600">فرمت متادیت نامعتبر</div>;
                            }
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}