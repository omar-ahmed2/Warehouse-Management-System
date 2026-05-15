import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Product } from '../../types/product.types';

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: Omit<Product, 'id' | 'createdAt'> & { initialQty?: number }) => void;
  onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, onCancel }) => {
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

  const categories = [
    { value: 'إلكترونيات', label: 'إلكترونيات' },
    { value: 'معدات مكتبية', label: 'معدات مكتبية' },
    { value: 'إكسسوارات', label: 'إكسسوارات' },
    { value: 'أدوات كهربائية', label: 'أدوات كهربائية' },
  ];

  const units = [
    { value: 'قطعة', label: 'قطعة' },
    { value: 'كيلو', label: 'كيلو' },
    { value: 'متر', label: 'متر' },
    { value: 'علبة', label: 'علبة' },
    { value: 'كرتونة', label: 'كرتونة' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
      <div className="bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
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
        <Select 
          label="التصنيفات" 
          options={categories}
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        />
        <Select 
          label="وحدة القياس" 
          options={units}
          value={formData.unit}
          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
        />
      </div>

      <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 shadow-sm">
        <div className="md:col-span-2 pb-2 border-b border-slate-100 font-black font-Cairo text-slate-800 text-xs md:text-sm">
            التسعير والمخزون
        </div>
        <Input 
          label="سعر الشراء" 
          type="number" 
          required 
          value={formData.buyPrice}
          onChange={(e) => setFormData({ ...formData, buyPrice: Number(e.target.value) })}
          placeholder="0.00"
        />
        <Input 
          label="سعر البيع" 
          type="number" 
          required 
          value={formData.sellPrice}
          onChange={(e) => setFormData({ ...formData, sellPrice: Number(e.target.value) })}
          placeholder="0.00"
        />
        <Input 
          label="حد التنبيه" 
          type="number" 
          value={formData.minStock}
          onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
          placeholder="5"
        />
        {!initialData && (
          <Input 
            label="الكمية المتوفرة حالياً" 
            type="number" 
            required
            value={formData.initialQty}
            onChange={(e) => setFormData({ ...formData, initialQty: Number(e.target.value) })}
            placeholder="0"
          />
        )}
         <div className={`flex items-center justify-center bg-blue-50/50 rounded-xl p-3 border border-blue-100 ${initialData ? 'md:col-start-2' : 'md:col-span-2'}`}>
            <div className="text-center">
                <p className="text-[9px] font-bold text-blue-400 uppercase font-Tajawal">الربح المتوقع</p>
                <p className="text-lg font-black text-accent-primary tabular-nums">{(formData.sellPrice - formData.buyPrice).toLocaleString('ar-EG')} ج.م</p>
            </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-2 pt-2">
        <button 
          type="submit"
          className="flex-1 bg-accent-primary text-white font-Cairo font-black py-3 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-accent-primary/20 flex items-center justify-center gap-2 order-1 md:order-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
          <span className="text-sm">{initialData ? 'تحديث البيانات' : 'إضافة إلى المخزن'}</span>
        </button>
        <button 
          type="button" 
          onClick={onCancel}
          className="py-3 px-6 text-slate-400 font-Cairo font-bold text-sm hover:bg-slate-50 rounded-xl transition-all order-2 md:order-1"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
};
