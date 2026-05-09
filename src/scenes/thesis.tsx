import { CAPTION_CLASS } from "../shared.tsx";
import { type Scene, easeOut, sceneProgress } from "../timeline.ts";

export function SceneThesis({ t, scene }: { t: number; scene: Scene }) {
  const p = sceneProgress(t, scene);
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-7 px-6 py-16 text-center sm:px-10 sm:py-20">
      {/* TODO: VERIFY — Dubal was at UC Hastings (now UC Law SF) when she published
          "On Algorithmic Wage Discrimination" (Columbia Law Review, 2023). She has
          since moved to UC Irvine Law. Confirm the 2023 affiliation we want to cite. */}
      <div className={CAPTION_CLASS} style={{ opacity: easeOut(p * 3) }}>
        Veena Dubal · UC Irvine Law · 2023
      </div>
      {/* TODO: PARAPHRASE PRESENTED AS QUOTE — the text below is in <blockquote> with
          quote marks but it is NOT a verbatim Dubal quote. It is a paraphrase of her
          framing. Either (a) replace with an exact verbatim quote from the Columbia
          Law Review article (with page number), or (b) drop the quote marks and
          rephrase as our own summary attributed to Dubal. */}
      <blockquote
        className="m-0 max-w-[1100px] font-serif text-[clamp(28px,4.6vw,64px)] font-normal leading-[1.15] tracking-[-0.015em]"
        style={{
          opacity: easeOut((p - 0.1) * 2.5),
          transform: `translateY(${(1 - easeOut((p - 0.1) * 2.5)) * 16}px)`,
        }}
      >
        "Algorithmic wage discrimination" — when machine learning is used to learn the{" "}
        <em className="italic text-ink/55">lowest amount</em> each worker will accept, and turn
        it into the norm.
      </blockquote>
      <div
        className="max-w-[720px] text-[14px] leading-[1.6] text-ink/60 sm:text-[15px]"
        style={{ opacity: easeOut((p - 0.4) * 2.5) }}
      >
        Drivers can't see the formula. Can't audit it. Can't challenge it. Two drivers doing
        identical work earn different wages, set by signals of personal financial pressure the
        company collected for free.
      </div>
      {/* TODO: VERIFY — location list is from our group_doc; double-check each
          jurisdiction has documented driver protests or regulatory action.
          The "June 2025" audit date is specific — verify against the actual
          Worker Info Exchange / Oxford report publication date before submit. */}
      <div
        className="mt-3 max-w-[700px] font-mono text-[11px] leading-[1.7] text-ink/50 sm:text-[12px]"
        style={{ opacity: easeOut((p - 0.55) * 2) }}
      >
        Documented in: California · Hawaiʻi · Massachusetts · Minnesota · Ohio · UK · EU
        <br />
        Audited by: Univ. of Oxford + Worker Info Exchange (June 2025)
      </div>
    </div>
  );
}
