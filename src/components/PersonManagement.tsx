'use client';

import { useState, useEffect } from 'react';
import { Person } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Search, 
  Camera,
  Fingerprint,
  Clock,
  Mail,
  Phone,
  Building,
  UserCheck
} from 'lucide-react';
import { AddPersonForm } from './AddPersonForm';
import { EditPersonForm } from './EditPersonForm';
import { FaceEnrollmentForm } from './FaceEnrollmentForm';

interface PersonManagementProps {
  onEditPerson?: (person: Person) => void;
  onDeletePerson?: (personId: string) => void;
  onEnrollFace?: (person: Person) => void;
}

export function PersonManagement({ 
  onEditPerson, 
  onDeletePerson, 
  onEnrollFace 
}: PersonManagementProps) {
  const [persons, setPersons] = useState<Person[]>([]);
  const [filteredPersons, setFilteredPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [enrollingPerson, setEnrollingPerson] = useState<Person | null>(null);

  useEffect(() => {
    fetchPersons();
  }, []);

  useEffect(() => {
    filterPersons();
  }, [persons, searchTerm, departmentFilter]);

  const fetchPersons = async () => {
    try {
      const response = await fetch('/api/persons');
      const data = await response.json();
      setPersons(data);
    } catch (error) {
      console.error('Error fetching persons:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPersons = () => {
    let filtered = persons;

    if (searchTerm) {
      filtered = filtered.filter(person =>
        `${person.firstName} ${person.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (departmentFilter !== 'all') {
      filtered = filtered.filter(person => person.department === departmentFilter);
    }

    setFilteredPersons(filtered);
  };

  const handleAddPerson = async (personData: any) => {
    try {
      const response = await fetch('/api/persons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(personData),
      });

      if (response.ok) {
        await fetchPersons();
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error adding person:', error);
    }
  };

  const handleEditPerson = async (personId: string, personData: any) => {
    try {
      const response = await fetch(`/api/persons/${personId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(personData),
      });

      if (response.ok) {
        await fetchPersons();
        setEditingPerson(null);
      }
    } catch (error) {
      console.error('Error updating person:', error);
    }
  };

  const handleDeletePerson = async (personId: string) => {
    if (!confirm('آیا از حذف این شخص اطمینان دارید؟')) {
      return;
    }

    try {
      const response = await fetch(`/api/persons/${personId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchPersons();
      }
    } catch (error) {
      console.error('Error deleting person:', error);
    }
  };

  const handleEnrollFace = async (enrollmentData: any) => {
    try {
      const response = await fetch('/api/face-enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enrollmentData),
      });

      if (response.ok) {
        await fetchPersons();
        setEnrollingPerson(null);
      }
    } catch (error) {
      console.error('Error enrolling face:', error);
    }
  };

  const getDepartments = () => {
    const departments = [...new Set(persons.map(p => p.department).filter(Boolean))];
    return departments;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">مدیریت افراد</h2>
          <p className="text-gray-600">افراد سیستم را ثبت و مدیریت کنید</p>
        </div>
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              افزودن شخص
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>افزودن شخص جدید</DialogTitle>
            </DialogHeader>
            <AddPersonForm onSubmit={handleAddPerson} onCancel={() => setShowAddForm(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="mr-3">
                <p className="text-2xl font-bold">{persons.length}</p>
                <p className="text-sm text-gray-600">کل افراد</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <UserCheck className="w-8 h-8 text-green-600" />
              <div className="mr-3">
                <p className="text-2xl font-bold">
                  {persons.filter(p => p.isActive).length}
                </p>
                <p className="text-sm text-gray-600">فعال</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Fingerprint className="w-8 h-8 text-purple-600" />
              <div className="mr-3">
                <p className="text-2xl font-bold">
                  {persons.filter(p => p.faceEnrollments && p.faceEnrollments.length > 0).length}
                </p>
                <p className="text-sm text-gray-600">چهره انرول شده</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Building className="w-8 h-8 text-orange-600" />
              <div className="mr-3">
                <p className="text-2xl font-bold">{getDepartments().length}</p>
                <p className="text-sm text-gray-600">دپارتمان‌ها</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">جستجو</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="نام، کد ملی، ایمیل..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="department">دپارتمان</Label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب دپارتمان" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه دپارتمان‌ها</SelectItem>
                  {getDepartments().map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Persons List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            لیست افراد ({filteredPersons.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPersons.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">هیچ شخصی یافت نشد</h3>
              <p className="text-gray-600">با افزودن شخص جدید شروع کنید</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredPersons.map((person) => (
                <Card key={person.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900">
                            {person.firstName} {person.lastName}
                          </h3>
                          <Badge variant={person.isActive ? "default" : "secondary"}>
                            {person.isActive ? 'فعال' : 'غیرفعال'}
                          </Badge>
                        </div>
                        {person.employeeId && (
                          <p className="text-sm text-gray-600">کد پرسنلی: {person.employeeId}</p>
                        )}
                        {person.department && (
                          <p className="text-sm text-gray-600">دپارتمان: {person.department}</p>
                        )}
                        {person.position && (
                          <p className="text-sm text-gray-600">سمت: {person.position}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        {person.faceEnrollments && person.faceEnrollments.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <Fingerprint className="w-3 h-3 mr-1" />
                            چهره انرول شده
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-1 mb-3">
                      {person.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-3 h-3" />
                          {person.email}
                        </div>
                      )}
                      {person.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-3 h-3" />
                          {person.phone}
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      {person.attendanceLogs && person.attendanceLogs.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {person.attendanceLogs.length} تردد
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingPerson(person)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        ویرایش
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEnrollingPerson(person)}
                        disabled={!person.isActive}
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePerson(person.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Person Dialog */}
      <Dialog open={!!editingPerson} onOpenChange={() => setEditingPerson(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>ویرایش شخص</DialogTitle>
          </DialogHeader>
          {editingPerson && (
            <EditPersonForm
              person={editingPerson}
              onSubmit={(data) => handleEditPerson(editingPerson.id, data)}
              onCancel={() => setEditingPerson(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Face Enrollment Dialog */}
      <Dialog open={!!enrollingPerson} onOpenChange={() => setEnrollingPerson(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>انرولمنت چهره</DialogTitle>
          </DialogHeader>
          {enrollingPerson && (
            <FaceEnrollmentForm
              person={enrollingPerson}
              onSubmit={handleEnrollFace}
              onCancel={() => setEnrollingPerson(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}