import { useCallback, useEffect, useState, type ElementType } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import {
  KEYCAP_SIZE,
  KEYCAP_SIZE_COMPACT,
  keycapFace,
  keycapFaceActive,
  keycapHover,
  keycapTap,
  keycapTransition,
} from "@/components/keycapStyles";

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

export type DialMarker = {
  id: string;
  shortLabel: string;
  icon: ElementType;
};

type RotaryDialProps = {
  channelIndex: number;
  total: number;
  onStep: (direction: 1 | -1) => void;
  onSelect: (index: number) => void;
  size?: number;
  ariaLabel?: string;
  /** Fixed rim labels (icon + abbrev). Do not rotate with the knob face. */
  markers?: DialMarker[];
};

/** Click left / right to turn; ticks jump; extruded knob with fixed-light specular. */
export default function RotaryDial({
  channelIndex,
  total,
  onStep,
  onSelect,
  size = 128,
  ariaLabel = "Channel dial",
  markers,
}: RotaryDialProps) {
  const reducedMotion = usePrefersReducedMotion();
  const rotation = useMotionValue(angleForIndex(channelIndex, total));
  // Keep highlight lit from top-left while the knob turns
  const specularRotate = useTransform(rotation, (r) => -r);

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
      onStep(x < rect.width / 2 ? -1 : 1);
    },
    [onStep],
  );

  const wall = Math.max(8, size * 0.07);
  const hasMarkers = Boolean(markers && markers.length > 0);
  // Extra pad so raised keycap marks clear the knob
  const ringPad = hasMarkers ? Math.max(48, size * 0.42) : 0;
  const outer = size + ringPad * 2;
  const dialTop = ringPad;
  const dialLeft = ringPad;
  const iconPx = size < 110 ? 14 : 16;
  const keySize = size < 110 ? KEYCAP_SIZE_COMPACT : KEYCAP_SIZE;

  // Ticks: clickable jump targets on tuner; decorative only when rim keycaps own selection
  const ticks = Array.from({ length: total }, (_, i) => {
    const a = angleForIndex(i, total);
    const active = i === channelIndex;
    const tickMark = (
      <span
        style={{
          position: "absolute",
          top: 5,
          left: "50%",
          width: active ? 4 : 3,
          height: active ? 14 : 9,
          marginLeft: active ? -2 : -1.5,
          borderRadius: 1,
          background: active ? "#F5A00F" : "#525F7B",
          boxShadow: active ? "0 0 8px #F5A00F88" : "none",
          pointerEvents: "none",
        }}
      />
    );

    if (hasMarkers) {
      return (
        <div
          key={i}
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            transform: `rotate(${a}deg)`,
            pointerEvents: "none",
            zIndex: 4,
          }}
        >
          {tickMark}
        </div>
      );
    }

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
          zIndex: 4,
        }}
      >
        {tickMark}
      </button>
    );
  });

  const rimMarks =
    hasMarkers &&
    markers!.map((m, i) => {
      const a = angleForIndex(i, total);
      const active = i === channelIndex;
      const Icon = m.icon;
      const rad = ((a - 90) * Math.PI) / 180;
      const r = size / 2 + ringPad * 0.58;
      const cx = outer / 2 + Math.cos(rad) * r;
      const cy = outer / 2 + Math.sin(rad) * r;
      return (
        <div
          key={m.id}
          style={{
            position: "absolute",
            left: cx,
            top: cy,
            width: keySize,
            height: keySize,
            marginLeft: -(keySize / 2),
            marginTop: -(keySize / 2),
            zIndex: 6,
          }}
        >
          <motion.button
            type="button"
            aria-label={m.shortLabel}
            aria-pressed={active}
            title={m.shortLabel}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(i);
            }}
            whileHover={reducedMotion ? undefined : keycapHover}
            whileTap={reducedMotion ? undefined : keycapTap}
            transition={keycapTransition}
            className="console-focus rim-mark"
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              padding: 0,
              cursor: "pointer",
              color: active ? "#F5A00F" : "#94A3B8",
              ...keycapFace,
              ...(active ? keycapFaceActive : null),
            }}
          >
            <Icon size={iconPx} strokeWidth={active ? 2.35 : 2} />
            <span
              style={{
                fontFamily: "'Chakra Petch', sans-serif",
                fontSize: size < 110 ? 7 : 8,
                fontWeight: 700,
                letterSpacing: "0.06em",
                lineHeight: 1,
              }}
            >
              {m.shortLabel}
            </span>
          </motion.button>
        </div>
      );
    });

  return (
    <div
      style={{
        position: "relative",
        width: outer,
        height: outer + wall,
        flexShrink: 0,
      }}
    >
      {rimMarks}

      {/* Cylinder side wall (extrusion) */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: dialLeft + 2,
          right: ringPad + 2,
          top: dialTop + size * 0.55,
          height: wall + size * 0.2,
          borderRadius: "0 0 50% 50% / 0 0 40% 40%",
          background:
            "linear-gradient(180deg, #1A1D24 0%, #0A0C10 55%, #050607 100%)",
          boxShadow: "0 10px 18px #00000099",
          zIndex: 0,
        }}
      />

      <div
        role="group"
        aria-label={ariaLabel}
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
          position: "absolute",
          left: dialLeft,
          top: dialTop,
          cursor: "pointer",
          zIndex: 1,
          background:
            "radial-gradient(circle at 50% 42%, #22262F 0%, #12151C 48%, #07080B 100%)",
          boxShadow: `
            inset 0 2px 4px #ffffff14,
            inset 0 -6px 14px #000000cc,
            0 ${wall}px 0 #0A0B0E,
            0 ${wall + 2}px 0 #050607,
            0 ${wall + 6}px 20px #000000aa
          `,
          border: "1px solid #2A2D38",
        }}
      >
        {ticks}

        {/* Bezel lip */}
        <div
          style={{
            position: "absolute",
            inset: 10,
            borderRadius: "50%",
            pointerEvents: "none",
            background:
              "radial-gradient(circle at 32% 28%, #3A4050 0%, #1A1D24 42%, #11141B 100%)",
            boxShadow:
              "inset 0 1px 0 #ffffff18, inset 0 -3px 8px #000000aa, 0 0 0 1px #252B3A",
            zIndex: 1,
          }}
        />

        {/* Rotating knob face */}
        <motion.div
          style={{
            position: "absolute",
            inset: 20,
            borderRadius: "50%",
            rotate: rotation,
            pointerEvents: "none",
            background:
              "radial-gradient(circle at 30% 26%, #4A5060 0%, #232833 38%, #12151B 78%, #08090C 100%)",
            boxShadow:
              "inset 0 2px 3px #ffffff1a, inset 0 -5px 12px #000000bb, 0 2px 4px #00000066",
            border: "1px solid #2A2D38",
            zIndex: 2,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 7,
              left: "50%",
              width: 4,
              height: size * 0.17,
              marginLeft: -2,
              borderRadius: 2,
              background:
                "linear-gradient(180deg, #FCD34D 0%, #F5A00F 55%, #925B03 100%)",
              boxShadow: "0 0 10px #F5A00F99",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: size * 0.2,
              height: size * 0.2,
              marginLeft: -(size * 0.1),
              marginTop: -(size * 0.1),
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 35% 30%, #2F3440 0%, #14161C 70%, #08090C 100%)",
              boxShadow:
                "inset 0 1px 0 #ffffff12, 0 0 0 1px #252B3A, 0 2px 4px #00000088",
            }}
          />
          {/* Counter-rotated specular so light stays fixed in space */}
          <motion.div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              rotate: specularRotate,
              background:
                "linear-gradient(135deg, #ffffff22 0%, transparent 34%, transparent 68%, #00000055 100%)",
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
