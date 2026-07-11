import { Section, VizFrame } from "@/components/layout/Section";
import { DataFlowDiagram } from "@/components/viz/DataFlowDiagram";
import { Callout } from "@/components/ui/callout";
import { Card, CardContent } from "@/components/ui/card";
import { NAV } from "@/content/nav";
import { MapPin, Flag, Route, Users, ShieldCheck, Layers } from "lucide-react";

const TASKS = [
  { icon: MapPin, text: "知道自己在哪裡" },
  { icon: Flag, text: "知道目的地在哪裡" },
  { icon: Route, text: "找到可行路徑" },
  { icon: Users, text: "移動中避開人與障礙物" },
  { icon: ShieldCheck, text: "異常時進入安全狀態" },
  { icon: Layers, text: "整合成可長時間營運的系統" },
];

export function Overview() {
  const nav = NAV[0];
  return (
    <Section
      id={nav.id}
      no={nav.no}
      title={nav.title}
      icon={nav.icon}
      intro="一台可自主移動的機器人底車，是由感測、定位、導航、控制多個子系統層層堆疊而成。資料由下而上流動，最終轉為實際移動。"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <VizFrame caption="子系統資料流：感測器 → 定位感知 → 導航決策 → 運動控制 → 實際移動">
          <div className="p-2">
            <DataFlowDiagram />
          </div>
        </VizFrame>

        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-lg font-semibold">底車的六項核心任務</h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {TASKS.map((t, i) => (
                <Card key={i} className="border-border/50">
                  <CardContent className="flex items-center gap-3 p-3.5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <t.icon className="size-4" />
                    </div>
                    <span className="text-sm">{t.text}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Callout variant="info" title="ROS／ROS 2 的角色">
            ROS 就像把上述所有模組連接起來的「機器人軟體骨幹」，
            讓 LiDAR 驅動、定位、導航、控制等模組可以彼此交換資料，
            並能獨立開發、測試與替換。
          </Callout>

          <Callout variant="tip" title="關鍵觀念">
            底車的技術門檻不是「能移動」，而是在高荷重、高機身與公共場域條件下，
            同時達到<strong>定位穩定、避障安全、運動平順、異常可恢復</strong>與長時間可維運。
          </Callout>
        </div>
      </div>
    </Section>
  );
}
