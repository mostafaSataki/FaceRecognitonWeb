'use client';

import { Detection } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, Clock } from 'lucide-react';

interface DetectionFeedProps {
  detections: Detection[];
}

export function DetectionFeed({ detections }: DetectionFeedProps) {
  if (detections.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No detections yet</h3>
        <p className="text-gray-600">Start a camera to begin face detection</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-96">
      <div className="space-y-3">
        {detections.map((detection) => (
          <Card key={detection.id} className="p-3">
            <div className="flex items-start gap-3">
              {/* Face Image */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gray-200 rounded-lg border overflow-hidden">
                  {detection.imagePath ? (
                    <img
                      src={detection.imagePath}
                      alt="Detected face"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Detection Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900 truncate">
                    {detection.camera?.name || 'Unknown Camera'}
                  </h4>
                  {detection.confidence && (
                    <Badge variant="outline" className="text-xs">
                      {Math.round(detection.confidence * 100)}%
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="w-3 h-3" />
                  <span>
                    {new Date(detection.timestamp).toLocaleString()}
                  </span>
                </div>

                {/* Detection Metadata */}
                {detection.metadata && (
                  <div className="mt-2">
                    <details className="text-sm">
                      <summary className="cursor-pointer text-gray-600 hover:text-gray-900">
                        View details
                      </summary>
                      <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                        {JSON.stringify(JSON.parse(detection.metadata), null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}