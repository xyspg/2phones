import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  type Driver,
  FELIX,
  MARCUS,
  MIN_WAGE_SF,
  type Trip,
  TRIP_DISTANCE_MI,
  TRIP_DURATION_MIN,
} from "../data.ts";
import { DriverApp, PhoneFrame } from "../mockups.tsx";
import { EASE } from "../shared.tsx";

const PAY_DELTA = +(MARCUS.payout - FELIX.payout).toFixed(2);

export function SceneDriver({ onBothAccepted }: { onBothAccepted: () => void }) {
  const [acceptedA, setAcceptedA] = useState(false);
  const [acceptedB, setAcceptedB] = useState(false);
  const both = acceptedA && acceptedB;

  const COLUMNS = [
    {
      driver: MARCUS,
      deviceName: "DRIVER A · 4 mo. tenure",
      phoneLabel: "High acceptance, low desperation",
      accepted: () => acceptedA,
      onAccept: () => setAcceptedA(true),
    },
    {
      driver: FELIX,
      deviceName: "DRIVER B · 3 yr. tenure",
      phoneLabel: "Low acceptance, high need flag",
      accepted: () => acceptedB,
      onAccept: () => setAcceptedB(true),
    },
  ];

  useEffect(() => {
    if (!both) return;
    const id = setTimeout(onBothAccepted, 1400);
    return () => clearTimeout(id);
  }, [both, onBothAccepted]);

  return (
    <div className="flex flex-1 flex-col items-center gap-6 px-5 pb-12 pt-12 sm:px-10 sm:pb-[60px] sm:pt-14">
      <div className="max-w-[900px] text-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.h2
            key={both ? "after" : "before"}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="m-0 font-serif text-[clamp(28px,5vw,56px)] font-normal leading-[1.1] tracking-[-0.02em]"
          >
            {both ? (
              <>
                Same trip.{" "}
                <em className="italic text-ink/55">${PAY_DELTA.toFixed(2)} apart in pay.</em>
              </>
            ) : (
              <>
                Same trip.{" "}
                <em className="italic text-ink/55">Two drivers.</em>
              </>
            )}
          </motion.h2>
        </AnimatePresence>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={both ? "after-sub" : "before-sub"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-2.5 font-mono text-[13px] tracking-[0.01em] text-ink/55 sm:text-[14.5px]"
          >
            {/* TODO: HALLUCINATION — "rent due Friday" is invented narrative.
                Either remove the personal detail or replace with a real driver
                testimony from Worker Info Exchange or Rideshare Drivers United. */}
            {both
              ? "Driver A is new, takes anything. Driver B has rent due Friday."
              : "Tap Accept on each — see what their day already looks like."}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-col items-center gap-12 sm:flex-row sm:items-start sm:gap-10 lg:gap-[60px]">
        {COLUMNS.map((col) => (
          <DriverColumn
            key={col.deviceName}
            accepted={col.accepted()}
            onAccept={col.onAccept}
            deviceName={col.deviceName}
            phoneLabel={col.phoneLabel}
            driver={col.driver}
          />
        ))}
      </div>

      <AnimatePresence>
        {both && (
          <motion.div
            key="hi-tolerance"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
            className="mt-2 max-w-[640px] text-center font-mono text-[11px] leading-[1.6] text-ink/60 sm:text-[11.5px]"
          >
            {/* TODO: HALLUCINATION — "HIGH TOLERANCE FOR LOW PAY" is an invented
                classifier label. Dubal's argument is consistent with this kind of
                personalization, but Uber has never disclosed such a label.
                Either reframe as "the model is suspected of categorizing drivers like…"
                or replace with a real category from Worker Info Exchange disclosures. */}
            Felix has been online {FELIX.hoursOnline} hours, declined two short trips, low
            battery, end of pay period.
            <br />
            The model has classified him as{" "}
            <span className="rounded bg-ink px-2 py-0.5 text-white">
              HIGH&nbsp;TOLERANCE&nbsp;FOR&nbsp;LOW&nbsp;PAY
            </span>
            .
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DriverColumn({
  accepted,
  onAccept,
  deviceName,
  phoneLabel,
  driver,
}: {
  accepted: boolean;
  onAccept: () => void;
  deviceName: string;
  phoneLabel: string;
  driver: Driver;
}) {
  const ledgerHeader = `${driver.name.split(" ·")[0]} · today`;
  return (
    <PhoneFrame deviceName={deviceName} battery={driver.battery} time="8:47" label={phoneLabel}>
      <DriverApp
        payout={driver.payout}
        distance={TRIP_DISTANCE_MI}
        duration={TRIP_DURATION_MIN}
        acceptanceRate={driver.acceptanceRate}
        driverName={driver.name}
        hoursOnline={driver.hoursOnline}
        accepted={accepted}
        onAccept={onAccept}
        ledger={
          <motion.div
            key="ledger"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="flex flex-1 flex-col"
          >
            <Ledger header={ledgerHeader} driver={driver} />
          </motion.div>
        }
      />
    </PhoneFrame>
  );
}

function Ledger({ header, driver }: { header: string; driver: Driver }) {
  const { recent, newTrip, priorCount, priorTotal, hoursOnline } = driver;
  const total = priorTotal + newTrip.pay;
  const tripCount = priorCount + 1;
  const perHour = total / hoursOnline;
  const belowMinWage = perHour < MIN_WAGE_SF;

  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <div className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink/55">
          {header}
        </div>
        <div className="num-tab font-mono text-[11px] text-ink/50">
          {tripCount} trips
        </div>
      </div>

      <div className="flex flex-col gap-0.5">
        {recent.map((tr, i) => (
          <TripRow key={i} trip={tr} />
        ))}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: EASE }}
        >
          <TripRow trip={newTrip} highlight />
        </motion.div>
      </div>

      <div className="mt-auto flex flex-col gap-1.5">
        <div className="h-px bg-ink/[0.08]" />
        <div className="flex items-baseline justify-between">
          <div className="font-mono text-[11px] text-ink/55">{hoursOnline}h online</div>
          <div className="num-tab flex items-center gap-2 font-mono text-[12px]">
            <span className="font-bold text-ink">${total.toFixed(2)}</span>
            <span
              className={`rounded px-2 py-0.5 text-[11px] font-semibold ${
                belowMinWage ? "bg-ink text-white" : "bg-ink/[0.06] text-ink"
              }`}
            >
              ${perHour.toFixed(2)}/hr
            </span>
          </div>
        </div>
        {belowMinWage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="text-right font-mono text-[10.5px] text-ink/55"
          >
            below SF min wage (${MIN_WAGE_SF.toFixed(2)}/hr)
          </motion.div>
        )}
      </div>
    </div>
  );
}

function TripRow({ trip, highlight = false }: { trip: Trip; highlight?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between text-[11.5px] ${
        highlight ? "-mx-2 my-0.5 rounded-md bg-paper px-2 py-1.5" : "py-[5px]"
      }`}
    >
      <span className="flex items-center gap-2.5">
        <span className="num-tab font-mono text-ink/45">{trip.time}</span>
        <span className="text-ink/70">{trip.area}</span>
      </span>
      <span
        className={`num-tab font-mono text-ink ${highlight ? "font-bold" : "font-medium"}`}
      >
        +${trip.pay.toFixed(2)}
      </span>
    </div>
  );
}
