import React from 'react';

export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{
        backgroundImage: `radial-gradient(var(--accent-primary) 0.5px, transparent 0.5px)`,
        backgroundSize: '30px 30px'
      }}></div>
      
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-primary/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-secondary/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md page-enter">
        {children}
      </div>
    </div>
  );
};
