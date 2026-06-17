import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teacherApi } from '../../api/teacherApi';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

const TeacherClassStudentsPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, [classId]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await teacherApi.getStudentsInClass(classId);
      
      // Handle array or object wrapper depending on backend standard
      let studentList = [];
      if (Array.isArray(data)) studentList = data;
      else if (data && Array.isArray(data.students)) studentList = data.students;
      else if (data && Array.isArray(data.data)) studentList = data.data;
      
      setStudents(studentList);
    } catch (err) {
      setError(err.message || err.error || 'Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStudentInfo = (item) => {
    // Navigate safely through nested structure: item.studentId.userId
    // Also include fallbacks in case backend flattens the response
    const user = item?.studentId?.userId || item?.studentId || item?.userId || item?.student || item;
    return {
      name: user?.fullName || user?.name || 'Unknown',
      email: user?.email || 'N/A',
      phone: user?.phone || 'N/A',
      status: item?.status || 'ACTIVE'
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading text="Loading students..." />
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
            onClick={fetchStudents}
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="mt-1 text-sm text-gray-500">Students in this class.</p>
        </div>
        <div className="space-x-3">
          <Button variant="outline" onClick={() => navigate(`/teacher/classes/${classId}`)}>
            &larr; Class Detail
          </Button>
          <Button variant="secondary" onClick={() => navigate('/teacher/classes')}>
            All Classes
          </Button>
        </div>
      </div>

      <Card className="w-full">
        {students.length === 0 ? (
          <EmptyState 
            title="No Students Found" 
            description="There are currently no students enrolled in this class."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((item, index) => {
                  const info = getStudentInfo(item);
                  return (
                    <tr key={item._id || item.id || index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{info.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{info.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{info.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge status={info.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TeacherClassStudentsPage;
