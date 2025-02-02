import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TableProps, TableRowProps, TableCellProps, TableHeadProps } from "@/types";


export function Table({ className, children }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full border-collapse", className)}>{children}</table>
    </div>
  );
}

export function TableHeader({ className, children }: TableProps) {
  return <thead className={cn("bg-white divide-y divide-gray-200", className)}>{children}</thead>;
}

export function TableBody({ className, children }: TableProps) {
  return <tbody className={cn("bg-white divide-y divide-gray-200", className)}>{children}</tbody>;
}

export function TableRow({ className, children }: TableRowProps) {
  return <tr className={cn("hover:bg-gray-50", className)}>{children}</tr>;
}

export function TableCell({ className, children, isHeader = false }: TableCellProps) {
  const baseStyles = "px-4 py-3 text-sm text-gray-900"; 
  const headerStyles = "font-semibold bg-gray-100";
  return <td className={cn(baseStyles, isHeader && headerStyles, className)}>{children}</td>;
}

export const TableHead: React.FC<TableHeadProps> = ({ className, children }) => {
  return (
    <th className={cn("px-4 py-3 text-left text-gray-700 font-semibold bg-gray-100", className)}>
      {children}
    </th>
  );
};




