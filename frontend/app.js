const API_URL = 'http://localhost:5000/api';

// State của ứng dụng
let token = localStorage.getItem('parent_token') || null;
let parentUser = JSON.parse(localStorage.getItem('parent_user')) || null;
let children = [];
let selectedChildId = null;
let activeTab = 'dashboard'; // Tab mặc định là Tổng quan (dashboard)

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const appScreen = document.getElementById('app-screen');
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('error-message');

const welcomeText = document.getElementById('welcome-text');
const parentDisplayName = document.getElementById('parent-display-name');
const parentAvatarLetter = document.getElementById('parent-avatar-letter');
const kidSelect = document.getElementById('kid-select');
const logoutBtn = document.getElementById('logout-btn');
const childrenCountValue = document.getElementById('children-count-value');

const childNameEl = document.getElementById('child-name');
const childGradeEl = document.getElementById('child-grade');
const childSchoolEl = document.getElementById('child-school');
const childEmailEl = document.getElementById('child-email');

const panelDynamicContent = document.getElementById('dynamic-dashboard-content');
const navItems = document.querySelectorAll('.nav-item');

// ----------------------------------------------------
// Tự động kiểm tra trạng thái đăng nhập khi tải trang
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  if (token && parentUser) {
    showDashboard();
  } else {
    showLogin();
  }
});

function showLogin() {
  loginScreen.style.display = 'flex';
  appScreen.style.display = 'none';
  document.body.style.alignItems = 'center';
  document.body.style.justifyContent = 'center';
  document.body.style.backgroundColor = '#f8fafc'; // Nền sáng khi đăng nhập
}

function showDashboard() {
  loginScreen.style.display = 'none';
  appScreen.style.display = 'grid';
  document.body.style.alignItems = 'stretch';
  document.body.style.justifyContent = 'stretch';
  document.body.style.backgroundColor = '#f8fafc'; // Nền sáng đồng bộ ảnh
  
  // Cập nhật thông tin phụ huynh
  welcomeText.textContent = `Trang Tổng Quan Học Tập`;
  parentDisplayName.textContent = parentUser.name;
  if (parentAvatarLetter && parentUser.name) {
    parentAvatarLetter.textContent = parentUser.name.charAt(0).toUpperCase();
  }

  // Lấy danh sách con cái
  fetchChildren();
}

// ----------------------------------------------------
// XỬ LÝ ĐĂNG NHẬP & ĐĂNG XUẤT
// ----------------------------------------------------
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorMessage.textContent = '';
  
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const result = await res.json();

    if (!result.success) {
      errorMessage.textContent = result.message || 'Email hoặc mật khẩu không hợp lệ';
      return;
    }

    if (result.user.role !== 'parent') {
      errorMessage.textContent = 'Tài khoản này không phải là tài khoản Phụ huynh!';
      return;
    }

    // Lưu thông tin vào LocalStorage
    token = result.token;
    parentUser = result.user;
    localStorage.setItem('parent_token', token);
    localStorage.setItem('parent_user', JSON.stringify(parentUser));

    showDashboard();
  } catch (err) {
    errorMessage.textContent = 'Không thể kết nối đến máy chủ backend!';
    console.error(err);
  }
});

logoutBtn.addEventListener('click', () => {
  localStorage.clear();
  token = null;
  parentUser = null;
  children = [];
  selectedChildId = null;
  showLogin();
});

// ----------------------------------------------------
// GỌI API LẤY DANH SÁCH CON
// ----------------------------------------------------
async function fetchChildren() {
  try {
    const res = await fetch(`${API_URL}/parent/children`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const result = await res.json();

    if (!result.success) {
      console.error(result.message);
      logoutBtn.click();
      return;
    }

    children = result.data;

    // Cập nhật số lượng con học tại trung tâm
    if (childrenCountValue) {
      childrenCountValue.textContent = `${children.length} Học sinh`;
    }

    if (children.length === 0) {
      kidSelect.innerHTML = '<option>Không có con</option>';
      renderEmptyState('Không tìm thấy học sinh nào liên kết với phụ huynh này.');
      return;
    }

    // Điền vào danh sách dropdown chọn con
    kidSelect.innerHTML = children.map(child => {
      const u = child.userId;
      return `<option value="${u._id}">${u.name}</option>`;
    }).join('');

    // Chọn đứa con đầu tiên mặc định
    selectedChildId = children[0].userId._id;
    updateChildProfileCard(children[0]);

    // Tải dữ liệu của tab hiện tại
    loadTabContent();

  } catch (err) {
    console.error('Lỗi khi lấy danh sách con:', err);
    renderEmptyState('Đã xảy ra lỗi khi tải danh sách con cái.');
  }
}

// Cập nhật thẻ thông tin cá nhân của con
function updateChildProfileCard(child) {
  childNameEl.textContent = child.userId.name;
  childGradeEl.textContent = child.grade || 'N/A';
  childSchoolEl.textContent = child.school || 'N/A';
  childEmailEl.textContent = child.userId.email;

  // Lấy chữ cái đầu làm Avatar của con
  const childAvatarEl = document.getElementById('child-avatar');
  if (childAvatarEl && child.userId.name) {
    childAvatarEl.textContent = child.userId.name.charAt(0).toUpperCase();
  }
}

// Khi đổi con trong Dropdown
kidSelect.addEventListener('change', (e) => {
  selectedChildId = e.target.value;
  const child = children.find(c => c.userId._id === selectedChildId);
  if (child) {
    updateChildProfileCard(child);
  }
  loadTabContent();
});

// ----------------------------------------------------
// ĐIỀU HƯỚNG TABS
// ----------------------------------------------------
navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    navItems.forEach(nav => nav.classList.remove('active'));
    item.classList.add('active');
    activeTab = item.getAttribute('data-tab');
    loadTabContent();
  });
});

// Hàm điều phối tải dữ liệu tab
function loadTabContent() {
  if (!selectedChildId) return;

  if (activeTab === 'dashboard') {
    loadDashboard();
  } else {
    // Tạo cấu trúc card sáng cho các tab chi tiết (như ảnh)
    let titleText = '';
    if (activeTab === 'classes') titleText = '📁 Danh sách lớp học của con';
    if (activeTab === 'schedules') titleText = '📅 Lịch học chi tiết hàng tuần';
    if (activeTab === 'grades') titleText = '📈 Bảng điểm học tập';
    if (activeTab === 'teachers') titleText = '👨‍🏫 Giáo viên dạy học';
    if (activeTab === 'profile') titleText = '👤 Thông tin hồ sơ & Liên kết gia đình';

    panelDynamicContent.innerHTML = `
      <section class="content-panel">
        <h2 class="panel-title">${titleText}</h2>
        <div id="panel-dynamic-content-inner">
          <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        </div>
      </section>
    `;

    // Gọi các hàm tải cụ thể
    if (activeTab === 'classes') fetchChildClasses();
    if (activeTab === 'schedules') fetchChildSchedules();
    if (activeTab === 'grades') fetchChildGrades();
    if (activeTab === 'teachers') fetchChildTeachers();
    if (activeTab === 'profile') fetchParentProfile();
  }
}

// ----------------------------------------------------
// XỬ LÝ CHO TAB TỔNG QUAN (DASHBOARD)
// ----------------------------------------------------
async function loadDashboard() {
  panelDynamicContent.innerHTML = `
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p>Đang tải thống kê tổng quan...</p>
    </div>
  `;

  try {
    // Gọi song song 3 API để tính số lượng lớp, lịch học, điểm
    const [classesRes, schedulesRes, gradesRes] = await Promise.all([
      fetch(`${API_URL}/parent/children/${selectedChildId}/classes`, { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch(`${API_URL}/parent/children/${selectedChildId}/schedules`, { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch(`${API_URL}/parent/children/${selectedChildId}/grades`, { headers: { 'Authorization': `Bearer ${token}` } }),
    ]);

    const classesData = await classesRes.json();
    const schedulesData = await schedulesRes.json();
    const gradesData = await gradesRes.json();

    const classesCount = classesData.success ? classesData.total : 0;
    const schedulesCount = schedulesData.success ? schedulesData.total : 0;
    const gradesCount = gradesData.success ? gradesData.total : 0;

    // Render 3 stats cards đồng bộ thiết kế trong ảnh
    panelDynamicContent.innerHTML = `
      <div class="section-title-area">
        <h3>Thống kê Học tập</h3>
        <p>Tình trạng tham gia học tập của con đang được theo dõi.</p>
      </div>

      <div class="stats-cards-grid">
        <div class="stat-card-white">
          <div class="stat-left">
            <div class="label">Số lớp đang học</div>
            <div class="value">${classesCount}</div>
          </div>
          <div class="stat-right-icon blue">🎓</div>
        </div>

        <div class="stat-card-white">
          <div class="stat-left">
            <div class="label">Lịch học trong tuần</div>
            <div class="value green">${schedulesCount} buổi</div>
          </div>
          <div class="stat-right-icon green">📅</div>
        </div>

        <div class="stat-card-white">
          <div class="stat-left">
            <div class="label">Đầu điểm đã nhập</div>
            <div class="value gray">${gradesCount}</div>
          </div>
          <div class="stat-right-icon gray">📈</div>
        </div>
      </div>
    `;

  } catch (err) {
    console.error('Lỗi tải dashboard:', err);
    renderError('Không thể tải dữ liệu thống kê tổng quan');
  }
}

// ----------------------------------------------------
// CHI TIẾT TỪNG TAB NỘI DUNG (RÚT GỌN GHI VÀO INNER PANEL)
// ----------------------------------------------------

// TAB 1: DANH SÁCH LỚP HỌC
async function fetchChildClasses() {
  const container = document.getElementById('panel-dynamic-content-inner');
  try {
    const res = await fetch(`${API_URL}/parent/children/${selectedChildId}/classes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await res.json();

    if (!result.success || result.total === 0) {
      container.innerHTML = getEmptyStateHTML('Con hiện chưa đăng ký tham gia lớp học nào.');
      return;
    }

    // Lưu trữ danh sách lớp hiện tại vào biến window để truy xuất chi tiết
    window.currentClasses = result.data;

    container.innerHTML = `
      <div class="classes-grid">
        ${result.data.map(c => `
          <div class="class-card" onclick="window.showClassDetails('${c.id}')">
            <div class="class-card-header">
              <span class="class-status-badge ${c.status === 'ongoing' ? 'ongoing' : 'scheduled'}">${c.status === 'ongoing' ? 'Đang học' : 'Sắp diễn ra'}</span>
              <h4>Lớp ${c.className}</h4>
              <p>${c.subjectName}</p>
            </div>
            <div class="class-card-body">
              <div class="card-info-item">
                <span>🏫 Phòng:</span>
                <strong>${c.room || 'N/A'}</strong>
              </div>
              <div class="card-info-item">
                <span>👨‍🏫 Giáo viên:</span>
                <strong>${c.teacherName}</strong>
              </div>
            </div>
            <div class="class-card-footer">
              <span class="btn-view-detail">Xem chi tiết ➜</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    container.innerHTML = getErrorHTML('Lỗi tải danh sách lớp học');
  }
}

// HIỂN THỊ CHI TIẾT LỚP HỌC
function showClassDetails(classId) {
  const container = document.getElementById('panel-dynamic-content-inner');
  if (!window.currentClasses) return;
  const c = window.currentClasses.find(item => item.id === classId);
  if (!c) return;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Chưa xác định';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN');
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  container.innerHTML = `
    <div class="class-detail-container">
      <button onclick="window.fetchChildClasses()" class="btn-back">⬅ Quay lại danh sách lớp</button>
      
      <div class="detail-grid-layout">
        <!-- Cột trái: Thông tin lớp, môn học & Danh sách học viên -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div class="detail-card">
            <div class="detail-section-header">
              <span class="detail-badge ${c.status === 'ongoing' ? 'ongoing' : 'scheduled'}">${c.status === 'ongoing' ? 'Đang học' : 'Sắp diễn ra'}</span>
              <h2>Lớp: ${c.className}</h2>
              <p class="subject-title">Môn học: <strong>${c.subjectName}</strong></p>
            </div>
            
            <div class="detail-body">
              <div class="info-row">
                <span class="info-label">Mô tả môn học:</span>
                <span class="info-val bio-text" style="border-left: 3px solid var(--primary); padding-left: 12px; font-style: normal; margin-top: 4px;">${c.subjectDescription || 'Chưa cập nhật mô tả.'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Khối lớp:</span>
                <span class="info-val">Khối ${c.subjectGradeLevel || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Học phí môn học:</span>
                <span class="info-val price-tag">${formatCurrency(c.subjectTuitionFee)}</span>
              </div>
            </div>
          </div>

          <!-- Card danh sách bạn cùng lớp -->
          <div class="detail-card">
            <h3>Danh sách học viên trong lớp</h3>
            <div id="class-students-list-inner">
              <div class="loading-spinner" style="min-height: 120px;">
                <div class="spinner" style="width: 24px; height: 24px;"></div>
                <p style="font-size: 0.85rem;">Đang tải danh sách học viên...</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Cột phải: Thông tin phòng học, thời gian, giáo viên -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div class="detail-card" style="padding: 24px;">
            <h3>Thông tin học tập</h3>
            <div class="detail-body" style="gap: 15px; margin-top: 15px;">
              <div class="info-row-flex">
                <span class="info-icon">🏫</span>
                <div>
                  <div class="info-label">Phòng học</div>
                  <div class="info-val" style="font-size: 0.95rem;">${c.room || 'N/A'}</div>
                </div>
              </div>
              <div class="info-row-flex">
                <span class="info-icon">👥</span>
                <div>
                  <div class="info-label">Sĩ số tối đa</div>
                  <div class="info-val" style="font-size: 0.95rem;">${c.maxStudents || 20} học sinh</div>
                </div>
              </div>
              <div class="info-row-flex">
                <span class="info-icon">📅</span>
                <div>
                  <div class="info-label">Ngày bắt đầu</div>
                  <div class="info-val" style="font-size: 0.95rem;">${formatDate(c.startDate)}</div>
                </div>
              </div>
              <div class="info-row-flex">
                <span class="info-icon">🏁</span>
                <div>
                  <div class="info-label">Ngày kết thúc</div>
                  <div class="info-val" style="font-size: 0.95rem;">${formatDate(c.endDate)}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="detail-card" style="padding: 24px;">
            <h3>Giáo viên giảng dạy</h3>
            <div class="detail-body" style="gap: 15px; margin-top: 15px;">
              <div class="info-row-flex">
                <span class="info-icon">👨‍🏫</span>
                <div>
                  <div class="info-label">Họ và tên</div>
                  <div class="info-val" style="font-size: 0.95rem;">${c.teacherName}</div>
                </div>
              </div>
              <div class="info-row-flex">
                <span class="info-icon">✉️</span>
                <div>
                  <div class="info-label">Email liên hệ</div>
                  <div class="info-val" style="font-size: 0.95rem; word-break: break-all;">${c.teacherEmail || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Gọi API tải danh sách học viên
  fetch(`${API_URL}/parent/classes/${classId}/students`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(result => {
      const listContainer = document.getElementById('class-students-list-inner');
      if (!listContainer) return;

      if (!result.success || result.total === 0) {
        listContainer.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 10px;">Không tìm thấy thông tin học viên khác trong lớp này.</p>';
        return;
      }

      listContainer.innerHTML = `
        <div class="table-responsive" style="margin-top: 15px;">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Họ và tên</th>
                <th>Khối lớp</th>
                <th>Trường học</th>
                <th>Email liên kết</th>
              </tr>
            </thead>
            <tbody>
              ${result.data.map(student => `
                <tr>
                  <td><strong>${student.name}</strong></td>
                  <td>Khối ${student.grade || 'N/A'}</td>
                  <td>${student.school || 'N/A'}</td>
                  <td style="font-size: 0.85rem; color: var(--text-muted);">${student.email}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    })
    .catch(err => {
      const listContainer = document.getElementById('class-students-list-inner');
      if (listContainer) {
        listContainer.innerHTML = '<p style="color: var(--danger); font-size: 0.9rem; margin-top: 10px;">Đã xảy ra lỗi khi tải danh sách học viên.</p>';
      }
      console.error(err);
    });
}

// Xuất các hàm ra global window để HTML onclick có thể tìm thấy
window.fetchChildClasses = fetchChildClasses;
window.showClassDetails = showClassDetails;



// TAB 2: LỊCH HỌC
async function fetchChildSchedules() {
  const container = document.getElementById('panel-dynamic-content-inner');
  try {
    const res = await fetch(`${API_URL}/parent/children/${selectedChildId}/schedules`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await res.json();

    if (!result.success || result.total === 0) {
      container.innerHTML = getEmptyStateHTML('Chưa xếp lịch học cho con trong tuần này.');
      return;
    }

    const translateDay = (day) => {
      const days = {
        'Monday': 'Thứ Hai', 'Tuesday': 'Thứ Ba', 'Wednesday': 'Thứ Tư',
        'Thursday': 'Thứ Năm', 'Friday': 'Thứ Sáu', 'Saturday': 'Thứ Bảy', 'Sunday': 'Chủ Nhật'
      };
      return days[day] || day;
    };

    container.innerHTML = `
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Ngày học</th>
              <th>Thời gian</th>
              <th>Lớp</th>
              <th>Phòng</th>
              <th>Giáo viên</th>
            </tr>
          </thead>
          <tbody>
            ${result.data.map(s => `
              <tr>
                <td><span class="badge badge-info">${translateDay(s.dayOfWeek)}</span></td>
                <td><strong>${s.startTime} - ${s.endTime}</strong></td>
                <td>${s.classId ? s.classId.name : 'N/A'}</td>
                <td>${s.room || 'N/A'}</td>
                <td>${s.teacherId && s.teacherId.userId ? s.teacherId.userId.name : 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    container.innerHTML = getErrorHTML('Lỗi tải lịch học');
  }
}

// TAB 3: BẢNG ĐIỂM
async function fetchChildGrades() {
  const container = document.getElementById('panel-dynamic-content-inner');
  try {
    const res = await fetch(`${API_URL}/parent/children/${selectedChildId}/grades`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await res.json();

    if (!result.success || result.total === 0) {
      container.innerHTML = getEmptyStateHTML('Con hiện tại chưa có điểm số nào được ghi nhận.');
      return;
    }

    container.innerHTML = `
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Lớp học</th>
              <th>Môn học</th>
              <th>Loại điểm</th>
              <th>Điểm số</th>
              <th>Nhận xét của Giáo viên</th>
            </tr>
          </thead>
          <tbody>
            ${result.data.map(g => {
              const className = g.classId ? g.classId.name : 'N/A';
              const subjectName = (g.classId && g.classId.subjectId) ? g.classId.subjectId.name : 'N/A';
              const isHigh = g.score >= 8.0;
              return `
                <tr>
                  <td><strong>${className}</strong></td>
                  <td>${subjectName}</td>
                  <td><span class="badge ${g.gradeType === 'Cuoi ky' ? 'badge-success' : 'badge-info'}">${g.gradeType}</span></td>
                  <td><div class="grade-score ${isHigh ? 'high' : ''}">${g.score}</div></td>
                  <td class="bio-text">${g.remarks || 'Không có nhận xét'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    container.innerHTML = getErrorHTML('Lỗi tải điểm học sinh');
  }
}

// TAB 4: GIÁO VIÊN
async function fetchChildTeachers() {
  const container = document.getElementById('panel-dynamic-content-inner');
  try {
    const res = await fetch(`${API_URL}/parent/children/${selectedChildId}/teachers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await res.json();

    if (!result.success || result.total === 0) {
      container.innerHTML = getEmptyStateHTML('Chưa có giáo viên nào được phân công giảng dạy con.');
      return;
    }

    container.innerHTML = `
      <div class="cards-grid">
        ${result.data.map(t => {
          const info = t.teacherInfo;
          const classNames = t.classes.map(c => `${c.className} (${c.subjectName})`).join(', ');
          return `
            <div class="info-card">
              <div class="card-header-custom">
                <div>
                  <div class="card-title">${info.userId ? info.userId.name : 'N/A'}</div>
                  <div class="card-subtitle">${info.userId ? info.userId.email : 'N/A'}</div>
                </div>
              </div>
              <div class="card-body-custom">
                <p><strong>Điện thoại:</strong> <span>${info.phoneNumber || 'N/A'}</span></p>
                <p><strong>Lớp dạy:</strong> <span>${classNames}</span></p>
                <p><strong>Kinh nghiệm:</strong> <span>${info.experienceYears} năm</span></p>
                <p><strong>Chuyên môn:</strong> <span>${info.specialization ? info.specialization.join(', ') : 'N/A'}</span></p>
                <div class="bio-text">${info.bio || 'Chưa cập nhật giới thiệu.'}</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  } catch (err) {
    container.innerHTML = getErrorHTML('Lỗi tải thông tin giáo viên');
  }
}

// ----------------------------------------------------
// UI TEMPLATE HELPERS
// ----------------------------------------------------
function getEmptyStateHTML(message) {
  return `
    <div class="empty-state">
      <div class="empty-state-icon">📋</div>
      <p>${message}</p>
    </div>
  `;
}

function getErrorHTML(message) {
  return `
    <div class="empty-state" style="color: var(--danger)">
      <div class="empty-state-icon">❌</div>
      <p>${message}. Vui lòng thử lại sau.</p>
    </div>
  `;
}

function renderError(message) {
  panelDynamicContent.innerHTML = getErrorHTML(message);
}

function renderEmptyState(message) {
  panelDynamicContent.innerHTML = getEmptyStateHTML(message);
}

// TAB 5: HỒ SƠ PHỤ HUYNH & HỌC SINH
async function fetchParentProfile() {
  const container = document.getElementById('panel-dynamic-content-inner');
  try {
    const res = await fetch(`${API_URL}/parent/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await res.json();

    if (!result.success) {
      container.innerHTML = getErrorHTML('Lỗi tải thông tin hồ sơ phụ huynh');
      return;
    }

    const parent = result.data;
    const parentName = parent.userId ? parent.userId.name : 'N/A';
    const parentEmail = parent.userId ? parent.userId.email : 'N/A';
    const parentPhone = parent.phoneNumber || 'Chưa cập nhật';
    
    container.innerHTML = `
      <div class="profile-tab-container" style="display: flex; flex-direction: column; gap: 24px;">
        
        <!-- Khối 1: Thông tin phụ huynh -->
        <div class="info-card" style="width: 100%; max-width: 100%; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);">
          <div class="card-header-custom" style="padding-bottom: 15px;">
            <div style="display: flex; align-items: center; gap: 15px;">
              <div class="avatar-circle" style="width: 50px; height: 50px; font-size: 1.25rem;">P</div>
              <div style="text-align: left;">
                <div class="card-title" style="font-size: 1.2rem; margin-bottom: 2px;">${parentName}</div>
                <div class="card-subtitle">Tài khoản Phụ huynh hệ thống</div>
              </div>
            </div>
          </div>
          <div class="card-body-custom" style="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); display: grid; gap: 20px; padding-top: 15px; text-align: left;">
            <div class="info-row">
              <span class="info-label" style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">Email đăng nhập</span>
              <span class="info-val" style="font-size: 0.95rem; font-weight: 700; color: var(--text-main);">${parentEmail}</span>
            </div>
            <div class="info-row">
              <span class="info-label" style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">Số điện thoại</span>
              <span class="info-val" style="font-size: 0.95rem; font-weight: 700; color: var(--text-main);">${parentPhone}</span>
            </div>
            <div class="info-row">
              <span class="info-label" style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">Vai trò tài khoản</span>
              <span class="info-val" style="font-size: 0.95rem; font-weight: 700; color: var(--text-main);"><span class="badge badge-info">Phụ huynh</span></span>
            </div>
          </div>
        </div>

        <!-- Khối 2: Danh sách các con liên kết -->
        <div class="info-card" style="width: 100%; max-width: 100%; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);">
          <div class="card-header-custom" style="border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 15px; text-align: left;">
            <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--text-main);">👨‍👩‍👧‍👦 Danh sách học viên liên kết (Con cái)</h3>
          </div>
          <div class="table-responsive">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Tên học sinh</th>
                  <th>Khối lớp</th>
                  <th>Trường học</th>
                  <th>Email học sinh</th>
                  <th>Liên hệ phụ huynh (Trong hồ sơ học sinh)</th>
                </tr>
              </thead>
              <tbody>
                ${children.map(child => `
                  <tr>
                    <td><strong>${child.userId.name}</strong></td>
                    <td>Khối ${child.grade || 'N/A'}</td>
                    <td>${child.school || 'N/A'}</td>
                    <td style="font-size: 0.85rem; color: var(--text-muted);">${child.userId.email}</td>
                    <td style="font-size: 0.85rem;"><strong>${child.parentName}</strong> (${child.parentPhone})</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

  } catch (err) {
    container.innerHTML = getErrorHTML('Lỗi tải thông tin hồ sơ phụ huynh');
    console.error(err);
  }
}

