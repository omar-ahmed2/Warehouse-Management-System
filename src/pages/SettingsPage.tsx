import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useAppContext } from '../context/AppContext';
import { Badge } from '../components/ui/Badge';

export const SettingsPage: React.FC = () => {
  const { data, updateData, showToast, resetData } = useAppContext();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    companyName: data.settings.companyName,
    address: data.settings.address,
    currency: data.settings.currency,
  });

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateData({ settings: formData });
    showToast('تم حفظ الإعدادات بنجاح', 'success');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      showToast('كلمتا المرور غير متطابقتين', 'error');
      return;
    }
    showToast('تم تغيير كلمة المرور بنجاح', 'success');
    setPasswordData({ current: '', new: '', confirm: '' });
  };

  const handleResetSystem = () => {
    resetData();
    showToast('تم تصفير كافة بيانات النظام بنجاح', 'success');
    setIsResetModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-12 max-w-2xl">
        <section className="space-y-6">
          <div>
            <h3 className="text-lg font-bold font-Cairo text-text-primary">معلومات الشركة</h3>
            <p className="text-xs text-text-muted mt-1">تظهر هذه المعلومات في التقارير والواجهة العامة</p>
          </div>
          
          <form onSubmit={handleSettingsSubmit} className="bg-bg-card p-8 rounded-xl border border-border-color space-y-4 shadow-sm">
             <Input 
                label="اسم الشركة / المخزن" 
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
             />
             <Input 
                label="العنوان" 
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
             />
             <Input 
                label="رمز العملة" 
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
             />
             <div className="pt-4 border-t border-border-light flex justify-end">
                <Button type="submit">حفظ التغييرات</Button>
             </div>
          </form>
        </section>

        <section className="space-y-6">
          <div>
            <h3 className="text-lg font-bold font-Cairo text-text-primary">تغيير كلمة المرور</h3>
            <p className="text-xs text-text-muted mt-1">تأكد من اختيار كلمة مرور قوية</p>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="bg-bg-card p-8 rounded-xl border border-border-color space-y-4 shadow-sm">
             <Input 
                label="كلمة المرور الحالية" 
                type="password"
                value={passwordData.current}
                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
             />
             <Input 
                label="كلمة المرور الجديدة" 
                type="password"
                value={passwordData.new}
                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
             />
             <Input 
                label="تأكيد كلمة المرور" 
                type="password"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
             />
             <div className="pt-4 border-t border-border-light flex justify-end">
                <Button type="submit">تغيير كلمة المرور</Button>
             </div>
          </form>
        </section>

        <section className="space-y-6">
           <div className="bg-bg-tertiary/20 p-8 rounded-2xl border border-border-color text-center">
              <h3 className="text-xl font-bold font-Cairo text-accent-primary mb-2">نظام إدارة المخزن - v1.0.0</h3>
              <p className="text-sm text-text-muted mx-auto max-w-sm">تم تطوير هذا النظام لإدارة المخزون والعمليات المالية بكفاءة عالية</p>
              <div className="mt-6 flex justify-center gap-2">
                 <Badge color="primary">React</Badge>
                 <Badge color="teal">TypeScript</Badge>
                 <Badge color="purple">Tailwind CSS</Badge>
              </div>
           </div>
        </section>

        <section className="space-y-6 pt-8 border-t border-accent-danger/20">
          <div>
            <h3 className="text-lg font-bold font-Cairo text-accent-danger">منطقة الخطورة</h3>
            <p className="text-xs text-text-muted mt-1">هذه الإجراءات لا يمكن التراجع عنها</p>
          </div>
          
          <div className="bg-accent-danger/5 p-8 rounded-xl border border-accent-danger/20 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="font-bold text-text-primary">مسح جميع بيانات النظام</h4>
              <p className="text-sm text-text-muted">سيتم حذف كل المنتجات، الفواتير، الحركات المالية والمخزون والبدء من جديد.</p>
            </div>
            <Button 
              variant="danger" 
              onClick={() => setIsResetModalOpen(true)}
            >
              مسح كافة البيانات
            </Button>
          </div>
        </section>

        <Modal
            isOpen={isResetModalOpen}
            onClose={() => setIsResetModalOpen(false)}
            title="تصفير بيانات النظام"
            size="sm"
        >
            <div className="space-y-6 text-center">
            <div className="w-16 h-16 bg-red-100 text-accent-danger rounded-full flex items-center justify-center mx-auto">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            
            <div className="space-y-2">
                <h3 className="text-lg font-black font-Cairo text-accent-primary">تحذير أمان شديد!</h3>
                <p className="text-sm text-text-muted font-Tajawal leading-relaxed">
                هل أنت متأكد تماماً من حذف كافة البيانات؟ سيتم مسح <span className="text-accent-danger font-bold">كل شيء</span> في النظام (منتجات، فواتير، حركات مالية) والبدء من جديد.
                <br />
                <span className="font-bold underline">لا يمكن التراجع عن هذا الإجراء.</span>
                </p>
            </div>

            <div className="flex flex-col gap-3">
                <button 
                    onClick={handleResetSystem}
                    className="w-full bg-accent-danger text-white font-Cairo font-bold py-3 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-accent-danger/20"
                >
                    نعم، امسح كل البيانات
                </button>
                <button 
                    onClick={() => setIsResetModalOpen(false)}
                    className="w-full text-text-muted font-Cairo font-bold py-2 hover:bg-bg-primary rounded-xl transition-all"
                >
                    إلغاء العملية
                </button>
            </div>
            </div>
        </Modal>
      </div>
  );
};
