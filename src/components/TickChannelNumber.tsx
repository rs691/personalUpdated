import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";

type TickChannelNumberProps = {
  value: number;
  total: number;
  /** Visual size multiplier */
  scale?: number;
};

/**
 * Motion-style ticking readout: channel count animates to the target
 * (adapted from Motion HTML content / useMotionValue + useTransform).
 */
export default function TickChannelNumber({
  value,
  total,
  scale = 1,
}: TickChannelNumberProps) {
  const count = useMotionValue(value);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useMotionValueEvent(rounded, "change", (v) => setDisplay(v));

  useEffect(() => {
    const from = prev.current;
    const to = value;
    prev.current = value;

    // Directional wrap: keep the tick feeling like one step, not a rewind
    let animFrom = from;
    let animTo = to;
    if (from === total && to === 1) {
      animFrom = from;
      animTo = from + 1;
    } else if (from === 1 && to === total) {
      animFrom = from;
      animTo = from - 1;
    }

    count.set(animFrom);
    const controls = animate(count, animTo, {
      type: "spring",
      stiffness: 280,
      damping: 28,
      mass: 0.6,
      onComplete: () => {
        count.set(to);
        setDisplay(to);
      },
    });
    return () => controls.stop();
  }, [value, total, count]);

  const shown = ((display - 1 + total * 10) % total) + 1;
  const fontSize = Math.round(52 * scale);

  return (
    <div
      style={{
        background: "#0A0B0E",
        border: "1px solid #252B3A",
        borderRadius: 8,
        padding: `${10 * scale}px ${16 * scale}px`,
        boxShadow: "inset 0 2px 12px #00000099, 0 0 28px #F5A00F0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        minWidth: 88 * scale,
      }}
    >
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: Math.max(8, 9 * scale),
          color: "#525F7B",
          letterSpacing: "0.22em",
        }}
      >
        CHANNEL
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <motion.div
          style={{
            fontFamily: "'Chakra Petch', sans-serif",
            fontSize,
            fontWeight: 700,
            lineHeight: 1,
            color: "#F5A00F",
            textShadow: "0 0 24px #F5A00F66",
            fontVariantNumeric: "tabular-nums",
            minWidth: "1.2em",
            textAlign: "right",
          }}
        >
          {String(shown).padStart(2, "0")}
        </motion.div>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: Math.max(11, 14 * scale),
            color: "#2A2D38",
            letterSpacing: "0.08em",
          }}
        >
          / {String(total).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
