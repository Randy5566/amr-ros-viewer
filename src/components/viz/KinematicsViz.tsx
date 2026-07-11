import { useRef, useState } from "react";
import { Canvas2D } from "./Canvas2D";
import { C } from "@/lib/colors";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw } from "lucide-react";
import {
  twistToWheelSpeeds,
  driveMode,
  integratePose,
  type Pose,
} from "@/lib/robotics";

const WHEEL_SEP = 0.5; // m

export function KinematicsViz() {
  const [linear, setLinear] = useState(0.4);
  const [angular, setAngular] = useState(0.5);
  const twistRef = useRef({ linear, angular });
  twistRef.current = { linear, angular };

  const poseRef = useRef<Pose>({ x: 0, y: 0, theta: -Math.PI / 2 });
  const trail = useRef<[number, number][]>([]);
  const resetReq = useRef(false);

  const wheels = twistToWheelSpeeds({ linear, angular }, WHEEL_SEP);
  const mode = driveMode(wheels);

  return (
    <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
      <Canvas2D
        ariaLabel="差速底車運動學：調整 linear.x 與 angular.z，觀察左右輪速度與機器人軌跡"
        className="h-[320px] rounded-lg border border-border/60 bg-[#0a1120]"
        draw={(ctx, w, h, dt) => {
          const cx = w / 2;
          const cy = h / 2;
          const scale = 40; // px per meter

          if (resetReq.current) {
            resetReq.current = false;
            poseRef.current = { x: 0, y: 0, theta: -Math.PI / 2 };
            trail.current = [];
          }

          poseRef.current = integratePose(poseRef.current, twistRef.current, dt);
          const p = poseRef.current;
          // 邊界環繞
          const lim = (w / 2 - 20) / scale;
          if (Math.abs(p.x) > lim) p.x = -Math.sign(p.x) * lim;
          if (Math.abs(p.y) > (h / 2 - 20) / scale)
            p.y = -Math.sign(p.y) * (h / 2 - 20) / scale;

          const sx = cx + p.x * scale;
          const sy = cy + p.y * scale;
          trail.current.push([sx, sy]);
          if (trail.current.length > 200) trail.current.shift();

          ctx.clearRect(0, 0, w, h);
          // 網格
          ctx.strokeStyle = "rgba(148,163,184,0.06)";
          for (let x = (cx % 40); x < w; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
          }
          for (let y = (cy % 40); y < h; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
          }

          // 軌跡
          if (trail.current.length > 1) {
            ctx.strokeStyle = "rgba(56,189,248,0.4)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            let broke = true;
            for (let i = 0; i < trail.current.length; i++) {
              const [tx, ty] = trail.current[i];
              const prev = trail.current[i - 1];
              if (prev && Math.hypot(tx - prev[0], ty - prev[1]) > 60) {
                broke = true; // 環繞時斷開
              }
              if (broke) {
                ctx.moveTo(tx, ty);
                broke = false;
              } else ctx.lineTo(tx, ty);
            }
            ctx.stroke();
          }

          // 機器人本體
          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate(p.theta);
          ctx.fillStyle = C.robot;
          ctx.strokeStyle = "#0b1220";
          ctx.lineWidth = 2;
          roundRect(ctx, -18, -14, 36, 28, 6);
          ctx.fill();
          ctx.stroke();
          // 朝向箭頭
          ctx.fillStyle = "#0b1220";
          ctx.beginPath();
          ctx.moveTo(6, 0);
          ctx.lineTo(-4, -6);
          ctx.lineTo(-4, 6);
          ctx.closePath();
          ctx.fill();
          // 左右輪（顏色表示速度）
          drawWheel(ctx, -14, wheels.left);
          drawWheel(ctx, 14, wheels.right);
          ctx.restore();
        }}
      />

      <div className="space-y-4">
        <Slider
          label="linear.x（前進速度）"
          value={linear}
          min={-0.6}
          max={0.6}
          onChange={setLinear}
          unit="m/s"
        />
        <Slider
          label="angular.z（旋轉速度）"
          value={angular}
          min={-1.2}
          max={1.2}
          onChange={setAngular}
          unit="rad/s"
        />

        <div className="rounded-lg border border-border/60 bg-secondary/30 p-4 font-mono text-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-muted-foreground">運動模式</span>
            <Badge variant="accent">{mode}</Badge>
          </div>
          <WheelRow label="左輪 vL" value={wheels.left} />
          <WheelRow label="右輪 vR" value={wheels.right} />
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            vL = linear.x − ω·b/2 ；vR = linear.x + ω·b/2（輪距 b = {WHEEL_SEP} m）
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => (resetReq.current = true)}
          className="w-full"
        >
          <RotateCcw /> 重設位置
        </Button>
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  onChange,
  unit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  unit: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-mono text-primary">
          {value.toFixed(2)} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={0.05}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-sky-500"
        aria-label={label}
      />
    </div>
  );
}

function WheelRow({ label, value }: { label: string; value: number }) {
  const pct = Math.min(100, (Math.abs(value) / 1) * 100);
  const color = value >= 0 ? "bg-sky-500" : "bg-rose-500";
  return (
    <div className="mb-2 flex items-center gap-3">
      <span className="w-16 text-muted-foreground">{label}</span>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-secondary">
        <div
          className={`absolute top-0 h-full rounded-full ${color}`}
          style={{ width: `${pct}%`, left: value >= 0 ? "50%" : undefined, right: value < 0 ? "50%" : undefined }}
        />
        <div className="absolute left-1/2 top-0 h-full w-px bg-border" />
      </div>
      <span className="w-16 text-right tabular-nums">{value.toFixed(2)}</span>
    </div>
  );
}

function drawWheel(
  ctx: CanvasRenderingContext2D,
  offy: number,
  speed: number,
) {
  const intensity = Math.min(1, Math.abs(speed));
  ctx.fillStyle =
    speed >= 0
      ? `rgba(14,165,233,${0.4 + intensity * 0.6})`
      : `rgba(244,63,94,${0.4 + intensity * 0.6})`;
  ctx.fillRect(-6, offy - 4, 12, 8);
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
