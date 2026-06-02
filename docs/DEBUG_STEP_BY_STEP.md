# 🔍 DEBUG TỪNG BƯỚC - "CHẠY NHƯNG KHÔNG VÀO ĐƯỢC"

## 🎯 TÌNH HUỐNG: Server chạy nhưng truy cập không được

---

## BƯỚC 1: KIỂM TRA SERVER

### Chạy lệnh:
```bash
cd d:\IoT_Monitoring_Moving\frontend
npm run dev
```

### Bạn phải thấy:
```
▲ Next.js 16.2.6 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://192.168.100.111:3000
- Environments: .env.local
✓ Ready in 1303ms
```

### ✅ Nếu thấy "Ready" → Server OK, chuyển Bước 2
### ❌ Nếu có lỗi đỏ → Copy lỗi và gửi cho tôi

---

## BƯỚC 2: TEST TRANG ĐƠN GIẢN

### Truy cập trang test:
```
http://localhost:3000/test
```

### Kết quả:

#### ✅ Nếu thấy "TEST THÀNH CÔNG!"
→ **Server hoạt động bình thường!**
→ Vấn đề nằm ở trang chủ (page.tsx)
→ Chuyển sang **BƯỚC 3**

#### ❌ Nếu KHÔNG thấy gì hoặc lỗi
→ **Vấn đề kết nối hoặc browser**
→ Chuyển sang **BƯỚC 4**

---

## BƯỚC 3: DEBUG TRANG CHỦ

Nếu `/test` hoạt động nhưng `/` không hoạt động:

### A. Mở Console
1. Truy cập: http://localhost:3000
2. Nhấn **F12**
3. Tab **Console**
4. Tìm lỗi màu đỏ

### B. Các lỗi thường gặp:

#### Lỗi 1: "Hydration failed"
```
Error: Hydration failed because the initial UI does not match...
```

**Giải pháp:**
```bash
# Xóa cache
rm -rf .next
npm run dev
```

#### Lỗi 2: "Cannot read property of undefined"
```
TypeError: Cannot read property 'xxx' of undefined
```

**Giải pháp:** Component bị lỗi, cần sửa code

#### Lỗi 3: "Module not found"
```
Module not found: Can't resolve 'xxx'
```

**Giải pháp:**
```bash
npm install xxx
```

### C. Thử trang đơn giản

Tạm thời đổi trang chủ thành trang đơn giản:

**Backup file cũ:**
```bash
copy app\page.tsx app\page.tsx.backup
```

**Tạo trang mới đơn giản:**
```typescript
// app/page.tsx
export default function Home() {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>Hello MoniMove!</h1>
      <p>Nếu thấy dòng này, trang chủ đã hoạt động!</p>
    </div>
  );
}
```

**Refresh browser** → Nếu thấy "Hello MoniMove!" → Vấn đề nằm ở code trang chủ phức tạp

---

## BƯỚC 4: DEBUG KẾT NỐI

Nếu cả `/test` cũng không vào được:

### A. Kiểm tra URL

Thử TẤT CẢ các URL này:
- ✅ http://localhost:3000
- ✅ http://127.0.0.1:3000
- ✅ http://192.168.100.111:3000
- ✅ http://[::1]:3000

### B. Kiểm tra Browser

#### Thử browser khác:
- Chrome
- Firefox
- Edge
- Safari (nếu có)

#### Xóa cache:
- **Chrome/Edge**: Ctrl + Shift + Delete
- Chọn "Cached images and files"
- Click "Clear data"

#### Thử Incognito/Private:
- **Chrome**: Ctrl + Shift + N
- **Firefox**: Ctrl + Shift + P

### C. Kiểm tra Firewall

#### Windows Firewall có chặn không?

**Tắt tạm thời để test:**
1. Win + R → `firewall.cpl`
2. Click "Turn Windows Defender Firewall on or off"
3. Chọn "Turn off" (cả 2 mục)
4. Thử truy cập lại
5. **Nhớ bật lại sau khi test!**

### D. Kiểm tra Antivirus

Một số antivirus chặn localhost:
- Kaspersky
- Avast
- AVG
- Norton

**Thử tắt tạm thời để test**

### E. Kiểm tra Proxy

#### Tắt proxy:
1. Win + R → `inetcpl.cpl`
2. Tab "Connections"
3. Click "LAN settings"
4. Bỏ tick "Use a proxy server"
5. OK

### F. Kiểm tra hosts file

Mở file: `C:\Windows\System32\drivers\etc\hosts`

**Phải có dòng:**
```
127.0.0.1       localhost
```

**Không được có:**
```
127.0.0.1       localhost:3000
```

---

## BƯỚC 5: DEBUG PORT

### Kiểm tra port có đang lắng nghe không:

```bash
netstat -ano | findstr :3000
```

**Phải thấy:**
```
TCP    0.0.0.0:3000           0.0.0.0:0              LISTENING
```

### Nếu không thấy:
→ Server không chạy hoặc chạy port khác

### Thử port khác:
```bash
npm run dev -- -p 3001
```

Sau đó truy cập: http://localhost:3001

---

## BƯỚC 6: DEBUG NETWORK

### Kiểm tra kết nối:

```bash
# Ping localhost
ping localhost

# Telnet port 3000
telnet localhost 3000
```

### Nếu ping không được:
→ Vấn đề network stack của Windows

**Giải pháp:**
```bash
# Reset network stack
netsh winsock reset
netsh int ip reset
ipconfig /flushdns

# Restart máy
```

---

## BƯỚC 7: KIỂM TRA LOG CHI TIẾT

### Xem log Next.js:
```bash
cd d:\IoT_Monitoring_Moving\frontend
type .next\dev\logs\next-development.log
```

### Chạy với verbose:
```bash
npm run dev -- --verbose
```

### Xem tất cả request:
Mở tab **Network** trong F12, refresh trang

---

## 🎯 CHECKLIST NHANH

Hãy kiểm tra từng mục:

- [ ] Server có hiện "Ready" không?
- [ ] Trang `/test` có hiển thị không?
- [ ] Console (F12) có lỗi đỏ không?
- [ ] Đã thử browser khác chưa?
- [ ] Đã thử Incognito chưa?
- [ ] Đã xóa cache chưa?
- [ ] Firewall có bật không?
- [ ] Antivirus có chặn không?
- [ ] Proxy có bật không?
- [ ] Đã thử port khác chưa?

---

## 📊 BẢNG CHẨN ĐOÁN

| Triệu chứng | Nguyên nhân | Giải pháp |
|-------------|-------------|-----------|
| Trang trắng hoàn toàn | JavaScript error | Xem Console (F12) |
| Loading mãi | Component bị treo | Xem Console, check code |
| "Can't be reached" | Kết nối bị chặn | Check firewall/antivirus |
| "Cannot GET /" | Routing lỗi | Check Next.js config |
| 404 Not Found | URL sai | Kiểm tra lại URL |
| Trang test OK, trang chủ lỗi | Component trang chủ lỗi | Debug page.tsx |

---

## 🆘 GỬI CHO TÔI

Nếu vẫn không được, hãy gửi cho tôi:

### 1. Screenshot
- Màn hình browser khi truy cập localhost:3000
- Tab Console (F12)
- Tab Network (F12)

### 2. Output
```bash
# Copy toàn bộ output của lệnh này
npm run dev
```

### 3. Kết quả test
- Truy cập http://localhost:3000/test có được không?
- Thử browser nào rồi?
- Thử port khác có được không?

### 4. Thông tin hệ thống
```bash
node --version
npm --version
```

---

## 💡 GIẢI PHÁP CUỐI CÙNG

Nếu tất cả đều thất bại, làm lại từ đầu:

```bash
# 1. Stop server (Ctrl + C)

# 2. Xóa toàn bộ
cd d:\IoT_Monitoring_Moving\frontend
rm -rf .next
rm -rf node_modules
rm -rf package-lock.json

# 3. Cài lại
npm install

# 4. Chạy lại
npm run dev

# 5. Truy cập
http://localhost:3000/test
```

---

**Hãy làm từng bước và cho tôi biết kết quả ở bước nào nhé!** 🔍
