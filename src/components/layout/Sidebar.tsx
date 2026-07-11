import { useState } from "react";
import { NAV } from "@/content/nav";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { cn } from "@/lib/utils";
import { Bot, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const active = useScrollSpy(NAV.map((n) => n.id));
  const [open, setOpen] = useState(false);

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  return (
    <>
      {/* 手機頂部列 */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border/60 bg-background/85 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-2">
          <Bot className="size-5 text-primary" />
          <span className="text-sm font-semibold">AMR 底車技術科普</span>
        </div>
        <Button size="icon" variant="ghost" onClick={() => setOpen((o) => !o)}>
          {open ? <X /> : <Menu />}
        </Button>
      </div>

      {/* 側邊導覽 */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 shrink-0 border-r border-border/60 bg-background/80 backdrop-blur-xl transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="hidden items-center gap-2.5 border-b border-border/60 px-5 py-5 lg:flex">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Bot className="size-5" />
            </div>
            <div>
              <div className="text-sm font-bold leading-tight">AMR 底車技術</div>
              <div className="text-xs text-muted-foreground">互動科普視覺化</div>
            </div>
          </div>

          <nav className="scrollbar-thin flex-1 space-y-0.5 overflow-y-auto p-3">
            {NAV.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => go(item.id)}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4 shrink-0",
                      isActive ? "text-primary" : "text-muted-foreground/70",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] opacity-50">
                        {item.no}
                      </span>
                      <span className="truncate text-sm font-medium">
                        {item.title}
                      </span>
                    </div>
                    <div className="truncate text-[11px] text-muted-foreground/60">
                      {item.short}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>

          <div className="border-t border-border/60 p-4 text-[11px] leading-relaxed text-muted-foreground/70">
            以互動視覺化理解 ROS 2、LiDAR、SLAM、
            定位、導航、避障與運動控制原理。
          </div>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
