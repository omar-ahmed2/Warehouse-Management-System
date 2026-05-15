import React, { useState } from 'react';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { ExpensesForm } from '../components/finance/ExpensesForm';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { StatCard } from '../components/dashboard/StatCard';
import { FinanceEntry, EntryType } from '../types/finance.types';

export const FinancePage: React.FC = () => {
  const { data, updateData, showToast } = useAppContext();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  // Calculations for current metrics
  const totalSales = data.outgoingOrders.reduce((acc, o) => acc + o.totalAmount, 0);
  const totalExpenses = (data.financeEntries || [])
    .filter(e => e.type === 'company_expense' || e.type === 'incoming_payment')
    .reduce((acc, e) => acc + Math.abs(e.amount), 0);
  
  const cashInVault = (data.financeEntries || []).reduce((acc, e) => acc + e.amount, 0);
  
  const inventoryValue = data.inventory.reduce((acc, item) => {
    const product = data.products.find(p => p.id === item.productId);
    return acc + (item.currentQty * (product?.buyPrice || 0));
  }, 0);

  // Net Profit: Gross profit from sales minus company operating expenses
  const totalGrossProfit = data.outgoingOrders.reduce((acc, o) => acc + (o.totalProfit || 0), 0);
  const operatingExpenses = (data.financeEntries || [])
    .filter(e => e.type === 'company_expense')
    .reduce((acc, e) => acc + Math.abs(e.amount), 0);
  
  const estimatedProfit = totalGrossProfit - operatingExpenses;

  const customerDebts = data.outgoingOrders.reduce((acc, o) => acc + o.amountRemaining, 0);
  const supplierDebts = data.incomingOrders.reduce((acc, o) => acc + o.amountDue, 0);

  const statsProps = [
    { 
      title: 'الخزنة (الكاش)', 
      value: formatCurrency(cashInVault), 
      color: 'bg-emerald-50', 
      textColor: 'text-emerald-600',
      description: 'النقدية المتوفرة حالياً في الدرج',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
    },
    { 
      title: 'إجمالي المبيعات', 
      value: formatCurrency(totalSales), 
      color: 'bg-blue-50', 
      textColor: 'text-blue-600',
      description: 'إجمالي الفواتير الصادرة للفترة',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
    },
    { 
      title: 'المصروفات', 
      value: formatCurrency(totalExpenses), 
      color: 'bg-red-50', 
      textColor: 'text-red-600',
      description: 'قيمة المشتريات والرواتب والإيجار',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 22L14 16L18 22"/><path d="M2 10L6 4L10 10"/><path d="M12 4V12"/></svg>
    },
    { 
      title: 'صافي الربح', 
      value: formatCurrency(estimatedProfit), 
      color: 'bg-amber-50', 
      textColor: 'text-amber-600',
      description: 'إجمالي أرباح المبيعات بعد خصم مصروفات الشركة',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
    },
    { 
      title: 'قيمة بضاعة المخزن', 
      value: formatCurrency(inventoryValue), 
      color: 'bg-violet-50', 
      textColor: 'text-violet-600',
      description: 'إجمالي قيمة المخزون الحالي بسعر الشراء',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
    },
  ];

  const typeLabels: any = {
    capital_deposit: 'إيداع رأس مال',
    revenue_deposit: 'إيداع إيراد',
    company_expense: 'مصاريف شركة',
    incoming_payment: 'دفع للمورد',
    outgoing_collection: 'تحصيل صادر',
  };

  const typeColors: any = {
    capital_deposit: 'primary',
    revenue_deposit: 'success',
    company_expense: 'danger',
    incoming_payment: 'warning',
    outgoing_collection: 'teal',
  };

  const filteredEntries = ((filterType === 'all' 
    ? (data.financeEntries || [])
    : (data.financeEntries || []).filter(e => e.type === filterType)) || []).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleFormSubmit = (formData: { type: EntryType; amount: number; description: string }) => {
    const finalAmount = (formData.type === 'company_expense' || formData.type === 'incoming_payment') ? -Math.abs(formData.amount) : Math.abs(formData.amount);
    
    const newEntry: FinanceEntry = {
      id: `f${Date.now()}`,
      ...formData,
      amount: finalAmount,
      referenceId: null,
      referenceType: null,
      createdAt: new Date().toISOString(),
      createdBy: user?.id || '1',
    };

    updateData({ financeEntries: [...(data.financeEntries || []), newEntry] });
    showToast('تم تسجيل القيد المالي الجديد بنجاح', 'success');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-black text-slate-800 font-Cairo tracking-tight">الإدارة المالية</h1>
           <p className="text-slate-500 mt-2 font-Tajawal font-medium">متابعة التدفقات النقدية والأرباح والديون</p>
        </div>

        <div className="flex items-center gap-3">
          {(user?.role === 'manager' || user?.role === 'supervisor') && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-accent-teal text-white font-Cairo font-black py-3 px-8 rounded-2xl flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-accent-teal/20"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <span>إضافة قيد يدوي</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {statsProps.map((s, j) => (
            <StatCard key={j} {...s} />
        ))}
      </div>

      {/* Debt Boxes - Redesigned */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm">
            <RevenueChart />
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="flex-1 bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                <h3 className="text-lg font-bold font-Cairo mb-6 relative z-10">مديونيات العملاء</h3>
                <div className="relative z-10">
                    <p className="text-4xl font-black text-emerald-400 font-Cairo tabular-nums">{formatCurrency(customerDebts)}</p>
                    <p className="text-[10px] text-slate-400 mt-4 font-Tajawal leading-relaxed">إجمالي المبالغ المستحقة من العملاء (الأقساط المتبقية)</p>
                </div>
            </div>

            <div className="flex-1 bg-white border border-red-100 rounded-[32px] p-8 relative overflow-hidden group shadow-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
                <h3 className="text-lg font-bold font-Cairo text-slate-800 mb-6 relative z-10">مديونيات الموردين</h3>
                <div className="relative z-10">
                    <p className="text-4xl font-black text-red-500 font-Cairo tabular-nums">{formatCurrency(supplierDebts)}</p>
                    <p className="text-[10px] text-slate-400 mt-4 font-Tajawal leading-relaxed">إجمالي المبالغ التي يتعين علينا دفعها للموردين</p>
                </div>
            </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-50/50">
            <h3 className="text-xl font-black font-Cairo text-slate-800">سجل القيود المالية</h3>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
                {['all', 'capital_deposit', 'revenue_deposit', 'company_expense', 'incoming_payment', 'outgoing_collection'].map(type => (
                    <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`
                            px-5 py-2 rounded-xl text-[10px] font-black transition-all whitespace-nowrap font-Cairo border
                            ${filterType === type 
                                ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/10' 
                                : 'bg-white text-slate-400 border-slate-200 hover:border-slate-800 hover:text-slate-800'}
                        `}
                    >
                        {type === 'all' ? 'الكل' : typeLabels[type as keyof typeof typeLabels]}
                    </button>
                ))}
            </div>
        </div>

        <Table 
            columns={[
                { 
                    key: 'createdAt', 
                    header: 'التاريخ', 
                    render: (e: FinanceEntry) => <span className="text-slate-500 text-sm font-Tajawal">{formatDate(e.createdAt)}</span>
                },
                { 
                    key: 'type', 
                    header: 'نوع العملية', 
                    render: (e: FinanceEntry) => (
                        <div className="flex items-center gap-2">
                            <Badge color={typeColors[e.type] as any} withDot>{typeLabels[e.type]}</Badge>
                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tight">{e.referenceId ? 'تلقائي' : 'يدوي'}</span>
                        </div>
                    )
                },
                { key: 'description', header: 'البيان الوصفي', render: (e: FinanceEntry) => <span className="font-bold text-slate-700">{e.description}</span> },
                { 
                    key: 'amount', 
                    header: 'القيمة المالية', 
                    render: (e: FinanceEntry) => (
                        <div className={`flex items-center gap-1 font-black ${e.amount >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            <span className="font-mono text-sm">{e.amount >= 0 ? '+' : ''}</span>
                            <span className="tabular-nums">{formatCurrency(e.amount)}</span>
                        </div>
                    )
                },
                { 
                    key: 'actions', 
                    header: '', 
                    render: (e: FinanceEntry) => (
                        <div className="flex justify-end">
                            {(user?.role === 'manager' || user?.role === 'supervisor') && !e.referenceId && (
                                <button 
                                    onClick={(event) => { event.stopPropagation(); setDeletingId(e.id); setIsDeleteModalOpen(true); }}
                                    className="p-2.5 rounded-xl text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                            )}
                        </div>
                    )
                },
            ]} 
            data={filteredEntries} 
            emptyMessage="لا توجد عمليات مسجلة متوافقة مع الفلتر الحالي"
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="تسجيل قيد مالي جديد" size="md">
        <ExpensesForm onSubmit={handleFormSubmit} onCancel={() => setIsModalOpen(false)} />
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="تأكيد حذف القيد"
        size="sm"
      >
        <div className="space-y-8 text-center p-2">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[28px] flex items-center justify-center mx-auto shadow-inner">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-2xl font-black font-Cairo text-slate-800">هل ترغب في الحذف؟</h3>
            <p className="text-sm text-slate-400 font-Tajawal leading-relaxed">
              سيتم إزالة هذا القيد نهائياً من سجلات الخزنة. لا يمكن التراجع عن هذه الخطوة.
            </p>
          </div>

          <div className="flex flex-col gap-3">
             <button 
                onClick={() => {
                    const filtered = data.financeEntries.filter(e => e.id !== deletingId);
                    updateData({ financeEntries: filtered });
                    showToast('تم الحذف بنجاح', 'success');
                    setIsDeleteModalOpen(false);
                }}
                className="w-full bg-red-600 text-white font-Cairo font-black py-4 rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
             >
                تأكيد الحذف النهائي
             </button>
             <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="w-full text-slate-400 font-Cairo font-bold py-2 hover:bg-slate-50 rounded-2xl transition-all"
             >
                إلغاء التراجع
             </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
