# Phân tích role `Teacher`

Tài liệu này mô tả những chức năng Teacher **thực sự có trong source code hiện tại** của repository. Mỗi chức năng được tách thành một chương độc lập để có thể đọc theo nghiệp vụ hoặc lần theo code từ frontend đến database.

Phạm vi source:

- Frontend React/Vite trong `frontend/`.
- Backend Express/Mongoose trong `backend/`.
- Chỉ chỉnh sửa file tài liệu này; không chỉnh sửa source code của dự án.

> Các nhận xét về lỗi và rủi ro ở cuối tài liệu là kết quả đối chiếu source hiện tại. Chúng không có nghĩa là source đã được sửa.

<a id="muc-luc"></a>

## Mục lục

### Các chức năng của Teacher

- [1. Đăng nhập và vào portal Teacher](#f1-dang-nhap)
- [2. Xem lịch dạy](#f2-xem-lich-day)
- [3. Xem danh sách lớp](#f3-danh-sach-lop)
- [4. Xem chi tiết lớp](#f4-chi-tiet-lop)
- [5. Xem danh sách học viên](#f5-danh-sach-hoc-vien)
- [6. Xem danh sách buổi học](#f6-danh-sach-buoi-hoc)
- [7. Tạo buổi học](#f7-tao-buoi-hoc)
- [8. Xem điểm danh](#f8-xem-diem-danh)
- [9. Lưu điểm danh](#f9-luu-diem-danh)
- [10. Upload tài liệu buổi học](#f10-upload-tai-lieu)
- [11. Xóa tài liệu buổi học](#f11-xoa-tai-lieu)
- [12. Xem môn học và tài liệu môn học](#f12-mon-hoc)
- [13. Xem và cập nhật hồ sơ cá nhân](#f13-ho-so)
- [14. Dashboard Teacher](#f14-dashboard)

### Phần dùng chung

- [Mô hình tài khoản và quyền](#mo-hinh-tai-khoan-va-quyen)
- [Quan hệ database](#quan-he-database)
- [Rủi ro và chức năng chưa có](#rui-ro-va-chuc-nang-chua-co)
- [Kết luận](#ket-luan)

---

<a id="f1-dang-nhap"></a>

# 1. Đăng nhập và vào portal Teacher

## 1. Chức năng này dùng để làm gì?

Teacher nhập email và mật khẩu để nhận JWT, lưu phiên đăng nhập ở trình duyệt và đi tới trang lịch dạy. Database chỉ đọc tài khoản `User`; không tạo hoặc thay đổi dữ liệu khi đăng nhập.

## 2. Luồng hoạt động tổng quát

1. Teacher mở trang `/login`.
2. Frontend kiểm tra email và mật khẩu không rỗng.
3. Frontend gửi request đăng nhập.
4. Backend tìm `User`, so sánh mật khẩu và kiểm tra `isActive`.
5. Backend ký JWT với payload `{ id: user._id }`.
6. Frontend lưu token và thông tin user vào `localStorage`.
7. Frontend điều hướng Teacher tới `/teacher/schedules`.
8. Các request sau đó gửi JWT qua header `Authorization`.

## 3. Các file tham gia xử lý

| Thứ tự | Tầng xử lý | File | Thành phần chính | Nhiệm vụ |
|---|---|---|---|---|
| 1 | Frontend Page | [LoginPage.jsx](frontend/src/pages/auth/LoginPage.jsx#L9-L150) | `validate()`, `handleSubmit()` | Nhận thông tin đăng nhập và điều hướng |
| 2 | Frontend API | [authApi.js](frontend/src/api/authApi.js#L1-L9) | `authApi.login()` | Gửi `POST /auth/login` |
| 3 | Frontend HTTP | [axiosClient.js](frontend/src/api/axiosClient.js#L3-L47) | Interceptors | Gắn Bearer token và xử lý 401 |
| 4 | Backend Route | [auth.routes.js](backend/src/routes/auth.routes.js#L1-L8) | `POST /login` | Chuyển request tới controller |
| 5 | Controller | [auth.controller.js](backend/src/controllers/auth.controller.js#L9-L68) | `login()` | Kiểm tra tài khoản và tạo JWT |
| 6 | Model | [User.js](backend/src/models/User.js#L1-L64) | `User`, `comparePassword()` | Đọc user và so sánh mật khẩu |

## 4. Frontend xử lý như thế nào?

### 4.1 `validate()` và `handleSubmit()`

**File:** [LoginPage.jsx](frontend/src/pages/auth/LoginPage.jsx#L43-L96)

- **Khi nào:** `handleSubmit()` chạy khi form được submit.
- **Input:** `email`, `password` từ state của form.
- **Xử lý:** `validate()` kiểm tra rỗng, sau đó `authApi.login({ email, password })` được gọi.
- **Output/state:** `saveAuth()` lưu response; role `teacher` được điều hướng tới `/teacher/schedules`; lỗi được đưa vào state hiển thị.

### 4.2 `authApi.login()` và `saveAuth()`

**File:** [authApi.js](frontend/src/api/authApi.js#L3-L7), [auth.js](frontend/src/utils/auth.js#L1-L32)

`authApi.login()` chỉ tạo request. `saveAuth()` lưu token và object user vào `localStorage`; dữ liệu này phục vụ điều hướng frontend, không thay thế việc backend xác thực lại user.

## 5. API frontend

| Function | Method | Endpoint | Request | Response | Được gọi từ |
|---|---|---|---|---|---|
| [`authApi.login()`](frontend/src/api/authApi.js#L3-L7) | POST | `/api/auth/login` | `{ email, password }` | `{ success, token, user: { _id, name, email, role } }` | `handleSubmit()` |

## 6. Backend xử lý như thế nào?

### 6.1 Route

`app.js` mount auth router dưới `/api/auth`; route `POST /login` gọi `login()`.

### 6.2 Middleware `protect`

`protect` **không chạy ở request login** vì chưa có token. Nó chạy ở các request sau đó: lấy Bearer token, verify JWT, lấy `decoded.id`, `User.findById`, kiểm tra `isActive`, rồi gán user vào `req.user` ([auth.middleware.js](backend/src/middlewares/auth.middleware.js#L8-L55)).

### 6.3 Middleware `authorize('teacher')`

`authorize('teacher')` cũng không chạy trên login. Với các API Teacher, middleware đọc `req.user.role`, so sánh với `teacher`, và trả 403 nếu sai ([role.middleware.js](backend/src/middlewares/role.middleware.js#L7-L24)).

### 6.4 Controller `login()`

1. Kiểm tra đủ email và password; thiếu thì trả 400.
2. Tìm `User.findOne({ email }).select('+password')`.
3. Gọi `user.comparePassword(password)`; sai thì trả 401.
4. Từ chối user không active với 403.
5. Ký JWT có thời hạn `JWT_EXPIRE` hoặc mặc định `7d`.
6. Trả 200 cùng token và thông tin user. Role trong response lấy từ database; role không nằm trong JWT payload.

## 7. Database thay đổi như thế nào?

| Model | Thao tác | Điều kiện truy vấn | Dữ liệu thay đổi |
|---|---|---|---|
| [User](backend/src/models/User.js#L1-L64) | `findOne`, `comparePassword` | `{ email }` | Không thay đổi |

## 8. Request và response minh họa

```json
// Request
{ "email": "teacher@example.com", "password": "••••••••" }
```

```json
// Response rút gọn
{ "success": true, "token": "jwt...", "user": { "role": "teacher" } }
```

[Quay lại mục lục](#muc-luc)

---

<a id="f2-xem-lich-day"></a>

# 2. Xem lịch dạy

## 1. Chức năng này dùng để làm gì?

Teacher xem lịch tuần của những lớp được phân công. Dữ liệu `Schedule` chỉ được đọc; khi bấm một ô lịch, frontend có thể chuyển sang [tạo buổi học](#f7-tao-buoi-hoc) hoặc [xem điểm danh](#f8-xem-diem-danh).

## 2. Luồng hoạt động tổng quát

1. Teacher mở `/teacher/schedules`.
2. Frontend lấy danh sách lịch của Teacher.
3. Frontend dựng lịch theo tuần/năm.
4. Teacher bấm vào một ô lịch.
5. Frontend lấy các session của lớp.
6. Nếu có session đúng ngày, frontend mở trang điểm danh.
7. Nếu chưa có, frontend chuẩn bị request tạo session.

## 3. Các file tham gia xử lý

| Thứ tự | Tầng xử lý | File | Thành phần chính | Nhiệm vụ |
|---|---|---|---|---|
| 1 | Frontend Page | [TeacherSchedulesPage.jsx](frontend/src/pages/teacher/TeacherSchedulesPage.jsx#L13-L316) | `fetchSchedules()`, `handleClassClick()` | Hiển thị lịch và xử lý click |
| 2 | Frontend API | [teacherApi.js](frontend/src/api/teacherApi.js#L20-L22) | `getSchedules()` | Lấy lịch |
| 3 | Backend Route | [teacher.routes.js](backend/src/modules/teacher/teacher.routes.js#L38-L64) | `GET /schedules` | Nhận request |
| 4 | Middleware | [auth.middleware.js](backend/src/middlewares/auth.middleware.js#L8-L55), [role.middleware.js](backend/src/middlewares/role.middleware.js#L7-L24) | `protect`, `authorize('teacher')` | Kiểm tra đăng nhập và role |
| 5 | Controller | [teacher.controller.js](backend/src/modules/teacher/teacher.controller.js#L193-L208) | `getMySchedules()` | Lọc lịch theo TeacherProfile |
| 6 | Service | [teacher.service.js](backend/src/modules/teacher/teacher.service.js#L11-L17) | `getTeacherProfileByUserId()` | Đổi User thành TeacherProfile |
| 7 | Model | [Schedule.js](backend/src/models/Schedule.js#L1-L45), [Class.js](backend/src/models/Class.js#L1-L50) | `Schedule`, `Class` | Lưu lịch và lớp |

## 4. Frontend xử lý như thế nào?

### 4.1 `fetchSchedules()`

**File:** [TeacherSchedulesPage.jsx](frontend/src/pages/teacher/TeacherSchedulesPage.jsx#L31-L51)

- **Khi nào:** chạy khi page mount hoặc người dùng bấm thử lại.
- **Input:** không có input nghiệp vụ; dùng tuần/năm hiện tại.
- **Xử lý:** gọi `teacherApi.getSchedules()`, nhận `data` và chuyển thành state lịch.
- **Output/state:** UI dựng các ô lịch; lỗi được hiển thị để thử lại.

### 4.2 `handleClassClick()`

**File:** [TeacherSchedulesPage.jsx](frontend/src/pages/teacher/TeacherSchedulesPage.jsx#L54-L123)

- **Khi nào:** Teacher bấm một lịch.
- **Input:** `schedule`, ngày được chọn.
- **Xử lý:** gọi `getSessionsByClass()`, tìm session đúng ngày; nếu chưa có thì gọi `createSession()`.
- **Output/state:** điều hướng đến trang attendance hoặc bắt đầu quy trình tạo session.

## 5. API frontend

| Function | Method | Endpoint | Request | Response | Được gọi từ |
|---|---|---|---|---|---|
| [`getSchedules()`](frontend/src/api/teacherApi.js#L20-L22) | GET | `/api/teacher/schedules` | Không có body | `{ success, total, data: Schedule[] }` | `fetchSchedules()` |
| [`getSessionsByClass()`](frontend/src/api/teacherApi.js#L25-L27) | GET | `/api/teacher/classes/:classId/sessions` | `classId` | `Session[]` kèm summary | `handleClassClick()` |
| [`createSession()`](frontend/src/api/teacherApi.js#L29-L31) | POST | `/api/teacher/classes/:classId/sessions` | Dữ liệu session | `{ success, data: Session }` | `handleClassClick()` khi chưa có session |

## 6. Backend xử lý như thế nào?

### 6.1 Route

`GET /api/teacher/schedules` chạy sau `router.use(protect, authorize('teacher'))`, rồi gọi `getMySchedules()`.

### 6.2 Middleware `protect`

Đọc Bearer token, verify JWT, tìm lại User bằng `decoded.id`, kiểm tra `isActive` và gán vào `req.user` ([auth.middleware.js](backend/src/middlewares/auth.middleware.js#L8-L55)).

### 6.3 Middleware `authorize('teacher')`

Đọc `req.user.role`; chỉ role đúng `teacher` được đi tiếp, role khác nhận 403 ([role.middleware.js](backend/src/middlewares/role.middleware.js#L7-L24)).

### 6.4 Controller `getMySchedules()`

`getTeacherProfileByUserId(req.user._id)` lấy profile, sau đó `Schedule.find({ teacherId: teacherProfile._id })`, populate lớp và sắp xếp theo thứ/ngày/giờ. Response 200 gồm `success`, `total`, `data`.

## 7. Database thay đổi như thế nào?

| Model | Thao tác | Điều kiện truy vấn | Dữ liệu thay đổi |
|---|---|---|---|
| [TeacherProfile](backend/src/models/TeacherProfile.js#L1-L25) | `findOne` | `{ userId: req.user._id }` | Không thay đổi |
| [Schedule](backend/src/models/Schedule.js#L1-L45) | `find` + populate | `{ teacherId: profile._id }` | Không thay đổi |
| [Class](backend/src/models/Class.js#L1-L50) | populate | `Schedule.classId` | Không thay đổi |

## 8. Request và response minh họa

```http
GET /api/teacher/schedules
Authorization: Bearer <jwt>
```

```json
{ "success": true, "total": 1, "data": [{ "classId": "class_1", "dayOfWeek": 2 }] }
```

[Quay lại mục lục](#muc-luc)

---

<a id="f3-danh-sach-lop"></a>

# 3. Xem danh sách lớp

## 1. Chức năng này dùng để làm gì?

Teacher xem các lớp được phân công, môn học, phòng, trạng thái và số học viên đang `enrolled`. Chức năng chỉ đọc `Class`, `Subject` và `ClassStudent`.

## 2. Luồng hoạt động tổng quát

1. Teacher mở `/teacher/classes`.
2. Frontend gọi API lấy lớp của mình.
3. Backend tìm TeacherProfile hiện tại.
4. Backend lọc lớp theo `Class.teacherId`.
5. Backend populate Subject và đếm học viên `enrolled`.
6. Frontend hiển thị danh sách và các nút đi tới chi tiết, học viên hoặc session.

## 3. Các file tham gia xử lý

| Thứ tự | Tầng xử lý | File | Thành phần chính | Nhiệm vụ |
|---|---|---|---|---|
| 1 | Frontend Page | [TeacherClassesPage.jsx](frontend/src/pages/teacher/TeacherClassesPage.jsx#L10-L147) | `fetchClasses()` | Tải và hiển thị lớp |
| 2 | Frontend API | [teacherApi.js](frontend/src/api/teacherApi.js#L8-L10) | `getMyClasses()` | Gửi request |
| 3 | Backend Route | [teacher.routes.js](backend/src/modules/teacher/teacher.routes.js#L38-L54) | `GET /classes` | Nhận request |
| 4 | Middleware | [auth.middleware.js](backend/src/middlewares/auth.middleware.js#L8-L55), [role.middleware.js](backend/src/middlewares/role.middleware.js#L7-L24) | `protect`, `authorize` | Bảo vệ API |
| 5 | Controller | [teacher.controller.js](backend/src/modules/teacher/teacher.controller.js#L75-L115) | `getMyClasses()` | Lọc lớp và đếm học viên |
| 6 | Service | [teacher.service.js](backend/src/modules/teacher/teacher.service.js#L11-L17) | `getTeacherProfileByUserId()` | Lấy profile |
| 7 | Model | [Class.js](backend/src/models/Class.js#L1-L50), [ClassStudent.js](backend/src/models/ClassStudent.js#L1-L40), [Subject.js](backend/src/models/Subject.js#L1-L60) | Các model lớp | Đọc dữ liệu lớp |

## 4. Frontend xử lý như thế nào?

### 4.1 `fetchClasses()`

**File:** [TeacherClassesPage.jsx](frontend/src/pages/teacher/TeacherClassesPage.jsx#L20-L38)

- **Khi nào:** khi page mount hoặc bấm thử lại.
- **Input:** không có input nghiệp vụ.
- **Xử lý:** gọi `teacherApi.getMyClasses()` và lấy danh sách từ response.
- **Output/state:** cập nhật state `classes`; mỗi item có thể mở chi tiết, học viên hoặc session.

## 5. API frontend

| Function | Method | Endpoint | Request | Response | Được gọi từ |
|---|---|---|---|---|---|
| [`getMyClasses()`](frontend/src/api/teacherApi.js#L8-L10) | GET | `/api/teacher/classes` | Không có body | `{ success, total, data: Class[] }` | `fetchClasses()` |

## 6. Backend xử lý như thế nào?

### 6.1 Route

Route `GET /api/teacher/classes` chạy middleware chung của router và gọi `getMyClasses()`.

### 6.2 Middleware `protect`

JWT được verify, User hiện tại được đọc lại từ database, kiểm tra `isActive` và gán vào `req.user` ([auth.middleware.js](backend/src/middlewares/auth.middleware.js#L8-L55)).

### 6.3 Middleware `authorize('teacher')`

`authorize('teacher')` từ chối role không phải `teacher` bằng 403 ([role.middleware.js](backend/src/middlewares/role.middleware.js#L7-L24)).

### 6.4 Controller `getMyClasses()`

Controller lấy profile rồi query `Class` theo `teacherId: teacherProfile._id`, populate `subjectId`, đếm `ClassStudent` có `status: 'enrolled'`, thêm `currentStudents` và trả response 200.

## 7. Database thay đổi như thế nào?

| Model | Thao tác | Điều kiện truy vấn | Dữ liệu thay đổi |
|---|---|---|---|
| [TeacherProfile](backend/src/models/TeacherProfile.js#L1-L25) | `findOne` | `userId` hiện tại | Không thay đổi |
| [Class](backend/src/models/Class.js#L1-L50) | `find` + populate | `teacherId = profile._id` | Không thay đổi |
| [Subject](backend/src/models/Subject.js#L1-L60) | populate | `Class.subjectId` | Không thay đổi |
| [ClassStudent](backend/src/models/ClassStudent.js#L1-L40) | `countDocuments` | `classId`, `status: enrolled` | Không thay đổi |

## 8. Request và response minh họa

```http
GET /api/teacher/classes
Authorization: Bearer <jwt>
```

```json
{ "success": true, "total": 1, "data": [{ "_id": "class_1", "currentStudents": 20 }] }
```

[Quay lại mục lục](#muc-luc)

---

<a id="f4-chi-tiet-lop"></a>

# 4. Xem chi tiết lớp

## 1. Chức năng này dùng để làm gì?

Teacher xem thông tin của một lớp cụ thể, gồm môn học và số học viên đang học. Không có thao tác cập nhật hoặc xóa lớp trong API Teacher.

## 2. Luồng hoạt động tổng quát

1. Teacher chọn một lớp từ danh sách.
2. Frontend lấy `classId` từ URL.
3. Frontend gọi API chi tiết lớp.
4. Backend kiểm tra Teacher sở hữu lớp.
5. Backend đọc lớp, môn học và số học viên `enrolled`.
6. Frontend hiển thị thông tin lớp.

## 3. Các file tham gia xử lý

| Thứ tự | Tầng xử lý | File | Thành phần chính | Nhiệm vụ |
|---|---|---|---|---|
| 1 | Frontend Page | [TeacherClassDetailPage.jsx](frontend/src/pages/teacher/TeacherClassDetailPage.jsx#L10-L147) | `fetchClassDetail()` | Tải và hiển thị chi tiết |
| 2 | Frontend API | [teacherApi.js](frontend/src/api/teacherApi.js#L12-L14) | `getClassDetail()` | Gửi request |
| 3 | Backend Route | [teacher.routes.js](backend/src/modules/teacher/teacher.routes.js#L51-L57) | `GET /classes/:classId` | Nhận `classId` |
| 4 | Middleware | [auth.middleware.js](backend/src/middlewares/auth.middleware.js#L8-L55), [role.middleware.js](backend/src/middlewares/role.middleware.js#L7-L24) | `protect`, `authorize` | Bảo vệ API |
| 5 | Controller | [teacher.controller.js](backend/src/modules/teacher/teacher.controller.js#L122-L155) | `getMyClassDetail()` | Kiểm ownership và đọc lớp |
| 6 | Service | [teacher.service.js](backend/src/modules/teacher/teacher.service.js#L26-L37) | `checkTeacherOwnsClass()` | Kiểm lớp thuộc Teacher |
| 7 | Model | [Class.js](backend/src/models/Class.js#L1-L50), [ClassStudent.js](backend/src/models/ClassStudent.js#L1-L40) | `Class`, `ClassStudent` | Dữ liệu lớp và thành viên |

## 4. Frontend xử lý như thế nào?

### 4.1 `fetchClassDetail()`

**File:** [TeacherClassDetailPage.jsx](frontend/src/pages/teacher/TeacherClassDetailPage.jsx#L21-L35)

- **Khi nào:** khi page mount hoặc bấm thử lại.
- **Input:** `classId` từ route params.
- **Xử lý:** gọi `getClassDetail(classId)`.
- **Output/state:** cập nhật state lớp; lỗi 403/404 được hiển thị.

## 5. API frontend

| Function | Method | Endpoint | Request | Response | Được gọi từ |
|---|---|---|---|---|---|
| [`getClassDetail()`](frontend/src/api/teacherApi.js#L12-L14) | GET | `/api/teacher/classes/:classId` | Path `classId` | `{ success, data: Class }` | `fetchClassDetail()` |

## 6. Backend xử lý như thế nào?

### 6.1 Route

Route nhận `classId`, chạy middleware chung và gọi `getMyClassDetail()`.

### 6.2 Middleware `protect`

`protect` xác minh JWT, đọc User hiện tại và kiểm tra active ([auth.middleware.js](backend/src/middlewares/auth.middleware.js#L8-L55)).

### 6.3 Middleware `authorize('teacher')`

Role phải đúng `teacher`; nếu không, `authorize` trả 403 ([role.middleware.js](backend/src/middlewares/role.middleware.js#L7-L24)).

### 6.4 Controller và service

Controller lấy TeacherProfile rồi gọi `checkTeacherOwnsClass(profile._id, classId)`. Service dùng `Class.findById(classId)`, trả 404 nếu lớp không tồn tại và 403 nếu `Class.teacherId` khác profile. Sau đó controller populate Subject, đếm học viên enrolled và trả 200.

## 7. Database thay đổi như thế nào?

| Model | Thao tác | Điều kiện truy vấn | Dữ liệu thay đổi |
|---|---|---|---|
| [Class](backend/src/models/Class.js#L1-L50) | `findById` | `classId` | Không thay đổi |
| [ClassStudent](backend/src/models/ClassStudent.js#L1-L40) | `countDocuments` | `classId`, `status: enrolled` | Không thay đổi |
| [Subject](backend/src/models/Subject.js#L1-L60) | populate | `Class.subjectId` | Không thay đổi |

## 8. Request và response minh họa

```http
GET /api/teacher/classes/class_1
Authorization: Bearer <jwt>
```

```json
{ "success": true, "data": { "_id": "class_1", "currentStudents": 20 } }
```

[Quay lại mục lục](#muc-luc)

---

<a id="f5-danh-sach-hoc-vien"></a>

# 5. Xem danh sách học viên

## 1. Chức năng này dùng để làm gì?

Teacher xem các học viên đang `enrolled` trong một lớp thuộc mình. Backend populate hồ sơ học viên và thông tin User; dữ liệu chỉ được đọc.

## 2. Luồng hoạt động tổng quát

1. Teacher chọn lớp và mở danh sách học viên.
2. Frontend lấy `classId` từ URL.
3. Backend kiểm tra quyền sở hữu lớp.
4. Backend lọc `ClassStudent` theo `status: 'enrolled'`.
5. Backend populate `StudentProfile.userId`.
6. Frontend hiển thị danh sách và thông tin chi tiết.

## 3. Các file tham gia xử lý

| Thứ tự | Tầng xử lý | File | Thành phần chính | Nhiệm vụ |
|---|---|---|---|---|
| 1 | Frontend Page | [TeacherClassStudentsPage.jsx](frontend/src/pages/teacher/TeacherClassStudentsPage.jsx#L10-L224) | `fetchStudents()`, `getStudentInfo()` | Tải và trình bày học viên |
| 2 | Frontend API | [teacherApi.js](frontend/src/api/teacherApi.js#L16-L18) | `getStudentsInClass()` | Gửi request |
| 3 | Backend Route | [teacher.routes.js](backend/src/modules/teacher/teacher.routes.js#L54-L60) | `GET /classes/:classId/students` | Nhận request |
| 4 | Middleware | [auth.middleware.js](backend/src/middlewares/auth.middleware.js#L8-L55), [role.middleware.js](backend/src/middlewares/role.middleware.js#L7-L24) | `protect`, `authorize` | Bảo vệ API |
| 5 | Controller | [teacher.controller.js](backend/src/modules/teacher/teacher.controller.js#L162-L186) | `getStudentsInMyClass()` | Kiểm ownership và lấy học viên |
| 6 | Service | [teacher.service.js](backend/src/modules/teacher/teacher.service.js#L26-L54) | `checkTeacherOwnsClass()`, `getActiveStudentsInClass()` | Kiểm lớp và truy vấn enrolled |
| 7 | Model | [ClassStudent.js](backend/src/models/ClassStudent.js#L1-L40), [StudentProfile.js](backend/src/models/StudentProfile.js#L1-L45), [User.js](backend/src/models/User.js#L1-L64) | Các model học viên | Dữ liệu thành viên và User |

## 4. Frontend xử lý như thế nào?

### 4.1 `fetchStudents()`

**File:** [TeacherClassStudentsPage.jsx](frontend/src/pages/teacher/TeacherClassStudentsPage.jsx#L22-L40)

- **Khi nào:** khi page mount hoặc thử lại.
- **Input:** `classId` từ URL.
- **Xử lý:** gọi `teacherApi.getStudentsInClass(classId)`.
- **Output/state:** lưu danh sách vào state; lỗi được hiển thị.

### 4.2 `getStudentInfo()`

**File:** [TeacherClassStudentsPage.jsx](frontend/src/pages/teacher/TeacherClassStudentsPage.jsx#L46-L58)

Nhận một `ClassStudent`, lấy `studentId` đã populate và chuẩn hóa tên, phụ huynh, lớp/grade, trường để UI hiển thị.

## 5. API frontend

| Function | Method | Endpoint | Request | Response | Được gọi từ |
|---|---|---|---|---|---|
| [`getStudentsInClass()`](frontend/src/api/teacherApi.js#L16-L18) | GET | `/api/teacher/classes/:classId/students` | Path `classId` | `{ success, total, data: ClassStudent[] }` | `fetchStudents()` |

## 6. Backend xử lý như thế nào?

### 6.1 Route

Route nhận `classId`, chạy `protect` và `authorize('teacher')`, rồi gọi `getStudentsInMyClass()`.

### 6.2 Middleware `protect`

JWT được verify; User được tìm lại bằng `decoded.id`, kiểm tra active và gán vào `req.user` ([auth.middleware.js](backend/src/middlewares/auth.middleware.js#L8-L55)).

### 6.3 Middleware `authorize('teacher')`

Chỉ `req.user.role === 'teacher'` được đi tiếp; role sai trả 403 ([role.middleware.js](backend/src/middlewares/role.middleware.js#L7-L24)).

### 6.4 Controller và service

Controller gọi `checkTeacherOwnsClass()` trước. Service `getActiveStudentsInClass()` lọc `ClassStudent` theo lớp và `status: 'enrolled'`, rồi populate StudentProfile/User. Response 200 chứa tổng số và danh sách.

## 7. Database thay đổi như thế nào?

| Model | Thao tác | Điều kiện truy vấn | Dữ liệu thay đổi |
|---|---|---|---|
| [Class](backend/src/models/Class.js#L1-L50) | `findById` | `classId` | Không thay đổi |
| [ClassStudent](backend/src/models/ClassStudent.js#L1-L40) | `find` | `classId`, `status: enrolled` | Không thay đổi |
| [StudentProfile](backend/src/models/StudentProfile.js#L1-L45) | populate | `ClassStudent.studentId` | Không thay đổi |
| [User](backend/src/models/User.js#L1-L64) | populate | `StudentProfile.userId` | Không thay đổi |

## 8. Request và response minh họa

```http
GET /api/teacher/classes/class_1/students
Authorization: Bearer <jwt>
```

```json
{ "success": true, "total": 1, "data": [{ "studentId": { "userId": { "name": "Nguyễn An" }, "grade": 8 }, "status": "enrolled" }] }
```

[Quay lại mục lục](#muc-luc)

---

<a id="f6-danh-sach-buoi-hoc"></a>

# 6. Xem danh sách buổi học

## 1. Chức năng này dùng để làm gì?

Teacher xem các `Session` của lớp mình, trạng thái điểm danh, tổng số học viên có mặt/vắng mặt và tài liệu. Khi đọc danh sách, backend có thể tự sinh session còn thiếu từ lịch active.

## 2. Luồng hoạt động tổng quát

1. Teacher mở `/teacher/classes/:classId/sessions`.
2. Frontend lấy chi tiết lớp và danh sách session song song.
3. Backend kiểm tra ownership.
4. Backend gọi `ensureSessionsForClass()`.
5. Service đọc lịch active và sinh các session còn thiếu.
6. Backend tính attendance summary cho từng session.
7. Frontend hiển thị bảng session và nút điểm danh.

## 3. Các file tham gia xử lý

| Thứ tự | Tầng xử lý | File | Thành phần chính | Nhiệm vụ |
|---|---|---|---|---|
| 1 | Frontend Page | [TeacherSessionsPage.jsx](frontend/src/pages/teacher/TeacherSessionsPage.jsx#L160-L380) | `fetchData()`, `SessionDetailModal` | Hiển thị session và thao tác |
| 2 | Frontend API | [teacherApi.js](frontend/src/api/teacherApi.js#L25-L27) | `getSessionsByClass()` | Gửi request |
| 3 | Backend Route | [teacher.routes.js](backend/src/modules/teacher/teacher.routes.js#L60-L66) | `GET /classes/:classId/sessions` | Nhận request |
| 4 | Middleware | [auth.middleware.js](backend/src/middlewares/auth.middleware.js#L8-L55), [role.middleware.js](backend/src/middlewares/role.middleware.js#L7-L24) | `protect`, `authorize` | Bảo vệ API |
| 5 | Controller | [teacher.controller.js](backend/src/modules/teacher/teacher.controller.js#L216-L297) | `getSessionsByClass()` | Sinh/đọc session và summary |
| 6 | Service | [session-generation.service.js](backend/src/modules/teacher/session-generation.service.js#L11-L135) | `ensureSessionsForClass()` | Sinh session theo lịch |
| 7 | Model | [Session.js](backend/src/models/Session.js#L1-L65), [Schedule.js](backend/src/models/Schedule.js#L1-L45), [Attendance.js](backend/src/models/Attendance.js#L1-L40) | Session, Schedule, Attendance | Lưu buổi và điểm danh |

## 4. Frontend xử lý như thế nào?

### 4.1 `fetchData()`

**File:** [TeacherSessionsPage.jsx](frontend/src/pages/teacher/TeacherSessionsPage.jsx#L174-L201)

- **Khi nào:** khi page mount hoặc thử lại.
- **Input:** `classId` từ URL.
- **Xử lý:** dùng `Promise.all()` gọi `getClassDetail()` và `getSessionsByClass()`.
- **Output/state:** cập nhật lớp, session, loading và lỗi; UI mở attendance từ session được chọn.

## 5. API frontend

| Function | Method | Endpoint | Request | Response | Được gọi từ |
|---|---|---|---|---|---|
| [`getSessionsByClass()`](frontend/src/api/teacherApi.js#L25-L27) | GET | `/api/teacher/classes/:classId/sessions` | Path `classId` | `Session[]` + `attendanceStatus`, `attendanceSummary` | `fetchData()` |

## 6. Backend xử lý như thế nào?

### 6.1 Route

Route `GET /classes/:classId/sessions` chạy middleware chung, gọi `getSessionsByClass()`.

### 6.2 Middleware `protect`

`protect` verify JWT, đọc User hiện tại từ DB, kiểm tra active và gán `req.user` ([auth.middleware.js](backend/src/middlewares/auth.middleware.js#L8-L55)).

### 6.3 Middleware `authorize('teacher')`

`authorize('teacher')` kiểm tra role trước khi controller chạy ([role.middleware.js](backend/src/middlewares/role.middleware.js#L7-L24)).

### 6.4 Controller và service

Controller kiểm ownership rồi gọi `ensureSessionsForClass(classId, teacherProfile._id)`. Service lấy Class, Schedule active, duyệt ngày từ `Class.startDate` và tạo tối đa `Class.totalSessions || 24` session. Session đã tồn tại theo `(classId, scheduleId, sessionDate)` được giữ nhờ unique index. Cuối cùng controller đọc attendance và thêm summary chỉ từ học viên enrolled.

## 7. Database thay đổi như thế nào?

| Model | Thao tác | Điều kiện truy vấn | Dữ liệu thay đổi |
|---|---|---|---|
| [Class](backend/src/models/Class.js#L1-L50) | `findById` | `classId` | Không thay đổi |
| [Schedule](backend/src/models/Schedule.js#L1-L45) | `find` | `classId`, `teacherId`, active | Không thay đổi |
| [Session](backend/src/models/Session.js#L1-L65) | `find`/`create` | `classId`, `scheduleId`, ngày | Có thể tạo session thiếu |
| [Attendance](backend/src/models/Attendance.js#L1-L40) | `find`/aggregate | `sessionId` | Không thay đổi |
| [ClassStudent](backend/src/models/ClassStudent.js#L1-L40) | `find`/count | `classId`, enrolled | Không thay đổi |

## 8. Request và response minh họa

```http
GET /api/teacher/classes/class_1/sessions
Authorization: Bearer <jwt>
```

```json
{ "success": true, "data": [{ "_id": "session_1", "attendanceSummary": { "total": 20, "recorded": 18, "present": 17, "absent": 1 } }] }
```

[Quay lại mục lục](#muc-luc)

---

<a id="f7-tao-buoi-hoc"></a>

# 7. Tạo buổi học

## 1. Chức năng này dùng để làm gì?

Teacher tạo một `Session` cho lớp của mình, thường từ một ô lịch chưa có buổi trong ngày đó. Database tạo bản ghi session; nếu session cùng lớp/ngày đã tồn tại, backend trả lại bản ghi hiện có theo logic hiện tại.

## 2. Luồng hoạt động tổng quát

1. Teacher bấm ô lịch chưa có session.
2. Frontend tạo body gồm ngày và thông tin lịch.
3. Frontend gửi POST tạo session.
4. Backend xác thực JWT, role và ownership lớp.
5. Backend kiểm tra `sessionDate`.
6. Backend tìm session trùng lớp/ngày.
7. Nếu chưa có, backend tạo session và trả 201.
8. Frontend mở trang attendance.

## 3. Các file tham gia xử lý

| Thứ tự | Tầng xử lý | File | Thành phần chính | Nhiệm vụ |
|---|---|---|---|---|
| 1 | Frontend Page | [TeacherSchedulesPage.jsx](frontend/src/pages/teacher/TeacherSchedulesPage.jsx#L54-L123) | `handleClassClick()` | Chuẩn bị body và điều hướng |
| 2 | Frontend API | [teacherApi.js](frontend/src/api/teacherApi.js#L29-L31) | `createSession()` | Gửi POST |
| 3 | Backend Route | [teacher.routes.js](backend/src/modules/teacher/teacher.routes.js#L63-L66) | `POST /classes/:classId/sessions` | Nhận request |
| 4 | Middleware | [auth.middleware.js](backend/src/middlewares/auth.middleware.js#L8-L55), [role.middleware.js](backend/src/middlewares/role.middleware.js#L7-L24) | `protect`, `authorize` | Kiểm tra truy cập |
| 5 | Controller | [teacher.controller.js](backend/src/modules/teacher/teacher.controller.js#L304-L370) | `createSession()` | Kiểm tra và tạo session |
| 6 | Service | [teacher.service.js](backend/src/modules/teacher/teacher.service.js#L26-L37) | `checkTeacherOwnsClass()` | Kiểm ownership |
| 7 | Model | [Session.js](backend/src/models/Session.js#L1-L65), [Class.js](backend/src/models/Class.js#L1-L50) | `Session`, `Class` | Lưu buổi học |

## 4. Frontend xử lý như thế nào?

### 4.1 `handleClassClick()`

**File:** [TeacherSchedulesPage.jsx](frontend/src/pages/teacher/TeacherSchedulesPage.jsx#L54-L123)

- **Khi nào:** click lịch không có session đúng ngày.
- **Input:** `schedule`, `dayDateStr`.
- **Xử lý:** tìm session hiện có; nếu không có thì gọi `createSession(classId, { scheduleId, sessionDate, topic, teacherId, room, startTime, endTime })`.
- **Output/state:** nhận session mới và điều hướng tới `/attendance`; lỗi hiển thị alert.

## 5. API frontend

| Function | Method | Endpoint | Request | Response | Được gọi từ |
|---|---|---|---|---|---|
| [`createSession()`](frontend/src/api/teacherApi.js#L29-L31) | POST | `/api/teacher/classes/:classId/sessions` | `sessionDate` bắt buộc; các field khác tùy chọn | 201 `{ success, data: Session }`; 200 nếu đã có | `handleClassClick()` |

## 6. Backend xử lý như thế nào?

### 6.1 Route

Route nhận `classId`, body session và gọi `createSession()` sau middleware chung.

### 6.2 Middleware `protect`

Verify JWT, lấy User hiện tại bằng `decoded.id`, kiểm tra active và đặt `req.user` ([auth.middleware.js](backend/src/middlewares/auth.middleware.js#L8-L55)).

### 6.3 Middleware `authorize('teacher')`

Role sai bị trả 403 trước khi controller xử lý ([role.middleware.js](backend/src/middlewares/role.middleware.js#L7-L24)).

### 6.4 Controller

1. Lấy TeacherProfile và kiểm `checkTeacherOwnsClass()`.
2. Nếu thiếu `sessionDate`, trả 400.
3. Tìm session đã có theo lớp/ngày.
4. Nếu chưa có, `Session.create()` với các field body và fallback hiện tại.
5. Trả 201 cho session mới, 200 nếu ngày đã có; lỗi duplicate index có thể trả 409.

## 7. Database thay đổi như thế nào?

| Model | Thao tác | Điều kiện truy vấn | Dữ liệu thay đổi |
|---|---|---|---|
| [Class](backend/src/models/Class.js#L1-L50) | `findById` qua service | `classId` | Không thay đổi |
| [TeacherProfile](backend/src/models/TeacherProfile.js#L1-L25) | `findOne` | `userId` hiện tại | Không thay đổi |
| [Session](backend/src/models/Session.js#L1-L65) | `findOne`, `create` | `classId`, ngày, tùy `scheduleId` | Có thể tạo bản ghi mới |

## 8. Request và response minh họa

```json
{ "scheduleId": "schedule_1", "sessionDate": "2026-07-15", "topic": "Chapter 1", "room": "A101" }
```

```json
{ "success": true, "data": { "_id": "session_1", "sessionDate": "2026-07-15" } }
```

**Lưu ý source:** controller hiện nhận `teacherId` và `scheduleId` từ request mà chưa xác minh đầy đủ chúng thuộc Teacher/lớp; xem [rủi ro](#rui-ro-va-chuc-nang-chua-co).

[Quay lại mục lục](#muc-luc)

---

<a id="f8-xem-diem-danh"></a>

# 8. Xem điểm danh

## 1. Chức năng này dùng để làm gì?

Teacher xem các bản ghi `Attendance` của một session thuộc lớp mình, kèm thông tin học viên đã populate. Đây là thao tác đọc, không thay đổi database.

## 2. Luồng hoạt động tổng quát

1. Teacher mở trang attendance của session.
2. Frontend lấy học viên, lớp, session và attendance hiện có.
3. Backend kiểm ownership lớp.
4. Backend kiểm session có thuộc `classId` trong URL.
5. Backend đọc Attendance theo `sessionId`.
6. Frontend ghép trạng thái cũ vào từng học viên.

## 3. Các file tham gia xử lý

| Thứ tự | Tầng xử lý | File | Thành phần chính | Nhiệm vụ |
|---|---|---|---|---|
| 1 | Frontend Page | [TeacherAttendancePage.jsx](frontend/src/pages/teacher/TeacherAttendancePage.jsx#L31-L130) | `fetchData()` | Tải dữ liệu attendance |
| 2 | Frontend API | [teacherApi.js](frontend/src/api/teacherApi.js#L33-L38) | `getAttendanceBySession()` | Gửi GET attendance |
| 3 | Backend Route | [teacher.routes.js](backend/src/modules/teacher/teacher.routes.js#L66-L72) | `GET /attendance` | Nhận request |
| 4 | Middleware | [auth.middleware.js](backend/src/middlewares/auth.middleware.js#L8-L55), [role.middleware.js](backend/src/middlewares/role.middleware.js#L7-L24) | `protect`, `authorize` | Bảo vệ API |
| 5 | Controller | [teacher.controller.js](backend/src/modules/teacher/teacher.controller.js#L378-L417) | `getAttendanceBySession()` | Kiểm session và đọc attendance |
| 6 | Service | [teacher.service.js](backend/src/modules/teacher/teacher.service.js#L26-L37) | `checkTeacherOwnsClass()` | Kiểm ownership lớp |
| 7 | Model | [Session.js](backend/src/models/Session.js#L1-L65), [Attendance.js](backend/src/models/Attendance.js#L1-L40) | `Session`, `Attendance` | Dữ liệu buổi và điểm danh |

## 4. Frontend xử lý như thế nào?

### 4.1 `fetchData()`

**File:** [TeacherAttendancePage.jsx](frontend/src/pages/teacher/TeacherAttendancePage.jsx#L56-L130)

- **Khi nào:** khi page mount hoặc sau khi lưu/upload/xóa để tải lại.
- **Input:** `classId`, `sessionId` từ URL.
- **Xử lý:** `Promise.all()` gọi học viên, attendance, class và sessions; attendance cũ được ghép vào danh sách.
- **Output/state:** UI hiển thị trạng thái PRESENT/ABSENT và ghi chú hiện có.

## 5. API frontend

| Function | Method | Endpoint | Request | Response | Được gọi từ |
|---|---|---|---|---|---|
| [`getAttendanceBySession()`](frontend/src/api/teacherApi.js#L33-L35) | GET | `/api/teacher/classes/:classId/sessions/:sessionId/attendance` | Path params | `{ success, total, data: Attendance[] }` | `fetchData()` |
| [`getStudentsInClass()`](frontend/src/api/teacherApi.js#L16-L18) | GET | `/api/teacher/classes/:classId/students` | Path `classId` | Danh sách học viên enrolled | `fetchData()` |

## 6. Backend xử lý như thế nào?

### 6.1 Route

Route GET attendance chạy middleware chung rồi gọi `getAttendanceBySession()`.

### 6.2 Middleware `protect`

`protect` verify token, tra User bằng `decoded.id`, kiểm tra active và đặt `req.user` ([auth.middleware.js](backend/src/middlewares/auth.middleware.js#L8-L55)).

### 6.3 Middleware `authorize('teacher')`

Role phải là `teacher`; nếu không, response là 403 ([role.middleware.js](backend/src/middlewares/role.middleware.js#L7-L24)).

### 6.4 Controller

Controller lấy profile, gọi `checkTeacherOwnsClass()`, sau đó chạy `Session.findOne({ _id: sessionId, classId })`. Điều kiện gồm cả hai ID để không lấy session cùng ID nhưng thuộc lớp khác. Cuối cùng `Attendance.find({ sessionId })` populate student/user và trả 200.

## 7. Database thay đổi như thế nào?

| Model | Thao tác | Điều kiện truy vấn | Dữ liệu thay đổi |
|---|---|---|---|
| [Class](backend/src/models/Class.js#L1-L50) | `findById` qua ownership check | `classId` | Không thay đổi |
| [Session](backend/src/models/Session.js#L1-L65) | `findOne` | `{ _id: sessionId, classId }` | Không thay đổi |
| [Attendance](backend/src/models/Attendance.js#L1-L40) | `find` + populate | `{ sessionId }` | Không thay đổi |

## 8. Request và response minh họa

```http
GET /api/teacher/classes/class_1/sessions/session_1/attendance
Authorization: Bearer <jwt>
```

```json
{ "success": true, "total": 1, "data": [{ "studentId": "student_1", "status": "PRESENT", "note": "" }] }
```

**Lưu ý source:** GET hiện đọc mọi record của session, không lọc lại theo `ClassStudent.status: 'enrolled'`.

[Quay lại mục lục](#muc-luc)

---

<a id="f9-luu-diem-danh"></a>

# 9. Lưu điểm danh

## 1. Chức năng này dùng để làm gì?

Teacher chọn trạng thái có mặt/vắng mặt và ghi chú cho từng học viên rồi lưu. Backend upsert `Attendance`; item không có `status` sẽ xóa attendance tương ứng; sau đó session được chuyển sang `COMPLETED`.

## 2. Luồng hoạt động tổng quát

1. Teacher mở trang điểm danh.
2. Frontend lấy học viên và attendance cũ.
3. Teacher chọn `PRESENT` hoặc `ABSENT` và nhập ghi chú.
4. Frontend tạo mảng `attendances`.
5. Backend kiểm JWT, role, ownership và session/class.
6. Backend dùng `findOneAndUpdate` với `upsert: true` cho item có status.
7. Backend dùng `findOneAndDelete` cho item không có status.
8. Backend lưu `session.status = 'COMPLETED'`.
9. Frontend tải lại dữ liệu và hiển thị thành công.

## 3. Các file tham gia xử lý

| Thứ tự | Tầng xử lý | File | Thành phần chính | Nhiệm vụ |
|---|---|---|---|---|
| 1 | Frontend Page | [TeacherAttendancePage.jsx](frontend/src/pages/teacher/TeacherAttendancePage.jsx#L142-L192) | `handleStatusChange()`, `handleNoteChange()`, `handleSaveAttendance()` | Tạo và gửi trạng thái |
| 2 | Frontend API | [teacherApi.js](frontend/src/api/teacherApi.js#L36-L38) | `takeAttendance()` | Gửi POST |
| 3 | Backend Route | [teacher.routes.js](backend/src/modules/teacher/teacher.routes.js#L68-L72) | `POST /attendance` | Nhận request |
| 4 | Middleware | [auth.middleware.js](backend/src/middlewares/auth.middleware.js#L8-L55), [role.middleware.js](backend/src/middlewares/role.middleware.js#L7-L24) | `protect`, `authorize` | Kiểm đăng nhập và role |
| 5 | Controller | [teacher.controller.js](backend/src/modules/teacher/teacher.controller.js#L424-L488) | `takeAttendance()` | Upsert/xóa attendance và hoàn tất session |
| 6 | Service | [teacher.service.js](backend/src/modules/teacher/teacher.service.js#L26-L37) | `checkTeacherOwnsClass()` | Kiểm lớp thuộc Teacher |
| 7 | Model | [Attendance.js](backend/src/models/Attendance.js#L1-L40), [Session.js](backend/src/models/Session.js#L1-L65) | `Attendance`, `Session` | Lưu điểm danh và trạng thái buổi |

## 4. Frontend xử lý như thế nào?

### 4.1 `fetchData()`

**File:** [TeacherAttendancePage.jsx](frontend/src/pages/teacher/TeacherAttendancePage.jsx#L56-L130)

Tải học viên, attendance cũ, lớp và session bằng `Promise.all()`. Kết quả attendance được ghép vào state của từng học viên để UI biết trạng thái đã lưu.

### 4.2 `handleStatusChange()`

**File:** [TeacherAttendancePage.jsx](frontend/src/pages/teacher/TeacherAttendancePage.jsx#L142-L152)

- **Khi nào:** Teacher bấm nút PRESENT/ABSENT.
- **Input:** `studentId`, `status`.
- **Xử lý:** chỉ cập nhật state cục bộ; chưa gửi API.
- **Output/state:** đổi trạng thái hiển thị của học viên.

### 4.3 `handleNoteChange()`

**File:** [TeacherAttendancePage.jsx](frontend/src/pages/teacher/TeacherAttendancePage.jsx#L154-L160)

Nhận `studentId`, `note` và cập nhật ghi chú trong state cục bộ.

### 4.4 `handleSaveAttendance()`

**File:** [TeacherAttendancePage.jsx](frontend/src/pages/teacher/TeacherAttendancePage.jsx#L162-L192)

- **Khi nào:** Teacher bấm Lưu.
- **Input:** state danh sách học viên/trạng thái/ghi chú.
- **Xử lý:** tạo `{ attendances: [{ studentId, status, note }] }`, gọi `teacherApi.takeAttendance()`.
- **Output/state:** xử lý loading, toast lỗi/thành công, gọi lại `fetchData()` và quay về danh sách session.

## 5. API frontend

| Function | Method | Endpoint | Request | Response | Được gọi từ |
|---|---|---|---|---|---|
| [`takeAttendance()`](frontend/src/api/teacherApi.js#L36-L38) | POST | `/api/teacher/classes/:classId/sessions/:sessionId/attendance` | `{ attendances: [{ studentId, status, note }] }` | `{ success, total, data }` | `handleSaveAttendance()` |

## 6. Backend xử lý như thế nào?

### 6.1 Route

Route POST nhận `classId`, `sessionId`, body `attendances` và gọi `takeAttendance()` sau middleware chung.

### 6.2 Middleware `protect`

Lấy Bearer token, verify JWT, dùng `decoded.id` để `User.findById`, kiểm tra `isActive`, gán user vào `req.user` ([auth.middleware.js](backend/src/middlewares/auth.middleware.js#L8-L55)).

### 6.3 Middleware `authorize('teacher')`

Đọc `req.user.role`; chỉ `teacher` được gọi controller, role khác trả 403 ([role.middleware.js](backend/src/middlewares/role.middleware.js#L7-L24)).

### 6.4 Controller theo từng đoạn logic

#### Đoạn 1: Lấy `TeacherProfile`

`getTeacherProfileByUserId(req.user._id)` chuyển User hiện tại thành profile được dùng trong `Class.teacherId`.

#### Đoạn 2: Kiểm tra quyền sở hữu lớp

`checkTeacherOwnsClass(teacherProfile._id, classId)` đọc lớp và từ chối 404/403 nếu lớp không tồn tại hoặc thuộc Teacher khác.

#### Đoạn 3: Kiểm tra Session

`Session.findOne({ _id: sessionId, classId })` đảm bảo session vừa đúng ID vừa thuộc lớp trong URL.

#### Đoạn 4: Cập nhật `Attendance`

Với item có `status`, controller dùng `findOneAndUpdate` với khóa `{ sessionId, studentId }` và `upsert: true`, nên có thì cập nhật, chưa có thì tạo. Với item không có status, controller dùng `findOneAndDelete`. Model có unique key `(sessionId, studentId)` và enum status gồm `PRESENT`, `ABSENT`, `LATE`, `EXCUSED`; tuy nhiên controller hiện chưa gọi utility validation và chưa kiểm tra `studentId` có enrolled trong lớp.

#### Đoạn 5: Cập nhật Session

`session.status = 'COMPLETED'` rồi `session.save()` đánh dấu buổi đã được xử lý attendance.

#### Đoạn 6: Trả response

Request hợp lệ trả 200 với `{ success, total, data }`. Thiếu mảng attendance trả 400; ownership sai là 403; session không thuộc lớp là 404; dữ liệu status/ObjectId không hợp lệ có thể rơi thành lỗi 500 theo source hiện tại.

## 7. Database thay đổi như thế nào?

| Model | Thao tác | Điều kiện truy vấn | Dữ liệu thay đổi |
|---|---|---|---|
| [TeacherProfile](backend/src/models/TeacherProfile.js#L1-L25) | `findOne` | `{ userId: req.user._id }` | Không thay đổi |
| [Class](backend/src/models/Class.js#L1-L50) | `findById` | `classId` | Không thay đổi |
| [Session](backend/src/models/Session.js#L1-L65) | `findOne`, `save` | `{ _id: sessionId, classId }` | `status = COMPLETED` |
| [Attendance](backend/src/models/Attendance.js#L1-L40) | `findOneAndUpdate` hoặc `findOneAndDelete` | `sessionId`, `studentId` | `status`, `note`, `takenBy` hoặc xóa record |

## 8. Request và response minh họa

```json
{
  "attendances": [
    { "studentId": "student_profile_id", "status": "PRESENT", "note": "" },
    { "studentId": "student_profile_id_2", "status": "ABSENT", "note": "Nghỉ có phép" }
  ]
}
```

```json
{ "success": true, "total": 2, "data": [{ "studentId": "student_profile_id", "status": "PRESENT" }] }
```

[Quay lại mục lục](#muc-luc)

---

<a id="f10-upload-tai-lieu"></a>

# 10. Upload tài liệu buổi học

## 1. Chức năng này dùng để làm gì?

Teacher chọn tối đa 10 file cho một session thuộc lớp mình. File được lưu vào `uploads/sessions/`, còn đường dẫn được thêm vào `Session.materials`.

## 2. Luồng hoạt động tổng quát

1. Teacher chọn file trên trang attendance.
2. Frontend tạo `FormData` với field `materials`.
3. Frontend gửi multipart request.
4. Middleware xác thực Teacher và multer nhận tối đa 10 file.
5. Backend kiểm ownership và session/class.
6. Backend thêm đường dẫn file vào session.
7. Frontend tải lại session và hiển thị file.

## 3. Các file tham gia xử lý

| Thứ tự | Tầng xử lý | File | Thành phần chính | Nhiệm vụ |
|---|---|---|---|---|
| 1 | Frontend Page | [TeacherAttendancePage.jsx](frontend/src/pages/teacher/TeacherAttendancePage.jsx#L194-L215) | `handleUploadMaterials()` | Tạo FormData và upload |
| 2 | Frontend API | [teacherApi.js](frontend/src/api/teacherApi.js#L40-L46) | `uploadSessionMaterials()` | Gửi multipart |
| 3 | Backend Route | [teacher.routes.js](backend/src/modules/teacher/teacher.routes.js#L75-L79) | `upload.array('materials', 10)` | Nhận file |
| 4 | Middleware | [auth.middleware.js](backend/src/middlewares/auth.middleware.js#L8-L55), [role.middleware.js](backend/src/middlewares/role.middleware.js#L7-L24) | `protect`, `authorize` | Bảo vệ API |
| 5 | Controller | [teacher.controller.js](backend/src/modules/teacher/teacher.controller.js#L531-L568) | `uploadSessionMaterials()` | Cập nhật Session.materials |
| 6 | Service | [teacher.service.js](backend/src/modules/teacher/teacher.service.js#L26-L37) | `checkTeacherOwnsClass()` | Kiểm ownership |
| 7 | Model | [Session.js](backend/src/models/Session.js#L1-L65) | `Session` | Lưu metadata file |

## 4. Frontend xử lý như thế nào?

### 4.1 `handleUploadMaterials()`

**File:** [TeacherAttendancePage.jsx](frontend/src/pages/teacher/TeacherAttendancePage.jsx#L194-L215)

- **Khi nào:** submit form upload.
- **Input:** danh sách file đã chọn.
- **Xử lý:** tạo `FormData`, append từng file dưới key `materials`, gọi API và quản lý trạng thái uploading.
- **Output/state:** hiển thị thông báo, gọi `fetchData()` để reload session.

## 5. API frontend

| Function | Method | Endpoint | Request | Response | Được gọi từ |
|---|---|---|---|---|---|
| [`uploadSessionMaterials()`](frontend/src/api/teacherApi.js#L40-L46) | POST | `/api/teacher/classes/:classId/sessions/:sessionId/upload` | `multipart/form-data`, field `materials`, tối đa 10 file | `{ success, message, data: Session }` | `handleUploadMaterials()` |

## 6. Backend xử lý như thế nào?

### 6.1 Route

Route POST chạy `protect`, `authorize('teacher')`, `upload.array('materials', 10)`, rồi gọi controller.

### 6.2 Middleware `protect`

JWT và User hiện tại được xác minh như các chức năng khác ([auth.middleware.js](backend/src/middlewares/auth.middleware.js#L8-L55)).

### 6.3 Middleware `authorize('teacher')`

Role phải là `teacher` ([role.middleware.js](backend/src/middlewares/role.middleware.js#L7-L24)). Multer giới hạn số file là 10 nhưng source chưa đặt giới hạn size/type.

### 6.4 Controller

Controller kiểm ownership, tìm session theo `sessionId` và `classId`, từ chối nếu không có file, tạo metadata từ `req.files`, nối vào `session.materials`, save và trả 200. Nếu lưu database lỗi, source cố gắng xóa file vừa upload.

## 7. Database thay đổi như thế nào?

| Model | Thao tác | Điều kiện truy vấn | Dữ liệu thay đổi |
|---|---|---|---|
| [Class](backend/src/models/Class.js#L1-L50) | `findById` qua ownership | `classId` | Không thay đổi |
| [Session](backend/src/models/Session.js#L1-L65) | `findOne`, `save` | `sessionId`, `classId` | Thêm item vào `materials` |
| Filesystem | multer write | `uploads/sessions/` | Tạo file vật lý |

## 8. Request và response minh họa

```text
POST /api/teacher/classes/class_1/sessions/session_1/upload
Authorization: Bearer <jwt>
Content-Type: multipart/form-data
materials: lesson-01.pdf
```

```json
{ "success": true, "message": "Materials uploaded successfully", "data": { "materials": ["uploads/sessions/file.pdf"] } }
```

[Quay lại mục lục](#muc-luc)

---

<a id="f11-xoa-tai-lieu"></a>

# 11. Xóa tài liệu buổi học

## 1. Chức năng này dùng để làm gì?

Teacher xóa một file đã gắn vào session. Backend xóa file vật lý và xóa URL tương ứng khỏi `Session.materials`.

## 2. Luồng hoạt động tổng quát

1. Teacher bấm xóa file.
2. Frontend gửi `fileUrl` trong request body.
3. Backend kiểm JWT, role, ownership và session/class.
4. Backend resolve đường dẫn và xóa file.
5. Backend loại URL khỏi `Session.materials`.
6. Frontend tải lại danh sách tài liệu.

## 3. Các file tham gia xử lý

| Thứ tự | Tầng xử lý | File | Thành phần chính | Nhiệm vụ |
|---|---|---|---|---|
| 1 | Frontend Page | [TeacherAttendancePage.jsx](frontend/src/pages/teacher/TeacherAttendancePage.jsx#L219-L227) | `handleDeleteMaterial()` | Gửi yêu cầu xóa |
| 2 | Frontend API | [teacherApi.js](frontend/src/api/teacherApi.js#L48-L50) | `deleteSessionMaterial()` | Gửi DELETE |
| 3 | Backend Route | [teacher.routes.js](backend/src/modules/teacher/teacher.routes.js#L81-L82) | `DELETE /file` | Nhận fileUrl |
| 4 | Middleware | [auth.middleware.js](backend/src/middlewares/auth.middleware.js#L8-L55), [role.middleware.js](backend/src/middlewares/role.middleware.js#L7-L24) | `protect`, `authorize` | Bảo vệ API |
| 5 | Controller | [teacher.controller.js](backend/src/modules/teacher/teacher.controller.js#L575-L612) | `deleteSessionMaterial()` | Xóa file và cập nhật session |
| 6 | Service | [teacher.service.js](backend/src/modules/teacher/teacher.service.js#L26-L37) | `checkTeacherOwnsClass()` | Kiểm ownership |
| 7 | Model | [Session.js](backend/src/models/Session.js#L1-L65) | `Session` | Lưu danh sách tài liệu |

## 4. Frontend xử lý như thế nào?

### 4.1 `handleDeleteMaterial()`

**File:** [TeacherAttendancePage.jsx](frontend/src/pages/teacher/TeacherAttendancePage.jsx#L219-L227)

- **Khi nào:** Teacher bấm nút xóa tại một file.
- **Input:** `fileUrl` của file.
- **Xử lý:** gọi `teacherApi.deleteSessionMaterial(classId, sessionId, fileUrl)`.
- **Output/state:** thông báo kết quả và gọi `fetchData()` để cập nhật danh sách.

## 5. API frontend

| Function | Method | Endpoint | Request | Response | Được gọi từ |
|---|---|---|---|---|---|
| [`deleteSessionMaterial()`](frontend/src/api/teacherApi.js#L48-L50) | DELETE | `/api/teacher/classes/:classId/sessions/:sessionId/file` | `{ fileUrl }` | `{ success, message, data: Session }` | `handleDeleteMaterial()` |

## 6. Backend xử lý như thế nào?

### 6.1 Route

Route DELETE chạy middleware chung rồi gọi `deleteSessionMaterial()`.

### 6.2 Middleware `protect`

Verify JWT, tìm User hiện tại, kiểm tra active và gán `req.user` ([auth.middleware.js](backend/src/middlewares/auth.middleware.js#L8-L55)).

### 6.3 Middleware `authorize('teacher')`

Kiểm role `teacher`, role khác nhận 403 ([role.middleware.js](backend/src/middlewares/role.middleware.js#L7-L24)).

### 6.4 Controller

Controller kiểm ownership và session/class, nhận `fileUrl`, resolve path, gọi `fs.unlink`, lọc file khỏi `session.materials`, save và trả response. Source hiện không ràng buộc chặt `fileUrl` phải là file thuộc session hoặc nằm trong thư mục cho phép.

## 7. Database thay đổi như thế nào?

| Model | Thao tác | Điều kiện truy vấn | Dữ liệu thay đổi |
|---|---|---|---|
| [Class](backend/src/models/Class.js#L1-L50) | ownership lookup | `classId` | Không thay đổi |
| [Session](backend/src/models/Session.js#L1-L65) | `findOne`, `save` | `sessionId`, `classId` | Xóa URL khỏi `materials` |
| Filesystem | `fs.unlink` | path từ `fileUrl` | Xóa file vật lý |

## 8. Request và response minh họa

```json
{ "fileUrl": "uploads/sessions/lesson-01.pdf" }
```

```json
{ "success": true, "message": "Material deleted successfully", "data": { "materials": [] } }
```

[Quay lại mục lục](#muc-luc)

---

<a id="f12-mon-hoc"></a>

# 12. Xem môn học và tài liệu môn học

## 1. Chức năng này dùng để làm gì?

Teacher xem và tìm các môn suy ra từ những lớp mình được phân công, sau đó xem/tải tài liệu của môn. API là read-only đối với Teacher.

## 2. Luồng hoạt động tổng quát

1. Teacher mở page subjects.
2. Frontend gửi query `search` nếu có từ khóa.
3. Backend lấy TeacherProfile và các lớp của Teacher.
4. Backend suy ra danh sách Subject.
5. Frontend hiển thị môn và tài liệu.
6. Teacher mở hoặc tải file tài liệu.

## 3. Các file tham gia xử lý

| Thứ tự | Tầng xử lý | File | Thành phần chính | Nhiệm vụ |
|---|---|---|---|---|
| 1 | Frontend Page | [TeacherSubjectsPage.jsx](frontend/src/pages/teacher/TeacherSubjectsPage.jsx#L9-L226) | `fetchSubjects()`, `handleOpenViewFiles()` | Hiển thị môn/tài liệu |
| 2 | Frontend API | [teacherApi.js](frontend/src/api/teacherApi.js#L53-L56) | `getMySubjects()` | Gửi query subjects |
| 3 | Frontend file utility | [fileUtils.js](frontend/src/utils/fileUtils.js#L1-L80) | `getFileUrl()`, `downloadFile()` | Mở/tải file |
| 4 | Backend Route | [teacher.routes.js](backend/src/modules/teacher/teacher.routes.js#L44-L49) | `GET /subjects` | Nhận request |
| 5 | Middleware | [auth.middleware.js](backend/src/middlewares/auth.middleware.js#L8-L55), [role.middleware.js](backend/src/middlewares/role.middleware.js#L7-L24) | `protect`, `authorize` | Bảo vệ API |
| 6 | Controller | [teacher.controller.js](backend/src/modules/teacher/teacher.controller.js#L495-L524) | `getMySubjects()` | Đọc Subject theo lớp Teacher |
| 7 | Model | [Subject.js](backend/src/models/Subject.js#L1-L60), [Class.js](backend/src/models/Class.js#L1-L50) | `Subject`, `Class` | Môn và quan hệ lớp |

## 4. Frontend xử lý như thế nào?

### 4.1 `fetchSubjects()`

**File:** [TeacherSubjectsPage.jsx](frontend/src/pages/teacher/TeacherSubjectsPage.jsx#L20-L37)

- **Khi nào:** khi page mount hoặc search thay đổi.
- **Input:** `search` tùy chọn.
- **Xử lý:** gọi `getMySubjects({ search })`, cập nhật danh sách.
- **Output/state:** UI hiển thị môn, syllabus và tài liệu.

### 4.2 `handleOpenViewFiles()`

**File:** [TeacherSubjectsPage.jsx](frontend/src/pages/teacher/TeacherSubjectsPage.jsx#L39-L45)

Nhận một subject, đưa tài liệu vào state/modal để Teacher xem hoặc tải. File URL được xử lý bởi utility file.

## 5. API frontend

| Function | Method | Endpoint | Request | Response | Được gọi từ |
|---|---|---|---|---|---|
| [`getMySubjects()`](frontend/src/api/teacherApi.js#L53-L56) | GET | `/api/teacher/subjects?search=` | Query `search` tùy chọn | `{ success, total, data: Subject[] }` | `fetchSubjects()` |

## 6. Backend xử lý như thế nào?

### 6.1 Route

Route GET `/api/teacher/subjects` chạy middleware chung rồi gọi `getMySubjects()`.

### 6.2 Middleware `protect`

JWT, User hiện tại và `isActive` được kiểm tra trong `protect` ([auth.middleware.js](backend/src/middlewares/auth.middleware.js#L8-L55)).

### 6.3 Middleware `authorize('teacher')`

Role phải là `teacher` ([role.middleware.js](backend/src/middlewares/role.middleware.js#L7-L24)).

### 6.4 Controller

Controller lấy profile, tìm lớp của profile rồi suy ra Subject, có thể lọc theo `search`, và trả danh sách. Source hiện dùng các status `upcoming`/`in_progress` trong query trong khi enum Class được ghi nhận là `scheduled`/`ongoing`/`completed`/`cancelled`; vì vậy kết quả có thể rỗng.

## 7. Database thay đổi như thế nào?

| Model | Thao tác | Điều kiện truy vấn | Dữ liệu thay đổi |
|---|---|---|---|
| [TeacherProfile](backend/src/models/TeacherProfile.js#L1-L25) | `findOne` | `userId` hiện tại | Không thay đổi |
| [Class](backend/src/models/Class.js#L1-L50) | `find`/distinct | `teacherId`, status hiện tại | Không thay đổi |
| [Subject](backend/src/models/Subject.js#L1-L60) | `find` | ID môn suy ra từ lớp | Không thay đổi |

## 8. Request và response minh họa

```http
GET /api/teacher/subjects?search=math
Authorization: Bearer <jwt>
```

```json
{ "success": true, "total": 1, "data": [{ "name": "Mathematics", "materials": [{ "fileUrl": "uploads/subjects/math.pdf" }] }] }
```

**Lưu ý source:** page có route nhưng Sidebar không có mục dẫn tới page; `TeacherSubjectsPage.jsx` còn lỗi build do trùng tên `getFileName`.

[Quay lại mục lục](#muc-luc)

---

<a id="f13-ho-so"></a>

# 13. Xem và cập nhật hồ sơ cá nhân

## 1. Chức năng này dùng để làm gì?

Teacher xem hồ sơ của chính mình và cập nhật thông tin cơ bản như tên, số điện thoại, địa chỉ, ngày sinh hoặc giới tính. Backend luôn cập nhật user của caller; không thể chọn user khác bằng request này.

## 2. Luồng hoạt động tổng quát

1. Teacher mở modal hồ sơ trong Header.
2. Frontend đọc hoặc hiển thị thông tin hiện tại.
3. Teacher sửa thông tin cơ bản.
4. Frontend gửi `PUT /api/profile/me`.
5. Backend dùng `req.user._id` để cập nhật User.
6. Frontend cập nhật localStorage và reload UI.
7. API đổi password/avatar/clear tồn tại nhưng chưa được UI Teacher hiện tại nối vào.

## 3. Các file tham gia xử lý

| Thứ tự | Tầng xử lý | File | Thành phần chính | Nhiệm vụ |
|---|---|---|---|---|
| 1 | Frontend Layout | [Header.jsx](frontend/src/components/layout/Header.jsx#L120-L146) | `UserInfoModal.handleSave()` | Nhận và lưu thông tin cơ bản |
| 2 | Frontend API | [profileApi.js](frontend/src/api/profileApi.js#L3-L23) | `getMyProfile()`, `updateMyProfile()` | Gọi API hồ sơ |
| 3 | Backend Route | [profile.routes.js](backend/src/routes/profile.routes.js#L11-L22) | `/profile/me` | Nhận request sau `protect` |
| 4 | Middleware | [auth.middleware.js](backend/src/middlewares/auth.middleware.js#L8-L55) | `protect` | Kiểm tra đăng nhập |
| 5 | Controller | [profile.controller.js](backend/src/controllers/profile.controller.js#L9-L219) | Profile handlers | Đọc/sửa hồ sơ caller |
| 6 | Model | [User.js](backend/src/models/User.js#L1-L64), [TeacherProfile.js](backend/src/models/TeacherProfile.js#L1-L25) | `User`, `TeacherProfile` | Lưu account và profile |

## 4. Frontend xử lý như thế nào?

### 4.1 `UserInfoModal.handleSave()`

**File:** [Header.jsx](frontend/src/components/layout/Header.jsx#L120-L146)

- **Khi nào:** Teacher bấm lưu trong modal.
- **Input:** `fullName`, `phone`, `address`.
- **Xử lý:** gọi `profileApi.updateMyProfile()`, cập nhật user ở localStorage.
- **Output/state:** reload để Header hiển thị dữ liệu mới.

### 4.2 Các API profile chưa nối UI hiện tại

**File:** [profileApi.js](frontend/src/api/profileApi.js#L11-L23)

`clearMyProfile()`, `changePassword()` và `updateAvatar()` đã có ở API client/backend nhưng không thấy `Header`/`TeacherLayout` gọi trong source hiện tại.

## 5. API frontend

| Function | Method | Endpoint | Request | Response | Được gọi từ |
|---|---|---|---|---|---|
| [`getMyProfile()`](frontend/src/api/profileApi.js#L3-L7) | GET | `/api/profile/me` | Không body | User + profile tương ứng | Layout/profile UI |
| [`updateMyProfile()`](frontend/src/api/profileApi.js#L8-L10) | PUT | `/api/profile/me` | `fullName`, phone/address/dateOfBirth/gender tùy chọn | `{ success, data: user }` | `UserInfoModal.handleSave()` |
| [`clearMyProfile()`](frontend/src/api/profileApi.js#L11-L14) | PATCH | `/api/profile/me/clear` | Không body | `{ success, data: user }` | Chưa thấy UI gọi |
| [`changePassword()`](frontend/src/api/profileApi.js#L16-L18) | PUT | `/api/profile/me/password` | `currentPassword`, `newPassword` | `{ success, message }` | Chưa thấy UI gọi |
| [`updateAvatar()`](frontend/src/api/profileApi.js#L20-L22) | PUT | `/api/profile/me/avatar` | `{ avatar }` | `{ success, data: user }` | Chưa thấy UI gọi |

## 6. Backend xử lý như thế nào?

### 6.1 Route

`profile.routes.js` dùng `router.use(protect)` cho toàn bộ route. `/me` có GET và PUT; clear/password/avatar là các route riêng.

### 6.2 Middleware `protect`

Route lấy Bearer token, verify JWT, tìm User bằng `decoded.id`, kiểm tra active và gán `req.user` ([auth.middleware.js](backend/src/middlewares/auth.middleware.js#L8-L55)).

### 6.3 Middleware `authorize('teacher')`

Không có `authorize('teacher')` riêng ở profile route. Quyền được giới hạn bằng `protect` và controller chỉ dùng `req.user`; vì vậy API dùng chung cho nhiều role.

### 6.4 Controller

`getMyProfile()` trả User và profile tương ứng; với role teacher, profile là `TeacherProfile.findOne({ userId: user._id })`. `updateMyProfile()` chỉ update `req.user._id` với các field cho phép. Password/avatar/clear có controller riêng.

## 7. Database thay đổi như thế nào?

| Model | Thao tác | Điều kiện truy vấn | Dữ liệu thay đổi |
|---|---|---|---|
| [User](backend/src/models/User.js#L1-L64) | `findById`, `findByIdAndUpdate` | `req.user._id` | Tên, phone, address, thông tin tài khoản tùy endpoint |
| [TeacherProfile](backend/src/models/TeacherProfile.js#L1-L25) | `findOne` | `{ userId: req.user._id }` | Không đổi trong luồng update hiện tại |

## 8. Request và response minh họa

```json
{ "fullName": "Nguyễn Văn A", "phone": "0900000000", "address": "Hà Nội" }
```

```json
{ "success": true, "data": { "_id": "user_1", "name": "Nguyễn Văn A", "role": "teacher" } }
```

[Quay lại mục lục](#muc-luc)

---

<a id="f14-dashboard"></a>

# 14. Dashboard Teacher

## 1. Chức năng này dùng để làm gì?

Dashboard cung cấp thống kê tổng quan: số lớp, số lịch active và số học viên. API/controller tồn tại trong source, nhưng page hiện không được khai báo route Teacher hoàn chỉnh và binding response không khớp.

## 2. Luồng hoạt động tổng quát

1. `TeacherDashboardPage` gọi API dashboard khi mount.
2. Backend xác thực Teacher.
3. Backend lấy TeacherProfile.
4. Backend đếm lớp, lịch active và học viên.
5. Backend trả object thống kê.
6. Page đọc response và hiển thị các card.
7. Trong source hiện tại, người dùng không đi tới page qua route `/teacher/dashboard` đã khai báo.

## 3. Các file tham gia xử lý

| Thứ tự | Tầng xử lý | File | Thành phần chính | Nhiệm vụ |
|---|---|---|---|---|
| 1 | Frontend Page | [TeacherDashboardPage.jsx](frontend/src/pages/teacher/TeacherDashboardPage.jsx#L7-L110) | `fetchDashboard()` | Gọi API và hiển thị thống kê |
| 2 | Frontend API | [teacherApi.js](frontend/src/api/teacherApi.js#L5-L7) | `getDashboard()` | Gửi GET dashboard |
| 3 | Frontend Route | [AppRoutes.jsx](frontend/src/routes/AppRoutes.jsx#L164-L176) | Nested Teacher routes | Hiện thiếu child `dashboard` |
| 4 | Backend Route | [teacher.routes.js](backend/src/modules/teacher/teacher.routes.js#L42-L45) | `GET /dashboard` | Nhận request |
| 5 | Middleware | [auth.middleware.js](backend/src/middlewares/auth.middleware.js#L8-L55), [role.middleware.js](backend/src/middlewares/role.middleware.js#L7-L24) | `protect`, `authorize` | Bảo vệ API |
| 6 | Controller | [teacher.controller.js](backend/src/modules/teacher/teacher.controller.js#L29-L68) | `getTeacherDashboard()` | Tính thống kê |
| 7 | Model | [Class.js](backend/src/models/Class.js#L1-L50), [Schedule.js](backend/src/models/Schedule.js#L1-L45), [ClassStudent.js](backend/src/models/ClassStudent.js#L1-L40) | Các model thống kê | Đọc dữ liệu tổng hợp |

## 4. Frontend xử lý như thế nào?

### 4.1 `fetchDashboard()`

**File:** [TeacherDashboardPage.jsx](frontend/src/pages/teacher/TeacherDashboardPage.jsx#L7-L25)

- **Khi nào:** khi page mount hoặc thử lại.
- **Input:** không có input nghiệp vụ.
- **Xử lý:** gọi `teacherApi.getDashboard()` và lưu response vào `dashboardData`.
- **Output/state:** các card đọc state để hiển thị tổng số; source hiện đang chờ key/shape khác response backend.

## 5. API frontend

| Function | Method | Endpoint | Request | Response | Được gọi từ |
|---|---|---|---|---|---|
| [`getDashboard()`](frontend/src/api/teacherApi.js#L5-L7) | GET | `/api/teacher/dashboard` | Không body | `{ success, data: { totalClasses, totalActiveSchedules, totalStudents } }` | `fetchDashboard()` |

## 6. Backend xử lý như thế nào?

### 6.1 Route

Route `GET /api/teacher/dashboard` gọi `getTeacherDashboard()` sau middleware chung.

### 6.2 Middleware `protect`

`protect` verify JWT, đọc User hiện tại và kiểm tra active ([auth.middleware.js](backend/src/middlewares/auth.middleware.js#L8-L55)).

### 6.3 Middleware `authorize('teacher')`

`authorize('teacher')` chặn role khác bằng 403 ([role.middleware.js](backend/src/middlewares/role.middleware.js#L7-L24)).

### 6.4 Controller

Controller lấy TeacherProfile, đếm các lớp/lịch/học viên liên quan và trả response thống kê. Không có thao tác ghi database.

## 7. Database thay đổi như thế nào?

| Model | Thao tác | Điều kiện truy vấn | Dữ liệu thay đổi |
|---|---|---|---|
| [TeacherProfile](backend/src/models/TeacherProfile.js#L1-L25) | `findOne` | `userId` hiện tại | Không thay đổi |
| [Class](backend/src/models/Class.js#L1-L50) | `count` | `teacherId` | Không thay đổi |
| [Schedule](backend/src/models/Schedule.js#L1-L45) | `count` | Teacher/lịch active | Không thay đổi |
| [ClassStudent](backend/src/models/ClassStudent.js#L1-L40) | `count`/aggregate | các lớp của Teacher | Không thay đổi |

## 8. Request và response minh họa

```http
GET /api/teacher/dashboard
Authorization: Bearer <jwt>
```

```json
{ "success": true, "data": { "totalClasses": 3, "totalActiveSchedules": 5, "totalStudents": 72 } }
```

**Lưu ý source:** `AppRoutes.jsx` chưa khai báo route `teacher/dashboard`; `TeacherDashboardPage.jsx` cũng đang đọc shape/key không khớp (`totalSchedules` ở root thay vì `data.totalActiveSchedules`).

[Quay lại mục lục](#muc-luc)

---

<a id="mo-hinh-tai-khoan-va-quyen"></a>

## Mô hình tài khoản và quyền

`Teacher` được tạo bởi hai bản ghi liên hệ 1–1:

1. `User` có `role: 'teacher'` ([User.js](backend/src/models/User.js#L36-L40)).
2. `TeacherProfile` có `userId` unique ([TeacherProfile.js](backend/src/models/TeacherProfile.js#L5-L18)).

`Class.teacherId`, `Schedule.teacherId` và `Session.teacherId` trỏ tới `_id` của `TeacherProfile`, không trỏ trực tiếp tới `User`. Vì vậy user có role teacher nhưng thiếu profile sẽ qua role middleware nhưng lỗi `Teacher profile not found` khi vào controller Teacher.

Tất cả route `/api/teacher` dùng `router.use(protect, authorize('teacher'))` ([teacher.routes.js](backend/src/modules/teacher/teacher.routes.js#L38-L42)). Sau đó các controller dùng `checkTeacherOwnsClass()` để so sánh `Class.teacherId` với `TeacherProfile._id` ([teacher.service.js](backend/src/modules/teacher/teacher.service.js#L26-L37)). Frontend `ProtectedRoute` chỉ là lớp điều hướng, không phải lớp bảo mật ([ProtectedRoute.jsx](frontend/src/routes/ProtectedRoute.jsx#L10-L37)).

Các chức năng **không tìm thấy** trong source Teacher: tạo/quản lý lớp, phân học viên, phân lịch chính thức, Grade, Assignment, Exam, Submission, chấm điểm, bảng lương, thông báo thực tế và quản lý tài liệu cấp môn. `Payroll` có quan hệ với TeacherProfile nhưng không có endpoint Teacher.

<a id="quan-he-database"></a>

## Quan hệ database

| Model/collection | Field chính | Vai trò trong luồng Teacher |
|---|---|---|
| [User](backend/src/models/User.js#L1-L64) | `role`, `isActive` | Tài khoản và xác thực |
| [TeacherProfile](backend/src/models/TeacherProfile.js#L1-L25) | `userId` | Cầu nối User → lớp/lịch/session |
| [Class](backend/src/models/Class.js#L1-L50) | `teacherId`, `subjectId` | Ownership và lớp được phân công |
| [Schedule](backend/src/models/Schedule.js#L1-L45) | `teacherId`, `classId` | Lịch dạy và nguồn sinh session |
| [Session](backend/src/models/Session.js#L1-L65) | `classId`, `scheduleId`, `materials` | Buổi học và tài liệu |
| [ClassStudent](backend/src/models/ClassStudent.js#L1-L40) | `classId`, `studentId`, `status` | Thành viên enrolled |
| [StudentProfile](backend/src/models/StudentProfile.js#L1-L45) | `userId` | Thông tin học viên được populate |
| [Attendance](backend/src/models/Attendance.js#L1-L40) | `sessionId`, `studentId`, `status` | Điểm danh theo session/học viên |
| [Subject](backend/src/models/Subject.js#L1-L60) | `materials`, `status` | Môn và tài liệu môn |
| [Payroll](backend/src/models/Payroll.js#L1-L56) | `teacherId` | Có quan hệ dữ liệu nhưng không có API Teacher |

```mermaid
erDiagram
    USER ||--|| TEACHER_PROFILE : "TeacherProfile.userId"
    TEACHER_PROFILE ||--o{ CLASS : "Class.teacherId"
    SUBJECT ||--o{ CLASS : "Class.subjectId"
    TEACHER_PROFILE ||--o{ SCHEDULE : "Schedule.teacherId"
    CLASS ||--o{ SCHEDULE : "Schedule.classId"
    TEACHER_PROFILE ||--o{ SESSION : "Session.teacherId"
    CLASS ||--o{ SESSION : "Session.classId"
    SCHEDULE ||--o{ SESSION : "Session.scheduleId"
    CLASS ||--o{ CLASS_STUDENT : "ClassStudent.classId"
    STUDENT_PROFILE ||--o{ CLASS_STUDENT : "ClassStudent.studentId"
    SESSION ||--o{ ATTENDANCE : "Attendance.sessionId"
    STUDENT_PROFILE ||--o{ ATTENDANCE : "Attendance.studentId"
    TEACHER_PROFILE ||--o{ PAYROLL : "Payroll.teacherId"
```

<a id="rui-ro-va-chuc-nang-chua-co"></a>

## Rủi ro và chức năng chưa có

| Mức độ | Vấn đề | File/vị trí | Ý nghĩa |
|---|---|---|---|
| Critical | Frontend không build do trùng `getFileName` | [TeacherSubjectsPage.jsx](frontend/src/pages/teacher/TeacherSubjectsPage.jsx#L7-L44) | Page môn học không thể coi là hoàn chỉnh |
| Critical | API import/export user không có auth | [data.routes.js](backend/src/routes/data.routes.js#L1-L20), [data.controller.js](backend/src/controllers/data.controller.js#L54-L103) | Có thể lộ PII hoặc tạo role tùy input |
| Critical | API session global không được bảo vệ | [session.routes.js](backend/src/routes/session.routes.js#L1-L12), [session.controller.js](backend/src/controllers/session.controller.js#L5-L72) | Caller ngoài Teacher module có thể tác động session |
| High | Subject CRUD/upload/delete là public | [subject.routes.js](backend/src/routes/subject.routes.js#L19-L34) | Có thể sửa/xóa môn và tài liệu ngoài quyền Teacher |
| High | POST attendance không kiểm tra student enrolled | [teacher.controller.js](backend/src/modules/teacher/teacher.controller.js#L424-L488) | Có thể ghi attendance cho ID ngoài lớp |
| High | Tạo session nhận `teacherId`/`scheduleId` từ body chưa verify đầy đủ | [teacher.controller.js](backend/src/modules/teacher/teacher.controller.js#L304-L370) | Dữ liệu session có thể lệch ownership |
| High | Xóa file nhận path từ body | [teacher.controller.js](backend/src/modules/teacher/teacher.controller.js#L575-L612) | Có nguy cơ path traversal/xóa file ngoài session |
| High | Upload chỉ giới hạn số file, không size/type; uploads serve public | [teacher.routes.js](backend/src/modules/teacher/teacher.routes.js#L23-L36), [app.js](backend/src/app.js#L27-L29) | Tăng rủi ro file độc hại hoặc file quá lớn |
| High | Enrollment/report global không có middleware | [enrollment.routes.js](backend/src/routes/enrollment.routes.js#L1-L10), [report.routes.js](backend/src/routes/report.routes.js#L1-L9) | Có thể lộ/sửa enrollment, invoice và báo cáo |
| Medium | Subjects có thể rỗng do lệch enum status | [teacher.controller.js](backend/src/modules/teacher/teacher.controller.js#L495-L524), [Class.js](backend/src/models/Class.js#L31-L34) | Query dùng `upcoming/in_progress`, enum dùng `scheduled/ongoing` |
| Medium | Dashboard chưa truy cập được và binding sai | [AppRoutes.jsx](frontend/src/routes/AppRoutes.jsx#L164-L176), [TeacherDashboardPage.jsx](frontend/src/pages/teacher/TeacherDashboardPage.jsx#L20-L56) | Page/API tồn tại nhưng UI không hoàn chỉnh |
| Medium | Validation attendance chưa được gọi | [teacher.validation.js](backend/src/modules/teacher/teacher.validation.js#L1-L9), [teacher.controller.js](backend/src/modules/teacher/teacher.controller.js#L441-L486) | Status/ObjectId sai có thể thành 500 |
| Medium | GET attendance không lọc enrolled | [teacher.controller.js](backend/src/modules/teacher/teacher.controller.js#L378-L417) | Có thể hiển thị record dropped/ngoài lớp |
| Medium | JWT không có refresh/revocation | [auth.controller.js](backend/src/controllers/auth.controller.js#L47-L64), [auth.js](frontend/src/utils/auth.js#L1-L13) | Token bị lộ còn hiệu lực tới expiry |
| Low | Sidebar không dẫn tới Subjects | [Sidebar.jsx](frontend/src/components/layout/Sidebar.jsx#L5-L94) | Chức năng có route nhưng khó tìm |
| Low | Announcement Teacher chưa có API/UI | [Announcement.js](backend/src/models/Announcement.js#L19-L22), [Header.jsx](frontend/src/components/layout/Header.jsx#L1-L80) | Bell hiện chỉ là nút tĩnh |
| Low | Profile clear/password/avatar chưa được UI gọi | [profileApi.js](frontend/src/api/profileApi.js#L11-L23), [Header.jsx](frontend/src/components/layout/Header.jsx#L120-L146) | API có nhưng chức năng chưa hoàn chỉnh trên UI |

Các route public nêu trên là bề mặt truy cập thực tế của hệ thống, không phải quyền nghiệp vụ Teacher được module `/api/teacher` thiết kế. Việc ẩn nút trên frontend không thay thế được middleware backend.

<a id="ket-luan"></a>

## Kết luận

Role `Teacher` hiện tập trung vào vận hành giảng dạy: xem lịch/lớp/học viên, xem và sinh session, điểm danh, tài liệu session, subjects và hồ sơ cá nhân. Core authorization của module Teacher gồm JWT, `User` hiện tại, `authorize('teacher')` và ownership qua `TeacherProfile`.

Khi đọc source, nên lần theo thứ tự: page → API client → route → middleware → controller/service → model. Các ưu tiên cần xử lý trước khi dùng thực tế là lỗi build, các route public nhạy cảm, kiểm tra membership khi điểm danh, xác minh `teacherId`/`scheduleId`, và giới hạn đường dẫn/tệp upload.
