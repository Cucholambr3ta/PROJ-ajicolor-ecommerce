import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "outline" | "secondary" | "destructive";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
        variant === "default" && "border-transparent bg-ajicolor-magenta text-white",
        variant === "outline" && "border-gray-200 text-gray-700",
        variant === "secondary" && "border-transparent bg-gray-100 text-gray-700",
        variant === "destructive" && "border-transparent bg-red-500 text-white",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
