# Backend Face Recognition Engine

این پوشه شامل موتور تشخیص چهره پایتون است که به وب سرویس تبدیل خواهد شد.

## ساختار پوشه

```
backend/
├── face_recognition_engine/    # موتور اصلی تشخیص چهره
├── api/                       # وب سرویس API
├── models/                    # مدل‌های ذخیره شده
├── data/                      # داده‌های آموزشی
└── requirements.txt           # وابستگی‌های پایتون
```

## قابلیت‌ها

- تشخیص چهره در تصاویر و ویدیو
- انرولمنت چهره‌های جدید
- تطبیق چهره با پایگاه داده
- گزارش‌گیری تردد
- اتصال به سیستم اصلی Next.js

## نحوه استفاده

1. نصب وابستگی‌ها: `pip install -r requirements.txt`
2. اجرای وب سرویس: `python api/server.py`
3. دسترسی به API: `http://localhost:5000`

## API Endpoints

- `POST /api/enroll` - انرولمنت چهره جدید
- `POST /api/recognize` - تشخیص چهره
- `GET /api/persons` - لیست افراد
- `DELETE /api/persons/:id` - حذف شخص

## وضعیت

🔄 در حال توسعه - کد پایتون آماده است و در آینده به وب سرویس تبدیل خواهد شد.