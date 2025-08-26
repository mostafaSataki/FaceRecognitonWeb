'use client';

import { Camera } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Play, Square, Trash2, Eye, Video, VideoOff, MapPin, DoorOpen, Edit } from 'lucide-react';

interface CameraGridProps {
  cameras: Camera[];
  activeCameras: string[];
  onStartCamera: (cameraId: string) => void;
  onStopCamera: (cameraId: string) => void;
  onViewLive: (cameraId: string) => void;
  onDeleteCamera: (cameraId: string) => void;
  onEditCamera: (camera: Camera) => void;
  onToggleCamera: (cameraId: string, isActive: boolean) => void;
}

export function CameraGrid({
  cameras,
  activeCameras,
  onStartCamera,
  onStopCamera,
  onViewLive,
  onDeleteCamera,
  onEditCamera,
  onToggleCamera,
}: CameraGridProps) {
  if (cameras.length === 0) {
    return (
      <div className="text-center py-12">
        <VideoOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No cameras configured</h3>
        <p className="text-gray-600">Add your first camera to start face detection</p>
      </div>
    );
  }

  const getCameraTypeColor = (type: string) => {
    switch (type) {
      case 'ENTRY':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'EXIT':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'BOTH':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cameras.map((camera) => {
        const isActive = activeCameras.includes(camera.id);
        const recentDetections = camera.detections?.length || 0;

        return (
          <Card key={camera.id} className="relative">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900">{camera.name}</h3>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getCameraTypeColor(camera.type)}`}
                    >
                      {camera.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 truncate max-w-xs">
                    {camera.rtspUrl}
                  </p>
                  {camera.location && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <MapPin className="w-3 h-3" />
                      {camera.location}
                    </div>
                  )}
                  {camera.door && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <DoorOpen className="w-3 h-3" />
                      {camera.door.name}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={camera.isActive}
                      onCheckedChange={(checked) => onToggleCamera(camera.id, checked)}
                      size="sm"
                    />
                    <Badge variant={camera.isActive ? "default" : "secondary"}>
                      {camera.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  {recentDetections > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {recentDetections} detections
                    </Badge>
                  )}
                </div>
              </div>

              {/* Camera Preview Placeholder */}
              <div className="bg-gray-100 rounded-lg h-32 mb-3 flex items-center justify-center">
                <Video className="w-8 h-8 text-gray-400" />
              </div>

              {/* Camera Controls */}
              <div className="flex gap-2">
                {isActive ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStopCamera(camera.id)}
                    className="flex-1"
                  >
                    <Square className="w-4 h-4 mr-1" />
                    Stop
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStartCamera(camera.id)}
                    className="flex-1"
                    disabled={!camera.isActive}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Start
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewLive(camera.id)}
                  disabled={!isActive || !camera.isActive}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditCamera(camera)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDeleteCamera(camera.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Recent Detection Preview */}
              {camera.detections && camera.detections.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-gray-600 mb-2">Recent detections:</p>
                  <div className="flex gap-1">
                    {camera.detections.slice(0, 3).map((detection) => (
                      <div
                        key={detection.id}
                        className="w-8 h-8 bg-gray-200 rounded border"
                        title={`Detected at ${new Date(detection.timestamp).toLocaleString()}`}
                      >
                        {detection.imagePath && (
                          <img
                            src={detection.imagePath}
                            alt="Face detection"
                            className="w-full h-full object-cover rounded"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}