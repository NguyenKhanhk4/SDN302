import React, { useState, useEffect, useRef } from 'react';
import { adminApi } from '../../api/adminApi';
import Loading from '../../components/common/Loading';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Upload, File, FileText, X, Search, Plus, MoreVertical, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search
  const [search, setSearch] = useState('');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isManageFilesModalOpen, setIsManageFilesModalOpen] = useState(false);
  
  // Form state
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    gradeLevel: '',
    defaultTuitionFee: 0
  });
  const [saving, setSaving] = useState(false);

  // Files state
  const [syllabusFile, setSyllabusFile] = useState(null);
  const [materialFiles, setMaterialFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Dropdown menu state for cards
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const syllabusInputRef = useRef(null);
  const materialInputRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSubjects();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getSubjects({ search });
      if (res.success) {
        setSubjects(res.data);
      }
    } catch (err) {
      toast.error('Lỗi khi tải danh sách môn học');
    } finally {
      setLoading(false);
    }
  };

  // --- CRUD Handlers ---

  const handleOpenCreate = () => {
    setSelectedSubject(null);
    setFormData({ name: '', description: '', gradeLevel: '', defaultTuitionFee: 0 });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (subject) => {
    setSelectedSubject(subject);
    setFormData({
      name: subject.name || '',
      description: subject.description || '',
      gradeLevel: subject.gradeLevel || '',
      defaultTuitionFee: subject.defaultTuitionFee || 0
    });
    setIsFormModalOpen(true);
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên môn học');
      return;
    }
    
    try {
      setSaving(true);
      let res;
      if (selectedSubject) {
        res = await adminApi.updateSubject(selectedSubject._id, formData);
      } else {
        res = await adminApi.createSubject(formData);
      }

      if (res.success) {
        toast.success(selectedSubject ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
        fetchSubjects();
        setIsFormModalOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSubject = async (subject) => {
    if (!window.confirm(`Bạn có chắc muốn xóa môn học: ${subject.name}?`)) return;
    try {
      const res = await adminApi.deleteSubject(subject._id);
      if (res.success) {
        toast.success('Đã xóa môn học');
        fetchSubjects();
      }
    } catch (err) {
      toast.error('Lỗi khi xóa môn học');
    }
  };

  // --- File Management Handlers ---

  const handleOpenManageFiles = (subject) => {
    setSelectedSubject(subject);
    setSyllabusFile(null);
    setMaterialFiles([]);
    setIsManageFilesModalOpen(true);
  };

  const handleDeleteFile = async (fileUrl, fileType) => {
    if (!window.confirm('Bạn có chắc muốn xóa file này?')) return;
    try {
      const res = await adminApi.deleteSubjectFile(selectedSubject._id, { fileUrl, fileType });
      if (res.success) {
        toast.success('Đã xóa file');
        // Update selected subject local state to re-render modal immediately
        setSelectedSubject(res.data);
        fetchSubjects();
      }
    } catch (err) {
      toast.error('Lỗi khi xóa file');
    }
  };

  const handleUploadFiles = async (e) => {
    e.preventDefault();
    if (!syllabusFile && materialFiles.length === 0) {
      toast.error('Vui lòng chọn ít nhất một tệp để tải lên');
      return;
    }

    try {
      setUploading(true);
      const formDataUpload = new FormData();
      if (syllabusFile) formDataUpload.append('syllabus', syllabusFile);
      for (let i = 0; i < materialFiles.length; i++) {
        formDataUpload.append('materials', materialFiles[i]);
      }

      const res = await adminApi.uploadSubjectMaterials(selectedSubject._id, formDataUpload);
      if (res.success) {
        toast.success('Tải tài liệu lên thành công!');
        fetchSubjects();
        setSyllabusFile(null);
        setMaterialFiles([]);
        setSelectedSubject(res.data); // Update modal view
      }
    } catch (err) {
      toast.error('Lỗi khi tải tài liệu');
    } finally {
      setUploading(false);
    }
  };

  const getFileName = (pathStr) => {
    if (!pathStr) return '';
    const parts = pathStr.split(/[\/\\]/);
    return parts[parts.length - 1];
  };

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-500" />
            Quản Lý Giáo Trình
          </h1>
          <p className="text-sm text-slate-500 mt-1">Cập nhật đề cương, tài liệu và quản lý thông tin môn học</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-all gap-2"
        >
          <Plus className="w-5 h-5" />
          Tạo môn học mới
        </button>
      </div>

      {/* Filters Area */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm theo tên môn học..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
          />
        </div>
      </div>

      {loading && subjects.length === 0 ? (
        <Loading text="Đang tải dữ liệu..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={subject._id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-lg transition-all relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-150" />
              
              <div className="flex items-start justify-between relative z-10 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                
                {/* 3-dots Menu */}
                <div className="relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdownId(openDropdownId === subject._id ? null : subject._id);
                    }}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  <AnimatePresence>
                    {openDropdownId === subject._id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20"
                      >
                        <button 
                          onClick={() => handleOpenEdit(subject)}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" /> Sửa thông tin
                        </button>
                        <button 
                          onClick={() => handleDeleteSubject(subject)}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" /> Xóa môn học
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-800 mb-1 relative z-10">{subject.name}</h3>
              <p className="text-sm text-slate-500 line-clamp-2 relative z-10 mb-6">{subject.description || 'Chưa có mô tả'}</p>

              <div className="space-y-3 relative z-10 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Syllabus
                  </span>
                  <span className="font-semibold text-slate-700">
                    {subject.syllabus ? <span className="text-emerald-500">Đã cập nhật</span> : <span className="text-amber-500">Chưa có</span>}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-2">
                    <File className="w-4 h-4" /> Tài liệu
                  </span>
                  <span className="font-semibold text-slate-700">
                    {subject.materials?.length || 0} files
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleOpenManageFiles(subject)}
                className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 relative z-10"
              >
                <Upload className="w-4 h-4" />
                Quản lý Tài liệu
              </button>
            </motion.div>
          ))}
          
          {subjects.length === 0 && !loading && (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-100">
              Không tìm thấy môn học nào.
            </div>
          )}
        </div>
      )}

      {/* Form Modal (Create/Edit) */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsFormModalOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-800">
                    {selectedSubject ? 'Chỉnh sửa Môn học' : 'Tạo Môn học mới'}
                  </h2>
                  <button onClick={() => setIsFormModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveSubject} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Tên môn học <span className="text-red-500">*</span></label>
                    <input 
                      type="text" required
                      value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Cấp độ (Grade Level)</label>
                    <input 
                      type="text"
                      value={formData.gradeLevel} onChange={(e) => setFormData({...formData, gradeLevel: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Học phí mặc định (VNĐ)</label>
                    <input 
                      type="number" min="0"
                      value={formData.defaultTuitionFee} onChange={(e) => setFormData({...formData, defaultTuitionFee: e.target.value === '' ? '' : Number(e.target.value)})}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Mô tả</label>
                    <textarea 
                      rows={3}
                      value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                    />
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit" disabled={saving}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all disabled:opacity-70"
                    >
                      {saving ? 'Đang lưu...' : 'Lưu thông tin'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manage Files Modal */}
      <AnimatePresence>
        {isManageFilesModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsManageFilesModalOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] shadow-2xl relative z-10"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-800">Quản lý Tài liệu</h2>
                  <button onClick={() => setIsManageFilesModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-6 p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-1">Môn học</p>
                    <p className="text-base font-bold text-indigo-900">{selectedSubject?.name}</p>
                  </div>
                </div>

                {/* Existing Files */}
                <div className="mb-8 space-y-4">
                  <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">Tệp đang có trên hệ thống</h3>
                  
                  {/* Syllabus */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-bold text-slate-700">Đề cương (Syllabus)</p>
                        <p className="text-xs text-slate-500 truncate">
                          {selectedSubject?.syllabus ? getFileName(selectedSubject.syllabus) : 'Chưa cập nhật'}
                        </p>
                      </div>
                    </div>
                    {selectedSubject?.syllabus && (
                      <button 
                        onClick={() => handleDeleteFile(selectedSubject.syllabus, 'syllabus')}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                        title="Xóa đề cương"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Materials */}
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-slate-700 px-1">Tài liệu tham khảo ({selectedSubject?.materials?.length || 0})</p>
                    {selectedSubject?.materials?.map((mat, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="p-2 bg-slate-200 text-slate-600 rounded-lg shrink-0">
                            <File className="w-5 h-5" />
                          </div>
                          <p className="text-xs text-slate-600 truncate">{getFileName(mat)}</p>
                        </div>
                        <button 
                          onClick={() => handleDeleteFile(mat, 'materials')}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                          title="Xóa tài liệu"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {(!selectedSubject?.materials || selectedSubject.materials.length === 0) && (
                      <p className="text-xs text-slate-400 italic px-1">Chưa có tài liệu nào.</p>
                    )}
                  </div>
                </div>

                {/* Upload New Files */}
                <div className="pt-6 border-t border-slate-100">
                  <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider mb-4">Tải lên tệp mới</h3>
                  <form onSubmit={handleUploadFiles} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Syllabus Upload */}
                      <div>
                        <div 
                          onClick={() => syllabusInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors h-full flex flex-col items-center justify-center"
                        >
                          <FileText className="w-6 h-6 text-slate-400 mb-2" />
                          <p className="text-xs text-slate-600 font-medium px-2">
                            {syllabusFile ? syllabusFile.name : 'Chọn 1 tệp đề cương mới (ghi đè)'}
                          </p>
                        </div>
                        <input type="file" ref={syllabusInputRef} className="hidden" onChange={(e) => setSyllabusFile(e.target.files[0])} />
                      </div>

                      {/* Materials Upload */}
                      <div>
                        <div 
                          onClick={() => materialInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors h-full flex flex-col items-center justify-center"
                        >
                          <File className="w-6 h-6 text-slate-400 mb-2" />
                          <p className="text-xs text-slate-600 font-medium px-2">
                            {materialFiles.length > 0 ? `Đã chọn ${materialFiles.length} tệp` : 'Chọn thêm tài liệu tham khảo'}
                          </p>
                        </div>
                        <input type="file" ref={materialInputRef} className="hidden" multiple onChange={(e) => setMaterialFiles(Array.from(e.target.files))} />
                      </div>
                    </div>

                    <button 
                      type="submit" disabled={uploading}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-4"
                    >
                      {uploading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Upload className="w-5 h-5" /> Xác nhận tải lên</>}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminSubjectsPage;
