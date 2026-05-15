import React from 'react';

type BadgeColor = 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'teal' | 'muted';

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  withDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  color = 'primary', 
  withDot = false 
}) => {
  const colors = {
    primary: 'bg-accent-primary/15 text-accent-primary border-accent-primary/20',
    success: 'bg-accent-success/15 text-accent-success border-accent-success/20',
    warning: 'bg-accent-warning/15 text-accent-warning border-accent-warning/20',
    danger: 'bg-accent-danger/15 text-accent-danger border-accent-danger/20',
    purple: 'bg-accent-purple/15 text-accent-purple border-accent-purple/20',
    teal: 'bg-accent-teal/15 text-accent-teal border-accent-teal/20',
    muted: 'bg-text-muted/15 text-text-muted border-text-muted/20',
  };

  const dots = {
    primary: 'bg-accent-primary',
    success: 'bg-accent-success',
    warning: 'bg-accent-warning',
    danger: 'bg-accent-danger',
    purple: 'bg-accent-purple',
    teal: 'bg-accent-teal',
    muted: 'bg-text-muted',
  };

  const mappedColors = {
    primary: 'bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] border-[var(--accent-primary)]/20',
    success: 'bg-[var(--accent-success)]/15 text-[var(--accent-success)] border-[var(--accent-success)]/20',
    warning: 'bg-[var(--accent-warning)]/15 text-[var(--accent-warning)] border-[var(--accent-warning)]/20',
    danger: 'bg-[var(--accent-danger)]/15 text-[var(--accent-danger)] border-[var(--accent-danger)]/20',
    purple: 'bg-[var(--accent-purple)]/15 text-[var(--accent-purple)] border-[var(--accent-purple)]/20',
    teal: 'bg-[var(--accent-teal)]/15 text-[var(--accent-teal)] border-[var(--accent-teal)]/20',
    muted: 'bg-[var(--text-muted)]/15 text-[var(--text-muted)] border-[var(--text-muted)]/20',
  };

  const mappedDots = {
    primary: 'bg-[var(--accent-primary)]',
    success: 'bg-[var(--accent-success)]',
    warning: 'bg-[var(--accent-warning)]',
    danger: 'bg-[var(--accent-danger)]',
    purple: 'bg-[var(--accent-purple)]',
    teal: 'bg-[var(--accent-teal)]',
    muted: 'bg-[var(--text-muted)]',
  };

  return (
    <span className={`
      inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-badge)] 
      text-xs font-bold border ${mappedColors[color]}
    `}>
      {withDot && <span className={`w-1.5 h-1.5 rounded-full ${mappedDots[color]}`}></span>}
      {children}
    </span>
  );
};
