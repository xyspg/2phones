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

// Illustrative rider prices for the two-phones scenario.
export const RIDER_PRICE_A = 28.4;
export const RIDER_PRICE_B = 34.2;
export const PRICE_DELTA = +(RIDER_PRICE_B - RIDER_PRICE_A).toFixed(2);

// Illustrative trip parameters.
export const TRIP_DISTANCE_MI = "14.2";
export const TRIP_DURATION_MIN = 28;

// Approximate NYC TLC post-expense floor for app-based drivers, ~2024.
export const MIN_WAGE_NY = 19.96;

// Marcus is an illustrative driver — new to the platform, high acceptance.
export const MARCUS: Driver = {
  name: "Marcus · 4★.93",
  hoursOnline: 6,
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
  priorTotal: 247.5,
};

// TODO: HALLUCINATION + NAME COLLISION — "Felix" overlaps with real Hawai'i organizer
// Felix Fernandez named in our group_doc. Either (a) rename to avoid implying we're
// depicting a real person, or (b) explicitly cite Felix Fernandez and use his real
// situation. All trip/pay/hour numbers below are fictional.
export const FELIX: Driver = {
  name: "Felix · 4.97★",
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
