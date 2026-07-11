import { useRef, useState } from "react";
import { Canvas2D } from "./Canvas2D";
import { C } from "@/lib/colors";
import { Button } from "@/components/ui/button";
import { estimatePose, resampleParticles, type Particle } from "@/lib/robotics";
import { PersonStanding, Sparkles } from "lucide-react";

const N = 320;

function scatter(w: number, h: number): Particle[] {
  return Array.from({ length: N }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    theta: Math.random() * Math.PI * 2,
    weight: 1 / N,
  }));
}

export function ParticleFilterCanvas() {
  const particles = useRef<Particle[]>([]);
  const truth = useRef({ x: 0, y: 0, theta: 0 });
  const size = useRef({ w: 0, h: 0 });
  const tRef = useRef(0);
  const resampleTimer = useRef(0);
  const kidnapReq = useRef(false);
  const convergedRef = useRef(false);
  const [converged, setConverged] = useState(false);
  const setConvergedIfChanged = (v: boolean) => {
    if (convergedRef.current !== v) {
      convergedRef.current = v;
      setConverged(v);
    }
  };

  const kidnap = () => {
    kidnapReq.current = true;
  };

  return (
    <div className="space-y-3">
      <Canvas2D
        ariaLabel="AMCL 粒子濾波定位：大量粒子代表可能位置，與 LiDAR 觀測比對後收斂到最可能位置"
        className="h-[320px]"
        draw={(ctx, w, h, dt) => {
          if (size.current.w !== w || size.current.h !== h) {
            size.current = { w, h };
            if (particles.current.length === 0) {
              particles.current = scatter(w, h);
              truth.current = { x: w * 0.5, y: h * 0.5, theta: 0 };
            }
          }
          ctx.clearRect(0, 0, w, h);
          // 背景格
          ctx.strokeStyle = "rgba(148,163,184,0.06)";
          ctx.lineWidth = 1;
          for (let x = 0; x < w; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
          }
          for (let y = 0; y < h; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
          }

          tRef.current += dt;
          // 真值以 8 字形緩慢移動
          const t = tRef.current * 0.4;
          truth.current = {
            x: w * 0.5 + Math.cos(t) * w * 0.28,
            y: h * 0.5 + Math.sin(t * 2) * h * 0.28,
            theta: t,
          };
          const tp = truth.current;

          if (kidnapReq.current) {
            kidnapReq.current = false;
            particles.current = scatter(w, h); // 全域重定位
            setConvergedIfChanged(false);
          }

          // 預測 + 加權（以與真值距離近似 scan match 分數）
          const ps = particles.current;
          for (const p of ps) {
            p.x += (Math.random() - 0.5) * 6 + Math.cos(tp.theta) * 0.6;
            p.y += (Math.random() - 0.5) * 6 + Math.sin(tp.theta) * 0.6;
            p.x = Math.max(0, Math.min(w, p.x));
            p.y = Math.max(0, Math.min(h, p.y));
            const d = Math.hypot(p.x - tp.x, p.y - tp.y);
            p.weight = Math.exp(-(d * d) / (2 * 60 * 60));
          }

          resampleTimer.current += dt;
          if (resampleTimer.current > 0.25) {
            resampleTimer.current = 0;
            particles.current = resampleParticles(ps).map((p) => ({
              ...p,
              x: p.x + (Math.random() - 0.5) * 10,
              y: p.y + (Math.random() - 0.5) * 10,
            }));
          }

          // 收斂度
          const est = estimatePose(particles.current);
          let spread = 0;
          for (const p of particles.current)
            spread += Math.hypot(p.x - est.x, p.y - est.y);
          spread /= particles.current.length;
          setConvergedIfChanged(spread < 40);

          // 繪製粒子
          for (const p of particles.current) {
            const w2 = p.weight;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2 + w2 * 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(192,132,252,${0.3 + w2 * 0.6})`;
            ctx.fill();
            // 朝向
            ctx.strokeStyle = "rgba(192,132,252,0.35)";
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + Math.cos(p.theta) * 6, p.y + Math.sin(p.theta) * 6);
            ctx.stroke();
          }

          // 估計位置
          drawMarker(ctx, est.x, est.y, C.primary, "估計");
          // 真值
          drawMarker(ctx, tp.x, tp.y, C.ok, "真值");
        }}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm" variant="secondary" onClick={kidnap}>
          <PersonStanding /> 綁架機器人（Kidnapped Robot）
        </Button>
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Sparkles
            className={converged ? "size-4 text-emerald-400" : "size-4 text-amber-400"}
          />
          {converged ? "粒子已收斂 · 定位可信" : "搜尋中 · 全域重定位"}
        </span>
      </div>
    </div>
  );
}

function drawMarker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  label: string,
) {
  ctx.beginPath();
  ctx.arc(x, y, 7, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = color;
  ctx.font = "11px 'Noto Sans TC', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label, x, y - 12);
}
