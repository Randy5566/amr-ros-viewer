import { useRef } from "react";
import { Canvas2D } from "./Canvas2D";
import { C } from "@/lib/colors";
import { astar, CELL_FREE, CELL_OCCUPIED, type GridPoint } from "@/lib/robotics";

const COLS = 34;
const ROWS = 22;

function baseGrid(): number[][] {
  const g = Array.from({ length: ROWS }, () => new Array(COLS).fill(CELL_FREE));
  const wall = (x: number, y0: number, y1: number) => {
    for (let y = y0; y <= y1; y++) g[y][x] = CELL_OCCUPIED;
  };
  const hwall = (y: number, x0: number, x1: number) => {
    for (let x = x0; x <= x1; x++) g[y][x] = CELL_OCCUPIED;
  };
  wall(10, 0, 14);
  wall(22, 7, 21);
  hwall(11, 16, 27);
  return g;
}

const START: GridPoint = { x: 2, y: 2 };
const GOAL: GridPoint = { x: 31, y: 19 };

export function PathPlanningCanvas() {
  const grid = useRef(baseGrid());
  const path = useRef<GridPoint[]>([]);
  const robotIdx = useRef(0);
  const replanTimer = useRef(0);
  const ped = useRef({ x: 18, y: 5, dir: 1 });

  return (
    <Canvas2D
      ariaLabel="Nav2 導航：全域規劃器以 A* 找出主要路線，遇到動態行人阻擋時重新規劃局部繞行"
      className="h-[320px]"
      draw={(ctx, w, h, dt) => {
        const cw = w / COLS;
        const ch = h / ROWS;

        // 行人（動態障礙）上下移動
        const p = ped.current;
        if (Math.random() < dt * 2) p.y += p.dir;
        if (p.y > 18 || p.y < 3) p.dir *= -1;

        // 工作網格 = 靜態 + 行人膨脹
        const work = grid.current.map((row) => row.slice());
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) {
            const nx = p.x + dx;
            const ny = p.y + dy;
            if (work[ny]?.[nx] !== undefined) work[ny][nx] = CELL_OCCUPIED;
          }

        // 重新規劃
        replanTimer.current += dt;
        const robotCell =
          path.current[robotIdx.current] ?? START;
        if (replanTimer.current > 0.4 || path.current.length === 0) {
          replanTimer.current = 0;
          const newPath = astar(work, robotCell, GOAL);
          if (newPath.length > 0) {
            path.current = newPath;
            robotIdx.current = 0;
          }
        }

        // 沿路徑推進
        if (path.current.length > 1) {
          if (Math.random() < dt * 6)
            robotIdx.current = Math.min(
              robotIdx.current + 1,
              path.current.length - 1,
            );
          if (robotIdx.current >= path.current.length - 1) {
            // 到達，重置
            robotIdx.current = 0;
            path.current = astar(work, START, GOAL);
          }
        }

        // 繪製網格
        ctx.clearRect(0, 0, w, h);
        for (let y = 0; y < ROWS; y++) {
          for (let x = 0; x < COLS; x++) {
            ctx.fillStyle =
              grid.current[y][x] === CELL_OCCUPIED ? "#334155" : "#0f1a2e";
            ctx.fillRect(x * cw, y * ch, cw - 1, ch - 1);
          }
        }

        // 全域路徑
        if (path.current.length > 1) {
          ctx.strokeStyle = C.pathGlobal;
          ctx.lineWidth = 3;
          ctx.beginPath();
          path.current.forEach((n, i) => {
            const X = (n.x + 0.5) * cw;
            const Y = (n.y + 0.5) * ch;
            if (i === 0) ctx.moveTo(X, Y);
            else ctx.lineTo(X, Y);
          });
          ctx.stroke();
        }

        // 起點 / 終點
        marker(ctx, START, cw, ch, C.ok, "起");
        marker(ctx, GOAL, cw, ch, C.laser, "終");

        // 行人
        ctx.beginPath();
        ctx.arc((p.x + 0.5) * cw, (p.y + 0.5) * ch, Math.min(cw, ch) * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = C.human;
        ctx.fill();
        ctx.fillStyle = C.text;
        ctx.font = "10px 'Noto Sans TC', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("人", (p.x + 0.5) * cw, (p.y + 0.5) * ch);

        // 機器人
        const rc = path.current[robotIdx.current] ?? START;
        ctx.beginPath();
        ctx.arc((rc.x + 0.5) * cw, (rc.y + 0.5) * ch, Math.min(cw, ch) * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = C.robot;
        ctx.shadowColor = C.robot;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.textBaseline = "alphabetic";
      }}
    />
  );
}

function marker(
  ctx: CanvasRenderingContext2D,
  cell: GridPoint,
  cw: number,
  ch: number,
  color: string,
  label: string,
) {
  const X = (cell.x + 0.5) * cw;
  const Y = (cell.y + 0.5) * ch;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(X, Y, Math.min(cw, ch) * 0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0b1220";
  ctx.font = "bold 11px 'Noto Sans TC', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, X, Y);
  ctx.textBaseline = "alphabetic";
}
