'use client';

import { useState, useRef } from 'react';
import { Person } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, CheckCircle, AlertCircle, Fingerprint } from 'lucide-react';

interface FaceEnrollmentFormProps {
  person: Person;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function FaceEnrollmentForm({ person, onSubmit, onCancel }: FaceEnrollmentFormProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState<'idle' | 'capturing' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [confidence, setConfidence] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setEnrollmentStatus('capturing');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setErrorMessage('دسترسی به دوربین ممکن نیست');
      setEnrollmentStatus('error');
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageDataUrl);
      
      // Stop camera
      const stream = video.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      
      setEnrollmentStatus('processing');
      processFaceEnrollment(imageDataUrl);
    }
  };

  const processFaceEnrollment = async (imageDataUrl: string) => {
    setIsProcessing(true);
    
    try {
      // Simulate face detection and enrollment
      // In a real implementation, this would call the face recognition backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate confidence score
      const simulatedConfidence = 0.85 + Math.random() * 0.15; // 85-100%
      setConfidence(simulatedConfidence);
      
      if (simulatedConfidence > 0.8) {
        setEnrollmentStatus('success');
        
        // Convert data URL to base64
        const base64Data = imageDataUrl.split(',')[1];
        
        // Prepare enrollment data
        const enrollmentData = {
          personId: person.id,
          faceData: JSON.stringify({
            embeddings: Array.from({ length: 128 }, () => Math.random()),
            descriptor: 'simulated_face_descriptor'
          }),
          imagePath: `/uploads/face_enrollments/${person.id}_${Date.now()}.jpg`,
          confidence: simulatedConfidence,
        };
        
        // Submit enrollment
        await onSubmit(enrollmentData);
      } else {
        setErrorMessage('کیفیت تصویر برای انرولمنت کافی نیست');
        setEnrollmentStatus('error');
      }
    } catch (error) {
      console.error('Error processing face enrollment:', error);
      setErrorMessage('خطا در پردازش چهره');
      setEnrollmentStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        setCapturedImage(imageDataUrl);
        setEnrollmentStatus('processing');
        processFaceEnrollment(imageDataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setCapturedImage(null);
    setEnrollmentStatus('idle');
    setErrorMessage('');
    setConfidence(0);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Person Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
              <Fingerprint className="w-10 h-10 text-gray-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {person.firstName} {person.lastName}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {person.employeeId && (
                  <div>
                    <span className="text-gray-600">کد پرسنلی:</span>
                    <span className="font-medium mr-2">{person.employeeId}</span>
                  </div>
                )}
                {person.department && (
                  <div>
                    <span className="text-gray-600">دپارتمان:</span>
                    <span className="font-medium mr-2">{person.department}</span>
                  </div>
                )}
                {person.position && (
                  <div>
                    <span className="text-gray-600">سمت:</span>
                    <span className="font-medium mr-2">{person.position}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-blue-50">
        <CardContent className="p-6">
          <h4 className="font-medium text-blue-900 mb-4 text-lg">دستورالعمل انرولمنت چهره</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-blue-800 mb-2">شرایط لازم:</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• صورت خود را مستقیم به دوربین نگه دارید</li>
                <li>• نور محیط کافی و مناسب باشد</li>
                <li>• از عینک، ماسک یا کلاه استفاده نکنید</li>
                <li>• چهره باید کاملاً واضح و بدون سایه باشد</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-blue-800 mb-2">فاصله و زاویه:</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• فاصله مناسب از دوربین (50-100 سانتی‌متر)</li>
                <li>• چهره کاملاً در کادر دوربین قرار گیرد</li>
                <li>• زاویه دوربین عمود بر صورت باشد</li>
                <li>• از حرکت‌های سریع خودداری کنید</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content - Wide Horizontal Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Camera/Capture Area */}
        <div className="lg:col-span-2">
          {enrollmentStatus === 'idle' && (
            <Card>
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="w-40 h-40 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
                    <Camera className="w-20 h-20 text-gray-400" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">شروع انرولمنت چهره</h3>
                    <p className="text-gray-600">می‌توانید از دوربین استفاده کنید یا تصویری آپلود نمایید</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button onClick={startCamera} className="flex items-center gap-2 px-6 py-3">
                        <Camera className="w-5 h-5" />
                        استفاده از دوربین
                      </Button>
                      <div className="relative">
                        <Label htmlFor="file-upload" className="cursor-pointer">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg px-6 py-3 hover:border-gray-400 transition-colors flex items-center gap-2">
                            <Upload className="w-5 h-5" />
                            آپلود تصویر
                          </div>
                        </Label>
                        <input
                          id="file-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {enrollmentStatus === 'capturing' && (
            <Card>
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">دوربین فعال است</h3>
                  <div className="relative inline-block">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full max-w-2xl rounded-lg border-2 border-gray-300 shadow-lg"
                    />
                    <div className="absolute inset-0 border-4 border-blue-500 border-dashed rounded-lg m-4 pointer-events-none"></div>
                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                      چهره را در کادر قرار دهید
                    </div>
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="flex gap-3 justify-center">
                    <Button onClick={captureImage} className="flex items-center gap-2 px-6 py-3">
                      <Camera className="w-5 h-5" />
                      ثبت تصویر
                    </Button>
                    <Button variant="outline" onClick={resetForm} className="px-6 py-3">
                      انصراف
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {enrollmentStatus === 'processing' && (
            <Card>
              <CardContent className="p-12">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">در حال پردازش چهره</h3>
                    <p className="text-gray-600">لطفاً چند لحظه صبر کنید...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {enrollmentStatus === 'success' && capturedImage && (
            <Card className="bg-green-50">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-green-900 mb-2">انرولمنت با موفقیت انجام شد</h3>
                    <p className="text-green-700 text-lg">
                      دقت تشخیص: {(confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <img
                      src={capturedImage}
                      alt="Enrolled face"
                      className="w-48 h-48 rounded-lg object-cover border-4 border-green-300 shadow-lg"
                    />
                  </div>
                  <Button onClick={onCancel} className="flex items-center gap-2 px-6 py-3">
                    <CheckCircle className="w-5 h-5" />
                    تکمیل و بستن
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {enrollmentStatus === 'error' && (
            <Card className="bg-red-50">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="w-10 h-10 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-red-900 mb-2">خطا در انرولمنت</h3>
                    <p className="text-red-700">{errorMessage}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={resetForm} className="flex items-center gap-2 px-6 py-3">
                      تلاش مجدد
                    </Button>
                    <Button variant="outline" onClick={onCancel} className="px-6 py-3">
                      انصراف
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Side - Status and Preview */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardContent className="p-6">
              <h4 className="font-medium text-gray-900 mb-4 text-lg">وضعیت انرولمنت</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">وضعیت:</span>
                  <Badge variant={
                    enrollmentStatus === 'success' ? 'default' :
                    enrollmentStatus === 'processing' ? 'secondary' :
                    enrollmentStatus === 'error' ? 'destructive' : 'outline'
                  } className="text-sm px-3 py-1">
                    {enrollmentStatus === 'idle' && 'آماده'}
                    {enrollmentStatus === 'capturing' && 'در حال ضبط'}
                    {enrollmentStatus === 'processing' && 'در حال پردازش'}
                    {enrollmentStatus === 'success' && 'موفق'}
                    {enrollmentStatus === 'error' && 'خطا'}
                  </Badge>
                </div>
                
                {confidence > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">دقت تشخیص:</span>
                    <span className="text-sm font-medium">{(confidence * 100).toFixed(1)}%</span>
                  </div>
                )}

                {capturedImage && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">تصویر:</span>
                    <span className="text-sm font-medium text-green-600">ثبت شد</span>
                  </div>
                )}

                {enrollmentStatus === 'processing' && (
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-xs text-gray-600">در حال تحلیل چهره...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preview Card */}
          {capturedImage && (
            <Card>
              <CardContent className="p-6">
                <h4 className="font-medium text-gray-900 mb-4 text-lg">پیش‌نمایش تصویر</h4>
                <div className="flex justify-center">
                  <img
                    src={capturedImage}
                    alt="Captured face"
                    className="w-full h-64 object-cover rounded-lg border shadow-md"
                  />
                </div>
                {confidence > 0 && (
                  <div className="mt-4 text-center">
                    <Badge variant="outline" className="text-sm">
                      دقت: {(confidence * 100).toFixed(1)}%
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {enrollmentStatus === 'success' && (
              <Button onClick={onCancel} className="w-full flex items-center gap-2 py-3">
                <CheckCircle className="w-5 h-5" />
                تکمیل و بستن
              </Button>
            )}
            
            {(enrollmentStatus === 'idle' || enrollmentStatus === 'error') && (
              <Button variant="outline" onClick={onCancel} className="w-full py-3">
                انصراف
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}