import React, { useState } from 'react';
import { Table } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { User, UserRole } from '../types/user.types';
import { formatDate } from '../utils/formatDate';

export const UsersPage: React.FC = () => {
  const { data, updateData, showToast } = useAppContext();
  const { user: currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'warehouse_keeper' as UserRole,
  });

  const roles = [
    { value: 'manager', label: 'المدير' },
    { value: 'supervisor', label: 'المشرف' },
    { value: 'warehouse_keeper', label: 'أمين المخزن' },
  ];

  const roleColors: any = {
    manager: 'primary',
    supervisor: 'purple',
    warehouse_keeper: 'teal',
  };

  const roleLabels: any = {
    manager: 'المدير',
    supervisor: 'المشرف',
    warehouse_keeper: 'أمين المخزن',
  };

  const columns = [
    { key: 'name', header: 'الاسم', sortable: true },
    { key: 'email', header: 'البريد الإلكتروني' },
    { 
      key: 'role', 
      header: 'الدور', 
      render: (u: User) => <Badge color={roleColors[u.role]}>{roleLabels[u.role]}</Badge>
    },
    { 
      key: 'isActive', 
      header: 'الحالة', 
      render: (u: User) => <Badge color={u.isActive ? 'success' : 'muted'}>{u.isActive ? 'نشط' : 'معطل'}</Badge>
    },
    { key: 'createdAt', header: 'تاريخ الإنشاء', render: (u: User) => formatDate(u.createdAt) },
    {
      key: 'actions',
      header: 'إجراءات',
      render: (u: User) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleEdit(u)}
            className="p-1.5 rounded-lg text-accent-primary hover:bg-accent-primary/10 transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4L18.5 2.5z"></path></svg>
          </button>
          
          {u.id !== currentUser?.id && (
             <>
               <button 
                onClick={() => handleStatusToggle(u)}
                className={`p-1.5 rounded-lg transition-all ${u.isActive ? 'text-accent-warning hover:bg-accent-warning/10' : 'text-accent-success hover:bg-accent-success/10'}`}
                title={u.isActive ? 'تعطيل' : 'تفعيل'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="15"></line><line x1="15" y1="9" x2="9" y2="15"></line></svg>
              </button>
              
              <button 
                onClick={() => handleDelete(u.id)}
                className="p-1.5 rounded-lg text-accent-danger hover:bg-accent-danger/10 transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
             </>
          )}
        </div>
      )
    }
  ];

  const handleEdit = (u: User) => {
    setEditingUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      password: u.password,
      role: u.role,
    });
    setIsModalOpen(true);
  };

  const handleStatusToggle = (u: User) => {
    const updated = data.users.map(user => 
      user.id === u.id ? { ...user, isActive: !user.isActive } : user
    );
    updateData({ users: updated });
    showToast(`تم ${!u.isActive ? 'تفعيل' : 'تعطيل'} حساب المستخدم`, 'info');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      const updated = data.users.filter(u => u.id !== id);
      updateData({ users: updated });
      showToast('تم حذف المستخدم بنجاح', 'success');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) return showToast('يرجى ملء جميع الحقول', 'error');

    if (editingUser) {
      const updated = data.users.map(u => 
        u.id === editingUser.id ? { ...u, ...formData } : u
      );
      updateData({ users: updated });
      showToast('تم تحديث بيانات المستخدم', 'success');
    } else {
      const newUser: User = {
        id: `u${Date.now()}`,
        ...formData,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      updateData({ users: [...data.users, newUser] });
      showToast('تم إضافة المستخدم الجديد بنجاح', 'success');
    }

    setIsModalOpen(false);
    setEditingUser(undefined);
    setFormData({ name: '', email: '', password: '', role: 'warehouse_keeper' });
  };

  return (
    <>
      <div className="flex flex-col gap-8 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div>
              <h1 className="text-3xl font-black text-slate-800 font-Cairo tracking-tight">إدارة المستخدمين</h1>
              <p className="text-slate-500 mt-2 font-Tajawal font-medium">إضافة حسابات الفريق وتحديد صلاحياتهم في النظام</p>
           </div>
          <Button onClick={() => { setEditingUser(undefined); setFormData({ name: '', email: '', password: '', role: 'warehouse_keeper' }); setIsModalOpen(true); }} className="py-4 px-8 rounded-2xl">
            إضافة مستخدم جديد
          </Button>
        </div>

        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
           <Table columns={columns} data={data.users} searchKey="name" />
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingUser ? 'تعديل بيانات مستخدم' : 'إضافة مستخدم جديد'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5 py-2">
           <Input 
              label="الاسم الكامل" 
              placeholder="مثال: أحمد محمد"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>}
           />
           <Input 
              label="البريد الإلكتروني" 
              type="email"
              placeholder="user@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>}
           />
           <Input 
              label="كلمة المرور" 
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>}
           />
           <Select 
             label="الدور / الصلاحية" 
             options={roles} 
             value={formData.role}
             onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
             icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>}
           />
           <div className="flex gap-3 pt-6">
             <button type="submit" className="flex-1 bg-accent-primary text-white font-black font-Cairo py-4 rounded-2xl shadow-lg shadow-accent-primary/20 hover:opacity-90 transition-all">{editingUser ? 'تحديث البيانات' : 'إنشاء الحساب'}</button>
             <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 text-slate-400 font-bold font-Cairo hover:bg-slate-50 rounded-xl transition-all">إلغاء</button>
           </div>
        </form>
      </Modal>
    </>
  );
};

