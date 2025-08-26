'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Camera, MapPin } from 'lucide-react';
import { Door } from '@/types';

interface AddCameraFormProps {
  onSubmit: (camera: { 
    name: string; 
    rtspUrl: string; 
    type?: 'ENTRY' | 'EXIT' | 'BOTH';
    doorId?: string;
    location?: string;
  }) => void;
  onCancel: () => void;
  doors?: Door[];
}

export function AddCameraForm({ onSubmit, onCancel, doors = [] }: AddCameraFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    rtspUrl: '',
    type: 'ENTRY' as 'ENTRY' | 'EXIT' | 'BOTH',
    doorId: '',
    location: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user makes selection
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
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
        name: formData.name,
        rtspUrl: formData.rtspUrl,
        type: formData.type,
        ...(formData.doorId && formData.doorId !== 'none' && { doorId: formData.doorId }),
        ...(formData.location && { location: formData.location }),
      };
      
      onSubmit(submitData);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Add New Camera
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label htmlFor="doorId">Associated Door (Optional)</Label>
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
            <Label htmlFor="location">Location (Optional)</Label>
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
              Add Camera
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