import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';

export class FaceDetectionService {
  private model: faceLandmarksDetection.FaceLandmarksDetector | null = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      await tf.setBackend('webgl');
      await tf.ready();
      
      this.model = await faceLandmarksDetection.createDetector(
        faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
        {
          runtime: 'tfjs',
          refineLandmarks: true,
          maxFaces: 10,
        }
      );
      
      this.isInitialized = true;
      console.log('Face detection model initialized successfully');
    } catch (error) {
      console.error('Failed to initialize face detection model:', error);
      throw error;
    }
  }

  async detectFaces(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement) {
    if (!this.isInitialized || !this.model) {
      await this.initialize();
    }

    try {
      if (!this.model) {
        await this.initialize();
      }
      const faces = await this.model!.estimateFaces(imageElement);
      
      const processedFaces = faces.map(face => {
        const box = face.box;
        const keypoints = face.keypoints;
        
        // Calculate face bounding box
        const minX = Math.min(...keypoints.map(p => p.x));
        const maxX = Math.max(...keypoints.map(p => p.x));
        const minY = Math.min(...keypoints.map(p => p.y));
        const maxY = Math.max(...keypoints.map(p => p.y));
        
        return {
          box: {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
          },
          keypoints,
          confidence: 0.9, // MediaPipe doesn't provide confidence scores
        };
      });

      return processedFaces;
    } catch (error) {
      console.error('Face detection error:', error);
      return [];
    }
  }

  async cropFace(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement, faceBox: any) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;

    canvas.width = faceBox.width;
    canvas.height = faceBox.height;

    ctx.drawImage(
      imageElement,
      faceBox.x, faceBox.y, faceBox.width, faceBox.height,
      0, 0, faceBox.width, faceBox.height
    );

    return canvas.toDataURL('image/jpeg', 0.8);
  }

  dispose() {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    tf.disposeVariables();
    this.isInitialized = false;
  }
}

export const faceDetectionService = new FaceDetectionService();