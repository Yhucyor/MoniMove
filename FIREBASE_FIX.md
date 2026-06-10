# 🔥 Fix Firebase Auth Error: invalid-continue-uri

## ❌ Lỗi
```
Firebase: Error (auth/invalid-continue-uri)
```

## ✅ Giải Pháp

### Bước 1: Truy cập Firebase Console
1. Mở https://console.firebase.google.com/
2. Chọn project: **monimove-6cd1d**

### Bước 2: Thêm Authorized Domains
1. Vào **Authentication** (sidebar trái)
2. Click tab **Settings**
3. Scroll xuống phần **Authorized domains**
4. Click **Add domain**
5. Thêm: `localhost`
6. Click **Add**

### Bước 3: Kiểm tra OAuth Settings
1. Vào **Authentication** > **Sign-in method**
2. Click vào **Google** provider
3. Đảm bảo:
   - ✅ Enabled = ON
   - ✅ Web SDK configuration có đúng

### Bước 4: Restart Frontend
```bash
# Stop frontend (Ctrl+C)
# Start lại
cd frontend
npm run dev
```

## 🎯 Test Lại
1. Refresh browser (F5)
2. Click "Đăng nhập bằng Google"
3. Lỗi sẽ biến mất

## 📝 Authorized Domains Cần Có
- `localhost` (cho development)
- `monimove-6cd1d.firebaseapp.com` (default)
- Domain production của bạn (nếu có)
