import { Section, VizFrame } from "@/components/layout/Section";
import { SlamCanvas } from "@/components/viz/SlamCanvas";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/ui/callout";
import { Card, CardContent } from "@/components/ui/card";
import { NAV } from "@/content/nav";

export function Slam() {
  const nav = NAV[4];
  return (
    <Section
      id={nav.id}
      no={nav.no}
      title={nav.title}
      icon={nav.icon}
      intro="SLAM（Simultaneous Localization and Mapping）要同時解決兩個互相依賴的問題：不知道地圖時如何知道自己在哪？不知道自己在哪時又如何建立正確地圖？機器人一邊移動、一邊觀察環境估計位姿並建圖。"
    >
      <VizFrame caption="機器人巡行時以 LiDAR 掃描，逐格建立佔據柵格地圖；走完一圈觸發迴環修正">
        <SlamCanvas />
      </VizFrame>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div>
          <h3 className="mb-3 text-lg font-semibold">2D LiDAR SLAM 流程</h3>
          <CodeBlock>{`LiDAR Scan
   ↓
與上一幀或局部地圖比對
   ↓
估算本次位移
   ↓
結合輪速里程計
   ↓
更新機器人位姿
   ↓
掃描資料加入地圖
   ↓
偵測迴環並修正誤差`}</CodeBlock>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="mb-1.5 font-semibold">Scan Matching</div>
              <p className="text-sm text-muted-foreground">
                把目前 LiDAR 輪廓與先前掃描或地圖對齊，尋找最合理的位置與角度。
              </p>
              <p className="mt-2 text-xs text-amber-400/90">
                長直走廊、大片玻璃或完全對稱空間，特徵不足時容易不穩定。
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="mb-1.5 font-semibold">Loop Closure 迴環偵測</div>
              <p className="text-sm text-muted-foreground">
                走一圈回到舊位置時辨識「這裡是之前經過的地方」，修正整段軌跡的累積誤差。
              </p>
              <p className="mt-2 text-xs text-amber-400/90">
                迴環誤判可能造成整張地圖突然扭曲。
              </p>
            </CardContent>
          </Card>
        </div>

        <div>
          <h3 className="mb-3 text-lg font-semibold">Occupancy Grid 地圖</h3>
          <div className="space-y-2">
            {[
              ["白色", "可通行（自由空間）", "bg-slate-200"],
              ["黑色", "障礙物", "bg-slate-900 border border-border"],
              ["灰色", "未知空間", "bg-slate-500"],
            ].map(([label, desc, cls]) => (
              <div key={label} className="flex items-center gap-3 text-sm">
                <span className={`size-5 shrink-0 rounded ${cls}`} />
                <span className="font-medium">{label}</span>
                <span className="text-muted-foreground">{desc}</span>
              </div>
            ))}
          </div>
          <Callout variant="info" title="地圖解析度">
            <code className="font-mono text-accent">0.05 m/cell</code> 代表每像素對應現實 5 公分。
            解析度越高越精細，但記憶體、運算量與感測雜訊都被放大。
          </Callout>
        </div>
      </div>
    </Section>
  );
}
