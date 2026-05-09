import { CAPTION_CLASS } from "../shared.tsx";
import { type Scene, easeOut, sceneProgress } from "../timeline.ts";

export function SceneIntro({ t, scene }: { t: number; scene: Scene }) {
  const p = sceneProgress(t, scene);
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-7 px-6 pb-10 pt-20 sm:px-10 sm:pt-20">
      <div className={CAPTION_CLASS} style={{ opacity: easeOut(p * 4) }}>
        A Case Study in Algorithmic Wage Discrimination
      </div>
      <h1
        className="m-0 max-w-[1100px] text-center font-serif text-[clamp(44px,8vw,120px)] font-normal leading-[0.95] tracking-[-0.02em]"
        style={{
          opacity: easeOut((p - 0.1) * 3),
          transform: `translateY(${(1 - easeOut((p - 0.1) * 3)) * 20}px)`,
        }}
      >
        Two phones.
        <br />
        <em className="italic text-ink/55">Same trip.</em>
      </h1>
      <div
        className="max-w-[560px] text-center text-[15px] leading-[1.5] text-ink/60 sm:text-[16px]"
        style={{ opacity: easeOut((p - 0.4) * 3) }}
      >
        Watch what each phone is told it should pay.
      </div>
    </div>
  );
}
