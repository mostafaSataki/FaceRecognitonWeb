'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { X, DoorOpen, Save } from 'lucide-react';
import { Door } from '@/types';

interface EditDoorFormProps {
  door: Door;
  onUpdate: (door: { 
    id: string;
    name: string; 
    location?: string; 
    description?: string;
    isActive: boolean;
  }) => void;
  onCancel: () => void;
}

export function EditDoorForm({ door, onUpdate, onCancel }: EditDoorFormProps) {
  const [formData, setFormData] = useState({
    name: door.name,
    location: door.location || '',
    description: door.description || '',
    isActive: door.isActive,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
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
      newErrors.name = 'Door name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const submitData = {
        id: door.id,
        name: formData.name,
        ...(formData.location !== undefined && { location: formData.location }),
        ...(formData.description !== undefined && { description: formData.description }),
        isActive: formData.isActive,
      };
      
      onUpdate(submitData);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <DoorOpen className="w-5 h-5" />
            Edit Door
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
              <h4 className="font-medium">{door.name}</h4>
              <p className="text-sm text-gray-600">ID: {door.id}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={door.isActive ? "default" : "secondary"}>
                {door.isActive ? "Active" : "Inactive"}
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
            <Label htmlFor="name">Door Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter door name"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Enter door location"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter door description"
              rows={3}
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