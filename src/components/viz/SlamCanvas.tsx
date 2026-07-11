import { useRef } from "react";
import { Canvas2D } from "./Canvas2D";
import { C } from "@/lib/colors";

const COLS = 44;
const ROWS = 30;

/** 建立真值地圖：外牆 + 內部柱子。true = 障礙。 */
function buildTruth(): boolean[][] {
  const g: boolean[][] = Array.from({ length: ROWS }, () =>
    new Array(COLS).fill(false),
  );
  for (let x = 0; x < COLS; x++) {
    g[0][x] = true;
    g[ROWS - 1][x] = true;
  }
  for (let y = 0; y < ROWS; y++) {
    g[y][0] = true;
    g[y][COLS - 1] = true;
  }
  const box = (cx: number, cy: number, w: number, h: number) => {
    for (let y = cy; y < cy + h; y++)
      for (let x = cx; x < cx + w; x++) if (g[y]?.[x] !== undefined) g[y][x] = true;
  };
  box(13, 8, 3, 3);
  box(30, 6, 3, 8);
  box(9, 20, 10, 2);
  box(30, 20, 4, 4);
  return g;
}

// 機器人巡行路徑（格座標）
const PATH: [number, number][] = [
  [6, 6],
  [37, 6],
  [37, 24],
  [6, 24],
  [6, 6],
];

export function SlamCanvas() {
  const truth = useRef(buildTruth());
  // 揭露地圖：-1 未知、0 自由、1 障礙
  const revealed = useRef<number[][]>(
    Array.from({ length: ROWS }, () => new Array(COLS).fill(-1)),
  );
  const segRef = useRef(0);
  const progRef = useRef(0);
  const loopFlash = useRef(0);

  return (
    <Canvas2D
      ariaLabel="SLAM 建圖：機器人一邊移動一邊以 LiDAR 掃描，逐格建立佔據柵格地圖，走完一圈觸發迴環修正"
      className="h-[340px]"
      draw={(ctx, w, h, dt) => {
        const cw = w / COLS;
        const ch = h / ROWS;

        // 推進機器人
        progRef.current += dt * 0.35;
        if (progRef.current >= 1) {
          progRef.current = 0;
          segRef.current++;
          if (segRef.current >= PATH.length - 1) {
            segRef.current = 0;
            loopFlash.current = 1.2; // 迴環偵測閃光
          }
        }
        const a = PATH[segRef.current];
        const b = PATH[segRef.current + 1] ?? PATH[0];
        const rx = a[0] + (b[0] - a[0]) * progRef.current;
        const ry = a[1] + (b[1] - a[1]) * progRef.current;

        // 掃描：向四周投射射線
        const rays = 90;
        const maxRange = 22;
        for (let i = 0; i < rays; i++) {
          const ang = (i / rays) * Math.PI * 2;
          const dx = Math.cos(ang);
          const dy = Math.sin(ang);
          for (let s = 0.5; s < maxRange; s += 0.5) {
            const gx = Math.round(rx + dx * s);
            const gy = Math.round(ry + dy * s);
            if (gx < 0 || gy < 0 || gx >= COLS || gy >= ROWS) break;
            if (truth.current[gy][gx]) {
              revealed.current[gy][gx] = 1;
              break;
            } else if (revealed.current[gy][gx] !== 1) {
              revealed.current[gy][gx] = 0;
            }
          }
        }

        // 繪製柵格
        for (let y = 0; y < ROWS; y++) {
          for (let x = 0; x < COLS; x++) {
            const v = revealed.current[y][x];
            ctx.fillStyle =
              v === -1 ? "#131c2e" : v === 1 ? "#e2e8f0" : "#16304a";
            ctx.fillRect(x * cw, y * ch, cw + 0.5, ch + 0.5);
          }
        }
        // 障礙格改用深色（黑=障礙）以貼近佔據地圖慣例
        for (let y = 0; y < ROWS; y++) {
          for (let x = 0; x < COLS; x++) {
            if (revealed.current[y][x] === 1) {
              ctx.fillStyle = "#0b1220";
              ctx.fillRect(x * cw, y * ch, cw + 0.5, ch + 0.5);
            }
          }
        }

        // 掃描線扇形
        ctx.strokeStyle = "rgba(244,63,94,0.12)";
        ctx.lineWidth = 1;
        for (let i = 0; i < rays; i += 3) {
          const ang = (i / rays) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(rx * cw, ry * ch);
          ctx.lineTo((rx + Math.cos(ang) * 8) * cw, (ry + Math.sin(ang) * 8) * ch);
          ctx.stroke();
        }

        // 機器人
        ctx.beginPath();
        ctx.arc(rx * cw, ry * ch, Math.min(cw, ch) * 1.1, 0, Math.PI * 2);
        ctx.fillStyle = C.robot;
        ctx.shadowColor = C.robot;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        // 迴環閃光提示
        if (loopFlash.current > 0) {
          loopFlash.current -= dt;
          ctx.fillStyle = `rgba(163,230,53,${Math.max(0, loopFlash.current) * 0.5})`;
          ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = C.path;
          ctx.font = "bold 16px 'Noto Sans TC', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("Loop Closure · 迴環偵測，修正累積誤差", w / 2, h / 2);
        }

        // 圖例
        ctx.font = "11px 'Noto Sans TC', sans-serif";
        ctx.textAlign = "left";
        const leg: [string, string][] = [
          ["可通行", "#16304a"],
          ["障礙", "#0b1220"],
          ["未知", "#131c2e"],
        ];
        let lx = 10;
        leg.forEach(([t, col]) => {
          ctx.fillStyle = col;
          ctx.strokeStyle = C.grid;
          ctx.fillRect(lx, h - 20, 12, 12);
          ctx.strokeRect(lx, h - 20, 12, 12);
          ctx.fillStyle = C.muted;
          ctx.fillText(t, lx + 16, h - 10);
          lx += ctx.measureText(t).width + 44;
        });
      }}
    />
  );
}
