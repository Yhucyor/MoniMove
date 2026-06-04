# 🔧 SỬA LỖI CONSOLE

## 🎯 BẠN ĐANG GẶP LỖI TRONG CONSOLE

Hãy làm theo các bước sau:

---

## BƯỚC 1: XÁC ĐỊNH LỖI

### Copy toàn bộ lỗi màu đỏ trong Console

Các lỗi thường gặp:

### A. Lỗi Import
```
Module not found: Can't resolve '../src/features/auth/LoginModal'
```

**Nguyên nhân:** Đường dẫn import sai

**Giải pháp:** Đã sửa trong code mới

### B. Lỗi Lucide React
```
Module not found: Can't resolve 'lucide-react'
```

**Giải pháp:**
```bash
cd d:\IoT_Monitoring_Moving\frontend
npm install lucide-react
```

### C. Lỗi Hydration
```
Error: Hydration failed because the initial UI does not match
```

**Giải pháp:**
```bash
rm -rf .next
npm run dev
```

### D. Lỗi Window/Document
```
ReferenceError: window is not defined
ReferenceError: document is not defined
```

**Nguyên nhân:** Component cố truy cập window/document trên server

**Giải pháp:** Đã sửa bằng 'use client'

---

## BƯỚC 2: THỬ TRANG ĐƠN GIẢN

Để xác định vấn đề nằm ở đâu, hãy chuyển sang trang đơn giản:

### Cách 1: Dùng file BAT (Nhanh)
Double-click vào:
```
d:\IoT_Monitoring_Moving\frontend\use-simple-page.bat
```

### Cách 2: Thủ công
```bash
cd d:\IoT_Monitoring_Moving\frontend
copy app\page.tsx app\page-complex.tsx.backup
copy app\page-simple.tsx app\page.tsx
```

### Sau đó:
1. **Restart server** (Ctrl+C rồi `npm run dev`)
2. **Truy cập:** http://localhost:3000
3. **Kết quả:**

#### ✅ Nếu thấy "MoniMove Hoạt Động!"
→ Trang đơn giản OK
→ Vấn đề nằm ở trang phức tạp (LoginModal, MapComponent, etc.)
→ Chuyển sang **BƯỚC 3**

#### ❌ Nếu vẫn lỗi
→ Vấn đề nghiêm trọng hơn
→ Chuyển sang **BƯỚC 4**

---

## BƯỚC 3: SỬA TRANG PHỨC TẠP

Nếu trang đơn giản hoạt động, vấn đề nằm ở:

### A. LoginModal
Có thể import path sai hoặc component lỗi

**Giải pháp:** Tạm thời comment LoginModal

Mở file: `app/page.tsx`

```typescript
// Comment dòng import
// import LoginModal from '../src/features/auth/LoginModal';

// Comment dòng gọi component
// <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
```

**Restart server** → Nếu OK → Vấn đề nằm ở LoginModal

### B. Lucide React Icons
Có thể chưa cài package

```bash
npm install lucide-react
```

### C. Tailwind CSS
Có thể CSS chưa load

Kiểm tra file: `app/globals.css` có tồn tại không

---

## BƯỚC 4: SỬA LỖI NGHIÊM TRỌNG

Nếu cả trang đơn giản cũng lỗi:

### A. Xóa cache và rebuild
```bash
cd d:\IoT_Monitoring_Moving\frontend
rm -rf .next
rm -rf node_modules
npm install
npm run dev
```

### B. Kiểm tra file quan trọng

#### 1. app/layout.tsx
Phải có và không lỗi

#### 2. app/globals.css
Phải có

#### 3. tailwind.config.ts
Phải có

#### 4. next.config.ts
Phải có

### C. Kiểm tra Node version
```bash
node --version
```

Phải >= 18.17.0

Nếu thấp hơn, cập nhật Node.js

---

## BƯỚC 5: CÀI LẠI TỪ ĐẦU

Nếu tất cả thất bại:

```bash
# 1. Backup code quan trọng
copy app\page.tsx page-backup.tsx
copy src\features\auth\LoginModal.tsx LoginModal-backup.tsx

# 2. Xóa toàn bộ
cd d:\IoT_Monitoring_Moving\frontend
rm -rf .next
rm -rf node_modules
rm -rf package-lock.json

# 3. Cài lại
npm install

# 4. Cài dependencies bổ sung
npm install lucide-react
npm install leaflet react-leaflet
npm install --save-dev @types/leaflet

# 5. Chạy
npm run dev
```

---

## 📋 CHECKLIST DEBUG

- [ ] Đã copy lỗi từ Console chưa?
- [ ] Đã thử trang đơn giản chưa?
- [ ] Đã cài lucide-react chưa?
- [ ] Đã xóa .next chưa?
- [ ] Đã restart server chưa?
- [ ] Đã thử browser khác chưa?
- [ ] Node version >= 18.17.0?

---

## 🆘 GỬI CHO TÔI

Nếu vẫn lỗi, hãy gửi:

### 1. Lỗi Console (quan trọng nhất!)
```
Copy toàn bộ lỗi màu đỏ trong Console (F12)
```

### 2. Output npm run dev
```
Copy toàn bộ output khi chạy npm run dev
```

### 3. Kết quả test
- Trang đơn giản có hoạt động không?
- Trang /test có hoạt động không?

### 4. Thông tin hệ thống
```bash
node --version
npm --version
```

---

## 💡 CÁC LỖI PHỔ BIẾN VÀ GIẢI PHÁP

| Lỗi | Giải pháp |
|-----|-----------|
| Module not found: lucide-react | `npm install lucide-react` |
| Module not found: leaflet | `npm install leaflet react-leaflet` |
| Hydration failed | `rm -rf .next` và restart |
| window is not defined | Thêm 'use client' ở đầu file |
| Cannot find module '../src/...' | Sửa đường dẫn import |
| Unexpected token | Lỗi syntax, check code |
| ENOENT: no such file | File bị thiếu, cài lại |

---

## 🎯 GIẢI PHÁP NHANH NHẤT

Nếu bạn muốn chạy ngay:

1. **Chuyển sang trang đơn giản:**
   ```
   Double-click: use-simple-page.bat
   ```

2. **Restart server:**
   ```
   Ctrl+C
   npm run dev
   ```

3. **Truy cập:**
   ```
   http://localhost:3000
   ```

4. **Nếu OK:**
   - Trang đơn giản hoạt động
   - Tôi sẽ sửa trang phức tạp cho bạn
   - Gửi cho tôi lỗi Console để tôi sửa chính xác

---

**Hãy copy lỗi Console (màu đỏ) và gửi cho tôi!** 🔍
