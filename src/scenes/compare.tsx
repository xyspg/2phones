import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { PRICE_DELTA, RIDER_PRICE_A, RIDER_PRICE_B } from "../data.ts";
import { ACCENT, PhoneFrame, RiderApp } from "../mockups.tsx";
import { EASE } from "../shared.tsx";

export function SceneCompare({ onBothRequested }: { onBothRequested: () => void }) {
  const [reqA, setReqA] = useState(false);
  const [reqB, setReqB] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const both = reqA && reqB;

  useEffect(() => {
    if (!both) return;
    const id = setTimeout(() => {
      setRevealed(true);
      onBothRequested();
    }, 700);
    return () => clearTimeout(id);
  }, [both, onBothRequested]);

  return (
    <div className="flex flex-1 flex-col items-center gap-4 px-5 pb-12 pt-12 sm:gap-[18px] sm:px-10 sm:pb-[60px] sm:pt-12">
      <div className="min-h-[22px] max-w-[900px] text-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={revealed ? "revealed-sub" : "request-sub"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="font-mono text-[12px] tracking-[0.01em] text-ink/55 sm:text-[13px]"
          >
            {revealed
              ? "The algorithm learned what each phone will tolerate."
              : "Tap Request on both phones — same pickup, same destination."}
          </motion.div>
        </AnimatePresence>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="flex flex-col items-center gap-12 sm:flex-row sm:items-start sm:gap-12 lg:gap-20"
      >
        <PhoneFrame
          deviceName="DEVICE A · ANDROID"
          battery={64}
          time="8:47"
          label={revealed ? "Phone A · less to extract" : "Phone A"}
        >
          <RiderApp
            price={RIDER_PRICE_A}
            eta={4}
            surge={revealed ? "Standard fare" : null}
            requestState={reqA ? "searching" : "idle"}
            onRequest={() => setReqA(true)}
            dotPos={revealed ? 0.3 : 0.2}
          />
        </PhoneFrame>
        <PhoneFrame
          deviceName="DEVICE B · IPHONE"
          battery={94}
          time="8:47"
          label={revealed ? "Phone B · more to extract" : "Phone B"}
        >
          <RiderApp
            price={RIDER_PRICE_B}
            eta={4}
            surge={revealed ? "High demand in your area" : null}
            requestState={reqB ? "searching" : "idle"}
            onRequest={() => setReqB(true)}
            dotPos={revealed ? 0.3 : 0.2}
          />
        </PhoneFrame>
      </motion.div>

      <AnimatePresence>
        {revealed && (
          <motion.div
            key="diff-callout"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
            className="mt-7 flex flex-col items-center gap-3.5 font-mono text-[12px] tracking-[0.04em]"
          >
            <div className="num-tab flex items-center gap-3 sm:gap-6">
              <span className="text-ink/50">${RIDER_PRICE_A.toFixed(2)}</span>
              <svg
                width="40"
                height="14"
                viewBox="0 0 60 14"
                className="sm:w-[60px]"
              >
                <path d="M0 7 L60 7" stroke={ACCENT} strokeWidth="1" strokeDasharray="3 3" />
                <path d="M55 3 L60 7 L55 11" stroke={ACCENT} strokeWidth="1" fill="none" />
              </svg>
              <span className="rounded-full bg-ink px-3.5 py-1.5 text-[12px] font-semibold text-white sm:text-[13px]">
                +${PRICE_DELTA.toFixed(2)}
              </span>
              <svg
                width="40"
                height="14"
                viewBox="0 0 60 14"
                className="sm:w-[60px]"
              >
                <path d="M0 7 L60 7" stroke={ACCENT} strokeWidth="1" strokeDasharray="3 3" />
                <path d="M55 3 L60 7 L55 11" stroke={ACCENT} strokeWidth="1" fill="none" />
              </svg>
              <span className="text-ink/50">${RIDER_PRICE_B.toFixed(2)}</span>
            </div>
            {/* TODO: HALLUCINATION — these two lines speculate on the *internals*
                of Uber's pricing model (battery / device age / price-shopping history
                as inputs). Uber has never disclosed these as features. Reframe as
                "the kind of signals the model is suspected of using" or cite Dubal
                p.[X] / Worker Info Exchange audit for the actual documented signals. */}
            <div className="max-w-[500px] text-center font-sans text-[12px] text-ink/55">
              Older Android, lower battery, history of price-shopping.
              <br />
              Newer iPhone, full battery, history of accepting first quote.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
