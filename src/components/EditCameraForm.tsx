'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { X, Camera, MapPin, Save } from 'lucide-react';
import { Camera as CameraType, Door } from '@/types';

interface EditCameraFormProps {
  camera: CameraType;
  doors: Door[];
  onUpdate: (camera: { 
    id: string;
    name: string; 
    rtspUrl: string; 
    type: 'ENTRY' | 'EXIT' | 'BOTH';
    doorId?: string;
    location?: string;
    isActive: boolean;
  }) => void;
  onCancel: () => void;
}

export function EditCameraForm({ camera, doors, onUpdate, onCancel }: EditCameraFormProps) {
  const [formData, setFormData] = useState({
    name: camera.name,
    rtspUrl: camera.rtspUrl,
    type: camera.type as 'ENTRY' | 'EXIT' | 'BOTH',
    doorId: camera.doorId || '',
    location: camera.location || '',
    isActive: camera.isActive,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Camera name is required';
    }
    
    if (!formData.rtspUrl.trim()) {
      newErrors.rtspUrl = 'RTSP URL is required';
    } else if (!formData.rtspUrl.startsWith('rtsp://')) {
      newErrors.rtspUrl = 'RTSP URL must start with rtsp://';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const submitData = {
        id: camera.id,
        name: formData.name,
        rtspUrl: formData.rtspUrl,
        type: formData.type,
        ...(formData.doorId && formData.doorId !== 'none' && { doorId: formData.doorId }),
        ...(formData.location && { location: formData.location }),
        isActive: formData.isActive,
      };
      
      onUpdate(submitData);
    }
  };

  const getCameraTypeColor = (type: string) => {
    switch (type) {
      case 'ENTRY':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'EXIT':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'BOTH':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Edit Camera
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium">{camera.name}</h4>
              <p className="text-sm text-gray-600">ID: {camera.id}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getCameraTypeColor(camera.type)}>
                {camera.type}
              </Badge>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => handleSwitchChange('isActive', checked)}
              />
              <span className="text-sm font-medium">
                {formData.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div>
            <Label htmlFor="name">Camera Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter camera name"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="rtspUrl">RTSP URL</Label>
            <Input
              id="rtspUrl"
              name="rtspUrl"
              type="text"
              value={formData.rtspUrl}
              onChange={handleInputChange}
              placeholder="rtsp://username:password@ip:port/stream"
              className={errors.rtspUrl ? 'border-red-500' : ''}
            />
            {errors.rtspUrl && (
              <p className="text-red-500 text-sm mt-1">{errors.rtspUrl}</p>
            )}
          </div>

          <div>
            <Label htmlFor="type">Camera Type</Label>
            <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select camera type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ENTRY">Entry Camera</SelectItem>
                <SelectItem value="EXIT">Exit Camera</SelectItem>
                <SelectItem value="BOTH">Entry & Exit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {doors.length > 0 && (
            <div>
              <Label htmlFor="doorId">Associated Door</Label>
              <Select value={formData.doorId} onValueChange={(value) => handleSelectChange('doorId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a door" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No door association</SelectItem>
                  {doors.map((door) => (
                    <SelectItem key={door.id} value={door.id}>
                      {door.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Enter camera location"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}