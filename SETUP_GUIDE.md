# 🚀 Hướng Dẫn Chạy Dự Án IoT Monitoring

## 📋 Yêu Cầu Hệ Thống

- Node.js (v18 trở lên)
- npm hoặc yarn
- Firebase Project với Authentication và Firestore enabled

## 🔧 Cài Đặt

### 1. Backend Setup

```bash
cd backend
npm install
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

## ⚙️ Cấu Hình

### Backend Configuration

File `.env` đã được tạo tại `backend/.env` với thông tin:
- Firebase Admin SDK credentials
- Database URL
- Port 3001

### Frontend Configuration

File `.env.local` đã được cập nhật tại `frontend/.env.local` với:
- Firebase Client SDK configuration
- Backend API URL

## 🚀 Chạy Ứng Dụng

### Cách 1: Sử dụng Scripts Có Sẵn

#### Chạy Backend:
```bash
cd backend
start-dev.bat
```
Hoặc:
```bash
cd backend
npm run start:dev
```

Backend sẽ chạy tại: **http://localhost:3001**
API endpoint: **http://localhost:3001/api**

#### Chạy Frontend:
```bash
cd frontend
start-dev.bat
```
Hoặc:
```bash
cd frontend
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:3000**

### Cách 2: Chạy Từ Root Directory

Mở 2 terminal:

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## 🔐 Đăng Nhập / Đăng Ký

### Các Phương Thức Đăng Nhập:

1. **Email/Password:**
   - Đăng ký tài khoản mới với email và mật khẩu (tối thiểu 6 ký tự)
   - Đăng nhập với tài khoản đã tạo

2. **Google OAuth:**
   - Đăng nhập/đăng ký nhanh bằng tài khoản Google
   - Tự động tạo bản ghi user trong Firestore

### Quyền Hạn (Roles):

- **user** (mặc định): Người dùng thường
- **admin**: Quản trị viên (cần set thủ công trong Firestore)

## 🔥 Firebase Setup

Dự án đang sử dụng Firebase project: **monimove-6cd1d**

### Firestore Database Structure:

```
users/
  {email}/
    - email: string
    - name: string
    - avatar: string (URL)
    - role: string ("user" | "admin")
    - createdAt: string (ISO timestamp)
```

### Thay Đổi Role Thành Admin:

1. Truy cập Firebase Console
2. Vào Firestore Database
3. Tìm collection `users`
4. Chọn document với email của user
5. Sửa field `role` từ `user` thành `admin`

## 🐛 Xử Lý Lỗi Thường Gặp

### 1. "Failed to fetch" hoặc "Network Error"

**Nguyên nhân:** Backend chưa chạy hoặc URL không đúng

**Giải pháp:**
- Kiểm tra backend đang chạy tại http://localhost:3001
- Kiểm tra file `frontend/.env.local` có `NEXT_PUBLIC_API_URL=http://localhost:3001/api`
- Restart cả frontend và backend

### 2. "Firebase: Error (auth/...)"

Các lỗi Firebase Auth phổ biến:

- `auth/email-already-in-use`: Email đã được sử dụng
- `auth/invalid-email`: Email không hợp lệ
- `auth/weak-password`: Mật khẩu quá yếu (< 6 ký tự)
- `auth/user-not-found`: Không tìm thấy user
- `auth/wrong-password`: Sai mật khẩu
- `auth/invalid-credential`: Thông tin đăng nhập không đúng
- `auth/network-request-failed`: Lỗi kết nối mạng

### 3. "Xác thực thất bại (Mã lỗi 401)"

**Nguyên nhân:** Firebase Admin SDK chưa được cấu hình đúng

**Giải pháp:**
- Kiểm tra file `backend/src/config/firebase-service-account.json` tồn tại
- Kiểm tra file `backend/.env` có đầy đủ thông tin
- Restart backend

### 4. Port đã được sử dụng

**Backend (Port 3001):**
```bash
# Tìm process đang sử dụng port
netstat -ano | findstr :3001
# Kill process (thay PID)
taskkill /PID [PID] /F
```

**Frontend (Port 3000):**
```bash
netstat -ano | findstr :3000
taskkill /PID [PID] /F
```

## 📦 Cấu Trúc Project

```
IoT_Monitoring_Moving/
├── backend/                 # NestJS Backend
│   ├── src/
│   │   ├── auth/           # Authentication endpoints
│   │   ├── devices/        # Device management
│   │   ├── alerts/         # Alert system
│   │   ├── firebase/       # Firebase Admin SDK
│   │   └── config/         # Service account credentials
│   ├── .env                # Backend environment variables
│   └── start-dev.bat       # Quick start script
│
├── frontend/               # Next.js Frontend
│   ├── app/                # Next.js app directory
│   ├── src/
│   │   ├── features/
│   │   │   └── auth/       # Login/Register UI
│   │   ├── services/       # API services
│   │   └── core/config/    # Firebase Client config
│   ├── .env.local          # Frontend environment variables
│   └── start-dev.bat       # Quick start script
│
└── SETUP_GUIDE.md          # This file
```

## 🎯 Các Tính Năng

- ✅ Đăng ký/Đăng nhập bằng Email/Password
- ✅ Đăng nhập nhanh bằng Google OAuth
- ✅ Tự động tạo user record trong Firestore
- ✅ Quản lý role (user/admin)
- ✅ Protected API endpoints với Firebase Auth Guard
- ✅ Real-time device monitoring
- ✅ Alert system
- ✅ Responsive UI with Tailwind CSS

## 📞 Hỗ Trợ

Nếu gặp vấn đề, kiểm tra:
1. Console logs trong browser (F12)
2. Backend terminal logs
3. Firebase Console để xem Authentication và Firestore data

## 🔄 Update Frontend Sau Khi Thay Đổi .env

Sau khi thay đổi file `.env.local`, cần restart frontend:
```bash
# Stop server (Ctrl+C)
# Start lại
npm run dev
```
