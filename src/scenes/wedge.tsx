import { FELIX, MARCUS, RIDER_PRICE_A, RIDER_PRICE_B } from "../data.ts";
import { CAPTION_CLASS, StatRow } from "../shared.tsx";
import { type Scene, easeOut, sceneProgress } from "../timeline.ts";

export function SceneWedge({ t, scene }: { t: number; scene: Scene }) {
  const p = sceneProgress(t, scene);
  const animP = easeOut(p * 1.4);
  const riderHi = RIDER_PRICE_B;
  const driverLo = FELIX.payout;
  const platformCut = riderHi - driverLo;

  return (
    <div className="flex flex-1 flex-col items-center gap-9 px-5 py-12 sm:px-10 sm:py-[60px]">
      <div className="max-w-[800px] text-center">
        <div className={`${CAPTION_CLASS} mb-3.5`}>Where the difference goes</div>
        <h2 className="m-0 font-serif text-[clamp(28px,5vw,64px)] font-normal leading-[1.05] tracking-[-0.02em]">
          The platform pockets <em className="italic">both</em> sides of the spread.
        </h2>
      </div>

      <div className="w-full max-w-[920px] rounded-[18px] bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.04),0_24px_60px_-20px_rgba(0,0,0,0.12)] sm:p-9">
        <div className="mb-5 flex flex-col gap-2">
          <div className="flex justify-between text-[12px] text-ink/55">
            <span>iPhone rider pays</span>
            <span className="num-tab font-semibold text-ink">
              ${riderHi.toFixed(2)}
            </span>
          </div>
          <div className="relative h-2.5 overflow-hidden rounded-full bg-[#f0eee9]">
            <div
              className="absolute inset-y-0 left-0 bg-ink"
              style={{
                width: `${(driverLo / riderHi) * 100 * animP}%`,
                transition: "width 0.6s",
              }}
            />
            <div
              className="absolute inset-y-0"
              style={{
                left: `${(driverLo / riderHi) * 100}%`,
                width: `${((riderHi - driverLo) / riderHi) * 100 * animP}%`,
                background: "repeating-linear-gradient(45deg, #111 0 2px, #fff 2px 6px)",
                transition: "width 0.6s",
              }}
            />
          </div>
          <div className="flex justify-between font-mono text-[11px] text-ink/55">
            <span>Driver gets ${driverLo.toFixed(2)}</span>
            <span className="font-semibold text-ink">
              Platform takes ${platformCut.toFixed(2)} (
              {Math.round((platformCut / riderHi) * 100)}%)
            </span>
          </div>
        </div>

        <div className="mt-3.5 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
          <StatRow
            label="Rider pays (Phone A → Android)"
            value={`$${RIDER_PRICE_A.toFixed(2)}`}
            delay={0.4}
            t={t}
            scene={scene}
          />
          <StatRow
            label="Rider pays (Phone B → iPhone)"
            value={`$${RIDER_PRICE_B.toFixed(2)}`}
            delay={0.6}
            t={t}
            scene={scene}
          />
          <StatRow
            label="Driver A receives"
            value={`$${MARCUS.payout.toFixed(2)}`}
            delay={0.8}
            t={t}
            scene={scene}
          />
          <StatRow
            label="Driver B receives"
            value={`$${FELIX.payout.toFixed(2)}`}
            delay={1.0}
            t={t}
            scene={scene}
          />
          <StatRow label="Headline 'commission'" value="~25%" delay={1.2} t={t} scene={scene} />
          <StatRow
            label="This trip's actual take"
            value={`${Math.round((platformCut / riderHi) * 100)}%`}
            delay={1.4}
            t={t}
            scene={scene}
          />
        </div>

        <div
          className="mt-5 rounded-[10px] bg-paper px-4 py-3.5 text-[12.5px] leading-[1.5] text-ink/70 sm:text-[13px]"
          style={{ opacity: easeOut((p - 0.5) * 2) }}
        >
          As Dubal documents, after Uber's 2022 switch to "Upfront Pricing", the
          driver's base pay is set by a separate black-box algorithm, no longer tied
          to what the rider is charged. Both sides are personalized to the maximum
          each will tolerate.
        </div>
      </div>
    </div>
  );
}
