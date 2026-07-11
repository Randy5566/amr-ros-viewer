import {Section, VizFrame} from "@/components/layout/Section";
import {PathPlanningCanvas} from "@/components/viz/PathPlanningCanvas";
import {CodeBlock} from "@/components/ui/code-block";
import {Card, CardContent} from "@/components/ui/card";
import {Callout} from "@/components/ui/callout";
import {Badge} from "@/components/ui/badge";
import {NAV} from "@/content/nav";

const NAV2_PARTS: [string, string][] = [
  ["Planner Server", "全域路徑規劃"],
  ["Controller Server", "局部控制與軌跡追蹤"],
  ["Costmap", "障礙物與通行成本地圖"],
  ["Behavior Server", "旋轉、後退、等待等恢復"],
  ["BT Navigator", "行為樹協調導航任務"],
  ["Waypoint Follower", "依序前往多站點"],
  ["Velocity Smoother", "平滑速度命令"],
  ["Collision Monitor", "額外碰撞監控"],
  ["Lifecycle Manager", "管理各節點狀態"],
];

export function Navigation() {
  const nav = NAV[6];
  return (
    <Section
      id={nav.id}
      no={nav.no}
      title={nav.title}
      icon={nav.icon}
      intro="導航不是單一演算法，而是多個模組協作的結果。Nav2 是 ROS 2 常用的自主導航框架：全域規劃器決定主要路線，局部控制器產生即時速度命令，並持續更新障礙物、必要時重新規劃。"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
        <VizFrame caption="全域規劃器以 A* 找出路線（黃）；遇到動態行人阻擋時即時重新規劃繞行">
          <PathPlanningCanvas />
        </VizFrame>

        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-lg font-semibold">導航完整流程</h3>
            <CodeBlock>{`接收目標位置 → 確認目前定位
   → 建立全域路徑
   → 沿路徑產生局部速度命令
   → 持續更新障礙物
   → 必要時重新規劃
   → 到達並確認位置與朝向`}</CodeBlock>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-4">
                <div className="mb-1.5 text-sm font-semibold text-yellow-400">
                  全域路徑規劃
                </div>
                <p className="mb-2 text-xs text-muted-foreground">
                  依靜態地圖找出可行路徑
                </p>
                <div className="flex flex-wrap gap-1">
                  {["Dijkstra", "A*", "Hybrid A*", "Smac"].map((a) => (
                    <Badge key={a} variant="outline" className="text-[10px]">
                      {a}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="mb-1.5 text-sm font-semibold text-lime-400">
                  局部控制器
                </div>
                <p className="mb-2 text-xs text-muted-foreground">
                  轉成即時 linear.x／angular.z
                </p>
                <div className="flex flex-wrap gap-1">
                  {["DWB", "TEB", "RPP", "MPPI"].map((a) => (
                    <Badge key={a} variant="outline" className="text-[10px]">
                      {a}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="mt-8 mb-5">
        <h3 className="mb-3 text-lg font-semibold">Nav2 主要組成</h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {NAV2_PARTS.map(([name, desc]) => (
            <Card key={name} className="border-border/50">
              <CardContent className="flex items-center justify-between p-3.5">
                <span className="font-mono text-sm text-primary">{name}</span>
                <span className="text-xs text-muted-foreground">{desc}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Callout variant="tip" title="高機身、雙螢幕服務機器人的局部控制重點">
        不能只追求速度，要特別重視加減速平順、轉彎角速度限制、急停後機身晃動、
        左右輪速度突變與狹窄空間的安全距離。
      </Callout>
    </Section>
  );
}
