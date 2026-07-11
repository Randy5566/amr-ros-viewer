import { describe, it, expect } from "vitest";
import {
  tofDistance,
  tofRoundTripTime,
  twistToWheelSpeeds,
  wheelSpeedsToTwist,
  driveMode,
  integratePose,
  normalizeAngle,
  astar,
  inflateCostmap,
  resampleParticles,
  estimatePose,
  CELL_FREE,
  CELL_OCCUPIED,
  type Particle,
} from "./robotics";

describe("ToF 飛時測距", () => {
  it("距離 = 光速 × 來回時間 ÷ 2", () => {
    // 光走 2 公尺來回需約 6.67 ns
    const t = tofRoundTripTime(2);
    expect(tofDistance(t)).toBeCloseTo(2, 6);
  });

  it("往返時間與距離互為反函式", () => {
    for (const d of [0.05, 1, 5, 25]) {
      expect(tofDistance(tofRoundTripTime(d))).toBeCloseTo(d, 6);
    }
  });
});

describe("差速底車運動學", () => {
  const wheelSep = 0.5;

  it("純前進：左右輪同速", () => {
    const w = twistToWheelSpeeds({ linear: 0.6, angular: 0 }, wheelSep);
    expect(w.left).toBeCloseTo(0.6);
    expect(w.right).toBeCloseTo(0.6);
    expect(driveMode(w)).toBe("直線前進");
  });

  it("原地旋轉：左右輪等速反向", () => {
    const w = twistToWheelSpeeds({ linear: 0, angular: 1 }, wheelSep);
    expect(w.left).toBeCloseTo(-0.25);
    expect(w.right).toBeCloseTo(0.25);
    expect(driveMode(w)).toBe("原地旋轉");
  });

  it("向左轉：右輪快於左輪", () => {
    const w = twistToWheelSpeeds({ linear: 0.4, angular: 0.5 }, wheelSep);
    expect(w.right).toBeGreaterThan(w.left);
    expect(driveMode(w)).toBe("向左轉");
  });

  it("正逆運動學互為反函式", () => {
    const twist = { linear: 0.35, angular: -0.6 };
    const back = wheelSpeedsToTwist(
      twistToWheelSpeeds(twist, wheelSep),
      wheelSep,
    );
    expect(back.linear).toBeCloseTo(twist.linear);
    expect(back.angular).toBeCloseTo(twist.angular);
  });

  it("靜止時判定為靜止", () => {
    expect(driveMode({ left: 0, right: 0 })).toBe("靜止");
  });
});

describe("位姿積分與角度正規化", () => {
  it("直線前進沿 x 軸推進", () => {
    const p = integratePose({ x: 0, y: 0, theta: 0 }, { linear: 1, angular: 0 }, 1);
    expect(p.x).toBeCloseTo(1);
    expect(p.y).toBeCloseTo(0);
  });

  it("角度正規化到 (-π, π]", () => {
    expect(normalizeAngle(3 * Math.PI)).toBeCloseTo(Math.PI);
    expect(normalizeAngle(-3 * Math.PI)).toBeCloseTo(Math.PI);
    expect(normalizeAngle(0)).toBeCloseTo(0);
  });
});

describe("A* 全域路徑規劃", () => {
  it("空曠網格找到最短路徑", () => {
    const grid = Array.from({ length: 5 }, () => new Array(5).fill(CELL_FREE));
    const path = astar(grid, { x: 0, y: 0 }, { x: 4, y: 4 });
    expect(path.length).toBeGreaterThan(0);
    expect(path[0]).toEqual({ x: 0, y: 0 });
    expect(path[path.length - 1]).toEqual({ x: 4, y: 4 });
  });

  it("繞過障礙牆", () => {
    const grid = Array.from({ length: 5 }, () => new Array(5).fill(CELL_FREE));
    for (let y = 0; y < 4; y++) grid[y][2] = CELL_OCCUPIED; // 中間一道牆留下缺口
    const path = astar(grid, { x: 0, y: 0 }, { x: 4, y: 0 });
    expect(path.length).toBeGreaterThan(0);
    // 不可穿越障礙格
    for (const p of path) expect(grid[p.y][p.x]).not.toBe(CELL_OCCUPIED);
  });

  it("完全封閉時回傳空路徑", () => {
    const grid = Array.from({ length: 5 }, () => new Array(5).fill(CELL_FREE));
    for (let y = 0; y < 5; y++) grid[y][2] = CELL_OCCUPIED; // 整道牆
    const path = astar(grid, { x: 0, y: 0 }, { x: 4, y: 0 });
    expect(path).toHaveLength(0);
  });
});

describe("膨脹層成本地圖", () => {
  it("障礙核心成本為 1，遠處為 0", () => {
    const grid = Array.from({ length: 7 }, () => new Array(7).fill(CELL_FREE));
    grid[3][3] = CELL_OCCUPIED;
    const cost = inflateCostmap(grid, 2);
    expect(cost[3][3]).toBe(1);
    expect(cost[0][0]).toBe(0); // 距離超過膨脹半徑
    expect(cost[3][4]).toBeGreaterThan(0); // 鄰近格具有成本
    expect(cost[3][4]).toBeLessThan(1);
  });
});

describe("AMCL 粒子濾波", () => {
  it("重採樣後粒子數不變且權重正規化", () => {
    const particles: Particle[] = [
      { x: 0, y: 0, theta: 0, weight: 0.1 },
      { x: 1, y: 1, theta: 0, weight: 0.7 },
      { x: 2, y: 2, theta: 0, weight: 0.2 },
    ];
    const out = resampleParticles(particles);
    expect(out).toHaveLength(3);
    const total = out.reduce((s, p) => s + p.weight, 0);
    expect(total).toBeCloseTo(1);
  });

  it("重採樣偏好高權重粒子", () => {
    const particles: Particle[] = [
      { x: 0, y: 0, theta: 0, weight: 0.001 },
      { x: 5, y: 5, theta: 0, weight: 0.999 },
    ];
    const out = resampleParticles(particles);
    // 幾乎所有粒子應收斂到 (5,5) 附近
    const near = out.filter((p) => p.x === 5).length;
    expect(near).toBeGreaterThanOrEqual(1);
  });

  it("加權平均位姿估計", () => {
    const particles: Particle[] = [
      { x: 0, y: 0, theta: 0, weight: 1 },
      { x: 2, y: 0, theta: 0, weight: 1 },
    ];
    const pose = estimatePose(particles);
    expect(pose.x).toBeCloseTo(1);
  });
});
