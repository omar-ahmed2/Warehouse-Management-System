import React, { useState } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  icon, 
  type,
  className = '', 
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`flex flex-col gap-2 w-full ${className}`}>
      {label && <label className="text-[13px] font-bold text-slate-600 pr-1 font-Cairo text-right">{label}</label>}
      <div className="relative group">
        {icon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-accent-primary">
            {icon}
          </div>
        )}
        <input
          type={inputType}
          className={`
            w-full bg-slate-50 border ${error ? 'border-red-500' : 'border-slate-200'}
            rounded-xl py-3 ${icon ? 'pr-11' : 'px-5'} ${isPassword ? 'pl-12' : 'pl-5'}
            text-slate-800 font-medium font-Tajawal placeholder:text-slate-400
            focus:outline-none focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10
            transition-all duration-200
          `}
          {...props}
        />
        
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-accent-primary transition-colors px-1"
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            )}
          </button>
        )}
      </div>
      {error && <span className="text-[11px] font-bold text-red-500 mt-0.5 px-1 font-Tajawal text-right">{error}</span>}
    </div>
  );
};

