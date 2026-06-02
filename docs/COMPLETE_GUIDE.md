# 🎉 HƯỚNG DẪN SỬ DỤNG MONIMOVE - HOÀN CHỈNH

## ✅ ĐÃ HOÀN THÀNH TẤT CẢ!

Trang chính đã sẵn sàng với đầy đủ tính năng!

---

## 🚀 KHỞI ĐỘNG

### **Cách 1: Production (Ổn định nhất)**
```bash
cd d:\IoT_Monitoring_Moving\frontend
npm run build
npm start
```

### **Cách 2: Development (Tự động reload)**
```bash
cd d:\IoT_Monitoring_Moving\frontend
npm run dev
```

### **Cách 3: Dùng file BAT**
Double-click: `start-stable.bat` (production)

---

## 🎯 TÍNH NĂNG TRANG CHỦ

### **1. Giao diện đẹp**
- ✅ Logo MoniMove với animation
- ✅ Gradient background
- ✅ Blur orbs (hiệu ứng nền)
- ✅ Responsive (mobile, tablet, desktop)

### **2. Header**
- ✅ Logo (hover effect)
- ✅ Nút "Đăng nhập"
- ✅ Link "About MoniMove" → GitHub

### **3. Hero Section**
- ✅ Tiêu đề lớn với gradient text
- ✅ Mô tả về MoniMove
- ✅ Nút "Create your own itinerary"

### **4. LoginModal**
- ✅ Modal đẹp với animation
- ✅ Form đăng nhập
- ✅ Validation
- ✅ Demo account: **admin/admin**
- ✅ Chuyển hướng sang `/DeviceCard` sau khi đăng nhập

### **5. Footer**
- ✅ Copyright text

---

## 🎮 CÁCH SỬ DỤNG

### **Bước 1: Truy cập trang chủ**
```
http://localhost:3000
```

### **Bước 2: Click "Đăng nhập"**
Hoặc click nút "Create your own itinerary"

### **Bước 3: Nhập thông tin**
- **Username**: `admin`
- **Password**: `admin`

### **Bước 4: Đăng nhập**
Click "Đăng nhập hệ thống"

### **Bước 5: Vào Dashboard**
Tự động chuyển sang `/DeviceCard` (trang Dashboard)

---

## 📁 CẤU TRÚC DỰ ÁN

```
frontend/
├── app/
│   ├── page.tsx              ← Trang chủ (Landing page)
│   ├── layout.tsx            ← Layout chung
│   ├── globals.css           ← CSS global
│   ├── DeviceCard/
│   │   └── page.tsx          ← Dashboard (sau khi login)
│   └── test/
│       └── page.tsx          ← Trang test
├── src/
│   ├── features/
│   │   ├── auth/
│   │   │   └── LoginModal.tsx    ← Modal đăng nhập
│   │   └── dashboard/
│   │       ├── MapComponent.tsx  ← Bản đồ
│   │       ├── DeviceCard.tsx
│   │       ├── MonitorTab.tsx
│   │       ├── ListDevicesTab.tsx
│   │       ├── SettingsTab.tsx
│   │       └── AboutTab.tsx
│   ├── component/
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── Sidebar.tsx
│   ├── core/
│   │   └── config/
│   │       └── firebase.ts       ← Firebase config
│   └── shared/
│       └── mock-data/
│           └── devices.json      ← Mock data
├── .env.local                ← Biến môi trường
├── next.config.ts            ← Next.js config
├── package.json
└── start-stable.bat          ← Script khởi động
```

---

## 🎨 TÍNH NĂNG DASHBOARD (Sau khi login)

### **Tabs:**
1. **Monitor** - Giám sát thiết bị với bản đồ
2. **List Devices** - Danh sách thiết bị
3. **Settings** - Cài đặt
4. **About** - Thông tin

### **Bản đồ:**
- ✅ 4 kiểu: Standard, Satellite, Terrain, Dark
- ✅ Lộ trình di chuyển
- ✅ Vùng an toàn (500m)
- ✅ Marker với pulse animation
- ✅ Popup thông tin thiết bị

---

## 🔧 TÙY CHỈNH

### **Thay đổi màu sắc:**
Mở `app/page.tsx` và sửa:
```typescript
// Gradient background
bg-gradient-to-tr from-[#eef7f8] via-[#f4f3f8] to-[#fbeff5]

// Logo gradient
from-[#12a1c0] to-[#00b494]

// Button gradient
from-[#29cca2] to-[#54aafa]
```

### **Thay đổi text:**
```typescript
// Tiêu đề
Smart MoniMove, Effortless Move.

// Mô tả
MoniMove là người bạn đồng hành...
```

### **Thay đổi demo account:**
Mở `src/features/auth/LoginModal.tsx`:
```typescript
if (username === 'admin' && password === 'admin') {
  // Đổi thành username/password của bạn
}
```

---

## 🐛 TROUBLESHOOTING

### **Lỗi: Modal không hiện**
1. Xóa cache: `rmdir /s /q .next`
2. Restart server
3. Hard refresh browser (Ctrl + F5)

### **Lỗi: Không chuyển trang sau login**
Kiểm tra trang `/DeviceCard` có tồn tại không:
```
frontend/app/DeviceCard/page.tsx
```

### **Lỗi: Import không tìm thấy**
```bash
npm install lucide-react
```

### **Lỗi: Server không ổn định**
Dùng production server:
```bash
npm run build
npm start
```

---

## 📊 CHECKLIST HOÀN CHỈNH

### **Trang chủ:**
- [x] Giao diện đẹp
- [x] Logo với animation
- [x] Header với nút đăng nhập
- [x] Hero section
- [x] Nút CTA
- [x] Footer
- [x] Background effects
- [x] Responsive

### **LoginModal:**
- [x] Modal đẹp
- [x] Form validation
- [x] Demo account
- [x] Animation
- [x] Chuyển hướng sau login
- [x] Nút đóng
- [x] Click outside để đóng

### **Dashboard:**
- [x] Sidebar
- [x] Header
- [x] Tabs
- [x] Bản đồ
- [x] Device cards
- [x] Settings
- [x] About

---

## 🚀 DEPLOY LÊN RENDER

Khi sẵn sàng deploy:

### **Bước 1: Push lên GitHub**
```bash
git add .
git commit -m "Complete: All features ready for deployment"
git push origin master
```

### **Bước 2: Deploy trên Render**
1. Truy cập: https://dashboard.render.com
2. New + → Blueprint
3. Connect repository: `Yhucyor/MoniMove`
4. File `render.yaml` sẽ tự động được phát hiện
5. Click "Apply"

### **Bước 3: Đợi deploy**
Khoảng 5-10 phút

### **Bước 4: Truy cập**
URL sẽ có dạng: `https://iot-monitoring-frontend.onrender.com`

---

## 💡 TIPS

### **1. Phát triển:**
```bash
# Dùng dev server khi code
npm run dev

# Xóa cache khi gặp lỗi
rmdir /s /q .next
```

### **2. Test:**
```bash
# Dùng production server khi test
npm run build
npm start
```

### **3. Deploy:**
```bash
# Build trước để kiểm tra lỗi
npm run build

# Nếu build OK → Push lên GitHub
git push origin master
```

---

## 🎯 ROADMAP TIẾP THEO

### **Tính năng có thể thêm:**
1. **Real-time GPS tracking** từ Firebase
2. **Nhiều thiết bị** trên bản đồ
3. **Lịch sử lộ trình** theo ngày
4. **Cảnh báo** khi ra khỏi vùng
5. **Thống kê** (tốc độ, quãng đường)
6. **Export** lộ trình ra GPX/KML
7. **Notifications** khi có sự cố
8. **User management** (đăng ký, quên mật khẩu)
9. **Dark mode**
10. **Multi-language** (EN/VI)

---

## 📞 HỖ TRỢ

### **File hướng dẫn:**
- `BAT_DAU_NHANH.md` - Khởi động nhanh
- `DEPLOY_GUIDE.md` - Deploy lên Render
- `MAP_FEATURES.md` - Tính năng bản đồ
- `TROUBLESHOOTING.md` - Khắc phục lỗi
- `STABLE_SERVER_GUIDE.md` - Server ổn định

### **Scripts:**
- `start-stable.bat` - Khởi động production
- `check-status.bat` - Kiểm tra trạng thái
- `use-simple-page.bat` - Chuyển trang đơn giản

---

## 🎉 HOÀN THÀNH!

Bạn đã có:
- ✅ Trang chủ đẹp
- ✅ LoginModal hoạt động
- ✅ Dashboard với bản đồ
- ✅ Sẵn sàng deploy

**Chúc mừng! Dự án đã hoàn thiện!** 🚀

---

**Bạn muốn thêm tính năng gì nữa không?**
