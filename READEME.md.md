# 🚀 IoT Monitoring System — Realtime Motion & GPS Tracking Platform

> **IoT Monitoring System** là nền tảng Web IoT realtime dùng để giám sát chuyển động, vị trí GPS và mô phỏng trạng thái thiết bị bằng Unity WebGL. Hệ thống hỗ trợ ESP32 + MPU6050 + GPS, realtime dashboard, tracking map, phân quyền Admin/User và kiến trúc production-grade.

**Phát triển bởi:** IoT Development Team  
**Trạng thái dự án:** 🟡 In Development  
**Tech Stack:** Next.js + NestJS + Firebase + Socket.IO + Unity WebGL + MQTT

---

# 📋 Mục lục

1. [Tổng quan hệ thống](#1-tổng-quan-hệ-thống)
2. [Tính năng nổi bật](#2-tính-năng-nổi-bật)
3. [Kiến trúc hệ thống](#3-kiến-trúc-hệ-thống)
4. [Technology Stack](#4-technology-stack)
5. [Cấu trúc thư mục](#5-cấu-trúc-thư-mục)
6. [Thành viên & Phân công](#6-thành-viên--phân-công)
7. [Task Breakdown & Timeline](#7-task-breakdown--timeline)
8. [Hướng dẫn cài đặt](#8-hướng-dẫn-cài-đặt)
9. [Biến môi trường](#9-biến-môi-trường)
10. [Chạy ứng dụng](#10-chạy-ứng-dụng)
11. [Quy trình làm việc & Git Flow](#11-quy-trình-làm-việc--git-flow)
12. [MQTT Topic Structure](#12-mqtt-topic-structure)
13. [Realtime Architecture](#13-realtime-architecture)
14. [Database Structure](#14-database-structure)
15. [Deployment](#15-deployment)
16. [Troubleshooting](#16-troubleshooting)

---

# 1. Tổng quan hệ thống

Hệ thống giải quyết bài toán:

> _"Giám sát realtime chuyển động và vị trí thiết bị IoT từ xa, đồng thời mô phỏng trạng thái vật lý trực quan bằng 3D WebGL."_

Nền tảng cho phép:

- ESP32 gửi dữ liệu MPU6050 + GPS qua MQTT
- Backend xử lý telemetry realtime
- Frontend hiển thị dashboard trực quan
- Unity WebGL mô phỏng góc nghiêng và chuyển động
- Tracking GPS realtime trên bản đồ
- Quản lý nhiều thiết bị và nhiều người dùng
- Phân quyền Admin/User

---

# 2. Tính năng nổi bật

## 🌐 Dashboard Realtime

- Theo dõi trạng thái thiết bị
- Online/Offline detection
- Pitch / Roll / Yaw
- Battery monitoring
- Live telemetry charts

## 🗺 GPS Tracking

- Realtime location tracking
- Route polyline
- History replay
- Geofence support

## 🎮 Unity WebGL Simulation

- 3D realtime visualization
- MPU6050 orientation simulation
- Rotation synchronization
- Motion replay

## 🔐 Authentication & Authorization

- Firebase Authentication
- JWT Verification
- Role-based access
- Admin/User separation

## ⚡ Realtime Infrastructure

- MQTT communication
- Socket.IO realtime broadcast
- Firestore persistence
- Redis realtime cache

---

# 3. Kiến trúc hệ thống

```text
ESP32 + MPU6050 + GPS
            │
            ▼
      MQTT Broker
            │
            ▼
      NestJS Backend
   ┌────────┼─────────┐
   │        │         │
   ▼        ▼         ▼
Firebase  Socket.IO  Redis
   │                    │
   └────────┬───────────┘
            ▼
      Next.js Frontend
      ├── Dashboard
      ├── GPS Tracking
      ├── Unity WebGL
      └── Admin Panel
```

---

# 4. Technology Stack

## Frontend

| Công nghệ | Mục đích |
|---|---|
| Next.js | Framework chính cho frontend |
| Tailwind CSS | UI styling |
| shadcn/ui | UI components |
| Socket.IO Client | Realtime communication |
| Leaflet | GPS map rendering |
| Unity WebGL | 3D simulation |
| Zustand | State management |

## Backend

| Công nghệ | Mục đích |
|---|---|
| NestJS | Backend framework |
| MQTT.js | MQTT communication |
| Socket.IO | Realtime websocket |
| Firebase Admin SDK | Firestore & Auth |
| Redis | Cache & Pub/Sub |
| BullMQ | Background jobs |

## Database & Infrastructure

| Công nghệ | Mục đích |
|---|---|
| Firebase Firestore | Telemetry & application data |
| Firebase Auth | Authentication |
| Firebase Storage | Asset storage |
| Mosquitto MQTT | MQTT Broker |
| Docker | Containerization |
| GitHub Actions | CI/CD |

---

# 5. Cấu trúc thư mục

```text
iot-monitoring-system/
│
├── frontend/
│   ├── public/
│   │   ├── images/
│   │   ├── icons/
│   │   ├── models/
│   │   └── unity/
│   │       ├── Build/
│   │       ├── TemplateData/
│   │       └── index.html
│   │
│   ├── src/
│   │   ├── app/
│   │   ├── core/
│   │   ├── features/
│   │   ├── shared/
│   │   └── middleware.ts
│   │
│   ├── .env.local
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── core/
│   │   ├── modules/
│   │   ├── integrations/
│   │   ├── jobs/
│   │   └── shared/
│   │
│   ├── .env
│   ├── nest-cli.json
│   └── package.json
│
├── firmware/
│   ├── src/
│   ├── include/
│   ├── lib/
│   └── platformio.ini
│
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── database/
│   ├── mqtt/
│   └── deployment/
│
├── docker/
│   ├── mosquitto/
│   ├── redis/
│   └── nginx/
│
├── .github/
│   └── workflows/
│
├── docker-compose.yml
└── README.md
```

---

# 6. Thành viên & Phân công

| Thành viên | Role | Trách nhiệm |
|---|---|---|
| Developer 1 | IoT Engineer | ESP32, MPU6050, GPS, MQTT |
| Developer 2 | Backend Engineer | NestJS, Firebase, Socket.IO |
| Developer 3 | Frontend Engineer | Dashboard, Map, UI/UX |
| Developer 4 | Unity Engineer | Unity WebGL, Simulation |
| Developer 5 | DevOps | Docker, CI/CD, Deployment |

---

# 7. Task Breakdown & Timeline

## Giai đoạn 1 — Foundation

| Task ID | Task | Mô tả | Trạng thái |
|---|---|---|---|
| T01 | Setup Repository | GitHub + Monorepo structure | 🟡 In Progress |
| T02 | Setup Frontend | Next.js + Tailwind + Layout | ⚪ Not Started |
| T03 | Setup Backend | NestJS + Firebase + MQTT | ⚪ Not Started |
| T04 | Setup Docker | MQTT + Redis + Nginx | ⚪ Not Started |

## Giai đoạn 2 — Device Communication

| Task ID | Task | Mô tả | Trạng thái |
|---|---|---|---|
| T05 | ESP32 Sensor | MPU6050 + GPS reading | ⚪ Not Started |
| T06 | MQTT Communication | Publish telemetry data | ⚪ Not Started |
| T07 | Telemetry Pipeline | Validation + Firestore save | ⚪ Not Started |
| T08 | Socket.IO Realtime | Realtime dashboard broadcast | ⚪ Not Started |

## Giai đoạn 3 — Frontend Dashboard

| Task ID | Task | Mô tả | Trạng thái |
|---|---|---|---|
| T09 | Dashboard UI | KPI cards + charts | ⚪ Not Started |
| T10 | GPS Tracking | Realtime map tracking | ⚪ Not Started |
| T11 | Device Management | Device detail pages | ⚪ Not Started |
| T12 | Admin System | User & device management | ⚪ Not Started |

## Giai đoạn 4 — Unity Integration

| Task ID | Task | Mô tả | Trạng thái |
|---|---|---|---|
| T13 | Unity WebGL | WebGL export setup | ⚪ Not Started |
| T14 | Unity Bridge | React ↔ Unity bridge | ⚪ Not Started |
| T15 | Motion Simulation | Pitch/Roll/Yaw sync | ⚪ Not Started |
| T16 | Replay System | Motion replay system | ⚪ Not Started |

---

# 8. Hướng dẫn cài đặt

## Yêu cầu hệ thống

| Công cụ | Version |
|---|---|
| Node.js | 20+ |
| npm | 10+ |
| Docker | Latest |
| Git | Latest |
| PlatformIO | Latest |

---

## Clone repository

```bash
git clone <repository-url>
cd iot-monitoring-system
```

---

## Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend chạy tại:

```text
http://localhost:3000
```

---

## Setup Backend

```bash
cd backend
npm install
npm run start:dev
```

Backend chạy tại:

```text
http://localhost:3001
```

---

## Setup Docker Services

```bash
docker compose up -d
```

Services:

- MQTT Broker
- Redis
- Nginx

---

# 9. Biến môi trường

> ⚠️ TUYỆT ĐỐI KHÔNG PUSH FILE `.env` LÊN GITHUB.

## Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
```

---

## Backend `.env`

```env
PORT=3001

MQTT_BROKER_URL=mqtt://localhost:1883

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=super-secret-key
```

---

# 10. Chạy ứng dụng

Frontend và Backend chạy song song trên 2 terminal riêng.

## Terminal 1 — Frontend

```bash
cd frontend
npm run dev
```

## Terminal 2 — Backend

```bash
cd backend
npm run start:dev
```

## Terminal 3 — Docker Services

```bash
docker compose up
```

---

# 11. Quy trình làm việc & Git Flow

## Các nhánh chính

| Nhánh | Mục đích |
|---|---|
| main | Production stable |
| staging | Testing & integration |
| feature/* | Feature development |

---

## Quy trình tạo branch

```bash
git checkout staging
git pull origin staging
git checkout -b feature/t01-setup-frontend
```

---

## Commit convention

```bash
feat(T01): setup nextjs frontend
fix(T03): fix mqtt reconnect bug
docs(T02): update architecture docs
```

---

# 12. MQTT Topic Structure

```text
devices/{deviceId}/telemetry
devices/{deviceId}/gps
devices/{deviceId}/motion
devices/{deviceId}/status
```

---

# 13. Realtime Architecture

```text
ESP32
 ↓
MQTT
 ↓
NestJS Backend
 ├── Validation
 ├── Firestore
 ├── Redis Cache
 └── Socket.IO
         ↓
Next.js Dashboard
         ↓
Unity WebGL
```

---

# 14. Database Structure

## Firestore Collections

```text
users
devices
telemetry
gps_logs
motion_logs
alerts
device_latest
sessions
```

---

# 15. Deployment

## Production Stack

```text
Frontend → Vercel
Backend → Railway / Render
MQTT → Mosquitto Docker
Redis → Docker
Firebase → Firestore
```

---

# 16. Troubleshooting

## ❌ Socket.IO không connect được

Nguyên nhân:

- Backend chưa chạy
- Sai CORS
- Sai URL

Giải pháp:

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

---

## ❌ MQTT Broker Connection Failed

Giải pháp:

```bash
docker compose up mosquitto
```

---

## ❌ Unity WebGL không load

Kiểm tra:

```text
frontend/public/unity/
```

đã có:

```text
Build/
TemplateData/
index.html
```

---

## ❌ Firebase Permission Denied

Kiểm tra:

- Firebase Rules
- Service Account Key
- Firebase Admin SDK

---

_README được cập nhật lần cuối: 28/05/2026_

