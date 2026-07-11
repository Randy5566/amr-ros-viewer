import { Section } from "@/components/layout/Section";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NAV } from "@/content/nav";
import {
  Layers,
  Brain,
  Users,
  Gauge,
  Scale,
  Stethoscope,
  Boxes,
  RefreshCw,
  Network,
  Cloud,
  ServerCog,
  Lock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Item {
  icon: LucideIcon;
  no: string;
  title: string;
  desc: string;
}

const ITEMS: Item[] = [
  { icon: Layers, no: "15.1", title: "多模態感測融合", desc: "2D LiDAR + 深度相機 + 超音波/ToF + IMU + 機械防撞，建立可信度融合與失效降級。" },
  { icon: Brain, no: "15.2", title: "語意導航", desc: "地圖加入禁止區、單向區、慢速區、人流優先區——找最符合營運規則的路，而非只找最短路。" },
  { icon: Users, no: "15.3", title: "人群感知與社會化導航", desc: "不從兩人中間穿過、不切斷排隊動線、接近使用者時降速正面停靠。" },
  { icon: Gauge, no: "15.4", title: "動態速度與安全區域", desc: "依人流、轉彎、視線死角、定位不確定與感測降級動態調速與縮放安全區。" },
  { icon: Scale, no: "15.5", title: "高機身防傾倒控制", desc: "依載重與重心限速、彎道提前降速、jerk 限制、IMU 側傾監控。" },
  { icon: Stethoscope, no: "15.6", title: "自動校正與自我診斷", desc: "比較左右輪命令與實際速度、分析定位殘差、偵測 TF 外參偏移、估算電池 SOH。" },
  { icon: Boxes, no: "15.7", title: "數位孿生與場域模擬", desc: "建立可重複的測試條件與驗證報告——重點不是漂亮 3D，而是回歸測試。" },
  { icon: RefreshCw, no: "15.8", title: "地圖自動更新與變更偵測", desc: "區分暫時障礙與永久變更、保留地圖版本、支援分區更新。" },
  { icon: Network, no: "15.9", title: "多機器人協作與交通管理", desc: "Fleet Management：路權、會車、電梯排程、任務分配、充電樁排隊。" },
  { icon: Cloud, no: "15.10", title: "邊緣自主與雲端分層", desc: "馬達控制、定位、避障、急停必須本機執行；AI 問答、CMS、分析可上雲。" },
  { icon: ServerCog, no: "15.11", title: "ROS 2 可靠度工程", desc: "Lifecycle 啟動順序、Watchdog、黑盒紀錄、OTA 更新與回滾——從可運作到可維運。" },
  { icon: Lock, no: "15.12", title: "資安與網路隔離", desc: "DDS Domain 隔離、節點驗證加密、OTA 簽章、避免未授權裝置發布假 /cmd_vel。" },
];

const ROADMAP: [string, string, string[]][] = [
  ["第一優先", "先把商品化基本功做好", [
    "高機身動態穩定與防傾倒",
    "多層避障與安全停車",
    "定位失效偵測及自動恢復",
    "節點監控與黑盒紀錄",
    "電池、BMS、低電量安全策略",
  ]],
  ["第二優先", "解決真實場域難題", [
    "玻璃、低矮物與懸空物偵測",
    "人群感知與社會化導航",
    "目標被占用的等待與替代停靠",
    "地圖變更偵測",
    "網路中斷本機自主降級",
  ]],
  ["第三優先", "形成商業差異化", [
    "可換裝模組的底車接口",
    "自動運動參數切換",
    "預測性維護與零件健康度",
    "數位孿生與自動回歸測試",
    "多機器人交通管理",
  ]],
];

export function Innovation() {
  const nav = NAV[12];
  return (
    <Section
      id={nav.id}
      no={nav.no}
      title={nav.title}
      icon={nav.icon}
      intro="以「能解決真實場域問題、可驗證、可商品化」為優先。創新不一定是新演算法，也可能是將 ROS 2 從「可運作」提升到「可維運」。"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map((item) => (
          <Card key={item.no} className="group border-border/50 transition-colors hover:border-primary/40">
            <CardContent className="p-4">
              <div className="mb-2.5 flex items-center justify-between">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                  <item.icon className="size-5" />
                </div>
                <span className="font-mono text-xs text-muted-foreground/60">{item.no}</span>
              </div>
              <div className="mb-1.5 font-semibold">{item.title}</div>
              <p className="text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10">
        <h3 className="mb-4 text-lg font-semibold">建議優先投入的精進路線</h3>
        <div className="grid gap-4 lg:grid-cols-3">
          {ROADMAP.map(([phase, subtitle, items], i) => (
            <Card
              key={phase}
              className={
                i === 0
                  ? "border-primary/40 bg-primary/5"
                  : "border-border/50"
              }
            >
              <CardContent className="p-5">
                <Badge variant={i === 0 ? "default" : "outline"} className="mb-2">
                  {phase}
                </Badge>
                <div className="mb-3 text-sm font-semibold">{subtitle}</div>
                <ul className="space-y-1.5">
                  {items.map((t, j) => (
                    <li key={t} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="font-mono text-xs text-primary/60">{j + 1}</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  );
}
