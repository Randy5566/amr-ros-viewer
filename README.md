# AMR 底車技術科普 · 互動視覺化網站

以可互動的動畫，一步步看懂自主移動機器人（AMR）底車的運作原理——涵蓋
ROS 2、LiDAR、SLAM、定位、導航、避障與運動控制。

適用情境：室內服務型、導覽、巡檢機器人，以及採用通用型輪式移動平台的 AMR。

## ✨ 特色

- **13 個章節、多組即時動畫**，每個原理都有對應的互動視覺化
- **three.js 3D LiDAR 掃描場景**：機器人在室內旋轉掃描，即時累積 `/scan` 點雲
- **canvas 演算法動畫**：ToF 測距、感測器融合漂移、SLAM 佔據柵格建圖、AMCL 粒子濾波、A\* 全域路徑規劃、Costmap 膨脹層、分層避障安全區
- **可互動控制**：差速運動學（cmd_vel → 左右輪）、膨脹半徑滑桿、「綁架機器人」全域重定位
- **行為樹 tick 動畫**、ROS 2 節點／主題訊息流動圖
- 深色主題、響應式（含手機導覽）、捲動視差與 scroll-spy 側邊導覽

## 🛠 技術棧

| 類別 | 使用 |
|---|---|
| 框架 | React 18 + TypeScript |
| 建置 | Vite 5（`pnpm`） |
| 3D | three.js · @react-three/fiber · @react-three/drei |
| 樣式 | Tailwind CSS + shadcn/ui 元件 |
| 圖示 | lucide-react |
| 動畫 | framer-motion + 自製 canvas / RAF |
| 測試 | Vitest + Testing Library（jsdom） |

## 🚀 開發

```bash
pnpm install      # 安裝相依套件
pnpm dev          # 啟動開發伺服器（http://localhost:5173）
pnpm build        # 型別檢查 + 生產打包
pnpm preview      # 預覽打包結果
pnpm test         # 執行單元測試
pnpm test:watch   # 監看模式
```

## 🧪 測試

核心底車運算集中在 [`src/lib/robotics.ts`](src/lib/robotics.ts)，皆為純函式並以
Vitest 覆蓋（16 項測試）：

- ToF 飛時測距（距離 = 光速 × 來回時間 ÷ 2）
- 差速底車正／逆運動學與運動模式判定
- 位姿積分與角度正規化
- A\* 全域路徑規劃（可到達／繞障／封閉）
- Costmap 膨脹層成本計算
- AMCL 粒子濾波重採樣與加權位姿估計

## 📁 專案結構

```
src/
├─ lib/robotics.ts          # 純運算函式庫（含測試）
├─ hooks/                   # useAnimationFrame · useInView · useScrollSpy
├─ components/
│  ├─ ui/                   # shadcn 元件（button, card, tabs, ...）
│  ├─ layout/               # Sidebar · Hero · Section · Footer · ProgressBar
│  ├─ viz/                  # 各項視覺化（three.js + canvas）
│  └─ sections/             # 13 個內容章節
└─ content/nav.ts           # 導覽章節定義
```

## 📖 內容來源

依《AMR 底車技術科普：ROS／ROS 2、LiDAR、定位、導航、避障與創新方向》一文製作，
作為教育與審查溝通用途。相關概念以官方文件為準（ROS 2、Nav2、SLAM Toolbox 等，
連結見頁尾）。
