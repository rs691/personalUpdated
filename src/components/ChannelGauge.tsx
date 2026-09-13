import { motion } from "framer-motion";

type ChannelGaugeProps = {
  channelIndex: number;
  total: number;
  onStep: (direction: 1 | -1) => void;
  onSelect: (index: number) => void;
  compact?: boolean;
};

/**
 * Light pagination gauge — click segments to jump, chevrons for back/forward.
 */
export default function ChannelGauge({
  channelIndex,
  total,
  onStep,
  onSelect,
  compact = false,
}: ChannelGaugeProps) {
  const h = compact ? 10 : 12;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: compact ? 8 : 10,
        width: "100%",
        maxWidth: compact ? 320 : 220,
      }}
    >
      <motion.button
        type="button"
        aria-label="Previous channel"
        onClick={() => onStep(-1)}
        whileTap={{ scale: 0.9 }}
        className="console-focus"
        style={{
          width: compact ? 28 : 32,
          height: compact ? 28 : 32,
          borderRadius: 8,
          border: "1px solid #272A34",
          background:
            "linear-gradient(160deg, #1A1D24 0%, #12141A 70%, #0D0F14 100%)",
          boxShadow: "inset 0 1px 0 #ffffff10, 0 3px 0 #050607",
          color: "#F59E0B",
          cursor: "pointer",
          flexShrink: 0,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 14,
          lineHeight: 1,
          padding: 0,
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
          height: h + 16,
          display: "flex",
          alignItems: "center",
          padding: "0 4px",
          borderRadius: 999,
          background: "#060709",
          border: "1px solid #1C1F27",
          boxShadow: "inset 0 2px 8px #000000aa",
          gap: 3,
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
                height: active ? h + 4 : h,
                border: "none",
                borderRadius: 3,
                padding: 0,
                cursor: "pointer",
                background: lit
                  ? active
                    ? "linear-gradient(180deg, #FCD34D 0%, #F59E0B 55%, #B45309 100%)"
                    : "linear-gradient(180deg, #B8843A 0%, #8A5A1A 100%)"
                  : "#151820",
                boxShadow: active
                  ? "0 0 10px #F59E0B99, inset 0 1px 0 #ffffff44"
                  : lit
                    ? "0 0 4px #F59E0B33"
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
        whileTap={{ scale: 0.9 }}
        className="console-focus"
        style={{
          width: compact ? 28 : 32,
          height: compact ? 28 : 32,
          borderRadius: 8,
          border: "1px solid #272A34",
          background:
            "linear-gradient(160deg, #1A1D24 0%, #12141A 70%, #0D0F14 100%)",
          boxShadow: "inset 0 1px 0 #ffffff10, 0 3px 0 #050607",
          color: "#F59E0B",
          cursor: "pointer",
          flexShrink: 0,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 14,
          lineHeight: 1,
          padding: 0,
        }}
      >
        ›
      </motion.button>
    </div>
  );
}
