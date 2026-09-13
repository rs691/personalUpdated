import { useCallback, useEffect, useState } from "react";
import { animate, motion, useMotionValue } from "framer-motion";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function angleForIndex(index: number, total: number) {
  if (total <= 0) return 0;
  return (index / total) * 360;
}

type RotaryDialProps = {
  channelIndex: number;
  total: number;
  onStep: (direction: 1 | -1) => void;
  onSelect: (index: number) => void;
  size?: number;
};

/** Click left / right to turn; ticks jump; knob springs smoothly. No drag. */
export default function RotaryDial({
  channelIndex,
  total,
  onStep,
  onSelect,
  size = 128,
}: RotaryDialProps) {
  const reducedMotion = usePrefersReducedMotion();
  const rotation = useMotionValue(angleForIndex(channelIndex, total));

  useEffect(() => {
    const target = angleForIndex(channelIndex, total);
    if (reducedMotion) {
      rotation.set(target);
      return;
    }
    const controls = animate(rotation, target, {
      type: "spring",
      stiffness: 220,
      damping: 22,
      mass: 0.9,
    });
    return () => controls.stop();
  }, [channelIndex, total, reducedMotion, rotation]);

  const handleSurfaceClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      // Left half = previous, right half = next
      onStep(x < rect.width / 2 ? -1 : 1);
    },
    [onStep],
  );

  const ticks = Array.from({ length: total }, (_, i) => {
    const a = angleForIndex(i, total);
    const active = i === channelIndex;
    return (
      <button
        key={i}
        type="button"
        aria-label={`Channel ${i + 1}`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(i);
        }}
        className="console-focus"
        style={{
          position: "absolute",
          inset: 0,
          transform: `rotate(${a}deg)`,
          border: "none",
          background: "transparent",
          padding: 0,
          cursor: "pointer",
          borderRadius: "50%",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 4,
            left: "50%",
            width: active ? 4 : 3,
            height: active ? 14 : 9,
            marginLeft: active ? -2 : -1.5,
            borderRadius: 1,
            background: active ? "#F59E0B" : "#3A3F50",
            boxShadow: active ? "0 0 8px #F59E0B88" : "none",
            pointerEvents: "none",
          }}
        />
      </button>
    );
  });

  return (
    <div
      role="group"
      aria-label="Channel dial"
      tabIndex={0}
      onClick={handleSurfaceClick}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowUp") {
          e.preventDefault();
          onStep(1);
        } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
          e.preventDefault();
          onStep(-1);
        }
      }}
      className="console-focus"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        position: "relative",
        cursor: "pointer",
        background:
          "radial-gradient(circle at 50% 45%, #1A1D24 0%, #0E1015 55%, #060709 100%)",
        boxShadow:
          "inset 0 2px 8px #000000cc, inset 0 -1px 0 #2A2D3844, 0 8px 0 #040506, 0 10px 24px #00000088",
        border: "1px solid #272A34",
      }}
    >
      {ticks}

      <div
        style={{
          position: "absolute",
          inset: 14,
          borderRadius: "50%",
          pointerEvents: "none",
          background:
            "radial-gradient(circle at 35% 30%, #2A2F3A 0%, #151820 45%, #0A0C10 100%)",
          boxShadow:
            "inset 0 1px 0 #ffffff14, inset 0 -2px 6px #00000099, 0 0 0 1px #1C1F27",
        }}
      />

      <motion.div
        style={{
          position: "absolute",
          inset: 22,
          borderRadius: "50%",
          rotate: rotation,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at 32% 28%, #3A4050 0%, #1C1F27 40%, #0D0F14 78%, #08090C 100%)",
          boxShadow:
            "inset 0 2px 3px #ffffff18, inset 0 -4px 10px #000000aa, 0 2px 4px #00000066",
          border: "1px solid #2A2D38",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 8,
            left: "50%",
            width: 4,
            height: size * 0.18,
            marginLeft: -2,
            borderRadius: 2,
            background:
              "linear-gradient(180deg, #FCD34D 0%, #F59E0B 60%, #B45309 100%)",
            boxShadow: "0 0 10px #F59E0B99, 0 0 2px #F59E0B",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: size * 0.22,
            height: size * 0.22,
            marginLeft: -(size * 0.11),
            marginTop: -(size * 0.11),
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 35% 30%, #2A2D38 0%, #13151B 70%, #08090C 100%)",
            boxShadow:
              "inset 0 1px 0 #ffffff12, 0 0 0 1px #1C1F27, 0 2px 4px #00000088",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, #ffffff18 0%, transparent 38%, transparent 62%, #00000044 100%)",
          }}
        />
      </motion.div>

      {/* Hit-zone hints */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          pointerEvents: "none",
          background:
            "linear-gradient(90deg, #F59E0B08 0%, transparent 42%, transparent 58%, #F59E0B08 100%)",
        }}
      />
    </div>
  );
}
