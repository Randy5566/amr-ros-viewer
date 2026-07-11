import { useMemo, useRef, useState } from "react";
import { Canvas2D } from "./Canvas2D";
import { CELL_FREE, CELL_OCCUPIED, inflateCostmap } from "@/lib/robotics";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

const COLS = 40;
const ROWS = 22;

function baseGrid(): number[][] {
  const g = Array.from({ length: ROWS }, () => new Array(COLS).fill(CELL_FREE));
  const box = (cx: number, cy: number, w: number, h: number) => {
    for (let y = cy; y < cy + h; y++)
      for (let x = cx; x < cx + w; x++) if (g[y]?.[x] !== undefined) g[y][x] = CELL_OCCUPIED;
  };
  // 兩道牆之間留下一條走廊
  box(14, 0, 2, 9);
  box(14, 13, 2, 9);
  box(28, 4, 3, 3);
  box(6, 15, 4, 2);
  return g;
}

export function CostmapCanvas() {
  const grid = useMemo(baseGrid, []);
  const [radius, setRadius] = useState(3);
  const cost = useMemo(() => inflateCostmap(grid, radius), [grid, radius]);
  const costRef = useRef(cost);
  costRef.current = cost;

  // 走廊寬度為 4 格，判斷是否被膨脹封死
  const corridorBlocked = radius >= 4;

  return (
    <div className="space-y-3">
      <Canvas2D
        animate={false}
        redrawKey={radius}
        ariaLabel="Costmap 膨脹層：障礙周圍建立成本漸層，保留機身寬度與安全距離"
        className="h-[280px]"
        draw={(ctx, w, h) => {
          const cw = w / COLS;
          const ch = h / ROWS;
          ctx.clearRect(0, 0, w, h);
          const cst = costRef.current;
          for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
              const c = cst[y][x];
              if (grid[y][x] === CELL_OCCUPIED) {
                ctx.fillStyle = "#e2e8f0";
              } else if (c > 0) {
                // 高成本紅、低成本藍的漸層
                const r = Math.round(60 + c * 195);
                const b = Math.round(220 - c * 160);
                ctx.fillStyle = `rgba(${r}, ${Math.round(120 - c * 60)}, ${b}, ${0.25 + c * 0.6})`;
              } else {
                ctx.fillStyle = "#0f1a2e";
              }
              ctx.fillRect(x * cw, y * ch, cw - 0.5, ch - 0.5);
            }
          }
        }}
      />
      <div className="rounded-lg border border-border/60 bg-secondary/30 p-4">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium">
            膨脹半徑 inflation_radius
          </label>
          <span className="font-mono text-sm text-primary">
            {(radius * 0.05).toFixed(2)} m（{radius} 格）
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={6}
          step={1}
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="w-full accent-sky-500"
          aria-label="調整膨脹半徑"
        />
        <div className="mt-3">
          {corridorBlocked ? (
            <Badge variant="danger" className="gap-1.5">
              <AlertTriangle className="size-3.5" />
              膨脹過大：狹窄走廊被判定不可通行，路徑將繞遠或卡住
            </Badge>
          ) : radius <= 1 ? (
            <Badge variant="warning" className="gap-1.5">
              <AlertTriangle className="size-3.5" />
              膨脹過小：機器人容易貼牆，高機身可能擦撞、乘客感到不安
            </Badge>
          ) : (
            <Badge variant="success" className="gap-1.5">
              <CheckCircle2 className="size-3.5" />
              適中：保留安全距離，同時維持走廊可通行
            </Badge>
          )}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Costmap 不把機器人視為一個點，而是以膨脹層保留機身寬度與安全緩衝。
          <span className="text-slate-300"> 白＝障礙核心</span>、
          <span className="text-rose-300"> 紅＝高成本</span>、
          <span className="text-sky-300"> 藍＝低成本</span>。
        </p>
      </div>
    </div>
  );
}
