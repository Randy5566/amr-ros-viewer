import { Section, VizFrame } from "@/components/layout/Section";
import { AvoidanceCanvas } from "@/components/viz/AvoidanceCanvas";
import { Card, CardContent } from "@/components/ui/card";
import { Callout } from "@/components/ui/callout";
import { Badge } from "@/components/ui/badge";
import { NAV } from "@/content/nav";
import { Brain, Route, Gauge, ShieldCheck } from "lucide-react";

const LAYERS = [
  { icon: Brain, title: "預測層", desc: "提前判斷人或障礙可能移動方向" },
  { icon: Route, title: "規劃層", desc: "重新計算局部路徑，嘗試繞行" },
  { icon: Gauge, title: "控制層", desc: "降低速度、限制角速度或停止" },
  { icon: ShieldCheck, title: "安全層", desc: "碰撞監控、安全雷射、急停與驅動安全輸入" },
];

const PROBLEMS: [string, string][] = [
  ["Oscillation 震盪", "在障礙前左右來回選路，無法前進"],
  ["Local Minimum 局部最小值", "局部找不到路，但全域其實有繞路"],
  ["Narrow Passage 狹窄通道", "膨脹過大或定位偏差導致通道被封"],
  ["Moving Crowd 人群", "持續繞過移動的人，反而不斷改變路徑"],
  ["Goal Blocking 目標被占用", "目的地附近有人或行李，無法進入"],
];

export function Avoidance() {
  const nav = NAV[8];
  return (
    <Section
      id={nav.id}
      no={nav.no}
      title={nav.title}
      icon={nav.icon}
      intro="成熟的避障不是「看到就停」，而是分為預測、規劃、控制與安全四層協作。安全掃描區也可依速度動態放大或縮小。"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
        <VizFrame caption="機器人具警告區（減速）與保護區（安全停止），行人離開後恢復前進">
          <AvoidanceCanvas />
        </VizFrame>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">避障的四個層次</h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {LAYERS.map((l) => (
              <Card key={l.title} className="border-border/50">
                <CardContent className="p-4">
                  <l.icon className="mb-2 size-5 text-primary" />
                  <div className="mb-1 font-semibold">{l.title}</div>
                  <p className="text-xs text-muted-foreground">{l.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="mb-1.5 text-sm font-medium">靜態障礙</div>
              <div className="flex flex-wrap gap-1.5">
                {["牆壁", "柱子", "固定櫃台", "椅子", "展示架"].map((t) => (
                  <Badge key={t} variant="outline">{t}</Badge>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-1.5 text-sm font-medium">動態障礙</div>
              <div className="flex flex-wrap gap-1.5">
                {["行人", "行李箱", "推車", "其他機器人", "開啟的門"].map((t) => (
                  <Badge key={t} variant="accent">{t}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <h3 className="mb-3 text-lg font-semibold">常見避障問題</h3>
          <div className="space-y-2">
            {PROBLEMS.map(([name, desc]) => (
              <Card key={name} className="border-amber-500/20">
                <CardContent className="flex flex-col gap-0.5 p-3.5 sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-semibold text-amber-300">{name}</span>
                  <span className="text-sm text-muted-foreground">{desc}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <Callout variant="tip" title="適當策略不一定是強行繞行">
          也可能是原地等待、語音請求讓路、停在替代服務點、
          重新指定目標，或通知遠端人員接管。
        </Callout>
      </div>
    </Section>
  );
}
