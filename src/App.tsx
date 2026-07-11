import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/layout/Sidebar";
import { ProgressBar } from "@/components/layout/ProgressBar";
import { Hero } from "@/components/layout/Hero";
import { Footer } from "@/components/layout/Footer";

import { Overview } from "@/components/sections/Overview";
import { Ros2 } from "@/components/sections/Ros2";
import { Lidar } from "@/components/sections/Lidar";
import { Fusion } from "@/components/sections/Fusion";
import { Slam } from "@/components/sections/Slam";
import { Localization } from "@/components/sections/Localization";
import { Navigation } from "@/components/sections/Navigation";
import { Costmap } from "@/components/sections/Costmap";
import { Avoidance } from "@/components/sections/Avoidance";
import { BehaviorTree } from "@/components/sections/BehaviorTree";
import { Kinematics } from "@/components/sections/Kinematics";
import { Safety } from "@/components/sections/Safety";
import { Innovation } from "@/components/sections/Innovation";

export default function App() {
  return (
    <TooltipProvider delayDuration={200}>
      <ProgressBar />
      <div className="lg:flex">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <Hero />
          <div className="mx-auto max-w-6xl px-6">
            <Overview />
            <Ros2 />
            <Lidar />
            <Fusion />
            <Slam />
            <Localization />
            <Navigation />
            <Costmap />
            <Avoidance />
            <BehaviorTree />
            <Kinematics />
            <Safety />
            <Innovation />
          </div>
          <Footer />
        </main>
      </div>
    </TooltipProvider>
  );
}
