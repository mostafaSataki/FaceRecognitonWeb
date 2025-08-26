'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, DoorOpen, MapPin, Edit, Trash2 } from 'lucide-react';
import { Door } from '@/types';

interface AddDoorFormProps {
  onSubmit: (door: { name: string; location?: string; description?: string }) => void;
  onCancel: () => void;
}

export function AddDoorForm({ onSubmit, onCancel }: AddDoorFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
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
      onSubmit(formData);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <DoorOpen className="w-5 h-5" />
            Add New Door
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              Add Door
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

interface DoorListProps {
  doors: Door[];
  onEditDoor: (doorId: string) => void;
  onDeleteDoor: (doorId: string) => void;
}

export function DoorList({ doors, onEditDoor, onDeleteDoor }: DoorListProps) {
  if (doors.length === 0) {
    return (
      <div className="text-center py-12">
        <DoorOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No doors configured</h3>
        <p className="text-gray-600">Add your first door to organize cameras</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {doors.map((door) => (
        <Card key={door.id} className="relative">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{door.name}</h3>
                {door.location && (
                  <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                    <MapPin className="w-3 h-3" />
                    {door.location}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant={door.isActive ? "default" : "secondary"}>
                  {door.isActive ? "Active" : "Inactive"}
                </Badge>
                {door.cameras && door.cameras.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {door.cameras.length} cameras
                  </Badge>
                )}
              </div>
            </div>

            {door.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {door.description}
              </p>
            )}

            {/* Associated Cameras */}
            {door.cameras && door.cameras.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-600 mb-1">Associated cameras:</p>
                <div className="flex flex-wrap gap-1">
                  {door.cameras.slice(0, 3).map((camera) => (
                    <Badge key={camera.id} variant="outline" className="text-xs">
                      {camera.name}
                    </Badge>
                  ))}
                  {door.cameras.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{door.cameras.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Door Controls */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditDoor(door.id)}
                className="flex-1"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDeleteDoor(door.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}