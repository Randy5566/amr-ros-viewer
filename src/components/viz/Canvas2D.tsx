import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/useInView";

export interface Canvas2DProps {
  /** 每幀繪製回呼。收到 2D context、邏輯寬高（CSS 像素）、dt 秒與累積時間 t。 */
  draw: (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    dt: number,
    t: number,
  ) => void;
  className?: string;
  /** 是否持續動畫；false 時只在尺寸變化時重繪一次。 */
  animate?: boolean;
  /** 靜態模式下，改變此值可強制重繪一次。 */
  redrawKey?: unknown;
  ariaLabel?: string;
}

/**
 * 處理 devicePixelRatio 縮放、尺寸變化與離屏暫停的 2D Canvas 封裝。
 */
export function Canvas2D({
  draw,
  className,
  animate = true,
  redrawKey,
  ariaLabel,
}: Canvas2DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { ref: wrapRef, inView } = useInView<HTMLDivElement>({
    threshold: 0.05,
  });
  const drawRef = useRef(draw);
  drawRef.current = draw;
  const sizeRef = useRef({ w: 0, h: 0 });

  // 尺寸與 DPI 管理
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      sizeRef.current = { w: rect.width, h: rect.height };
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        // 靜態模式下尺寸變化即重繪
        drawRef.current(ctx, rect.width, rect.height, 0, 0);
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 動畫迴圈
  useEffect(() => {
    if (!animate || !inView) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let last = performance.now();
    let elapsed = 0;
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      elapsed += dt;
      const { w, h } = sizeRef.current;
      drawRef.current(ctx, w, h, dt, elapsed);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [animate, inView]);

  // 靜態模式：redrawKey 變更時重繪一次
  useEffect(() => {
    if (animate) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    const { w, h } = sizeRef.current;
    if (w > 0 && h > 0) drawRef.current(ctx, w, h, 0, 0);
  }, [redrawKey, animate]);

  return (
    <div
      ref={wrapRef}
      className={cn("relative h-full w-full min-w-0 overflow-hidden", className)}
    >
      {/* 絕對定位讓 canvas 不參與版面寬度計算，避免 ResizeObserver 反饋放大 */}
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={ariaLabel}
        className="absolute inset-0 block h-full w-full"
      />
    </div>
  );
}
