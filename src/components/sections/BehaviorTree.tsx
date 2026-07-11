import { Section, VizFrame } from "@/components/layout/Section";
import { BehaviorTreeViz } from "@/components/viz/BehaviorTreeViz";
import { Callout } from "@/components/ui/callout";
import { CodeBlock } from "@/components/ui/code-block";
import { NAV } from "@/content/nav";
import { Check } from "lucide-react";

const VALUES = [
  "流程清楚",
  "易於插入恢復策略",
  "可依場域調整",
  "適合複雜任務",
  "比單一程式迴圈更易維護與驗證",
];

export function BehaviorTree() {
  const nav = NAV[9];
  return (
    <Section
      id={nav.id}
      no={nav.no}
      title={nav.title}
      icon={nav.icon}
      intro="Nav2 使用 Behavior Tree（行為樹，BT）協調複雜導航流程。相比把所有判斷寫在單一程式迴圈，行為樹讓恢復策略更容易插入與驗證。"
    >
      <VizFrame caption="行為樹以 tick 巡訪：正常路徑失敗時，依序執行清除成本地圖、重新規劃、旋轉、後退等恢復行為">
        <BehaviorTreeViz />
      </VizFrame>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 text-lg font-semibold">導覽機器人的到站行為</h3>
          <CodeBlock>{`導航到站點
→ 判斷目標附近是否有人
→ 調整停靠位置
→ 面向使用者
→ 開始語音與螢幕導覽
→ 完成後前往下一站`}</CodeBlock>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="mb-3 text-lg font-semibold">行為樹的價值</h3>
            <ul className="space-y-2">
              {VALUES.map((v) => (
                <li key={v} className="flex items-center gap-2 text-sm">
                  <Check className="size-4 shrink-0 text-emerald-400" />
                  {v}
                </li>
              ))}
            </ul>
          </div>
          <Callout variant="info" title="恢復行為（Recovery）">
            當「是否有有效路徑？」為否時，行為樹會嘗試清除局部成本地圖、
            重新規劃、原地旋轉取得新觀測、後退脫困；若仍失敗才回報任務失敗。
          </Callout>
        </div>
      </div>
    </Section>
  );
}
