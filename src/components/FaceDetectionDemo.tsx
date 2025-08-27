'use client';

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, User, Activity, Send, Play, Pause } from 'lucide-react';

interface FaceDetectionDemoProps {
  onDetection?: (detection: any) => void;
}

export function FaceDetectionDemo({ onDetection }: FaceDetectionDemoProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [testCameraId, setTestCameraId] = useState('demo-camera-1');
  const [testCameraName, setTestCameraName] = useState('دوربین دمو 1');
  const [detectionCount, setDetectionCount] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationInterval, setSimulationInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize WebSocket connection
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Demo connected to WebSocket server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Demo disconnected from WebSocket server');
    });

    // Listen for face detections
    newSocket.on('faceDetected', (data: any) => {
      setDetectionCount(prev => prev + 1);
      if (onDetection) {
        onDetection(data);
      }
    });

    return () => {
      newSocket.close();
      if (simulationInterval) {
        clearInterval(simulationInterval);
      }
    };
  }, []);

  const simulateFaceDetection = () => {
    if (!socket || !isConnected) return;

    // Generate a fake face detection with image
    const fakeDetection = {
      id: `demo-detection-${Date.now()}`,
      cameraId: testCameraId,
      timestamp: new Date().toISOString(),
      confidence: 0.85 + Math.random() * 0.15, // 85-100% confidence
      direction: Math.random() > 0.5 ? 'ENTRY' : 'EXIT',
      metadata: JSON.stringify({
        box: {
          x: Math.floor(Math.random() * 200),
          y: Math.floor(Math.random() * 200),
          width: 80 + Math.floor(Math.random() * 40),
          height: 100 + Math.floor(Math.random() * 40)
        },
        keypoints: Array.from({ length: 468 }, (_, i) => ({
          x: Math.random() * 300,
          y: Math.random() * 300,
          name: `keypoint_${i}`
        }))
      })
    };

    // Generate a fake face image (simple colored rectangle with face-like features)
    const canvas = document.createElement('canvas');
    canvas.width = 120;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Face background
      ctx.fillStyle = `hsl(${Math.random() * 60 + 20}, 70%, 80%)`;
      ctx.fillRect(0, 0, 120, 150);
      
      // Eyes
      ctx.fillStyle = '#333';
      ctx.fillRect(25, 40, 15, 15);
      ctx.fillRect(80, 40, 15, 15);
      
      // Nose
      ctx.fillStyle = '#666';
      ctx.fillRect(55, 65, 10, 20);
      
      // Mouth
      ctx.fillStyle = '#333';
      ctx.fillRect(45, 95, 30, 8);
      
      // Add some noise to make it look more realistic
      for (let i = 0; i < 50; i++) {
        ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.1)`;
        ctx.fillRect(Math.random() * 120, Math.random() * 150, 2, 2);
      }
    }

    const imageData = canvas.toDataURL('image/jpeg', 0.8);

    // Emit the fake detection
    socket.emit('faceDetected', {
      cameraId: testCameraId,
      detection: fakeDetection,
      imageData
    });

    console.log('Simulated face detection:', fakeDetection);
  };

  const startSimulation = () => {
    if (isSimulating) return;
    
    setIsSimulating(true);
    const interval = setInterval(() => {
      simulateFaceDetection();
    }, 2000 + Math.random() * 3000); // Random interval between 2-5 seconds
    
    setSimulationInterval(interval);
  };

  const stopSimulation = () => {
    if (!isSimulating || !simulationInterval) return;
    
    clearInterval(simulationInterval);
    setSimulationInterval(null);
    setIsSimulating(false);
  };

  const sendSingleDetection = () => {
    simulateFaceDetection();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          دمو تشخیص چهره
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? 'متصل' : 'قطع'}
          </Badge>
          <Badge variant="outline">
            تشخیص‌ها: {detectionCount}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cameraId">شناسه دوربین</Label>
          <Input
            id="cameraId"
            value={testCameraId}
            onChange={(e) => setTestCameraId(e.target.value)}
            placeholder="شناسه دوربین را وارد کنید"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cameraName">نام دوربین</Label>
          <Input
            id="cameraName"
            value={testCameraName}
            onChange={(e) => setTestCameraName(e.target.value)}
            placeholder="نام دوربین را وارد کنید"
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={sendSingleDetection}
            disabled={!isConnected}
            className="flex-1"
          >
            <Send className="w-4 h-4 ml-2" />
            ارسال تشخیص
          </Button>
          
          {isSimulating ? (
            <Button
              onClick={stopSimulation}
              variant="destructive"
              disabled={!isConnected}
            >
              <Pause className="w-4 h-4 ml-2" />
              توقف
            </Button>
          ) : (
            <Button
              onClick={startSimulation}
              variant="outline"
              disabled={!isConnected}
            >
              <Play className="w-4 h-4 ml-2" />
              خودکار
            </Button>
          )}
        </div>

        {isSimulating && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <Activity className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-medium">در حال شبیه‌سازی تشخیص‌ها...</span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              تشخیص‌های تصادفی چهره هر 2-5 ثانیه ارسال می‌شوند
            </p>
          </div>
        )}

        <div className="text-xs text-gray-600 space-y-1">
          <p>• این دمو رویدادهای تشخیص چهره را شبیه‌سازی می‌کند</p>
          <p>• تصاویر تولید شده شامل داده‌های چهره جعلی هستند</p>
          <p>• تمام تشخیص‌ها از طریق WebSocket ارسال می‌شوند</p>
          <p>• فید زنده را در پنل اصلی مشاهده کنید</p>
        </div>
      </CardContent>
    </Card>
  );
}