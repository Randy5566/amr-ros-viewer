import { motion } from "framer-motion";
import {
  Radar,
  Compass,
  Route,
  Cpu,
  MoveRight,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LAYERS = [
  {
    id: "sensor",
    title: "感測器",
    icon: Radar,
    color: "text-sky-400",
    ring: "ring-sky-500/40",
    glow: "shadow-sky-500/20",
    items: ["LiDAR", "相機", "IMU", "輪速編碼器", "防撞感測"],
  },
  {
    id: "perception",
    title: "定位與環境感知",
    icon: Compass,
    color: "text-cyan-400",
    ring: "ring-cyan-500/40",
    glow: "shadow-cyan-500/20",
    items: ["里程計", "感測器融合", "SLAM", "地圖定位"],
  },
  {
    id: "planning",
    title: "導航決策",
    icon: Route,
    color: "text-violet-400",
    ring: "ring-violet-500/40",
    glow: "shadow-violet-500/20",
    items: ["全域路徑規劃", "局部路徑規劃", "動態避障", "行為決策"],
  },
  {
    id: "control",
    title: "運動控制",
    icon: Cpu,
    color: "text-amber-400",
    ring: "ring-amber-500/40",
    glow: "shadow-amber-500/20",
    items: ["速度命令", "馬達控制", "驅動器", "輪組"],
  },
] as const;

export function DataFlowDiagram() {
  return (
    <div className="flex flex-col items-stretch gap-1">
      {LAYERS.map((layer, i) => (
        <div key={layer.id}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className={cn(
              "rounded-xl border border-border/60 bg-card/70 p-4 ring-1 backdrop-blur",
              layer.ring,
              "shadow-lg",
              layer.glow,
            )}
          >
            <div className="mb-3 flex items-center gap-2">
              <layer.icon className={cn("size-5", layer.color)} />
              <span className="font-semibold">{layer.title}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {layer.items.map((item) => (
                <span
                  key={item}
                  className="rounded-lg border border-border/60 bg-secondary/50 px-2.5 py-1 text-xs text-muted-foreground"
                >
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
          {i < LAYERS.length - 1 && (
            <div className="flex justify-center py-1">
              <FlowArrow />
            </div>
          )}
        </div>
      ))}
      <div className="flex justify-center py-1">
        <FlowArrow />
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 font-semibold text-emerald-300"
      >
        <MoveRight className="size-5" />
        實際移動
      </motion.div>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="relative flex h-6 w-6 items-center justify-center">
      <ChevronDown className="size-5 text-muted-foreground/40" />
      <motion.span
        className="absolute size-1.5 rounded-full bg-primary"
        animate={{ y: [-8, 8], opacity: [0, 1, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
