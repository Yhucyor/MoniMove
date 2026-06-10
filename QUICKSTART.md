# ⚡ Quick Start Guide

## 🚀 Chạy Dự Án Trong 3 Bước

### Bước 1: Cài Đặt Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Bước 2: Chạy Backend (Terminal 1)

```bash
cd backend
npm run start:dev
```

✅ Backend sẽ chạy tại: **http://localhost:3001**

### Bước 3: Chạy Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

✅ Frontend sẽ chạy tại: **http://localhost:3000**

---

## 🎯 Kiểm Tra Hoạt Động

1. Mở browser: `http://localhost:3000`
2. Kiểm tra **Backend Status** indicator ở góc phải dưới
   - 🟢 Màu xanh = Backend đang chạy
   - 🔴 Màu đỏ = Backend chưa chạy
3. Click "Đăng nhập" để test authentication

---

## 🔐 Test Đăng Nhập

### Cách 1: Đăng ký tài khoản mới
1. Click "Đăng ký ngay"
2. Nhập họ tên, email, mật khẩu
3. Tài khoản sẽ được tạo trong Firebase

### Cách 2: Đăng nhập bằng Google
1. Click "Đăng nhập / Đăng ký bằng Google"
2. Chọn tài khoản Google
3. Tự động tạo user trong Firestore

---

## ⚠️ Lỗi Thường Gặp

### "Failed to fetch"
→ Backend chưa chạy. Chạy backend trước (Bước 2)

### "Backend không phản hồi"
→ Kiểm tra backend đang chạy tại http://localhost:3001

### Port đã được sử dụng
```bash
# Kill process trên port 3001 (Backend)
netstat -ano | findstr :3001
taskkill /PID [PID] /F

# Kill process trên port 3000 (Frontend)
netstat -ano | findstr :3000
taskkill /PID [PID] /F
```

---

## 📚 Tài Liệu Đầy Đủ

- **SETUP_GUIDE.md** - Hướng dẫn chi tiết
- **FIX_SUMMARY.md** - Tóm tắt các lỗi đã sửa

---

## 🎉 Done!

Bây giờ bạn có thể:
- ✅ Đăng ký / Đăng nhập với email
- ✅ Đăng nhập bằng Google
- ✅ Quản lý thiết bị IoT
- ✅ Xem alerts và history

**Happy Coding! 🚀**
