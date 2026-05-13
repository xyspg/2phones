import { OpenInNewWindowIcon } from "@radix-ui/react-icons";
import { CAPTION_CLASS } from "../shared.tsx";
import { type Scene, easeOut, sceneProgress } from "../timeline.ts";

export function SceneThesis({ t, scene }: { t: number; scene: Scene }) {
  const p = sceneProgress(t, scene);
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-7 px-6 py-16 text-center sm:px-10 sm:py-20">
      <div className={CAPTION_CLASS} style={{ opacity: easeOut(p * 3) }}>
        Veena Dubal · UC Irvine Law · 2023
      </div>
      <blockquote
        className="m-0 max-w-[1100px] font-serif text-[clamp(28px,4.6vw,64px)] font-normal leading-[1.15] tracking-[-0.015em]"
        style={{
          opacity: easeOut((p - 0.1) * 2.5),
          transform: `translateY(${(1 - easeOut((p - 0.1) * 2.5)) * 16}px)`,
        }}
      >
        This is why legal scholar Veena Dubal had to invent a new term{" "}
        <a
          href="https://www.jstor.org/stable/27264954"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-baseline gap-2 underline decoration-ink/30 underline-offset-[6px] transition-colors hover:decoration-ink"
        >
          <em className="italic text-ink/55">'Algorithmic Wage Discrimination'</em>
          <OpenInNewWindowIcon
            className="translate-y-[2px] text-ink/45"
            width="18"
            height="18"
            aria-hidden="true"
          />
        </a>
        , because the old language no longer fits.
      </blockquote>
      <div
        className="max-w-[760px] text-[14px] leading-[1.6] text-ink/60 sm:text-[15px]"
        style={{ opacity: easeOut((p - 0.4) * 2.5) }}
      >
        Each driver gets a pay rate that is personalized, based on their acceptance rate,
        hours online, decline streak, etc. They never see what the driver next to them is
        being paid for the same trip. The algorithm prevents class consciousness from
        forming, because the basic information needed to compare wages is hidden.
      </div>
      <blockquote
        className="m-0 max-w-[760px] font-serif text-[clamp(16px,2vw,22px)] font-normal italic leading-[1.4] text-ink/65"
        style={{ opacity: easeOut((p - 0.6) * 2.5) }}
      >
        "It is not the consciousness of men that determines their being, but, on the
        contrary, their social being that determines their consciousness."
        <footer className="mt-2 font-sans text-[11px] not-italic tracking-[0.06em] text-ink/45 sm:text-[12px]">
          Karl Marx ·{" "}
          <span className="italic">A Contribution to the Critique of Political Economy</span>
        </footer>
      </blockquote>
    </div>
  );
}
