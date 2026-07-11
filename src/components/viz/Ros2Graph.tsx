import { useRef } from "react";
import { Canvas2D } from "./Canvas2D";
import { C } from "@/lib/colors";

interface Node {
  id: string;
  label: string;
  nx: number; // 0..1 normalized
  ny: number;
}
interface Edge {
  from: string;
  to: string;
  topic: string;
  hz: number; // 封包速率影響流速
}

const NODES: Node[] = [
  { id: "lidar", label: "/lidar_driver", nx: 0.12, ny: 0.2 },
  { id: "odom", label: "/wheel_odometry", nx: 0.12, ny: 0.8 },
  { id: "loc", label: "/localization", nx: 0.42, ny: 0.5 },
  { id: "planner", label: "/planner_server", nx: 0.68, ny: 0.24 },
  { id: "ctrl", label: "/controller_server", nx: 0.68, ny: 0.76 },
  { id: "motor", label: "/motor_driver", nx: 0.92, ny: 0.5 },
];

const EDGES: Edge[] = [
  { from: "lidar", to: "loc", topic: "/scan", hz: 15 },
  { from: "odom", to: "loc", topic: "/odom", hz: 50 },
  { from: "lidar", to: "planner", topic: "/scan", hz: 15 },
  { from: "loc", to: "planner", topic: "/tf", hz: 30 },
  { from: "loc", to: "ctrl", topic: "/tf", hz: 30 },
  { from: "planner", to: "ctrl", topic: "/plan", hz: 5 },
  { from: "ctrl", to: "motor", topic: "/cmd_vel", hz: 20 },
];

const nodeById = (id: string) => NODES.find((n) => n.id === id)!;

export function Ros2Graph() {
  const packetsRef = useRef(
    EDGES.map(() => Math.random()), // 每條邊一個相位
  );

  return (
    <Canvas2D
      ariaLabel="ROS 2 節點與主題通訊圖：節點以發布／訂閱方式在主題上交換資料"
      className="h-[300px]"
      draw={(ctx, w, h, dt) => {
        ctx.clearRect(0, 0, w, h);
        const NW = 128;
        const NH = 40;
        const px = (n: Node) => n.nx * (w - NW) + NW / 2;
        const py = (n: Node) => n.ny * (h - NH) + NH / 2;

        // 邊與流動封包
        EDGES.forEach((e, i) => {
          const a = nodeById(e.from);
          const b = nodeById(e.to);
          const ax = px(a);
          const ay = py(a);
          const bx = px(b);
          const by = py(b);
          ctx.strokeStyle = "rgba(148,163,184,0.25)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();

          // 主題標籤
          const mx = ax + (bx - ax) * 0.5;
          const my = ay + (by - ay) * 0.5;
          ctx.font = "11px 'JetBrains Mono', monospace";
          ctx.fillStyle = C.accent;
          ctx.textAlign = "center";
          ctx.fillText(e.topic, mx, my - 6);

          // 流動封包
          packetsRef.current[i] =
            (packetsRef.current[i] + dt * (0.15 + e.hz / 120)) % 1;
          const drawPacket = (frac: number) => {
            const t = frac % 1;
            const cx = ax + (bx - ax) * t;
            const cy = ay + (by - ay) * t;
            ctx.beginPath();
            ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = C.primary;
            ctx.shadowColor = C.primary;
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0;
          };
          drawPacket(packetsRef.current[i]);
          drawPacket(packetsRef.current[i] + 0.5);
        });

        // 節點
        NODES.forEach((n) => {
          const x = px(n) - NW / 2;
          const y = py(n) - NH / 2;
          ctx.fillStyle = C.panel;
          ctx.strokeStyle = C.primary;
          ctx.lineWidth = 1.5;
          roundRect(ctx, x, y, NW, NH, 8);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = C.text;
          ctx.font = "12px 'JetBrains Mono', monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(n.label, px(n), py(n));
        });
        ctx.textBaseline = "alphabetic";
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
