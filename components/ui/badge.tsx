import React from "react";
import clsx from "clsx";

interface BadgeProps {
  variant?: "default" | "success" | "warning" | "error";
  className?: string;
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({ variant = "default", className, children }) => {
  const baseStyles = "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium";
  const variantStyles = {
    default: "bg-gray-200 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
  };

  return <span className={clsx(baseStyles, variantStyles[variant], className)}>{children}</span>;
};

export { Badge };
