import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { managerApi } from '../../api/managerApi';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const ManagerEditSubjectPage = () => {
  const navigate = useNavigate();
  const { subjectId } = useParams();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    gradeLevel: '',
    defaultTuitionFee: 0,
    status: 'ACTIVE'
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [globalError, setGlobalError] = useState('');

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const res = await managerApi.getSubjectDetail(subjectId);
        if (res.success) {
          const s = res.data.subject || res.data;
          setFormData({
            name: s.name || '',
            description: s.description || '',
            gradeLevel: s.gradeLevel || '',
            defaultTuitionFee: s.defaultTuitionFee || 0,
            status: (s.status || 'ACTIVE').toUpperCase()
          });
        } else {
          setGlobalError(res.message || 'Không tìm thấy môn học');
        }
      } catch (err) {
        setGlobalError('Lỗi khi tải thông tin môn học');
      } finally {
        setLoading(false);
      }
    };
    fetchSubject();
  }, [subjectId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Tên môn học là bắt buộc';
    if (!formData.gradeLevel.trim()) newErrors.gradeLevel = 'Khối lớp là bắt buộc';
    if (Number(formData.defaultTuitionFee) < 0) newErrors.defaultTuitionFee = 'Học phí phải từ 0 trở lên';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setSaving(true);
    setGlobalError('');
    try {
      const res = await managerApi.updateSubject(subjectId, {
        ...formData,
        defaultTuitionFee: Number(formData.defaultTuitionFee)
      });
      if (res.success) {
        alert('Cập nhật môn học thành công!');
        navigate('/manager/subjects');
      } else {
        setGlobalError(res.message || 'Cập nhật môn học thất bại');
      }
    } catch (err) {
      setGlobalError('Đã xảy ra lỗi hệ thống');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sửa Môn Học</h1>
        </div>
        <Button variant="secondary" onClick={() => navigate('/manager/subjects')}>
          Quay lại
        </Button>
      </div>

      <Card className="p-6">
        {globalError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-200">{globalError}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Tên môn học" name="name" value={formData.name} onChange={handleChange} error={errors.name} />
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Mô tả chi tiết</label>
            <textarea 
              name="description" 
              rows="3"
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.description} 
              onChange={handleChange}
            ></textarea>
          </div>

          <Input label="Khối lớp" name="gradeLevel" value={formData.gradeLevel} onChange={handleChange} error={errors.gradeLevel} />
          
          <Input 
            label="Học phí mặc định (VND)" 
            name="defaultTuitionFee" 
            type="number" 
            value={formData.defaultTuitionFee} 
            onChange={handleChange} 
            error={errors.defaultTuitionFee} 
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Trạng thái</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Không hoạt động</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit" 
              disabled={saving}
              className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors shadow-sm shadow-amber-500/20 disabled:opacity-70"
            >
              {saving ? 'Đang lưu...' : 'Cập nhật môn học'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ManagerEditSubjectPage;