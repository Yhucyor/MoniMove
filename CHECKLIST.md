# ✅ Checklist - Kiểm Tra Hệ Thống

## 📦 Cài Đặt

- [ ] Node.js v18+ đã cài đặt
- [ ] npm hoặc yarn đã cài đặt
- [ ] Git đã cài đặt

## 🔧 Backend Setup

- [ ] `cd backend && npm install` chạy thành công
- [ ] File `backend/.env` đã được tạo với đầy đủ thông tin
- [ ] File `backend/src/config/firebase-service-account.json` tồn tại
- [ ] `npm run start:dev` chạy không lỗi
- [ ] Backend chạy tại http://localhost:3001
- [ ] Console hiển thị "Firebase Admin SDK initialized successfully"

## 🎨 Frontend Setup

- [ ] `cd frontend && npm install` chạy thành công
- [ ] File `frontend/.env.local` đã được cập nhật
- [ ] Project ID trong `.env.local` là `monimove-6cd1d`
- [ ] API URL là `http://localhost:3001/api`
- [ ] `npm run dev` chạy không lỗi
- [ ] Frontend chạy tại http://localhost:3000

## 🔥 Firebase Configuration

- [ ] Firebase project đã tạo (Project ID: monimove-6cd1d)
- [ ] Firebase Authentication đã bật
- [ ] Email/Password provider đã enable
- [ ] Google OAuth provider đã enable
- [ ] Firestore Database đã tạo
- [ ] Firestore rules cho phép authenticated reads/writes
- [ ] Service account key đã download
- [ ] Service account key đặt đúng vị trí trong backend

## 🌐 Testing Kết Nối

### Backend Connection Test

- [ ] Mở http://localhost:3001 trong browser
- [ ] Mở http://localhost:3001/api trong browser
- [ ] Cả 2 endpoints trả về response (không phải error page)

### Frontend Connection Test

- [ ] Mở http://localhost:3000 trong browser
- [ ] Trang web load thành công (không có lỗi CORS)
- [ ] Backend Status indicator hiển thị ở góc phải dưới
- [ ] Backend Status indicator màu XANH (🟢)
- [ ] F12 → Console: không có lỗi "Failed to fetch"

## 🔐 Testing Authentication

### Đăng Ký Tài Khoản Mới

- [ ] Click button "Đăng nhập"
- [ ] Click "Chưa có tài khoản? Đăng ký ngay"
- [ ] Nhập họ tên: "Test User"
- [ ] Nhập email: "test@example.com"
- [ ] Nhập password: "123456" (tối thiểu 6 ký tự)
- [ ] Nhập xác nhận password: "123456"
- [ ] Click "Đăng ký tài khoản"
- [ ] Không có lỗi hiển thị
- [ ] Alert "Đăng ký tài khoản thành công!" xuất hiện
- [ ] Redirect về /HomePage

### Kiểm Tra Firestore

- [ ] Mở Firebase Console
- [ ] Vào Firestore Database
- [ ] Collection `users` đã được tạo
- [ ] Document với ID là email đã tạo (test@example.com)
- [ ] Document chứa các fields:
  - [ ] email
  - [ ] name
  - [ ] avatar
  - [ ] role (giá trị: "user")
  - [ ] createdAt

### Đăng Nhập Email/Password

- [ ] Logout (nếu đang logged in)
- [ ] Click "Đăng nhập"
- [ ] Nhập email: "test@example.com"
- [ ] Nhập password: "123456"
- [ ] Click "Đăng nhập hệ thống"
- [ ] Không có lỗi
- [ ] Redirect về /HomePage
- [ ] localStorage có các keys:
  - [ ] firebase_token
  - [ ] user_role
  - [ ] user_name
  - [ ] user_email

### Đăng Nhập Google OAuth

- [ ] Logout
- [ ] Click "Đăng nhập"
- [ ] Click "Đăng nhập / Đăng ký bằng Google"
- [ ] Popup Google login xuất hiện
- [ ] Chọn tài khoản Google
- [ ] Không có lỗi
- [ ] Redirect về /HomePage
- [ ] Kiểm tra Firestore: user mới được tạo với email Google

## 🐛 Error Handling Test

### Test Lỗi Backend Offline

- [ ] Stop backend (Ctrl+C trong terminal backend)
- [ ] Reload frontend (F5)
- [ ] Backend Status indicator chuyển màu ĐỎ (🔴) và nhấp nháy
- [ ] Click vào indicator
- [ ] Panel hiển thị "Backend Offline"
- [ ] Hiển thị hướng dẫn khởi động backend
- [ ] Click "Đăng nhập"
- [ ] Nhập thông tin và submit
- [ ] Lỗi hiển thị: "Backend không phản hồi..."
- [ ] Start lại backend
- [ ] Backend Status indicator chuyển lại màu XANH

### Test Lỗi Đăng Nhập Sai

- [ ] Click "Đăng nhập"
- [ ] Nhập email: "wrong@example.com"
- [ ] Nhập password: "wrongpassword"
- [ ] Click "Đăng nhập"
- [ ] Lỗi hiển thị: "Email hoặc mật khẩu không đúng"
- [ ] Error message rõ ràng, không phải raw Firebase error

### Test Validation

- [ ] Đăng ký với mật khẩu < 6 ký tự
  - [ ] Lỗi: "Mật khẩu phải chứa ít nhất 6 ký tự"
- [ ] Đăng ký với email không hợp lệ
  - [ ] Lỗi: "Email không hợp lệ"
- [ ] Đăng ký với mật khẩu xác nhận không khớp
  - [ ] Lỗi: "Mật khẩu xác nhận không khớp"
- [ ] Đăng ký với email đã tồn tại
  - [ ] Lỗi: "Email này đã được sử dụng..."

## 📊 Console Logs Test

### Backend Console (khi chạy npm run start:dev)

Kiểm tra các logs sau xuất hiện:

- [ ] "🚀 Backend đang chạy tại: http://localhost:3001"
- [ ] "📡 API endpoint: http://localhost:3001/api"
- [ ] "✅ Firebase Admin SDK initialized successfully..."

Khi có user đăng nhập:

- [ ] "[DB] Người dùng cũ đăng nhập: email@example.com..." (nếu user đã tồn tại)
- [ ] "[DB] Đã tự động tạo bản ghi tài khoản mới..." (nếu user mới)

### Frontend Console (F12)

Kiểm tra các logs sau:

- [ ] "🔥 Firebase initialized for Project ID: monimove-6cd1d"
- [ ] "✅ Backend is online at: http://localhost:3001/api"

Khi đăng nhập:

- [ ] "🔐 Đang xác thực token với backend: http://localhost:3001/api"
- [ ] "✅ Xác thực thành công: {success: true, user: {...}}"

Không có các logs lỗi:

- [ ] KHÔNG có "Failed to fetch"
- [ ] KHÔNG có "CORS error"
- [ ] KHÔNG có "auth/..." errors chưa được handle

## 🔒 Security Checklist

- [ ] Private key KHÔNG được commit lên Git
- [ ] File `.env` có trong `.gitignore`
- [ ] File `.env.local` có trong `.gitignore`
- [ ] Service account JSON có trong `.gitignore`
- [ ] Firebase rules được cấu hình đúng
- [ ] Backend API có authentication guard
- [ ] Sensitive data không được log ra console (production)

## 📱 UI/UX Checklist

- [ ] Login modal hiển thị đúng
- [ ] Form inputs có validation
- [ ] Loading state hiển thị khi submit
- [ ] Error messages rõ ràng và dễ hiểu (tiếng Việt)
- [ ] Success messages hiển thị
- [ ] Transitions/animations mượt mà
- [ ] Responsive trên mobile
- [ ] Backend Status indicator không che khuất UI quan trọng

## 🚀 Production Ready Checklist

- [ ] Tất cả tests trên pass
- [ ] No console errors trong production build
- [ ] Environment variables đã được setup cho production
- [ ] Firebase security rules đã được review
- [ ] Backend deployed và accessible
- [ ] Frontend deployed và accessible
- [ ] HTTPS enabled
- [ ] CORS configured correctly for production domain
- [ ] Rate limiting enabled
- [ ] Monitoring/logging setup

---

## 📊 Scoring

**Tổng số items:** ~100+

**Pass threshold:** 95% (chỉ thiếu các items optional)

**Kết quả:**
- ✅ 95-100%: Excellent - Production ready
- ⚠️ 85-94%: Good - Cần fix một vài issues
- ❌ < 85%: Needs work - Có vấn đề cần giải quyết

---

## 🆘 Nếu Có Lỗi

1. ✅ Đọc error message kỹ
2. ✅ Kiểm tra console logs (F12)
3. ✅ Kiểm tra backend terminal logs
4. ✅ Đọc [FIX_SUMMARY.md](./FIX_SUMMARY.md)
5. ✅ Đọc [SETUP_GUIDE.md](./SETUP_GUIDE.md)
6. ✅ Check Backend Status indicator
7. ✅ Restart cả frontend và backend
8. ✅ Clear browser cache
9. ✅ Kiểm tra `.env` files

---

**Last updated:** 10/06/2026
