import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, ReactNode } from "react";
import { ButtonProps } from "@/types";

export function Button({ children, className, variant = "default", size = "default", ...props }: ButtonProps) {
  const baseStyles = "rounded-md font-medium transition-all";
  const variants = {
    default: "bg-green-500 text-white hover:bg-green-600",
    outline: "border border-green-500 text-green-500 hover:bg-green-100",
    ghost: "text-gray-700 hover:bg-gray-200",
    destructive: "bg-red-500 text-white hover:bg-red-600",
    link: "text-green-500 hover:text-green-600 underline-offset-4 hover:underline",
  };
  const sizes = {
    default: "px-4 py-2 text-sm",
    sm: "px-3 py-1.5 text-xs",
    lg: "px-6 py-3 text-base",
    icon: "h-8 w-8 p-0",
  };

  return (
    <button className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}
