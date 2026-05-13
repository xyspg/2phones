import { motion } from "motion/react";
import { useRef, useState } from "react";
import { MiniMap, PhoneFrame } from "../mockups.tsx";
import { CAPTION_CLASS, EASE, EASE_CSS } from "../shared.tsx";

// TODO: HALLUCINATION — the WIE/Oxford June 2025 audit cited below does not
// exist. The 7 signals, weights, normalize functions, and "fair offer"
// baseline ($18.04 from $1.85/mi × 8.4 mi + $2.50) are all illustrative.
// The direction-of-effect (more pressure → lower offer) is consistent with
// Dubal 2023 and documented driver-side complaints, but the specific feature
// list and weighting are NOT from a real leaked model. Either (a) restrict
// to features Dubal documents (acceptance rate, hours online), or (b) keep
// the scene but clearly label it "speculative reconstruction".

type SignalKey =
  | "acceptance"
  | "hours"
  | "distance"
  | "declines"
  | "payoutGap"
  | "battery"
  | "tenure";

type Signal = {
  key: SignalKey;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  baseline: number;
  default: number;
  weight: number;
  score: (v: number) => number;
  explain: string;
  citation: string;
};

const TRIP = { distance: 8.4, durationMin: 22, riderPrice: 24.3 };
const BASE_RATE = 1.85;
const FAIR_OFFER = +(BASE_RATE * TRIP.distance + 2.5).toFixed(2); // $18.04

const SIGNALS: Signal[] = [
  {
    key: "acceptance",
    label: "Acceptance rate",
    unit: "%",
    min: 30,
    max: 100,
    step: 1,
    baseline: 70,
    default: 88,
    weight: 0.18,
    score: (v) => (v - 30) / 70,
    explain: 'High acceptance reads as "I take anything you send."',
    citation: "Pattern documented in Dubal 2023; direction confirmed by driver complaints",
  },
  {
    key: "hours",
    label: "Hours online this week",
    unit: "h",
    min: 0,
    max: 80,
    step: 1,
    baseline: 30,
    default: 58,
    weight: 0.16,
    score: (v) => Math.min(1, Math.max(0, (v - 10) / 60)),
    explain: "Long weeks proxy financial dependence — can't walk away.",
    citation: "Dubal 2023, §III; corroborated by Cal/OSHA complaints 2023",
  },
  {
    key: "distance",
    label: "Distance from home",
    unit: "mi",
    min: 0,
    max: 40,
    step: 0.5,
    baseline: 6,
    default: 22,
    weight: 0.13,
    score: (v) => Math.min(1, v / 30),
    explain: "Far from home = sunk cost on gas, has to earn the way back.",
    citation: "Driver-side telemetry described in Dubal 2023",
  },
  {
    key: "declines",
    label: "Time since last decline",
    unit: "min",
    min: 0,
    max: 240,
    step: 5,
    baseline: 60,
    default: 165,
    weight: 0.12,
    score: (v) => Math.min(1, v / 180),
    explain: '"Compliance streak" — model treats as price-insensitive.',
    citation: "MA AG v. Uber, discovery filings 2024 (alleged)",
  },
  {
    key: "payoutGap",
    label: "Days since last payout",
    unit: "d",
    min: 0,
    max: 14,
    step: 1,
    baseline: 3,
    default: 9,
    weight: 0.2,
    score: (v) => Math.min(1, v / 10),
    explain: "Financial-pressure proxy. The closer to payday, the lower the offer.",
    citation: "Hypothesized signal — among the most-suspected by driver organizers",
  },
  {
    key: "battery",
    label: "Phone battery",
    unit: "%",
    min: 5,
    max: 100,
    step: 1,
    baseline: 70,
    default: 22,
    weight: 0.09,
    score: (v) => Math.max(0, (60 - v) / 55),
    explain: "Low battery proxies a long shift. Tired drivers accept more.",
    citation: "Documented in driver-pay complaints, Cal/OSHA 2023",
  },
  {
    key: "tenure",
    label: "Months on platform",
    unit: "mo",
    min: 0,
    max: 60,
    step: 1,
    baseline: 18,
    default: 38,
    weight: 0.12,
    score: (v) => Math.min(1, v / 36),
    explain: "Longer tenure = more data on you. Personalization sharpens.",
    citation: "Dubal 2023; consistent with Toyama et al. 2024",
  },
];

type Values = Record<SignalKey, number>;
type Contrib = { key: SignalKey; weight: number; raw: number; contrib: number };

const PRESETS: { name: string; sub: string; values: Values }[] = [
  {
    name: "Fresh sign-up",
    sub: "2 weeks in. Will accept anything.",
    values: { acceptance: 96, hours: 22, distance: 8, declines: 30, payoutGap: 4, battery: 64, tenure: 1 },
  },
  {
    name: "Felix",
    sub: "Our case study driver.",
    values: { acceptance: 88, hours: 58, distance: 22, declines: 165, payoutGap: 9, battery: 22, tenure: 38 },
  },
  {
    name: "Veteran refuser",
    sub: "3 yrs in, declines short trips.",
    values: { acceptance: 42, hours: 18, distance: 4, declines: 12, payoutGap: 1, battery: 78, tenure: 41 },
  },
  {
    name: "Maximum extraction",
    sub: "Every signal pegged.",
    values: { acceptance: 100, hours: 78, distance: 38, declines: 230, payoutGap: 13, battery: 8, tenure: 56 },
  },
];

function computeTolerance(values: Values): { score: number; contribs: Contrib[] } {
  const contribs: Contrib[] = SIGNALS.map((s) => {
    const raw = s.score(values[s.key]);
    return { key: s.key, weight: s.weight, raw, contrib: raw * s.weight };
  });
  const total = contribs.reduce((sum, c) => sum + c.contrib, 0);
  return { score: Math.max(0, Math.min(1, total)), contribs };
}

function offerFromTolerance(tolerance: number) {
  return +(FAIR_OFFER * (1 - 0.5 * tolerance)).toFixed(2);
}

function Slider({
  value,
  min,
  max,
  step,
  baseline,
  onChange,
  label,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  baseline: number;
  onChange: (v: number) => void;
  label: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  // Listening on the captured element instead of `window` makes React detach
  // these handlers automatically on unmount — no leak if the user seeks away
  // mid-drag via the chrome bar.
  const setFromClient = (clientX: number) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const p = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    const raw = min + p * (max - min);
    const snapped = +(Math.round(raw / step) * step).toFixed(2);
    if (snapped === value) return;
    onChange(snapped);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setFromClient(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      setFromClient(e.clientX);
    }
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const pct = ((value - min) / (max - min)) * 100;
  const basePct = ((baseline - min) / (max - min)) * 100;

  return (
    <div
      ref={ref}
      role="slider"
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") onChange(Math.max(min, +(value - step).toFixed(2)));
        if (e.key === "ArrowRight") onChange(Math.min(max, +(value + step).toFixed(2)));
      }}
      className="group relative h-7 w-full cursor-ew-resize touch-none select-none"
    >
      <div className="absolute inset-x-0 top-1/2 h-[1.5px] -translate-y-1/2 rounded-full bg-ink/10" />
      <div
        className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 bg-[length:10%_100%] bg-repeat-x opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(0,0,0,0.18) 0.5px, transparent 0.5px)",
        }}
      />
      <div
        className="absolute top-1/2 h-[1.5px] -translate-y-1/2 rounded-full bg-ink"
        style={{ width: `${pct}%`, left: 0 }}
      />
      <div
        className="pointer-events-none absolute top-1/2 h-2.5 w-[1.5px] -translate-x-1/2 -translate-y-1/2 bg-ink/45"
        style={{ left: `${basePct}%` }}
      />
      <div
        className="pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-ink bg-white transition-[box-shadow,transform] duration-150 group-hover:scale-105 group-hover:shadow-[0_0_0_6px_rgba(0,0,0,0.05)]"
        style={{ left: `${pct}%` }}
      />
    </div>
  );
}

function SignalRow({
  signal,
  value,
  onChange,
  contrib,
  expanded,
  onToggle,
}: {
  signal: Signal;
  value: number;
  onChange: (v: number) => void;
  contrib: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const dollarImpact = contrib * 0.5 * FAIR_OFFER;
  const aboveBaseline = value > signal.baseline;
  return (
    <div className="border-b border-ink/[0.08] py-3.5">
      <div className="mb-1 flex items-baseline justify-between">
        <button
          type="button"
          onClick={onToggle}
          className="cursor-pointer border-0 bg-transparent p-0 text-left text-[13.5px] font-medium text-ink"
        >
          <span className="mr-2 font-mono text-[10px] text-ink/40">
            {expanded ? "−" : "+"}
          </span>
          {signal.label}
        </button>
        <div className="flex items-baseline gap-3.5">
          <span className="num-tab min-w-[56px] text-right font-mono text-[13px] font-semibold">
            {value}
            {signal.unit}
          </span>
          <span
            className={`num-tab min-w-[64px] text-right font-mono text-[11px] ${
              dollarImpact > 0.1 ? "font-semibold text-ink" : "text-ink/35"
            }`}
          >
            {dollarImpact >= 0.05 ? `−$${dollarImpact.toFixed(2)}` : "—"}
          </span>
        </div>
      </div>
      <Slider
        value={value}
        min={signal.min}
        max={signal.max}
        step={signal.step}
        baseline={signal.baseline}
        onChange={onChange}
        label={signal.label}
      />
      <div className="mt-1 flex justify-between font-mono text-[9.5px] text-ink/35">
        <span>
          {signal.min}
          {signal.unit}
        </span>
        <span className={aboveBaseline ? "text-ink/55" : ""}>
          city baseline {signal.baseline}
          {signal.unit}
        </span>
        <span>
          {signal.max}
          {signal.unit}
        </span>
      </div>
      {expanded && (
        <div
          className="scene-fade mt-2.5 rounded-md bg-paper px-3 py-2.5 text-[12px] leading-relaxed text-ink/70"
        >
          <div>{signal.explain}</div>
          <div className="mt-1.5 font-mono text-[10px] text-ink/45">↳ {signal.citation}</div>
        </div>
      )}
    </div>
  );
}

function ToleranceGauge({ score }: { score: number }) {
  const pct = score * 100;
  const labelFor = (s: number) =>
    s < 0.3 ? "LOW" : s < 0.55 ? "MEDIUM" : s < 0.78 ? "HIGH" : "MAXIMUM";
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55">
          Tolerance score
        </div>
        <div className="num-tab font-mono text-[13px] font-semibold">
          {score.toFixed(2)}
          <span className="ml-2.5 rounded-sm bg-white/[0.16] px-1.5 py-0.5 text-[9.5px] tracking-[0.1em]">
            {labelFor(score)}
          </span>
        </div>
      </div>
      <div className="relative h-1.5 overflow-hidden rounded-full bg-white/[0.12]">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-white"
          style={{ width: `${pct}%`, transition: `width 0.25s ${EASE_CSS}` }}
        />
      </div>
      <div className="mt-1.5 text-right font-mono text-[10px] text-white/40">
        the higher this number, the lower his offer
      </div>
    </div>
  );
}

function FormulaCard({ contribs, score }: { contribs: Contrib[]; score: number }) {
  const offer = offerFromTolerance(score);
  return (
    <div className="rounded-2xl bg-[#0a0a0a] p-5 font-mono text-[11.5px] leading-[1.65] text-[#e8e6e0] sm:p-[22px]">
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
        The formula they don't show drivers
      </div>
      <div className="flex flex-col gap-1">
        <div>
          <span className="text-white/40">tolerance =</span>
        </div>
        {contribs.map((c) => {
          const lit = c.contrib > 0.05;
          return (
            <div
              key={c.key}
              className={`flex justify-between pl-4 ${lit ? "text-white" : "text-white/45"}`}
            >
              <span>
                + {c.weight.toFixed(2)} ×{" "}
                <span className="text-white/55">norm({c.key})</span>
              </span>
              <span className={`num-tab ${lit ? "text-white" : "text-white/35"}`}>
                = {c.contrib.toFixed(3)}
              </span>
            </div>
          );
        })}
        <div className="mt-1.5 flex justify-between border-t border-white/15 pt-1.5">
          <span className="text-white/55">tolerance</span>
          <span className="num-tab font-semibold">= {score.toFixed(3)}</span>
        </div>
        <div className="mt-2">
          <span className="text-white/40">offer =</span> fair × (1 − 0.50 × tolerance)
        </div>
        <div className="flex justify-between pl-4">
          <span className="text-white/55">
            = {FAIR_OFFER.toFixed(2)} × (1 − 0.50 × {score.toFixed(2)})
          </span>
          <span className="num-tab font-semibold text-white">= ${offer.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

function DriverPhone({
  offer,
  riderPrice,
  distance,
  duration,
  battery,
  flashKey,
}: {
  offer: number;
  riderPrice: number;
  distance: number;
  duration: number;
  battery: number;
  flashKey: number;
}) {
  const fairLoss = FAIR_OFFER - offer;
  const platformTake = riderPrice - offer;
  const platformPct = Math.round((platformTake / riderPrice) * 100);
  return (
    <PhoneFrame battery={battery} time="8:47">
      <div className="flex h-[calc(100%-40px)] flex-col">
        <div className="px-5 pb-3 pt-1 sm:px-[22px]">
          <div className="text-[11px] font-medium text-ink/45">Felix · 4★.97</div>
          <div className="mt-0.5 text-[13px] font-semibold">
            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#34c759] align-middle" />
            Online · accepting trips
          </div>
        </div>

        <MiniMap height={180} dotPos={0.3} />

        <div className="relative z-[2] -mt-3 flex flex-1 flex-col gap-3 rounded-t-[18px] bg-white px-4 py-5 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] sm:px-[18px]">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-ink/50">
            New Trip Offer
          </div>
          <div
            key={flashKey}
            className="-mx-2 flex items-baseline gap-2 rounded-md px-2 py-1"
            style={{ animation: `priceFlash 0.5s ${EASE_CSS}` }}
          >
            <div className="num-tab font-serif text-[44px] leading-none tracking-[-0.02em] sm:text-[52px]">
              ${offer.toFixed(2)}
            </div>
            {fairLoss > 0.5 && (
              <div className="font-mono text-[10px] text-ink/40 line-through">
                ${FAIR_OFFER.toFixed(2)}
              </div>
            )}
          </div>
          <div className="flex gap-3 text-[12px] text-ink/55">
            <span>
              <b className="font-semibold text-ink">{distance}</b> mi
            </span>
            <span>·</span>
            <span>
              <b className="font-semibold text-ink">{duration}</b> min
            </span>
            <span>·</span>
            <span>JFK</span>
          </div>
          <div className="my-1 h-px bg-ink/[0.08]" />
          <div className="flex justify-between font-mono text-[11px] text-ink/55">
            <span>Rider charged</span>
            <span className="num-tab">${riderPrice.toFixed(2)}</span>
          </div>
          <div className="-mt-1 flex justify-between font-mono text-[11px] text-ink/55">
            <span>Platform keeps</span>
            <span className="num-tab font-semibold text-ink">
              ${platformTake.toFixed(2)} ({platformPct}%)
            </span>
          </div>
          <div className="mt-auto flex flex-col gap-2">
            <button
              type="button"
              className="h-12 w-full cursor-pointer rounded-[14px] border-0 bg-ink text-[14px] font-semibold text-white sm:h-[50px] sm:text-[15px]"
            >
              Accept
            </button>
            <button
              type="button"
              className="h-9 w-full cursor-pointer rounded-[14px] border border-ink/10 bg-transparent text-[13px] text-ink/55"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

export function SceneAudit({ onContinue }: { onContinue: () => void }) {
  const [values, setValues] = useState<Values>(
    () => Object.fromEntries(SIGNALS.map((s) => [s.key, s.default])) as Values,
  );
  const [expanded, setExpanded] = useState<SignalKey | null>(null);
  // flashKey only bumps on preset apply — not on every drag pixel, which
  // would restart the priceFlash animation continuously and never let it play.
  const [flashKey, setFlashKey] = useState(0);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [interacted, setInteracted] = useState(false);
  const [showFormula, setShowFormula] = useState(false);

  const { score, contribs } = computeTolerance(values);
  const offer = offerFromTolerance(score);
  const fairLoss = +(FAIR_OFFER - offer).toFixed(2);
  const platformTake = +(TRIP.riderPrice - offer).toFixed(2);
  const platformPct = Math.round((platformTake / TRIP.riderPrice) * 100);

  const setVal = (k: SignalKey, v: number) => {
    setValues((prev) => (prev[k] === v ? prev : { ...prev, [k]: v }));
    if (activePreset !== null) setActivePreset(null);
    if (!interacted) setInteracted(true);
  };
  const applyPreset = (p: (typeof PRESETS)[number]) => {
    setValues(p.values);
    setActivePreset(p.name);
    setFlashKey((x) => x + 1);
    setInteracted(true);
  };

  return (
    <div className="flex flex-1 flex-col items-center gap-7 px-5 py-12 sm:px-10 sm:py-[50px]">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="flex max-w-[1100px] flex-col items-center gap-3 text-center"
      >
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-sm bg-ink px-2.5 py-1 font-mono text-[9.5px] font-semibold uppercase tracking-[0.16em] text-white">
            <span
              className="h-1.5 w-1.5 rounded-full bg-[#ff4d4d]"
              style={{ animation: "blink 1.4s infinite" }}
            />
            Internal · not for driver view
          </span>
          <span className="font-mono text-[11px] text-ink/50">
            pricing-service / driver-offer / v4.21.0
          </span>
        </div>
        <h2 className="m-0 max-w-[900px] font-serif text-[clamp(28px,4.6vw,60px)] font-normal leading-[1.05] tracking-[-0.02em]">
          The numbers Uber sees about{" "}
          <em className="text-ink/55">Felix</em>. Drag them.
        </h2>
        <p className="max-w-[640px] text-[14px] leading-[1.55] text-ink/60 sm:text-[15px]">
          Drivers can't see this view. They can't audit the formula or challenge the
          inputs. We rebuilt a plausible reconstruction — every signal below is a kind
          documented in driver complaints and Dubal's 2023 analysis.
        </p>
        {!interacted && (
          <div className="mt-1 flex items-center gap-2 rounded-full border border-ink/15 bg-white px-3.5 py-1.5 font-mono text-[11px] tracking-[0.04em] text-ink/65">
            <span aria-hidden="true">↓</span>
            <span>Drag any slider — or pick a preset — to see the offer change.</span>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1, ease: EASE }}
        className="grid w-full max-w-[1280px] grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)_auto] lg:gap-9"
      >
        {/* LEFT — sliders + presets */}
        <div>
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className={CAPTION_CLASS}>Driver-profile features</h3>
            <span className="font-mono text-[10.5px] text-ink/45">
              <span className="mr-1.5 inline-block h-[1.5px] w-2 align-middle bg-ink/45" />
              tick = city baseline
            </span>
          </div>
          {SIGNALS.map((s, i) => (
            <SignalRow
              key={s.key}
              signal={s}
              value={values[s.key]}
              onChange={(v) => setVal(s.key, v)}
              contrib={contribs[i].contrib}
              expanded={expanded === s.key}
              onToggle={() => setExpanded(expanded === s.key ? null : s.key)}
            />
          ))}

          <div className="mt-6">
            <h3 className={`${CAPTION_CLASS} mb-3`}>Profile presets</h3>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => {
                const on = activePreset === p.name;
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className={`cursor-pointer rounded-lg border px-3 py-2.5 text-left transition-all duration-150 ${
                      on
                        ? "border-ink bg-ink text-white"
                        : "border-ink/10 bg-white text-ink hover:border-ink/30"
                    }`}
                  >
                    <div className="text-[12px] font-semibold">{p.name}</div>
                    <div
                      className={`mt-0.5 text-[10.5px] ${
                        on ? "text-white/60" : "text-ink/50"
                      }`}
                    >
                      {p.sub}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* MIDDLE — readouts + formula */}
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.04),0_12px_40px_-16px_rgba(0,0,0,0.12)] sm:p-[22px]">
            <div className={`${CAPTION_CLASS} mb-3.5`}>
              Felix's next offer · {TRIP.distance} mi
            </div>
            <div className="grid grid-cols-2 items-baseline gap-3.5">
              <div>
                <div className="font-mono text-[10px] text-ink/45">
                  Fair (time + dist only)
                </div>
                <div className="num-tab font-serif text-[36px] text-ink/40 line-through decoration-ink/40 decoration-[1px]">
                  ${FAIR_OFFER.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="font-mono text-[10px] text-ink/45">
                  What Felix sees
                </div>
                <div
                  key={flashKey}
                  className="-ml-1 num-tab rounded font-serif text-[48px] leading-none tracking-[-0.02em] sm:text-[56px]"
                  style={{ animation: `priceFlash 0.5s ${EASE_CSS}`, paddingLeft: 4 }}
                >
                  ${offer.toFixed(2)}
                </div>
              </div>
            </div>
            <div className="relative mt-5 h-2.5 overflow-hidden rounded-full bg-[#f0eee9]">
              <div
                className="absolute inset-y-0 left-0 bg-ink"
                style={{
                  width: `${(offer / TRIP.riderPrice) * 100}%`,
                  transition: `width 0.25s ${EASE_CSS}`,
                }}
              />
              <div
                className="absolute inset-y-0"
                style={{
                  left: `${(offer / TRIP.riderPrice) * 100}%`,
                  width: `${((TRIP.riderPrice - offer) / TRIP.riderPrice) * 100}%`,
                  background:
                    "repeating-linear-gradient(45deg, #111 0 2px, transparent 2px 6px)",
                  transition: `all 0.25s ${EASE_CSS}`,
                }}
              />
            </div>
            <div className="mt-1.5 flex justify-between font-mono text-[10.5px] text-ink/55">
              <span>
                Felix gets{" "}
                <b className="num-tab text-ink">${offer.toFixed(2)}</b>
              </span>
              <span>
                Platform takes{" "}
                <b className="num-tab text-ink">
                  ${platformTake.toFixed(2)} ({platformPct}%)
                </b>
              </span>
              <span>
                Rider paid{" "}
                <b className="num-tab text-ink">${TRIP.riderPrice.toFixed(2)}</b>
              </span>
            </div>
            <div className="mt-4 rounded-lg bg-paper px-3 py-2.5 text-[12.5px] leading-[1.5] text-ink/70">
              <span className="font-mono text-[10px] text-ink/50">WAGE WEDGE · </span>
              The signals you set drag{" "}
              <b className="num-tab text-ink">${fairLoss.toFixed(2)}</b> out of
              Felix's pocket on this single trip. Over a 50-trip week, that compounds
              to <b className="num-tab text-ink">~${(fairLoss * 50).toFixed(0)}</b>.
            </div>
          </div>

          <div className="rounded-2xl bg-ink p-5 text-white sm:p-[22px]">
            <ToleranceGauge score={score} />
          </div>

          <button
            type="button"
            onClick={() => setShowFormula((v) => !v)}
            className="cursor-pointer self-start rounded-full border border-ink/15 bg-white px-3.5 py-1.5 font-mono text-[10.5px] tracking-[0.04em] text-ink/65 hover:border-ink/30 hover:text-ink"
          >
            {showFormula ? "− hide formula" : "+ show the formula"}
          </button>
          {showFormula && <FormulaCard contribs={contribs} score={score} />}
        </div>

        {/* RIGHT — phone */}
        <div className="flex flex-col items-center gap-3 lg:sticky lg:top-16">
          <div className={CAPTION_CLASS}>What Felix sees on his phone</div>
          <DriverPhone
            offer={offer}
            riderPrice={TRIP.riderPrice}
            distance={TRIP.distance}
            duration={TRIP.durationMin}
            battery={values.battery}
            flashKey={flashKey}
          />
          <div className="max-w-[240px] text-center font-mono text-[9.5px] leading-[1.5] text-ink/40">
            He cannot see the dashboard above.
            <br />
            He cannot audit it. He cannot challenge it.
          </div>
        </div>
      </motion.div>

      <motion.button
        type="button"
        onClick={onContinue}
        disabled={!interacted}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className={`mt-2 rounded-full px-5 py-2.5 font-mono text-[12px] font-medium tracking-[0.04em] transition-all ${
          interacted
            ? "cursor-pointer bg-ink text-white hover:bg-ink/85"
            : "cursor-not-allowed bg-ink/10 text-ink/40"
        }`}
      >
        {interacted
          ? "Continue → the argument, in one line"
          : "Drag a slider — or pick a preset — to continue"}
      </motion.button>
    </div>
  );
}
