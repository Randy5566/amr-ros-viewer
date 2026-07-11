import { useEffect, useState } from "react";
import { C } from "@/lib/colors";

interface BtNode {
  id: string;
  label: string;
  sub?: string;
  type: "control" | "condition" | "action" | "success";
  x: number;
  y: number;
  w: number;
}

const W = 680;
const H = 380;

const NODES: Record<string, BtNode> = {
  root: { id: "root", label: "? Fallback", sub: "導航任務", type: "control", x: 260, y: 20, w: 160 },
  seqOk: { id: "seqOk", label: "→ Sequence", sub: "正常路徑", type: "control", x: 70, y: 110, w: 150 },
  cond: { id: "cond", label: "是否有有效路徑?", type: "condition", x: 60, y: 200, w: 170 },
  move: { id: "move", label: "沿路徑移動", type: "action", x: 60, y: 290, w: 170 },
  seqRec: { id: "seqRec", label: "→ Sequence", sub: "恢復行為", type: "control", x: 440, y: 110, w: 150 },
  clear: { id: "clear", label: "清除局部成本地圖", type: "action", x: 300, y: 200, w: 150 },
  replan: { id: "replan", label: "重新規劃", type: "action", x: 300, y: 290, w: 150 },
  rotate: { id: "rotate", label: "原地旋轉取得觀測", type: "action", x: 470, y: 200, w: 160 },
  back: { id: "back", label: "後退脫困", type: "action", x: 480, y: 290, w: 150 },
};

const EDGES: [string, string][] = [
  ["root", "seqOk"],
  ["root", "seqRec"],
  ["seqOk", "cond"],
  ["seqOk", "move"],
  ["seqRec", "clear"],
  ["seqRec", "replan"],
  ["seqRec", "rotate"],
  ["seqRec", "back"],
];

// tick 巡訪順序：先試正常路徑（失敗），再逐一執行恢復行為
const TICK_SEQUENCE = [
  "root",
  "seqOk",
  "cond",
  "seqRec",
  "clear",
  "replan",
  "rotate",
  "back",
  "seqOk",
  "cond",
  "move",
];

const typeColor: Record<BtNode["type"], string> = {
  control: "#334155",
  condition: "#7c3aed",
  action: "#0369a1",
  success: "#059669",
};

export function BehaviorTreeViz() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setStep((s) => (s + 1) % TICK_SEQUENCE.length),
      900,
    );
    return () => clearInterval(id);
  }, []);

  const activeId = TICK_SEQUENCE[step];
  // 判斷此步的結果：cond 首次失敗、move 成功
  const isSuccess = activeId === "move";
  const isFail = activeId === "cond" && step < 3;

  return (
    <div className="w-full overflow-hidden rounded-xl border border-border/60 bg-[#0a1120] p-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
        {/* 連線 */}
        {EDGES.map(([from, to]) => {
          const a = NODES[from];
          const b = NODES[to];
          const x1 = a.x + a.w / 2;
          const y1 = a.y + 44;
          const x2 = b.x + b.w / 2;
          const y2 = b.y;
          return (
            <path
              key={`${from}-${to}`}
              d={`M ${x1} ${y1} C ${x1} ${(y1 + y2) / 2}, ${x2} ${(y1 + y2) / 2}, ${x2} ${y2}`}
              fill="none"
              stroke="rgba(148,163,184,0.3)"
              strokeWidth={1.5}
            />
          );
        })}

        {/* 節點 */}
        {Object.values(NODES).map((n) => {
          const active = n.id === activeId;
          const border = active
            ? isSuccess
              ? C.ok
              : isFail
                ? C.danger
                : C.accent
            : "rgba(148,163,184,0.25)";
          return (
            <g key={n.id}>
              <rect
                x={n.x}
                y={n.y}
                width={n.w}
                height={44}
                rx={9}
                fill={typeColor[n.type]}
                stroke={border}
                strokeWidth={active ? 3 : 1.5}
                opacity={active ? 1 : 0.72}
                style={{
                  filter: active
                    ? `drop-shadow(0 0 8px ${border})`
                    : "none",
                  transition: "all 0.25s",
                }}
              />
              <text
                x={n.x + n.w / 2}
                y={n.sub ? n.y + 20 : n.y + 27}
                textAnchor="middle"
                fill="#e2e8f0"
                fontSize={13}
                fontWeight={600}
                fontFamily="'Noto Sans TC', sans-serif"
              >
                {n.label}
              </text>
              {n.sub && (
                <text
                  x={n.x + n.w / 2}
                  y={n.y + 36}
                  textAnchor="middle"
                  fill="rgba(226,232,240,0.6)"
                  fontSize={10}
                  fontFamily="'Noto Sans TC', sans-serif"
                >
                  {n.sub}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
