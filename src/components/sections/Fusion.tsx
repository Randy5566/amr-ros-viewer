import { Section, VizFrame } from "@/components/layout/Section";
import { SensorFusionCanvas } from "@/components/viz/SensorFusionCanvas";
import { Card, CardContent } from "@/components/ui/card";
import { Callout } from "@/components/ui/callout";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";
import { NAV } from "@/content/nav";
import { Check, X } from "lucide-react";

export function Fusion() {
  const nav = NAV[3];
  return (
    <Section
      id={nav.id}
      no={nav.no}
      title={nav.title}
      icon={nav.icon}
      intro="輪速編碼器記錄輪子轉動，已知輪徑與輪距即可估算前進距離與旋轉角度。但打滑與誤差會累積漂移，因此需與 IMU、LiDAR 定位融合。"
    >
      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <VizFrame caption="純里程計隨時間漂移；融合 IMU 與 LiDAR 定位後修正回真實軌跡，迴環時歸位">
          <SensorFusionCanvas />
        </VizFrame>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <Badge>差速底車</Badge>
                <span className="text-sm font-semibold">輪速里程計</span>
              </div>
              <CodeBlock>{`左右輪同速         → 直線前進
左輪慢、右輪快     → 向左轉
左輪前進、右輪後退 → 原地旋轉`}</CodeBlock>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="mb-1 font-medium text-emerald-400">優點</div>
                  <ul className="space-y-1 text-muted-foreground">
                    {["更新速度快", "不受光線影響", "短時間運動連續"].map((t) => (
                      <li key={t} className="flex gap-1.5"><Check className="mt-0.5 size-3.5 shrink-0 text-emerald-400" />{t}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="mb-1 font-medium text-rose-400">缺點</div>
                  <ul className="space-y-1 text-muted-foreground">
                    {["輪胎打滑產生誤差", "輪徑誤差累積", "長時間無法維持全域位置"].map((t) => (
                      <li key={t} className="flex gap-1.5"><X className="mt-0.5 size-3.5 shrink-0 text-rose-400" />{t}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Callout variant="info" title="各感測器分工">
            <div className="space-y-1">
              <div><strong>輪速</strong>：平順、快速的短期運動</div>
              <div><strong>IMU</strong>：補充旋轉與加速度</div>
              <div><strong>LiDAR／地圖</strong>：修正長期位置漂移</div>
              <div><strong>相機</strong>：補充語意、特徵與立體資訊</div>
            </div>
          </Callout>

          <div>
            <div className="mb-2 text-sm font-medium">常見融合方法</div>
            <div className="flex flex-wrap gap-2">
              {["EKF 擴展卡爾曼", "UKF 無跡卡爾曼", "因子圖最佳化", "粒子濾波", "LiDAR／視覺里程計"].map((m) => (
                <Badge key={m} variant="outline">{m}</Badge>
              ))}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              融合後通常會產生較穩定的 <code className="font-mono text-accent">odom → base_link</code> 或位置估計。
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
