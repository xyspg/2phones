import { type Dispatch, type SetStateAction, useCallback, useEffect, useRef, useState } from "react";

export type SceneId =
  | "intro"
  | "compare"
  | "flip"
  | "driver"
  | "wedge"
  | "sim"
  | "audit"
  | "thesis"
  | "credits";

export type Scene = {
  id: SceneId;
  start: number;
  end: number;
  label: string;
};

type SceneDef = { id: SceneId; duration: number; label: string };

const SCENE_DEFS: SceneDef[] = [
  { id: "intro", duration: 7, label: "01 / Setup" },
  { id: "compare", duration: 6, label: "02 / Same trip, different price" },
  { id: "flip", duration: 6, label: "03 / Now look at the drivers" },
  { id: "driver", duration: 12, label: "04 / Same trip, different pay" },
  { id: "wedge", duration: 12, label: "05 / Where the difference goes" },
  { id: "sim", duration: 18, label: "06 / Live: the algorithm learns" },
  { id: "audit", duration: 22, label: "07 / Audit the dashboard Felix can't see" },
  { id: "thesis", duration: 12, label: "08 / Algorithmic wage discrimination" },
  { id: "credits", duration: 12, label: "09 / Credits" },
];

export const SCENES: Scene[] = SCENE_DEFS.reduce<Scene[]>((acc, def) => {
  const start = acc.length === 0 ? 0 : acc[acc.length - 1].end;
  acc.push({ id: def.id, start, end: start + def.duration, label: def.label });
  return acc;
}, []);

export const TOTAL = SCENES[SCENES.length - 1].end;

export function activeScene(t: number): Scene {
  return SCENES.find((s) => t >= s.start && t < s.end) ?? SCENES[SCENES.length - 1];
}

export function useTime(playing: boolean) {
  const [t, setT] = useState(0);
  const [restartKey, setRestartKey] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);
  useEffect(() => {
    if (!playing) {
      lastRef.current = null;
      return;
    }
    const tick = (now: number) => {
      if (lastRef.current == null) lastRef.current = now;
      const dt = (now - lastRef.current) / 1000;
      lastRef.current = now;
      let reachedEnd = false;
      setT((prev) => {
        const next = prev + dt;
        if (next >= TOTAL) {
          reachedEnd = true;
          return TOTAL;
        }
        return next;
      });
      if (!reachedEnd) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, restartKey]);
  // External callers who jump the playhead need the RAF loop to re-arm even
  // when `playing` was already true (otherwise it stays stopped at TOTAL).
  const setTime: Dispatch<SetStateAction<number>> = useCallback((value) => {
    lastRef.current = null;
    setT(value);
    setRestartKey((k) => k + 1);
  }, []);
  return [t, setTime] as const;
}

export const clamp01 = (p: number) => Math.max(0, Math.min(1, p));
export const easeOut = (p: number) => 1 - Math.pow(1 - clamp01(p), 3);
export const sceneProgress = (t: number, scene: Scene) =>
  (t - scene.start) / (scene.end - scene.start);
