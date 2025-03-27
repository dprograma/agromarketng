import React, { useState, useEffect, useRef } from "react";
import { ReactElement, ReactNode } from 'react';
import { DropdownMenuProps, DropdownMenuTriggerProps, DropdownMenuContentProps, DropdownMenuItemProps, DisableableDropdownMenuItemProps } from "@/types";

type ChildProps = {
  onClick?: () => void;
  isOpen?: boolean;
};


const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={menuRef}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === DropdownMenuTrigger) {
          return React.cloneElement(child as ReactElement<ChildProps>, { onClick: () => setIsOpen((prev) => !prev) });
        }
        if (React.isValidElement(child) && child.type === DropdownMenuContent) {
          return React.cloneElement(child as ReactElement<ChildProps>, { isOpen });
        }
        return child;
      })}
    </div>
  );
};

const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({ className, children, onClick }) => {
  return (
    <div className={`cursor-pointer ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};

const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({ className, children, isOpen }) => {
  return (
    isOpen && (
      <div className={`absolute right-0 -top-20 mt-2 w-48 bg-white shadow-md rounded-md p-2 z-50 ${className}`}>
        {children}
      </div>
    )
  );
};

const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({ className, children, onClick }) => {
  return (
    <button
      className={`block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const DisableableDropdownMenuItem: React.FC<DisableableDropdownMenuItemProps> = ({ 
  disabled = false, 
  onClick, 
  children, 
  className 
}) => {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 ${className} ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      {children}
    </button>
  );
};

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DisableableDropdownMenuItem };
