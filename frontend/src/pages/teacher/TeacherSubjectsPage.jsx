import React, { useState, useEffect } from 'react';
import { teacherApi } from '../../api/teacherApi';
import Loading from '../../components/common/Loading';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, File, FileText, X, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { downloadFile, getFileUrl, getFileName } from '../../utils/fileUtils';

const TeacherSubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isViewFilesModalOpen, setIsViewFilesModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSubjects();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await teacherApi.getMySubjects({ search });
      if (res.success) {
        setSubjects(res.data);
      }
    } catch (err) {
      toast.error('Lỗi khi tải danh sách môn học');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenViewFiles = (subject) => {
    setSelectedSubject(subject);
    setIsViewFilesModalOpen(true);
  };

  const getFileName = (pathStr) => {
    if (!pathStr) return '';
    const parts = pathStr.split(/[\/\\]/);
    return parts[parts.length - 1];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-500" />
            Giáo trình của tôi
          </h1>
          <p className="text-sm text-slate-500 mt-1">Xem đề cương và tài liệu các môn học bạn đang giảng dạy</p>
        </div>
      </div>

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
                onClick={() => handleOpenViewFiles(subject)}
                className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 relative z-10"
              >
                <FileText className="w-4 h-4" />
                Xem Tài liệu
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

      <AnimatePresence>
        {isViewFilesModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsViewFilesModalOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] shadow-2xl relative z-10"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-800">Tài liệu môn học</h2>
                  <button onClick={() => setIsViewFilesModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-6 p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-1">Môn học</p>
                    <p className="text-base font-bold text-indigo-900">{selectedSubject?.name}</p>
                  </div>
                </div>

                <div className="mb-8 space-y-4">
                  <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">Tệp tài liệu</h3>
                  
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
                        onClick={() => downloadFile(getFileUrl(selectedSubject.syllabus), getFileName(selectedSubject.syllabus))}
                        className="px-3 py-1.5 text-xs font-bold bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors shrink-0"
                      >
                        Tải về
                      </button>
                    )}
                  </div>

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
                          onClick={() => downloadFile(getFileUrl(mat), getFileName(mat))}
                          className="px-3 py-1.5 text-xs font-bold bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors shrink-0"
                        >
                          Tải về
                        </button>
                      </div>
                    ))}
                    {(!selectedSubject?.materials || selectedSubject.materials.length === 0) && (
                      <p className="text-sm text-slate-400 italic px-1">Chưa có tài liệu tham khảo nào</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherSubjectsPage;
