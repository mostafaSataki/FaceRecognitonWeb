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
  personId?: string;
  camera?: Camera;
  person?: Person;
}

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  nationalCode?: string;
  employeeId?: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
  avatarPath?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  faceEnrollments?: FaceEnrollment[];
  detections?: Detection[];
  attendanceLogs?: AttendanceLog[];
}

export interface FaceEnrollment {
  id: string;
  personId: string;
  faceData: string;
  imagePath: string;
  confidence: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  person?: Person;
}

export interface AttendanceLog {
  id: string;
  personId: string;
  cameraId: string;
  doorId?: string;
  timestamp: string;
  type: 'ENTRY' | 'EXIT';
  confidence?: number;
  imagePath?: string;
  metadata?: string;
  person?: Person;
  camera?: Camera;
  door?: Door;
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