# Admin Frontend Handoff Document - Tutor Center Management System

Tài liệu này tổng hợp toàn bộ các kết quả phát triển phần Admin Frontend sử dụng Mock Data/API và hướng dẫn tích hợp với Backend sau này.

---

## 1. Admin FE Overview
Phần Admin Frontend được thiết kế để cung cấp cho người quản trị (Admin) cái nhìn toàn cảnh về hệ thống trung tâm gia sư, quản lý các lớp học, học viên, giảng viên và lịch học một cách trực quan, tối ưu trên nhiều thiết bị.
Các module đã triển khai:
*   **Layout & Core Components**: Sidebar điều hướng chuyên biệt màu tối, Header cá nhân hóa người dùng, các components dùng chung chuẩn xác (Card, Badge, Button, Input, Loading, EmptyState).
*   **Dashboard**: Thống kê số liệu người dùng, lớp học và lịch học.
*   **User Management**: Tìm kiếm, lọc theo vai trò/trạng thái, xem chi tiết, tạo mới và cập nhật trạng thái người dùng.
*   **Class Management**: Quản lý thông tin lớp, xem chi tiết và danh sách học viên của từng lớp, tạo lớp mới.
*   **Schedule Management**: Quản lý lịch học của trung tâm, chuyển đổi định dạng Thứ tự động, tạo lịch học mới.

---

## 2. Completed Admin Frontend Features
1.  **Dashboard**: Thống kê tổng số lượng người dùng (Teacher, Student, Parent, Manager), trạng thái người dùng, số lượng lớp học theo trạng thái, số lượng lịch học đang hoạt động/hủy.
2.  **User Management**:
    *   Bảng hiển thị đầy đủ thông tin giảng viên, học sinh, phụ huynh và quản lý.
    *   Bộ lọc tìm kiếm tức thời theo tên, email, sđt kèm debounce 150ms.
    *   Trang xem chi tiết người dùng và cập nhật trạng thái (Active, Inactive, Banned).
    *   Form tạo mới tài khoản có client-side validation.
3.  **Class Management**:
    *   Bảng hiển thị các lớp học, sĩ số hiện tại/tối đa, giáo viên chủ nhiệm và phòng học.
    *   Trang xem chi tiết lớp học và danh sách học viên cụ thể trong lớp.
    *   Form tạo lớp học mới, gán giáo viên và môn học.
4.  **Schedule Management**:
    *   Bảng hiển thị danh sách lịch học (Class, Teacher, Day of Week, Time Slot, Room).
    *   Quy đổi tự động mã thứ trong tuần (`0` -> Chủ Nhật, `1` -> Thứ Hai,...).
    *   Form tạo lịch học mới có kiểm tra thời gian hợp lệ (Start Time < End Time).

---

## 3. File Map
Dưới đây là danh sách các file Admin FE đã được tạo mới hoặc cập nhật:

### Layout Components
*   [AdminLayout.jsx](file:///d:/SDN302/SDN302/frontend/src/components/layout/AdminLayout.jsx)
*   [AdminSidebar.jsx](file:///d:/SDN302/SDN302/frontend/src/components/layout/AdminSidebar.jsx)
*   [AdminHeader.jsx](file:///d:/SDN302/SDN302/frontend/src/components/layout/AdminHeader.jsx)

### Pages (Admin)
*   [AdminDashboardPage.jsx](file:///d:/SDN302/SDN302/frontend/src/pages/admin/AdminDashboardPage.jsx)
*   [AdminUsersPage.jsx](file:///d:/SDN302/SDN302/frontend/src/pages/admin/AdminUsersPage.jsx)
*   [AdminCreateUserPage.jsx](file:///d:/SDN302/SDN302/frontend/src/pages/admin/AdminCreateUserPage.jsx)
*   [AdminUserDetailPage.jsx](file:///d:/SDN302/SDN302/frontend/src/pages/admin/AdminUserDetailPage.jsx)
*   [AdminClassesPage.jsx](file:///d:/SDN302/SDN302/frontend/src/pages/admin/AdminClassesPage.jsx)
*   [AdminCreateClassPage.jsx](file:///d:/SDN302/SDN302/frontend/src/pages/admin/AdminCreateClassPage.jsx)
*   [AdminClassDetailPage.jsx](file:///d:/SDN302/SDN302/frontend/src/pages/admin/AdminClassDetailPage.jsx)
*   [AdminClassStudentsPage.jsx](file:///d:/SDN302/SDN302/frontend/src/pages/admin/AdminClassStudentsPage.jsx)
*   [AdminSchedulesPage.jsx](file:///d:/SDN302/SDN302/frontend/src/pages/admin/AdminSchedulesPage.jsx)
*   [AdminCreateSchedulePage.jsx](file:///d:/SDN302/SDN302/frontend/src/pages/admin/AdminCreateSchedulePage.jsx)

### API & Mock
*   [adminMockData.js](file:///d:/SDN302/SDN302/frontend/src/mock/adminMockData.js)
*   [adminApi.js](file:///d:/SDN302/SDN302/frontend/src/api/adminApi.js)

### Routes
*   [AppRoutes.jsx](file:///d:/SDN302/SDN302/frontend/src/routes/AppRoutes.jsx)

---

## 4. Admin Routes Summary
| Route | Page | Purpose | Status |
| :--- | :--- | :--- | :--- |
| `/admin/dashboard` | `AdminDashboardPage` | Xem bảng thống kê hệ thống | Hoàn thành (Mock) |
| `/admin/users` | `AdminUsersPage` | Danh sách người dùng, tìm kiếm & lọc | Hoàn thành (Mock) |
| `/admin/users/create` | `AdminCreateUserPage` | Tạo người dùng mới | Hoàn thành (Mock) |
| `/admin/users/:userId` | `AdminUserDetailPage` | Chi tiết và cập nhật trạng thái người dùng | Hoàn thành (Mock) |
| `/admin/classes` | `AdminClassesPage` | Danh sách lớp học và lọc trạng thái | Hoàn thành (Mock) |
| `/admin/classes/create` | `AdminCreateClassPage` | Tạo lớp học mới | Hoàn thành (Mock) |
| `/admin/classes/:classId` | `AdminClassDetailPage` | Chi tiết lớp học | Hoàn thành (Mock) |
| `/admin/classes/:classId/students` | `AdminClassStudentsPage` | Danh sách học viên trong lớp | Hoàn thành (Mock) |
| `/admin/schedules` | `AdminSchedulesPage` | Danh sách lịch học | Hoàn thành (Mock) |
| `/admin/schedules/create` | `AdminCreateSchedulePage` | Tạo lịch học mới cho lớp | Hoàn thành (Mock) |

---

## 5. Mock API Summary
Trong [adminApi.js](file:///d:/SDN302/SDN302/frontend/src/api/adminApi.js), các hàm API sau đây đã được cài đặt bất đồng bộ và lưu trữ trạng thái trong bộ nhớ để phản hồi tức thì:
*   `getDashboard()`: Trả về số liệu thống kê người dùng, lớp và lịch học.
*   `getUsers(params)`: Trả về danh sách user có lọc theo vai trò, trạng thái, và từ khóa tìm kiếm.
*   `getUserDetail(userId)`: Trả về chi tiết của 1 user.
*   `createUser(data)`: Thêm user mới vào mảng giả lập.
*   `updateUserStatus(userId, status)`: Cập nhật trạng thái của user.
*   `getClasses(params)`: Trả về danh sách lớp học có lọc trạng thái và tìm kiếm.
*   `getClassDetail(classId)`: Trả về chi tiết lớp học.
*   `createClass(data)`: Tạo lớp mới và gán môn học, giáo viên.
*   `getClassStudents(classId)`: Trả về danh sách học sinh thuộc lớp.
*   `getSchedules(params)`: Trả về danh sách lịch học có lọc trạng thái và tìm kiếm.
*   `createSchedule(data)`: Thêm lịch học mới.

---

## 6. Backend APIs Needed Later
Để thay thế Mock API bằng API thật, Backend cần cung cấp các REST API endpoints sau:
1.  **Dashboard**:
    *   `GET /api/admin/dashboard`
2.  **Users**:
    *   `GET /api/admin/users?role=...&status=...&search=...`
    *   `GET /api/admin/users/:userId`
    *   `POST /api/admin/users` (Body: `fullName`, `email`, `phone`, `password`, `role`, `status`)
    *   `PATCH /api/admin/users/:userId/status` (Body: `status`)
3.  **Classes**:
    *   `GET /api/admin/classes?status=...&search=...`
    *   `GET /api/admin/classes/:classId`
    *   `POST /api/admin/classes` (Body: `name`, `subject`, `teacher`, `room`, `maxStudents`, `startDate`, `endDate`, `status`)
    *   `GET /api/admin/classes/:classId/students`
4.  **Schedules**:
    *   `GET /api/admin/schedules?status=...&search=...`
    *   `POST /api/admin/schedules` (Body: `class`, `teacher`, `dayOfWeek`, `startTime`, `endTime`, `room`, `status`)

---

## 7. How To Test Admin FE
1.  Thiết lập đăng nhập giả lập bằng cách mở Console F12 trên trình duyệt và nhập:
    ```javascript
    localStorage.setItem('token', 'mock-admin-token');
    localStorage.setItem('user', JSON.stringify({ name: 'Nguyen Van Admin', role: 'admin' }));
    ```
2.  Truy cập địa chỉ `http://localhost:5173/admin/dashboard` hoặc F5 tải lại trang chủ để được tự động chuyển hướng.
3.  Thực hiện tạo người dùng mới tại `/admin/users/create`, sau khi thành công sẽ được chuyển hướng về trang danh sách và hiển thị ngay người dùng đó ở đầu bảng.
4.  Vào chi tiết người dùng vừa tạo, bấm các nút `Set Inactive` hoặc `Ban User`, trạng thái và nhãn hiển thị sẽ thay đổi tương ứng.
5.  Thử nghiệm tương tự cho chức năng tạo Lớp học mới và tạo Lịch học mới.

---

## 8. Known Notes & Next Step
*   **Mock Data**: Trạng thái thay đổi (thêm mới lớp, đổi trạng thái user,...) chỉ được lưu tạm thời trên bộ nhớ RAM của trình duyệt thông qua mảng Javascript import. Khi F5 reload lại trang, dữ liệu sẽ quay lại trạng thái ban đầu của mock data.
*   **Tích hợp sau này**: Khi Backend hoàn thành, chỉ cần thay đổi nội dung file [adminApi.js](file:///d:/SDN302/SDN302/frontend/src/api/adminApi.js) để sử dụng `axiosClient` gọi các HTTP request tới Backend thay thế cho các thao tác mảng hiện tại.
*   **Next Step**: Bắt tay vào xây dựng hệ thống **Admin Backend** sử dụng Node.js, Express, và MongoDB để đáp ứng các API liệt kê ở phần 6.
