import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import styles from './Modal.module.scss';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  headerExtra?: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'light' | 'dark';
  showCloseButton?: boolean;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  headerExtra,
  footer,
  size = 'md',
  theme = 'light',
  showCloseButton = true,
  className = '',
  bodyClassName = '',
  children,
}) => {
  // Close on Escape & Lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClass = {
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg,
    xl: styles.sizeXl,
  }[size];

  const themeClass = theme === 'dark' ? styles.darkTheme : '';

  const modalContent = (
    <div
      className={`${styles.backdrop} ${themeClass}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`${styles.modal} ${sizeClass} ${themeClass} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header (if title, headerExtra or close button is needed) */}
        {(title || headerExtra || showCloseButton) && (
          <div className={`${styles.header} ${themeClass}`}>
            <div className={styles.headerMain}>
              {title && (
                typeof title === 'string' ? (
                  <h3 className={styles.title}>{title}</h3>
                ) : (
                  title
                )
              )}
              {headerExtra}
            </div>

            <div className={styles.headerRight}>
              {showCloseButton && (
                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={onClose}
                  title="Закрыть"
                  aria-label="Закрыть модальное окно"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className={`${styles.body} ${themeClass} ${bodyClassName}`}>
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className={`${styles.footer} ${themeClass}`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// Export alias ModalComponent for convenience
export const ModalComponent = Modal;
