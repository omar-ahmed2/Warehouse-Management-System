import React, { useState } from 'react';
import { Table } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ProductForm } from '../components/products/ProductForm';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import { Product } from '../types/product.types';
import { Badge } from '../components/ui/Badge';

export const ProductsPage: React.FC = () => {
  const { data, updateData, showToast } = useAppContext();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  const canManage = user?.role === 'manager' || user?.role === 'supervisor';

  const getStatus = (current: number, min: number) => {
    if (current === 0) return { label: 'نفد', color: 'bg-accent-danger/10 text-accent-danger', dot: 'bg-accent-danger' };
    if (current <= min) return { label: 'منخفض', color: 'bg-accent-warning/10 text-accent-warning', dot: 'bg-accent-warning' };
    return { label: 'وفير', color: 'bg-accent-success/10 text-accent-success', dot: 'bg-accent-success' };
  };

  const columns = [
    { 
      key: 'index', 
      header: '#', 
      render: (_: Product, index: number) => <span className="opacity-40">{index + 1}</span> 
    },
    { key: 'code', header: 'الكود', sortable: true },
    { key: 'name', header: 'اسم المنتج', sortable: true },
    { key: 'category', header: 'الفئة', sortable: true },
    { key: 'unit', header: 'الوحدة' },
    {
      key: 'currentStock',
      header: 'المخزون',
      render: (p: Product) => {
        const item = data.inventory.find(i => i.productId === p.id);
        const qty = item?.currentQty || 0;
        return <span className={qty <= p.minStock ? 'text-accent-danger' : ''}>{qty.toLocaleString('ar-EG')}</span>;
      }
    },
    { key: 'minStock', header: 'الحد الأدنى' },
    {
      key: 'status',
      header: 'الحالة',
      render: (p: Product) => {
        const item = data.inventory.find(i => i.productId === p.id);
        const status = getStatus(item?.currentQty || 0, p.minStock);
        return (
          <div className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-2 w-fit ${status.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
            {status.label}
          </div>
        );
      }
    },
    {
      key: 'actions',
      header: 'إجراءات',
      render: (p: Product) => (
        <div className="flex items-center gap-2 justify-end">
          {canManage && (
            <button 
              onClick={(e) => { e.stopPropagation(); handleEdit(p); }}
              className="p-2 rounded-xl text-text-muted hover:bg-bg-primary hover:text-accent-secondary transition-all"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4L18.5 2.5z"></path></svg>
            </button>
          )}
          {canManage && (
            <button 
              onClick={(e) => { e.stopPropagation(); confirmDelete(p.id); }}
              className="p-2 rounded-xl text-text-muted hover:bg-red-50 hover:text-accent-danger transition-all"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          )}
        </div>
      )
    }
  ];

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (!deletingId) return;
    
    // 1. Identify orders containing this product
    const incomingToDelete = data.incomingOrders.filter(o => o.items.some(item => item.productId === deletingId));
    const outgoingToDelete = data.outgoingOrders.filter(o => o.items.some(item => item.productId === deletingId));
    
    const incomingOrderIds = incomingToDelete.map(o => o.id);
    const outgoingOrderIds = outgoingToDelete.map(o => o.id);
    const allOrderIdsToDelete = [...incomingOrderIds, ...outgoingOrderIds];

    // 2. Filter out products and inventory
    const newProducts = data.products.filter(p => p.id !== deletingId);
    const newInventory = data.inventory.filter(i => i.productId !== deletingId);
    
    // 3. Filter out orders
    const newIncoming = data.incomingOrders.filter(o => !incomingOrderIds.includes(o.id));
    const newOutgoing = data.outgoingOrders.filter(o => !outgoingOrderIds.includes(o.id));

    // 4. Filter out finance entries associated with these orders
    const newFinance = data.financeEntries.filter(e => !e.referenceId || !allOrderIdsToDelete.includes(e.referenceId));

    updateData({ 
      products: newProducts, 
      inventory: newInventory,
      incomingOrders: newIncoming,
      outgoingOrders: newOutgoing,
      financeEntries: newFinance
    });

    setIsDeleteModalOpen(false);
    setDeletingId(null);
    showToast('تم حذف المنتج وكل التعاملات المرتبطة به بنجاح', 'success');
  };

  const handleFormSubmit = (formData: Omit<Product, 'id' | 'createdAt'> & { initialQty?: number }) => {
    if (editingProduct) {
      const { initialQty, ...productData } = formData;
      const newProducts = data.products.map(p => 
        p.id === editingProduct.id ? { ...p, ...productData } : p
      );
      updateData({ products: newProducts });
      showToast('تم تحديث بيانات المنتج', 'success');
    } else {
      const { initialQty, ...productData } = formData;
      const newId = `p${Date.now()}`;
      const newProduct: Product = {
        ...productData,
        id: newId,
        createdAt: new Date().toISOString(),
      };
      const newInventoryItem = {
        productId: newId,
        currentQty: initialQty || 0,
        lastUpdated: new Date().toISOString(),
        minQty: formData.minStock
      };
      updateData({ 
        products: [...data.products, newProduct],
        inventory: [...data.inventory, newInventoryItem]
      });
      showToast('تم إضافة المنتج الجديد بنجاح', 'success');
    }
    setIsModalOpen(false);
    setEditingProduct(undefined);
  };

  const filteredProducts = data.products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-10">
      {/* Top Actions Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <input 
                    type="text" 
                    placeholder="بحث سريع (كود، اسم...)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-border-color rounded-xl py-2 px-4 pr-10 text-sm font-Tajawal focus:ring-2 focus:ring-accent-primary/10 outline-none transition-all"
                />
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <select className="bg-white border border-border-color rounded-xl py-2 px-4 text-sm font-Tajawal outline-none cursor-pointer">
                <option value="">كل الفئات</option>
                {Array.from(new Set(data.products.map(p => p.category))).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="bg-white border border-border-color rounded-xl py-2 px-4 text-sm font-Tajawal outline-none cursor-pointer">
                <option value="">كل الحالات</option>
                <option value="good">وفير</option>
                <option value="low">منخفض</option>
                <option value="out">نفد</option>
            </select>
        </div>

        {canManage && (
            <button 
                onClick={() => { setEditingProduct(undefined); setIsModalOpen(true); }}
                className="w-full md:w-auto bg-accent-primary text-white font-Cairo font-bold py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-accent-secondary transition-colors shadow-lg shadow-accent-primary/20"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                <span>إضافة منتج جديد</span>
            </button>
        )}
      </div>

      <Table 
        columns={columns} 
        data={filteredProducts} 
        emptyMessage="لا توجد منتجات مسجلة حالياً"
      />

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="تأكيد الحذف النهائي"
        size="sm"
      >
        <div className="space-y-6 text-center">
          <div className="w-16 h-16 bg-red-100 text-accent-danger rounded-full flex items-center justify-center mx-auto">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-black font-Cairo text-accent-primary">هل أنت متأكد من الحذف؟</h3>
            <p className="text-sm text-text-muted font-Tajawal leading-relaxed">
              هذا الإجراء سيقوم بحذف المنتج نهائياً من النظام، بالإضافة إلى <span className="text-accent-danger font-bold">جميع الفواتير والتحركات المالية والمخزنية</span> المرتبطة به.
              <br />
              <span className="font-bold">هذا الإجراء لا يمكن التراجع عنه.</span>
            </p>
          </div>

          <div className="flex flex-col gap-3">
             <button 
                onClick={handleDelete}
                className="w-full bg-accent-danger text-white font-Cairo font-bold py-3 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-accent-danger/20"
             >
                نعم، احذف المنتج وكل تعاملاته
             </button>
             <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="w-full text-text-muted font-Cairo font-bold py-2 hover:bg-bg-primary rounded-xl transition-all"
             >
                إلغاء العملية
             </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'}
        size="lg"
      >
        <ProductForm 
          initialData={editingProduct} 
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};
