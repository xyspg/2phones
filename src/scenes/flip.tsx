import { CAPTION_CLASS } from "../shared.tsx";
import { type Scene, easeOut, sceneProgress } from "../timeline.ts";

export function SceneFlip({ t, scene }: { t: number; scene: Scene }) {
  const p = sceneProgress(t, scene);
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-16 sm:px-10 sm:py-[60px]">
      <div className={CAPTION_CLASS} style={{ opacity: easeOut(p * 3) }}>
        Now flip it →
      </div>
      <h2
        className="m-0 max-w-[1000px] text-center font-serif text-[clamp(32px,6vw,84px)] font-normal leading-[1.05] tracking-[-0.02em]"
        style={{
          opacity: easeOut((p - 0.15) * 3),
          transform: `translateY(${(1 - easeOut((p - 0.15) * 3)) * 16}px)`,
        }}
      >
        The same algorithm runs against the{" "}
        <em className="italic text-ink/55">drivers</em>.
      </h2>
      <div
        className="max-w-[540px] text-center text-[14px] leading-[1.5] text-ink/55 sm:text-[15px]"
        style={{ opacity: easeOut((p - 0.4) * 3) }}
      >
        Two drivers, same intersection. The platform offers each a different payout for the
        exact same trip, based on what it predicts they will accept.
      </div>
    </div>
  );
}
