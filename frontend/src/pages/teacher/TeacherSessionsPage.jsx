import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teacherApi } from '../../api/teacherApi';
import { formatDate } from '../../utils/formatDate';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const TeacherSessionsPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({ sessionDate: '', topic: '' });
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchSessions();
  }, [classId]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await teacherApi.getSessionsByClass(classId);
      
      let sessionList = [];
      if (Array.isArray(data)) sessionList = data;
      else if (data && Array.isArray(data.sessions)) sessionList = data.sessions;
      else if (data && Array.isArray(data.data)) sessionList = data.data;
      
      setSessions(sessionList);
    } catch (err) {
      setError(err.message || err.error || 'Failed to load sessions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formError) setFormError('');
    if (successMessage) setSuccessMessage('');
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!formData.sessionDate) {
      setFormError('Session Date is required.');
      return;
    }
    if (!formData.topic.trim()) {
      setFormError('Topic is required.');
      return;
    }

    try {
      setCreating(true);
      setFormError('');
      setSuccessMessage('');
      
      await teacherApi.createSession(classId, {
        sessionDate: formData.sessionDate,
        topic: formData.topic
      });
      
      setSuccessMessage('Session created successfully!');
      setFormData({ sessionDate: '', topic: '' });
      fetchSessions(); // Reload list directly after success
      
    } catch (err) {
      setFormError(err.message || err.error || 'Failed to create session. Please check your inputs.');
    } finally {
      setCreating(false);
    }
  };

  if (loading && sessions.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading text="Loading sessions..." />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Class Sessions</h1>
          <p className="mt-1 text-sm text-gray-500">Manage teaching sessions for this class.</p>
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

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
          <p className="font-medium">Error loading sessions</p>
          <p className="text-sm">{error}</p>
          <button onClick={fetchSessions} className="mt-2 text-sm underline focus:outline-none">Try Again</button>
        </div>
      )}

      {/* Create Session Form */}
      <Card title="Create New Session" className="mb-8 border-l-4 border-l-primary shadow-sm">
        <form onSubmit={handleCreateSession} className="space-y-4">
          {successMessage && (
            <div className="p-3 bg-green-50 text-green-700 text-sm font-medium rounded border border-green-200">
              {successMessage}
            </div>
          )}
          {formError && (
            <div className="p-3 bg-red-50 text-red-700 text-sm font-medium rounded border border-red-200">
              {formError}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Session Date"
              name="sessionDate"
              type="date"
              value={formData.sessionDate}
              onChange={handleFormChange}
            />
            <Input
              label="Topic / Subject Matter"
              name="topic"
              type="text"
              placeholder="E.g., Review algebra"
              value={formData.topic}
              onChange={handleFormChange}
            />
          </div>
          <div className="pt-2">
            <Button type="submit" variant="primary" loading={creating}>
              Create Session
            </Button>
          </div>
        </form>
      </Card>

      {/* Sessions List Table */}
      <Card title="Session List" className="w-full">
        {loading && sessions.length > 0 ? (
           <div className="py-8"><Loading text="Refreshing list..." /></div>
        ) : sessions.length === 0 ? (
          <EmptyState 
            title="No Sessions Found" 
            description="You haven't created any sessions for this class yet."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sessions.map((item, index) => {
                  const id = item._id || item.id;
                  return (
                    <tr key={id || index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(item.sessionDate || item.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">{item.topic || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge status={item.status || 'SCHEDULED'} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button 
                          variant="secondary" 
                          onClick={() => navigate(`/teacher/classes/${classId}/sessions/${id}/attendance`)}
                          className="!py-1.5 !px-3 !text-xs text-primary hover:text-primary-hover hover:bg-blue-50 border border-primary/20"
                        >
                          Attendance
                        </Button>
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

export default TeacherSessionsPage;
