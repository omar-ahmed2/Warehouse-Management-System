import React, { useState, useEffect } from 'react';
import { Table } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { IncomingForm } from '../components/incoming/IncomingForm';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { IncomingOrder, OrderStatus } from '../types/inventory.types';
import { FinanceEntry } from '../types/finance.types';
import { InvoicePrint } from '../components/ui/InvoicePrint';

export const IncomingPage: React.FC = () => {
  const { data, updateData, showToast } = useAppContext();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IncomingOrder | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [printOrder, setPrintOrder] = useState<IncomingOrder | null>(null);

  useEffect(() => {
    if (printOrder) {
      setTimeout(() => {
        window.print();
        setPrintOrder(null);
      }, 100);
    }
  }, [printOrder]);

  const canManage = user?.role === 'manager' || user?.role === 'supervisor';

  const stats = {
    total: data.incomingOrders.reduce((s, o) => s + o.totalAmount, 0),
    paid: data.incomingOrders.reduce((s, o) => s + o.amountPaid, 0),
    due: data.incomingOrders.reduce((s, o) => s + o.amountDue, 0),
  };

  const columns = [
    { key: 'id', header: '#' },
    { key: 'supplierName', header: 'المورد', sortable: true },
    { 
      key: 'createdAt', 
      header: 'التاريخ', 
      sortable: true,
      render: (o: IncomingOrder) => formatDate(o.createdAt)
    },
    { 
      key: 'totalAmount', 
      header: 'الإجمالي', 
      render: (o: IncomingOrder) => formatCurrency(o.totalAmount)
    },
    { 
      key: 'amountPaid', 
      header: 'المدفوع', 
      render: (o: IncomingOrder) => <span className="text-accent-success font-bold">{formatCurrency(o.amountPaid)}</span>
    },
    { 
      key: 'amountDue', 
      header: 'المتبقي', 
      render: (o: IncomingOrder) => <span className="text-accent-danger font-bold">{formatCurrency(o.amountDue)}</span>
    },
    { 
      key: 'status', 
      header: 'الحالة',
      render: (o: IncomingOrder) => {
        const labels: any = { pending: 'معلق', partial: 'جزئي', completed: 'مكتمل' };
        const colors: any = { pending: 'warning', partial: 'primary', completed: 'success' };
        return <Badge color={colors[o.status]} withDot>{labels[o.status]}</Badge>;
      }
    },
    {
      key: 'actions',
      header: 'إجراءات',
      render: (o: IncomingOrder) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); setPrintOrder(o); }}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-all"
            title="طباعة الفاتورة"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          </button>
          {canManage && o.amountDue > 0 && (
            <button 
              onClick={(e) => { e.stopPropagation(); setSelectedOrder(o); setPaymentAmount(o.amountDue); setIsPaymentModalOpen(true); }}
              className="p-1 px-2 rounded-lg text-accent-primary bg-accent-primary/10 hover:bg-accent-primary/20 transition-all text-xs font-bold"
            >
              تسجيل دفعة
            </button>
          )}
          {canManage && (
            <button 
              onClick={(e) => { e.stopPropagation(); handleDelete(o.id); }}
              className="p-1.5 rounded-lg text-accent-danger hover:bg-accent-danger/10 transition-all"
              title="حذف"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          )}
        </div>
      )
    }
  ];

  const handleIncomingSubmit = (formData: any) => {
    const orderId = `IN-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalAmount = formData.items.reduce((s: number, i: any) => s + (i.qty * i.unitPrice), 0);
    const amountDue = totalAmount - formData.advancePayment;
    const status: OrderStatus = formData.advancePayment === 0 ? 'pending' : (amountDue === 0 ? 'completed' : 'partial');

    let finalSupplierId = formData.supplierId;
    let newSuppliers = [...data.suppliers];

    // If new supplier, create one (no need to track totals — computed from orders)
    if (!formData.supplierId || formData.supplierId === 'new') {
      finalSupplierId = `SUP-${Date.now()}`;
      newSuppliers.push({
        id: finalSupplierId,
        name: formData.supplierName,
        phone: 'غير مسجل',
        address: 'غير مسجل',
        totalSourcing: 0,
        totalPaid: 0,
        totalDebt: 0,
        createdAt: new Date().toISOString()
      });
    }
    // ✅ لا يوجد تحديث يدوي للمورد — الأرقام بتتحسب من الأوامر مباشرة


    const newOrder: IncomingOrder = {
      id: orderId,
      supplierId: finalSupplierId,
      supplierName: formData.supplierName,
      items: formData.items,
      totalAmount,
      amountPaid: formData.advancePayment,
      amountDue,
      status,
      notes: formData.notes,
      createdAt: new Date().toISOString(),
      createdBy: user?.id || '1',
    };

    // Update Inventory
    const newInventory = [...data.inventory];
    formData.items.forEach((item: any) => {
      const existing = newInventory.find(i => i.productId === item.productId);
      if (existing) {
        existing.currentQty += item.qty;
        existing.lastUpdated = new Date().toISOString();
      }
    });

    // Financial Entry
    const newEntries: FinanceEntry[] = [...data.financeEntries];
    if (formData.advancePayment > 0) {
      newEntries.push({
        id: `f${Date.now()}`,
        type: 'incoming_payment',
        amount: -formData.advancePayment,
        description: `دفعة لمورد — ${formData.supplierName} — أمر وارد #${orderId}`,
        referenceId: orderId,
        referenceType: 'incoming',
        createdAt: new Date().toISOString(),
        createdBy: user?.id || '1',
      });
    }

    updateData({
      incomingOrders: [...data.incomingOrders, newOrder],
      suppliers: newSuppliers,
      inventory: newInventory,
      financeEntries: newEntries
    });

    showToast('تم تسجيل أمر الوارد وتحديث المخزن', 'success');
    setIsModalOpen(false);
  };

  const handlePaymentSubmit = () => {
    if (!selectedOrder) return;
    if (paymentAmount <= 0 || paymentAmount > selectedOrder.amountDue) {
      showToast('مبلغ الدفعة غير صالح', 'error');
      return;
    }

    const updatedOrders = data.incomingOrders.map(o => {
      if (o.id === selectedOrder.id) {
        const newPaid = o.amountPaid + paymentAmount;
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

    const newFinanceEntry: FinanceEntry = {
      id: `f${Date.now()}`,
      type: 'incoming_payment',
      amount: -paymentAmount,
      description: `دفعة لمورد — ${selectedOrder.supplierName} — أمر وارد #${selectedOrder.id}`,
      referenceId: selectedOrder.id,
      referenceType: 'incoming',
      createdAt: new Date().toISOString(),
      createdBy: user?.id || '1',
    };

    updateData({
      incomingOrders: updatedOrders,
      // ✅ لا يوجد تحديث يدوي لبيانات المورد — الأرقام بتتحسب تلقائياً من الأوامر
      financeEntries: [...data.financeEntries, newFinanceEntry]
    });

    showToast('تم تسجيل الدفعة وإضافة القيد المالي ✓', 'success');
    setIsPaymentModalOpen(false);
    setSelectedOrder(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد؟ حذف أمر الوارد لن يعيد الكميات للمخزن تلقائياً.')) {
      const filtered = data.incomingOrders.filter(o => o.id !== id);
      updateData({ incomingOrders: filtered });
      showToast('تم حذف أمر الوارد', 'warning');
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <p className="text-text-secondary font-Tajawal">تسجيل وإدارة أوامر استلام البضاعة من الموردين مع متابعة المدفوعات</p>
          {canManage && (
            <Button onClick={() => setIsModalOpen(true)}>تسجيل وارد جديد</Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-bg-card p-4 rounded-xl border border-border-color flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary">إجمالي المشتريات</span>
            <span className="text-lg font-black text-accent-primary">{formatCurrency(stats.total)}</span>
          </div>
          <div className="bg-bg-card p-4 rounded-xl border border-border-color flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary">إجمالي المدفوع</span>
            <span className="text-lg font-black text-accent-success">{formatCurrency(stats.paid)}</span>
          </div>
          <div className="bg-bg-card p-4 rounded-xl border border-border-color flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary">المتبقي للموردين</span>
            <span className="text-lg font-black text-accent-danger">{formatCurrency(stats.due)}</span>
          </div>
        </div>

        <Table 
          columns={columns} 
          data={data.incomingOrders} 
          searchKey="supplierName"
          emptyMessage="لا توجد أوامر توريد مسجلة"
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="تسجيل أمر توريد جديد" size="xl">
        <IncomingForm onSubmit={handleIncomingSubmit} onCancel={() => setIsModalOpen(false)} />
      </Modal>

      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="تسجيل دفعة لمورد" size="sm">
        <div className="space-y-6">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 italic">
            <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold text-slate-400 font-Tajawal">المورد</span>
                <span className="font-bold text-slate-800 font-Cairo">{selectedOrder?.supplierName}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 font-Tajawal">المبلغ المتبقي</span>
                <span className="font-extrabold text-accent-danger font-Cairo tabular-nums">{formatCurrency(selectedOrder?.amountDue || 0)}</span>
            </div>
          </div>
          
          <Input 
            label="مبلغ الدفعة المراد سدادها" 
            type="number" 
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(Number(e.target.value))}
            max={selectedOrder?.amountDue}
            placeholder="0.00"
          />

          <div className="flex flex-col gap-2 pt-2">
            <button 
                onClick={handlePaymentSubmit}
                className="w-full bg-accent-primary text-white font-Cairo font-black py-3.5 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-accent-primary/20 flex items-center justify-center gap-2"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>تأكيد تسجيل الدفع</span>
            </button>
            <button 
                onClick={() => setIsPaymentModalOpen(false)}
                className="w-full text-slate-400 font-Cairo font-bold py-2 hover:bg-slate-50 rounded-xl transition-all"
            >
                إلغاء
            </button>
          </div>
        </div>
      </Modal>

      {printOrder && <InvoicePrint order={printOrder} type="incoming" />}
    </>
  );
};
