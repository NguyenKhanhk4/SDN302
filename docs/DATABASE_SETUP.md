# Tài Liệu Cấu Hình & Quy Trình Làm Việc (Database & Environment Setup)

> **Dự án:** Tutor Center Management System (SDN302)
> **Mục đích:** Hướng dẫn cài đặt môi trường và quy trình đồng bộ database cho toàn bộ team.

---

## 1. Cấu Hình File `.env`

File `.env` **KHÔNG được push lên Git** (đã có trong `.gitignore`).

Mỗi thành viên tự tạo file `.env` trong thư mục `backend/` dựa trên file mẫu `.env.example`.

```bash
# Copy file mẫu
cp backend/.env.example backend/.env
# Sau đó điền thông tin thực tế vào .env
```

### Các biến môi trường cần thiết

| Biến | Mô tả | Bắt buộc |
|---|---|---|
| `PORT` | Port server backend | Không (mặc định 5000) |
| `MONGO_URI_ATLAS` | Connection string MongoDB Atlas | **Có** |
| `MONGO_URI_LOCAL` | Connection string MongoDB Local | Không (mặc định localhost) |
| `JWT_SECRET` | Secret key để ký JWT token | **Có** |
| `JWT_EXPIRE` | Thời hạn JWT (ví dụ: `7d`) | **Có** |
| `NODE_ENV` | Môi trường (`development`/`production`) | Không |

### Lấy `MONGO_URI_ATLAS` ở đâu?

> **Hỏi @thanhbinh** (người quản lý Atlas cluster) để lấy connection string.
> Hoặc vào **MongoDB Atlas** → Cluster → **Connect** → **Connect your application**.

---

## 2. Logic Kết Nối Database (Auto-Fallback)

Backend được cấu hình **tự động chuyển đổi** giữa Atlas và Local — không cần sửa code hay `.env`.

```
Khởi động server
       │
       ▼
  Thử Atlas (timeout 5 giây)
       │── Kết nối OK ──→  Dùng ATLAS (dừng tại đây)
       │── Thất bại   ──┐
                        ▼
                  Thử Local MongoDB
                        │── Kết nối OK ──→  Dùng LOCAL (dừng tại đây)
                        │── Thất bại   ──→  process.exit(1)
```

**Ưu tiên:** Atlas → Local → Dừng server

Các lý do Atlas thất bại được xử lý tự động: mất internet, lỗi xác thực, DNS error, timeout, server Atlas không phản hồi.

---

## 3. Quy Trình Đồng Bộ Database (Dành cho @thanhbinh)

> Phần này áp dụng cho thành viên cần làm việc ở **môi trường chặn Atlas** (ví dụ: mạng trường học).

### Khi nào cần đồng bộ?

- Mạng trường/công ty **chặn MongoDB Atlas** → phải dùng Local MongoDB.
- Để không mất dữ liệu, cần sync 2 chiều trước và sau khi đến trường.

### Lệnh đồng bộ

```bash
cd backend

# TRƯỚC KHI ĐẾN TRƯỜNG — kéo data từ Atlas về Local
npm run sync:to-local

# SAU KHI VỀ NHÀ — đẩy data từ Local lên Atlas
npm run sync:to-atlas
```

### Quy trình đầy đủ

```
[Tại nhà, có internet]
  1. npm run sync:to-local   ← Đồng bộ Atlas → Local
  2. Tắt máy, đến trường

[Ở trường, Atlas bị chặn]
  3. npm run dev             ← Server tự động dùng Local
  4. Làm việc bình thường (thêm/sửa/xóa data)

[Về nhà, có internet]
  5. npm run sync:to-atlas   ← Đồng bộ Local → Atlas
  6. Báo team biết để pull data mới nhất
```

### Log mẫu khi đồng bộ thành công

```
══════════════════════════════════════════════════
  🔽  ĐỒNG BỘ: Atlas  →  Local
  (Chạy script này TRƯỚC KHI ĐẾN TRƯỜNG)
══════════════════════════════════════════════════

  Bước 1 — Kết nối databases
  ✓ Kết nối Atlas (nguồn) thành công
  ✓ Kết nối Local (đích) thành công

  Bước 2 — Đồng bộ dữ liệu
  [✓] users                     42 documents
  [✓] classes                   18 documents
  [✓] schedules                 36 documents
  ...

  ✅ Đồng bộ hoàn tất!
     9 collections | 215 documents

  💡 Local đã sẵn sàng — bạn có thể đến trường và làm việc.
══════════════════════════════════════════════════
```

### ⚠️ Lưu ý quan trọng khi đồng bộ

> Script dùng cơ chế **REPLACE** — xóa sạch database đích rồi chèn toàn bộ từ nguồn.
> **Không merge** — không giữ lại document cũ nếu không có ở nguồn.

| Tình huống | Cần làm gì |
|---|---|
| Bạn và thành viên khác **cùng sửa** trong lúc bạn ở trường | Báo team trước khi chạy `sync:to-atlas` để tránh ghi đè mất data |
| Chạy `sync:to-local` bị lỗi "Atlas unavailable" | Kiểm tra internet, hoặc kiểm tra `MONGO_URI_ATLAS` trong `.env` |
| Chạy `sync:to-atlas` bị lỗi "Local unavailable" | Đảm bảo MongoDB service đang chạy trên máy |

---

## 4. Cài Đặt MongoDB Local (nếu chưa có)

Nếu bạn chưa cài MongoDB trên máy:

1. Tải tại: https://www.mongodb.com/try/download/community
2. Cài đặt với option **"Install as a Service"** để MongoDB tự khởi động cùng Windows.
3. Kiểm tra service đang chạy:
   ```bash
   # Windows
   net start MongoDB

   # hoặc vào Services > MongoDB > Start
   ```
4. URI mặc định sau khi cài: `mongodb://localhost:27017/sdn302_db`

---

## 5. Cài Đặt Dependencies Backend

```bash
cd backend
npm install
```

Khởi động server phát triển:
```bash
npm run dev
```

---

## 6. Các Lệnh Seed Dữ Liệu

```bash
# Tạo dữ liệu mẫu cơ bản cho Teacher
npm run seed:teacher-basic

# Tạo lịch dạy mẫu
npm run seed:teacher-schedule

# Tạo sessions cố định
npm run seed:generate-fixed-sessions
```

---

## 7. Cấu Trúc File Database

```
backend/
├── .env                          ← Không push lên Git (mỗi người tự tạo)
├── .env.example                  ← File mẫu — push lên Git cho team tham khảo
├── src/
│   ├── config/
│   │   └── db.js                 ← Logic auto-fallback Atlas → Local
│   └── seed/
│       └── sync-db.js            ← Script đồng bộ 2 chiều Atlas ↔ Local
```

---

*Cập nhật lần cuối: 2026-07-02 bởi @thanhbinh*
