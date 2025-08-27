'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { User, Mail, Phone, Building, Briefcase, CreditCard } from 'lucide-react';

interface AddPersonFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function AddPersonForm({ onSubmit, onCancel }: AddPersonFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nationalCode: '',
    employeeId: '',
    email: '',
    phone: '',
    department: '',
    position: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const positions = [
    'مدیرعامل',
    'مدیر',
    'معاون',
    'کارشناس',
    'کارشناس ارشد',
    'اپراتور',
    'تکنسین',
    'تحلیلگر',
    'برنامه‌نویس',
    'طراح',
    'منشی',
    'دیگر'
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'نام الزامی است';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'نام خانوادگی الزامی است';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'ایمیل معتبر نیست';
    }

    if (formData.nationalCode && !/^\d{10}$/.test(formData.nationalCode)) {
      newErrors.nationalCode = 'کد ملی باید 10 رقم باشد';
    }

    if (formData.phone && !/^0\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'شماره تلفن معتبر نیست';
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="firstName" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            نام <span className="text-red-500">*</span>
          </Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            placeholder="نام شخص"
            className={errors.firstName ? 'border-red-500' : ''}
          />
          {errors.firstName && (
            <p className="text-sm text-red-500">{errors.firstName}</p>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="lastName" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            نام خانوادگی <span className="text-red-500">*</span>
          </Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            placeholder="نام خانوادگی شخص"
            className={errors.lastName ? 'border-red-500' : ''}
          />
          {errors.lastName && (
            <p className="text-sm text-red-500">{errors.lastName}</p>
          )}
        </div>

        {/* National Code */}
        <div className="space-y-2">
          <Label htmlFor="nationalCode" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            کد ملی
          </Label>
          <Input
            id="nationalCode"
            value={formData.nationalCode}
            onChange={(e) => handleInputChange('nationalCode', e.target.value)}
            placeholder="10 رقم"
            maxLength={10}
            className={errors.nationalCode ? 'border-red-500' : ''}
          />
          {errors.nationalCode && (
            <p className="text-sm text-red-500">{errors.nationalCode}</p>
          )}
        </div>

        {/* Employee ID */}
        <div className="space-y-2">
          <Label htmlFor="employeeId" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            کد پرسنلی
          </Label>
          <Input
            id="employeeId"
            value={formData.employeeId}
            onChange={(e) => handleInputChange('employeeId', e.target.value)}
            placeholder="کد پرسنلی"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            ایمیل
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="example@email.com"
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            شماره تلفن
          </Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="09123456789"
            className={errors.phone ? 'border-red-500' : ''}
          />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone}</p>
          )}
        </div>

        {/* Department */}
        <div className="space-y-2">
          <Label htmlFor="department" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            دپارتمان
          </Label>
          <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
            <SelectTrigger>
              <SelectValue placeholder="انتخاب دپارتمان" />
            </SelectTrigger>
            <SelectContent>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Position */}
        <div className="space-y-2">
          <Label htmlFor="position" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            سمت
          </Label>
          <Select value={formData.position} onValueChange={(value) => handleInputChange('position', value)}>
            <SelectTrigger>
              <SelectValue placeholder="انتخاب سمت" />
            </SelectTrigger>
            <SelectContent>
              {positions.map(pos => (
                <SelectItem key={pos} value={pos}>{pos}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Preview Card */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <h4 className="font-medium text-gray-900 mb-2">پیش‌نمایش اطلاعات</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>نام کامل:</strong> {formData.firstName} {formData.lastName}</p>
            {formData.employeeId && <p><strong>کد پرسنلی:</strong> {formData.employeeId}</p>}
            {formData.nationalCode && <p><strong>کد ملی:</strong> {formData.nationalCode}</p>}
            {formData.email && <p><strong>ایمیل:</strong> {formData.email}</p>}
            {formData.phone && <p><strong>تلفن:</strong> {formData.phone}</p>}
            {formData.department && <p><strong>دپارتمان:</strong> {formData.department}</p>}
            {formData.position && <p><strong>سمت:</strong> {formData.position}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          انصراف
        </Button>
        <Button type="submit">
          افزودن شخص
        </Button>
      </div>
    </form>
  );
}