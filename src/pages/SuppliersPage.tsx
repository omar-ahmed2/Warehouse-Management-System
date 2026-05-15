import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { Supplier } from '../types/contact.types';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { StatCard } from '../components/dashboard/StatCard';
import { Input } from '../components/ui/Input';
import {
  computeSupplierStats,
  computeAllSuppliersDebt,
  computeAllSuppliersSourcing,
} from '../utils/computeStats';

export const SuppliersPage: React.FC = () => {
  const { data, updateData, showToast } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validatePhone = (phone: string) => {
    if (!phone) return 'رقم الهاتف مطلوب';
    if (phone.length !== 11) return 'يجب أن يتكون رقم الهاتف من 11 رقم بالضبط';
    if (!/^01[0125][0-9]{8}$/.test(phone)) return 'رقم الهاتف غير صحيح (يجب أن يبدأ بـ 01)';
    return '';
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 11) {
      setFormData({ ...formData, phone: value });
      if (errors.phone) setErrors({ ...errors, phone: '' });
    }
  };

  const handleAddSupplier = () => {
    const phoneError = validatePhone(formData.phone);
    const newErrors: Record<string, string> = {};
    
    if (!formData.name) newErrors.name = 'اسم المورد مطلوب';
    if (phoneError) newErrors.phone = phoneError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast(newErrors.name || newErrors.phone || 'يرجى تصحيح الأخطاء', 'error');
      return;
    }

    const newSupplier: Supplier = {
      id: `s${Date.now()}`,
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      totalSourcing: 0,
      totalPaid: 0,
      totalDebt: 0,
      createdAt: new Date().toISOString()
    };

    updateData({
      suppliers: [...data.suppliers, newSupplier]
    });

    setFormData({ name: '', phone: '', address: '' });
    setErrors({});
    setIsModalOpen(false);
    showToast('تم إضافة المورد الجديد بنجاح', 'success');
  };

  const totalSuppliers = data.suppliers.length;
  // ✅ محسوبة من الأوامر الفعلية — مصدر حقيقة واحد
  const totalDebts = useMemo(
    () => computeAllSuppliersDebt(data.incomingOrders),
    [data.incomingOrders]
  );
  const totalSourcing = useMemo(
    () => computeAllSuppliersSourcing(data.incomingOrders),
    [data.incomingOrders]
  );

  const filteredSuppliers = data.suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.phone.includes(searchTerm)
  );

  const supplierOrders = useMemo(() => {
    if (!selectedSupplier) return [];
    return data.incomingOrders.filter(o => o.supplierId === selectedSupplier.id);
  }, [selectedSupplier, data.incomingOrders]);

  // ✅ إحصائيات المورد المحدد محسوبة مباشرة من أوامره
  const selectedSupplierStats = useMemo(() => {
    if (!selectedSupplier) return null;
    return computeSupplierStats(selectedSupplier.id, data.incomingOrders);
  }, [selectedSupplier, data.incomingOrders]);

  const columns = [
    { 
      key: 'name', 
      header: 'المورد', 
      render: (s: Supplier) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-800 font-Cairo">{s.name}</span>
          <span className="text-[10px] text-slate-400 font-Tajawal">{s.phone}</span>
        </div>
      )
    },
    { key: 'address', header: 'العنوان', render: (s: Supplier) => <span className="text-xs text-slate-500 font-Tajawal">{s.address}</span> },
    { 
      key: 'totalSourcing', 
      header: 'إجمالي التوريدات', 
      // ✅ محسوبة من الأوامر الفعلية
      render: (s: Supplier) => {
        const stats = computeSupplierStats(s.id, data.incomingOrders);
        return <span className="font-bold text-slate-700 tabular-nums">{formatCurrency(stats.totalSourcing)}</span>;
      }
    },
    { 
      key: 'totalDebt', 
      header: 'علينا له', 
      // ✅ محسوبة من الأوامر الفعلية
      render: (s: Supplier) => {
        const stats = computeSupplierStats(s.id, data.incomingOrders);
        return (
          <Badge color={stats.totalDebt > 0 ? 'danger' : 'success'}>
            {stats.totalDebt > 0 ? formatCurrency(stats.totalDebt) : 'مسدد بالكامل'}
          </Badge>
        );
      }
    },
    {
      key: 'actions',
      header: 'إجراءات',
      render: (s: Supplier) => (
        <button 
          onClick={(e) => { e.stopPropagation(); setSelectedSupplier(s); }}
          className="text-accent-primary font-bold text-xs hover:underline"
        >
          عرض السجل
        </button>
      )
    }
  ];

  const orderColumns = [
    { key: 'id', header: '#' },
    { key: 'createdAt', header: 'التاريخ', render: (o: any) => formatDate(o.createdAt) },
    { key: 'totalAmount', header: 'القيمة', render: (o: any) => formatCurrency(o.totalAmount) },
    { key: 'amountDue', header: 'المتبقي', render: (o: any) => <span className="text-red-500">{formatCurrency(o.amountDue)}</span> },
    { 
      key: 'status', 
      header: 'الحالة',
      render: (o: any) => {
        const labels: any = { pending: 'معلق', partial: 'جزئي', completed: 'مكتمل' };
        const colors: any = { pending: 'warning', partial: 'primary', completed: 'success' };
        return <Badge color={colors[o.status]}>{labels[o.status]}</Badge>;
      }
    }
  ];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 font-Cairo tracking-tight">سجل الموردين</h1>
          <p className="text-slate-500 mt-2 font-Tajawal font-medium">إدارة الموردين، مديونيات الشركة، وعقود التوريد</p>
        </div>

        <button 
          onClick={() => {
            setFormData({ name: '', phone: '', address: '' });
            setErrors({});
            setIsModalOpen(true);
          }}
          className="bg-slate-900 text-white font-Cairo font-black py-3 px-8 rounded-2xl shadow-lg shadow-slate-900/10 hover:opacity-90 transition-all flex items-center gap-2"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          <span>إضافة مورد جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="عدد الموردين" 
          value={totalSuppliers.toLocaleString('ar-EG')} 
          color="bg-slate-50" 
          textColor="text-slate-700"
          description="شركات ومصانع نتعامل معها"
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>}
        />
        <StatCard 
          title="حجم التوريد" 
          value={formatCurrency(totalSourcing)} 
          color="bg-violet-50" 
          textColor="text-violet-600"
          description="إجمالي قيمة الفواتير الواردة"
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 22L14 16L18 22"></path><path d="M2 10L6 4L10 10"></path><path d="M12 4V12"></path></svg>}
        />
        <StatCard 
          title="مستحقات للموردين" 
          value={formatCurrency(totalDebts)} 
          color="bg-red-50" 
          textColor="text-red-500"
          description="ديون لم تسدد بعد للموردين"
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>}
        />
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/50">
          <h3 className="text-xl font-black font-Cairo text-slate-800">قائمة الموردين</h3>
          <div className="relative w-full md:w-80">
            <input 
              type="text" 
              placeholder="ابحث عن مورد..."
              className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-5 pr-12 text-sm font-Tajawal focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
        </div>

        <Table 
          columns={columns}
          data={filteredSuppliers}
          emptyMessage="لا يوجد موردين حالياً"
        />
      </div>

      <Modal isOpen={!!selectedSupplier} onClose={() => setSelectedSupplier(null)} title={`سجل معاملات: ${selectedSupplier?.name}`} size="xl">
        <div className="space-y-6">
          {/* ✅ الأرقام محسوبة من الأوامر الفعلية — دائماً متزامنة */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                <p className="text-[10px] font-bold text-slate-400 font-Tajawal uppercase">إجمالي المشتريات</p>
                <p className="text-xl font-black text-slate-700 font-Cairo tabular-nums">{formatCurrency(selectedSupplierStats?.totalSourcing || 0)}</p>
             </div>
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                <p className="text-[10px] font-bold text-slate-400 font-Tajawal uppercase">إجمالي المسدد</p>
                <p className="text-xl font-black text-emerald-600 font-Cairo tabular-nums">{formatCurrency(selectedSupplierStats?.totalPaid || 0)}</p>
             </div>
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                <p className="text-[10px] font-bold text-slate-400 font-Tajawal uppercase">المتبقي للمورد</p>
                <p className="text-xl font-black text-red-500 font-Cairo tabular-nums">{formatCurrency(selectedSupplierStats?.totalDebt || 0)}</p>
             </div>
          </div>
          
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/30">
              <h4 className="font-black font-Cairo text-slate-700 text-sm">وفواتير التوريد (المشتريات)</h4>
            </div>
            <Table 
              columns={orderColumns}
              data={supplierOrders}
              emptyMessage="لا توجد فواتير توريد لهذا المورد حالياً"
            />
          </div>

          <div className="flex justify-between items-center pt-2">
             <div className="flex gap-2">
               <button 
                 onClick={() => {
                   if(window.confirm('هل أنت متأكد من تصفير حساب هذا المورد؟ سيتم اعتبار جميع مستحقاته مسددة.')) {
                     const updatedOrders = data.incomingOrders.map(o => 
                       o.supplierId === selectedSupplier?.id 
                         ? { ...o, amountDue: 0, amountPaid: o.totalAmount, status: 'completed' as const } 
                         : o
                     );
                     // ✅ لا يوجد تحديث يدوي للمورد نفسه (totalDebt) — محسوبة ديناميكياً من updatedOrders
                     updateData({ incomingOrders: updatedOrders });
                     setSelectedSupplier(null);
                     showToast('تم تصفير حساب المورد بنجاح', 'success');
                   }
                 }}
                 className="px-6 py-3 bg-amber-50 text-amber-600 hover:bg-amber-100 font-bold font-Cairo rounded-xl transition-all text-sm"
               >
                 تصفير الحساب
               </button>
               <button 
                 onClick={() => {
                   if(window.confirm('هل أنت متأكد من حذف هذا المورد؟ سيتم حذف جميع فواتيره والقيود المالية المرتبطة به.')) {
                     const deletedOrderIds = data.incomingOrders
                       .filter(o => o.supplierId === selectedSupplier?.id)
                       .map(o => o.id);

                     const updatedSuppliers = data.suppliers.filter(s => s.id !== selectedSupplier?.id);
                     const updatedOrders   = data.incomingOrders.filter(o => o.supplierId !== selectedSupplier?.id);
                     // ✅ حذف القيود المالية المرتبطة بفواتير المورد (حتى لا تؤثر على رصيد الخزنة)
                     const updatedFinance  = data.financeEntries.filter(
                       e => !e.referenceId || !deletedOrderIds.includes(e.referenceId)
                     );

                     updateData({
                       suppliers: updatedSuppliers,
                       incomingOrders: updatedOrders,
                       financeEntries: updatedFinance,
                     });
                     setSelectedSupplier(null);
                     showToast('تم حذف المورد وكافة سجلاته بنجاح', 'success');
                   }
                 }}
                 className="px-6 py-3 bg-red-50 text-red-500 hover:bg-red-100 font-bold font-Cairo rounded-xl transition-all text-sm"
               >
                 حذف المورد
               </button>
             </div>
             <button onClick={() => setSelectedSupplier(null)} className="px-8 py-3 bg-slate-900 text-white font-black font-Cairo rounded-xl shadow-lg shadow-slate-900/10">إغلاق</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="إضافة مورد جديد" size="md">
        <div className="space-y-6">
          <p className="text-sm text-slate-500 font-Tajawal">سيتم فتح ملف مالي وتجاري لهذا المورد لمتابعة الديون والتوريدات.</p>
          <div className="grid grid-cols-1 gap-5">
            <Input 
              label="اسم المورد"
              required
              placeholder="مثال: مصنع النصر"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              error={errors.name}
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>}
            />
            
            <Input 
              label="رقم التواصل"
              required
              placeholder="01xxxxxxxxx"
              value={formData.phone}
              onChange={handlePhoneChange}
              error={errors.phone}
              maxLength={11}
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>}
            />

            <Input 
              label="مقر الشركة"
              placeholder="العنوان التجاري"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>}
            />
          </div>
          <div className="pt-4 flex gap-3">
             <button onClick={handleAddSupplier} className="flex-1 bg-slate-900 text-white font-black font-Cairo py-4 rounded-2xl shadow-lg shadow-accent-primary/20 hover:opacity-90 transition-all">حفظ المورد</button>
             <button onClick={() => setIsModalOpen(false)} className="px-8 text-slate-400 font-bold font-Cairo hover:bg-slate-50 rounded-xl transition-all">إلغاء</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

