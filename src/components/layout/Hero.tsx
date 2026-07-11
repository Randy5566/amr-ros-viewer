import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Bot, ChevronDown, Loader2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const LidarScene3D = lazy(() =>
  import("@/components/viz/LidarScene3D").then((m) => ({
    default: m.LidarScene3D,
  })),
);

const STATS = [
  { k: "6", label: "核心子系統" },
  { k: "13", label: "互動視覺化章節" },
  { k: "ROS 2", label: "軟體骨幹" },
];

export function Hero() {
  return (
    <header className="relative overflow-hidden border-b border-border/40 bg-grid">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-background" />
      <div className="pointer-events-none absolute -left-32 top-0 size-96 rounded-full bg-primary/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 size-96 rounded-full bg-accent/10 blur-[120px]" />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-16 md:py-24 lg:grid-cols-2 lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge className="mb-5 gap-1.5" variant="accent">
            <Sparkles className="size-3.5" />
            室內服務・導覽・巡檢型 AMR
          </Badge>
          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
            <span className="text-gradient">AMR 底車</span>
            <br />
            技術科普視覺化
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            底車不是只有輪子。從 LiDAR 感測、SLAM 建圖、粒子濾波定位，到
            Nav2 導航、成本地圖、分層避障與差速運動控制——
            以可互動的動畫，一步步看懂自主移動機器人的運作原理。
          </p>

          <div className="mt-8 flex items-center gap-2">
            <Bot className="size-5 text-primary" />
            <span className="text-sm text-muted-foreground">
              核心任務：知道自己在哪 · 找到路徑 · 安全避障 · 異常可恢復
            </span>
          </div>

          <div className="mt-8 flex gap-8">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold text-primary md:text-3xl">
                  {s.k}
                </div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <Suspense
            fallback={
              <div className="flex h-[420px] items-center justify-center rounded-xl border border-border/60 bg-[#070d18] text-muted-foreground">
                <Loader2 className="size-6 animate-spin" />
              </div>
            }
          >
            <LidarScene3D />
          </Suspense>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            three.js · 機器人以 2D LiDAR 掃描室內，紅點為即時累積的 /scan 點雲
          </p>
        </motion.div>
      </div>

      <div className="relative flex justify-center pb-8">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="flex flex-col items-center gap-1 text-muted-foreground/60"
        >
          <span className="text-xs">向下捲動探索</span>
          <ChevronDown className="size-4" />
        </motion.div>
      </div>
    </header>
  );
}
