'use client';

import { useState, useEffect } from 'react';
import { Camera, Detection } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CameraGrid } from './CameraGrid';
import { DetectionFeed } from './DetectionFeed';
import { LiveViewPlayer } from './LiveViewPlayer';
import { Play, Square, Trash2, Eye, Camera as CameraIcon } from 'lucide-react';

interface CameraDashboardProps {
  cameras: Camera[];
  detections: Detection[];
  onDeleteCamera: (cameraId: string) => void;
}

export function CameraDashboard({ cameras, detections, onDeleteCamera }: CameraDashboardProps) {
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [liveViewCamera, setLiveViewCamera] = useState<string | null>(null);
  const [activeCameras, setActiveCameras] = useState<string[]>([]);

  useEffect(() => {
    // Initialize active cameras from the cameras list
    const active = cameras.filter(camera => camera.isActive).map(camera => camera.id);
    setActiveCameras(active);
  }, [cameras]);

  const handleStartCamera = (cameraId: string) => {
    setActiveCameras(prev => [...prev, cameraId]);
  };

  const handleStopCamera = (cameraId: string) => {
    setActiveCameras(prev => prev.filter(id => id !== cameraId));
  };

  const handleViewLive = (cameraId: string) => {
    setLiveViewCamera(cameraId);
  };

  const handleCloseLiveView = () => {
    setLiveViewCamera(null);
  };

  return (
    <div className="space-y-6">
      {/* Live View Modal */}
      {liveViewCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-4xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Live View</h3>
              <Button variant="outline" onClick={handleCloseLiveView}>
                Close
              </Button>
            </div>
            <LiveViewPlayer
              cameraId={liveViewCamera}
              camera={cameras.find(c => c.id === liveViewCamera)}
              onClose={handleCloseLiveView}
            />
          </div>
        </div>
      )}

      {/* Camera Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CameraIcon className="w-5 h-5" />
            Cameras ({cameras.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CameraGrid
            cameras={cameras}
            activeCameras={activeCameras}
            onStartCamera={handleStartCamera}
            onStopCamera={handleStopCamera}
            onViewLive={handleViewLive}
            onDeleteCamera={onDeleteCamera}
          />
        </CardContent>
      </Card>

      {/* Detection Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Recent Detections ({detections.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DetectionFeed detections={detections} />
        </CardContent>
      </Card>
    </div>
  );
}