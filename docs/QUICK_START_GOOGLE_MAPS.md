# 🚀 Quick Start - Google Maps (5 phút)

## Bước 1: Lấy API Key (2 phút)

1. Vào: https://console.cloud.google.com/
2. Tạo project mới
3. Enable 3 APIs:
   - Maps JavaScript API
   - Directions API
   - Places API
4. Tạo API Key tại: Credentials
5. Copy API key

## Bước 2: Setup (1 phút)

### Cách 1: Dùng script (Khuyến nghị)
```bash
cd frontend
setup-google-maps.bat
# Nhập API key khi được hỏi
```

### Cách 2: Thủ công
Mở `frontend/.env.local` và thêm:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

## Bước 3: Chạy (2 phút)

```bash
cd frontend
npm run build
npm start
```

Truy cập: http://localhost:3000
- Login: `admin` / `admin`
- Vào tab **Monitor**
- Enjoy Google Maps! 🎉

---

## 🎯 Tính năng chính

✅ **Directions API** - Đường đi thực tế  
✅ **Places Search** - Tìm kiếm địa điểm  
✅ **4 Map Styles** - Standard, Silver, Night, Retro  
✅ **Real-time** - Cập nhật vị trí mỗi 5s  
✅ **Safe Zone** - Vùng an toàn 500m  

---

## 🎮 Controls

| Vị trí | Chức năng |
|--------|-----------|
| **Top Center** | Search địa điểm |
| **Top Left** | Thông tin thiết bị |
| **Top Right** | Đổi style bản đồ |
| **Bottom Left** | Toggle route/safe zone |
| **Bottom Right** | Tọa độ hiện tại |

---

## 💰 Chi phí

**MIỄN PHÍ** - $200 credit/tháng từ Google (đủ dùng)

---

## 🐛 Lỗi thường gặp

### "API Key Required"
→ Chưa thêm API key vào `.env.local`

### "Can't load Google Maps"
→ Chưa enable đủ 3 APIs

### "RefererNotAllowed"
→ Thêm `http://localhost:3000/*` vào API restrictions

---

## 📚 Docs đầy đủ

Xem: `GOOGLE_MAPS_INTEGRATION.md`
