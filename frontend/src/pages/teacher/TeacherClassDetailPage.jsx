import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teacherApi } from '../../api/teacherApi';
import { formatDate } from '../../utils/formatDate';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

const TeacherClassDetailPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classDetail, setClassDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClassDetail();
  }, [classId]);

  const fetchClassDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await teacherApi.getClassDetail(classId);
      
      // Data might be wrapped depending on backend convention
      const detail = data?.class || data?.data || data;
      setClassDetail(detail);
    } catch (err) {
      setError(err.message || err.error || 'Failed to load class details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSubjectName = (cls) => {
    if (cls?.subjectId?.name) return cls.subjectId.name;
    if (cls?.subject?.name) return cls.subject.name;
    if (typeof cls?.subject === 'string') return cls.subject;
    return 'N/A';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading text="Loading class details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
        <p className="font-medium">Error</p>
        <p className="text-sm">{error}</p>
        <div className="mt-4 flex space-x-4">
          <button 
            onClick={fetchClassDetail}
            className="text-sm font-medium text-red-700 hover:text-red-800 underline focus:outline-none"
          >
            Try Again
          </button>
          <button 
            onClick={() => navigate('/teacher/classes')}
            className="text-sm font-medium text-gray-700 hover:text-gray-900 underline focus:outline-none"
          >
            Back to Classes
          </button>
        </div>
      </div>
    );
  }

  if (!classDetail) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Class Detail</h1>
          <p className="mt-1 text-sm text-gray-500">Detailed information about the class.</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/teacher/classes')}>
          &larr; Back to Classes
        </Button>
      </div>

      <Card className="w-full max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Class Name</p>
              <p className="text-lg font-semibold text-gray-900">{classDetail.name || classDetail.className || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Subject</p>
              <p className="text-base text-gray-900 font-medium">{getSubjectName(classDetail)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Room</p>
              <p className="text-base text-gray-900">{classDetail.room || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Max Students</p>
              <p className="text-base text-gray-900">{classDetail.maxStudents || classDetail.capacity || 'N/A'}</p>
            </div>
          </div>
          
          <div className="space-y-5">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Status</p>
              <div>
                <Badge status={classDetail.status || 'ACTIVE'} />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Start Date</p>
              <p className="text-base text-gray-900">{formatDate(classDetail.startDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">End Date</p>
              <p className="text-base text-gray-900">{formatDate(classDetail.endDate)}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap gap-4">
          <Button 
            variant="primary" 
            onClick={() => navigate(`/teacher/classes/${classId}/students`)}
          >
            View Students
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => navigate(`/teacher/classes/${classId}/sessions`)}
          >
            View Sessions
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TeacherClassDetailPage;
