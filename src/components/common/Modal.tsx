import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  hasCornerAccents?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  size = 'md',
  hasCornerAccents = true,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/60 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Box */}
      <div
        className={cn(
          'relative w-full bg-sand-50 border border-sand-200 rounded-2xl shadow-soft z-10 overflow-hidden my-8',
          sizeClasses[size]
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-sand-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {icon && <span className="text-olive-600">{icon}</span>}
            <div>
              {typeof title === 'string' ? (
                <h3 className="font-sans font-semibold text-base text-ink">
                  {title}
                </h3>
              ) : (
                title
              )}
              {subtitle && (
                <p className="text-sm text-ink-muted mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-faint hover:bg-sand-200 hover:text-ink transition-colors focus:outline-none"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-3.5 bg-sand-50 border-t border-sand-200 flex items-center justify-end space-x-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
