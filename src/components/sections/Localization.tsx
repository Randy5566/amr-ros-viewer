import { Section, VizFrame } from "@/components/layout/Section";
import { ParticleFilterCanvas } from "@/components/viz/ParticleFilterCanvas";
import { Callout } from "@/components/ui/callout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NAV } from "@/content/nav";
import { Check, X } from "lucide-react";

const METRICS = [
  "導覽路徑完成率",
  "定點停靠成功率",
  "重複停靠誤差",
  "定位失效次數",
  "全域重定位成功率",
  "定位恢復時間",
];

export function Localization() {
  const nav = NAV[5];
  return (
    <Section
      id={nav.id}
      no={nav.no}
      title={nav.title}
      icon={nav.icon}
      intro="正式營運通常使用固定地圖定位，而非每天重新建圖。AMCL 以「粒子」代表機器人可能的位置，比較「若在此處，LiDAR 理論上該看到什麼」與「實際看到什麼」，越符合的粒子權重越高，最後收斂到最可能位置。"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
        <div>
          <VizFrame caption="粒子（紫）逐步收斂到真值；點擊「綁架機器人」觸發全域重定位">
            <div className="p-2">
              <ParticleFilterCanvas />
            </div>
          </VizFrame>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <Badge>AMCL</Badge>
                <span className="text-sm font-semibold">粒子濾波定位</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="mb-1 font-medium text-emerald-400">優點</div>
                  <ul className="space-y-1 text-muted-foreground">
                    {["技術成熟", "適用 2D 室內", "可處理初始不確定"].map((t) => (
                      <li key={t} className="flex gap-1.5"><Check className="mt-0.5 size-3.5 shrink-0 text-emerald-400" />{t}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="mb-1 font-medium text-rose-400">限制</div>
                  <ul className="space-y-1 text-muted-foreground">
                    {["地圖差異大會失敗", "長走廊、玻璃、重複結構", "初始位置差需重定位"].map((t) => (
                      <li key={t} className="flex gap-1.5"><X className="mt-0.5 size-3.5 shrink-0 text-rose-400" />{t}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Callout variant="danger" title="綁架問題（Kidnapped Robot）">
            機器人被搬到別處，系統卻仍以為在原位。全域重定位需擴大搜尋範圍、
            比對整張地圖、確認可信度後才恢復導航。「秒級重定位」應包含
            觸發條件、搜尋、收斂判定、可信度門檻與恢復時間。
          </Callout>

          <Callout variant="warning" title="定位精度不能只寫一個 ±5 cm">
            必須先定義測試方法：平均／最大誤差、靜止抖動、重複停靠、
            行進軌跡誤差，以及特定場域與速度下的結果。
          </Callout>

          <div>
            <div className="mb-2 text-sm font-medium">更有商業意義的指標</div>
            <div className="flex flex-wrap gap-2">
              {METRICS.map((m) => (
                <Badge key={m} variant="outline">{m}</Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
