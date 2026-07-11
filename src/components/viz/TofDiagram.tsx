import { useRef } from "react";
import { Canvas2D } from "./Canvas2D";
import { C } from "@/lib/colors";

/**
 * ToF 飛時測距示意：脈衝自感測器射出 → 打到物體 → 反射回來。
 * 標示「距離 = 光速 × 來回時間 ÷ 2」。
 */
export function TofDiagram() {
  const phaseRef = useRef(0); // 0..2 :去程 0..1, 回程 1..2

  return (
    <Canvas2D
      ariaLabel="ToF 飛時測距原理：脈衝去程與回程，距離等於光速乘來回時間除以二"
      className="h-[220px]"
      draw={(ctx, w, h, dt) => {
        ctx.clearRect(0, 0, w, h);
        const cy = h / 2;
        const sx = w * 0.12; // 感測器
        const ox = w * 0.82; // 物體
        const span = ox - sx;

        // 基準線
        ctx.strokeStyle = "rgba(148,163,184,0.2)";
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(sx, cy);
        ctx.lineTo(ox, cy);
        ctx.stroke();
        ctx.setLineDash([]);

        // 進度
        phaseRef.current = (phaseRef.current + dt * 0.7) % 2;
        const p = phaseRef.current;
        let pulseX: number;
        let outbound: boolean;
        if (p < 1) {
          pulseX = sx + span * p;
          outbound = true;
        } else {
          pulseX = ox - span * (p - 1);
          outbound = false;
        }

        // 已行進的軌跡
        ctx.strokeStyle = outbound ? C.laser : C.accent;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        if (outbound) {
          ctx.moveTo(sx, cy);
          ctx.lineTo(pulseX, cy);
        } else {
          ctx.moveTo(sx, cy - 5);
          ctx.lineTo(ox, cy - 5);
          ctx.moveTo(ox, cy + 5);
          ctx.lineTo(pulseX, cy + 5);
        }
        ctx.stroke();

        // 脈衝
        ctx.beginPath();
        ctx.arc(pulseX, outbound ? cy : cy + 5, 6, 0, Math.PI * 2);
        ctx.fillStyle = outbound ? C.laser : C.accent;
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.shadowBlur = 0;

        // 感測器
        ctx.fillStyle = C.primary;
        roundRect(ctx, sx - 26, cy - 22, 26, 44, 6);
        ctx.fill();
        ctx.fillStyle = C.text;
        ctx.font = "12px 'Noto Sans TC', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("LiDAR", sx - 13, cy + 40);

        // 物體
        ctx.fillStyle = C.obstacle;
        roundRect(ctx, ox, cy - 34, 26, 68, 6);
        ctx.fill();
        ctx.fillStyle = C.muted;
        ctx.fillText("物體", ox + 13, cy + 52);

        // 公式與階段
        ctx.font = "13px 'JetBrains Mono', monospace";
        ctx.fillStyle = C.text;
        ctx.textAlign = "left";
        ctx.fillText("距離 = 光速 × 來回時間 ÷ 2", sx, 26);
        ctx.fillStyle = outbound ? C.laser : C.accent;
        ctx.font = "12px 'Noto Sans TC', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(
          outbound ? "去程：感測器 → 物體" : "回程：物體 → 感測器",
          w / 2,
          h - 14,
        );
      }}
    />
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
