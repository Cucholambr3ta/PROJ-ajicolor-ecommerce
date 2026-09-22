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
        "inline-flex items-center px-2.5 py-0.5 text-xs font-black uppercase italic border-2 border-ajicolor-ink",
        variant === "default" && "bg-ajicolor-magenta text-white",
        variant === "outline" && "bg-white text-ajicolor-ink",
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
