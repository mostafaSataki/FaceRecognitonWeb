export interface Camera {
  id: string;
  name: string;
  rtspUrl: string;
  isActive: boolean;
  type: 'ENTRY' | 'EXIT' | 'BOTH';
  doorId?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
  detections?: Detection[];
  door?: Door;
}

export interface Door {
  id: string;
  name: string;
  location?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  cameras?: Camera[];
}

export interface Detection {
  id: string;
  cameraId: string;
  timestamp: string;
  imagePath?: string;
  metadata?: string;
  confidence?: number;
  direction?: 'ENTRY' | 'EXIT' | 'UNKNOWN';
  camera?: Camera;
}

export interface FaceDetection {
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  keypoints: Array<{
    x: number;
    y: number;
    name?: string;
  }>;
  confidence: number;
}

export interface CameraProcessor {
  id: string;
  name: string;
  rtspUrl: string;
  isActive: boolean;
  lastProcessedFrame: number;
}