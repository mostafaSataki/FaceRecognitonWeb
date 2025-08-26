'use client';

import { useState, useEffect } from 'react';
import { CameraDashboard } from '@/components/CameraDashboard';
import { AddCameraForm } from '@/components/AddCameraForm';
import { DoorManagement, AddDoorForm, DoorList } from '@/components/DoorManagement';
import { RealTimeDetectionFeed } from '@/components/RealTimeDetectionFeed';
import { Camera, Detection, Door } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera as CameraIcon, DoorOpen, Activity, LayoutDashboard, Settings, Users } from 'lucide-react';

type ViewType = 'cameras' | 'doors' | 'activity' | 'settings';

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <RealTimeDetectionFeed maxItems={50} />
            </div>
            <div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">System Overview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{cameras.length}</div>
                    <div className="text-sm text-gray-600">Total Cameras</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{doors.length}</div>
                    <div className="text-sm text-gray-600">Total Doors</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{detections.length}</div>
                    <div className="text-sm text-gray-600">Total Detections</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {cameras.filter(c => c.isActive).length}
                    </div>
                    <div className="text-sm text-gray-600">Active Cameras</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">Face Detection</h4>
                        <p className="text-sm text-gray-600">Configure detection parameters</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">Notification Settings</h4>
                        <p className="text-sm text-gray-600">Manage alerts and notifications</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">Data Retention</h4>
                        <p className="text-sm text-gray-600">Set data retention policies</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Version</span>
                      <span className="font-medium">1.0.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Updated</span>
                      <span className="font-medium">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Database</span>
                      <span className="font-medium">SQLite</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status</span>
                      <Badge variant="default">Operational</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
      <Icon className="w-5 h-5 mr-3" />
      <span className="flex-1 text-left">{label}</span>
      {count !== undefined && (
        <Badge variant={badgeVariant} className="ml-2">
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
                <h1 className="text-xl font-bold text-gray-900">Face Detection</h1>
                <p className="text-sm text-gray-600">Security System</p>
              </div>
            </div>

            <nav className="space-y-2">
              <MenuItem
                view="cameras"
                icon={LayoutDashboard}
                label="Cameras"
                count={cameras.length}
                badgeVariant="default"
              />
              <MenuItem
                view="doors"
                icon={DoorOpen}
                label="Doors"
                count={doors.length}
              />
              <MenuItem
                view="activity"
                icon={Activity}
                label="Activity"
              />
              <MenuItem
                view="settings"
                icon={Settings}
                label="Settings"
              />
            </nav>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="space-y-2">
                <Button
                  onClick={() => setShowAddDoorForm(true)}
                  variant="outline"
                  className="w-full justify-start h-10 px-4"
                >
                  <DoorOpen className="w-4 h-4 mr-3" />
                  Add Door
                </Button>
                <Button
                  onClick={() => setShowAddCameraForm(true)}
                  className="w-full justify-start h-10 px-4"
                >
                  <CameraIcon className="w-4 h-4 mr-3" />
                  Add Camera
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {currentView === 'cameras' && 'Camera Management'}
                  {currentView === 'doors' && 'Door Management'}
                  {currentView === 'activity' && 'Activity Monitor'}
                  {currentView === 'settings' && 'System Settings'}
                </h1>
                <p className="text-gray-600 mt-2">
                  {currentView === 'cameras' && 'Manage cameras and view real-time detections'}
                  {currentView === 'doors' && 'Organize doors and associated cameras'}
                  {currentView === 'activity' && 'Monitor system activity and statistics'}
                  {currentView === 'settings' && 'Configure system preferences and settings'}
                </p>
              </div>
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