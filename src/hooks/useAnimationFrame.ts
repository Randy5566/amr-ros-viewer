import { useEffect, useRef } from "react";

/**
 * 以 requestAnimationFrame 驅動的動畫迴圈。
 * callback 收到 (dt 秒, 累積時間 t 秒)。當 active 為 false 時暫停。
 */
export function useAnimationFrame(
  callback: (dt: number, t: number) => void,
  active = true,
) {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let last = performance.now();
    let elapsed = 0;
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      elapsed += dt;
      cbRef.current(dt, elapsed);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active]);
}
