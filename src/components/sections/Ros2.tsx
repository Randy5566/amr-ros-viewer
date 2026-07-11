import {Section, VizFrame} from "@/components/layout/Section";
import {Ros2Graph} from "@/components/viz/Ros2Graph";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Card, CardContent} from "@/components/ui/card";
import {CodeBlock} from "@/components/ui/code-block";
import {Callout} from "@/components/ui/callout";
import {Badge} from "@/components/ui/badge";
import {NAV} from "@/content/nav";
import {Radio, Reply, ListTodo, Sliders, GitFork} from "lucide-react";

const COMPARE: [string, string, string][] = [
  ["通訊核心", "ROS Master 集中管理", "DDS 分散式探索"],
  ["單點故障", "Master 中斷影響新連線", "無中央 Master"],
  ["QoS", "能力有限", "可設定可靠性、歷史、延遲"],
  ["即時控制", "支援較弱", "架構上較適合即時"],
  ["資安", "原生能力有限", "可搭配 DDS Security"],
  ["多機器人", "網路管理較麻煩", "Namespace／Domain 完整"],
  ["Lifecycle", "非核心功能", "原生受管理節點"],
  ["產品化", "研究、POC", "新產品與長期維護"],
];

export function Ros2() {
  const nav = NAV[1];
  return (
    <Section
      id={nav.id}
      no={nav.no}
      title={nav.title}
      icon={nav.icon}
      intro="ROS（Robot Operating System）並不是作業系統，而是一套機器人軟體中介層、通訊框架與套件生態系。它把複雜系統拆成多個可獨立開發、測試與替換的模組。"
    >
      <VizFrame caption="ROS 2 節點以發布／訂閱在主題上交換資料——藍點為流動中的訊息封包">
        <Ros2Graph />
      </VizFrame>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 text-lg font-semibold">四種通訊機制</h3>
          <Tabs defaultValue="topic">
            <TabsList className="mb-5 grid h-auto w-full grid-cols-2 gap-1 sm:inline-flex sm:h-10 sm:w-auto">
              <TabsTrigger value="topic">
                <Radio className="size-3.5" />
                Topic
              </TabsTrigger>
              <TabsTrigger value="service">
                <Reply className="size-3.5" />
                Service
              </TabsTrigger>
              <TabsTrigger value="action">
                <ListTodo className="size-3.5" />
                Action
              </TabsTrigger>
              <TabsTrigger value="param">
                <Sliders className="size-3.5" />
                Parameter
              </TabsTrigger>
            </TabsList>
            <TabsContent value="topic">
              <p className="mb-3 text-sm text-muted-foreground">
                持續流動的資料，採發布／訂閱模式。一個節點發布，多個節點可同時訂閱。
              </p>
              <CodeBlock title="常見 Topic">{`/scan            LiDAR 雷射資料
/odom            輪速里程計
/imu/data        IMU 資料
/cmd_vel         速度命令
/battery_state   電池狀態
/tf              座標轉換`}</CodeBlock>
            </TabsContent>
            <TabsContent value="service">
              <p className="mb-3 text-sm text-muted-foreground">
                短時間完成的「請求—回應」。呼叫端送出請求，等待服務端回覆結果。
              </p>
              <CodeBlock title="常見 Service">{`/clear_costmap
/reset_odometry
/save_map
/set_motor_enable`}</CodeBlock>
            </TabsContent>
            <TabsContent value="action">
              <p className="mb-3 text-sm text-muted-foreground">
                需較長時間、可回報進度、可取消的任務。含
                Goal／Feedback／Result／Cancel。
              </p>
              <CodeBlock title="常見 Action">{`NavigateToPose    前往指定位姿
DockRobot         自動回充對接
FollowWaypoints   依序前往多站點`}</CodeBlock>
            </TabsContent>
            <TabsContent value="param">
              <p className="mb-3 text-sm text-muted-foreground">
                節點可調整的設定。參數化後不用重新編譯，即可針對不同場域調整。
              </p>
              <CodeBlock title="Parameters (YAML)">{`max_linear_velocity: 0.6
max_angular_velocity: 0.8
inflation_radius: 0.55
robot_radius: 0.42
lidar_min_range: 0.05`}</CodeBlock>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <GitFork className="size-4 text-primary" />
              TF：座標轉換系統
            </h3>
            <CodeBlock className="mb-2">{`map
 └─ odom
     └─ base_link
         ├─ laser
         ├─ camera_link
         ├─ imu_link
         └─ wheel_left / wheel_right`}</CodeBlock>
            <Callout variant="warning" title="TF 設錯的後果">
              即使 LiDAR 與演算法本身正常，也可能出現地圖歪斜、位置跳動、
              障礙物方向錯誤、旋轉時地圖漂移。
            </Callout>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <h3 className="mb-3 text-lg font-semibold">ROS 1 與 ROS 2 差異</h3>
          <div className="scrollbar-thin overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="bg-secondary/50 text-left">
                  <th className="px-3 py-2 font-medium">面向</th>
                  <th className="px-3 py-2 font-medium text-muted-foreground">
                    ROS 1
                  </th>
                  <th className="px-3 py-2 font-medium text-primary">ROS 2</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row, i) => (
                  <tr key={i} className="border-t border-border/40">
                    <td className="px-3 py-2 font-medium">{row[0]}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {row[1]}
                    </td>
                    <td className="px-3 py-2 text-foreground/90">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            對新的商用 AMR 專案而言，通常應優先採用 ROS 2。
          </p>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="accent">QoS</Badge>
                <span className="text-sm font-semibold">通訊品質控制</span>
              </div>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li>
                  <strong className="text-foreground">Reliable</strong>
                  ：確保送達（任務命令）
                </li>
                <li>
                  <strong className="text-foreground">Best Effort</strong>
                  ：低延遲（LiDAR 高頻掃描）
                </li>
                <li>
                  <strong className="text-foreground">Transient Local</strong>
                  ：後啟動者可取得地圖
                </li>
                <li>
                  <strong className="text-foreground">
                    Deadline／Liveliness
                  </strong>
                  ：監控時效與存活
                </li>
              </ul>
              <p className="mt-2 text-xs text-amber-400/90">
                QoS 配置錯誤會造成「節點都啟動了，卻彼此收不到資料」。
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <Badge>Lifecycle</Badge>
                <span className="text-sm font-semibold">受管理節點</span>
              </div>
              <CodeBlock>{`Unconfigured → Inactive → Active → Finalized`}</CodeBlock>
              <p className="mt-2 text-xs text-muted-foreground">
                確保硬體初始化完成才導航、LiDAR 未連線不啟動定位、
                定位未成功不允許馬達移動——是從 POC 走向產品的關鍵。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  );
}
