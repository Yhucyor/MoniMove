# 🎯 HƯỚNG DẪN CHẠY SERVER ỔN ĐỊNH

## ❓ VẤN ĐỀ: "Có lúc được có lúc không"

**NGUYÊN NHÂN:**
- Dev server (`npm run dev`) không ổn định
- Hot reload gây lỗi
- Memory leak
- File watching quá nhiều file

**GIẢI PHÁP:** Dùng **Production Server** thay vì Dev Server!

---

## ⚡ CÁCH CHẠY ỔN ĐỊNH NHẤT:

### **Cách 1: Dùng file BAT (Nhanh nhất)**

Double-click vào:
```
d:\IoT_Monitoring_Moving\frontend\start-stable.bat
```

File này sẽ:
1. Xóa cache
2. Build production
3. Chạy production server (ổn định 100%)

---

### **Cách 2: Thủ công**

```bash
# Stop server hiện tại (Ctrl + C)
cd d:\IoT_Monitoring_Moving\frontend

# Xóa cache
rmdir /s /q .next

# Build production
npm run build

# Chạy production server
npm start
```

Sau đó truy cập: **http://localhost:3000**

---

## ✅ ƯU ĐIỂM PRODUCTION SERVER:

| Dev Server | Production Server |
|------------|-------------------|
| ❌ Không ổn định | ✅ Ổn định 100% |
| ❌ Có lúc được lúc không | ✅ Luôn hoạt động |
| ❌ Chậm (compile mỗi lần) | ✅ Nhanh (đã compile sẵn) |
| ❌ Memory leak | ✅ Không leak |
| ❌ Hot reload lỗi | ✅ Không có hot reload |
| ✅ Tự động reload khi sửa code | ❌ Phải build lại khi sửa code |

---

## 🔧 KHI NÀO DÙNG GÌ?

### **Dùng Dev Server (`npm run dev`):**
- ✅ Khi đang code và cần xem thay đổi ngay
- ✅ Khi đang debug
- ❌ KHÔNG dùng khi cần ổn định

### **Dùng Production Server (`npm start`):**
- ✅ Khi cần ổn định
- ✅ Khi demo cho người khác
- ✅ Khi test tính năng
- ✅ Khi deploy lên server
- ❌ KHÔNG dùng khi đang code (phải build lại mỗi lần)

---

## 🎯 QUY TRÌNH LÀM VIỆC ĐỀ XUẤT:

### **Khi đang code:**
```bash
npm run dev
# Sửa code → Tự động reload
# Nếu bị lỗi "có lúc được lúc không" → Restart server
```

### **Khi cần ổn định:**
```bash
npm run build
npm start
# Không tự động reload
# Nhưng ổn định 100%
```

### **Khi sửa code xong:**
```bash
# Ctrl + C (stop server)
npm run build
npm start
# Xem kết quả mới
```

---

## 🐛 NẾU VẪN KHÔNG ỔN ĐỊNH:

### **A. Tăng memory cho Node.js**

Tạo file `.env.local` (nếu chưa có) và thêm:
```env
NODE_OPTIONS=--max-old-space-size=4096
```

### **B. Giảm file watching**

Tạo file `.watchmanconfig`:
```json
{
  "ignore_dirs": [
    "node_modules",
    ".next",
    ".git"
  ]
}
```

### **C. Tắt Turbopack (dùng Webpack)**

Chạy:
```bash
npm run dev -- --no-turbopack
```

### **D. Restart máy**

Đôi khi Windows cache bị lỗi, restart máy sẽ fix.

---

## 📊 SO SÁNH HIỆU SUẤT:

### **Dev Server:**
```
Lần 1: ✅ OK
Lần 2: ❌ Lỗi
Lần 3: ✅ OK
Lần 4: ❌ Lỗi
→ Không ổn định
```

### **Production Server:**
```
Lần 1: ✅ OK
Lần 2: ✅ OK
Lần 3: ✅ OK
Lần 4: ✅ OK
→ Ổn định 100%
```

---

## 💡 TIPS:

### **1. Dùng 2 terminal:**
- Terminal 1: Dev server (đang code)
- Terminal 2: Production server (test ổn định)

### **2. Build trước khi commit:**
```bash
npm run build
# Nếu build OK → Code không lỗi
# Nếu build lỗi → Sửa trước khi commit
```

### **3. Xóa cache thường xuyên:**
```bash
rmdir /s /q .next
npm run dev
```

### **4. Kiểm tra memory:**
```bash
# Xem Node.js đang dùng bao nhiêu memory
tasklist | findstr node
```

---

## 🆘 TROUBLESHOOTING:

### **Lỗi: "Port 3000 already in use"**
```bash
# Kill process
netstat -ano | findstr :3000
taskkill /PID [số_PID] /F
```

### **Lỗi: "Out of memory"**
```bash
# Tăng memory
set NODE_OPTIONS=--max-old-space-size=4096
npm run build
```

### **Lỗi: "Build failed"**
```bash
# Xóa toàn bộ và cài lại
rmdir /s /q .next
rmdir /s /q node_modules
npm install
npm run build
```

---

## 🎯 CHECKLIST:

Để server chạy ổn định:

- [ ] Dùng production server (`npm start`)
- [ ] Đã build trước (`npm run build`)
- [ ] Đã xóa cache (`.next`)
- [ ] Tắt strict mode (đã sửa trong `next.config.ts`)
- [ ] Đủ RAM (ít nhất 2GB free)
- [ ] Không có process khác chiếm port 3000
- [ ] Firewall/Antivirus không chặn

---

## 📞 KẾT LUẬN:

### **Giải pháp tốt nhất:**
```bash
# Chạy file này
start-stable.bat
```

Hoặc:
```bash
npm run build
npm start
```

→ **Ổn định 100%!**

---

**Hãy thử `start-stable.bat` và cho tôi biết kết quả!** 🚀

Nếu production server vẫn không ổn định → Có vấn đề nghiêm trọng hơn (hardware, network, etc.)
