import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export function Panel({
  index,
  title,
  meta,
  children,
  className,
  bodyClassName,
}: {
  index?: string;
  title: string;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  const id = `panel-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <section aria-labelledby={id} className={cn("panel flex min-w-0 flex-col", className)}>
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-border px-5 py-3">
        <h2 id={id} className="label-micro text-foreground">
          {index && <span className="text-muted-foreground">{index} / </span>}
          {title}
        </h2>
        {meta && <div className="flex flex-wrap items-center gap-2">{meta}</div>}
      </header>
      <div className={cn("min-w-0 flex-1 p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

const chipVariants = cva(
  "inline-flex items-center gap-1.5 rounded-sm border px-2 py-[3px] font-mono text-[10px] font-medium uppercase leading-none tracking-[0.12em] whitespace-nowrap",
  {
    variants: {
      tone: {
        outline: "border-border bg-card text-muted-foreground",
        solid: "border-primary bg-primary text-primary-foreground",
        warning: "border-warning bg-warning text-warning-foreground",
        planned: "border-dashed border-contour-strong bg-transparent text-muted-foreground",
        dark: "border-graphite-border bg-graphite-muted text-graphite-foreground",
      },
    },
    defaultVariants: { tone: "outline" },
  },
);

export function Chip({
  tone,
  dot,
  children,
  className,
}: VariantProps<typeof chipVariants> & { dot?: "live" | "idle" | "warn"; children: ReactNode; className?: string }) {
  return (
    <span className={cn(chipVariants({ tone }), className)}>
      {dot && (
        <span
          aria-hidden
          className={cn(
            "size-1.5 rounded-full",
            dot === "warn" && "bg-warning-foreground animate-buzzer",
            dot === "live" && "bg-current",
            dot === "idle" && "border border-current",
          )}
        />
      )}
      {children}
    </span>
  );
}

export function DemoTag({ className, children = "DEMO" }: { className?: string; children?: ReactNode }) {
  return <span className={cn("demo-tag", className)}>{children}</span>;
}

export function Metric({
  label,
  value,
  unit,
  sub,
  demo = true,
  className,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  sub?: ReactNode;
  demo?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex items-center gap-2">
        <span className="label-nano text-muted-foreground">{label}</span>
        {demo && <DemoTag />}
      </div>
      <div className="mt-1.5 flex items-baseline gap-1 font-mono text-lg font-medium tabular-nums text-foreground">
        {value}
        {unit && <span className="text-xs font-normal text-muted-foreground">{unit}</span>}
      </div>
      {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden>
      <rect x="0.5" y="0.5" width="31" height="31" rx="2" className="fill-primary" />
      <path d="M5 22 C10 21 12 14 16 12 C20 10 23 14 27 13" className="fill-none stroke-primary-foreground" strokeWidth="1.2" />
      <path d="M5 26 C11 25 13 18 17 16.5 C21 15 24 18 27 17.5" className="fill-none stroke-primary-foreground/50" strokeWidth="1" />
      <path d="M5 18 C9 17 11 10 15 8 C19 6 22 9 27 8.5" className="fill-none stroke-primary-foreground/50" strokeWidth="1" />
      <line x1="21" y1="20" x2="21" y2="27" className="stroke-warning" strokeWidth="1.6" />
    </svg>
  );
}