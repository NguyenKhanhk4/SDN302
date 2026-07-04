import React, { useState, useEffect, useRef } from 'react';
import { adminApi } from '../../api/adminApi';
import Loading from '../../components/common/Loading';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Upload, File, FileText, X } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [syllabusFile, setSyllabusFile] = useState(null);
  const [materialFiles, setMaterialFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const syllabusInputRef = useRef(null);
  const materialInputRef = useRef(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getSubjects();
      if (res.success) {
        setSubjects(res.data);
      }
    } catch (err) {
      toast.error('Lỗi khi tải danh sách môn học');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUpload = (subject) => {
    setSelectedSubject(subject);
    setSyllabusFile(null);
    setMaterialFiles([]);
    setUploadModalOpen(true);
  };

  const handleCloseUpload = () => {
    setUploadModalOpen(false);
    setSelectedSubject(null);
  };

  const handleUploadFiles = async (e) => {
    e.preventDefault();
    if (!syllabusFile && materialFiles.length === 0) {
      toast.error('Vui lòng chọn ít nhất một tệp để tải lên');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      if (syllabusFile) {
        formData.append('syllabus', syllabusFile);
      }
      for (let i = 0; i < materialFiles.length; i++) {
        formData.append('materials', materialFiles[i]);
      }

      const res = await adminApi.uploadSubjectMaterials(selectedSubject._id, formData);
      if (res.success) {
        toast.success('Tải tài liệu lên thành công!');
        fetchSubjects();
        handleCloseUpload();
      }
    } catch (err) {
      toast.error('Lỗi khi tải tài liệu');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <Loading text="Đang tải dữ liệu..." />;

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-500" />
            Quản Lý Giáo Trình
          </h1>
          <p className="text-sm text-slate-500 mt-1">Cập nhật đề cương và tài liệu học tập cho các bộ môn</p>
        </div>
      </div>

      {/* Grid of Subjects */}
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
              <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
                {subject.code}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-800 mb-1 relative z-10">{subject.name}</h3>
            <p className="text-sm text-slate-500 line-clamp-2 relative z-10 mb-6">{subject.description}</p>

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
              onClick={() => handleOpenUpload(subject)}
              className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 relative z-10"
            >
              <Upload className="w-4 h-4" />
              Tải tài liệu lên
            </button>
          </motion.div>
        ))}
      </div>

      {/* Upload Modal (Glassmorphism) */}
      <AnimatePresence>
        {uploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={handleCloseUpload}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-800">Tải lên tài liệu</h2>
                  <button onClick={handleCloseUpload} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-6 p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                  <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-1">Môn học</p>
                  <p className="text-base font-bold text-indigo-900">{selectedSubject?.name}</p>
                </div>

                <form onSubmit={handleUploadFiles} className="space-y-6">
                  {/* Syllabus Upload */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Đề cương môn học (Syllabus)</label>
                    <div 
                      onClick={() => syllabusInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors"
                    >
                      <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600 font-medium">
                        {syllabusFile ? syllabusFile.name : 'Nhấn để chọn 1 tệp đề cương'}
                      </p>
                    </div>
                    <input 
                      type="file" 
                      ref={syllabusInputRef} 
                      className="hidden" 
                      onChange={(e) => setSyllabusFile(e.target.files[0])}
                    />
                  </div>

                  {/* Materials Upload */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tài liệu tham khảo (Materials)</label>
                    <div 
                      onClick={() => materialInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors"
                    >
                      <File className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600 font-medium">
                        {materialFiles.length > 0 
                          ? `Đã chọn ${materialFiles.length} tệp` 
                          : 'Nhấn để chọn nhiều tệp tài liệu'
                        }
                      </p>
                    </div>
                    <input 
                      type="file" 
                      ref={materialInputRef} 
                      className="hidden" 
                      multiple
                      onChange={(e) => setMaterialFiles(Array.from(e.target.files))}
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={uploading}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-[0_4px_15px_rgb(79,70,229,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {uploading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Xác nhận tải lên
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminSubjectsPage;
