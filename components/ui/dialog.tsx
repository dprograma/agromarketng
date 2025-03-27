import React, { useState, useEffect, useRef } from "react";
import { ReactElement } from 'react';
import { DialogProps, DialogContentProps, DialogHeaderProps, DialogTitleProps,  ChildProps } from '@/types';


const Dialog: React.FC<DialogProps> = ({ children, open, onOpenChange }) => {
  const [isOpen, setIsOpen] = useState(open);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onOpenChange?.(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node) && isOpen) {
        onOpenChange?.(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onOpenChange]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" />
      <div ref={dialogRef}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as ReactElement<ChildProps>, {
              isOpen,
              onClose: () => onOpenChange?.(false)
            });
          }
          return child;
        })}
      </div>
    </div>
  );
};

const DialogContent: React.FC<DialogContentProps> = ({ children, className }) => {
  return (
    <div className={`relative z-50 w-full max-w-lg bg-white rounded-lg shadow-xl p-6 ${className}`}>
      {children}
    </div>
  );
};

const DialogHeader: React.FC<DialogHeaderProps> = ({ children, className }) => {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
};

const DialogTitle: React.FC<DialogTitleProps> = ({ children, className }) => {
  return (
    <h2 className={`text-xl font-semibold text-gray-900 ${className}`}>
      {children}
    </h2>
  );
};

export { Dialog, DialogContent, DialogHeader, DialogTitle };