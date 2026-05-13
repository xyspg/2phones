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
import { type SceneId, TOTAL, activeScene, useTime } from "./timeline.ts";

const INTERACTIVE_SCENES = new Set<SceneId>(["compare", "driver", "audit"]);

function App() {
  const [playing, setPlaying] = useState(true);
  const [t, setT] = useTime(playing);
  const [completed, setCompleted] = useState<Set<SceneId>>(() => new Set());
  const scene = activeScene(t);
  const blocked = INTERACTIVE_SCENES.has(scene.id) && !completed.has(scene.id);

  useEffect(() => {
    if (t >= TOTAL) {
      const id = setTimeout(() => {
        setCompleted(new Set());
        setT(0);
      }, 2400);
      return () => clearTimeout(id);
    }
  }, [t, setT]);

  // Pause when entering an interactive scene the user hasn't completed yet.
  useEffect(() => {
    if (INTERACTIVE_SCENES.has(scene.id) && !completed.has(scene.id)) {
      setPlaying(false);
    }
  }, [scene.id, completed]);

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
        return <SceneAudit onContinue={() => completeAndResume("audit")} />;
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
          className="scene-stage flex flex-1 flex-col"
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
