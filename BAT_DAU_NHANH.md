# 🚀 BẮT ĐẦU NHANH - MONIMOVE

## ⚡ CÁCH NHANH NHẤT

### Bước 1: Chạy file BAT
Double-click vào file:
```
d:\IoT_Monitoring_Moving\frontend\start-dev.bat
```

### Bước 2: Đợi server khởi động
Bạn sẽ thấy:
```
▲ Next.js 16.2.6 (Turbopack)
- Local:         http://localhost:3000
✓ Ready in 1303ms
```

### Bước 3: Mở browser
Truy cập: **http://localhost:3000**

---

## 🔍 KIỂM TRA TRẠNG THÁI

Nếu không chạy được, double-click:
```
d:\IoT_Monitoring_Moving\frontend\check-status.bat
```

File này sẽ kiểm tra:
- ✅ Node.js đã cài chưa
- ✅ Dependencies đã cài chưa
- ✅ Port 3000 có đang chạy không
- ✅ File .env.local có tồn tại không

---

## 📋 CÁCH THỦ CÔNG

Nếu file BAT không chạy, làm thủ công:

### 1. Mở Command Prompt
Nhấn **Win + R** → Gõ `cmd` → Enter

### 2. Di chuyển vào thư mục
```bash
cd d:\IoT_Monitoring_Moving\frontend
```

### 3. Cài dependencies (lần đầu)
```bash
npm install
```

### 4. Chạy server
```bash
npm run dev
```

### 5. Mở browser
Truy cập: **http://localhost:3000**

---

## ❓ CÁC VẤN ĐỀ THƯỜNG GẶP

### 1. "npm không được nhận dạng"
→ **Chưa cài Node.js**
- Tải tại: https://nodejs.org
- Chọn phiên bản LTS
- Cài đặt và restart máy

### 2. "Port 3000 đã được sử dụng"
→ **Port bị chiếm**

**Cách 1**: Kill process cũ
```bash
netstat -ano | findstr :3000
taskkill /PID [số_PID] /F
```

**Cách 2**: Dùng port khác
```bash
npm run dev -- -p 3001
```
Sau đó truy cập: http://localhost:3001

### 3. Trang trắng hoặc lỗi
→ **Xem Console**
- Nhấn **F12**
- Tab **Console**
- Xem lỗi màu đỏ
- Copy và gửi cho tôi

### 4. Bản đồ không hiển thị
→ **Kiểm tra Internet**
- Thử mở: https://www.openstreetmap.org
- Nếu không mở được → Vấn đề mạng
- Nếu mở được → Thử đổi Map Style

### 5. Nút đăng nhập không hoạt động
→ **Xem file hướng dẫn**
- Đọc: `QUICK_FIX_LOGIN.md`
- Hoặc: `DEBUG_LOGIN.md`

---

## 🎯 CHECKLIST

Trước khi hỏi, hãy kiểm tra:

- [ ] Đã cài Node.js chưa? (`node --version`)
- [ ] Đã chạy `npm install` chưa?
- [ ] Server đang chạy? (`npm run dev`)
- [ ] Truy cập đúng URL? (`http://localhost:3000`)
- [ ] Đã mở Console (F12) xem lỗi chưa?
- [ ] Đã thử refresh (Ctrl + F5) chưa?

---

## 🆘 VẪN KHÔNG ĐƯỢC?

Hãy cho tôi biết:

### 1. Bạn thấy gì khi chạy `npm run dev`?
Copy toàn bộ output và gửi cho tôi

### 2. Bạn thấy gì trên browser?
- Trang trắng?
- Loading mãi?
- Lỗi gì?
- Chụp màn hình

### 3. Console có lỗi gì? (F12)
Copy toàn bộ lỗi màu đỏ

### 4. Kết quả của `check-status.bat`?
Chạy file và copy kết quả

---

## 📞 CÁC FILE HỖ TRỢ

- `start-dev.bat` - Khởi động server tự động
- `check-status.bat` - Kiểm tra trạng thái
- `TROUBLESHOOTING.md` - Khắc phục lỗi chi tiết
- `DEBUG_LOGIN.md` - Debug nút đăng nhập
- `QUICK_FIX_LOGIN.md` - Sửa nhanh login
- `MAP_FEATURES.md` - Tính năng bản đồ
- `DEPLOY_GUIDE.md` - Hướng dẫn deploy

---

## 🎉 ĐĂNG NHẬP

Khi trang đã mở:
- **Username**: `admin`
- **Password**: `admin`

Sau đó vào Dashboard để xem bản đồ!

---

## 💡 MẸO

### Mở nhanh Command Prompt tại thư mục:
1. Mở thư mục `d:\IoT_Monitoring_Moving\frontend` trong File Explorer
2. Gõ `cmd` vào thanh địa chỉ
3. Nhấn Enter

### Xem log chi tiết:
```bash
npm run dev -- --verbose
```

### Clear cache Next.js:
```bash
rm -rf .next
npm run dev
```

---

**Chúc bạn thành công! 🚀**
