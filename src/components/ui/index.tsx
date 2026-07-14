import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import React from 'react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Button ──────────────────────────────────────────────────────────────────

type ButtonVariant = 'default' | 'secondary' | 'outline' | 'destructive' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const buttonVariants: Record<ButtonVariant, string> = {
  default:
    'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline:
    'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  destructive:
    'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  ghost:
    'hover:bg-accent hover:text-accent-foreground',
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
  lg: 'h-10 px-6 text-sm',
  icon: 'h-9 w-9',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      style={{ borderRadius: 'var(--radius)' }}
      {...props}
    />
  )
);
Button.displayName = 'Button';

// ── Card ────────────────────────────────────────────────────────────────────

export const Card = ({ className, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'border border-border bg-card text-card-foreground shadow-sm',
      className
    )}
    style={{ borderRadius: 'var(--radius)', ...style }}
    {...props}
  />
);

export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col gap-1.5 p-6', className)} {...props} />
);

export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
);

export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-6 pt-0', className)} {...props} />
);

// ── Badge ────────────────────────────────────────────────────────────────────

type BadgeVariant = 'default' | 'secondary' | 'success' | 'destructive' | 'outline';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const badgeVariants: Record<BadgeVariant, string> = {
  default: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  destructive: 'bg-destructive text-destructive-foreground',
  outline: 'border border-border text-foreground',
};

export const Badge = ({ className, style, variant = 'default', ...props }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide',
      badgeVariants[variant],
      className
    )}
    style={{ borderRadius: 'var(--radius)', ...style }}
    {...props}
  />
);

// ── Input ────────────────────────────────────────────────────────────────────

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, style, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'flex h-9 w-full border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50',
        className
      )}
      style={{ borderRadius: 'var(--radius)', ...style }}
      {...props}
    />
  )
);
Input.displayName = 'Input';

// ── Label ────────────────────────────────────────────────────────────────────

export const Label = ({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label
    className={cn('text-sm font-medium leading-none peer-disabled:opacity-50', className)}
    {...props}
  />
);

// ── Select ────────────────────────────────────────────────────────────────────

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, style, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'flex h-9 w-full border border-input bg-background px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50',
        className
      )}
      style={{ borderRadius: 'var(--radius)', ...style }}
      {...props}
    />
  )
);
Select.displayName = 'Select';

// ── Dialog ────────────────────────────────────────────────────────────────────

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const Dialog = ({ open, onClose, children, title }: DialogProps) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-md border border-border bg-card p-6 shadow-2xl"
        style={{ borderRadius: 'var(--radius)' }}
      >
        {title && <h2 className="text-lg font-semibold mb-4 tracking-tight">{title}</h2>}
        {children}
      </div>
    </div>
  );
};

// ── Separator ────────────────────────────────────────────────────────────────

export const Separator = ({ className }: { className?: string }) => (
  <div className={cn('h-px bg-border', className)} />
);

// ── Checkbox ─────────────────────────────────────────────────────────────────

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Checkbox = ({ label, className, id, ...props }: CheckboxProps) => (
  <label htmlFor={id} className="inline-flex items-center gap-2 cursor-pointer">
    <input
      id={id}
      type="checkbox"
      className={cn(
        'h-4 w-4 border border-border accent-primary',
        className
      )}
      {...props}
    />
    {label && <span className="text-sm">{label}</span>}
  </label>
);

// ── Tabs ─────────────────────────────────────────────────────────────────────

interface TabsProps {
  value: string;
  onValueChange: (v: string) => void;
  tabs: { value: string; label: string }[];
  children: React.ReactNode;
}

export const Tabs = ({ value, onValueChange, tabs, children }: TabsProps) => (
  <div>
    <div className="flex border-b border-border mb-6 gap-0 overflow-x-auto">
      {tabs.map(tab => (
        <button
          key={tab.value}
          onClick={() => onValueChange(tab.value)}
          className={cn(
            'px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer whitespace-nowrap',
            value === tab.value
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
    {children}
  </div>
);
