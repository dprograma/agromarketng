import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TableProps {
  className?: string;
  children: ReactNode;
}

export function Table({ className, children }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("min-w-full divide-y divide-gray-200", className)}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className, children }: TableProps) {
  return (
    <thead className={cn("bg-gray-50", className)}>
      <tr>{children}</tr>
    </thead>
  );
}

export function TableBody({ className, children }: TableProps) {
  return <tbody className={cn("bg-white divide-y divide-gray-200", className)}>{children}</tbody>;
}

interface TableRowProps {
  className?: string;
  children: ReactNode;
}

export function TableRow({ className, children }: TableRowProps) {
  return <tr className={cn("hover:bg-gray-50", className)}>{children}</tr>;
}

interface TableCellProps {
  className?: string;
  children: ReactNode;
  isHeader?: boolean;
}

export function TableCell({ className, children, isHeader = false }: TableCellProps) {
  const baseStyles = "px-4 py-2 text-sm font-medium text-gray-900";
  const headerStyles = "text-left text-gray-500 uppercase tracking-wider";
  const cellStyles = isHeader ? headerStyles : "";

  return (
    <td className={cn(baseStyles, cellStyles, className)}>{children}</td>
  );
}
