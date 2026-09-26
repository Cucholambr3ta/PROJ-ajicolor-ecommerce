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
        "inline-flex items-center px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide",
        variant === "default" && "bg-ajicolor-magenta text-white",
        variant === "outline" && "bg-white dark:bg-neutral-900 text-ajicolor-ink border border-ajicolor-ink",
        variant === "secondary" && "bg-ajicolor-yellow text-ajicolor-ink",
        variant === "destructive" && "bg-ajicolor-ink text-white",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
