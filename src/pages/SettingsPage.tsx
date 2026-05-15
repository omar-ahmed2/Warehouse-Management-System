import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/ui/Badge';


export const SettingsPage: React.FC = () => {
  const { data, updateData, showToast, resetData } = useAppContext();
  const { user, login } = useAuth();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'profile' | 'security' | 'danger'>('general');

  const [formData, setFormData] = useState({
    companyName: data.settings.companyName,
    address: data.settings.address,
    currency: data.settings.currency,
  });

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateData({ settings: formData });
    showToast('تم حفظ إعدادات النظام بنجاح', 'success');
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData.name) {
      showToast('الاسم مطلوب', 'error');
      return;
    }

    // Update user in the users array
    const updatedUsers = data.users.map(u => {
      if (u.id === user?.id) {
        return { ...u, name: profileData.name };
      }
      return u;
    });

    updateData({ users: updatedUsers });
    
    // Update local session as well
    if (user) {
        const updatedUser = { ...user, name: profileData.name };
        window.sessionStorage.setItem('makhzan_session', JSON.stringify(updatedUser));
        // Force refresh state by calling a dummy login or just reloading
        window.location.reload(); 
    }
    
    showToast('تم تحديث البيانات الشخصية بنجاح', 'success');
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
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-black text-slate-800 font-Cairo tracking-tight">إعدادات النظام</h1>
           <p className="text-slate-500 mt-2 font-Tajawal font-medium">تحكم في هوية المؤسسة، الأمان، وتفضيلات النظام</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 bg-white rounded-[32px] p-4 border border-slate-100 shadow-sm space-y-2">
            {[
                { id: 'general', label: 'إعدادات المؤسسة', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
                { id: 'profile', label: 'البيانات الشخصية', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
                { id: 'danger', label: 'منطقة الخطورة', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" x2="12.01" y1="9" y2="9"/><line x1="12" x2="12.01" y1="13" y2="17"/></svg> },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                        w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-Cairo font-black text-sm
                        ${activeTab === tab.id 
                            ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10 translate-x-1' 
                            : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}
                    `}
                >
                    {tab.icon}
                    <span>{tab.label}</span>
                </button>
            ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 space-y-8">
            {activeTab === 'general' && (
                <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm animate-in slide-in-from-left-4 duration-500">
                    <div className="mb-8">
                        <h3 className="text-xl font-black font-Cairo text-slate-800">هوية المؤسسة</h3>
                        <p className="text-sm text-slate-400 font-Tajawal mt-1">المعلومات التي تظهر في الفواتير والتقارير الرسمية</p>
                    </div>

                    <form onSubmit={handleSettingsSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input 
                                label="اسم الشركة / المخزن" 
                                value={formData.companyName}
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                placeholder="مثال: شركة المجد للتجارة"
                            />
                            <Input 
                                label="رمز العملة" 
                                value={formData.currency}
                                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                placeholder="EGP"
                            />
                            <div className="md:col-span-2">
                                <Input 
                                    label="العنوان بالكامل" 
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="المحافظة - المركز - الشارع"
                                />
                            </div>
                        </div>
                        <div className="pt-6 border-t border-slate-50 flex justify-end">
                            <button type="submit" className="bg-slate-900 text-white font-Cairo font-black py-4 px-10 rounded-2xl shadow-lg shadow-slate-900/10 hover:opacity-90 transition-all">
                                حفظ إعدادات المؤسسة
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeTab === 'profile' && (
                <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm animate-in slide-in-from-left-4 duration-500">
                    <div className="mb-8">
                        <h3 className="text-xl font-black font-Cairo text-slate-800">البيانات الشخصية</h3>
                        <p className="text-sm text-slate-400 font-Tajawal mt-1">قم بتحديث اسمك وبياناتك التي تظهر في النظام</p>
                    </div>

                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                        <div className="flex flex-col md:flex-row items-center gap-8 mb-8 pb-8 border-b border-slate-50">
                            <div className="w-24 h-24 rounded-[32px] bg-accent-primary/10 flex items-center justify-center text-accent-primary text-4xl font-black font-Cairo border-4 border-white shadow-xl ring-1 ring-slate-100">
                                {profileData.name.charAt(0) || 'U'}
                            </div>
                            <div>
                                <h4 className="text-lg font-black font-Cairo text-slate-800">{profileData.name || 'مستخدم النظام'}</h4>
                                <p className="text-xs text-slate-400 font-Tajawal mt-1">{user?.role === 'manager' ? 'مدير النظام' : 'موظف مخزن'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input 
                                label="الاسم الكامل (سيظهر في الترحيب)" 
                                value={profileData.name}
                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                placeholder="أدخل اسمك هنا"
                            />
                            <div className="opacity-60 cursor-not-allowed">
                                <Input 
                                    label="البريد الإلكتروني (لا يمكن تغييره)" 
                                    value={profileData.email}
                                    disabled
                                    readOnly
                                />
                            </div>
                        </div>
                        <div className="pt-6 border-t border-slate-50 flex justify-end">
                            <button type="submit" className="bg-accent-primary text-white font-Cairo font-black py-4 px-10 rounded-2xl shadow-lg shadow-accent-primary/20 hover:opacity-90 transition-all">
                                تحديث بياناتي الشخصية
                            </button>
                        </div>
                    </form>
                </div>
            )}

                

            {activeTab === 'danger' && (
                <div className="bg-white rounded-[40px] p-10 border border-red-100 shadow-sm animate-in slide-in-from-left-4 duration-500">
                    <div className="mb-8">
                        <h3 className="text-xl font-black font-Cairo text-red-600">منطقة الخطورة</h3>
                        <p className="text-sm text-slate-400 font-Tajawal mt-1">هذه الإجراءات قد تؤدي لفقدان دائم للبيانات</p>
                    </div>

                    <div className="bg-red-50/50 p-8 rounded-[32px] border border-red-100 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex-1">
                            <h4 className="text-lg font-black font-Cairo text-slate-800">تصفير كافة بيانات النظام</h4>
                            <p className="text-sm text-slate-500 font-Tajawal mt-2 leading-relaxed">
                                هذا الخيار سيقوم بحذف جميع المنتجات، العملاء، الموردين، وكافة سجلات الفواتير والعمليات المالية. 
                                <span className="text-red-600 font-bold block mt-1">لا يمكن التراجع عن هذا الإجراء أبداً.</span>
                            </p>
                        </div>
                        <button 
                            onClick={() => setIsResetModalOpen(true)}
                            className="bg-red-600 text-white font-Cairo font-black py-4 px-10 rounded-2xl shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all whitespace-nowrap"
                        >
                            تصفير البيانات بالكامل
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>

      <Modal
          isOpen={isResetModalOpen}
          onClose={() => setIsResetModalOpen(false)}
          title="تأكيد التصفير النهائي"
          size="sm"
      >
          <div className="space-y-8 text-center p-2">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-[28px] flex items-center justify-center mx-auto shadow-inner">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" x2="12.01" y1="9" y2="9"/><line x1="12" x2="12.01" y1="13" y2="17"/></svg>
            </div>
            
            <div className="space-y-3">
                <h3 className="text-2xl font-black font-Cairo text-slate-800">تحذير أمان نهائي</h3>
                <p className="text-sm text-slate-400 font-Tajawal leading-relaxed">
                  أنت على وشك مسح <span className="text-red-600 font-bold underline">كامل تاريخ النظام</span>. لن تتمكن من استعادة أي بيانات بعد هذه اللحظة.
                </p>
            </div>

            <div className="flex flex-col gap-3">
                <button 
                    onClick={handleResetSystem}
                    className="w-full bg-red-600 text-white font-Cairo font-black py-4 rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                >
                    تأكيد المسح النهائي
                </button>
                <button 
                    onClick={() => setIsResetModalOpen(false)}
                    className="w-full text-slate-400 font-Cairo font-bold py-2 hover:bg-slate-50 rounded-2xl transition-all"
                >
                    إلغاء والتراجع
                </button>
            </div>
          </div>
      </Modal>
    </div>
  );
};

