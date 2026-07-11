import { Section, VizFrame } from "@/components/layout/Section";
import { TofDiagram } from "@/components/viz/TofDiagram";
import { Card, CardContent } from "@/components/ui/card";
import { Callout } from "@/components/ui/callout";
import { Badge } from "@/components/ui/badge";
import { NAV } from "@/content/nav";
import { GlassWater, Circle, Sparkle, ArrowDownWideNarrow } from "lucide-react";

const TYPES: [string, string, string][] = [
  ["2D LiDAR", "掃描單一水平平面", "室內導航、地圖定位、平面避障"],
  ["多層 LiDAR", "多個垂直掃描層", "偵測不同高度物體"],
  ["3D LiDAR", "完整三維點雲", "戶外、坡道、立體障礙、巡檢"],
  ["安全雷射掃描器", "通過功能安全認證", "人機共域安全減速與停車"],
];

const BLIND = [
  { icon: GlassWater, title: "透明玻璃", desc: "穿透／折射／反射，可能無回波或把玻璃後方當障礙" },
  { icon: Circle, title: "黑色低反射材質", desc: "吸光材質使回波變弱" },
  { icon: Sparkle, title: "高反光表面", desc: "金屬、鏡面產生異常回波" },
  { icon: ArrowDownWideNarrow, title: "低矮或懸空物體", desc: "固定高度掃描看不到台階、椅腳、桌面橫桿、小孩的手" },
];

const SPECS = [
  "掃描範圍 270°／360°",
  "最大與最小量測距離",
  "掃描頻率",
  "角度解析度",
  "距離精度與重複性",
  "黑色物體偵測能力",
  "抗環境光能力",
  "多回波能力",
  "IP 防護等級",
  "ROS 2 驅動支援",
  "功能安全認證",
];

export function Lidar() {
  const nav = NAV[2];
  return (
    <Section
      id={nav.id}
      no={nav.no}
      title={nav.title}
      icon={nav.icon}
      intro="LiDAR（Light Detection and Ranging，光達）發射雷射光並接收反射，計算與物體的距離。常見採用 ToF 飛時測距，用來建圖、定位、偵測障礙與輔助安全減速。"
    >
      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <div>
          <VizFrame caption="ToF：脈衝去程與回程，除以 2 因為光經歷「感測器 → 物體 → 感測器」">
            <TofDiagram />
          </VizFrame>
          <Callout variant="info" title="2D LiDAR 的資料樣貌" >
            <div className="font-mono text-xs leading-relaxed text-sky-200/80">
              角度 0° → 前方 2.3 m 有物體<br />
              角度 1° → 前方 2.2 m 有物體<br />
              …<br />
              角度 180° → 左側 1.4 m 有物體
            </div>
            這些點集合起來，就能勾勒牆面、柱子與障礙物。
          </Callout>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-lg font-semibold">2D／3D LiDAR 類型</h3>
            <div className="space-y-2">
              {TYPES.map((t) => (
                <Card key={t[0]}>
                  <CardContent className="flex flex-col gap-1 p-3.5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <span className="font-semibold">{t[0]}</span>
                      <span className="ml-2 text-sm text-muted-foreground">{t[1]}</span>
                    </div>
                    <Badge variant="outline" className="w-fit">{t[2]}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="mb-3 text-lg font-semibold">LiDAR 的常見盲點</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {BLIND.map((b) => (
            <Card key={b.title} className="border-amber-500/20">
              <CardContent className="p-4">
                <b.icon className="mb-2 size-5 text-amber-400" />
                <div className="mb-1 font-semibold">{b.title}</div>
                <p className="text-xs leading-relaxed text-muted-foreground">{b.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Callout variant="warning" title="因此正式產品需要感測器融合">
          單一 2D LiDAR 只掃描固定高度，無法單獨解決所有障礙物問題——
          需整合深度相機、超音波／ToF、IMU 與機械防撞。
        </Callout>
      </div>

      <div className="mt-8">
        <h3 className="mb-3 text-lg font-semibold">選型時的重要規格</h3>
        <div className="flex flex-wrap gap-2">
          {SPECS.map((s) => (
            <span
              key={s}
              className="rounded-lg border border-border/60 bg-secondary/40 px-3 py-1.5 text-sm text-muted-foreground"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </Section>
  );
}
