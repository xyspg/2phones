import { type ReactNode, useEffect, useState } from "react";
import { SCENES, type Scene, TOTAL } from "./timeline.ts";

export function Stage({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col pb-24 sm:pb-[88px]">
      {children}
      <ScrollHint />
    </div>
  );
}

function ScrollHint() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const update = () => {
      const docH = document.documentElement.scrollHeight;
      const vh = window.innerHeight;
      const scrollY = window.scrollY;
      const overflow = docH - vh;
      // show when there's meaningful overflow and user hasn't scrolled most of the way
      setShow(overflow > 24 && scrollY < overflow - 24);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const ro = new ResizeObserver(update);
    ro.observe(document.body);
    const id = setInterval(update, 600); // catch scene transitions / animated content
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      ro.disconnect();
      clearInterval(id);
    };
  }, []);

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-[84px] z-[101] flex justify-center transition-opacity duration-300 sm:bottom-[100px] ${
        show ? "opacity-100" : "opacity-0"
      }`}
    >
      <button
        type="button"
        aria-label="Scroll down for more"
        onClick={() => {
          window.scrollBy({ top: window.innerHeight * 0.7, behavior: "smooth" });
        }}
        className="scroll-hint-bob pointer-events-auto flex cursor-pointer items-center gap-2 rounded-full border border-ink/15 bg-paper/85 px-3.5 py-1.5 text-[12.5px] tracking-[-0.005em] text-ink/65 backdrop-blur-sm transition-colors duration-200 hover:border-ink/30 hover:text-ink"
      >
        <span>Scroll down for more</span>
        <svg width="10" height="10" viewBox="0 0 11 11" fill="none" aria-hidden="true">
          <path
            d="M1.5 3.5 L5.5 7.5 L9.5 3.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

export function Chrome({
  t,
  scene,
  playing,
  playDisabled = false,
  onPlayToggle,
  onSeek,
  onScene,
}: {
  t: number;
  scene: Scene;
  playing: boolean;
  playDisabled?: boolean;
  onPlayToggle: () => void;
  onSeek: (s: number) => void;
  onScene: (s: Scene) => void;
}) {
  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-100 flex items-center justify-between gap-3 bg-gradient-to-b from-paper/95 to-transparent px-4 py-3 font-mono text-[10px] tracking-[0.06em] sm:px-6 sm:py-3.5 sm:text-[11px]">
        <div className="pointer-events-auto truncate font-semibold uppercase tracking-[0.14em] text-ink/70">
          <span className="sm:hidden">Two Phones</span>
          <span className="hidden sm:inline">Two Phones · Same Trip</span>
        </div>
        <div className="pointer-events-auto truncate text-ink/50">
          {scene.label}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-100 flex flex-col gap-2.5 bg-gradient-to-t from-paper/95 to-transparent px-3 pb-4 pt-4 sm:px-6 sm:pb-[18px] sm:pt-4">
        <div className="flex w-full gap-1">
          {SCENES.map((s) => {
            const len = s.end - s.start;
            const elapsed = Math.max(0, Math.min(len, t - s.start));
            const pct = (elapsed / len) * 100;
            const active = t >= s.start && t < s.end;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onScene(s)}
                className="relative h-1 cursor-pointer overflow-hidden rounded-full border-0 bg-ink/[0.08] p-0"
                style={{ flex: len }}
              >
                <div
                  className="absolute inset-0 rounded-full bg-ink"
                  style={{
                    width: `${pct}%`,
                    transition: active ? "none" : "width 0.4s",
                  }}
                />
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] sm:gap-3.5">
          <button
            type="button"
            onClick={onPlayToggle}
            disabled={playDisabled}
            aria-disabled={playDisabled}
            className={`flex h-7 w-7 items-center justify-center rounded-full border-0 bg-ink text-white sm:h-[30px] sm:w-[30px] ${
              playDisabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"
            }`}
          >
            {playing ? (
              <svg width="10" height="10" viewBox="0 0 10 10">
                <rect x="1" y="1" width="2.5" height="8" fill="#fff" />
                <rect x="6.5" y="1" width="2.5" height="8" fill="#fff" />
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M2 1 L9 5 L2 9 Z" fill="#fff" />
              </svg>
            )}
          </button>
          <button
            type="button"
            onClick={() => onSeek(0)}
            className="cursor-pointer rounded-full border-0 bg-ink/[0.06] px-3 py-1.5 font-mono text-[11px] text-ink"
          >
            ↻ restart
          </button>
          <div className="flex-1" />
          <span className="num-tab text-ink/55">
            {String(Math.floor(t / 60)).padStart(2, "0")}:
            {String(Math.floor(t % 60)).padStart(2, "0")} /{" "}
            {String(Math.floor(TOTAL / 60)).padStart(2, "0")}:
            {String(Math.floor(TOTAL % 60)).padStart(2, "0")}
          </span>
        </div>
      </div>
    </>
  );
}
