import React, { useState, useEffect } from 'react';
import { Table } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { OutgoingForm } from '../components/outgoing/OutgoingForm';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { OutgoingOrder, OrderStatus } from '../types/inventory.types';
import { FinanceEntry } from '../types/finance.types';
import { InvoicePrint } from '../components/ui/InvoicePrint';

export const OutgoingPage: React.FC = () => {
  const { data, updateData, showToast } = useAppContext();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OutgoingOrder | null>(null);
  const [collectAmount, setCollectAmount] = useState(0);
  const [printOrder, setPrintOrder] = useState<OutgoingOrder | null>(null);

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
    total: data.outgoingOrders.reduce((s, o) => s + o.totalAmount, 0),
    collected: data.outgoingOrders.reduce((s, o) => s + o.amountCollected, 0),
    remaining: data.outgoingOrders.reduce((s, o) => s + o.amountRemaining, 0),
  };

  const columns = [
    { key: 'id', header: '#' },
    { key: 'customerName', header: 'العميل', sortable: true },
    { 
      key: 'createdAt', 
      header: 'التاريخ', 
      sortable: true,
      render: (o: OutgoingOrder) => formatDate(o.createdAt)
    },
    { 
      key: 'totalAmount', 
      header: 'الإجمالي', 
      render: (o: OutgoingOrder) => formatCurrency(o.totalAmount)
    },
    { 
      key: 'amountCollected', 
      header: 'المحصّل', 
      render: (o: OutgoingOrder) => <span className="text-accent-success font-bold">{formatCurrency(o.amountCollected)}</span>
    },
    { 
      key: 'amountRemaining', 
      header: 'المتبقي', 
      render: (o: OutgoingOrder) => <span className="text-accent-warning font-bold">{formatCurrency(o.amountRemaining)}</span>
    },
    { 
      key: 'status', 
      header: 'الحالة',
      render: (o: OutgoingOrder) => {
        const labels: any = { pending: 'معلق', partial: 'جزئي', completed: 'مكتمل' };
        const colors: any = { pending: 'warning', partial: 'primary', completed: 'success' };
        return <Badge color={colors[o.status]} withDot>{labels[o.status]}</Badge>;
      }
    },
    {
      key: 'actions',
      header: 'إجراءات',
      render: (o: OutgoingOrder) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); setPrintOrder(o); }}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-all"
            title="طباعة الفاتورة"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          </button>
          {canManage && o.amountRemaining > 0 && (
            <button 
              onClick={(e) => { e.stopPropagation(); setSelectedOrder(o); setCollectAmount(o.amountRemaining); setIsCollectionModalOpen(true); }}
              className="p-1 px-2 rounded-lg text-accent-teal bg-accent-teal/10 hover:bg-accent-teal/20 transition-all text-xs font-bold"
            >
              تسجيل تحصيل
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

  const handleOutgoingSubmit = (formData: any) => {
    const orderId = `OUT-${Math.floor(1000 + Math.random() * 9000)}`;
    
    let totalProfit = 0;
    const itemsWithProfit = formData.items.map((item: any) => {
      const product = data.products.find(p => p.id === item.productId);
      const buyPrice = product?.buyPrice || 0;
      const profitPerUnit = item.unitPrice - buyPrice;
      const itemTotalProfit = profitPerUnit * item.qty;
      totalProfit += itemTotalProfit;
      
      return {
        ...item,
        productName: product?.name || 'منتج غير معروف',
        profit: itemTotalProfit
      };
    });

    const totalAmount = itemsWithProfit.reduce((s: number, i: any) => s + (i.qty * i.unitPrice), 0);
    const amountRemaining = totalAmount - formData.advanceCollection;
    const status: OrderStatus = formData.advanceCollection === 0 ? 'pending' : (amountRemaining === 0 ? 'completed' : 'partial');

    let finalCustomerId = formData.customerId;
    let newCustomers = [...data.customers];

    // If new customer, create one (no need to track totals — computed from orders)
    if (!formData.customerId || formData.customerId === 'new') {
      finalCustomerId = `CUS-${Date.now()}`;
      newCustomers.push({
        id: finalCustomerId,
        name: formData.customerName,
        phone: 'غير مسجل',
        address: 'غير مسجل',
        totalPurchases: 0,
        totalPaid: 0,
        totalDebt: 0,
        createdAt: new Date().toISOString()
      });
    }
    // ✅ لا يوجد تحديث يدوي للعميل — الأرقام بتتحسب من الأوامر مباشرة

    const newOrder: OutgoingOrder = {
      id: orderId,
      customerId: finalCustomerId,
      customerName: formData.customerName,
      items: itemsWithProfit,
      totalAmount,
      totalProfit,
      amountCollected: formData.advanceCollection,
      amountRemaining,
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
        existing.currentQty -= item.qty;
        existing.lastUpdated = new Date().toISOString();
      }
    });

    // Financial Entry
    const newEntries: FinanceEntry[] = [...data.financeEntries];
    if (formData.advanceCollection > 0) {
      newEntries.push({
        id: `f${Date.now()}`,
        type: 'outgoing_collection',
        amount: formData.advanceCollection,
        description: `تحصيل من عميل — ${formData.customerName} — أمر صادر #${orderId}`,
        referenceId: orderId,
        referenceType: 'outgoing',
        createdAt: new Date().toISOString(),
        createdBy: user?.id || '1',
      });
    }

    updateData({
      outgoingOrders: [...data.outgoingOrders, newOrder],
      customers: newCustomers,
      inventory: newInventory,
      financeEntries: newEntries
    });

    showToast('تم تسجيل أمر الصادر وتحديث المخزن', 'success');
    setIsModalOpen(false);
  };

  const handleCollectionSubmit = () => {
    if (!selectedOrder) return;
    if (collectAmount <= 0 || collectAmount > selectedOrder.amountRemaining) {
      showToast('مبلغ التحصيل غير صالح', 'error');
      return;
    }

    const updatedOrders = data.outgoingOrders.map(o => {
      if (o.id === selectedOrder.id) {
        const newCollected = o.amountCollected + collectAmount;
        const newRemaining = o.totalAmount - newCollected;
        return {
          ...o,
          amountCollected: newCollected,
          amountRemaining: newRemaining,
          status: newRemaining === 0 ? 'completed' : 'partial' as OrderStatus
        };
      }
      return o;
    });

    const newFinanceEntry: FinanceEntry = {
      id: `f${Date.now()}`,
      type: 'outgoing_collection',
      amount: collectAmount,
      description: `تحصيل من عميل — ${selectedOrder.customerName} — أمر صادر #${selectedOrder.id}`,
      referenceId: selectedOrder.id,
      referenceType: 'outgoing',
      createdAt: new Date().toISOString(),
      createdBy: user?.id || '1',
    };

    updateData({
      outgoingOrders: updatedOrders,
      // ✅ لا يوجد تحديث يدوي لبيانات العميل — الأرقام بتتحسب تلقائياً من الأوامر
      financeEntries: [...data.financeEntries, newFinanceEntry]
    });

    showToast('تم تسجيل التحصيل وإضافة القيد المالي ✓', 'success');
    setIsCollectionModalOpen(false);
    setSelectedOrder(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد؟')) {
      const filtered = data.outgoingOrders.filter(o => o.id !== id);
      updateData({ outgoingOrders: filtered });
      showToast('تم حذف أمر الصادر', 'warning');
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <p className="text-text-secondary font-Tajawal">تسجيل وإدارة أوامر بيع وتسليم البضاعة للعملاء مع متابعة التحصيلات</p>
          {canManage && (
            <Button onClick={() => setIsModalOpen(true)}>تسجيل صادر جديد</Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-bg-card p-4 rounded-xl border border-border-color flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary">إجمالي المبيعات</span>
            <span className="text-lg font-black text-accent-primary">{formatCurrency(stats.total)}</span>
          </div>
          <div className="bg-bg-card p-4 rounded-xl border border-border-color flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary">إجمالي التحصيل</span>
            <span className="text-lg font-black text-accent-success">{formatCurrency(stats.collected)}</span>
          </div>
          <div className="bg-bg-card p-4 rounded-xl border border-border-color flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary">متبقي عند العملاء</span>
            <span className="text-lg font-black text-accent-warning">{formatCurrency(stats.remaining)}</span>
          </div>
        </div>

        <Table 
          columns={columns} 
          data={data.outgoingOrders} 
          searchKey="customerName"
          emptyMessage="لا توجد أوامر بيع مسجلة"
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="تسجيل أمر بيع جديد" size="xl">
        <OutgoingForm onSubmit={handleOutgoingSubmit} onCancel={() => setIsModalOpen(false)} />
      </Modal>

      <Modal isOpen={isCollectionModalOpen} onClose={() => setIsCollectionModalOpen(false)} title="تسجيل تحصيل من عميل" size="sm">
        <div className="space-y-6">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold text-slate-400 font-Tajawal">العميل</span>
                <span className="font-bold text-slate-800 font-Cairo">{selectedOrder?.customerName}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 font-Tajawal">المبلغ المتبقي</span>
                <span className="font-extrabold text-accent-warning font-Cairo tabular-nums">{formatCurrency(selectedOrder?.amountRemaining || 0)}</span>
            </div>
          </div>

          <Input 
            label="المبلغ المراد تحصيله الآن" 
            type="number" 
            value={collectAmount}
            onChange={(e) => setCollectAmount(Number(e.target.value))}
            max={selectedOrder?.amountRemaining}
            placeholder="0.00"
          />

          <div className="flex flex-col gap-2 pt-2">
            <button 
                onClick={handleCollectionSubmit}
                className="w-full bg-accent-teal text-white font-Cairo font-black py-3.5 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-accent-teal/20 flex items-center justify-center gap-2"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>تأكيد عملية التحصيل</span>
            </button>
            <button 
                onClick={() => setIsCollectionModalOpen(false)}
                className="w-full text-slate-400 font-Cairo font-bold py-2 hover:bg-slate-50 rounded-xl transition-all"
            >
                إلغاء
            </button>
          </div>
        </div>
      </Modal>

      {printOrder && <InvoicePrint order={printOrder} type="outgoing" />}
    </>
  );
};
