import { Bot, ExternalLink } from "lucide-react";

const REFS: [string, string][] = [
  ["ROS 2 官方概念文件", "https://docs.ros.org/en/humble/Concepts/Basic.html"],
  ["ROS 2 QoS 設定", "https://docs.ros.org/en/rolling/Concepts/Intermediate/About-Quality-of-Service-Settings.html"],
  ["ROS 2 Managed Nodes／Lifecycle", "https://design.ros2.org/articles/node_lifecycle.html"],
  ["Nav2 官方文件", "https://docs.nav2.org/"],
  ["Nav2 Behavior Trees", "https://docs.nav2.org/behavior_trees/index.html"],
  ["SLAM Toolbox", "https://docs.ros.org/en/humble/p/slam_toolbox/"],
];

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card/30">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Bot className="size-5 text-primary" />
              <span className="font-bold">AMR 底車技術科普</span>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              以互動視覺化理解 ROS 2、LiDAR、SLAM、定位、導航、避障與運動控制原理。
              適用於室內服務型、導覽與巡檢機器人的通用型輪式移動平台。
            </p>
            <p className="mt-4 text-xs text-muted-foreground/60">
              前端技術：React · three.js · Tailwind CSS · shadcn/ui · lucide · framer-motion ·
              Vite · Vitest
            </p>
          </div>
          <div>
            <div className="mb-3 text-sm font-semibold">參考資料</div>
            <ul className="space-y-2">
              {REFS.map(([label, url]) => (
                <li key={url}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {label}
                    <ExternalLink className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
