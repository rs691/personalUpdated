import { motion } from "framer-motion";
import {
  KEYCAP_SIZE,
  KEYCAP_SIZE_COMPACT,
  keycapFace,
  keycapHover,
  keycapTap,
  keycapTransition,
} from "@/components/keycapStyles";

type ChannelGaugeProps = {
  channelIndex: number;
  total: number;
  onStep: (direction: 1 | -1) => void;
  onSelect: (index: number) => void;
  compact?: boolean;
  reducedMotion?: boolean;
};

/**
 * Light pagination gauge — click segments to jump, chevrons for back/forward.
 * Arrow keycaps match the mode-dial rim button language.
 */
export default function ChannelGauge({
  channelIndex,
  total,
  onStep,
  onSelect,
  compact = false,
  reducedMotion = false,
}: ChannelGaugeProps) {
  const h = compact ? 10 : 12;
  const key = compact ? KEYCAP_SIZE_COMPACT : KEYCAP_SIZE;
  const hover = reducedMotion ? undefined : keycapHover;
  const tap = reducedMotion ? undefined : keycapTap;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: compact ? 8 : 10,
        width: "100%",
        maxWidth: compact ? 320 : 240,
      }}
    >
      <motion.button
        type="button"
        aria-label="Previous channel"
        onClick={() => onStep(-1)}
        whileHover={hover}
        whileTap={tap}
        transition={keycapTransition}
        className="console-focus rim-mark"
        style={{
          width: key,
          height: key,
          ...keycapFace,
          color: "#F5A00F",
          cursor: "pointer",
          flexShrink: 0,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: compact ? 18 : 20,
          lineHeight: 1,
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ‹
      </motion.button>

      <div
        role="meter"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={channelIndex + 1}
        aria-label="Channel gauge"
        style={{
          flex: 1,
          height: key,
          display: "flex",
          alignItems: "center",
          padding: "0 8px",
          borderRadius: 12,
          background:
            "linear-gradient(165deg, #0E1016 0%, #0A0B0E 55%, #0A0B0E 100%)",
          border: "1px solid #2A2D38",
          boxShadow:
            "inset 0 3px 10px #000000cc, inset 0 1px 0 #ffffff08, 0 2px 0 #050607",
          gap: 3,
          minWidth: 0,
        }}
      >
        {Array.from({ length: total }).map((_, i) => {
          const active = i === channelIndex;
          const lit = i <= channelIndex;
          return (
            <button
              key={i}
              type="button"
              aria-label={`Go to channel ${i + 1}`}
              aria-current={active ? "true" : undefined}
              onClick={() => onSelect(i)}
              className="console-focus"
              style={{
                flex: 1,
                height: active ? h + 6 : h,
                border: "none",
                borderRadius: 4,
                padding: 0,
                cursor: "pointer",
                background: lit
                  ? active
                    ? "linear-gradient(180deg, #FCD34D 0%, #F5A00F 55%, #925B03 100%)"
                    : "linear-gradient(180deg, #B8843A 0%, #8A5A1A 100%)"
                  : "#11141B",
                boxShadow: active
                  ? "0 0 10px #F5A00F99, inset 0 1px 0 #ffffff44"
                  : lit
                    ? "0 0 4px #F5A00F33"
                    : "inset 0 1px 2px #00000088",
                transition: "height 0.15s ease, background 0.2s ease",
              }}
            />
          );
        })}
      </div>

      <motion.button
        type="button"
        aria-label="Next channel"
        onClick={() => onStep(1)}
        whileHover={hover}
        whileTap={tap}
        transition={keycapTransition}
        className="console-focus rim-mark"
        style={{
          width: key,
          height: key,
          ...keycapFace,
          color: "#F5A00F",
          cursor: "pointer",
          flexShrink: 0,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: compact ? 18 : 20,
          lineHeight: 1,
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ›
      </motion.button>
    </div>
  );
}
