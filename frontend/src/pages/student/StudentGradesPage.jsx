import { useState, useEffect } from 'react';
import { studentApi } from '../../api/studentApi';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import { 
  Award, 
  BookOpen, 
  TrendingUp, 
  MessageSquare, 
  AlertCircle,
  FileText,
  Percent
} from 'lucide-react';

const StudentGradesPage = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await studentApi.getGrades();
      if (res.success) {
        setGrades(res.data || []);
      } else {
        throw new Error(res.message || 'Không thể tải danh sách điểm số');
      }
    } catch (err) {
      setError(err.message || err.error || 'Đã có lỗi xảy ra khi tải danh sách điểm số.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  // Calculate summary statistics
  const totalClasses = grades.length;
  const averageFinalScore = totalClasses > 0 
    ? (grades.reduce((sum, g) => sum + g.finalScore, 0) / totalClasses).toFixed(2)
    : '0.00';
  
  const highestScore = totalClasses > 0 
    ? Math.max(...grades.map(g => g.finalScore)).toFixed(2)
    : '0.00';

  const getScoreBadge = (score) => {
    if (score >= 8.5) return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Giỏi (A)</span>;
    if (score >= 7.0) return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Khá (B)</span>;
    if (score >= 5.0) return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Trung bình (C)</span>;
    return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Yếu (D/F)</span>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loading text="Đang tải danh sách điểm số từ hệ thống..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 max-w-xl mx-auto mt-10">
        <p className="font-medium flex items-center gap-2">
          <AlertCircle className="h-5 w-5" /> Lỗi tải dữ liệu
        </p>
        <p className="text-sm mt-1">{error}</p>
        <button 
          onClick={fetchGrades}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Điểm số của tôi</h1>
        <p className="text-sm text-gray-500 mt-1">
          Bảng điểm chi tiết cho từng lớp học, bao gồm các đầu điểm thành phần, trọng số, điểm trung bình và nhận xét từ giảng viên.
        </p>
      </div>

      {grades.length === 0 ? (
        <Card className="py-12 text-center max-w-xl mx-auto">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="p-4 bg-gray-50 rounded-full text-gray-400">
              <Award className="h-10 w-10 stroke-1" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Bạn chưa có điểm số nào</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Giao diện sẽ hiển thị điểm ngay khi bạn tham gia vào lớp học hoạt động.
            </p>
          </div>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-5 flex items-center space-x-4 border-l-4 border-blue-500">
              <div className="p-3 bg-blue-50 text-blue-500 rounded-xl">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Số môn học đã học</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalClasses} lớp học</h3>
              </div>
            </Card>

            <Card className="p-5 flex items-center space-x-4 border-l-4 border-emerald-500">
              <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Điểm trung bình tích lũy</p>
                <h3 className="text-2xl font-bold text-emerald-600 mt-1">{averageFinalScore} / 10</h3>
              </div>
            </Card>

            <Card className="p-5 flex items-center space-x-4 border-l-4 border-indigo-500">
              <div className="p-3 bg-indigo-50 text-indigo-500 rounded-xl">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Điểm cao nhất</p>
                <h3 className="text-2xl font-bold text-indigo-600 mt-1">{highestScore} / 10</h3>
              </div>
            </Card>
          </div>

          {/* Grades List */}
          <div className="space-y-8">
            {grades.map((grade) => (
              <Card key={grade._id} className="overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="bg-slate-50 border-b border-slate-100 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded">
                      {grade.class.subjectCode || 'MÔN HỌC'}
                    </span>
                    <h3 className="text-xl font-bold text-gray-800 mt-1.5">{grade.class.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{grade.class.subject}</p>
                  </div>
                  
                  {/* Final Score Circle/Badge */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-400 font-medium">ĐIỂM TỔNG KẾT</p>
                      <div className="flex items-center gap-2 mt-0.5 justify-end">
                        <span className="text-2xl font-black text-gray-800">{grade.finalScore}</span>
                        <span className="text-sm text-gray-400">/ 10</span>
                      </div>
                    </div>
                    <div className="h-12 w-px bg-slate-200"></div>
                    <div>
                      {getScoreBadge(grade.finalScore)}
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500 font-medium">
                      <span>Tiến trình điểm số</span>
                      <span>{Math.round(grade.finalScore * 10)}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          grade.finalScore >= 8.5 
                            ? 'bg-green-500' 
                            : grade.finalScore >= 7.0 
                            ? 'bg-blue-500' 
                            : grade.finalScore >= 5.0 
                            ? 'bg-yellow-500' 
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${grade.finalScore * 10}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Components table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                      <thead>
                        <tr className="bg-slate-50/50">
                          <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Đầu điểm thành phần
                          </th>
                          <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Tỷ trọng
                          </th>
                          <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Điểm số
                          </th>
                          <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Đóng góp vào điểm tổng
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {grade.gradeItems.map((item, idx) => {
                          const contribution = (item.score * (item.weight / 100)).toFixed(2);
                          return (
                            <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                              <td className="whitespace-nowrap px-4 py-3.5 text-sm font-medium text-gray-800 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-slate-400" />
                                {item.title}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3.5 text-sm text-gray-500 text-center font-semibold">
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs">
                                  {item.weight}
                                  <Percent className="h-3 w-3 stroke-[2.5]" />
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-4 py-3.5 text-sm text-center">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-xs border ${
                                  item.score >= 8.5 
                                    ? 'text-green-700 bg-green-50 border-green-100' 
                                    : item.score >= 7.0 
                                    ? 'text-blue-700 bg-blue-50 border-blue-100' 
                                    : item.score >= 5.0 
                                    ? 'text-yellow-700 bg-yellow-50 border-yellow-100' 
                                    : 'text-red-700 bg-red-50 border-red-100'
                                }`}>
                                  {item.score.toFixed(1)}
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-4 py-3.5 text-sm text-gray-800 text-right font-black">
                                +{contribution}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Remarks */}
                  {grade.remarks && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex gap-3 items-start animate-fade-in">
                      <MessageSquare className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nhận xét của giảng viên</p>
                        <p className="text-sm text-gray-700 leading-relaxed italic">
                          "{grade.remarks}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default StudentGradesPage;
