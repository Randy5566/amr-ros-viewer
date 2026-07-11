import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Pause, Play, RotateCcw } from "lucide-react";

/** 房間輪廓與障礙，以 2D 線段（俯視）定義；LiDAR 在此平面掃描。 */
type Seg = [number, number, number, number]; // x1,z1,x2,z2

const ROOM: Seg[] = [
  [-6, -4, 6, -4],
  [6, -4, 6, 4],
  [6, 4, -6, 4],
  [-6, 4, -6, -4],
];
// 障礙：柱子與展示櫃（矩形拆成 4 段）
function rect(cx: number, cz: number, w: number, d: number): Seg[] {
  const x1 = cx - w / 2;
  const x2 = cx + w / 2;
  const z1 = cz - d / 2;
  const z2 = cz + d / 2;
  return [
    [x1, z1, x2, z1],
    [x2, z1, x2, z2],
    [x2, z2, x1, z2],
    [x1, z2, x1, z1],
  ];
}
const OBSTACLES: Seg[] = [
  ...rect(2.6, -1.5, 0.8, 0.8),
  ...rect(-3, 1.8, 1.6, 0.7),
  ...rect(3.2, 2.2, 0.7, 1.4),
];
const ALL_SEGS = [...ROOM, ...OBSTACLES];

/** 射線與線段交點距離（無交點回傳 Infinity）。原點 (ox,oz)，方向角 a。 */
function rayCast(ox: number, oz: number, a: number): number {
  const dx = Math.cos(a);
  const dz = Math.sin(a);
  let best = Infinity;
  for (const [x1, z1, x2, z2] of ALL_SEGS) {
    const ex = x2 - x1;
    const ez = z2 - z1;
    const denom = dx * ez - dz * ex;
    if (Math.abs(denom) < 1e-9) continue;
    const t = ((x1 - ox) * ez - (z1 - oz) * ex) / denom;
    const u = ((x1 - ox) * dz - (z1 - oz) * dx) / denom;
    if (t > 0 && u >= 0 && u <= 1 && t < best) best = t;
  }
  return best;
}

const SCAN_HEIGHT = 0.55;
const RAY_COUNT = 220;
const MAX_POINTS = RAY_COUNT * 3;

function Robot() {
  return (
    <group>
      {/* 底盤 */}
      <mesh position={[0, 0.18, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.46, 0.36, 32]} />
        <meshStandardMaterial color="#1e293b" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* LiDAR 本體 */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.16, 24]} />
        <meshStandardMaterial
          color="#0ea5e9"
          emissive="#0ea5e9"
          emissiveIntensity={0.5}
        />
      </mesh>
      {/* 立柱與雙螢幕（高機身服務機器人） */}
      <mesh position={[0, 1.05, 0]}>
        <boxGeometry args={[0.18, 1.0, 0.18]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[0, 1.5, 0.02]}>
        <boxGeometry args={[0.7, 0.5, 0.06]} />
        <meshStandardMaterial
          color="#0f172a"
          emissive="#38bdf8"
          emissiveIntensity={0.35}
        />
      </mesh>
      {/* 輪子 */}
      {[-0.4, 0.4].map((x) => (
        <mesh key={x} position={[x, 0.12, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.12, 0.12, 0.08, 20]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      ))}
    </group>
  );
}

function ScanSystem({ running }: { running: boolean }) {
  const angleRef = useRef(0);
  const pointsRef = useRef<THREE.Points>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  const writeIdx = useRef(0);

  const positions = useMemo(() => new Float32Array(MAX_POINTS * 3), []);
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setDrawRange(0, 0);
    return g;
  }, [positions]);

  useFrame((_, delta) => {
    if (!running) return;
    const speed = 3.2; // rad/s
    const steps = 4;
    for (let s = 0; s < steps; s++) {
      angleRef.current += (speed * delta) / steps;
      const a = angleRef.current;
      const dist = rayCast(0, 0, a);
      if (dist !== Infinity && dist < 30) {
        const px = Math.cos(a) * dist;
        const pz = Math.sin(a) * dist;
        const i = (writeIdx.current % MAX_POINTS) * 3;
        positions[i] = px;
        positions[i + 1] = SCAN_HEIGHT;
        positions[i + 2] = pz;
        writeIdx.current++;
      }
    }
    const count = Math.min(writeIdx.current, MAX_POINTS);
    geom.setDrawRange(0, count);
    geom.attributes.position.needsUpdate = true;

    // 掃描光束（細長平面）
    if (beamRef.current) {
      const a = angleRef.current;
      const dist = Math.min(rayCast(0, 0, a), 12);
      beamRef.current.position.set(
        (Math.cos(a) * dist) / 2,
        SCAN_HEIGHT,
        (Math.sin(a) * dist) / 2,
      );
      beamRef.current.rotation.y = -a;
      beamRef.current.scale.x = dist;
    }
  });

  return (
    <>
      <points ref={pointsRef} geometry={geom}>
        <pointsMaterial
          size={0.09}
          color="#f43f5e"
          sizeAttenuation
          transparent
          opacity={0.95}
        />
      </points>
      <mesh ref={beamRef} position={[0, SCAN_HEIGHT, 0]}>
        <planeGeometry args={[1, 0.015]} />
        <meshBasicMaterial
          color="#f43f5e"
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
}

function Walls() {
  return (
    <group>
      {ALL_SEGS.map(([x1, z1, x2, z2], i) => {
        const cx = (x1 + x2) / 2;
        const cz = (z1 + z2) / 2;
        const len = Math.hypot(x2 - x1, z2 - z1);
        const angle = Math.atan2(z2 - z1, x2 - x1);
        const isRoom = i < ROOM.length;
        return (
          <mesh
            key={i}
            position={[cx, isRoom ? 0.75 : 0.45, cz]}
            rotation={[0, -angle, 0]}
          >
            <boxGeometry args={[len, isRoom ? 1.5 : 0.9, 0.08]} />
            <meshStandardMaterial
              color={isRoom ? "#1e293b" : "#475569"}
              transparent
              opacity={isRoom ? 0.55 : 0.85}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export function LidarScene3D() {
  const [running, setRunning] = useState(true);
  const [resetKey, setResetKey] = useState(0);

  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-xl border border-border/60 bg-[#070d18]">
      <Canvas
        shadows
        camera={{ position: [7, 6.5, 8.5], fov: 42 }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#070d18"]} />
        <fog attach="fog" args={["#070d18", 16, 32]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[6, 10, 4]} intensity={1.1} castShadow />
        <pointLight position={[0, 3, 0]} intensity={0.6} color="#38bdf8" />

        <Grid
          args={[24, 16]}
          cellSize={1}
          cellColor="#1e293b"
          sectionSize={4}
          sectionColor="#334155"
          fadeDistance={26}
          infiniteGrid
          position={[0, 0.01, 0]}
        />

        <Robot />
        <Walls />
        <ScanSystem key={resetKey} running={running} />

        <OrbitControls
          enablePan={false}
          minDistance={6}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2.15}
          autoRotate={running}
          autoRotateSpeed={0.35}
        />
      </Canvas>

      <div className="pointer-events-none absolute left-3 top-3 rounded-md bg-black/40 px-2.5 py-1 text-xs text-muted-foreground backdrop-blur">
        拖曳可旋轉視角 · 紅點為 <span className="text-rose-400">/scan</span> 點雲
      </div>
      <div className="absolute bottom-3 right-3 flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setRunning((r) => !r)}
        >
          {running ? <Pause /> : <Play />}
          {running ? "暫停" : "掃描"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setResetKey((k) => k + 1)}
        >
          <RotateCcw /> 清除
        </Button>
      </div>
    </div>
  );
}
