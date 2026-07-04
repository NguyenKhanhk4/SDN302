# Tài liệu phân tích và thiết kế Backend - Tutor Center Management System

Tài liệu này phân tích cấu trúc cơ sở dữ liệu hiện tại của Backend, đối chiếu với các yêu cầu của **Admin Frontend** đã xây dựng, phát hiện các điểm bất tương thích (mismatches) và đề xuất thiết kế API, Model chi tiết phục vụ cho việc kết nối sau này.

---

## 1. Phân tích sự không tương thích (Mismatches) giữa FE và BE hiện tại

### 1.1. Vai trò người dùng (User Roles)
*   **Backend hiện tại (`models/User.js`)**: Chỉ cho phép 3 role: `['admin', 'teacher', 'student']` (chữ thường).
*   **Frontend yêu cầu**: Hỗ trợ các role: `ADMIN`, `TEACHER`, `STUDENT`, `PARENT`, `MANAGER` (chữ in hoa trong mock data, có kiểm tra case-insensitive).
*   **Giải pháp**:
    *   Cập nhật Enum trong `User.js` thành: `['admin', 'teacher', 'student', 'parent', 'manager']`.
    *   Để đồng bộ về mặt hiển thị, Backend sẽ trả về role chữ in hoa hoặc Frontend sẽ chuẩn hóa chuỗi chữ thường khi hiển thị.

### 1.2. Mối quan hệ giữa Class và Teacher
*   **Backend hiện tại (`models/Class.js`)**: Trường `teacherId` tham chiếu đến `TeacherProfile` chứ không tham chiếu trực tiếp đến `User`.
*   **Frontend yêu cầu**: Khi hiển thị danh sách lớp, thông tin giáo viên hiển thị dưới dạng chuỗi tên (`teacher: "Nguyen Van Teacher"`).
*   **Giải pháp**: 
    *   Khi Admin tạo lớp học, Frontend gửi lên chuỗi tên giáo viên hoặc ID giáo viên. Trên thực tế, Backend cần nhận `teacherId` (ID của `TeacherProfile`).
    *   API `GET /api/admin/classes` của Backend sẽ cần `.populate({ path: 'teacherId', populate: { path: 'userId', select: 'name' } })` và map cấu trúc trả về phẳng: `teacher: class.teacherId.userId.name`.

### 1.3. Số lượng học viên hiện tại trong lớp (currentStudents)
*   **Backend hiện tại**: Lớp học (`Class`) không lưu thuộc tính `currentStudents` trực tiếp, thông tin này nằm ở bảng liên kết nhiều-nhiều `ClassStudent.js` với điều kiện `status: 'enrolled'`.
*   **Frontend yêu cầu**: Hiển thị số lượng học viên hiện tại dạng số.
*   **Giải pháp**:
    *   Backend khi trả về danh sách lớp học sẽ dùng `mongoose aggregation` hoặc tính toán động thông qua `Promise.all` đếm số lượng `ClassStudent` tương ứng với mỗi `classId` có trạng thái `'enrolled'`.

### 1.4. Lịch học (Schedules)
*   **Backend hiện tại (`models/Schedule.js`)**: Lưu `dayOfWeek` dạng String enum (`['Monday', 'Tuesday',...]`).
*   **Frontend yêu cầu**: Định dạng `dayOfWeek` dạng số từ `0` (Chủ Nhật) đến `6` (Thứ Bảy).
*   **Giải pháp**:
    *   Cập nhật `dayOfWeek` trong schema `Schedule.js` sang kiểu số (`Number` hoặc String với giá trị `'0'` -> `'6'`) để đồng bộ với bộ lọc và cách hiển thị của Frontend.

---

## 2. Thiết kế Cơ sở dữ liệu & Model cần điều chỉnh

### 2.1. Model `User.js`
Cập nhật Schema để hỗ trợ thêm các vai trò quản lý và phụ huynh:
```javascript
role: {
  type: String,
  enum: ['admin', 'teacher', 'student', 'parent', 'manager'],
  default: 'student',
}
```

### 2.2. Tạo mới Model `ParentProfile.js` (Nếu cần lưu chi tiết phụ huynh)
Để quản lý thông tin phụ huynh và liên kết phụ huynh với học sinh:
```javascript
const ParentProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile' }], // Danh sách con em học tại trung tâm
  address: String
}, { timestamps: true });
```

---

## 3. Thiết kế các API Endpoints chi tiết cho Admin

Toàn bộ các API của Admin phải được bảo vệ bởi middleware xác thực và phân quyền: `protect, authorize('admin')`.

### 3.1. Phân hệ Dashboard
*   **API**: `GET /api/admin/dashboard`
*   **Logic xử lý**:
    1.  Đếm số lượng `User` theo từng `role`.
    2.  Đếm số lượng `User` theo trạng thái `isActive`.
    3.  Đếm số lượng `Class` theo từng trạng thái `status`.
    4.  Đếm số lượng `Schedule` theo trạng thái `status`.
*   **Cấu trúc Response khớp FE**:
    ```json
    {
      "success": true,
      "data": {
        "users": {
          "totalUsers": 12,
          "teachers": 3,
          "students": 6,
          "parents": 2,
          "managers": 1,
          "activeUsers": 10,
          "inactiveUsers": 2
        },
        "classes": {
          "totalClasses": 5,
          "activeClasses": 3,
          "upcomingClasses": 1,
          "finishedClasses": 1,
          "cancelledClasses": 0
        },
        "schedules": {
          "totalSchedules": 8,
          "activeSchedules": 7,
          "cancelledSchedules": 1
        }
      }
    }
    ```

### 3.2. Phân hệ Quản lý Users
*   **API Lấy danh sách**: `GET /api/admin/users?role=...&status=...&search=...`
    *   *Query params*: `role` (TEACHER, STUDENT, PARENT, MANAGER), `status` (ACTIVE, INACTIVE, BANNED), `search` (tên, email, sđt).
    *   *Logic*: Tạo object filter động gửi vào `User.find(query)`.
*   **API Tạo mới User**: `POST /api/admin/users`
    *   *Body*: `fullName`, `email`, `phone`, `password`, `role`, `status`.
    *   *Logic*:
        1.  Tạo tài khoản `User` (lưu vào database, mật khẩu tự động hash qua pre-save hook).
        2.  Nếu role là `TEACHER`, tự động tạo một `TeacherProfile` trống liên kết với `User` mới tạo.
        3.  Nếu role là `STUDENT`, tự động tạo một `StudentProfile` trống liên kết với `User` mới tạo.
*   **API Xem chi tiết**: `GET /api/admin/users/:userId`
*   **API Cập nhật trạng thái**: `PATCH /api/admin/users/:userId/status`
    *   *Body*: `{ status: 'ACTIVE' | 'INACTIVE' | 'BANNED' }`
    *   *Logic*: Cập nhật trường `isActive` (hoặc thêm trường `status` vào `User.js` nếu muốn phân biệt rõ trạng thái block/inactive).

### 3.3. Phân hệ Lớp học (Classes)
*   **API Lấy danh sách lớp**: `GET /api/admin/classes?status=...&search=...`
    *   *Logic*: Lấy danh sách các lớp học, tính toán số học sinh hiện tại qua bảng `ClassStudent`, populate tên Môn học (`Subject`) và tên Giáo viên.
*   **API Tạo mới lớp**: `POST /api/admin/classes`
    *   *Body*: `name`, `subjectId`, `teacherId` (ID của TeacherProfile), `room`, `maxStudents`, `startDate`, `endDate`, `status`.
*   **API Chi tiết lớp**: `GET /api/admin/classes/:classId`
*   **API Danh sách học sinh trong lớp**: `GET /api/admin/classes/:classId/students`
    *   *Logic*: Query `ClassStudent.find({ classId, status: 'enrolled' })` và populate thông tin User của Student.

### 3.4. Phân hệ Lịch học (Schedules)
*   **API Lấy danh sách lịch**: `GET /api/admin/schedules?status=...&search=...`
    *   *Logic*: Lấy danh sách lịch học, populate tên lớp học và giáo viên.
*   **API Tạo mới lịch**: `POST /api/admin/schedules`
    *   *Body*: `classId`, `teacherId`, `dayOfWeek` (0-6), `startTime` ("HH:MM"), `endTime` ("HH:MM"), `room`, `status`.

---

## 4. Kế hoạch các bước thực hiện Backend Admin (Khi bắt đầu code)

1.  **Bước 1 (Database Refactor)**: Cập nhật Schema `User.js` (thêm các role và trạng thái), cập nhật `Schedule.js` chuyển đổi `dayOfWeek` sang kiểu số.
2.  **Bước 2 (Tạo Route & Middleware)**: Khai báo file route mới `routes/admin.routes.js`, kết nối vào `app.js` dưới đường dẫn `/api/admin`. Sử dụng middleware kiểm tra quyền admin.
3.  **Bước 3 (Xây dựng Controller Dashboard & Users)**: Viết các API thống kê và quản lý người dùng, xử lý lưu hồ sơ profile phụ thuộc đi kèm (`TeacherProfile`, `StudentProfile`) khi tạo tài khoản.
4.  **Bước 4 (Xây dựng Controller Classes & Schedules)**: Viết các API truy vấn/lọc lớp học và lịch dạy kèm cơ chế populate lồng nhau để làm phẳng cấu trúc dữ liệu gửi về Frontend.
5.  **Bước 5 (Tích hợp & Loại bỏ Mock ở FE)**: Thay đổi file `adminApi.js` ở Frontend để gọi endpoint thật bằng Axios, tiến hành test luồng nghiệp vụ thực tế.
