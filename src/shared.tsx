import { type ReactNode } from "react";
import { type Scene, easeOut, sceneProgress } from "./timeline.ts";

export const CAPTION_CLASS =
  "font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-ink/50";

export const EASE = [0.2, 0.8, 0.2, 1] as const;
export const EASE_CSS = `cubic-bezier(${EASE.join(",")})`;

export function StatRow({
  label,
  value,
  delay = 0,
  t,
  scene,
}: {
  label: string;
  value: string;
  delay?: number;
  t: number;
  scene: Scene;
}) {
  const localT = t - scene.start - delay;
  const visible = localT > 0;
  return (
    <div
      className="flex justify-between border-b border-ink/[0.08] py-2 text-xs"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(-8px)",
        transition: `all 0.5s ${EASE_CSS}`,
      }}
    >
      <span className="text-ink/60">{label}</span>
      <span className="num-tab font-semibold">{value}</span>
    </div>
  );
}

export function SidebySidePhones({
  leftPhone,
  rightPhone,
  title,
  subtitle,
  annotation,
  t,
  scene,
}: {
  leftPhone: ReactNode;
  rightPhone: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  annotation?: ReactNode;
  t: number;
  scene: Scene;
}) {
  const p = sceneProgress(t, scene);
  return (
    <div className="flex flex-1 flex-col items-center gap-6 px-6 pb-16 pt-12 sm:px-10 sm:pb-[60px] sm:pt-[50px]">
      <div className="max-w-[900px] text-center">
        {title && (
          <h2
            className="m-0 font-serif text-[clamp(28px,5vw,56px)] font-normal leading-[1.1] tracking-[-0.02em]"
            style={{
              opacity: easeOut(p * 3),
              transform: `translateY(${(1 - easeOut(p * 3)) * 12}px)`,
            }}
          >
            {title}
          </h2>
        )}
        {subtitle && (
          <div
            className="mt-2.5 font-mono text-[13px] tracking-[0.01em] text-ink/55 sm:text-[14.5px]"
            style={{ opacity: easeOut((p - 0.1) * 3) }}
          >
            {subtitle}
          </div>
        )}
      </div>
      <div
        className="flex flex-col items-center gap-12 sm:flex-row sm:items-start sm:gap-12 lg:gap-20"
        style={{
          opacity: easeOut((p - 0.05) * 3),
          transform: `translateY(${(1 - easeOut((p - 0.05) * 3)) * 16}px)`,
        }}
      >
        {leftPhone}
        {rightPhone}
      </div>
      {annotation}
    </div>
  );
}
