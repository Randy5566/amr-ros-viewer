import { cn } from "@/lib/utils";

export function CodeBlock({
  children,
  className,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-border/60 bg-[#0a1120]", className)}>
      {title && (
        <div className="border-b border-border/60 bg-secondary/40 px-4 py-2 font-mono text-xs text-muted-foreground">
          {title}
        </div>
      )}
      <pre className="scrollbar-thin overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code className="font-mono text-sky-200/90">{children}</code>
      </pre>
    </div>
  );
}
