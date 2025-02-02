import { cn } from "@/lib/utils";
import { CardFooterProps } from "@/types";
 
export function Card({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn("bg-white p-4 rounded-2xl shadow-md text-gray-500 font-sans text-sm", className)}>{children}</div>;
}



export function CardHeader({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn("mb-2", className)}>{children}</div>;
}

export function CardContent({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={className}>{children}</div>;
}


export function CardTitle({ children }: React.PropsWithChildren) {
  return <h3 className="text-lg font-semibold">{children}</h3>;
}

export const CardFooter: React.FC<CardFooterProps> = ({ className, children }) => {
  return <div className={`p-4 border-t border-gray-200 ${className}`}>{children}</div>;
};
