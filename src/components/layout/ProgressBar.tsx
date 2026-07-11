import { useScrollProgress } from "@/hooks/useScrollSpy";

export function ProgressBar() {
  const p = useScrollProgress();
  return (
    <div className="fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-primary to-accent transition-[width] duration-150"
        style={{ width: `${p * 100}%` }}
      />
    </div>
  );
}
