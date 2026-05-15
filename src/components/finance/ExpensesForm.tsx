import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { EntryType } from '../../types/finance.types';

interface ExpensesFormProps {
  onSubmit: (data: { type: EntryType; amount: number; description: string }) => void;
  onCancel: () => void;
}

export const ExpensesForm: React.FC<ExpensesFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    type: 'company_expense' as EntryType,
    amount: 0,
    description: '',
  });

  const types = [
    { value: 'capital_deposit', label: 'إيداع رأس مال' },
    { value: 'revenue_deposit', label: 'إيداع إيراد يدوي' },
    { value: 'company_expense', label: 'مصاريف تشغيلية' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0 || !formData.description) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-6">
        <Select 
          label="نوع العملية" 
          options={types}
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as EntryType })}
        />
        
        <Input 
          label="القيمة المالية" 
          type="number" 
          required 
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
          placeholder="0.00"
        />

        <Input 
          label="البيان / التفاصيل" 
          required 
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="مثال: فاتورة كهرباء شهر مايو..."
        />
      </div>

      <div className="flex flex-col gap-3">
        <button 
          type="submit"
          className="w-full bg-accent-primary text-white font-Cairo font-black py-4 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-accent-primary/20 flex items-center justify-center gap-2"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
          <span>تسجيل العملية المالية</span>
        </button>
        <button 
          type="button" 
          onClick={onCancel}
          className="w-full text-slate-400 font-Cairo font-bold py-2 hover:bg-slate-50 rounded-xl transition-all"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
};
