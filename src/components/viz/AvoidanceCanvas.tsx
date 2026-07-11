import { useRef } from "react";
import { Canvas2D } from "./Canvas2D";
import { C } from "@/lib/colors";

interface Ped {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

/**
 * 分層避障示意：機器人具警告區（減速）與保護區（安全停止）。
 * 行人進入不同區域時，機器人動態調整速度，對應「動態速度與安全區域」概念。
 */
export function AvoidanceCanvas() {
  const robot = useRef({ x: 60, y: 0, speed: 1 });
  const peds = useRef<Ped[]>([]);
  const init = useRef(false);

  return (
    <Canvas2D
      ariaLabel="分層避障：警告區內減速、保護區內安全停止，行人離開後恢復前進"
      className="h-[300px]"
      draw={(ctx, w, h, dt) => {
        if (!init.current) {
          init.current = true;
          robot.current.y = h / 2;
          peds.current = [
            { x: w * 0.5, y: h * 0.2, vx: 0, vy: 40 },
            { x: w * 0.75, y: h * 0.8, vx: -20, vy: -30 },
          ];
        }
        ctx.clearRect(0, 0, w, h);

        // 背景走廊
        ctx.fillStyle = "rgba(148,163,184,0.05)";
        ctx.fillRect(0, h * 0.15, w, h * 0.7);

        const r = robot.current;
        const warnR = 120;
        const protR = 62;

        // 更新行人
        for (const p of peds.current) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          if (p.y < h * 0.15 || p.y > h * 0.85) p.vy *= -1;
          if (p.x < w * 0.35 || p.x > w * 0.95) p.vx *= -1;
        }

        // 判斷最接近行人的距離
        let minDist = Infinity;
        for (const p of peds.current)
          minDist = Math.min(minDist, Math.hypot(p.x - r.x, p.y - r.y));

        let state: "go" | "slow" | "stop";
        let target: number;
        if (minDist < protR) {
          state = "stop";
          target = 0;
        } else if (minDist < warnR) {
          state = "slow";
          target = 30;
        } else {
          state = "go";
          target = 90;
        }
        // 平順加減速
        r.speed += (target - r.speed) * Math.min(1, dt * 3);
        r.x += r.speed * dt;
        if (r.x > w - 40) r.x = 40;

        // 安全區域
        const zoneColor =
          state === "stop"
            ? "rgba(239,68,68,0.18)"
            : state === "slow"
              ? "rgba(245,158,11,0.16)"
              : "rgba(16,185,129,0.12)";
        ctx.beginPath();
        ctx.arc(r.x, r.y, warnR, 0, Math.PI * 2);
        ctx.fillStyle = zoneColor;
        ctx.fill();
        ctx.strokeStyle = "rgba(245,158,11,0.4)";
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(r.x, r.y, protR, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(239,68,68,0.55)";
        ctx.stroke();
        ctx.setLineDash([]);

        // 行人
        for (const p of peds.current) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
          ctx.fillStyle = C.human;
          ctx.fill();
        }

        // 機器人
        ctx.beginPath();
        ctx.arc(r.x, r.y, 16, 0, Math.PI * 2);
        ctx.fillStyle =
          state === "stop" ? C.danger : state === "slow" ? C.warn : C.robot;
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.shadowBlur = 0;

        // 狀態文字
        ctx.font = "bold 14px 'Noto Sans TC', sans-serif";
        ctx.textAlign = "left";
        const label =
          state === "stop"
            ? "保護區有人 → 安全停止"
            : state === "slow"
              ? "警告區有人 → 減速"
              : "路徑淨空 → 正常前進";
        ctx.fillStyle =
          state === "stop" ? C.danger : state === "slow" ? C.warn : C.ok;
        ctx.fillText(label, 16, 28);
        ctx.font = "12px 'JetBrains Mono', monospace";
        ctx.fillStyle = C.muted;
        ctx.fillText(`linear.x ≈ ${(r.speed / 100).toFixed(2)} m/s`, 16, 48);
      }}
    />
  );
}
