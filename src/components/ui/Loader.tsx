import React from 'react';

interface LoaderProps {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Loader: React.FC<LoaderProps> = ({ 
  fullScreen = false, 
  size = 'md' 
}) => {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  const spinner = (
    <div className={`${sizes[size]} border-[var(--border-color)] border-t-[var(--accent-primary)] rounded-full animate-spin`}></div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--bg-primary)]">
        {spinner}
        <p className="mt-4 text-text-secondary font-medium animate-pulse font-Cairo">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4 w-full">
      {spinner}
    </div>
  );
};
