'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ReactNode, useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children?: ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
    sm: '400px',
    md: '540px',
    lg: '720px'
};

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    <motion.div
                        className="modal-container"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        style={{ maxWidth: sizeMap[size] }}
                    >
                        <div className="modal-header">
                            <h2 className="modal-title">{title}</h2>
                            <motion.button
                                className="close-btn"
                                onClick={onClose}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <X size={20} />
                            </motion.button>
                        </div>

                        <div className="modal-content">
                            {children}
                        </div>
                    </motion.div>

                    <style jsx global>{`
            .modal-overlay {
              position: fixed;
              inset: 0;
              background: rgba(0, 0, 0, 0.7);
              backdrop-filter: blur(8px);
              z-index: 200;
            }

            .modal-container {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 90%;
              background: var(--color-bg-secondary);
              border: 1px solid var(--color-border);
              border-radius: var(--radius-xl);
              box-shadow: var(--shadow-lg);
              z-index: 201;
              overflow: hidden;
            }

            .modal-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 20px 24px;
              border-bottom: 1px solid var(--color-border);
            }

            .modal-title {
              font-size: 1.25rem;
              font-weight: 600;
              color: var(--color-text-primary);
            }

            .close-btn {
              width: 36px;
              height: 36px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: var(--color-bg-tertiary);
              border: 1px solid var(--color-border);
              border-radius: var(--radius-md);
              color: var(--color-text-secondary);
              cursor: pointer;
              transition: all var(--transition-fast);
            }

            .close-btn:hover {
              background: var(--color-bg-hover);
              color: var(--color-text-primary);
            }

            .modal-content {
              padding: 24px;
              max-height: 70vh;
              overflow-y: auto;
            }
          `}</style>
                </>
            )}
        </AnimatePresence>
    );
}
