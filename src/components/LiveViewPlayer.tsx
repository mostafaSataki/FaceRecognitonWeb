'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Maximize2, Minimize2, Volume2, VolumeX } from 'lucide-react';

interface LiveViewPlayerProps {
  cameraId: string;
  camera?: Camera;
  onClose: () => void;
}

export function LiveViewPlayer({ cameraId, camera, onClose }: LiveViewPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    
    // In a real implementation, this would connect to a WebRTC stream
    // For demo purposes, we'll use a placeholder
    const setupVideoStream = async () => {
      try {
        setIsConnected(true);
        
        // Simulate video stream with a placeholder
        // In production, this would use WebRTC to connect to the media server
        video.src = '/placeholder-video.mp4';
        video.muted = isMuted;
        video.autoplay = true;
        video.playsInline = true;
        
        await video.play();
      } catch (err) {
        console.error('Error setting up video stream:', err);
        setError('Failed to connect to video stream');
        setIsConnected(false);
      }
    };

    setupVideoStream();

    return () => {
      if (video.src) {
        video.src = '';
      }
    };
  }, [cameraId, isMuted]);

  const toggleFullscreen = () => {
    if (!videoRef.current) return;

    if (!isFullscreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement);
  };

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Camera Info */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{camera?.name || 'Camera'}</h3>
          <p className="text-sm text-gray-600">{camera?.rtspUrl}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
      </div>

      {/* Video Player */}
      <Card>
        <CardContent className="p-0">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-auto max-h-[600px]"
              controls={false}
              playsInline
            />
            
            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="text-white hover:text-white hover:bg-white/20"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="text-white hover:text-white hover:bg-white/20"
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* Error Overlay */}
            {error && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                <div className="text-center text-white">
                  <p className="text-lg font-medium mb-2">Connection Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Loading Overlay */}
            {!isConnected && !error && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stream Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-gray-600">Resolution</p>
          <p className="font-medium">1920x1080</p>
        </div>
        <div>
          <p className="text-gray-600">FPS</p>
          <p className="font-medium">30</p>
        </div>
        <div>
          <p className="text-gray-600">Bitrate</p>
          <p className="font-medium">4000 Kbps</p>
        </div>
        <div>
          <p className="text-gray-600">Codec</p>
          <p className="font-medium">H.264</p>
        </div>
      </div>
    </div>
  );
}