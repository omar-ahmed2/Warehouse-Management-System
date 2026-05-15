import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { Customer } from '../types/contact.types';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { StatCard } from '../components/dashboard/StatCard';
import { Input } from '../components/ui/Input';
import {
  computeCustomerStats,
  computeAllCustomersDebt,
  computeAllCustomersSales,
} from '../utils/computeStats';

export const CustomersPage: React.FC = () => {
  const { data, updateData, showToast } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
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

  const handleAddCustomer = () => {
    const phoneError = validatePhone(formData.phone);
    const newErrors: Record<string, string> = {};
    
    if (!formData.name) newErrors.name = 'اسم العميل مطلوب';
    if (phoneError) newErrors.phone = phoneError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast(newErrors.name || newErrors.phone || 'يرجى تصحيح الأخطاء', 'error');
      return;
    }

    const newCustomer: Customer = {
      id: `c${Date.now()}`,
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      totalPurchases: 0,
      totalPaid: 0,
      totalDebt: 0,
      createdAt: new Date().toISOString()
    };

    updateData({
      customers: [...data.customers, newCustomer]
    });

    setFormData({ name: '', phone: '', address: '' });
    setErrors({});
    setIsModalOpen(false);
    showToast('تم إضافة العميل الجديد بنجاح', 'success');
  };

  const totalCustomers = data.customers.length;
  // ✅ محسوبة من الأوامر الفعلية — مصدر حقيقة واحد
  const totalReceivables = useMemo(
    () => computeAllCustomersDebt(data.outgoingOrders),
    [data.outgoingOrders]
  );
  const totalSales = useMemo(
    () => computeAllCustomersSales(data.outgoingOrders),
    [data.outgoingOrders]
  );

  const filteredCustomers = data.customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return data.outgoingOrders.filter(o => o.customerId === selectedCustomer.id);
  }, [selectedCustomer, data.outgoingOrders]);

  // ✅ إحصائيات العميل المحدد محسوبة مباشرة من أوامره
  const selectedCustomerStats = useMemo(() => {
    if (!selectedCustomer) return null;
    return computeCustomerStats(selectedCustomer.id, data.outgoingOrders);
  }, [selectedCustomer, data.outgoingOrders]);

  const columns = [
    { 
      key: 'name', 
      header: 'العميل', 
      render: (c: Customer) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-800 font-Cairo">{c.name}</span>
          <span className="text-[10px] text-slate-400 font-Tajawal">{c.phone}</span>
        </div>
      )
    },
    { key: 'address', header: 'العنوان', render: (c: Customer) => <span className="text-xs text-slate-500 font-Tajawal">{c.address}</span> },
    { 
      key: 'totalPurchases', 
      header: 'إجمالي المشتروات', 
      // ✅ محسوبة من الأوامر الفعلية
      render: (c: Customer) => {
        const stats = computeCustomerStats(c.id, data.outgoingOrders);
        return <span className="font-bold text-slate-700 tabular-nums">{formatCurrency(stats.totalPurchases)}</span>;
      }
    },
    { 
      key: 'totalDebt', 
      header: 'المديونية', 
      // ✅ محسوبة من الأوامر الفعلية
      render: (c: Customer) => {
        const stats = computeCustomerStats(c.id, data.outgoingOrders);
        return (
          <Badge color={stats.totalDebt > 0 ? 'danger' : 'success'}>
            {stats.totalDebt > 0 ? formatCurrency(stats.totalDebt) : 'خالص'}
          </Badge>
        );
      }
    },
    {
      key: 'actions',
      header: 'إجراءات',
      render: (c: Customer) => (
        <button 
          onClick={(e) => { e.stopPropagation(); setSelectedCustomer(c); }}
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
    { key: 'amountRemaining', header: 'الباقي', render: (o: any) => <span className="text-red-500">{formatCurrency(o.amountRemaining)}</span> },
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
          <h1 className="text-3xl font-black text-slate-800 font-Cairo tracking-tight">قاعدة بيانات العملاء</h1>
          <p className="text-slate-500 mt-2 font-Tajawal font-medium">إدارة العملاء، مديونياتهم، وسجل معاملاتهم</p>
        </div>

        <button 
          onClick={() => {
            setFormData({ name: '', phone: '', address: '' });
            setErrors({});
            setIsModalOpen(true);
          }}
          className="bg-accent-primary text-white font-Cairo font-black py-3 px-8 rounded-2xl shadow-lg shadow-accent-primary/20 hover:opacity-90 transition-all flex items-center gap-2"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          <span>إضافة عميل جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="إجمالي العملاء" 
          value={totalCustomers.toLocaleString('ar-EG')} 
          color="bg-blue-50" 
          textColor="text-blue-600"
          description="عميل مسجل بالنظام"
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>}
        />
        <StatCard 
          title="مبيعات العملاء" 
          value={formatCurrency(totalSales)} 
          color="bg-emerald-50" 
          textColor="text-emerald-600"
          description="إجمالي قيمة الفواتير الصادرة"
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>}
        />
        <StatCard 
          title="إجمالي المديونيات" 
          value={formatCurrency(totalReceivables)} 
          color="bg-red-50" 
          textColor="text-red-600"
          description="أموال مستحقة لدى العملاء"
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 1v22m5-18H7c-1.5 0-3 1.5-3 3s1.5 3 3 3h10c1.5 0 3 1.5 3 3s-1.5 3-3 3H7"></path></svg>}
        />
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/50">
          <h3 className="text-xl font-black font-Cairo text-slate-800">قائمة العملاء</h3>
          <div className="relative w-full md:w-80">
            <input 
              type="text" 
              placeholder="ابحث بالاسم أو رقم الهاتف..."
              className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-5 pr-12 text-sm font-Tajawal focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
        </div>

        <Table 
          columns={columns}
          data={filteredCustomers}
          emptyMessage="لا يوجد عملاء مطابقين للبحث"
        />
      </div>

      <Modal isOpen={!!selectedCustomer} onClose={() => setSelectedCustomer(null)} title={`سجل معاملات: ${selectedCustomer?.name}`} size="xl">
        <div className="space-y-6">
          {/* ✅ الأرقام محسوبة من الأوامر الفعلية — دائماً متزامنة */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                <p className="text-[10px] font-bold text-slate-400 font-Tajawal uppercase">إجمالي المبيعات</p>
                <p className="text-xl font-black text-slate-700 font-Cairo tabular-nums">{formatCurrency(selectedCustomerStats?.totalPurchases || 0)}</p>
             </div>
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                <p className="text-[10px] font-bold text-slate-400 font-Tajawal uppercase">إجمالي المحصل</p>
                <p className="text-xl font-black text-emerald-600 font-Cairo tabular-nums">{formatCurrency(selectedCustomerStats?.totalPaid || 0)}</p>
             </div>
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                <p className="text-[10px] font-bold text-slate-400 font-Tajawal uppercase">المتبقي (مديونية)</p>
                <p className="text-xl font-black text-red-500 font-Cairo tabular-nums">{formatCurrency(selectedCustomerStats?.totalDebt || 0)}</p>
             </div>
          </div>
          
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/30">
              <h4 className="font-black font-Cairo text-slate-700 text-sm">سجل الفواتير الصادرة</h4>
            </div>
            <Table 
              columns={orderColumns}
              data={customerOrders}
              emptyMessage="لا توجد فواتير مسجلة لهذا العميل حالياً"
            />
          </div>

          <div className="flex justify-between items-center pt-2">
             <div className="flex gap-2">
               <button 
                 onClick={() => {
                   if(window.confirm('هل أنت متأكد من تصفير حساب هذا العميل؟ سيتم اعتبار جميع ديونه مسددة.')) {
                     const updatedOrders = data.outgoingOrders.map(o => 
                       o.customerId === selectedCustomer?.id 
                         ? { ...o, amountRemaining: 0, amountCollected: o.totalAmount, status: 'completed' as const } 
                         : o
                     );
                     // ✅ لا يوجد تحديث يدوي للعميل نفسه (totalDebt) لأنها محسوبة ديناميكياً من updatedOrders
                     updateData({ outgoingOrders: updatedOrders });
                     setSelectedCustomer(null);
                     showToast('تم تصفير حساب العميل بنجاح', 'success');
                   }
                 }}
                 className="px-6 py-3 bg-amber-50 text-amber-600 hover:bg-amber-100 font-bold font-Cairo rounded-xl transition-all text-sm"
               >
                 تصفير الحساب
               </button>
               <button 
                 onClick={() => {
                   if(window.confirm('هل أنت متأكد من حذف هذا العميل؟ سيتم حذف جميع فواتيره والقيود المالية المرتبطة به.')) {
                     const deletedOrderIds = data.outgoingOrders
                       .filter(o => o.customerId === selectedCustomer?.id)
                       .map(o => o.id);

                     const updatedCustomers  = data.customers.filter(c => c.id !== selectedCustomer?.id);
                     const updatedOrders     = data.outgoingOrders.filter(o => o.customerId !== selectedCustomer?.id);
                     // ✅ حذف القيود المالية المرتبطة بفواتير العميل (حتى لا تؤثر على رصيد الخزنة)
                     const updatedFinance    = data.financeEntries.filter(
                       e => !e.referenceId || !deletedOrderIds.includes(e.referenceId)
                     );

                     updateData({
                       customers: updatedCustomers,
                       outgoingOrders: updatedOrders,
                       financeEntries: updatedFinance,
                     });
                     setSelectedCustomer(null);
                     showToast('تم حذف العميل وكافة سجلاته بنجاح', 'success');
                   }
                 }}
                 className="px-6 py-3 bg-red-50 text-red-500 hover:bg-red-100 font-bold font-Cairo rounded-xl transition-all text-sm"
               >
                 حذف العميل
               </button>
             </div>
             <button onClick={() => setSelectedCustomer(null)} className="px-8 py-3 bg-slate-900 text-white font-black font-Cairo rounded-xl shadow-lg shadow-slate-900/10">إغلاق</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="إضافة عميل جديد" size="md">
        <div className="space-y-6">
          <p className="text-sm text-slate-500 font-Tajawal">أدخل بيانات العميل الأساسية لفتح ملف تعريف جديد له.</p>
          <div className="grid grid-cols-1 gap-5">
            <Input 
              label="اسم العميل/الجهة"
              required
              placeholder="مثال: شركة النور"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              error={errors.name}
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>}
            />
            
            <Input 
              label="رقم الهاتف"
              required
              placeholder="01xxxxxxxxx"
              value={formData.phone}
              onChange={handlePhoneChange}
              error={errors.phone}
              maxLength={11}
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>}
            />

            <Input 
              label="العنوان بالتفصيل"
              placeholder="المحافظة - المدينة - الشارع"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>}
            />
          </div>
          <div className="pt-4 flex gap-3">
             <button onClick={handleAddCustomer} className="flex-1 bg-accent-primary text-white font-black font-Cairo py-4 rounded-2xl shadow-lg shadow-accent-primary/20 hover:opacity-90 transition-all">حفظ البيانات</button>
             <button onClick={() => setIsModalOpen(false)} className="px-8 text-slate-400 font-bold font-Cairo hover:bg-slate-50 rounded-xl transition-all">إلغاء</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};


