import { useRef } from "react";
import { Canvas2D } from "./Canvas2D";
import { C } from "@/lib/colors";

interface Node {
  id: string;
  label: string;
}
interface Edge {
  from: string;
  to: string;
  topic: string;
  hz: number; // 封包速率影響流速
}

const NODES: Node[] = [
  { id: "lidar", label: "/lidar_driver" },
  { id: "odom", label: "/wheel_odometry" },
  { id: "loc", label: "/localization" },
  { id: "planner", label: "/planner_server" },
  { id: "ctrl", label: "/controller_server" },
  { id: "motor", label: "/motor_driver" },
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

// 兩種版面：寬螢幕水平流、窄螢幕垂直流（避免節點重疊）
type Pos = Record<string, [number, number]>; // 正規化中心座標
const WIDE: Pos = {
  lidar: [0.12, 0.2],
  odom: [0.12, 0.8],
  loc: [0.4, 0.5],
  planner: [0.67, 0.22],
  ctrl: [0.67, 0.78],
  motor: [0.9, 0.5],
};
const COMPACT: Pos = {
  lidar: [0.27, 0.11],
  odom: [0.73, 0.11],
  loc: [0.5, 0.37],
  planner: [0.28, 0.63],
  ctrl: [0.72, 0.63],
  motor: [0.5, 0.89],
};

export function Ros2Graph() {
  const packetsRef = useRef(EDGES.map(() => Math.random()));

  return (
    <Canvas2D
      ariaLabel="ROS 2 節點與主題通訊圖：節點以發布／訂閱方式在主題上交換資料"
      className="h-[440px] md:h-[300px]"
      draw={(ctx, w, h, dt) => {
        ctx.clearRect(0, 0, w, h);
        const compact = w < 520;
        const layout = compact ? COMPACT : WIDE;
        const NW = compact ? Math.min(w * 0.42, 150) : 132;
        const NH = compact ? 34 : 40;
        const nodeFont = compact ? 11 : 12;
        const topicFont = compact ? 9 : 11;

        const cx = (id: string) => layout[id][0] * w;
        const cy = (id: string) => layout[id][1] * h;

        // 邊與流動封包
        EDGES.forEach((e, i) => {
          const ax = cx(e.from);
          const ay = cy(e.from);
          const bx = cx(e.to);
          const by = cy(e.to);
          ctx.strokeStyle = "rgba(148,163,184,0.28)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();

          // 主題標籤（窄版靠近來源端，減少與節點重疊）
          const tf = compact ? 0.34 : 0.5;
          const mx = ax + (bx - ax) * tf;
          const my = ay + (by - ay) * tf;
          ctx.font = `${topicFont}px 'JetBrains Mono', monospace`;
          ctx.fillStyle = C.accent;
          ctx.textAlign = "center";
          // 標籤底色，避免壓在線上看不清
          const tw = ctx.measureText(e.topic).width;
          ctx.fillStyle = "rgba(11,18,32,0.85)";
          ctx.fillRect(mx - tw / 2 - 2, my - topicFont - 3, tw + 4, topicFont + 4);
          ctx.fillStyle = C.accent;
          ctx.fillText(e.topic, mx, my - 3);

          // 流動封包
          packetsRef.current[i] =
            (packetsRef.current[i] + dt * (0.15 + e.hz / 120)) % 1;
          const drawPacket = (frac: number) => {
            const t = frac % 1;
            const px = ax + (bx - ax) * t;
            const py = ay + (by - ay) * t;
            ctx.beginPath();
            ctx.arc(px, py, 3.5, 0, Math.PI * 2);
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
        ctx.textBaseline = "middle";
        NODES.forEach((n) => {
          const centerX = cx(n.id);
          const centerY = cy(n.id);
          const x = centerX - NW / 2;
          const y = centerY - NH / 2;
          ctx.fillStyle = C.panel;
          ctx.strokeStyle = C.primary;
          ctx.lineWidth = 1.5;
          roundRect(ctx, x, y, NW, NH, 8);
          ctx.fill();
          ctx.stroke();

          // 標籤自動縮放以塞進節點框
          let fs = nodeFont;
          ctx.font = `${fs}px 'JetBrains Mono', monospace`;
          while (ctx.measureText(n.label).width > NW - 12 && fs > 8) {
            fs -= 0.5;
            ctx.font = `${fs}px 'JetBrains Mono', monospace`;
          }
          ctx.fillStyle = C.text;
          ctx.textAlign = "center";
          ctx.fillText(n.label, centerX, centerY);
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
