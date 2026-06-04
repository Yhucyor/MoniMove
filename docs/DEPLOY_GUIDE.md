# 🚀 HƯỚNG DẪN DEPLOY LÊN RENDER

## ✅ ĐÃ SỬA CÁC VẤN ĐỀ:

### 1. ✅ Sửa lỗi MapComponent (Leaflet SSR)
- Đã chuyển sang dynamic import để tránh lỗi Server-Side Rendering
- Map sẽ chỉ render trên client-side

### 2. ✅ Bảo mật Firebase API Key
- Đã chuyển API key sang biến môi trường `.env.local`
- File `.env.local` đã được thêm vào `.gitignore` (không push lên Git)

### 3. ✅ Cấu hình Render
- Đã tạo file `render.yaml` với đầy đủ biến môi trường

---

## 📋 BƯỚC DEPLOY LÊN RENDER:

### Bước 1: Push code lên GitHub

Mở **Git Bash** hoặc **Command Prompt** và chạy:

```bash
cd d:\IoT_Monitoring_Moving

# Kiểm tra trạng thái
git status

# Thêm tất cả file đã sửa
git add .

# Commit với message
git commit -m "Fix: MapComponent SSR issue and secure Firebase config for Render deployment"

# Push lên GitHub
git push origin master
```

### Bước 2: Deploy trên Render

#### **Cách 1: Sử dụng Blueprint (Khuyến nghị)**

1. Truy cập: https://dashboard.render.com
2. Đăng nhập bằng GitHub
3. Click **"New +" → "Blueprint"**
4. Chọn repository: `Yhucyor/MoniMove`
5. Render sẽ tự động phát hiện file `render.yaml`
6. Click **"Apply"**
7. Đợi 5-10 phút để build và deploy

#### **Cách 2: Manual Deploy**

1. Truy cập: https://dashboard.render.com
2. Click **"New +" → "Web Service"**
3. Connect repository: `Yhucyor/MoniMove`
4. Điền thông tin:
   - **Name**: `iot-monitoring-frontend`
   - **Region**: Singapore
   - **Root Directory**: `frontend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

5. **Thêm Environment Variables** (quan trọng!):
   ```
   NODE_VERSION=20.11.0
   NODE_ENV=production
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAQGHnSICLu-1QpOItRIYen0y5AxPbIMtc
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=monimove-6cd1d.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=monimove-6cd1d
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=monimove-6cd1d.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=924125576856
   NEXT_PUBLIC_FIREBASE_APP_ID=1:924125576856:web:853fae140460e139de1aed
   ```

6. Click **"Create Web Service"**

---

## 🔍 KIỂM TRA SAU KHI DEPLOY:

### ✅ Build thành công:
- Xem log trên Render Dashboard
- Tìm dòng: `✓ Compiled successfully`

### ✅ App đang chạy:
- URL sẽ có dạng: `https://iot-monitoring-frontend.onrender.com`
- Truy cập để kiểm tra

### ✅ Các tính năng hoạt động:
- [ ] Trang chủ hiển thị đúng
- [ ] Nút "Đăng nhập" mở modal
- [ ] Login với `admin/admin` chuyển sang `/DeviceCard`
- [ ] Bản đồ hiển thị (MapComponent)
- [ ] Sidebar và các tab hoạt động

---

## ❌ NẾU GẶP LỖI:

### Lỗi 1: "Module not found: Can't resolve 'leaflet'"
**Nguyên nhân**: Dependencies chưa được cài đặt đầy đủ
**Giải pháp**: 
- Kiểm tra `Build Command` phải có: `npm install && npm run build`
- Xóa service và tạo lại

### Lỗi 2: "window is not defined"
**Nguyên nhân**: Component đang cố render trên server
**Giải pháp**: Đã sửa bằng dynamic import trong MapComponent

### Lỗi 3: "Firebase: Error (auth/invalid-api-key)"
**Nguyên nhân**: Biến môi trường chưa được set
**Giải pháp**: 
- Vào Render Dashboard → Service → Environment
- Thêm tất cả biến `NEXT_PUBLIC_FIREBASE_*`

### Lỗi 4: Build timeout
**Nguyên nhân**: Free tier của Render có giới hạn thời gian build
**Giải pháp**: 
- Đợi và thử lại
- Hoặc nâng cấp lên paid plan

---

## 📝 GHI CHÚ:

1. **Free tier của Render**:
   - Service sẽ sleep sau 15 phút không hoạt động
   - Lần truy cập đầu tiên sẽ mất 30-60 giây để wake up

2. **Cập nhật code**:
   - Mỗi lần push lên GitHub, Render sẽ tự động rebuild và deploy
   - Không cần làm gì thêm

3. **Xem logs**:
   - Vào Render Dashboard → Service → Logs
   - Xem real-time logs để debug

---

## 🎯 CHECKLIST TRƯỚC KHI DEPLOY:

- [x] Đã sửa MapComponent (dynamic import)
- [x] Đã chuyển Firebase config sang env variables
- [x] Đã tạo file `render.yaml`
- [x] Đã test build thành công ở local
- [ ] Đã push code lên GitHub
- [ ] Đã tạo service trên Render
- [ ] Đã thêm environment variables
- [ ] Đã test app trên production URL

---

## 🆘 HỖ TRỢ:

Nếu vẫn gặp vấn đề, hãy:
1. Copy toàn bộ log lỗi từ Render
2. Kiểm tra file nào đang bị lỗi
3. Hỏi lại với thông tin chi tiết

**Repository**: https://github.com/Yhucyor/MoniMove
**Render Dashboard**: https://dashboard.render.com
