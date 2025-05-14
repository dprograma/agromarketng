import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, ReactNode } from "react";
import { ButtonProps } from "@/types";


export function Button({ children, className, variant = "default", ...props }: ButtonProps) {
  const baseStyles = "px-4 py-2 rounded-md font-medium text-sm transition-all";
  const variants = {
    default: "bg-green-500 text-white hover:bg-green-600",
    outline: "border border-green-500 text-green-500 hover:bg-green-100",
    ghost: "text-gray-700 hover:bg-gray-200", 
    destructive: "bg-red-500 text-white hover:bg-red-600",
  };

  return (
    <button className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}
