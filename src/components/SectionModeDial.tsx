import type { CSSProperties, ElementType, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import RotaryDial from "@/components/RotaryDial";

export type SectionOption = {
  id: string;
  label: string;
  shortLabel: string;
  icon: ElementType;
  detail?: string;
};

type SectionModeDialProps = {
  sections: SectionOption[];
  activeId: string;
  onChange: (id: string) => void;
  channelIndex?: number;
  channelTotal?: number;
  /** Current CRT entry title — shown in MODE SELECT for dial ↔ feed link */
  channelTitle?: string;
  compact?: boolean;
  /** One-shot amber pulse on OPERATOR GUIDE after first boot */
  pulseGuide?: boolean;
  reducedMotion?: boolean;
};

const GUIDE_LINES = [
  { key: "MODE", text: "rim keys change section" },
  { key: "CH", text: "right dial / ‹ › step entries" },
  { key: "FEED", text: "scroll CRT for SUMMARY → IMPACT" },
] as const;

/** Deep-inset LCD bezel — faceplate lip + shadowed glass well. */
function RecessedLcd({
  label,
  children,
  compact = false,
  style,
  pulse = false,
}: {
  label: string;
  children: ReactNode;
  compact?: boolean;
  style?: CSSProperties;
  /** Soft amber bezel pulse (first-visit guide cue). */
  pulse?: boolean;
}) {
  const bezelIdle = {
    borderColor: "#252B3A",
    boxShadow:
      "0 1px 0 #525F7B22, inset 0 1px 0 #ffffff0c, inset 0 -2px 4px #00000088",
  } as const;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: 8,
        width: compact ? "min(100%, 280px)" : 300,
        flex: "0 0 auto",
        ...style,
      }}
    >
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9,
          color: pulse ? "#F5A00F" : "#525F7B",
          letterSpacing: "0.2em",
          transition: "color 0.3s ease",
        }}
      >
        {label}
      </div>
      {/* Outer bezel / lip */}
      <motion.div
        animate={
          pulse
            ? {
                borderColor: ["#252B3A", "#F5A00F", "#252B3A", "#F5A00Faa", "#252B3A"],
                boxShadow: [
                  bezelIdle.boxShadow,
                  "0 0 22px #F5A00F55, inset 0 1px 0 #ffffff0c, inset 0 -2px 4px #00000088",
                  bezelIdle.boxShadow,
                  "0 0 28px #F5A00F66, inset 0 1px 0 #ffffff0c, inset 0 -2px 4px #00000088",
                  bezelIdle.boxShadow,
                ],
              }
            : bezelIdle
        }
        transition={
          pulse
            ? { duration: 2.2, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" }
            : { duration: 0.25 }
        }
        style={{
          borderRadius: 14,
          padding: compact ? 5 : 6,
          background:
            "linear-gradient(165deg, #1A1D24 0%, #12151C 40%, #0A0B0E 100%)",
          border: "1px solid #252B3A",
          boxShadow: bezelIdle.boxShadow,
          height: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Inner glass well — recessed inward */}
        <div
          style={{
            position: "relative",
            borderRadius: 10,
            minHeight: compact ? 112 : 148,
            height: "100%",
            padding: compact ? "14px 14px" : "18px 16px",
            boxSizing: "border-box",
            background:
              "radial-gradient(120% 90% at 50% 0%, #12151C 0%, #080A0F 55%, #050607 100%)",
            border: "1px solid #0E1016",
            boxShadow:
              "inset 0 6px 16px #000000ee, inset 0 1px 0 #ffffff08, inset 0 -1px 0 #F5A00F08, 0 0 24px #F5A00F0a",
            overflow: "hidden",
          }}
        >
          {/* Soft glass reflection */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 10,
              background:
                "linear-gradient(180deg, #ffffff06 0%, transparent 42%)",
              pointerEvents: "none",
            }}
          />
          {/* Scanline hint */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 10,
              background:
                "repeating-linear-gradient(0deg, transparent, transparent 3px, #00000018 3px, #00000018 4px)",
              opacity: 0.45,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "relative",
              zIndex: 1,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {children}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/** Bottom mode selector — MODE SELECT · dial · OPERATOR GUIDE triad. */
export default function SectionModeDial({
  sections,
  activeId,
  onChange,
  channelIndex = 0,
  channelTotal = 0,
  channelTitle,
  compact = false,
  pulseGuide = false,
  reducedMotion = false,
}: SectionModeDialProps) {
  const index = Math.max(
    0,
    sections.findIndex((s) => s.id === activeId),
  );
  const active = sections[index] ?? sections[0];
  const Icon = active?.icon;
  const dialSize = compact ? 100 : 132;

  const onSelect = (i: number) => {
    const next = sections[i];
    if (next) onChange(next.id);
  };

  const onStep = (dir: 1 | -1) => {
    const next = (index + dir + sections.length) % sections.length;
    onSelect(next);
  };

  const channelsLabel =
    channelTotal > 0
      ? `${String(channelTotal).padStart(2, "0")} CHANNELS · CH ${String(channelIndex + 1).padStart(2, "0")} ACTIVE`
      : `${String(index + 1).padStart(2, "0")} / ${String(sections.length).padStart(2, "0")}`;

  const entryLine =
    channelTitle && channelTotal > 0
      ? `CH ${String(channelIndex + 1).padStart(2, "0")} · ${channelTitle}`
      : null;

  return (
    <div
      style={{
        width: "100%",
        padding: compact ? 10 : 14,
        borderRadius: 16,
        background:
          "linear-gradient(180deg, #0E1016 0%, #0A0B0E 55%, #0A0B0E 100%)",
        border: "1px solid #252B3A",
        boxShadow:
          "inset 0 4px 14px #000000cc, inset 0 1px 0 #ffffff0a, 0 1px 0 #12141A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: compact ? 14 : 22,
        flexWrap: compact ? "wrap" : "nowrap",
      }}
    >
      <RecessedLcd
        label="MODE SELECT"
        compact={compact}
        style={{
          order: compact ? 2 : 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: compact ? 10 : 14,
          }}
        >
          {Icon && (
            <div
              style={{
                width: compact ? 36 : 44,
                height: compact ? 36 : 44,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#0A0C11",
                border: "1px solid #F5A00F33",
                boxShadow:
                  "inset 0 2px 6px #000000aa, 0 0 16px #F5A00F22",
                flexShrink: 0,
              }}
            >
              <Icon size={compact ? 18 : 22} style={{ color: "#F5A00F" }} />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${active?.id ?? "none"}-${channelIndex}`}
                initial={reducedMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, y: -4 }}
                transition={{ duration: reducedMotion ? 0 : 0.18 }}
              >
                <div
                  style={{
                    fontFamily: "'Chakra Petch', sans-serif",
                    fontSize: compact ? 16 : 22,
                    fontWeight: 700,
                    color: "#F5A00F",
                    letterSpacing: "0.1em",
                    lineHeight: 1.15,
                    marginBottom: 6,
                  }}
                >
                  {active?.label}
                </div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: compact ? 11 : 13,
                    color: "#94A3B8",
                    letterSpacing: "0.02em",
                    lineHeight: 1.45,
                    marginBottom: 8,
                  }}
                >
                  {active?.detail ?? ""}
                </div>
                {entryLine && (
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: compact ? 10 : 11,
                      color: "#C9954A",
                      letterSpacing: "0.04em",
                      lineHeight: 1.4,
                      marginBottom: 8,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={entryLine}
                  >
                    {entryLine}
                  </div>
                )}
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    color: "#525F7B",
                    letterSpacing: "0.12em",
                  }}
                >
                  {channelsLabel}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </RecessedLcd>

      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          order: compact ? 1 : 0,
          width: compact ? "100%" : "auto",
        }}
      >
        <RotaryDial
          channelIndex={index}
          total={sections.length}
          onStep={onStep}
          onSelect={onSelect}
          size={dialSize}
          ariaLabel="Section mode dial"
          markers={sections}
        />
      </div>

      <RecessedLcd
        label="OPERATOR GUIDE"
        compact={compact}
        pulse={pulseGuide}
        style={{
          order: compact ? 3 : 0,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: compact ? 10 : 14,
            justifyContent: "center",
          }}
        >
          {GUIDE_LINES.map((line) => (
            <div
              key={line.key}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 10,
              }}
            >
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: compact ? 10 : 11,
                  fontWeight: 600,
                  color: "#F5A00F",
                  letterSpacing: "0.14em",
                  width: compact ? 36 : 40,
                  flexShrink: 0,
                }}
              >
                {line.key}
              </span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: compact ? 10 : 12,
                  color: "#94A3B8",
                  letterSpacing: "0.02em",
                  lineHeight: 1.4,
                }}
              >
                {line.text}
              </span>
            </div>
          ))}
        </div>
      </RecessedLcd>
    </div>
  );
}
