import React, { useState } from 'react';
import { Table } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { useAppContext } from '../context/AppContext';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { IncomingOrder, OutgoingOrder, OrderStatus } from '../types/inventory.types';
import { FinanceEntry } from '../types/finance.types';
import { useAuth } from '../context/AuthContext';

export const CollectionsPage: React.FC = () => {
  const { data, updateData, showToast } = useAppContext();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'outgoing' | 'incoming'>('outgoing');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IncomingOrder | OutgoingOrder | null>(null);
  const [amount, setAmount] = useState(0);

  const stats = {
    totalSales: data.outgoingOrders.reduce((s, o) => s + o.totalAmount, 0),
    totalCollected: data.outgoingOrders.reduce((s, o) => s + o.amountCollected, 0),
    pendingCollection: data.outgoingOrders.reduce((s, o) => s + o.amountRemaining, 0),
    totalPurchases: data.incomingOrders.reduce((s, o) => s + o.totalAmount, 0),
    totalPaid: data.incomingOrders.reduce((s, o) => s + o.amountPaid, 0),
    pendingPayment: data.incomingOrders.reduce((s, o) => s + o.amountDue, 0),
  };

  const currentStats = activeTab === 'outgoing' 
    ? [
        { title: 'إجمالي المبيعات', value: stats.totalSales, color: 'text-accent-primary', desc: 'إجمالي قيمة الفواتير الصادرة' },
        { title: 'المحصّل فعلياً', value: stats.totalCollected, color: 'text-accent-success', desc: 'إجمالي المبالغ المستلمة من العملاء' },
        { title: 'متبقي للتحصيل', value: stats.pendingCollection, color: 'text-accent-warning', desc: 'مبالغ آجلة لم يتم استلامها بعد' },
      ]
    : [
        { title: 'إجمالي المشتريات', value: stats.totalPurchases, color: 'text-accent-primary', desc: 'إجمالي قيمة فواتير الموردين' },
        { title: 'تم دفعه للموردين', value: stats.totalPaid, color: 'text-accent-success', desc: 'إجمالي المبالغ المسددة فعلياً' },
        { title: 'متبقي كديون', value: stats.pendingPayment, color: 'text-accent-danger', desc: 'مبالغ متبقية والتزامات مالية' },
      ];

  const handleOpenModal = (order: IncomingOrder | OutgoingOrder) => {
    setSelectedOrder(order);
    const remaining = 'amountRemaining' in order ? order.amountRemaining : order.amountDue;
    setAmount(remaining);
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    if (!selectedOrder) return;
    
    const isOutgoing = 'amountRemaining' in selectedOrder;
    const remaining = isOutgoing ? selectedOrder.amountRemaining : (selectedOrder as IncomingOrder).amountDue;

    if (amount <= 0 || amount > remaining) {
      showToast('المبلغ المدخل غير صحيح', 'error');
      return;
    }

    if (isOutgoing) {
      const updatedOrders = data.outgoingOrders.map(o => {
        if (o.id === selectedOrder.id) {
          const newCol = o.amountCollected + amount;
          const newRem = o.totalAmount - newCol;
          return {
            ...o,
            amountCollected: newCol,
            amountRemaining: newRem,
            status: newRem === 0 ? 'completed' : 'partial' as OrderStatus
          };
        }
        return o;
      });

      const entry: FinanceEntry = {
        id: `f${Date.now()}`,
        type: 'outgoing_collection',
        amount: amount,
        description: `تحصيل من عميل — ${selectedOrder.customerName} — أمر صادر #${selectedOrder.id}`,
        referenceId: selectedOrder.id,
        referenceType: 'outgoing',
        createdAt: new Date().toISOString(),
        createdBy: user?.id || '1',
      };

      updateData({ outgoingOrders: updatedOrders, financeEntries: [...data.financeEntries, entry] });
      showToast('تم تسجيل التحصيل وإضافة القيد المالي بنجاح', 'success');
    } else {
      const updatedOrders = data.incomingOrders.map(o => {
        if (o.id === selectedOrder.id) {
          const newPaid = o.amountPaid + amount;
          const newDue = o.totalAmount - newPaid;
          return {
            ...o,
            amountPaid: newPaid,
            amountDue: newDue,
            status: newDue === 0 ? 'completed' : 'partial' as OrderStatus
          };
        }
        return o;
      });

      const entry: FinanceEntry = {
        id: `f${Date.now()}`,
        type: 'incoming_payment',
        amount: -amount,
        description: `دفعة لمورد — ${(selectedOrder as IncomingOrder).supplierName} — أمر وارد #${selectedOrder.id}`,
        referenceId: selectedOrder.id,
        referenceType: 'incoming',
        createdAt: new Date().toISOString(),
        createdBy: user?.id || '1',
      };

      updateData({ incomingOrders: updatedOrders, financeEntries: [...data.financeEntries, entry] });
      showToast('تم تسجيل الدفعة وإضافة القيد المالي بنجاح', 'success');
    }

    setIsModalOpen(false);
  };

  const outgoingColumns = [
    { key: 'customerName', header: 'اسم العميل', sortable: true },
    { key: 'createdAt', header: 'تاريخ الأمر', render: (o: OutgoingOrder) => formatDate(o.createdAt) },
    { key: 'totalAmount', header: 'الإجمالي', render: (o: OutgoingOrder) => formatCurrency(o.totalAmount) },
    { key: 'amountCollected', header: 'المحصّل', render: (o: OutgoingOrder) => <span className="text-accent-success font-bold">{formatCurrency(o.amountCollected)}</span> },
    { key: 'amountRemaining', header: 'المتبقي', render: (o: OutgoingOrder) => <span className="text-accent-warning font-bold">{formatCurrency(o.amountRemaining)}</span> },
    { 
        key: 'status', 
        header: 'حالة الدفع',
        render: (o: OutgoingOrder) => {
          const labels: any = { pending: 'معلق', partial: 'جزئي', completed: 'مكتمل' };
          const colors: any = { pending: 'bg-accent-warning/10 text-accent-warning', partial: 'bg-accent-primary/10 text-accent-primary', completed: 'bg-accent-success/10 text-accent-success' };
          return <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${colors[o.status]}`}>{labels[o.status]}</span>;
        }
    },
    {
      key: 'action',
      header: 'إجراء',
      render: (o: OutgoingOrder) => (
        o.amountRemaining > 0 ? (
          <button 
            onClick={() => handleOpenModal(o)}
            className="text-[11px] font-bold text-accent-primary hover:underline font-Cairo"
          >
            تسجيل تحصيل
          </button>
        ) : <span className="text-[11px] text-text-muted opacity-50 italic">لا يوجد مستحقات</span>
      )
    }
  ];

  const incomingColumns = [
    { key: 'supplierName', header: 'اسم المورد', sortable: true },
    { key: 'createdAt', header: 'تاريخ الأمر', render: (o: IncomingOrder) => formatDate(o.createdAt) },
    { key: 'totalAmount', header: 'الإجمالي', render: (o: IncomingOrder) => formatCurrency(o.totalAmount) },
    { key: 'amountPaid', header: 'المدفوع', render: (o: IncomingOrder) => <span className="text-accent-success font-bold">{formatCurrency(o.amountPaid)}</span> },
    { key: 'amountDue', header: 'المتبقي', render: (o: IncomingOrder) => <span className="text-accent-danger font-bold">{formatCurrency(o.amountDue)}</span> },
    { 
        key: 'status', 
        header: 'حالة الدفع',
        render: (o: IncomingOrder) => {
          const labels: any = { pending: 'معلق', partial: 'جزئي', completed: 'مكتمل' };
          const colors: any = { pending: 'bg-accent-warning/10 text-accent-warning', partial: 'bg-accent-primary/10 text-accent-primary', completed: 'bg-accent-success/10 text-accent-success' };
          return <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${colors[o.status]}`}>{labels[o.status]}</span>;
        }
    },
    {
      key: 'action',
      header: 'إجراء',
      render: (o: IncomingOrder) => (
        o.amountDue > 0 ? (
          <button 
            onClick={() => handleOpenModal(o)}
            className="text-[11px] font-bold text-accent-primary hover:underline font-Cairo"
          >
            تسجيل دفعة
          </button>
        ) : <span className="text-[11px] text-text-muted opacity-50 italic">تم السداد</span>
      )
    }
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-4">
        {/* Tabs styled like Finance filters */}
        <div className="flex items-center gap-2">
            <button 
                onClick={() => setActiveTab('outgoing')}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all border font-Cairo ${activeTab === 'outgoing' ? 'bg-accent-primary text-white border-accent-primary shadow-lg shadow-accent-primary/20' : 'bg-white text-text-muted border-border-color hover:border-accent-primary/30'}`}
            >
                تحصيلات الصادر (العملاء)
            </button>
            <button 
                onClick={() => setActiveTab('incoming')}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all border font-Cairo ${activeTab === 'incoming' ? 'bg-accent-primary text-white border-accent-primary shadow-lg shadow-accent-primary/20' : 'bg-white text-text-muted border-border-color hover:border-accent-primary/30'}`}
            >
                مدفوعات الوارد (الموردين)
            </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentStats.map((stat, i) => (
                <div key={i} className="bg-white border border-border-color rounded-2xl p-5 card-enter flex flex-col justify-between group h-32">
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider font-Tajawal">{stat.title}</span>
                        <span className={`text-2xl font-black font-Cairo mt-1 ${stat.color}`}>{formatCurrency(stat.value)}</span>
                    </div>
                    <p className="text-[10px] text-text-muted opacity-80">{stat.desc}</p>
                </div>
            ))}
        </div>
      </div>

      <div className="card-enter">
          <Table<any> 
            columns={activeTab === 'outgoing' ? outgoingColumns : incomingColumns} 
            data={activeTab === 'outgoing' ? data.outgoingOrders : data.incomingOrders}
            emptyMessage={activeTab === 'outgoing' ? 'لا توجد مستحقات حالياً من العملاء' : 'لا توجد ديون لموردين حالياً'}
          />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={activeTab === 'outgoing' ? 'تسجيل تحصيل من عميل' : 'تسجيل دفع لمورد'}
        size="sm"
      >
        <div className="space-y-6">
          <div className="bg-bg-primary/50 p-5 rounded-2xl border border-border-color">
            <div className="flex flex-col gap-1">
                <span className="text-[11px] text-text-muted font-Tajawal">{activeTab === 'outgoing' ? 'اسم العميل' : 'اسم المورد'}</span>
                <span className="font-bold text-lg text-accent-primary font-Cairo">
                    {'customerName' in (selectedOrder || {}) ? (selectedOrder as OutgoingOrder).customerName : (selectedOrder as IncomingOrder)?.supplierName}
                </span>
            </div>
            <div className="mt-4 flex items-center justify-between">
                <span className="text-[11px] text-text-muted font-Tajawal">المبلغ المتبقي</span>
                <span className="font-black text-xl text-accent-danger font-Cairo tabular-nums">
                {formatCurrency(activeTab === 'outgoing' ? (selectedOrder as OutgoingOrder)?.amountRemaining || 0 : (selectedOrder as IncomingOrder)?.amountDue || 0)}
                </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold font-Cairo text-accent-primary mr-1">المبلغ المراد تسجيله</label>
            <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-white border border-border-color rounded-xl py-3 px-4 font-bold text-lg focus:ring-4 focus:ring-accent-primary/10 outline-none transition-all tabular-nums text-right"
                autoFocus
            />
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button 
                onClick={handleConfirm}
                className="w-full bg-accent-primary text-white font-Cairo font-bold py-3 rounded-xl hover:bg-accent-secondary transition-all shadow-lg shadow-accent-primary/20"
            >
                تأكيد وتسجيل العملية
            </button>
            <button 
                onClick={() => setIsModalOpen(false)}
                className="w-full text-text-muted font-Cairo font-bold py-2 hover:bg-bg-primary rounded-xl transition-all"
            >
                إلغاء
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

