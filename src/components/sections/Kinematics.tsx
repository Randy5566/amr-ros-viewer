import {Section, VizFrame} from "@/components/layout/Section";
import {KinematicsViz} from "@/components/viz/KinematicsViz";
import {CodeBlock} from "@/components/ui/code-block";
import {Callout} from "@/components/ui/callout";
import {NAV} from "@/content/nav";

const CHAIN = [
  "ROS 2 控制節點",
  "CAN／EtherCAT／RS-485",
  "馬達驅動器",
  "馬達",
  "減速機",
  "輪子",
];

const REAL = [
  "加減速度限制",
  "馬達電流限制",
  "閉迴路速度控制",
  "編碼器回授",
  "左右輪差異補償",
  "驅動器錯誤碼",
  "通訊逾時",
  "急停與馬達使能",
  "煞車釋放與安全停止",
];

export function Kinematics() {
  const nav = NAV[10];
  return (
    <Section
      id={nav.id}
      no={nav.no}
      title={nav.title}
      icon={nav.icon}
      intro="導航系統最後輸出 /cmd_vel（linear.x 前進速度、angular.z 旋轉速度）。對差速底車，控制器將其轉換成左右輪速度，再經驅動鏈變成實際轉動。"
    >
      <VizFrame caption="調整 linear.x 與 angular.z，即時觀察左右輪速度、運動模式與機器人軌跡">
        <div className="p-3">
          <KinematicsViz />
        </div>
      </VizFrame>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 text-lg font-semibold">從速度命令到馬達運轉</h3>
          <CodeBlock title="/cmd_vel → 差速轉換">{`linear.x  = 前進速度
angular.z = 旋轉速度

左輪速度 = 前進速度 - 旋轉修正
右輪速度 = 前進速度 + 旋轉修正`}</CodeBlock>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {CHAIN.map((c, i) => (
              <div key={c} className="flex items-center gap-2">
                <span className="rounded-lg border border-border/60 bg-secondary/40 px-2.5 py-1 text-xs">
                  {c}
                </span>
                {i < CHAIN.length - 1 && (
                  <span className="text-muted-foreground">→</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-lg font-semibold">實際產品還需處理</h3>
          <div className="flex flex-wrap gap-2 mb-2">
            {REAL.map((r) => (
              <span
                key={r}
                className="rounded-lg border border-border/60 bg-secondary/40 px-3 py-1.5 text-sm text-muted-foreground"
              >
                {r}
              </span>
            ))}
          </div>
          <Callout variant="tip" title="安全優先">
            急停、馬達使能、煞車釋放與安全停止都必須由硬體安全鏈確保——
            不能只靠軟體演算法。
          </Callout>
        </div>
      </div>
    </Section>
  );
}
