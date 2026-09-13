import type { ElementType } from "react";
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
  compact?: boolean;
};

/** Bottom mode selector — centered dial + indicator readout pair. */
export default function SectionModeDial({
  sections,
  activeId,
  onChange,
  channelIndex = 0,
  channelTotal = 0,
  compact = false,
}: SectionModeDialProps) {
  const index = Math.max(
    0,
    sections.findIndex((s) => s.id === activeId),
  );
  const active = sections[index] ?? sections[0];
  const Icon = active?.icon;
  const dialSize = compact ? 108 : 140;

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

  return (
    <div
      style={{
        width: "100%",
        padding: compact ? 14 : 18,
        borderRadius: 16,
        background:
          "linear-gradient(180deg, #0E1016 0%, #08090E 55%, #060709 100%)",
        border: "1px solid #1C1F27",
        boxShadow:
          "inset 0 4px 14px #000000cc, inset 0 1px 0 #ffffff0a, 0 1px 0 #12141A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Centered control pair: readout + dial */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: compact ? 16 : 28,
          flexWrap: "wrap",
          maxWidth: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            gap: 8,
            width: compact ? "min(100%, 280px)" : 300,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              color: "#3A3F50",
              letterSpacing: "0.2em",
            }}
          >
            MODE SELECT
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: compact ? "12px 14px" : "16px 18px",
              minHeight: compact ? 88 : 108,
              borderRadius: 12,
              background:
                "linear-gradient(165deg, #0A0C11 0%, #060709 55%, #050607 100%)",
              border: "1px solid #272A34",
              boxShadow:
                "inset 0 2px 10px #000000cc, inset 0 1px 0 #ffffff0a, 0 0 28px #F59E0B10",
            }}
          >
            {Icon && (
              <div
                style={{
                  width: compact ? 36 : 42,
                  height: compact ? 36 : 42,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#12151C",
                  border: "1px solid #F59E0B33",
                  boxShadow: "0 0 16px #F59E0B22",
                  flexShrink: 0,
                }}
              >
                <Icon size={compact ? 18 : 20} style={{ color: "#F59E0B" }} />
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={active?.id ?? "none"}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                >
                  <div
                    style={{
                      fontFamily: "'Chakra Petch', sans-serif",
                      fontSize: compact ? 16 : 20,
                      fontWeight: 700,
                      color: "#F59E0B",
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
                      fontSize: compact ? 11 : 12,
                      color: "#8A909E",
                      letterSpacing: "0.02em",
                      lineHeight: 1.45,
                      marginBottom: 10,
                    }}
                  >
                    {active?.detail ?? ""}
                  </div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10,
                      color: "#3A3F50",
                      letterSpacing: "0.12em",
                    }}
                  >
                    {channelsLabel}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

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
    </div>
  );
}
