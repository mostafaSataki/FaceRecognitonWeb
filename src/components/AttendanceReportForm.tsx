'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Download, Filter, FileText, Users } from 'lucide-react';

interface AttendanceReportFormProps {
  onCancel: () => void;
}

export function AttendanceReportForm({ onCancel }: AttendanceReportFormProps) {
  const [reportData, setReportData] = useState({
    startDate: '',
    endDate: '',
    department: '',
    reportType: 'summary',
  });

  const [loading, setLoading] = useState(false);
  const [reportResult, setReportResult] = useState<any>(null);

  const departments = [
    'منابع انسانی',
    'فنی و مهندسی',
    'مالی و حسابداری',
    'بازاریابی و فروش',
    'پشتیبانی مشتریان',
    'تحقیق و توسعه',
    'تولید',
    'کنترل کیفیت',
    'مدیریت',
    'دیگر'
  ];

  const handleInputChange = (field: string, value: string) => {
    setReportData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateReport = async () => {
    if (!reportData.startDate || !reportData.endDate) {
      alert('لطفاً تاریخ شروع و پایان را انتخاب کنید');
      return;
    }

    setLoading(true);
    
    try {
      const params = new URLSearchParams({
        startDate: reportData.startDate,
        endDate: reportData.endDate,
        type: reportData.reportType,
      });

      if (reportData.department) {
        params.append('department', reportData.department);
      }

      const response = await fetch(`/api/attendance/reports?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setReportResult(data);
      } else {
        alert('خطا در生成 گزارش: ' + data.error);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('خطا در生成 گزارش');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!reportResult) return;

    let csvContent = '';
    
    if (reportResult.reportType === 'summary') {
      const headers = ['نام شخص', 'کد پرسنلی', 'دپارتمان', 'تعداد ورود', 'تعداد خروج', 'اولین ورود', 'آخرین خروج'];
      csvContent = [
        headers.join(','),
        ...reportResult.summary.map((item: any) => [
          `${item.person.firstName} ${item.person.lastName}`,
          item.person.employeeId || '',
          item.person.department || '',
          item.totalEntries,
          item.totalExits,
          item.firstEntry ? new Date(item.firstEntry).toLocaleString('fa-IR') : '',
          item.lastExit ? new Date(item.lastExit).toLocaleString('fa-IR') : ''
        ].join(','))
      ].join('\n');
    } else if (reportResult.reportType === 'detailed') {
      const headers = ['تاریخ', 'زمان', 'نام شخص', 'کد پرسنلی', 'نوع تردد', 'دوربین', 'گیت', 'دقت'];
      csvContent = [
        headers.join(','),
        ...reportResult.records.map((log: any) => [
          new Date(log.timestamp).toLocaleDateString('fa-IR'),
          new Date(log.timestamp).toLocaleTimeString('fa-IR'),
          `${log.person.firstName} ${log.person.lastName}`,
          log.person.employeeId || '',
          log.type === 'ENTRY' ? 'ورود' : 'خروج',
          log.camera.name,
          log.door?.name || '',
          log.confidence ? `${(log.confidence * 100).toFixed(1)}%` : ''
        ].join(','))
      ].join('\n');
    } else if (reportResult.reportType === 'daily') {
      const headers = ['تاریخ', 'نام شخص', 'کد پرسنلی', 'تعداد ورود', 'تعداد خروج', 'اولین ورود', 'آخرین خروج'];
      csvContent = [
        headers.join(','),
        ...reportResult.dailySummary.map((item: any) => [
          item.date,
          `${item.person.firstName} ${item.person.lastName}`,
          item.person.employeeId || '',
          item.entryCount,
          item.exitCount,
          item.firstEntry ? new Date(item.firstEntry).toLocaleTimeString('fa-IR') : '',
          item.lastExit ? new Date(item.lastExit).toLocaleTimeString('fa-IR') : ''
        ].join(','))
      ].join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `attendance_report_${reportData.reportType}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const setTodayRange = () => {
    const today = new Date().toISOString().split('T')[0];
    setReportData(prev => ({
      ...prev,
      startDate: today,
      endDate: today
    }));
  };

  const setWeekRange = () => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    setReportData(prev => ({
      ...prev,
      startDate: weekAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    }));
  };

  const setMonthRange = () => {
    const today = new Date();
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    setReportData(prev => ({
      ...prev,
      startDate: monthAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            تاریخ شروع <span className="text-red-500">*</span>
          </Label>
          <Input
            id="startDate"
            type="date"
            value={reportData.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            تاریخ پایان <span className="text-red-500">*</span>
          </Label>
          <Input
            id="endDate"
            type="date"
            value={reportData.endDate}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
          />
        </div>
      </div>

      {/* Quick Date Selection */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <Label className="text-sm font-medium text-gray-700 mb-2 block">انتخاب سریع:</Label>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={setTodayRange}>
              امروز
            </Button>
            <Button variant="outline" size="sm" onClick={setWeekRange}>
              هفته اخیر
            </Button>
            <Button variant="outline" size="sm" onClick={setMonthRange}>
              ماه اخیر
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="department" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            دپارتمان
          </Label>
          <Select value={reportData.department} onValueChange={(value) => handleInputChange('department', value)}>
            <SelectTrigger>
              <SelectValue placeholder="همه دپارتمان‌ها" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">همه دپارتمان‌ها</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reportType" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            نوع گزارش
          </Label>
          <Select value={reportData.reportType} onValueChange={(value) => handleInputChange('reportType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="انتخاب نوع گزارش" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="summary">خلاصه</SelectItem>
              <SelectItem value="detailed">جزئیات</SelectItem>
              <SelectItem value="daily">روزانه</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Report Type Description */}
      <Card className="bg-blue-50">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2">توضیحات انواع گزارش:</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>خلاصه:</strong> آمار تردد هر شخص به صورت جمعی</p>
            <p><strong>جزئیات:</strong> تمام ترددها با جزئیات کامل</p>
            <p><strong>روزانه:</strong> آمار تردد به صورت روزانه برای هر شخص</p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4">
        <Button variant="outline" onClick={onCancel}>
          انصراف
        </Button>
        <div className="flex gap-2">
          <Button 
            onClick={generateReport} 
            disabled={loading || !reportData.startDate || !reportData.endDate}
          >
            <Filter className="w-4 h-4 mr-2" />
            {loading ? 'در حال تولید...' : 'تولید گزارش'}
          </Button>
          {reportResult && (
            <Button variant="outline" onClick={exportReport}>
              <Download className="w-4 h-4 mr-2" />
              خروجی CSV
            </Button>
          )}
        </div>
      </div>

      {/* Report Results */}
      {reportResult && (
        <Card className="bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-green-900">گزارش تولید شد</h4>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                {reportResult.totalRecords} رکورد
              </Badge>
            </div>
            
            <div className="text-sm text-green-700 space-y-2">
              <p><strong>نوع گزارش:</strong> {reportResult.reportType}</p>
              <p><strong>بازه زمانی:</strong> {new Date(reportResult.period.start).toLocaleDateString('fa-IR')} تا {new Date(reportResult.period.end).toLocaleDateString('fa-IR')}</p>
              
              {reportResult.reportType === 'summary' && (
                <p><strong>تعداد افراد:</strong> {reportResult.summary.length}</p>
              )}
              
              {reportResult.reportType === 'daily' && (
                <p><strong>تعداد روزها:</strong> {new Set(reportResult.dailySummary.map((item: any) => item.date)).size}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}