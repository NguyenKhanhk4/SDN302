import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { managerApi } from '../../api/managerApi';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const ManagerCreateInvoicePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    studentId: '',
    classId: '',
    amount: '',
    month: '',
    dueDate: '',
    status: 'UNPAID'
  });
  
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, cRes] = await Promise.all([
          managerApi.getStudents({ status: 'active' }),
          managerApi.getClasses({ status: 'active' })
        ]);
        // Chức năng của Manager: đọc data từ backend
        if (sRes.success) {
          const list = (sRes.data.students || sRes.data || []).map(s => ({
            ...s,
            fullName: s.userId?.name || '',
            phone: s.parentPhone || '',
          }));
          setStudents(list);
        }
        if (cRes.success) {
          const list = (cRes.data.classes || cRes.data || []);
          setClasses(list);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.studentId) newErrors.studentId = 'Học viên là bắt buộc';
    if (!formData.classId) newErrors.classId = 'Lớp học là bắt buộc';
    if (Number(formData.amount) <= 0) newErrors.amount = 'Số tiền phải lớn hơn 0';
    if (!formData.month) newErrors.month = 'Tháng là bắt buộc';
    if (!formData.dueDate) newErrors.dueDate = 'Hạn thanh toán là bắt buộc';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    setGlobalError('');
    try {
      const res = await managerApi.createInvoice({
        ...formData,
        amount: Number(formData.amount)
      });
      if (res.success) {
        navigate('/manager/invoices');
      } else {
        setGlobalError(res.message || 'Tạo hóa đơn thất bại');
      }
    } catch (err) {
      setGlobalError('Đã xảy ra lỗi hệ thống');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tạo Hóa Đơn Mới</h1>
        </div>
        <Button variant="secondary" onClick={() => navigate('/manager/invoices')}>
          Quay lại
        </Button>
      </div>

      <Card className="p-6">
        {globalError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">{globalError}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Học viên</label>
            <select name="studentId" value={formData.studentId} onChange={handleChange} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.studentId ? 'border-red-500' : 'border-slate-300'}`}>
              <option value="">-- Chọn học viên --</option>
              {students.map(s => <option key={s._id} value={s._id}>{s.fullName} - {s.phone}</option>)}
            </select>
            {errors.studentId && <p className="text-red-500 text-xs">{errors.studentId}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Lớp học</label>
            <select name="classId" value={formData.classId} onChange={handleChange} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.classId ? 'border-red-500' : 'border-slate-300'}`}>
              <option value="">-- Chọn lớp học --</option>
              {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            {errors.classId && <p className="text-red-500 text-xs">{errors.classId}</p>}
          </div>

          <Input label="Số tiền (VND)" name="amount" type="number" value={formData.amount} onChange={handleChange} error={errors.amount} />
          <Input label="Tháng (YYYY-MM)" name="month" type="month" value={formData.month} onChange={handleChange} error={errors.month} />
          <Input label="Hạn thanh toán" name="dueDate" type="date" value={formData.dueDate} onChange={handleChange} error={errors.dueDate} />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Trạng thái</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="UNPAID">Chưa thanh toán</option>
              <option value="PAID">Đã thanh toán</option>
              <option value="PARTIAL">Thanh toán một phần</option>
              <option value="OVERDUE">Quá hạn</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" variant="primary" loading={loading}>
              Lưu hóa đơn
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ManagerCreateInvoicePage;
