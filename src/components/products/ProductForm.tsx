import React, { useState, useMemo } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Product } from '../../types/product.types';
import { useAppContext } from '../../context/AppContext';

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: Omit<Product, 'id' | 'createdAt'> & { initialQty?: number }) => void;
  onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { data, showToast } = useAppContext();
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [tempCategories, setTempCategories] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    code: initialData?.code || `PRD-${Math.floor(1000 + Math.random() * 9000)}`,
    category: initialData?.category || '',
    unit: initialData?.unit || 'قطعة',
    buyPrice: initialData?.buyPrice || 0,
    sellPrice: initialData?.sellPrice || 0,
    minStock: initialData?.minStock || 5,
    initialQty: 0,
  });

  // Get unique categories from existing products + any newly added ones
  const dynamicCategories = useMemo(() => {
    const fromProducts = data.products.map(p => p.category);
    const all = Array.from(new Set([...fromProducts, ...tempCategories]))
      .filter(Boolean)
      .map(c => ({ value: c, label: c }));
    
    return all;
  }, [data.products, tempCategories]);

  const units = [
    { value: 'قطعة', label: 'قطعة' },
    { value: 'كيلو', label: 'كيلو' },
    { value: 'متر', label: 'متر' },
    { value: 'علبة', label: 'علبة' },
    { value: 'كرتونة', label: 'كرتونة' },
    { value: 'لتر', label: 'لتر' },
    { value: 'طقم', label: 'طقم' },
    { value: 'دسته', label: 'دسته' },
  ];

  const handleAddNewCategory = () => {
    const trimmed = newCategoryName.trim();
    if (trimmed) {
      setTempCategories(prev => [...new Set([...prev, trimmed])]);
      setFormData(prev => ({ ...prev, category: trimmed }));
      setShowNewCategory(false);
      setNewCategoryName('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddNewCategory();
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.buyPrice <= 0 || formData.sellPrice <= 0) {
      showToast('الأسعار يجب أن تكون أكبر من صفر', 'error');
      return;
    }
    if (formData.minStock < 0) {
      showToast('حد التنبيه لا يمكن أن يكون سالباً', 'error');
      return;
    }
    if (!initialData && formData.initialQty < 0) {
      showToast('الكمية الابتدائية لا يمكن أن تكون سالبة', 'error');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
      <div className="bg-slate-50 p-4 md:p-6 rounded-[32px] border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        <div className="md:col-span-2 pb-2 border-b border-slate-200">
            <h4 className="text-xs md:text-sm font-black font-Cairo text-accent-primary">المعلومات الأساسية</h4>
        </div>
        <div className="md:col-span-2">
            <Input 
              label="اسم المنتج" 
              required 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="أدخل اسم المنتج بالكامل"
            />
        </div>
        <Input 
          label="كود المنتج (Barcode)" 
          required 
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          placeholder="PRD-XXXX"
        />
        
        <div className="flex flex-col gap-1.5 relative">
            <div className="flex items-end gap-2">
                <div className="flex-1">
                    {!showNewCategory ? (
                        <Select 
                            label="التصنيفات" 
                            options={dynamicCategories}
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        />
                    ) : (
                        <div className="space-y-1.5">
                            <label className="text-xs font-black font-Cairo text-slate-600 block mr-1">إضافة تصنيف جديد</label>
                            <div className="flex gap-2">
                                <input 
                                    autoFocus
                                    className="flex-1 bg-white border border-border-color rounded-xl px-4 py-2 text-sm font-Tajawal focus:ring-2 focus:ring-accent-primary/10 outline-none transition-all"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="اسم التصنيف الجديد"
                                />
                                <button 
                                    type="button"
                                    onClick={handleAddNewCategory}
                                    className="bg-accent-primary text-white p-2 rounded-xl hover:bg-accent-secondary"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                {!showNewCategory && (
                    <button 
                        type="button"
                        onClick={() => setShowNewCategory(true)}
                        className="mb-0.5 p-2.5 bg-white border border-slate-200 rounded-xl text-accent-primary hover:bg-slate-50 transition-colors shadow-sm"
                        title="إضافة تصنيف جديد"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                )}
                {showNewCategory && (
                    <button 
                        type="button"
                        onClick={() => setShowNewCategory(false)}
                        className="mb-0.5 p-2.5 text-slate-400 hover:text-red-500 transition-colors"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                )}
            </div>
        </div>

        <Select 
          label="وحدة القياس" 
          options={units}
          value={formData.unit}
          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
        />
      </div>

      <div className="bg-white p-4 md:p-6 rounded-[32px] border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 shadow-sm">
        <div className="md:col-span-2 pb-2 border-b border-slate-100 font-black font-Cairo text-slate-800 text-xs md:text-sm">
            التسعير والمخزون
        </div>
        <Input 
          label="سعر الشراء" 
          type="number" 
          required 
          min="0.01"
          step="0.01"
          value={formData.buyPrice}
          onChange={(e) => setFormData({ ...formData, buyPrice: Number(e.target.value) })}
          placeholder="0.00"
        />
        <Input 
          label="سعر البيع" 
          type="number" 
          required 
          min="0.01"
          step="0.01"
          value={formData.sellPrice}
          onChange={(e) => setFormData({ ...formData, sellPrice: Number(e.target.value) })}
          placeholder="0.00"
        />
        <Input 
          label="حد التنبيه" 
          type="number" 
          min="0"
          value={formData.minStock}
          onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
          placeholder="5"
        />
        {!initialData && (
          <Input 
            label="الكمية المتوفرة حالياً" 
            type="number" 
            required
            min="0"
            value={formData.initialQty}
            onChange={(e) => setFormData({ ...formData, initialQty: Number(e.target.value) })}
            placeholder="0"
          />
        )}
         <div className={`flex items-center justify-center bg-blue-50/50 rounded-2xl p-3 border border-blue-100 ${initialData ? 'md:col-start-2' : 'md:col-span-2'}`}>
            <div className="text-center">
                <p className="text-[9px] font-bold text-blue-400 uppercase font-Tajawal">الربح المتوقع للواحد</p>
                <p className="text-lg font-black text-accent-primary tabular-nums">{(formData.sellPrice - formData.buyPrice).toLocaleString('ar-EG')} ج.م</p>
            </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-2 pt-2">
        <button 
          type="submit"
          className="flex-1 bg-accent-primary text-white font-Cairo font-black py-4 rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-accent-primary/20 flex items-center justify-center gap-2 order-1 md:order-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
          <span className="text-sm">{initialData ? 'تحديث البيانات' : 'إضافة إلى المخزن'}</span>
        </button>
        <button 
          type="button" 
          onClick={onCancel}
          className="py-4 px-8 text-slate-400 font-Cairo font-bold text-sm hover:bg-slate-50 rounded-2xl transition-all order-2 md:order-1"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
};

