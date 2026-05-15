import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = 'px-6 py-2.5 rounded-xl font-bold font-Cairo transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';
  
  // Map to tailwind or custom variables
  const variantClasses = {
    primary: 'bg-[var(--accent-primary)] hover:brightness-110 shadow-lg shadow-blue-500/20 text-white',
    secondary: 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-card)] text-white border border-[var(--border-color)]',
    danger: 'bg-[var(--accent-danger)] hover:brightness-110 shadow-lg shadow-red-500/20 text-white',
    ghost: 'hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-white',
    outline: 'border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:border-[var(--accent-primary)]',
  };

  return (
    <button
      className={`${baseStyles} ${variantClasses[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
