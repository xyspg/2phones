import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { Chrome, Stage } from "./chrome.tsx";
import { SceneAudit } from "./scenes/audit.tsx";
import { SceneCompare } from "./scenes/compare.tsx";
import { SceneCredits } from "./scenes/credits.tsx";
import { SceneDriver } from "./scenes/driver.tsx";
import { SceneFlip } from "./scenes/flip.tsx";
import { SceneIntro } from "./scenes/intro.tsx";
import { SceneSim } from "./scenes/sim.tsx";
import { SceneThesis } from "./scenes/thesis.tsx";
import { SceneWedge } from "./scenes/wedge.tsx";
import { EASE } from "./shared.tsx";
import { SCENES, type SceneId, TOTAL, activeScene, useTime } from "./timeline.ts";

const INTERACTIVE_SCENES = new Set<SceneId>(["compare", "driver", "audit"]);

function App() {
  const [playing, setPlaying] = useState(true);
  const [t, setT] = useTime(playing);
  const [completed, setCompleted] = useState<Set<SceneId>>(() => new Set());
  const scene = activeScene(t);
  const blocked = INTERACTIVE_SCENES.has(scene.id) && !completed.has(scene.id);

  // Stop the playhead when we hit the end; users can restart via the chrome bar.
  useEffect(() => {
    if (t >= TOTAL) setPlaying(false);
  }, [t]);

  // Pause when entering an interactive scene the user hasn't completed yet.
  useEffect(() => {
    if (INTERACTIVE_SCENES.has(scene.id) && !completed.has(scene.id)) {
      setPlaying(false);
    }
  }, [scene.id, completed]);

  // On mount, respect an initial hash like #thesis and seek the playhead there.
  useEffect(() => {
    const id = window.location.hash.slice(1) as SceneId;
    const target = SCENES.find((s) => s.id === id);
    if (target) setT(target.start);
  }, [setT]);

  // Keep the URL hash in sync with the active scene as the timeline advances.
  useEffect(() => {
    const desired = `#${scene.id}`;
    if (window.location.hash !== desired) {
      window.history.replaceState(null, "", desired);
    }
  }, [scene.id]);

  // Back/forward and manual hash edits seek the playhead to that scene's start.
  useEffect(() => {
    const onHashChange = () => {
      const id = window.location.hash.slice(1) as SceneId;
      const target = SCENES.find((s) => s.id === id);
      if (!target) return;
      setCompleted(new Set());
      setT(target.start);
      setPlaying(true);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [setT]);

  const completeAndResume = useCallback((id: SceneId) => {
    setCompleted((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setPlaying(true);
  }, []);

  const resetCompleted = useCallback(() => setCompleted(new Set()), []);

  const renderScene = () => {
    switch (scene.id) {
      case "intro":
        return <SceneIntro t={t} scene={scene} />;
      case "compare":
        return <SceneCompare onBothRequested={() => completeAndResume("compare")} />;
      case "flip":
        return <SceneFlip t={t} scene={scene} />;
      case "driver":
        return <SceneDriver onBothAccepted={() => completeAndResume("driver")} />;
      case "wedge":
        return <SceneWedge t={t} scene={scene} />;
      case "sim":
        return <SceneSim t={t} scene={scene} />;
      case "audit":
        return (
          <SceneAudit
            onContinue={() => {
              completeAndResume("audit");
              const idx = SCENES.findIndex((s) => s.id === "audit");
              const next = SCENES[idx + 1];
              if (next) setT(next.start);
            }}
          />
        );
      case "thesis":
        return <SceneThesis t={t} scene={scene} />;
      case "credits":
        return <SceneCredits t={t} scene={scene} />;
    }
  };

  return (
    <Stage>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={scene.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="flex flex-1 flex-col"
        >
          {renderScene()}
        </motion.div>
      </AnimatePresence>
      <Chrome
        t={t}
        scene={scene}
        playing={playing}
        playDisabled={blocked}
        onPlayToggle={() => {
          if (blocked) return;
          setPlaying((v) => !v);
        }}
        onSeek={(s) => {
          resetCompleted();
          setT(s);
          setPlaying(true);
        }}
        onScene={(s) => {
          resetCompleted();
          setT(s.start);
          setPlaying(true);
        }}
      />
    </Stage>
  );
}

export default App;
