import { Info, AlertTriangle, ShieldAlert, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "info" | "warning" | "danger" | "tip";

const styles: Record<Variant, { border: string; bg: string; icon: typeof Info; color: string }> = {
  info: { border: "border-sky-500/40", bg: "bg-sky-500/5", icon: Info, color: "text-sky-400" },
  warning: { border: "border-amber-500/40", bg: "bg-amber-500/5", icon: AlertTriangle, color: "text-amber-400" },
  danger: { border: "border-rose-500/40", bg: "bg-rose-500/5", icon: ShieldAlert, color: "text-rose-400" },
  tip: { border: "border-emerald-500/40", bg: "bg-emerald-500/5", icon: Lightbulb, color: "text-emerald-400" },
};

export function Callout({
  variant = "info",
  title,
  children,
}: {
  variant?: Variant;
  title?: string;
  children: React.ReactNode;
}) {
  const s = styles[variant];
  const Icon = s.icon;
  return (
    <div className={cn("rounded-xl border p-4", s.border, s.bg)}>
      <div className="flex gap-3">
        <Icon className={cn("mt-0.5 size-5 shrink-0", s.color)} />
        <div className="space-y-1 text-sm leading-relaxed">
          {title && <div className={cn("font-semibold", s.color)}>{title}</div>}
          <div className="text-foreground/90">{children}</div>
        </div>
      </div>
    </div>
  );
}
