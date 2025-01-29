import { cn } from "@/lib/utils";

export function Card({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn("bg-white p-4 rounded-2xl shadow-md text-gray-500 font-sans text-sm", className)}>{children}</div>;
}

export function CardHeader({ children }: React.PropsWithChildren) {
  return <div className="mb-2">{children}</div>;
}

export function CardTitle({ children }: React.PropsWithChildren) {
  return <h3 className="text-lg font-semibold">{children}</h3>;
}

export function CardContent({ children }: React.PropsWithChildren) {
  return <div>{children}</div>;
}
