import type { LucideIcon } from "lucide-react";
import {
  Layers,
  Network,
  Radar,
  Gauge,
  Map,
  Crosshair,
  Route,
  Grid3x3,
  ShieldAlert,
  GitBranch,
  Cog,
  Siren,
  Lightbulb,
} from "lucide-react";

export interface NavItem {
  id: string;
  no: string;
  title: string;
  short: string;
  icon: LucideIcon;
}

export const NAV: NavItem[] = [
  { id: "overview", no: "01", title: "系統總覽", short: "底車不是只有輪子", icon: Layers },
  { id: "ros2", no: "02", title: "ROS 2 骨幹", short: "節點・主題・服務・動作", icon: Network },
  { id: "lidar", no: "03", title: "LiDAR 光達", short: "ToF 測距與點雲", icon: Radar },
  { id: "fusion", no: "04", title: "里程計與融合", short: "輪速・IMU・感測融合", icon: Gauge },
  { id: "slam", no: "05", title: "SLAM 建圖", short: "同時定位與地圖建立", icon: Map },
  { id: "localization", no: "06", title: "定位 AMCL", short: "粒子濾波與重定位", icon: Crosshair },
  { id: "navigation", no: "07", title: "導航 Nav2", short: "全域與局部路徑", icon: Route },
  { id: "costmap", no: "08", title: "成本地圖", short: "膨脹層與安全距離", icon: Grid3x3 },
  { id: "avoidance", no: "09", title: "分層避障", short: "警告區與保護區", icon: ShieldAlert },
  { id: "behaviortree", no: "10", title: "行為樹", short: "導航行為的大腦", icon: GitBranch },
  { id: "kinematics", no: "11", title: "運動控制", short: "cmd_vel 到馬達", icon: Cog },
  { id: "safety", no: "12", title: "安全與失效", short: "失效情境與分層安全", icon: Siren },
  { id: "innovation", no: "13", title: "創新方向", short: "可精進與商品化路線", icon: Lightbulb },
];
