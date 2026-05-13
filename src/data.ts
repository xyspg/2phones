export type Trip = { time: string; area: string; pay: number };

export type Driver = {
  name: string;
  hoursOnline: number;
  battery: number;
  payout: number;
  acceptanceRate: number;
  recent: Trip[];
  newTrip: Trip;
  priorCount: number;
  priorTotal: number;
};

// TODO: HALLUCINATION — these dollar figures are illustrative only.
// Either (a) replace with a real documented price-disparity case (e.g. our own 2-phones
// experiment screenshot), or (b) add a visible disclaimer in the UI that numbers are
// representative, not measured.
export const RIDER_PRICE_A = 28.4;
export const RIDER_PRICE_B = 34.2;
export const PRICE_DELTA = +(RIDER_PRICE_B - RIDER_PRICE_A).toFixed(2);

// TODO: HALLUCINATION — fictional trip parameters. Replace with our actual
// recorded test trip if we want this to be real evidence.
export const TRIP_DISTANCE_MI = "14.2";
export const TRIP_DURATION_MIN = 28;

// TODO: VERIFY — NYC TLC minimum pay rule for app-based for-hire drivers was
// roughly $19.96/hr (post-expenses) in 2024; confirm 2026 figure before final
// submit. Add source attribution somewhere in credits or footnote.
export const MIN_WAGE_NY = 19.96;

// TODO: HALLUCINATION — driver "Marcus" is fictional. All recent-trip rows,
// payouts, hours-online, and acceptance-rate values below are illustrative,
// not from a real driver. Either source from a published driver-pay leak
// (Worker Info Exchange dataset) or label the column "Illustrative scenario".
export const MARCUS: Driver = {
  name: "Marcus · 4★.93",
  hoursOnline: 3,
  battery: 71,
  payout: 22.5,
  acceptanceRate: 92,
  recent: [
    { time: "8:24", area: "SoHo", pay: 22.4 },
    { time: "8:32", area: "Chelsea", pay: 18.2 },
    { time: "8:41", area: "Midtown", pay: 24.6 },
  ],
  newTrip: { time: "8:47", area: "JFK", pay: 22.5 },
  priorCount: 13,
  priorTotal: 316.3,
};

// TODO: HALLUCINATION + NAME COLLISION — "Felix" overlaps with real Hawai'i organizer
// Felix Fernandez named in our group_doc. Either (a) rename to avoid implying we're
// depicting a real person, or (b) explicitly cite Felix Fernandez and use his real
// situation. All trip/pay/hour numbers below are fictional.
export const FELIX: Driver = {
  name: "Felix · 4★.97",
  hoursOnline: 11,
  battery: 28,
  payout: 11.1,
  acceptanceRate: 48,
  recent: [
    { time: "5:18", area: "East New York", pay: 8.4 },
    { time: "6:42", area: "Rockaway", pay: 9.2 },
    { time: "7:55", area: "Bushwick", pay: 7.8 },
  ],
  newTrip: { time: "8:47", area: "JFK", pay: 11.1 },
  priorCount: 6,
  priorTotal: 47.2,
};
