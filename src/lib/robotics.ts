/**
 * 底車核心運算函式庫。
 * 這些為純函式，同時支撐視覺化元件與單元測試（vitest）。
 */

export const SPEED_OF_LIGHT = 299_792_458; // m/s

/**
 * ToF 飛時測距：距離 = 光速 × 來回時間 ÷ 2。
 * @param roundTripSeconds 光線來回總時間（秒）
 */
export function tofDistance(roundTripSeconds: number): number {
  return (SPEED_OF_LIGHT * roundTripSeconds) / 2;
}

/** 由距離反推 ToF 來回時間（秒）。 */
export function tofRoundTripTime(distanceMeters: number): number {
  return (2 * distanceMeters) / SPEED_OF_LIGHT;
}

export interface WheelSpeeds {
  left: number; // m/s
  right: number; // m/s
}

export interface Twist {
  linear: number; // linear.x, m/s
  angular: number; // angular.z, rad/s
}

/**
 * 差速底車正運動學：由 /cmd_vel(linear.x, angular.z) 轉為左右輪線速度。
 * 左輪速度 = 前進速度 - 旋轉修正；右輪速度 = 前進速度 + 旋轉修正。
 * @param wheelSeparation 兩輪中心間距（m）
 */
export function twistToWheelSpeeds(
  twist: Twist,
  wheelSeparation: number,
): WheelSpeeds {
  const correction = (twist.angular * wheelSeparation) / 2;
  return {
    left: twist.linear - correction,
    right: twist.linear + correction,
  };
}

/**
 * 差速底車逆運動學：由左右輪線速度回推 /cmd_vel。
 */
export function wheelSpeedsToTwist(
  wheels: WheelSpeeds,
  wheelSeparation: number,
): Twist {
  return {
    linear: (wheels.left + wheels.right) / 2,
    angular: (wheels.right - wheels.left) / wheelSeparation,
  };
}

/** 定性描述差速底車的運動模式。 */
export function driveMode(wheels: WheelSpeeds): string {
  const { left, right } = wheels;
  const eps = 1e-6;
  if (Math.abs(left - right) < eps) {
    if (Math.abs(left) < eps) return "靜止";
    return left > 0 ? "直線前進" : "直線後退";
  }
  if (Math.abs(left + right) < eps && Math.abs(left) > eps) return "原地旋轉";
  return right > left ? "向左轉" : "向右轉";
}

export interface Pose {
  x: number;
  y: number;
  theta: number; // rad
}

/**
 * 以差速運動學對機器人位姿積分一個時間步（里程計推算）。
 */
export function integratePose(
  pose: Pose,
  twist: Twist,
  dt: number,
): Pose {
  const theta = pose.theta + twist.angular * dt;
  return {
    x: pose.x + twist.linear * Math.cos(theta) * dt,
    y: pose.y + twist.linear * Math.sin(theta) * dt,
    theta,
  };
}

/** 將角度正規化到 (-π, π]。 */
export function normalizeAngle(angle: number): number {
  let a = angle % (2 * Math.PI);
  if (a > Math.PI) a -= 2 * Math.PI;
  if (a <= -Math.PI) a += 2 * Math.PI;
  return a;
}

// ---------------------------------------------------------------------------
// Occupancy grid + A* 全域路徑規劃
// ---------------------------------------------------------------------------

export const CELL_FREE = 0;
export const CELL_OCCUPIED = 1;
export const CELL_UNKNOWN = -1;

export interface GridPoint {
  x: number;
  y: number;
}

/**
 * 4/8 連通網格上的 A* 搜尋。回傳從 start 到 goal 的節點路徑，
 * 若無法到達則回傳空陣列。grid[y][x] 為 CELL_OCCUPIED 代表不可通行。
 */
export function astar(
  grid: number[][],
  start: GridPoint,
  goal: GridPoint,
  allowDiagonal = true,
): GridPoint[] {
  const h = grid.length;
  const w = grid[0]?.length ?? 0;
  const inBounds = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < w && y < h;
  const passable = (x: number, y: number) =>
    inBounds(x, y) && grid[y][x] !== CELL_OCCUPIED;

  if (!passable(start.x, start.y) || !passable(goal.x, goal.y)) return [];

  const key = (x: number, y: number) => y * w + x;
  const heuristic = (x: number, y: number) => {
    const dx = Math.abs(x - goal.x);
    const dy = Math.abs(y - goal.y);
    return allowDiagonal
      ? Math.max(dx, dy) + (Math.SQRT2 - 1) * Math.min(dx, dy)
      : dx + dy;
  };

  const neighbors = allowDiagonal
    ? [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ]
    : [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ];

  const gScore = new Map<number, number>();
  const cameFrom = new Map<number, number>();
  const open: { x: number; y: number; f: number }[] = [];

  gScore.set(key(start.x, start.y), 0);
  open.push({ x: start.x, y: start.y, f: heuristic(start.x, start.y) });

  while (open.length > 0) {
    let bestIdx = 0;
    for (let i = 1; i < open.length; i++) {
      if (open[i].f < open[bestIdx].f) bestIdx = i;
    }
    const current = open.splice(bestIdx, 1)[0];
    const ck = key(current.x, current.y);

    if (current.x === goal.x && current.y === goal.y) {
      const path: GridPoint[] = [];
      let node: number | undefined = ck;
      while (node !== undefined) {
        path.push({ x: node % w, y: Math.floor(node / w) });
        node = cameFrom.get(node);
      }
      return path.reverse();
    }

    for (const [dx, dy] of neighbors) {
      const nx = current.x + dx;
      const ny = current.y + dy;
      if (!passable(nx, ny)) continue;
      // 避免對角穿越牆角
      if (dx !== 0 && dy !== 0) {
        if (!passable(current.x + dx, current.y) || !passable(current.x, current.y + dy))
          continue;
      }
      const step = dx !== 0 && dy !== 0 ? Math.SQRT2 : 1;
      const tentative = (gScore.get(ck) ?? Infinity) + step;
      const nk = key(nx, ny);
      if (tentative < (gScore.get(nk) ?? Infinity)) {
        cameFrom.set(nk, ck);
        gScore.set(nk, tentative);
        const f = tentative + heuristic(nx, ny);
        const existing = open.find((o) => o.x === nx && o.y === ny);
        if (existing) existing.f = f;
        else open.push({ x: nx, y: ny, f });
      }
    }
  }
  return [];
}

/**
 * 產生膨脹層（Inflation Layer）成本地圖。
 * 障礙核心成本 = 1；隨距離線性衰減至 inflationRadius 之外為 0。
 */
export function inflateCostmap(
  grid: number[][],
  inflationRadius: number,
): number[][] {
  const h = grid.length;
  const w = grid[0]?.length ?? 0;
  const cost: number[][] = Array.from({ length: h }, () =>
    new Array(w).fill(0),
  );
  const obstacles: GridPoint[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (grid[y][x] === CELL_OCCUPIED) obstacles.push({ x, y });
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (grid[y][x] === CELL_OCCUPIED) {
        cost[y][x] = 1;
        continue;
      }
      let minDist = Infinity;
      for (const o of obstacles) {
        const d = Math.hypot(o.x - x, o.y - y);
        if (d < minDist) minDist = d;
      }
      if (minDist <= inflationRadius) {
        cost[y][x] = Math.max(0, 1 - minDist / (inflationRadius + 1));
      }
    }
  }
  return cost;
}

// ---------------------------------------------------------------------------
// AMCL 粒子濾波（簡化示意）
// ---------------------------------------------------------------------------

export interface Particle {
  x: number;
  y: number;
  theta: number;
  weight: number;
}

/**
 * 依權重做輪盤法（低變異數）重採樣，回傳新的粒子集合。
 */
export function resampleParticles(particles: Particle[]): Particle[] {
  const n = particles.length;
  if (n === 0) return [];
  const total = particles.reduce((s, p) => s + p.weight, 0);
  if (total <= 0) {
    return particles.map((p) => ({ ...p, weight: 1 / n }));
  }
  const normalized = particles.map((p) => p.weight / total);
  const resampled: Particle[] = [];
  const step = 1 / n;
  let r = Math.random() * step;
  let c = normalized[0];
  let i = 0;
  for (let m = 0; m < n; m++) {
    const u = r + m * step;
    while (u > c && i < n - 1) {
      i++;
      c += normalized[i];
    }
    resampled.push({ ...particles[i], weight: 1 / n });
  }
  return resampled;
}

/** 依權重計算粒子群的加權平均位姿估計。 */
export function estimatePose(particles: Particle[]): Pose {
  const total = particles.reduce((s, p) => s + p.weight, 0) || 1;
  let x = 0;
  let y = 0;
  let sinSum = 0;
  let cosSum = 0;
  for (const p of particles) {
    const wgt = p.weight / total;
    x += p.x * wgt;
    y += p.y * wgt;
    sinSum += Math.sin(p.theta) * wgt;
    cosSum += Math.cos(p.theta) * wgt;
  }
  return { x, y, theta: Math.atan2(sinSum, cosSum) };
}
