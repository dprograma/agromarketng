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

const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({ className, children, isOpen, align = "right", sideOffset = 5, avoidCollisions = true, collisionPadding = 10 }) => {
  const alignmentClass = align === "right" ? "right-0" : align === "left" ? "left-0" : "left-1/2 -translate-x-1/2";

  return (
    isOpen && (
      <div
        className={`absolute ${alignmentClass} bottom-full mb-1 min-w-[160px] bg-white border border-gray-200 shadow-lg rounded-md z-[60] py-1 ${className}`}
        style={{
          marginBottom: `${sideOffset}px`,
          transform: align === "center" ? "translateX(-50%)" : undefined
        }}
      >
        {children}
      </div>
    )
  );
};

const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({ className, children, onClick }) => {
  return (
    <button
      className={`flex items-center w-full px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 rounded-sm transition-colors ${className}`}
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
      className={`flex items-center w-full px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 rounded-sm transition-colors ${className} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
    >
      {children}
    </button>
  );
};

const DropdownMenuLabel: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children
}) => {
  return (
    <div className={`px-4 py-2 text-sm font-medium text-gray-700 ${className}`}>
      {children}
    </div>
  );
};

const DropdownMenuSeparator: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`h-px my-1 mx-1 bg-gray-200 ${className}`} />
  );
};

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DisableableDropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator };
