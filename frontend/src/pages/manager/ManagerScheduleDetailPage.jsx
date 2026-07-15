import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { managerApi } from '../../api/managerApi';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { ArrowLeft, Calendar, Clock, MapPin, Edit } from 'lucide-react';

const getDayOfWeekLabel = (day) => {
  const map = {
    MONDAY: 'Thứ 2',
    TUESDAY: 'Thứ 3',
    WEDNESDAY: 'Thứ 4',
    THURSDAY: 'Thứ 5',
    FRIDAY: 'Thứ 6',
    SATURDAY: 'Thứ 7',
    SUNDAY: 'Chủ nhật',
  };
  return map[day?.toUpperCase()] || day;
};

const ManagerScheduleDetailPage = () => {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchScheduleDetail();
  }, [scheduleId]);

  const fetchScheduleDetail = async () => {
    try {
      setLoading(true);
      const response = await managerApi.getScheduleDetail(scheduleId);
      if (response.success) {
        setSchedule(response.data);
      } else {
        setError(response.message || 'Không tìm thấy lịch học');
      }
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi tải thông tin lịch học');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading text="Đang tải chi tiết lịch học..." />;

  if (error || !schedule) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 text-sm">
          {error || 'Không tìm thấy lịch học'}
        </div>
        <Button variant="outline" onClick={() => navigate('/manager/schedules')}>
          Quay lại Danh sách
        </Button>
      </div>
    );
  }

  const cls = schedule.classId || {};
  const teacher = schedule.teacherId?.userId || {};

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/manager/schedules')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chi tiết Lịch học</h1>
          </div>
        </div>
        <Button variant="primary" onClick={() => navigate(`/manager/schedules/edit/${scheduleId}`)}>
          <Edit className="w-4 h-4 mr-2" /> Chỉnh sửa
        </Button>
      </div>

      <Card>
        <div className="space-y-6">
          <div className="border-b border-gray-100 pb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Lớp: {cls.name || 'N/A'}</h3>
              <p className="text-sm text-gray-500 mt-1">Giáo viên: <span className="font-semibold text-gray-700">{teacher.name || 'N/A'}</span></p>
            </div>
            <Badge status={schedule.status === 'active' ? 'ACTIVE' : 'INACTIVE'} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Ngày học</span>
                <span className="text-sm font-semibold text-gray-800 mt-1 block">{getDayOfWeekLabel(schedule.dayOfWeek)}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Thời gian</span>
                <span className="text-sm font-semibold text-gray-800 mt-1 block">
                  {schedule.startTime} - {schedule.endTime}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:col-span-2">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Phòng học</span>
                <span className="text-sm text-gray-800 mt-1 block font-medium">
                  {schedule.room || cls.room || 'Chưa xếp phòng'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ManagerScheduleDetailPage;
