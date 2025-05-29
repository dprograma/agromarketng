import React, { useState, useEffect, useRef } from "react";
import { ReactElement } from 'react';
import { DialogProps, DialogContentProps, DialogHeaderProps, DialogTitleProps, DialogTriggerProps, ChildProps } from '@/types';
import { cn } from "@/lib/utils";

// Create DialogContext
const DialogContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
} | null>(null);

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
    <DialogContext.Provider value={{ open: isOpen, onOpenChange: onOpenChange ?? (() => {}) }}>
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
    </DialogContext.Provider>
  );
};

const DialogContent: React.FC<DialogContentProps> = ({ children, className }) => {
  return (
    <div className={cn("relative z-50 w-full max-w-lg bg-white rounded-lg shadow-xl p-6", className)}>
      {children}
    </div>
  );
};

const DialogHeader: React.FC<DialogHeaderProps> = ({ children, className }) => {
  return (
    <div className={cn("mb-4", className)}>
      {children}
    </div>
  );
};

const DialogTitle: React.FC<DialogTitleProps> = ({ children, className }) => {
  return (
    <h2 className={cn("text-xl font-semibold text-gray-900", className)}>
      {children}
    </h2>
  );
};

const DialogTrigger: React.FC<DialogTriggerProps> = ({ children, asChild = false }) => {
  const context = React.useContext(DialogContext);

  if (!context) {
    throw new Error('DialogTrigger must be used within a Dialog');
  }

  const { onOpenChange } = context;

  const handleClick = () => {
    onOpenChange(true);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
      onClick: handleClick,
    });
  }

  return (
    <button type="button" onClick={handleClick}>
      {children}
    </button>
  );
};

const DialogDescription: React.FC<DialogContentProps> = ({ children, className }) => {
  return (
    <p className={cn("text-sm text-gray-500 mb-4", className)}>
      {children}
    </p>
  );
};

const DialogFooter: React.FC<DialogContentProps> = ({ children, className }) => {
  return (
    <div className={cn("flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100", className)}>
      {children}
    </div>
  );
};

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter };