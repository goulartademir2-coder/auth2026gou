'use client';

import { motion } from 'framer-motion';
import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
  onClick?: any;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      className={`btn btn-${variant} btn-${size}`}
      disabled={disabled || loading}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      {...props as any}
    >
      {loading ? (
        <Loader2 size={18} className="spin" />
      ) : icon ? (
        <span className="btn-icon">{icon}</span>
      ) : null}
      <span>{children}</span>

      <style jsx global>{`
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 500;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
          position: relative;
          overflow: hidden;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-sm {
          padding: 8px 16px;
          font-size: 0.813rem;
        }

        .btn-md {
          padding: 10px 20px;
          font-size: 0.875rem;
        }

        .btn-lg {
          padding: 12px 24px;
          font-size: 1rem;
        }

        .btn-primary {
          background: var(--gradient-primary);
          color: white;
        }

        .btn-secondary {
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          color: var(--color-text-primary);
        }

        .btn-secondary:hover:not(:disabled) {
          background: var(--color-bg-hover);
        }

        .btn-danger {
          background: var(--gradient-danger);
          color: white;
        }

        .btn-success {
          background: var(--gradient-success);
          color: white;
        }

        .btn-ghost {
          background: transparent;
          color: var(--color-text-secondary);
        }

        .btn-ghost:hover:not(:disabled) {
          background: var(--color-bg-hover);
          color: var(--color-text-primary);
        }

        .btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0);
          transition: background var(--transition-fast);
        }

        .btn:hover:not(:disabled)::before {
          background: rgba(255, 255, 255, 0.1);
        }

        .btn-icon {
          display: flex;
          align-items: center;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.button>
  );
}
