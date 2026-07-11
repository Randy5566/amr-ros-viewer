import { useRef } from "react";
import { Canvas2D } from "./Canvas2D";
import { C } from "@/lib/colors";

/**
 * 感測器融合示意：
 * - 綠色：真實軌跡（地面真值）
 * - 橘色虛線：純輪速里程計，因打滑／輪徑誤差逐漸漂移
 * - 藍色：融合 IMU + LiDAR 定位後，修正回真實位置
 */
export function SensorFusionCanvas() {
  const tRef = useRef(0);
  const truthTrail = useRef<[number, number][]>([]);
  const odomTrail = useRef<[number, number][]>([]);
  const fusedTrail = useRef<[number, number][]>([]);

  return (
    <Canvas2D
      ariaLabel="感測器融合：純里程計逐漸漂移，融合 IMU 與 LiDAR 後修正回真實軌跡"
      className="h-[300px]"
      draw={(ctx, w, h, dt) => {
        ctx.clearRect(0, 0, w, h);
        const cx = w / 2;
        const cy = h / 2;
        const R = Math.min(w, h) * 0.3;

        tRef.current += dt * 0.5;
        const t = tRef.current;

        // 真實位置：李薩茹曲線
        const truth: [number, number] = [
          cx + Math.cos(t) * R * 1.3,
          cy + Math.sin(t * 1.6) * R * 0.75,
        ];
        // 里程計漂移：隨時間累積的旋轉與縮放誤差
        const drift = (t % 20) * 0.06;
        const dxr = (truth[0] - cx) * Math.cos(drift) - (truth[1] - cy) * Math.sin(drift);
        const dyr = (truth[0] - cx) * Math.sin(drift) + (truth[1] - cy) * Math.cos(drift);
        const odom: [number, number] = [
          cx + dxr * (1 + drift * 0.25),
          cy + dyr * (1 + drift * 0.25),
        ];
        // 融合：真值加微量雜訊
        const fused: [number, number] = [
          truth[0] + Math.sin(t * 9) * 3,
          truth[1] + Math.cos(t * 7) * 3,
        ];

        pushTrail(truthTrail.current, truth);
        pushTrail(odomTrail.current, odom);
        pushTrail(fusedTrail.current, fused);
        if ((t % 20) < dt) {
          // 迴環修正：里程計歸位
          odomTrail.current = [];
        }

        drawTrail(ctx, truthTrail.current, C.ok, 2.5, false);
        drawTrail(ctx, odomTrail.current, C.human, 2, true);
        drawTrail(ctx, fusedTrail.current, C.primary, 2, false);

        drawBot(ctx, truth, C.ok);
        drawBot(ctx, odom, C.human);
        drawBot(ctx, fused, C.primary);

        // 誤差連線
        ctx.strokeStyle = "rgba(251,146,60,0.4)";
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(truth[0], truth[1]);
        ctx.lineTo(odom[0], odom[1]);
        ctx.stroke();
        ctx.setLineDash([]);

        legend(ctx, w);
      }}
    />
  );
}

function pushTrail(trail: [number, number][], p: [number, number]) {
  trail.push(p);
  if (trail.length > 260) trail.shift();
}

function drawTrail(
  ctx: CanvasRenderingContext2D,
  trail: [number, number][],
  color: string,
  width: number,
  dashed: boolean,
) {
  if (trail.length < 2) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash(dashed ? [5, 5] : []);
  ctx.beginPath();
  ctx.moveTo(trail[0][0], trail[0][1]);
  for (const p of trail) ctx.lineTo(p[0], p[1]);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawBot(
  ctx: CanvasRenderingContext2D,
  p: [number, number],
  color: string,
) {
  ctx.beginPath();
  ctx.arc(p[0], p[1], 5, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.shadowBlur = 0;
}

function legend(ctx: CanvasRenderingContext2D, w: number) {
  const items: [string, string][] = [
    ["真實軌跡", C.ok],
    ["純里程計（漂移）", C.human],
    ["融合估計", C.primary],
  ];
  ctx.font = "12px 'Noto Sans TC', sans-serif";
  ctx.textAlign = "left";
  let x = 14;
  items.forEach(([label, color]) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, 14, 12, 12);
    ctx.fillStyle = C.muted;
    ctx.fillText(label, x + 18, 24);
    x += ctx.measureText(label).width + 46;
    void w;
  });
}
