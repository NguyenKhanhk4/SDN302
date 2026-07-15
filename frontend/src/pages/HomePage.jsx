import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Users, Calendar, CheckCircle, Star, Phone, Mail, MapPin,
  ChevronRight, ArrowRight, Book, Activity, Beaker, Globe, PenTool, Hash,
  Award, TrendingUp, Clock, MonitorPlay, MessageCircle, X
} from 'lucide-react';
import { getUser } from '../utils/auth';
import LoginPage from './auth/LoginPage';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('Lớp 12');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLoginClick = (e) => {
    e.preventDefault();
    const user = getUser();
    if (user && localStorage.getItem('token')) {
      const roleDashboards = {
        admin: '/admin/dashboard',
        manager: '/manager/dashboard',
        teacher: '/teacher/schedules',
        student: '/student/dashboard',
        parent: '/parent/dashboard',
      };
      const role = String(user.role).toLowerCase();
      const target = roleDashboards[role] || '/';
      navigate(target);
    } else {
      setShowLogin(true);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    alert('Đăng ký thành công! Trung tâm sẽ liên hệ với bạn trong thời gian sớm nhất.');
  };

  const user = getUser();
  const isLoggedIn = user && localStorage.getItem('token');

  return (
    <div className="min-h-screen bg-[#F8FAFF] font-sans text-slate-800">
      
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                <BookOpen size={24} />
              </div>
              <span className="text-xl md:text-2xl font-extrabold text-blue-700">Ánh Sáng Center</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#trang-chu" className="font-medium text-blue-700 hover:text-blue-500 transition-colors">Trang Chủ</a>
              <a href="#mon-hoc" className="font-medium text-slate-600 hover:text-blue-600 transition-colors">Môn Học</a>
              <a href="#ve-chung-toi" className="font-medium text-slate-600 hover:text-blue-600 transition-colors">Về Chúng Tôi</a>
              <a href="#lich-hoc" className="font-medium text-slate-600 hover:text-blue-600 transition-colors">Lịch Học</a>
              <a href="#lien-he" className="font-medium text-slate-600 hover:text-blue-600 transition-colors">Liên Hệ</a>
            </div>

            <div className="hidden sm:flex items-center space-x-4">
              <button onClick={handleLoginClick} className="px-5 py-2.5 rounded-xl border-2 border-blue-600 text-blue-600 font-bold hover:bg-blue-50 transition-colors">
                {isLoggedIn ? 'Vào Trang Quản Lý' : 'Đăng Nhập'}
              </button>
              <button onClick={() => setShowRegisterForm(true)} className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-900 font-bold hover:bg-amber-400 hover:scale-105 transition-all shadow-lg shadow-amber-500/30">
                Đăng Ký Ngay
              </button>
            </div>

            
            <div className="md:hidden">
              <button className="text-slate-600 p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      
      <section id="trang-chu" className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 mb-20 w-72 h-72 rounded-full bg-amber-400/20 blur-3xl"></div>

        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

            
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm mb-6">
                <Award size={16} />
                <span>Trung Tâm Dạy Thêm Uy Tín Số 1</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 text-slate-900">
                Học Giỏi Hơn Mỗi Ngày <br />
                Cùng <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-500">Ánh Sáng Center</span>
              </h1>

              <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed">
                Trung tâm dạy thêm chuyên sâu các môn Toán, Lý, Hóa, Anh Văn, Văn, Sinh cho học sinh THCS và THPT. Giáo viên giàu kinh nghiệm, lịch học linh hoạt, theo dõi tiến độ sát sao.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <button onClick={() => setShowRegisterForm(true)} className="inline-flex justify-center items-center gap-2 px-8 py-4 rounded-2xl bg-amber-500 text-slate-900 font-bold text-lg hover:bg-amber-400 hover:-translate-y-1 transition-all shadow-xl shadow-amber-500/30">
                  Đăng Ký Ngay <ArrowRight size={20} />
                </button>
                <a href="#lich-hoc" className="inline-flex justify-center items-center gap-2 px-8 py-4 rounded-2xl border-2 border-blue-600 text-blue-600 font-bold text-lg hover:bg-blue-50 transition-colors">
                  Xem Lịch Học
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-500">
                <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><Users size={16} /></div> 500+ Học viên</div>
                <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-500"><Star size={16} /></div> 4.8/5 Đánh giá</div>
                <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><Book size={16} /></div> 8 Môn học</div>
              </div>
            </div>

            
            <div className="relative mx-auto w-full max-w-md lg:ml-auto">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-3xl transform rotate-3 scale-105 opacity-20 blur-lg animate-pulse"></div>

              <div className="relative bg-white p-6 md:p-8 rounded-3xl shadow-2xl border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Calendar className="text-blue-600" /> Lịch Học Tuần Này
                  </h3>
                  <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-lg">Cập nhật</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-blue-50 border border-blue-100 hover:border-blue-300 transition-colors cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex flex-col items-center justify-center font-bold"><span>T2</span></div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-800">Toán 10A</p>
                      <p className="text-sm text-slate-500">17:30 - Phòng 101</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-purple-50 border border-purple-100 hover:border-purple-300 transition-colors cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-purple-500 text-white flex flex-col items-center justify-center font-bold"><span>T3</span></div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-800">Tiếng Anh 9B</p>
                      <p className="text-sm text-slate-500">18:00 - Phòng 203</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-100 hover:border-emerald-300 transition-colors cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex flex-col items-center justify-center font-bold"><span>T4</span></div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-800">Hóa 11C</p>
                      <p className="text-sm text-slate-500">17:00 - Phòng 102</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-blue-50 border border-blue-100 hover:border-blue-300 transition-colors cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex flex-col items-center justify-center font-bold"><span>T6</span></div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-800">Lý 12A</p>
                      <p className="text-sm text-slate-500">18:30 - Phòng 301</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i}&backgroundColor=e2e8f0`} alt="Avatar" />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm font-medium text-slate-600">Đang có 12 lớp học</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      
      <section id="mon-hoc" className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
              Chương Trình Học <span className="text-blue-600">Đa Dạng</span>
            </h2>
            <p className="text-lg text-slate-600">
              Chúng tôi cung cấp chương trình dạy thêm bám sát SGK, luyện thi cấp THCS và THPT với phương pháp giảng dạy hiện đại, dễ hiểu.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {[
              { id: 1, name: 'Toán', desc: 'Đại số, Hình học, Giải tích, luyện thi ĐH', icon: <Hash size={28} />, color: 'text-blue-600', bg: 'bg-blue-100', borderHover: 'hover:border-blue-500', shadowHover: 'hover:shadow-blue-500/20' },
              { id: 2, name: 'Vật Lý', desc: 'Cơ học, Điện học, Quang học, thực hành', icon: <Activity size={28} />, color: 'text-purple-600', bg: 'bg-purple-100', borderHover: 'hover:border-purple-500', shadowHover: 'hover:shadow-purple-500/20' },
              { id: 3, name: 'Hóa Học', desc: 'Hóa vô cơ, hữu cơ, bài tập trắc nghiệm', icon: <Beaker size={28} />, color: 'text-emerald-600', bg: 'bg-emerald-100', borderHover: 'hover:border-emerald-500', shadowHover: 'hover:shadow-emerald-500/20' },
              { id: 4, name: 'Tiếng Anh', desc: 'Ngữ pháp, giao tiếp, luyện thi ĐH, IELTS', icon: <Globe size={28} />, color: 'text-cyan-600', bg: 'bg-cyan-100', borderHover: 'hover:border-cyan-500', shadowHover: 'hover:shadow-cyan-500/20' },
              { id: 5, name: 'Ngữ Văn', desc: 'Phân tích văn học, làm văn, thi THPT', icon: <PenTool size={28} />, color: 'text-orange-600', bg: 'bg-orange-100', borderHover: 'hover:border-orange-500', shadowHover: 'hover:shadow-orange-500/20' },
              { id: 6, name: 'Sinh Học', desc: 'Tế bào, Di truyền, Tiến hóa, Sinh thái', icon: <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 3a9 9 0 0 0-9 9h18a9 9 0 0 0-9-9Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18" /></svg>, color: 'text-teal-600', bg: 'bg-teal-100', borderHover: 'hover:border-teal-500', shadowHover: 'hover:shadow-teal-500/20' },
              { id: 7, name: 'Địa Lý', desc: 'Địa lý tự nhiên, kinh tế, bản đồ', icon: <MapPin size={28} />, color: 'text-red-600', bg: 'bg-red-100', borderHover: 'hover:border-red-500', shadowHover: 'hover:shadow-red-500/20' },
              { id: 8, name: 'Lịch Sử', desc: 'Lịch sử VN, thế giới, luyện thi', icon: <BookOpen size={28} />, color: 'text-amber-600', bg: 'bg-amber-100', borderHover: 'hover:border-amber-500', shadowHover: 'hover:shadow-amber-500/20' },
            ].map((subject) => (
              <div key={subject.id} className={`group bg-white rounded-3xl p-6 border-2 border-transparent shadow-sm hover:shadow-xl transition-all duration-300 ease-in-out hover:-translate-y-1 ${subject.borderHover} ${subject.shadowHover} cursor-pointer`}>
                <div className={`w-14 h-14 rounded-2xl ${subject.bg} ${subject.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  {subject.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{subject.name}</h3>
                <p className="text-slate-600 mb-4">{subject.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md">Lớp 6 - 12</span>
                  <ChevronRight size={20} className={`${subject.color} opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section id="ve-chung-toi" className="py-20 bg-blue-50/50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">
                Tại Sao Chọn <br /><span className="text-blue-600">Ánh Sáng Center?</span>
              </h2>
              <p className="text-lg text-slate-600 mb-10">
                Chúng tôi không chỉ truyền đạt kiến thức mà còn rèn luyện tư duy, kỹ năng tự học để các em phát triển toàn diện.
              </p>

              <div className="grid sm:grid-cols-2 gap-8">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4"><Users size={24} /></div>
                  <h4 className="text-lg font-bold text-slate-800 mb-2">Giáo Viên Giỏi</h4>
                  <p className="text-slate-600">Tất cả giáo viên tốt nghiệp ĐH, có kinh nghiệm 3-10 năm dạy học tâm huyết.</p>
                </div>
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4"><MonitorPlay size={24} /></div>
                  <h4 className="text-lg font-bold text-slate-800 mb-2">Theo Dõi Sát Sao</h4>
                  <p className="text-slate-600">Hệ thống điểm danh điện tử, phụ huynh nhận thông báo ngay khi con vắng mặt.</p>
                </div>
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4"><Clock size={24} /></div>
                  <h4 className="text-lg font-bold text-slate-800 mb-2">Lịch Học Linh Hoạt</h4>
                  <p className="text-slate-600">Học buổi chiều và tối, Thứ 2 đến Chủ Nhật, nhiều khung giờ để chọn lựa.</p>
                </div>
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4"><Award size={24} /></div>
                  <h4 className="text-lg font-bold text-slate-800 mb-2">Học Phí Hợp Lý</h4>
                  <p className="text-slate-600">Mức phí cạnh tranh, phụ huynh có thể kiểm tra hoá đơn dễ dàng qua hệ thống online.</p>
                </div>
              </div>
            </div>

            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-400 to-amber-200 rounded-3xl transform -rotate-3 scale-105 opacity-20 blur-lg"></div>

              <div className="relative bg-white p-8 md:p-10 rounded-3xl shadow-xl">
                <h3 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                  <TrendingUp className="text-amber-500" /> Kết Quả Học Tập 2023 - 2024
                </h3>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-bold text-slate-700">Tỷ lệ cải thiện điểm số</span>
                      <span className="font-extrabold text-blue-600">92%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3">
                      <div className="bg-blue-600 h-3 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                    <p className="text-sm text-slate-500 mt-2">Học viên cải thiện điểm sau 1 học kỳ</p>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-bold text-slate-700">Điểm Trung Bình Tăng</span>
                      <span className="font-extrabold text-emerald-600">+1.8</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3">
                      <div className="bg-emerald-500 h-3 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <p className="text-sm text-slate-500 mt-2">Mức tăng điểm trung bình của học viên</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-100">
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                      <div className="text-3xl font-extrabold text-amber-500 mb-1">78</div>
                      <div className="text-sm font-bold text-slate-700">Học Sinh Giỏi</div>
                      <div className="text-xs text-slate-500">Cấp Tỉnh / Thành phố</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                      <div className="text-3xl font-extrabold text-blue-600 mb-1">45</div>
                      <div className="text-sm font-bold text-slate-700">Thi Đậu</div>
                      <div className="text-xs text-slate-500">Các trường THPT Top 1</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
              Phù Hợp Với <span className="text-blue-600">Mọi Khối Lớp</span>
            </h2>
          </div>

          
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {['Lớp 6–7', 'Lớp 8–9', 'Lớp 10–11', 'Lớp 12'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === tab
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          
          <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm">
            {activeTab === 'Lớp 12' && (
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">Luyện Thi THPT Quốc Gia Chuyên Sâu</h3>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  Chương trình đặc biệt cho học sinh lớp 12 với lịch học tăng cường, đề thi thử hàng tháng,
                  và hỗ trợ định hướng nghề nghiệp, chọn trường Đại học.
                </p>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-emerald-500 shrink-0 mt-1" />
                    <div><span className="font-bold">Môn học:</span> Toán, Lý, Hóa, Anh, Văn, Sinh, Địa, Sử</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-emerald-500 shrink-0 mt-1" />
                    <div><span className="font-bold">Lịch học:</span> 3 buổi/tuần, 90 phút/buổi</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-emerald-500 shrink-0 mt-1" />
                    <div><span className="font-bold">Sĩ số:</span> Tối đa 15 học viên/lớp để đảm bảo chất lượng</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-emerald-500 shrink-0 mt-1" />
                    <div><span className="font-bold">Mục tiêu:</span> 8+ điểm mỗi môn thi THPT Quốc Gia</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <a href="#dang-ky" className="px-6 py-3 rounded-xl bg-amber-500 text-slate-900 font-bold hover:bg-amber-400 transition-colors">Đăng Ký Ngay</a>
                </div>
              </div>
            )}

            {activeTab !== 'Lớp 12' && (
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">Chương Trình Bồi Dưỡng Kiến Thức {activeTab}</h3>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  Củng cố nền tảng vững chắc, bám sát sách giáo khoa mới, giúp các em tự tin đạt điểm cao trên trường và chuẩn bị tốt cho các kỳ thi chuyển cấp.
                </p>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-emerald-500 shrink-0 mt-1" />
                    <div><span className="font-bold">Môn học trọng tâm:</span> Toán, Lý, Hóa, Anh, Văn</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-emerald-500 shrink-0 mt-1" />
                    <div><span className="font-bold">Lịch học:</span> 2 buổi/tuần, 90 phút/buổi</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <a href="#dang-ky" className="px-6 py-3 rounded-xl bg-amber-500 text-slate-900 font-bold hover:bg-amber-400 transition-colors">Đăng Ký Ngay</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      
      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
              Chỉ <span className="text-blue-600">3 Bước</span> Để Bắt Đầu Học
            </h2>
          </div>

          <div className="relative">
            
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-1 border-t-2 border-dashed border-slate-300"></div>

            <div className="grid md:grid-cols-3 gap-10">
              
              <div className="relative z-10 text-center">
                <div className="w-24 h-24 mx-auto bg-white rounded-full border-4 border-blue-100 flex items-center justify-center text-3xl shadow-lg mb-6 shadow-blue-500/10">
                  📝
                  <div className="absolute top-0 right-2 w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center border-4 border-slate-50">1</div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Đăng Ký Tư Vấn</h3>
                <p className="text-slate-600">Điền form hoặc gọi hotline. Nhân viên sẽ tư vấn môn học và khối lớp phù hợp.</p>
              </div>

              
              <div className="relative z-10 text-center">
                <div className="w-24 h-24 mx-auto bg-white rounded-full border-4 border-amber-100 flex items-center justify-center text-3xl shadow-lg mb-6 shadow-amber-500/10">
                  📅
                  <div className="absolute top-0 right-2 w-8 h-8 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center border-4 border-slate-50">2</div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Xếp Lớp & Lịch Học</h3>
                <p className="text-slate-600">Quản lý sắp xếp lớp học và khung giờ. Phụ huynh nhận lịch học chi tiết qua tài khoản.</p>
              </div>

              
              <div className="relative z-10 text-center">
                <div className="w-24 h-24 mx-auto bg-white rounded-full border-4 border-emerald-100 flex items-center justify-center text-3xl shadow-lg mb-6 shadow-emerald-500/10">
                  🎓
                  <div className="absolute top-0 right-2 w-8 h-8 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center border-4 border-slate-50">3</div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Bắt Đầu Học</h3>
                <p className="text-slate-600">Học viên đi học, phụ huynh theo dõi điểm danh, tiến độ học tập online tiện lợi.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
              Gặp Gỡ <span className="text-blue-600">Đội Ngũ Giáo Viên</span>
            </h2>
            <p className="text-lg text-slate-600">
              Tất cả giáo viên được tuyển chọn kỹ lưỡng, có bằng cấp chuyên môn sâu và đam mê giảng dạy, giúp truyền cảm hứng học tập cho học sinh.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { id: 1, name: 'Th.S Nguyễn Minh Tuấn', sub: 'Toán', exp: '8 năm', bio: 'Thạc sĩ Toán ĐH KHTN. Chuyên luyện thi Đại học khối A, A1.', color: 'blue', icon: '📐' },
              { id: 2, name: 'Th.S Trần Thị Lan', sub: 'Vật Lý', exp: '6 năm', bio: 'Cựu GV chuyên THPT Lê Hồng Phong. Phương pháp dạy thực tế.', color: 'purple', icon: '⚡' },
              { id: 3, name: 'CN. Phạm Văn Đức', sub: 'Hóa Học', exp: '5 năm', bio: 'Cử nhân ĐH Sư Phạm TP.HCM. Giải đề siêu tốc, tư duy logic.', color: 'emerald', icon: '🧪' },
              { id: 4, name: 'CN. Lê Thị Hương', sub: 'Tiếng Anh', exp: '7 năm', bio: 'IELTS 8.0, chứng chỉ giảng dạy CELTA Cambridge.', color: 'cyan', icon: '🇬🇧' },
            ].map((t) => (
              <div key={t.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center group">
                <div className={`w-20 h-20 mx-auto rounded-full bg-${t.color}-100 flex items-center justify-center text-2xl font-bold text-${t.color}-600 mb-4 group-hover:scale-110 transition-transform`}>
                  {t.name.split(' ').pop().charAt(0)}
                </div>
                <h4 className="text-lg font-bold text-slate-800 mb-2">{t.name}</h4>
                <div className="flex justify-center items-center gap-2 mb-3">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold bg-${t.color}-50 text-${t.color}-700 border border-${t.color}-100`}>
                    {t.icon} Môn {t.sub}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{t.exp} KN</span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-3">{t.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section className="py-20 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/30 blur-[100px] rounded-full"></div>

        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              Quản Lý Học Tập <span className="text-blue-400">Thông Minh</span>
            </h2>
            <p className="text-lg text-slate-300">
              Hệ thống công nghệ riêng biệt giúp kết nối Phụ huynh, Học sinh và Trung tâm một cách minh bạch, nhanh chóng.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>

              <div className="w-14 h-14 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                <Users size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-6">Cổng Thông Tin Phụ Huynh</h3>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3"><CheckCircle className="text-blue-400 shrink-0 mt-0.5" /> <span className="text-slate-300">Xem điểm danh của con ngay sau mỗi buổi học</span></li>
                <li className="flex items-start gap-3"><CheckCircle className="text-blue-400 shrink-0 mt-0.5" /> <span className="text-slate-300">Nhận thông báo khi con vắng mặt không phép</span></li>
                <li className="flex items-start gap-3"><CheckCircle className="text-blue-400 shrink-0 mt-0.5" /> <span className="text-slate-300">Kiểm tra hoá đơn học phí và lịch sử thanh toán</span></li>
                <li className="flex items-start gap-3"><CheckCircle className="text-blue-400 shrink-0 mt-0.5" /> <span className="text-slate-300">Xem lịch học chi tiết của con trong tuần</span></li>
              </ul>

              <button onClick={handleLoginClick} className="inline-block px-6 py-3 rounded-xl border border-blue-500 text-blue-400 font-bold hover:bg-blue-500 hover:text-white transition-colors">
                {isLoggedIn ? 'Vào Trang Quản Lý' : 'Đăng Nhập Cho Phụ Huynh'}
              </button>
            </div>

            
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-2 h-full bg-amber-500"></div>

              <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mb-6">
                <BookOpen size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-6">Cổng Thông Tin Học Viên</h3>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3"><CheckCircle className="text-amber-400 shrink-0 mt-0.5" /> <span className="text-slate-300">Xem thời khóa biểu học tập cá nhân</span></li>
                <li className="flex items-start gap-3"><CheckCircle className="text-amber-400 shrink-0 mt-0.5" /> <span className="text-slate-300">Kiểm tra lịch sử điểm danh của bản thân</span></li>
                <li className="flex items-start gap-3"><CheckCircle className="text-amber-400 shrink-0 mt-0.5" /> <span className="text-slate-300">Xem thông tin các lớp đang tham gia</span></li>
                <li className="flex items-start gap-3"><CheckCircle className="text-amber-400 shrink-0 mt-0.5" /> <span className="text-slate-300">Theo dõi tiến độ và nhận thông báo từ GV</span></li>
              </ul>

              <button onClick={handleLoginClick} className="inline-block px-6 py-3 rounded-xl border border-amber-500 text-amber-400 font-bold hover:bg-amber-500 hover:text-slate-900 transition-colors">
                {isLoggedIn ? 'Vào Trang Quản Lý' : 'Đăng Nhập Cho Học Viên'}
              </button>
            </div>
          </div>

          <p className="text-center text-slate-400 text-sm mt-10">Tài khoản được cấp bởi hệ thống khi đăng ký. Liên hệ quản lý trung tâm nếu quên mật khẩu.</p>
        </div>
      </section>

      
      <section className="py-20 bg-amber-50/50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
              Hàng Trăm Gia Đình <span className="text-amber-600">Tin Tưởng</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative">
              <div className="absolute top-0 left-6 w-12 h-1 bg-blue-500 rounded-b-md"></div>
              <div className="flex gap-1 text-amber-400 mb-6"><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /></div>
              <p className="text-slate-700 mb-8 italic leading-relaxed">"Con tôi học Toán từ 5 điểm lên 8 điểm chỉ sau một học kỳ. Cô giáo tận tâm, giải thích rất dễ hiểu. Chúng tôi rất hài lòng!"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">TT</div>
                <div>
                  <h4 className="font-bold text-slate-900">Chị Thanh Thủy</h4>
                  <p className="text-sm text-slate-500">Phụ huynh HS lớp 10</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative">
              <div className="absolute top-0 left-6 w-12 h-1 bg-emerald-500 rounded-b-md"></div>
              <div className="flex gap-1 text-amber-400 mb-6"><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /></div>
              <p className="text-slate-700 mb-8 italic leading-relaxed">"Lịch học linh hoạt, tôi có thể theo dõi điểm danh của con qua điện thoại. Hệ thống rất tiện lợi, rõ ràng và minh bạch!"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700">VB</div>
                <div>
                  <h4 className="font-bold text-slate-900">Anh Văn Bình</h4>
                  <p className="text-sm text-slate-500">Phụ huynh HS lớp 12</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative">
              <div className="absolute top-0 left-6 w-12 h-1 bg-amber-500 rounded-b-md"></div>
              <div className="flex gap-1 text-amber-400 mb-6"><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /></div>
              <p className="text-slate-700 mb-8 italic leading-relaxed">"Em thi đậu trường THPT Lê Quý Đôn là nhờ các lớp luyện thi Toán và Lý ở đây. Thầy dạy hay lắm, bài tập cực kì sát với đề thi thật!"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-700">MK</div>
                <div>
                  <h4 className="font-bold text-slate-900">Phạm Minh Khoa</h4>
                  <p className="text-sm text-slate-500">Cựu học viên (Đậu Lớp 10)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      <section id="dang-ky" className="py-20 bg-white relative overflow-hidden">
        
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full bg-blue-50 rounded-l-3xl -z-10 hidden lg:block"></div>

        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            
            <div id="lien-he">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
                Liên Hệ <span className="text-blue-600">Với Chúng Tôi</span>
              </h2>
              <p className="text-lg text-slate-600 mb-10">
                Nếu bạn cần tư vấn trực tiếp, đừng ngần ngại gọi cho chúng tôi hoặc đến trực tiếp trung tâm.
              </p>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">Địa Chỉ Trung Tâm</h4>
                    <p className="text-slate-600">Hòa Lạc, Hà Nội</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">Hotline Tư Vấn</h4>
                    <p className="text-slate-600 font-medium text-lg">0987 654 321</p>
                    <p className="text-sm text-slate-500">8:00 - 21:00, Từ T2 - CN</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">Email</h4>
                    <p className="text-slate-600">tuyensinh@anhsangcenter.vn</p>
                  </div>
                </div>
              </div>

            </div>

            
            <div>
              <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl border border-slate-100 relative">
                <h3 className="text-2xl font-bold text-slate-800 mb-6">Đăng Ký <span className="text-amber-500">Ngay</span></h3>

                <div className="text-center py-6">
                  <p className="text-slate-600 mb-8">Tạo tài khoản để nhận tư vấn và cập nhật thông tin học tập.</p>
                  <button onClick={() => setShowRegisterForm(true)} className="w-full py-4 rounded-xl bg-amber-500 text-slate-900 font-bold text-lg hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/30 transition-all flex justify-center items-center gap-2">
                    Đăng Ký Ngay <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      
      <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">

            
            <div className="lg:pr-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                  <BookOpen size={20} />
                </div>
                <span className="text-xl font-extrabold text-white">Ánh Sáng Center</span>
              </div>
              <p className="mb-6 leading-relaxed">Đồng hành cùng học sinh Việt Nam trên con đường tri thức. Cam kết chất lượng giảng dạy hàng đầu.</p>
              <div className="flex gap-4">
                
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors">
                  <MonitorPlay size={18} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-cyan-500 hover:text-white transition-colors">
                  <MessageCircle size={18} />
                </a>
              </div>
            </div>

            
            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Chương Trình Học</h4>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Toán Học</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Vật Lý</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Hóa Học</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Tiếng Anh</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Ngữ Văn & Khác</a></li>
              </ul>
            </div>

            
            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Thông Tin</h4>
              <ul className="space-y-3">
                <li><a href="#ve-chung-toi" className="hover:text-amber-400 transition-colors">Về Chúng Tôi</a></li>
                <li><a href="#lich-hoc" className="hover:text-amber-400 transition-colors">Lịch Học</a></li>
                <li><a href="#dang-ky" className="hover:text-amber-400 transition-colors">Học Phí & Đăng Ký</a></li>
                <li><a href="#lien-he" className="hover:text-amber-400 transition-colors">Liên Hệ</a></li>
              </ul>
            </div>



          </div>

          <div className="pt-8 border-t border-slate-800 text-center text-sm">
            <p>© 2025 Ánh Sáng Center — TP.HCM. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>

      
      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowLogin(false)}
              className="absolute -top-12 right-0 text-white hover:text-amber-400 transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full"
            >
              <X size={24} />
            </button>
            <LoginPage onSwitchToRegister={() => { setShowLogin(false); setShowRegisterForm(true); }} />
          </div>
        </div>
      )}

      {showRegisterForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowRegisterForm(false)}
              className="absolute -top-12 right-0 text-white hover:text-amber-400 transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full"
            >
              <X size={24} />
            </button>
            <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 relative">
              <h3 className="text-2xl font-bold text-slate-800 mb-6">Đăng Ký <span className="text-amber-500">Ngay</span></h3>
              <form onSubmit={handleFormSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Email *</label>
                  <input type="email" required placeholder="Nhập email của bạn" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Mật khẩu *</label>
                  <input type="password" required placeholder="Nhập mật khẩu" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Xác nhận mật khẩu *</label>
                  <input type="password" required placeholder="Nhập lại mật khẩu" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
                </div>

                <div className="pt-2">
                  <button type="submit" className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 transition-all flex justify-center items-center gap-2">
                    Đăng Ký <ArrowRight size={20} />
                  </button>
                </div>

                <div className="relative flex items-center justify-center mt-6 mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative px-4 bg-white text-sm text-slate-500">hoặc</div>
                </div>

                <button type="button" className="w-full py-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-base hover:bg-slate-50 transition-all flex justify-center items-center gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Đăng ký bằng Google
                </button>

                <div className="text-center mt-6">
                  <span className="text-slate-600 text-sm">Bạn đã có tài khoản? </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowRegisterForm(false);
                      setShowLogin(true);
                    }}
                    className="text-blue-600 font-bold hover:underline text-sm"
                  >
                    Đăng nhập
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
