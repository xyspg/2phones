import { CAPTION_CLASS } from "../shared.tsx";
import { type Scene, easeOut, sceneProgress } from "../timeline.ts";

const INTERVENTIONS = [
  {
    n: "01",
    title: "No personalization on pay",
    d: "Pay is based only on trip variables: time, distance, zone, and waiting time. Not on a driver's individual desperation signals.",
  },
  {
    n: "02",
    title: "Mandatory algorithm disclosure",
    d: "Uber, Doordash, Instacart, and similar platforms must publish a reproducible pay formula that the public can audit.",
  },
  {
    n: "03",
    title: "Driver-owned audits",
    d: "Independent driver-led organizations hold standing audit rights over the model. This includes the software engineers who drive part-time.",
  },
];

export function SceneCredits({ t, scene }: { t: number; scene: Scene }) {
  const p = sceneProgress(t, scene);
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-9 px-6 py-16 sm:px-10 sm:py-20">
      <div className={CAPTION_CLASS} style={{ opacity: easeOut(p * 3) }}>
        Proposed Intervention
      </div>
      <h2
        className="m-0 max-w-[1100px] text-center font-serif text-[clamp(30px,5.5vw,72px)] font-normal leading-[1.05] tracking-[-0.02em]"
        style={{
          opacity: easeOut((p - 0.1) * 2.5),
          transform: `translateY(${(1 - easeOut((p - 0.1) * 2.5)) * 16}px)`,
        }}
      >
        Right to <em className="italic">read</em> the formula.
        <br />
        Right to <em className="italic">refuse</em> personalized pay.
      </h2>
      <div
        className="grid w-full max-w-[1000px] grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-[18px]"
        style={{ opacity: easeOut((p - 0.3) * 2) }}
      >
        {INTERVENTIONS.map((x) => (
          <div
            key={x.n}
            className="rounded-[14px] bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.04),0_8px_24px_-10px_rgba(0,0,0,0.1)]"
          >
            <div className="mb-2 font-mono text-[11px] text-ink/45">{x.n}</div>
            <div className="mb-1.5 font-serif text-[20px] font-normal tracking-[-0.01em] sm:text-[22px]">
              {x.title}
            </div>
            <div className="text-[12.5px] leading-[1.5] text-ink/60">{x.d}</div>
          </div>
        ))}
      </div>
      <div
        className="mt-6 flex flex-col items-center gap-1.5 border-t border-ink/[0.12] pt-6"
        style={{ opacity: easeOut((p - 0.55) * 2) }}
      >
        <div className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink/45">
          Case Study · Global Works and Society: Modernity
        </div>
        <div className="font-serif text-[20px] font-normal italic text-ink/70 sm:text-[22px]">
          Patrick Yu · Eloise Yang · Jiaming Kang
        </div>
      </div>
    </div>
  );
}
