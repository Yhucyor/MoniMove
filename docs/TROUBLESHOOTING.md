# 🔧 KHẮC PHỤC LỖI TRUY CẬP

## ❓ Bạn đang gặp lỗi gì?

Hãy chọn tình huống phù hợp:

---

## 1️⃣ Không Mở Được Trang (Blank/Loading Mãi)

### Nguyên nhân:
- Server chưa chạy
- Port bị chặn
- Browser cache

### Giải pháp:

#### Bước 1: Kiểm tra server
Mở Terminal và chạy:
```bash
cd d:\IoT_Monitoring_Moving\frontend
npm run dev
```

Bạn sẽ thấy:
```
▲ Next.js 16.2.6 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://192.168.100.111:3000
✓ Ready in 1303ms
```

#### Bước 2: Truy cập đúng URL
- **Local**: http://localhost:3000
- **Hoặc**: http://127.0.0.1:3000

#### Bước 3: Xóa cache browser
- **Chrome/Edge**: Ctrl + Shift + Delete → Xóa cache
- **Hoặc**: Ctrl + F5 (hard refresh)

---

## 2️⃣ Lỗi "Cannot GET /" hoặc 404

### Nguyên nhân:
- Truy cập sai URL
- Build bị lỗi

### Giải pháp:

#### Kiểm tra URL:
✅ Đúng: `http://localhost:3000`
❌ Sai: `http://localhost:3000/index.html`

#### Rebuild:
```bash
cd d:\IoT_Monitoring_Moving\frontend
npm run build
npm run dev
```

---

## 3️⃣ Trang Trắng (White Screen)

### Nguyên nhân:
- JavaScript error
- Component bị lỗi

### Giải pháp:

#### Bước 1: Mở Console
Nhấn **F12** → Tab **Console**

#### Bước 2: Xem lỗi
Tìm dòng màu đỏ, thường là:
- `Module not found`
- `Cannot read property`
- `Unexpected token`

#### Bước 3: Sửa lỗi
Copy lỗi và gửi cho tôi, tôi sẽ giúp bạn sửa!

---

## 4️⃣ Lỗi "Port 3000 is already in use"

### Nguyên nhân:
Port 3000 đã bị chiếm bởi process khác

### Giải pháp:

#### Cách 1: Kill process cũ
```bash
# Tìm PID
netstat -ano | findstr :3000

# Kill process (thay 27884 bằng PID của bạn)
taskkill /PID 27884 /F
```

#### Cách 2: Dùng port khác
```bash
# Chạy trên port 3001
npm run dev -- -p 3001
```

Sau đó truy cập: http://localhost:3001

---

## 5️⃣ Bản Đồ Không Hiển Thị

### Nguyên nhân:
- Leaflet chưa load
- Internet bị chặn
- CSS chưa load

### Giải pháp:

#### Kiểm tra Console (F12):
Tìm lỗi:
- `Failed to load resource`
- `tile.openstreetmap.org`

#### Kiểm tra Internet:
Thử mở: https://www.openstreetmap.org

#### Thử map style khác:
Click vào panel "Map Style" → Chọn "Satellite" hoặc "Dark"

---

## 6️⃣ Nút Đăng Nhập Không Hoạt Động

### Nguyên nhân:
- Modal bị che
- JavaScript error
- State không update

### Giải pháp:

#### Bước 1: Xem Console
Nhấn F12 → Tìm log:
```
🖱️ Nút Đăng nhập được click!
🔍 isLoginOpen: true
```

#### Bước 2: Nếu không thấy log
→ JavaScript bị lỗi, xem lỗi đỏ trong Console

#### Bước 3: Nếu thấy log nhưng modal không hiện
→ Vấn đề CSS, làm theo file `QUICK_FIX_LOGIN.md`

---

## 7️⃣ Lỗi Build

### Lỗi: "Module not found"
```bash
# Cài lại dependencies
cd d:\IoT_Monitoring_Moving\frontend
npm install
```

### Lỗi: "TypeScript error"
```bash
# Xóa cache và rebuild
rm -rf .next
npm run build
```

### Lỗi: "Out of memory"
```bash
# Tăng memory cho Node.js
set NODE_OPTIONS=--max-old-space-size=4096
npm run build
```

---

## 8️⃣ Lỗi Firebase

### Lỗi: "Firebase: Error (auth/invalid-api-key)"

#### Nguyên nhân:
Biến môi trường chưa được set

#### Giải pháp:
Kiểm tra file `.env.local` có tồn tại không:
```bash
cd d:\IoT_Monitoring_Moving\frontend
dir .env.local
```

Nếu không có, tạo file `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAQGHnSICLu-1QpOItRIYen0y5AxPbIMtc
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=monimove-6cd1d.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=monimove-6cd1d
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=monimove-6cd1d.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=924125576856
NEXT_PUBLIC_FIREBASE_APP_ID=1:924125576856:web:853fae140460e139de1aed
```

Sau đó restart server:
```bash
# Ctrl + C để stop
npm run dev
```

---

## 9️⃣ Lỗi "Cannot find module"

### Lỗi: Cannot find module 'lucide-react'

```bash
cd d:\IoT_Monitoring_Moving\frontend
npm install lucide-react
```

### Lỗi: Cannot find module 'leaflet'

```bash
npm install leaflet react-leaflet
npm install --save-dev @types/leaflet
```

---

## 🔟 Lỗi Khác

### Lỗi: "Hydration failed"
```bash
# Xóa .next và rebuild
rm -rf .next
npm run dev
```

### Lỗi: "EADDRINUSE"
```bash
# Port đã bị chiếm, dùng port khác
npm run dev -- -p 3001
```

### Lỗi: "ENOENT: no such file or directory"
```bash
# File bị thiếu, cài lại dependencies
rm -rf node_modules
npm install
```

---

## 📞 CHECKLIST DEBUG

Hãy kiểm tra từng mục:

- [ ] Server đang chạy? (`npm run dev`)
- [ ] Truy cập đúng URL? (`http://localhost:3000`)
- [ ] Mở Console (F12) xem có lỗi không?
- [ ] Internet có hoạt động không?
- [ ] File `.env.local` có tồn tại không?
- [ ] Dependencies đã cài đủ chưa? (`npm install`)
- [ ] Đã xóa cache browser? (Ctrl + F5)
- [ ] Port 3000 có bị chiếm không?

---

## 🆘 VẪN KHÔNG ĐƯỢC?

Hãy cho tôi biết:

1. **Bạn thấy gì trên màn hình?**
   - Trang trắng?
   - Loading mãi?
   - Lỗi gì?

2. **Console có lỗi gì?** (F12 → Console)
   - Copy toàn bộ lỗi đỏ
   - Chụp màn hình

3. **Server có chạy không?**
   - Copy output của `npm run dev`

4. **URL bạn đang truy cập?**
   - `http://localhost:3000`?
   - Hay URL khác?

---

## 🚀 KHỞI ĐỘNG LẠI TỪ ĐẦU

Nếu mọi thứ rối, làm lại từ đầu:

```bash
# 1. Stop server (Ctrl + C)

# 2. Xóa cache
cd d:\IoT_Monitoring_Moving\frontend
rm -rf .next
rm -rf node_modules

# 3. Cài lại dependencies
npm install

# 4. Build
npm run build

# 5. Chạy dev server
npm run dev

# 6. Truy cập
# Mở browser: http://localhost:3000
```

---

## 📱 TEST NHANH

Để test xem có vấn đề gì, mở file test:
```
d:\IoT_Monitoring_Moving\frontend\test-login.html
```

Nếu file test hoạt động → Vấn đề nằm ở React/Next.js
Nếu file test KHÔNG hoạt động → Vấn đề nằm ở browser

---

**Bạn đang gặp lỗi nào? Hãy mô tả chi tiết để tôi giúp bạn!** 🔧
