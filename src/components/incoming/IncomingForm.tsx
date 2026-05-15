import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useAppContext } from '../../context/AppContext';
import { Product } from '../../types/product.types';

interface IncomingFormProps {
  onSubmit: (data: {
    supplierId: string;
    supplierName: string;
    items: { productId: string; productName: string; qty: number; unitPrice: number }[];
    advancePayment: number;
    notes: string;
  }) => void;
  onCancel: () => void;
}

export const IncomingForm: React.FC<IncomingFormProps> = ({ onSubmit, onCancel }) => {
  const { data, showToast } = useAppContext();
  const [supplierId, setSupplierId] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [advancePayment, setAdvancePayment] = useState(0);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<{ productId: string; qty: number; unitPrice: number }[]>([
    { productId: '', qty: 1, unitPrice: 0 }
  ]);

  const productOptions = [
    { value: '', label: 'اختر منتجاً' },
    ...data.products.map(p => ({ value: p.id, label: `${p.name} (${p.code})` }))
  ];

  const supplierOptions = [
    { value: 'new', label: '+ مورد جديد' },
    ...data.suppliers.map(s => ({ value: s.id, label: s.name }))
  ];

  const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSupplierId(val);
    if (val !== 'new' && val !== '') {
      const sup = data.suppliers.find(s => s.id === val);
      if (sup) setSupplierName(sup.name);
    } else {
      setSupplierName('');
    }
  };

  const handleAddItem = () => {
    setItems([...items, { productId: '', qty: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-fill unit price if product is selected
    if (field === 'productId') {
      const product = data.products.find(p => p.id === value);
      if (product) {
        newItems[index].unitPrice = product.buyPrice;
      }
    }
    
    setItems(newItems);
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName || items.some(i => !i.productId)) {
        showToast('يرجى ملء جميع الحقول المطلوبة واختيار المنتجات', 'error');
        return;
    }

    if (items.some(i => i.qty <= 0 || i.unitPrice <= 0)) {
        showToast('الكمية وسعر الوحدة يجب أن يكونا أكبر من صفر', 'error');
        return;
    }

    if (advancePayment < 0) {
        showToast('الدفعة المقدمة لا يمكن أن تكون بالسالب', 'error');
        return;
    }

    const formattedItems = items.map(item => ({
      ...item,
      productName: data.products.find(p => p.id === item.productId)?.name || 'منتج غير معروف'
    }));

    onSubmit({ supplierId, supplierName, items: formattedItems, advancePayment, notes });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
        <h4 className="text-sm font-black font-Cairo text-accent-primary mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>معلومات المورد والمالية</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
               <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider font-Cairo mr-1">المورد</label>
               <div className="flex gap-2">
                 <div className="flex-1">
                   <Select 
                    options={supplierOptions}
                    value={supplierId}
                    onChange={handleSupplierChange}
                    />
                 </div>
                 {(supplierId === 'new' || supplierId === '') && (
                   <div className="flex-1">
                      <Input 
                        value={supplierName}
                        onChange={(e) => setSupplierName(e.target.value)}
                        placeholder="أدخل اسم المورد الجديد"
                      />
                   </div>
                 )}
               </div>
            </div>
            <Input 
            label="دفعة مقدمة (كاش)" 
            type="number"
            min="0"
            value={advancePayment}
            onChange={(e) => setAdvancePayment(Number(e.target.value))}
            placeholder="0.00"
            />
        </div>
      </div>

      <div className="border border-slate-200 rounded-2xl overflow-hidden mt-6 bg-white shadow-sm">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex flex-col">
            <h4 className="text-sm font-black font-Cairo text-slate-800">قائمة الأصناف الواردة</h4>
            <p className="text-[10px] text-slate-400 font-Tajawal mt-1">اختر المنتجات والكميات بعناية</p>
          </div>
          <button 
            type="button" 
            onClick={handleAddItem}
            className="bg-white border border-slate-200 text-accent-primary font-Cairo font-bold text-xs py-2 px-4 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-1 shadow-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>إضافة صنف</span>
          </button>
        </div>
        
        <div className="p-0">
          <div className="max-h-[350px] overflow-y-auto px-6 py-4 space-y-6 custom-scrollbar">
            {items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-white p-4 rounded-xl border border-slate-100 hover:border-accent-primary/20 transition-all relative">
                    <div className="md:col-span-12 flex justify-between items-center mb-2 md:hidden">
                        <span className="text-[11px] font-black font-Cairo text-accent-primary bg-accent-primary/5 px-3 py-1 rounded-full">صنف رقم {index + 1}</span>
                        {items.length > 1 && (
                            <button onClick={() => handleRemoveItem(index)} className="text-accent-danger"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                        )}
                    </div>
                    
                    <div className="md:col-span-5">
                        <Select 
                        label={index === 0 ? "المنتج" : undefined}
                        options={productOptions}
                        value={item.productId}
                        onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <Input 
                        label={index === 0 ? "الكمية" : undefined}
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => handleItemChange(index, 'qty', Number(e.target.value))}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <Input 
                        label={index === 0 ? "سعر الشراء" : undefined}
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <p className="text-[10px] font-bold text-slate-400 mb-2 pr-1 uppercase font-Tajawal tracking-wider">الإجمالي</p>
                        <p className="py-3 font-bold text-accent-teal tabular-nums text-lg">{(item.qty * item.unitPrice).toLocaleString('ar-EG')} <span className="text-[10px]">ج.م</span></p>
                    </div>
                    <div className="md:col-span-1 hidden md:flex justify-end pb-3">
                        <button 
                        type="button" 
                        onClick={() => handleRemoveItem(index)}
                        disabled={items.length === 1}
                        className="p-3 text-slate-300 hover:text-accent-danger hover:bg-red-50 rounded-xl transition-all disabled:opacity-0"
                        >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 px-8 py-6 flex items-center justify-between border-t border-slate-700 shadow-inner">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 font-Cairo uppercase tracking-widest">إجمالي قيمة الفاتورة</span>
            <span className="text-3xl font-black text-white font-Cairo mt-1 tabular-nums">{totalAmount.toLocaleString('ar-EG')} <small className="text-xs font-normal">ج.م</small></span>
          </div>
          <div className="text-left flex flex-col items-end">
            <span className="text-[10px] font-bold text-slate-400 font-Cairo uppercase tracking-widest">المتبقي للمورد</span>
            <span className="text-xl font-bold text-accent-danger font-Cairo mt-1 tabular-nums">{(totalAmount - advancePayment).toLocaleString('ar-EG')} <small className="text-xs font-normal text-slate-500 font-Tajawal">آجل</small></span>
          </div>
        </div>
      </div>

      <Input 
        label="ملاحظات توضيحية" 
        value={notes} 
        onChange={(e) => setNotes(e.target.value)} 
        placeholder="أي ملاحظات إضافية بخصوص الفاتورة..."
      />

      <div className="flex flex-col md:flex-row gap-3 pt-4">
        <button 
          type="submit"
          className="flex-1 bg-accent-success text-white font-Cairo font-black py-4 rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-accent-success/20 flex items-center justify-center gap-3 order-1 md:order-2"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
          <span className="text-lg">تأكيد وتسجيل أمر الوارد</span>
        </button>
        <button 
          type="button" 
          onClick={onCancel}
          className="flex-0.5 text-slate-400 font-Cairo font-bold py-3 px-8 hover:bg-slate-50 rounded-2xl transition-all order-2 md:order-1"
        >
          إلغاء العملية
        </button>
      </div>
    </form>
  );
};
