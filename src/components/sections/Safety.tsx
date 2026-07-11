import { Section } from "@/components/layout/Section";
import { Card, CardContent } from "@/components/ui/card";
import { Callout } from "@/components/ui/callout";
import { NAV } from "@/content/nav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertOctagon, ShieldCheck, Radar, XCircle } from "lucide-react";

const FAILURES: [string, string][] = [
  ["LiDAR 資料中斷", "降速或安全停車，不應盲目前進"],
  ["定位可信度過低", "停車、重新定位、通知後台"],
  ["/cmd_vel 通訊中斷", "驅動控制器逾時歸零"],
  ["馬達驅動器故障", "停止任務並上報錯誤"],
  ["電池過低", "終止新任務、返航或安全停車"],
  ["BMS 過溫", "降載、停止充放電或停機"],
  ["網路中斷", "保留必要的本機自主安全能力"],
  ["地圖與現場差異過大", "降速、重定位或請求人工"],
  ["急停按下", "硬體安全鏈切斷危險動作"],
  ["上位機當機", "Watchdog 觸發安全停止"],
];

const OVERCLAIMS = [
  "裝 LiDAR 就絕對不會撞人",
  "定位誤差一定在 ±5 cm",
  "任何場域都能秒級重定位",
  "續航一定超過 10 小時",
  "ROS 2 本身就是資安防護",
  "一般 LiDAR 等同安全雷射掃描器",
  "AI 可以取代底車安全控制",
  "只靠 2D LiDAR 能看見所有障礙物",
];

export function Safety() {
  const nav = NAV[11];
  return (
    <Section
      id={nav.id}
      no={nav.no}
      title={nav.title}
      icon={nav.icon}
      intro="成熟系統的底線：網路斷線、上位機當機或 AI 服務失效，都不應導致底車失控。分層安全架構比單一軟體演算法可靠。"
    >
      <Tabs defaultValue="failures">
        <TabsList>
          <TabsTrigger value="failures"><AlertOctagon className="size-3.5" />失效情境</TabsTrigger>
          <TabsTrigger value="safety"><Radar className="size-3.5" />安全雷射</TabsTrigger>
          <TabsTrigger value="overclaim"><XCircle className="size-3.5" />過度宣稱</TabsTrigger>
        </TabsList>

        <TabsContent value="failures">
          <div className="overflow-hidden rounded-xl border border-border/60">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/50 text-left">
                  <th className="px-4 py-2.5 font-medium">失效情境</th>
                  <th className="px-4 py-2.5 font-medium text-emerald-400">建議反應</th>
                </tr>
              </thead>
              <tbody>
                {FAILURES.map(([f, r], i) => (
                  <tr key={i} className="border-t border-border/40">
                    <td className="px-4 py-2.5 font-medium text-rose-300/90">{f}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{r}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="safety">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-border/50">
              <CardContent className="p-5">
                <div className="mb-2 flex items-center gap-2">
                  <Radar className="size-5 text-sky-400" />
                  <span className="font-semibold">一般導航 LiDAR</span>
                </div>
                <p className="mb-3 text-sm text-muted-foreground">
                  用於建圖、定位、路徑規劃與軟體層避障。
                </p>
                <Callout variant="warning">它可能沒有功能安全認證。</Callout>
              </CardContent>
            </Card>
            <Card className="border-emerald-500/30">
              <CardContent className="p-5">
                <div className="mb-2 flex items-center gap-2">
                  <ShieldCheck className="size-5 text-emerald-400" />
                  <span className="font-semibold">安全雷射掃描器</span>
                </div>
                <p className="mb-3 text-sm text-muted-foreground">
                  建立警告區與保護區，與安全 PLC、STO 或安全驅動器形成安全迴路。
                </p>
                <Callout variant="tip">
                  宣稱「人員安全防護」須確認感測器安全等級、停止距離、
                  反應時間、最大速度與負載、場域風險評估與法規需求。
                </Callout>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="overclaim">
          <p className="mb-4 text-sm text-muted-foreground">
            以下敘述需要實測或安全認證支持，不宜只憑架構圖直接宣稱：
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {OVERCLAIMS.map((o) => (
              <div
                key={o}
                className="flex items-center gap-2.5 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3.5 py-2.5 text-sm"
              >
                <XCircle className="size-4 shrink-0 text-rose-400" />
                <span className="text-foreground/80 line-through decoration-rose-500/40">「{o}」</span>
              </div>
            ))}
          </div>
          <Callout variant="info" title="較準確的說法">
            這些是設計目標，將透過明確測試條件、失效情境與場域驗證確認。
          </Callout>
        </TabsContent>
      </Tabs>
    </Section>
  );
}
