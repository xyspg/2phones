import { type ReactNode } from "react";

export function PhoneFrame({
  deviceName,
  battery = 87,
  time = "8:47",
  children,
  label,
}: {
  deviceName?: string;
  battery?: number;
  time?: string;
  children?: ReactNode;
  label?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 sm:gap-3.5">
      {label && (
        <div className="font-system text-[11px] font-medium uppercase tracking-[0.14em] text-ink/50">
          {label}
        </div>
      )}
      <div className="relative h-[560px] w-[260px] rounded-[36px] bg-[#1a1a1a] p-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25),0_0_0_0.5px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.08)] sm:h-[660px] sm:w-[320px] sm:rounded-[44px] sm:p-2.5">
        <div className="font-system relative h-full w-full overflow-hidden rounded-[28px] bg-white text-ink sm:rounded-[36px]">
          <div className="relative z-[5] flex items-center justify-between px-5 pb-1.5 pt-3 text-[13px] font-semibold sm:px-[26px] sm:pb-1.5 sm:pt-3.5 sm:text-[14px]">
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{time}</span>
            <div className="absolute left-1/2 top-1.5 h-6 w-[90px] -translate-x-1/2 rounded-2xl bg-black sm:top-2 sm:h-7 sm:w-[110px]" />
            <div className="flex items-center gap-1.5">
              <svg width="17" height="11" viewBox="0 0 17 11" fill="none">
                <rect x="0.5" y="7.5" width="2.5" height="3" rx="0.5" fill="currentColor" />
                <rect x="4.5" y="5.5" width="2.5" height="5" rx="0.5" fill="currentColor" />
                <rect x="8.5" y="3.5" width="2.5" height="7" rx="0.5" fill="currentColor" />
                <rect x="12.5" y="0.5" width="2.5" height="10" rx="0.5" fill="currentColor" />
              </svg>
              <svg width="26" height="12" viewBox="0 0 26 12" fill="none">
                <rect
                  x="0.5"
                  y="0.5"
                  width="22"
                  height="11"
                  rx="2.5"
                  stroke="currentColor"
                  strokeOpacity="0.4"
                />
                <rect
                  x="2"
                  y="2"
                  width={Math.round((19 * battery) / 100)}
                  height="8"
                  rx="1.2"
                  fill="currentColor"
                />
                <rect
                  x="23.5"
                  y="4"
                  width="1.5"
                  height="4"
                  rx="0.6"
                  fill="currentColor"
                  fillOpacity="0.4"
                />
              </svg>
            </div>
          </div>
          {children}
        </div>
      </div>
      {deviceName && (
        <div className="font-system whitespace-nowrap text-[10px] tracking-[0.1em] text-ink/40">
          {deviceName}
        </div>
      )}
    </div>
  );
}

export const ACCENT = "#111";

export function MiniMap({
  height = 260,
  pinPulse = false,
  dotPos = 0.5,
}: {
  height?: number;
  pinPulse?: boolean;
  dotPos?: number;
}) {
  const bg = "#f4f3ef";
  const road = "rgba(0,0,0,0.12)";
  const roadHi = "rgba(0,0,0,0.22)";
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height, background: bg }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 300 260"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0"
      >
        <g stroke={road} strokeWidth="14" fill="none">
          <path d="M -20 60 L 320 60" />
          <path d="M -20 140 L 320 140" />
          <path d="M -20 210 L 320 210" />
          <path d="M 50 -20 L 50 280" />
          <path d="M 160 -20 L 160 280" />
          <path d="M 250 -20 L 250 280" />
        </g>
        <g stroke={roadHi} strokeWidth="3" fill="none">
          <path d="M -20 60 L 320 60" />
          <path d="M -20 140 L 320 140" />
          <path d="M 160 -20 L 160 280" />
        </g>
        <path
          d="M 50 210 L 50 140 L 160 140 L 160 60 L 250 60"
          stroke={ACCENT}
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="50" cy="210" r="6" fill={ACCENT} />
        <circle
          cx="50"
          cy="210"
          r="11"
          fill="none"
          stroke={ACCENT}
          strokeOpacity="0.3"
          strokeWidth="2"
        />
        <rect x="244" y="54" width="12" height="12" fill={ACCENT} />
        <circle
          cx={50 + dotPos * 200}
          cy={dotPos < 0.5 ? 210 : 60}
          r="4"
          fill="#fff"
          stroke={ACCENT}
          strokeWidth="2"
        />
      </svg>
      {pinPulse && (
        <div
          className="map-pulse absolute h-3 w-3 rounded-full"
          style={{ left: "16%", top: "78%", background: ACCENT }}
        />
      )}
    </div>
  );
}

export function RiderApp({
  price,
  surge,
  eta,
  requestState,
  dotPos = 0.5,
  onRequest,
}: {
  price: number;
  surge?: string | null;
  eta: number;
  requestState: "idle" | "searching";
  dotPos?: number;
  onRequest?: () => void;
}) {
  return (
    <div className="flex h-[calc(100%-40px)] flex-col">
      <MiniMap height={240} pinPulse={requestState === "searching"} dotPos={dotPos} />
      <div className="relative z-[2] -mt-4 flex flex-1 flex-col gap-3.5 rounded-t-[20px] bg-white px-4 pb-5 pt-4 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] sm:px-[18px] sm:pb-[22px] sm:pt-[18px]">
        <div className="flex flex-col">
          <div className="flex items-center gap-3 py-1.5">
            <div className="h-2 w-2 rounded-full bg-ink" />
            <div className="text-[13px] font-medium text-ink">East Village Apartments</div>
          </div>
          <div className="ml-[3px] h-3.5 w-px bg-ink/[0.08]" />
          <div className="flex items-center gap-3 py-1.5">
            <div className="h-2 w-2 bg-ink" />
            <div className="text-[13px] font-medium text-ink">JFK · Terminal 4</div>
          </div>
        </div>

        <div className="h-px bg-ink/[0.08]" />

        <div className="flex flex-col gap-2.5 rounded-[14px] border border-ink/[0.08] bg-white p-3.5">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-ink/55">
                Standard
              </div>
              <div className="mt-0.5 text-[11px] text-ink/55">
                {eta} min away · 4 seats
              </div>
            </div>
            <div className="num-tab text-[26px] font-bold text-ink transition-colors duration-300 sm:text-[28px]">
              ${price.toFixed(2)}
            </div>
          </div>
          {surge && (
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-ink">
              <span className="h-[5px] w-[5px] rounded-full bg-ink" />
              {surge}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={requestState === "idle" ? onRequest : undefined}
          disabled={requestState !== "idle"}
          className={`h-[46px] w-full rounded-[14px] border-0 text-[14px] font-semibold transition-all duration-300 sm:h-[50px] sm:text-[15px] ${
            requestState === "idle"
              ? "cursor-pointer bg-ink text-white"
              : "cursor-default bg-ink/[0.08] text-ink"
          }`}
        >
          {requestState === "idle" ? "Request Standard" : "Finding driver…"}
        </button>
      </div>
    </div>
  );
}

export function DriverApp({
  payout,
  distance,
  duration,
  acceptanceRate,
  driverName,
  hoursOnline,
  accepted = false,
  onAccept,
  ledger,
}: {
  payout: number;
  distance: string;
  duration: number;
  acceptanceRate: number;
  driverName: string;
  hoursOnline: number;
  accepted?: boolean;
  onAccept?: () => void;
  ledger?: ReactNode;
}) {
  const showLedger = accepted && ledger;
  return (
    <div className="flex h-[calc(100%-40px)] flex-col">
      <div className="flex items-center justify-between px-4 pb-3 pt-1.5 sm:px-[18px]">
        <div>
          <div className="text-[11px] font-medium text-ink/55">{driverName}</div>
          <div className="num-tab text-[13px] font-semibold text-ink">
            {hoursOnline}h online
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-ink/[0.08] bg-[#fafaf8] px-2.5 py-[5px] text-[11px] font-semibold text-ink">
          <span className="h-1.5 w-1.5 rounded-full bg-[#34c759]" />
          Online
        </div>
      </div>

      <MiniMap height={190} dotPos={0.3} />

      <div className="relative z-[2] -mt-3 flex flex-1 flex-col gap-3 rounded-t-[18px] bg-white px-4 py-5 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] sm:px-[18px]">
        {showLedger ? (
          ledger
        ) : (
          <>
            <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink/55">
              New Trip Offer
            </div>

            <div className="flex items-baseline gap-2">
              <div className="num-tab text-[36px] font-bold leading-none text-ink sm:text-[42px]">
                ${payout.toFixed(2)}
              </div>
            </div>

            <div className="flex gap-3 text-[12px] text-ink/55 sm:gap-4">
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

            <div className="flex justify-between text-[10px] text-ink/55">
              <span>Acceptance rate</span>
              <span className="num-tab font-semibold text-ink">
                {acceptanceRate}%
              </span>
            </div>

            <div className="mt-auto flex flex-col gap-2">
              <button
                type="button"
                onClick={accepted ? undefined : onAccept}
                disabled={accepted}
                className={`h-12 w-full rounded-[14px] border-0 text-[14px] font-semibold transition-all duration-200 sm:h-[52px] sm:text-[15px] ${
                  accepted
                    ? "cursor-default bg-ink/[0.06] text-ink"
                    : "cursor-pointer bg-ink text-white"
                }`}
              >
                {accepted ? "✓ Accepted" : "Accept"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
