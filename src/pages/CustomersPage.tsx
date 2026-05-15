import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { Customer } from '../types/contact.types';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { StatCard } from '../components/dashboard/StatCard';

export const CustomersPage: React.FC = () => {
  const { data, updateData, showToast } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const totalCustomers = data.customers.length;
  const totalReceivables = data.customers.reduce((acc, c) => acc + c.totalDebt, 0);
  const totalSales = data.customers.reduce((acc, c) => acc + c.totalPurchases, 0);

  const filteredCustomers = data.customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return data.outgoingOrders.filter(o => o.customerId === selectedCustomer.id);
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
      render: (c: Customer) => <span className="font-bold text-slate-700 tabular-nums">{formatCurrency(c.totalPurchases)}</span> 
    },
    { 
      key: 'totalDebt', 
      header: 'المديونية', 
      render: (c: Customer) => (
        <Badge color={c.totalDebt > 0 ? 'danger' : 'success'}>
          {c.totalDebt > 0 ? formatCurrency(c.totalDebt) : 'خالص'}
        </Badge>
      )
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
          onClick={() => setIsModalOpen(true)}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                <p className="text-[10px] font-bold text-slate-400 font-Tajawal uppercase">إجمالي المبيعات</p>
                <p className="text-xl font-black text-slate-700 font-Cairo tabular-nums">{formatCurrency(selectedCustomer?.totalPurchases || 0)}</p>
             </div>
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                <p className="text-[10px] font-bold text-slate-400 font-Tajawal uppercase">إجمالي المحصل</p>
                <p className="text-xl font-black text-emerald-600 font-Cairo tabular-nums">{formatCurrency(selectedCustomer?.totalPaid || 0)}</p>
             </div>
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                <p className="text-[10px] font-bold text-slate-400 font-Tajawal uppercase">المتبقي (مديونية)</p>
                <p className="text-xl font-black text-red-500 font-Cairo tabular-nums">{formatCurrency(selectedCustomer?.totalDebt || 0)}</p>
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

          <div className="flex justify-end gap-3 pt-2">
             <button onClick={() => setSelectedCustomer(null)} className="px-8 py-3 bg-slate-900 text-white font-black font-Cairo rounded-xl shadow-lg shadow-slate-900/10">إغلاق</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="إضافة عميل جديد" size="md">
        <div className="space-y-6">
          <p className="text-sm text-slate-500 font-Tajawal">أدخل بيانات العميل الأساسية لفتح ملف تعريف جديد له.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
               <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider font-Cairo mr-1">اسم العميل/الجهة</label>
               <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:ring-2 focus:ring-accent-primary/10 outline-none font-Tajawal" placeholder="مثال: شركة النور" />
            </div>
            <div className="space-y-1.5">
               <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider font-Cairo mr-1">رقم الهاتف</label>
               <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:ring-2 focus:ring-accent-primary/10 outline-none font-Tajawal" placeholder="01xxxxxxxxx" />
            </div>
            <div className="space-y-1.5 md:col-span-2">
               <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider font-Cairo mr-1">العنوان بالتفصيل</label>
               <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:ring-2 focus:ring-accent-primary/10 outline-none font-Tajawal" placeholder="المحافظة - المدينة - الشارع" />
            </div>
          </div>
          <div className="pt-4 flex gap-3">
             <button onClick={() => { setIsModalOpen(false); showToast('تمت الإضافة بنجاح (نسخة عرض)', 'info'); }} className="flex-1 bg-accent-primary text-white font-black font-Cairo py-4 rounded-2xl">حفظ البيانات</button>
             <button onClick={() => setIsModalOpen(false)} className="px-8 text-slate-400 font-bold font-Cairo">إلغاء</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
