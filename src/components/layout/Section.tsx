import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionProps {
  id: string;
  no: string;
  title: string;
  icon: LucideIcon;
  intro?: string;
  children: React.ReactNode;
}

export function Section({ id, no, title, icon: Icon, intro, children }: SectionProps) {
  return (
    <section
      id={id}
      className="scroll-mt-8 border-b border-border/40 py-16 first:pt-8 md:py-20"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6 flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
            <Icon className="size-6" />
          </div>
          <div>
            <div className="mb-1 font-mono text-xs text-primary/80">
              SECTION {no}
            </div>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              {title}
            </h2>
          </div>
        </div>
        {intro && (
          <p className="mb-8 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {intro}
          </p>
        )}
        {children}
      </motion.div>
    </section>
  );
}

export function VizFrame({
  children,
  caption,
  className,
}: {
  children: React.ReactNode;
  caption?: string;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        "overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-3 shadow-xl shadow-black/30",
        className,
      )}
    >
      {children}
      {caption && (
        <figcaption className="px-2 pb-1 pt-3 text-center text-xs text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
