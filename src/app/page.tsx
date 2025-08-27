'use client';

import { useState, useEffect } from 'react';
import { CameraDashboard } from '@/components/CameraDashboard';
import { AddCameraForm } from '@/components/AddCameraForm';
import { DoorManagement, AddDoorForm, DoorList } from '@/components/DoorManagement';
import { RealTimeDetectionFeed } from '@/components/RealTimeDetectionFeed';
import { FaceDetectionDemo } from '@/components/FaceDetectionDemo';
import { Camera, Detection, Door } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera as CameraIcon, DoorOpen, Activity, LayoutDashboard, Settings, Users } from 'lucide-react';

type ViewType = 'cameras' | 'doors' | 'activity' | 'settings' | 'demo';

export default function Home() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [doors, setDoors] = useState<Door[]>([]);
  const [showAddCameraForm, setShowAddCameraForm] = useState(false);
  const [showAddDoorForm, setShowAddDoorForm] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('cameras');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCameras();
    fetchDetections();
    fetchDoors();
  }, []);

  const fetchCameras = async () => {
    try {
      const response = await fetch('/api/cameras');
      const data = await response.json();
      setCameras(data);
    } catch (error) {
      console.error('Error fetching cameras:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetections = async () => {
    try {
      const response = await fetch('/api/detections?limit=50');
      const data = await response.json();
      setDetections(data);
    } catch (error) {
      console.error('Error fetching detections:', error);
    }
  };

  const fetchDoors = async () => {
    try {
      const response = await fetch('/api/doors');
      const data = await response.json();
      setDoors(data);
    } catch (error) {
      console.error('Error fetching doors:', error);
    }
  };

  const handleAddCamera = async (camera: { 
    name: string; 
    rtspUrl: string; 
    type?: 'ENTRY' | 'EXIT' | 'BOTH';
    doorId?: string;
    location?: string;
  }) => {
    try {
      const response = await fetch('/api/cameras', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(camera),
      });

      if (response.ok) {
        await fetchCameras();
        setShowAddCameraForm(false);
      }
    } catch (error) {
      console.error('Error adding camera:', error);
    }
  };

  const handleDeleteCamera = async (cameraId: string) => {
    try {
      const response = await fetch(`/api/cameras/${cameraId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCameras();
      }
    } catch (error) {
      console.error('Error deleting camera:', error);
    }
  };

  const handleAddDoor = async (door: { name: string; location?: string; description?: string }) => {
    try {
      const response = await fetch('/api/doors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(door),
      });

      if (response.ok) {
        await fetchDoors();
        setShowAddDoorForm(false);
      }
    } catch (error) {
      console.error('Error adding door:', error);
    }
  };

  const handleDeleteDoor = async (doorId: string) => {
    try {
      const response = await fetch(`/api/doors/${doorId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchDoors();
        await fetchCameras(); // Refresh cameras to update door associations
      }
    } catch (error) {
      console.error('Error deleting door:', error);
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'cameras':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <CameraDashboard
                cameras={cameras}
                detections={detections}
                onDeleteCamera={handleDeleteCamera}
              />
            </div>
            <div className="xl:col-span-1">
              <RealTimeDetectionFeed maxItems={30} />
            </div>
          </div>
        );
      case 'doors':
        return (
          <DoorList
            doors={doors}
            onEditDoor={(doorId) => console.log('Edit door:', doorId)}
            onDeleteDoor={handleDeleteDoor}
          />
        );
      case 'activity':
        return (
          <div className="space-y-6">
            {/* System Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{cameras.length}</div>
                <div className="text-sm text-gray-600">کل دوربین‌ها</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{doors.length}</div>
                <div className="text-sm text-gray-600">کل گیت‌ها</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{detections.length}</div>
                <div className="text-sm text-gray-600">کل تشخیص‌ها</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {cameras.filter(c => c.isActive).length}
                </div>
                <div className="text-sm text-gray-600">دوربین‌های فعال</div>
              </div>
            </div>

            {/* Camera List and View */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Camera List */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CameraIcon className="w-5 h-5" />
                      لیست دوربین‌ها
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {cameras.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <CameraIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>دوربینی یافت نشد</p>
                        </div>
                      ) : (
                        cameras.map((camera) => (
                          <div 
                            key={camera.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                              selectedCamera?.id === camera.id 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200'
                            }`}
                            onClick={() => setSelectedCamera(camera)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900 truncate">
                                {camera.name}
                              </h4>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={camera.isActive ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {camera.isActive ? 'فعال' : 'غیرفعال'}
                                </Badge>
                                {camera.type && (
                                  <Badge variant="outline" className="text-xs">
                                    {camera.type === 'ENTRY' ? 'ورود' : 
                                     camera.type === 'EXIT' ? 'خروج' : 'هر دو'}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-sm text-gray-600">
                              {camera.location && <div>مکان: {camera.location}</div>}
                              <div>آخرین تشخیص: {
                                detections
                                  .filter(d => d.cameraId === camera.id)
                                  .length > 0 
                                  ? new Date(
                                      Math.max(...detections
                                        .filter(d => d.cameraId === camera.id)
                                        .map(d => new Date(d.timestamp).getTime())
                                      )
                                    ).toLocaleTimeString('fa-IR')
                                  : 'هیچ'
                              }</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Camera View and Detection Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Single Camera View */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CameraIcon className="w-5 h-5" />
                        نمای دوربین
                      </div>
                      {selectedCamera && (
                        <Badge variant={selectedCamera.isActive ? "default" : "secondary"}>
                          {selectedCamera.isActive ? 'فعال' : 'غیرفعال'}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedCamera ? (
                      <div className="space-y-4">
                        <div className="bg-gray-100 rounded-lg p-4 text-center">
                          <div className="text-gray-500 mb-2">
                            <CameraIcon className="w-16 h-16 mx-auto" />
                          </div>
                          <p className="text-sm text-gray-600">
                            نمای زنده دوربین {selectedCamera.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {selectedCamera.rtspUrl}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">نوع:</span>
                            <span className="font-medium mr-2">
                              {selectedCamera.type === 'ENTRY' ? 'ورود' : 
                               selectedCamera.type === 'EXIT' ? 'خروج' : 'هر دو'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">مکان:</span>
                            <span className="font-medium mr-2">
                              {selectedCamera.location || 'نامشخص'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">گیت مرتبط:</span>
                            <span className="font-medium mr-2">
                              {selectedCamera.door?.name || 'هیچ'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">وضعیت:</span>
                            <span className="font-medium mr-2">
                              {selectedCamera.isActive ? 'فعال' : 'غیرفعال'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <CameraIcon className="w-16 h-16 mx-auto mb-2 opacity-50" />
                        <p>لطفاً یک دوربین را از لیست انتخاب کنید</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Personal Information Panel */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      اطلاعات شخصی تشخیص داده شده
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedCamera && latestDetection ? (
                      <div className="space-y-4">
                        {/* Detection Image */}
                        {latestDetection.imagePath && (
                          <div className="flex justify-center">
                            <div className="w-32 h-32 bg-gray-200 rounded-lg overflow-hidden">
                              <img
                                src={latestDetection.imagePath}
                                alt="چهره تشخیص داده شده"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Detection Details */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">زمان تشخیص:</span>
                            <span className="font-medium mr-2 block">
                              {new Date(latestDetection.timestamp).toLocaleString('fa-IR')}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">اطمینان:</span>
                            <span className="font-medium mr-2 block">
                              {latestDetection.confidence 
                                ? `${Math.round(latestDetection.confidence * 100)}%` 
                                : 'نامشخص'
                              }
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">جهت:</span>
                            <span className="font-medium mr-2 block">
                              {latestDetection.direction === 'ENTRY' ? 'ورود' : 
                               latestDetection.direction === 'EXIT' ? 'خروج' : 'ناشناخته'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">دوربین:</span>
                            <span className="font-medium mr-2 block">
                              {latestDetection.camera?.name}
                            </span>
                          </div>
                        </div>

                        {/* Simulated Personal Info */}
                        <div className="border-t pt-4">
                          <h4 className="font-medium text-gray-900 mb-3">اطلاعات شبیه‌سازی شده</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">نام:</span>
                              <span className="font-medium mr-2">کاربر مهمان</span>
                            </div>
                            <div>
                              <span className="text-gray-600">دسترسی:</span>
                              <span className="font-medium mr-2">
                                {latestDetection.direction === 'ENTRY' ? 'مجاز' : 'در حال بررسی'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">اولین حضور:</span>
                              <span className="font-medium mr-2">
                                {new Date(latestDetection.timestamp).toLocaleDateString('fa-IR')}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">وضعیت:</span>
                              <span className="font-medium mr-2 text-green-600">شناخته شده</span>
                            </div>
                          </div>
                        </div>

                        {/* Technical Details */}
                        {latestDetection.metadata && (
                          <details className="text-sm">
                            <summary className="cursor-pointer text-gray-600 hover:text-gray-900">
                              جزئیات فنی
                            </summary>
                            <div className="mt-2 p-3 bg-gray-50 rounded text-xs">
                              {(() => {
                                try {
                                  const metadata = JSON.parse(latestDetection.metadata || '{}');
                                  return (
                                    <div className="space-y-1">
                                      {metadata.box && (
                                        <div>
                                          <span className="font-medium">موقعیت:</span>{' '}
                                          X: {Math.round(metadata.box.x)}, Y: {Math.round(metadata.box.y)},{' '}
                                          W: {Math.round(metadata.box.width)}, H: {Math.round(metadata.box.height)}
                                        </div>
                                      )}
                                      {metadata.keypoints && (
                                        <div>
                                          <span className="font-medium">نقاط کلیدی:</span>{' '}
                                          {metadata.keypoints.length} نقطه تشخیص داده شد
                                        </div>
                                      )}
                                    </div>
                                  );
                                } catch {
                                  return <div>متادیت نامعتبر</div>;
                                }
                              })()}
                            </div>
                          </details>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <User className="w-16 h-16 mx-auto mb-2 opacity-50" />
                        <p>
                          {selectedCamera 
                            ? 'هیچ تشخیصی برای این دوربین یافت نشد'
                            : 'لطفاً یک دوربین را برای مشاهده اطلاعات تشخیص انتخاب کنید'
                          }
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Real-time Detection Feed */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  تشخیص‌های زنده
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RealTimeDetectionFeed maxItems={10} />
              </CardContent>
            </Card>
          </div>
        );
      case 'settings':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>تنظیمات سیستم</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">تشخیص چهره</h4>
                        <p className="text-sm text-gray-600">پیکربندی پارامترهای تشخیص</p>
                      </div>
                      <Button variant="outline" size="sm">
                        پیکربندی
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">تنظیمات اعلان‌ها</h4>
                        <p className="text-sm text-gray-600">مدیریت هشدارها و اعلان‌ها</p>
                      </div>
                      <Button variant="outline" size="sm">
                        پیکربندی
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">حفظ داده‌ها</h4>
                        <p className="text-sm text-gray-600">تنظیم سیاست‌های حفظ داده‌ها</p>
                      </div>
                      <Button variant="outline" size="sm">
                        پیکربندی
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>اطلاعات سیستم</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">نسخه</span>
                      <span className="font-medium">1.0.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">آخرین به‌روزرسانی</span>
                      <span className="font-medium">{new Date().toLocaleDateString('fa-IR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">پایگاه داده</span>
                      <span className="font-medium">SQLite</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">وضعیت</span>
                      <Badge variant="default">عملیاتی</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'demo':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <FaceDetectionDemo />
            </div>
            <div>
              <RealTimeDetectionFeed maxItems={20} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const MenuItem = ({ 
    view, 
    icon: Icon, 
    label, 
    count, 
    badgeVariant = "secondary" 
  }: {
    view: ViewType;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    count?: number;
    badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  }) => (
    <Button
      variant={currentView === view ? "default" : "ghost"}
      onClick={() => setCurrentView(view)}
      className="w-full justify-start h-12 px-4 rounded-lg transition-all duration-200"
    >
      <Icon className="w-5 h-5 ml-3" />
      <span className="flex-1 text-right">{label}</span>
      {count !== undefined && (
        <Badge variant={badgeVariant} className="mr-2">
          {count}
        </Badge>
      )}
    </Button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Vertical Sidebar Menu */}
        <div className="w-64 bg-white shadow-lg border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <CameraIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">تشخیص چهره</h1>
                <p className="text-sm text-gray-600">سیستم امنیتی</p>
              </div>
            </div>

            <nav className="space-y-2">
              <MenuItem
                view="activity"
                icon={LayoutDashboard}
                label="داشبورد"
              />
              <MenuItem
                view="cameras"
                icon={CameraIcon}
                label="دوربین"
                count={cameras.length}
                badgeVariant="default"
              />
              <MenuItem
                view="doors"
                icon={DoorOpen}
                label="گیت"
                count={doors.length}
              />
              <MenuItem
                view="settings"
                icon={Settings}
                label="تنظیمات"
              />
              <MenuItem
                view="demo"
                icon={Users}
                label="دمو"
                badgeVariant="outline"
              />
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {currentView === 'activity' && 'داشبورد'}
                  {currentView === 'cameras' && 'مدیریت دوربین'}
                  {currentView === 'doors' && 'مدیریت گیت'}
                  {currentView === 'settings' && 'تنظیمات سیستم'}
                  {currentView === 'demo' && 'دموی تشخیص چهره'}
                </h1>
                <p className="text-gray-600 mt-2">
                  {currentView === 'activity' && 'نمای کلی سیستم، لیست دوربین‌ها و اطلاعات تشخیص چهره'}
                  {currentView === 'cameras' && 'مدیریت دوربین و مشاهده تشخیص‌های زنده'}
                  {currentView === 'doors' && 'سازماندهی گیت‌ها و دوربین‌های مرتبط'}
                  {currentView === 'settings' && 'پیکربندی تنظیمات و ترجیحات سیستم'}
                  {currentView === 'demo' && 'آزمایش تشخیص چهره زنده با داده‌های شبیه‌سازی شده'}
                </p>
              </div>
              {/* Add buttons based on current view */}
              {(currentView === 'cameras' || currentView === 'doors') && (
                <Button
                  onClick={() => currentView === 'cameras' ? setShowAddCameraForm(true) : setShowAddDoorForm(true)}
                  className="flex items-center gap-2"
                >
                  {currentView === 'cameras' ? (
                    <>
                      <CameraIcon className="w-4 h-4" />
                      افزودن دوربین
                    </>
                  ) : (
                    <>
                      <DoorOpen className="w-4 h-4" />
                      افزودن گیت
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Forms */}
          {showAddCameraForm && (
            <AddCameraForm
              onSubmit={handleAddCamera}
              onCancel={() => setShowAddCameraForm(false)}
              doors={doors}
            />
          )}

          {showAddDoorForm && (
            <AddDoorForm
              onSubmit={handleAddDoor}
              onCancel={() => setShowAddDoorForm(false)}
            />
          )}

          {/* Current View Content */}
          <div className="space-y-6">
            {renderCurrentView()}
          </div>
        </div>
      </div>
    </div>
  );
}