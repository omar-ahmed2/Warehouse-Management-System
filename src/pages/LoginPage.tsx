import React, { useState } from 'react';
import { AuthLayout } from '../layouts/AuthLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';

export const LoginPage: React.FC<{ onLoginSuccess: () => void }> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('makhzan@gmail.com');
  const [password, setPassword] = useState('makhzan@2026');
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const { showToast } = useAppContext();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    
    const success = login(email, password);
    if (success) {
      showToast('تم تسجيل الدخول بنجاح', 'success');
      onLoginSuccess();
    } else {
      setError(true);
      showToast('خطأ في البريد الإلكتروني أو كلمة المرور', 'error');
    }
  };

  return (
    <AuthLayout>
      <div className="bg-[var(--bg-card)]/80 backdrop-blur-xl border border-[var(--border-color)] rounded-[var(--radius-card)] p-8 shadow-[var(--shadow-card)]">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-2xl mx-auto flex items-center justify-center text-white mb-4 shadow-xl shadow-blue-500/20">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
          </div>
          <h1 className="text-2xl font-bold font-Cairo text-text-primary tracking-tight">نظام إدارة المخزن</h1>
          <p className="text-text-secondary mt-2 font-Tajawal">أدر مخزنك بكفاءة واحترافية</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input 
            label="البريد الإلكتروني" 
            type="email" 
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error ? ' ' : undefined}
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>}
          />
          
          <div className="relative">
            <Input 
              label="كلمة المرور" 
              type={showPassword ? 'text' : 'password'} 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={error ? ' ' : undefined}
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 bottom-3 text-text-muted hover:text-text-secondary transition-colors"
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94a10.07 10.07 0 0 1-12.91 0"></path><path d="M1 1l22 22"></path><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"></path><line x1="1" y1="1" x2="23" y2="23"></line><path d="M7.36 7.36a3 3 0 1 0 4.28 4.28"></path></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              )}
            </button>
          </div>

          <Button type="submit" fullWidth className="mt-4 py-3">
            تسجيل الدخول
          </Button>

          <div className="text-center mt-6">
            <p className="text-sm text-text-muted">نظام مغلق - المصرح لهم فقط يمكنهم الدخول</p>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};
