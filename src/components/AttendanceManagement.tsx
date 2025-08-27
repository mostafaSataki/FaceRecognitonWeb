'use client';

import { useState, useEffect } from 'react';
import { AttendanceLog, Person, Camera, Door } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  LogIn, 
  LogOut, 
  Clock, 
  Users, 
  Search, 
  Calendar,
  Filter,
  Download,
  Eye,
  Camera as CameraIcon,
  DoorOpen,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { AttendanceReportForm } from './AttendanceReportForm';

interface AttendanceManagementProps {
  onViewDetails?: (log: AttendanceLog) => void;
}

export function AttendanceManagement({ onViewDetails }: AttendanceManagementProps) {
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('today');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AttendanceLog | null>(null);

  useEffect(() => {
    fetchAttendanceLogs();
  }, []);

  useEffect(() => {
    filterAttendanceLogs();
  }, [attendanceLogs, searchTerm, dateFilter, typeFilter]);

  const fetchAttendanceLogs = async () => {
    try {
      const response = await fetch('/api/attendance');
      const data = await response.json();
      setAttendanceLogs(data);
    } catch (error) {
      console.error('Error fetching attendance logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAttendanceLogs = () => {
    let filtered = [...attendanceLogs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log =>
        `${log.person.firstName} ${log.person.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.person.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.camera.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(log => new Date(log.timestamp) >= today);
          break;
        case 'yesterday':
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          filtered = filtered.filter(log => {
            const logDate = new Date(log.timestamp);
            return logDate >= yesterday && logDate < today;
          });
          break;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          filtered = filtered.filter(log => new Date(log.timestamp) >= weekAgo);
          break;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          filtered = filtered.filter(log => new Date(log.timestamp) >= monthAgo);
          break;
      }
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(log => log.type === typeFilter);
    }

    setFilteredLogs(filtered);
  };

  const getTodayStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayLogs = attendanceLogs.filter(log => 
      new Date(log.timestamp) >= today
    );

    const entries = todayLogs.filter(log => log.type === 'ENTRY');
    const exits = todayLogs.filter(log => log.type === 'EXIT');
    const uniquePersons = new Set(todayLogs.map(log => log.personId)).size;

    return {
      total: todayLogs.length,
      entries: entries.length,
      exits: exits.length,
      uniquePersons,
    };
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  const exportToCSV = () => {
    const headers = ['تاریخ', 'زمان', 'نام شخص', 'کد پرسنلی', 'نوع تردد', 'دوربین', 'گیت', 'دقت'];
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => [
        formatDate(log.timestamp),
        formatTime(log.timestamp),
        `${log.person.firstName} ${log.person.lastName}`,
        log.person.employeeId || '',
        log.type === 'ENTRY' ? 'ورود' : 'خروج',
        log.camera.name,
        log.door?.name || '',
        log.confidence ? `${(log.confidence * 100).toFixed(1)}%` : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const stats = getTodayStats();

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
          <h2 className="text-2xl font-bold text-gray-900">مدیریت تردد</h2>
          <p className="text-gray-600">ورود و خروج افراد را مدیریت و گزارش‌گیری کنید</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showReportForm} onOpenChange={setShowReportForm}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                گزارش‌گیری
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>گزارش‌گیری تردد</DialogTitle>
              </DialogHeader>
              <AttendanceReportForm 
                onCancel={() => setShowReportForm(false)} 
              />
            </DialogContent>
          </Dialog>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            خروجی CSV
          </Button>
        </div>
      </div>

      {/* Today's Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-blue-600" />
              <div className="mr-3">
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-600">تردد امروز</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <LogIn className="w-8 h-8 text-green-600" />
              <div className="mr-3">
                <p className="text-2xl font-bold">{stats.entries}</p>
                <p className="text-sm text-gray-600">ورود امروز</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <LogOut className="w-8 h-8 text-red-600" />
              <div className="mr-3">
                <p className="text-2xl font-bold">{stats.exits}</p>
                <p className="text-sm text-gray-600">خروج امروز</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-purple-600" />
              <div className="mr-3">
                <p className="text-2xl font-bold">{stats.uniquePersons}</p>
                <p className="text-sm text-gray-600">افراد حاضر</p>
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
                  placeholder="نام شخص، کد پرسنلی، دوربین..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="date">تاریخ</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب تاریخ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">امروز</SelectItem>
                  <SelectItem value="yesterday">دیروز</SelectItem>
                  <SelectItem value="week">هفته اخیر</SelectItem>
                  <SelectItem value="month">ماه اخیر</SelectItem>
                  <SelectItem value="all">همه</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">نوع تردد</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب نوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه</SelectItem>
                  <SelectItem value="ENTRY">ورود</SelectItem>
                  <SelectItem value="EXIT">خروج</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            لاگ ترددها ({filteredLogs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">هیچ ترددی یافت نشد</h3>
              <p className="text-gray-600">با فیلترهای دیگر جستجو کنید</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    {/* Person Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <UserCheck className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {log.person.firstName} {log.person.lastName}
                        </h4>
                        {log.person.employeeId && (
                          <p className="text-sm text-gray-600">{log.person.employeeId}</p>
                        )}
                      </div>
                    </div>

                    {/* Attendance Info */}
                    <div className="text-sm">
                      <div className="flex items-center gap-2">
                        {log.type === 'ENTRY' ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <LogIn className="w-3 h-3 mr-1" />
                            ورود
                          </Badge>
                        ) : (
                          <Badge variant="default" className="bg-red-100 text-red-800">
                            <LogOut className="w-3 h-3 mr-1" />
                            خروج
                          </Badge>
                        )}
                        <span className="text-gray-600">
                          {formatDate(log.timestamp)} {formatTime(log.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <CameraIcon className="w-3 h-3" />
                          {log.camera.name}
                        </span>
                        {log.door && (
                          <span className="flex items-center gap-1">
                            <DoorOpen className="w-3 h-3" />
                            {log.door.name}
                          </span>
                        )}
                        {log.confidence && (
                          <span className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {(log.confidence * 100).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedLog(log)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>جزئیات تردد</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">شخص:</span>
                  <span className="font-medium mr-2">
                    {selectedLog.person.firstName} {selectedLog.person.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">کد پرسنلی:</span>
                  <span className="font-medium mr-2">
                    {selectedLog.person.employeeId || 'نامشخص'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">نوع تردد:</span>
                  <span className="font-medium mr-2">
                    {selectedLog.type === 'ENTRY' ? 'ورود' : 'خروج'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">زمان:</span>
                  <span className="font-medium mr-2">
                    {new Date(selectedLog.timestamp).toLocaleString('fa-IR')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">دوربین:</span>
                  <span className="font-medium mr-2">
                    {selectedLog.camera.name}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">گیت:</span>
                  <span className="font-medium mr-2">
                    {selectedLog.door?.name || 'نامشخص'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">دقت تشخیص:</span>
                  <span className="font-medium mr-2">
                    {selectedLog.confidence ? `${(selectedLog.confidence * 100).toFixed(1)}%` : 'نامشخص'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">دپارتمان:</span>
                  <span className="font-medium mr-2">
                    {selectedLog.person.department || 'نامشخص'}
                  </span>
                </div>
              </div>
              
              {selectedLog.imagePath && (
                <div>
                  <Label className="text-sm text-gray-600">تصویر ثبت شده:</Label>
                  <div className="mt-2">
                    <img
                      src={selectedLog.imagePath}
                      alt="Attendance capture"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}