import { db } from '@/lib/db';
import { faceDetectionService } from './faceDetection';
import { Server } from 'socket.io';

export interface CameraProcessor {
  id: string;
  name: string;
  rtspUrl: string;
  isActive: boolean;
  videoElement?: HTMLVideoElement;
  processingInterval?: NodeJS.Timeout;
  lastProcessedFrame: number;
}

export class CameraStreamingService {
  private processors: Map<string, CameraProcessor> = new Map();
  private socketServer: Server | null = null;
  private frameSkipCount = 5; // Process every 5th frame
  private currentFrameCount = 0;

  setSocketServer(server: Server) {
    this.socketServer = server;
  }

  async startCamera(cameraId: string) {
    try {
      const camera = await db.camera.findUnique({
        where: { id: cameraId },
      });

      if (!camera) {
        throw new Error('Camera not found');
      }

      if (this.processors.has(cameraId)) {
        console.log(`Camera ${cameraId} is already processing`);
        return;
      }

      const processor: CameraProcessor = {
        id: camera.id,
        name: camera.name,
        rtspUrl: camera.rtspUrl,
        isActive: camera.isActive,
        lastProcessedFrame: 0,
      };

      // Create video element for streaming
      const videoElement = document.createElement('video');
      videoElement.autoplay = true;
      videoElement.muted = true;
      videoElement.playsInline = true;

      // Set up video stream
      // Note: In a real implementation, you would use a proper RTSP to WebRTC gateway
      // For demo purposes, we'll simulate with a placeholder
      this.setupVideoStream(videoElement, camera.rtspUrl);

      processor.videoElement = videoElement;
      this.processors.set(cameraId, processor);

      // Start face detection processing
      this.startFaceDetection(cameraId);

      console.log(`Started processing camera: ${camera.name}`);
    } catch (error) {
      console.error(`Error starting camera ${cameraId}:`, error);
    }
  }

  async stopCamera(cameraId: string) {
    const processor = this.processors.get(cameraId);
    if (!processor) return;

    if (processor.processingInterval) {
      clearInterval(processor.processingInterval);
    }

    if (processor.videoElement) {
      processor.videoElement.pause();
      processor.videoElement.src = '';
    }

    this.processors.delete(cameraId);
    console.log(`Stopped processing camera: ${processor.name}`);
  }

  private setupVideoStream(videoElement: HTMLVideoElement, rtspUrl: string) {
    // In a real implementation, this would connect to an RTSP to WebRTC gateway
    // For demo purposes, we'll use a placeholder video
    videoElement.src = '/placeholder-video.mp4';
    
    videoElement.onloadedmetadata = () => {
      videoElement.play().catch(console.error);
    };

    videoElement.onerror = () => {
      console.error('Error loading video stream');
    };
  }

  private startFaceDetection(cameraId: string) {
    const processor = this.processors.get(cameraId);
    if (!processor || !processor.videoElement) return;

    processor.processingInterval = setInterval(async () => {
      if (!processor.isActive || !processor.videoElement) return;

      this.currentFrameCount++;
      
      // Skip frames to reduce processing load
      if (this.currentFrameCount % this.frameSkipCount !== 0) return;

      try {
        const faces = await faceDetectionService.detectFaces(processor.videoElement);
        
        for (const face of faces) {
          // Crop face image
          const faceImageData = await faceDetectionService.cropFace(
            processor.videoElement!,
            face.box
          );

          if (faceImageData) {
            // Save detection to database
            const detection = await db.detection.create({
              data: {
                cameraId,
                imagePath: faceImageData,
                metadata: JSON.stringify({
                  box: face.box,
                  keypoints: face.keypoints.slice(0, 10), // Save first 10 keypoints
                }),
                confidence: face.confidence,
              },
              include: {
                camera: true,
              },
            });

            // Emit via WebSocket with image data
            if (this.socketServer) {
              this.socketServer.emit('faceDetected', {
                cameraId,
                detection: {
                  ...detection,
                  metadata: JSON.parse(detection.metadata || '{}'),
                },
                imageData: faceImageData, // Send the actual image data
              });
            }
          }
        }
      } catch (error) {
        console.error('Error processing frame:', error);
      }
    }, 100); // Process every 100ms
  }

  getActiveCameras(): CameraProcessor[] {
    return Array.from(this.processors.values()).filter(p => p.isActive);
  }

  async startAllActiveCameras() {
    const cameras = await db.camera.findMany({
      where: { isActive: true },
    });

    for (const camera of cameras) {
      this.startCamera(camera.id);
    }
  }

  async stopAllCameras() {
    for (const cameraId of this.processors.keys()) {
      this.stopCamera(cameraId);
    }
  }
}

export const cameraStreamingService = new CameraStreamingService();