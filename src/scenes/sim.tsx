import { useMemo } from "react";
import { CAPTION_CLASS, EASE_CSS } from "../shared.tsx";
import { type Scene } from "../timeline.ts";

// Trip stream is an illustrative scenario, not real driver data. The
// surrounding UI ("Live · the algorithm learns" caption, "Watch the offers
// fall as the model learns" headline) frames the panel as a simulation.
const TRIPS = [
  { mi: 6.4, payTime: 14.2 },
  { mi: 11.2, payTime: 19.8 },
  { mi: 4.1, payTime: 9.4 },
  { mi: 9.0, payTime: 13.6 },
  { mi: 7.7, payTime: 10.2 },
  { mi: 13.5, payTime: 16.4 },
  { mi: 5.8, payTime: 7.8 },
  { mi: 8.6, payTime: 9.9 },
];

// Reserve a tail of the scene so the final state lingers; trips fill the rest evenly.
const TRIPS_TAIL_HOLD_S = 4;
// $1.85/mi is an illustrative baseline, not a sourced figure. NYC TLC's actual
// per-mile minimum is lower and combined with a per-minute rate. The label in
// the UI below is "illustrative baseline" to avoid claiming authority.
const BASE_RATE = 1.85;

export function SceneSim({ t, scene }: { t: number; scene: Scene }) {
  const localT = t - scene.start;
  const trips = useMemo(() => TRIPS, []);

  const tripInterval = Math.max(
    0.5,
    (scene.end - scene.start - TRIPS_TAIL_HOLD_S) / trips.length,
  );
  const tripIdx = Math.min(trips.length, Math.floor(localT / tripInterval));
  const acceptedSoFar = trips.slice(0, tripIdx);

  const avgPerMi =
    acceptedSoFar.length === 0
      ? BASE_RATE
      : acceptedSoFar.reduce((s, x) => s + x.payTime / x.mi, 0) / acceptedSoFar.length;
  const totalEarnings = acceptedSoFar.reduce((s, x) => s + x.payTime, 0);
  const totalMi = acceptedSoFar.reduce((s, x) => s + x.mi, 0);

  const toleranceScore = avgPerMi >= BASE_RATE ? 0.34 : avgPerMi > 1.45 ? 0.61 : 0.83;
  const baseRate = BASE_RATE;

  // Signals split:
  //   Named in our essay (Section 4): acceptance rate, hours online, decline streak.
  //   Plausible but speculative: phone battery, days since payout, tolerance score.
  // The whole panel is a hypothesized reconstruction of the model, not a leaked
  // feature list. Caption above ("Live · the algorithm learns") + the audit-scene
  // copy already flag this as illustrative.
  const profileSignals: { label: string; val: string; t: number; hi?: boolean }[] = [
    { label: "Acceptance rate", val: `${Math.min(98, 60 + tripIdx * 5)}%`, t: 0.5 },
    { label: "Hours online today", val: `${(tripIdx * 0.9).toFixed(1)}h`, t: 1.2 },
    { label: "Last decline streak", val: tripIdx > 3 ? "0" : "2", t: 2.0 },
    { label: "Phone battery", val: `${Math.max(8, 64 - tripIdx * 7)}%`, t: 2.8 },
    { label: "Days since payout", val: `${Math.min(6, tripIdx)}`, t: 3.6 },
    {
      label: "Tolerance score (model)",
      val: toleranceScore.toFixed(2),
      t: 4.4,
      hi: avgPerMi < baseRate,
    },
  ];

  return (
    <div className="flex flex-1 flex-col items-center gap-7 px-5 py-12 sm:px-10 sm:py-[50px]">
      <div className="max-w-[800px] text-center">
        <div className={`${CAPTION_CLASS} mb-3`}>Live · the algorithm learns</div>
        <h2 className="m-0 font-serif text-[clamp(26px,4.5vw,56px)] font-normal leading-[1.05] tracking-[-0.02em]">
          Watch the offers fall as the model learns Felix.
        </h2>
      </div>

      <div className="grid w-full max-w-[1080px] grid-cols-1 gap-5 lg:grid-cols-[1.2fr_1fr] lg:gap-7">
        <div className="min-h-[360px] rounded-2xl bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.04),0_12px_40px_-16px_rgba(0,0,0,0.12)] sm:min-h-[420px] sm:p-[22px]">
          <div className="mb-3.5 flex items-baseline justify-between">
            <div className="text-[12px] font-semibold text-ink">Trip stream · Felix</div>
            <div className="font-mono text-[11px] text-ink/50">
              {tripIdx}/{trips.length} accepted
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            {trips.map((tr, i) => {
              const inFrame = i < tripIdx;
              const ratePerMi = tr.payTime / tr.mi;
              const isLow = ratePerMi < 1.4;
              const isLowInFrame = isLow && inFrame;
              return (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-[12px] transition-all duration-300"
                  style={{
                    background: inFrame ? "var(--color-paper)" : "transparent",
                    opacity: inFrame ? 1 : 0.25,
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex h-4 w-4 items-center justify-center rounded text-[9px] font-bold text-white"
                      style={{
                        background: inFrame ? "#111" : "rgba(0,0,0,0.1)",
                      }}
                    >
                      {inFrame ? "✓" : i + 1}
                    </span>
                    <span className="font-mono text-ink/70">{tr.mi.toFixed(1)} mi</span>
                  </div>
                  <div className="flex items-center gap-3.5 font-mono">
                    <span className="num-tab text-ink/50">
                      ${ratePerMi.toFixed(2)}/mi
                    </span>
                    <span
                      className={`num-tab min-w-[56px] rounded px-2 py-0.5 text-right font-bold ${
                        isLowInFrame
                          ? "bg-ink text-white"
                          : isLow
                            ? "bg-transparent text-ink"
                            : "bg-transparent text-ink/80"
                      }`}
                    >
                      ${tr.payTime.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-2xl bg-ink p-5 text-white sm:p-[22px]">
            <div className="mb-3.5 font-mono text-[10px] uppercase tracking-[0.14em] opacity-55">
              What the model knows
            </div>
            <div className="flex flex-col">
              {profileSignals.map((s, i) => {
                const visible = localT > s.t;
                return (
                  <div
                    key={i}
                    className="flex justify-between border-b border-white/10 py-2 text-[12px]"
                    style={{
                      opacity: visible ? 1 : 0,
                      transform: visible ? "translateX(0)" : "translateX(-6px)",
                      transition: `all 0.5s ${EASE_CSS}`,
                    }}
                  >
                    <span className="opacity-65">{s.label}</span>
                    <span
                      className={`num-tab font-semibold ${
                        s.hi ? "rounded bg-white/[0.12] px-2" : ""
                      }`}
                    >
                      {s.val}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.04),0_12px_40px_-16px_rgba(0,0,0,0.12)] sm:p-[22px]">
            <div className="mb-3.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/50">
              Rolling average
            </div>
            <div className="mb-1 flex items-baseline gap-3">
              <div className="num-tab font-serif text-[44px] font-normal leading-none tracking-[-0.02em] sm:text-[56px]">
                ${avgPerMi.toFixed(2)}
              </div>
              <div className="text-[13px] text-ink/50">per mile</div>
            </div>
            <div className="font-mono text-[11px] text-ink/50">
              vs ${baseRate.toFixed(2)} illustrative baseline ·{" "}
              <span
                className={`font-semibold ${
                  avgPerMi < baseRate ? "text-ink" : "text-ink/50"
                }`}
              >
                {avgPerMi < baseRate ? "−" : "+"}
                {Math.abs(((avgPerMi - baseRate) / baseRate) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="my-4 h-px bg-ink/[0.08]" />
            <div className="flex justify-between text-[12px]">
              <span className="text-ink/55">Total earned</span>
              <span className="num-tab font-semibold">
                ${totalEarnings.toFixed(2)}
              </span>
            </div>
            <div className="mt-1.5 flex justify-between text-[12px]">
              <span className="text-ink/55">Distance driven</span>
              <span className="num-tab font-semibold">{totalMi.toFixed(1)} mi</span>
            </div>
          </div>
        </div>
      </div>

      {/* The closing claim is attributed to Dubal in line, since the "personalized
          minimum" mechanism is exactly what she describes in §II.A. */}
      {tripIdx >= trips.length && (
        <div className="scene-fade mt-1.5 max-w-[640px] rounded-full bg-ink px-5 py-3.5 text-center font-mono text-[12px] font-medium tracking-[0.04em] text-white sm:text-[13px]">
          → Felix's personal "fair" rate is now ${avgPerMi.toFixed(2)}/mi. This is the
          personalized-minimum mechanism Dubal describes.
        </div>
      )}
    </div>
  );
}
