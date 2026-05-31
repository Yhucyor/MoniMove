# 🐛 HƯỚNG DẪN DEBUG NÚT ĐĂNG NHẬP

## ❓ Vấn đề: Click nút "Đăng nhập" không hiện modal

Tôi đã thêm **console.log** vào code để debug. Hãy làm theo các bước sau:

---

## 📋 BƯỚC 1: Mở Developer Console

### Trên Chrome/Edge:
1. Nhấn **F12** hoặc **Ctrl + Shift + I**
2. Chọn tab **Console**

### Trên Firefox:
1. Nhấn **F12** hoặc **Ctrl + Shift + K**
2. Chọn tab **Console**

---

## 📋 BƯỚC 2: Kiểm tra Server đang chạy

Mở Terminal và chạy:

```bash
cd d:\IoT_Monitoring_Moving\frontend
npm run dev
```

Truy cập: **http://localhost:3000** (hoặc port khác nếu 3000 đã bị chiếm)

---

## 📋 BƯỚC 3: Click nút "Đăng nhập" và xem Console

Khi bạn click nút, bạn sẽ thấy các log sau trong Console:

### ✅ Nếu hoạt động bình thường:
```
🖱️ Nút Đăng nhập được click!
🔍 isLoginOpen: true
🔍 LoginModal - isOpen: true
```

### ❌ Nếu KHÔNG thấy log gì:
**Nguyên nhân**: JavaScript bị lỗi hoặc không load

**Giải pháp**:
1. Kiểm tra có lỗi đỏ trong Console không
2. Refresh lại trang (Ctrl + F5)
3. Xóa cache browser

### ❌ Nếu thấy log nhưng modal KHÔNG hiện:
**Nguyên nhân**: CSS bị lỗi hoặc z-index thấp

**Giải pháp**: Xem Bước 4

---

## 📋 BƯỚC 4: Kiểm tra Modal có render không

Trong Console, gõ lệnh sau:

```javascript
document.querySelector('[class*="fixed inset-0"]')
```

### ✅ Nếu trả về element:
Modal đã render nhưng bị ẩn → Vấn đề CSS

### ❌ Nếu trả về null:
Modal không render → Vấn đề logic

---

## 🔧 GIẢI PHÁP NHANH

### Giải pháp 1: Kiểm tra z-index

Modal có `z-50`, nhưng background blur có thể che mất. Thử tăng z-index:

```typescript
// Trong LoginModal.tsx
<div className="fixed inset-0 bg-slate-900/20 backdrop-blur-[4px] flex items-center justify-center z-[9999] p-4">
```

### Giải pháp 2: Kiểm tra overflow

Background có `overflow-hidden`, có thể ảnh hưởng. Thử thêm:

```typescript
// Trong page.tsx
{isLoginOpen && (
  <div className="fixed inset-0 z-[9999]">
    <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
  </div>
)}
```

### Giải pháp 3: Test với modal đơn giản

Thay thế LoginModal tạm thời:

```typescript
{isLoginOpen && (
  <div 
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
    onClick={() => setIsLoginOpen(false)}
  >
    <div className="bg-white p-8 rounded-lg">
      <h2 className="text-2xl font-bold">Modal Test</h2>
      <p>Nếu thấy cái này thì modal hoạt động!</p>
      <button 
        onClick={() => setIsLoginOpen(false)}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
      >
        Đóng
      </button>
    </div>
  </div>
)}
```

---

## 📊 CHECKLIST DEBUG

Hãy kiểm tra từng mục:

- [ ] Server đang chạy (npm run dev)
- [ ] Truy cập đúng URL (localhost:3000)
- [ ] Mở Developer Console (F12)
- [ ] Click nút "Đăng nhập"
- [ ] Thấy log "🖱️ Nút Đăng nhập được click!"
- [ ] Thấy log "🔍 isLoginOpen: true"
- [ ] Thấy log "🔍 LoginModal - isOpen: true"
- [ ] Modal hiện ra

---

## 🆘 NẾU VẪN KHÔNG ĐƯỢC

Hãy cho tôi biết:

1. **Bạn thấy log gì trong Console?** (copy toàn bộ)
2. **Có lỗi đỏ nào không?** (chụp màn hình)
3. **Khi inspect element, có thấy div với class "fixed inset-0" không?**
4. **Browser bạn đang dùng?** (Chrome, Firefox, Edge, Safari?)

---

## 🎯 FILE TEST ĐƠN GIẢN

Tôi đã tạo file **test-login.html** để test modal cơ bản.

Mở file này bằng browser:
```
d:\IoT_Monitoring_Moving\frontend\test-login.html
```

Nếu file test hoạt động → Vấn đề nằm ở React/Next.js
Nếu file test KHÔNG hoạt động → Vấn đề nằm ở browser/cache
