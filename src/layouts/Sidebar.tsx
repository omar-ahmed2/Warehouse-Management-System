import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';

export const Sidebar: React.FC<{ isCollapsed: boolean; toggle: () => void }> = ({ isCollapsed, toggle }) => {
  const { user, logout } = useAuth();
  const { data } = useAppContext();

  const sections = [
    {
      links: [
        { name: 'لوحة التحكم', path: '/dashboard', icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        ), roles: ['manager', 'supervisor', 'warehouse_keeper'] },
      ]
    },
    {
      title: 'إدارة المخزن',
      links: [
        { name: 'المنتجات', path: '/products', icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
        ), roles: ['manager', 'supervisor', 'warehouse_keeper'] },
        { name: 'المخزون الحالي', path: '/inventory', icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
        ), roles: ['manager', 'supervisor', 'warehouse_keeper'] },
        { name: 'الوارد', path: '/incoming', icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
        ), roles: ['manager', 'supervisor', 'warehouse_keeper'] },
        { name: 'الصادر', path: '/outgoing', icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>
        ), roles: ['manager', 'supervisor', 'warehouse_keeper'] },
      ]
    },
    {
      title: 'جهات التعامل',
      links: [
        { name: 'العملاء', path: '/customers', icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        ), roles: ['manager', 'supervisor'] },
        { name: 'الموردين', path: '/suppliers', icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline></svg>
        ), roles: ['manager', 'supervisor'] },
      ]
    },
    {
      title: 'الحسابات',
      links: [
        { name: 'المالية', path: '/finance', icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>
        ), roles: ['manager', 'supervisor'] },
        { name: 'التحصيلات', path: '/collections', icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
        ), roles: ['manager', 'supervisor'] },
      ]
    },
    {
      title: 'التقارير',
      links: [
        { name: 'التقارير والإحصائيات', path: '/reports', icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
        ), roles: ['manager', 'supervisor'] },
      ]
    },
    {
      title: 'الإدارة',
      links: [
        { name: 'إدارة المستخدمين', path: '/users', icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        ), roles: ['manager'] },
        { name: 'الإعدادات', path: '/settings', icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        ), roles: ['manager', 'supervisor', 'warehouse_keeper'] },
      ]
    }
  ];

  const currentPath = window.location.pathname;

  const roleLabels: any = {
    manager: 'مدير',
    supervisor: 'مشرف',
    warehouse_keeper: 'أمين مخزن',
  };

  return (
    <aside className={`
      fixed inset-y-0 right-0 z-40 bg-white border-l border-[var(--border-color)]
      transition-all duration-300 flex flex-col h-screen
      ${isCollapsed ? 'translate-x-full lg:translate-x-0 lg:w-20' : 'translate-x-0 w-64'}
      lg:static lg:h-screen
    `}>
      {/* Toggle Button */}
      <button 
        onClick={toggle}
        className={`
          absolute -left-3 top-10 w-6 h-6 bg-white border border-slate-200 rounded-full 
          flex items-center justify-center text-slate-400 hover:text-accent-primary 
          shadow-sm hover:shadow-md transition-all duration-300 z-50 group
          ${isCollapsed ? 'rotate-180' : ''}
          hidden lg:flex
        `}
        title={isCollapsed ? 'توسيع القائمة' : 'تصغير القائمة'}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:scale-110 transition-transform">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      {/* Logo Area */}
      <div className="h-24 flex flex-col justify-center px-6">
        {!isCollapsed && (
          <div className="flex flex-col gap-1">
             <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-accent-primary flex items-center justify-center text-white">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-2xl font-Cairo text-accent-primary leading-none">مخزني</span>
                  <span className="text-[10px] text-text-muted font-Tajawal mt-1">نظام إدارة المخازن</span>
                </div>
             </div>
             <p className="text-[11px] text-accent-warning font-bold mr-12 mt-1">{data.settings.companyName}</p>
          </div>
        )}
        {isCollapsed && (
          <div className="w-10 h-10 rounded-xl bg-accent-primary flex items-center justify-center text-white mx-auto">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-4 custom-scrollbar">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {section.title && !isCollapsed && (
              <p className="px-3 text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 font-Tajawal">
                {section.title}
              </p>
            )}
            {section.links.map((link) => {
              if (user && link.roles.includes(user.role)) {
                const isActive = currentPath === link.path;
                const handleNavigate = (e: React.MouseEvent, path: string) => {
                  e.preventDefault();
                  window.history.pushState({}, '', path);
                  window.dispatchEvent(new Event('popstate'));
                  // Close sidebar on mobile
                  if (window.innerWidth < 1024 && !isCollapsed) {
                    toggle();
                  }
                };

                return (
                  <a
                    key={link.path}
                    href={link.path}
                    onClick={(e) => handleNavigate(e, link.path)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                      ${isActive 
                        ? 'bg-accent-primary/5 text-accent-primary border-l-4 border-accent-primary rounded-l-none' 
                        : 'text-text-secondary hover:bg-bg-primary hover:text-accent-primary'}
                    `}
                  >
                    <div className={`transition-colors ${isActive ? 'text-accent-primary' : 'text-text-muted group-hover:text-accent-primary'}`}>
                      {link.icon}
                    </div>
                    {!isCollapsed && <span className={`font-medium text-[13px] font-Tajawal ${isActive ? 'font-bold' : ''}`}>{link.name}</span>}
                  </a>
                );
              }
              return null;
            })}
          </div>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-[var(--border-color)]">
        <div className={`flex items-center p-2 rounded-2xl border border-border-color transition-colors ${isCollapsed ? 'justify-center border-none' : 'gap-3'}`}>
          {!isCollapsed && (
             <button 
              onClick={logout}
              className="p-2 text-text-muted hover:text-accent-danger transition-colors"
              title="تسجيل الخروج"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          )}
          
          {!isCollapsed && (
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[13px] font-bold text-text-primary truncate">{user?.name}</p>
              <p className="text-[11px] text-accent-secondary font-bold mt-0.5">{roleLabels[user?.role || '']}</p>
              <p className="text-[9px] text-text-muted mt-1">آخر دخول: منذ ساعتين تقريباً</p>
            </div>
          )}
          
          <div className="w-10 h-10 rounded-full bg-accent-primary flex items-center justify-center text-white font-bold shrink-0 text-sm">
            {user?.name.substring(0, 2)}
          </div>
        </div>
        
        {isCollapsed && (
          <button 
            onClick={logout}
            className="mt-4 flex justify-center text-text-muted hover:text-accent-danger p-2 rounded-xl transition-all w-full"
            title="تسجيل الخروج"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
        )}
      </div>
    </aside>
  );
};
