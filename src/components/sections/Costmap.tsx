import { Section, VizFrame } from "@/components/layout/Section";
import { CostmapCanvas } from "@/components/viz/CostmapCanvas";
import { Card, CardContent } from "@/components/ui/card";
import { NAV } from "@/content/nav";
import { Layers2 } from "lucide-react";

const LAYERS: [string, string][] = [
  ["Static Layer", "來自既有地圖的牆壁與固定設施"],
  ["Obstacle Layer", "LiDAR、深度相機即時加入的障礙"],
  ["Voxel Layer", "以三維體素表示具高度的障礙物"],
  ["Inflation Layer", "在障礙周圍建立膨脹區，保留機身寬度"],
];

export function Costmap() {
  const nav = NAV[7];
  return (
    <Section
      id={nav.id}
      no={nav.no}
      title={nav.title}
      icon={nav.icon}
      intro="Costmap 是導航系統用來表示障礙與風險的網格地圖。它不把機器人視為一個點，而是以「膨脹層」在障礙周圍建立成本漸層——保留機身寬度與安全距離。"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-start">
        <VizFrame caption="拖曳滑桿調整膨脹半徑，觀察狹窄走廊如何在半徑過大時被封住">
          <div className="p-2">
            <CostmapCanvas />
          </div>
        </VizFrame>

        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Layers2 className="size-4 text-primary" />
            常見圖層
          </h3>
          <div className="space-y-2">
            {LAYERS.map(([name, desc], i) => (
              <Card key={name} className="border-border/50">
                <CardContent className="flex items-start gap-3 p-3.5">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/15 font-mono text-xs text-primary">
                    {i + 1}
                  </span>
                  <div>
                    <div className="text-sm font-semibold">{name}</div>
                    <div className="text-xs text-muted-foreground">{desc}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Card className="border-rose-500/30">
              <CardContent className="p-3.5">
                <div className="mb-1 text-sm font-semibold text-rose-400">膨脹過小</div>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>容易貼牆</li>
                  <li>高機身可能擦撞</li>
                  <li>乘客感到不安全</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-amber-500/30">
              <CardContent className="p-3.5">
                <div className="mb-1 text-sm font-semibold text-amber-400">膨脹過大</div>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>狹窄通道被封住</li>
                  <li>路徑繞太遠</li>
                  <li>門口、人群中卡住</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Section>
  );
}
