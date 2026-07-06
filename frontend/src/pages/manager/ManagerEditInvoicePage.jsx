import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { managerApi } from '../../api/managerApi';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const ManagerEditInvoicePage = () => {
  const navigate = useNavigate();
  const { invoiceId } = useParams();

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [globalError, setGlobalError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, cRes, invRes] = await Promise.all([
          managerApi.getStudents({ status: 'active' }),
          managerApi.getClasses({ status: 'active' }),
          managerApi.getInvoiceDetail(invoiceId)
        ]);
        
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

        if (invRes.success) {
          const inv = invRes.data.invoice || invRes.data;
          setFormData({
            studentId: inv.studentId?._id || inv.studentId || '',
            classId: inv.classId?._id || inv.classId || '',
            amount: inv.amount || '',
            month: inv.month || '',
            dueDate: inv.dueDate ? inv.dueDate.substring(0, 10) : '',
            status: inv.status || 'UNPAID'
          });
        } else {
          setGlobalError('Không tìm thấy hóa đơn');
        }
      } catch (err) {
        setGlobalError('Lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [invoiceId]);

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
    if (Number(formData.amount) <= 0) newErrors.amount = 'Số tiền phải lớn hơn 0';
    if (!formData.month) newErrors.month = 'Tháng là bắt buộc';
    if (!formData.dueDate) newErrors.dueDate = 'Hạn thanh toán là bắt buộc';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setSaving(true);
    setGlobalError('');
    try {
      const res = await managerApi.updateInvoice(invoiceId, {
        ...formData,
        amount: Number(formData.amount)
      });
      if (res.success) {
        alert('Cập nhật hóa đơn thành công!');
        navigate('/manager/invoices');
      } else {
        setGlobalError(res.message || 'Cập nhật hóa đơn thất bại');
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
          <h1 className="text-2xl font-bold text-slate-900">Sửa Hóa Đơn</h1>
        </div>
        <Button variant="secondary" onClick={() => navigate('/manager/invoices')}>
          Quay lại
        </Button>
      </div>

      <Card className="p-6">
        {globalError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-200">{globalError}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Học viên</label>
            <select name="studentId" value={formData.studentId} onChange={handleChange} className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer ${errors.studentId ? 'border-red-500' : 'border-slate-300'}`}>
              <option value="">-- Chọn học viên --</option>
              {students.map(s => <option key={s._id} value={s._id}>{s.fullName} - {s.phone}</option>)}
            </select>
            {errors.studentId && <p className="text-red-500 text-xs">{errors.studentId}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Lớp học</label>
            <select name="classId" value={formData.classId} onChange={handleChange} className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer ${errors.classId ? 'border-red-500' : 'border-slate-300'}`}>
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
            <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
              <option value="UNPAID">Chưa thanh toán</option>
              <option value="PAID">Đã thanh toán</option>
              <option value="PARTIAL">Thanh toán một phần</option>
              <option value="OVERDUE">Quá hạn</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit" 
              disabled={saving}
              className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors shadow-sm shadow-amber-500/20 disabled:opacity-70"
            >
              {saving ? 'Đang lưu...' : 'Cập nhật hóa đơn'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ManagerEditInvoicePage;