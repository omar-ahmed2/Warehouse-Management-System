import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAppContext } from '../context/AppContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 1024);
  const { toasts, removeToast } = useAppContext();

  // Close sidebar when title (page) changes on mobile
  React.useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarCollapsed(true);
    }
  }, [title]);

  return (
    <div className="min-h-screen flex bg-[var(--bg-primary)] overflow-hidden no-print">
      <Sidebar isCollapsed={isSidebarCollapsed} toggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      
      {/* Mobile Backdrop */}
      {!isSidebarCollapsed && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          onClick={() => setIsSidebarCollapsed(true)}
        />
      )}
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        <Header title={title} toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
          <div key={title} className="max-w-7xl mx-auto page-enter">
            {children}
          </div>
        </main>

        {/* Toast Container */}
        <div className="fixed top-6 left-6 z-[100] flex flex-col gap-3 w-80">
          {toasts.map((toast) => (
            <div 
              key={toast.id}
              className={`
                toast-enter bg-bg-card border-r-4 p-4 rounded-lg shadow-xl flex items-center justify-between
                ${toast.type === 'success' ? 'border-r-accent-success' : ''}
                ${toast.type === 'error' ? 'border-r-accent-danger' : ''}
                ${toast.type === 'warning' ? 'border-r-accent-warning' : ''}
                ${toast.type === 'info' ? 'border-r-accent-primary' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                {toast.type === 'success' && <svg width="20" height="20" className="text-accent-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                {toast.type === 'error' && <svg width="20" height="20" className="text-accent-danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>}
                <p className="text-sm font-medium text-text-primary font-Tajawal">{toast.message}</p>
              </div>
              <button 
                onClick={() => removeToast(toast.id)}
                className="text-text-muted hover:text-white transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
