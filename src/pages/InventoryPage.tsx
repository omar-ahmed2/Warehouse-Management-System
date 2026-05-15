import React from 'react';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { useAppContext } from '../context/AppContext';
import { formatCurrency } from '../utils/formatCurrency';
import { InventoryItem } from '../types/inventory.types';

export const InventoryPage: React.FC = () => {
  const { data } = useAppContext();

  const lowStockCount = data.inventory.filter(item => {
    const product = data.products.find(p => p.id === item.productId);
    return product && item.currentQty <= product.minStock;
  }).length;

  const columns = [
    { 
      key: 'productName', 
      header: 'المنتج', 
      render: (item: InventoryItem) => {
        const product = data.products.find(p => p.id === item.productId);
        return (
          <div className="flex flex-col">
            <span className="font-bold text-text-primary">{product?.name || 'منتج غير معروف'}</span>
            <span className="text-[10px] text-text-muted">{product?.category}</span>
          </div>
        );
      }
    },
    { 
      key: 'productCode', 
      header: 'الكود', 
      render: (item: InventoryItem) => data.products.find(p => p.id === item.productId)?.code
    },
    { 
      key: 'unit', 
      header: 'الوحدة',
      render: (item: InventoryItem) => data.products.find(p => p.id === item.productId)?.unit
    },
    { 
      key: 'currentQty', 
      header: 'الكمية الحالية',
      sortable: true,
      render: (item: InventoryItem) => (
        <span className="font-black text-lg">{item.currentQty.toLocaleString('ar-EG')}</span>
      )
    },
    { 
      key: 'minStock', 
      header: 'الحد الأدنى',
      render: (item: InventoryItem) => data.products.find(p => p.id === item.productId)?.minStock.toLocaleString('ar-EG')
    },
    { 
      key: 'totalValue', 
      header: 'القيمة الإجمالية',
      render: (item: InventoryItem) => {
        const product = data.products.find(p => p.id === item.productId);
        return formatCurrency(item.currentQty * (product?.buyPrice || 0));
      }
    },
    { 
      key: 'status', 
      header: 'الحالة',
      render: (item: InventoryItem) => {
        const product = data.products.find(p => p.id === item.productId);
        if (!product) return null;
        
        if (item.currentQty === 0) return <Badge color="danger" withDot>نافد</Badge>;
        if (item.currentQty <= product.minStock) return <Badge color="danger" withDot className="status-low">حرج</Badge>;
        if (item.currentQty <= product.minStock * 1.5) return <Badge color="warning" withDot>منخفض</Badge>;
        return <Badge color="success" withDot>وفير</Badge>;
      }
    }
  ];

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <p className="text-text-secondary font-Tajawal">متابعة مستويات المخزون الحالية لكل منتج مع تنبيهات النقص</p>
        </div>

        {lowStockCount > 0 && (
          <div className="bg-accent-warning/20 border border-accent-warning/30 rounded-xl p-4 flex items-center gap-4 animate-pulse">
            <div className="p-2 bg-accent-warning/20 rounded-lg text-accent-warning">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <div>
              <h4 className="font-bold text-accent-warning font-Cairo">تنبيه نقص المخزون</h4>
              <p className="text-sm text-accent-warning/80">يوجد {lowStockCount.toLocaleString('ar-EG')} منتجات تحت الحد الأدنى المسموح به. يرجى مراجعة الطلبيات.</p>
            </div>
          </div>
        )}

        <Table<any> 
          columns={columns} 
          data={data.inventory.map(i => ({ ...i, id: i.productId }))} 
          emptyMessage="المخزن فارغ حالياً"
        />
      </div>
    </>
  );
};
