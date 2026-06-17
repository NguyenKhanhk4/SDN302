import React, { useState, useEffect } from 'react';
import { teacherApi } from '../../api/teacherApi';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';

const TeacherSchedulesPage = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await teacherApi.getSchedules();
      
      let scheduleList = [];
      if (Array.isArray(data)) scheduleList = data;
      else if (data && Array.isArray(data.schedules)) scheduleList = data.schedules;
      else if (data && Array.isArray(data.data)) scheduleList = data.data;
      
      setSchedules(scheduleList);
    } catch (err) {
      setError(err.message || err.error || 'Failed to load your schedules. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dayOfWeek) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek] !== undefined ? days[dayOfWeek] : 'Unknown';
  };

  const getClassName = (item) => {
    if (item?.classId?.name) return item.classId.name;
    if (item?.class?.name) return item.class.name;
    if (typeof item?.classId === 'string') return item.classId;
    return 'Unknown Class';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading text="Loading your schedules..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
        <p className="font-medium">Error</p>
        <p className="text-sm">{error}</p>
        <button 
          onClick={fetchSchedules}
          className="mt-3 text-sm font-medium text-red-700 hover:text-red-800 underline focus:outline-none"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
        <p className="mt-1 text-sm text-gray-500">Your teaching schedule.</p>
      </div>

      <Card className="w-full">
        {schedules.length === 0 ? (
          <EmptyState 
            title="No Schedules Found" 
            description="You don't have any teaching schedules assigned."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day Of Week</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schedules.map((item, index) => (
                  <tr key={item._id || item.id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{getClassName(item)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium bg-gray-100 px-2 py-1 rounded inline-block">
                        {getDayName(item.dayOfWeek)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{item.startTime || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{item.endTime || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{item.room || item?.classId?.room || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge status={item.status || 'ACTIVE'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TeacherSchedulesPage;
