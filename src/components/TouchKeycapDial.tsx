import { useCallback, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { User, X } from "lucide-react";
import RotaryDial from "@/components/RotaryDial";
import TickChannelNumber from "@/components/TickChannelNumber";
import ChannelGauge from "@/components/ChannelGauge";
import {
  KEYCAP_SIZE,
  keycapFace,
  keycapFaceActive,
  keycapHover,
  keycapTap,
  keycapTransition,
} from "@/components/keycapStyles";

/** Dock clearance — tuner + full-width keycap row */
const DOCK_PAD = 252;

type Section = {
  id: string;
  label: string;
  shortLabel: string;
  icon: ElementType;
  detail?: string;
};

export type TouchKeycapDialProps = {
  sections: Section[];
  category: string;
  channelIndex: number;
  total: number;
  channelTitle?: string;
  reducedMotion?: boolean;
  pulseGuide?: boolean;
  onCategoryChange: (id: string) => void;
  onChannelSelect: (index: number) => void;
  clock: ReactNode;
  profile: ReactNode;
  screen: ReactNode;
  stamp?: ReactNode;
};

const glass: CSSProperties = {
  background: "linear-gradient(180deg, #11141Bcc 0%, #0A0B0Ef2 70%)",
  backdropFilter: "blur(16px) saturate(1.2)",
  WebkitBackdropFilter: "blur(16px) saturate(1.2)",
  borderColor: "#252B3Aaa",
};

function SectionKeycap({
  section,
  active,
  reducedMotion,
  onSelect,
}: {
  section: Section;
  active: boolean;
  reducedMotion?: boolean;
  onSelect: () => void;
}) {
  const Icon = section.icon;
  return (
    <motion.button
      type="button"
      role="tab"
      aria-selected={active}
      aria-pressed={active}
      aria-label={section.label}
      title={section.shortLabel}
      onClick={onSelect}
      className="console-focus rim-mark"
      whileHover={reducedMotion ? undefined : keycapHover}
      whileTap={reducedMotion ? undefined : keycapTap}
      transition={keycapTransition}
      style={{
        width: KEYCAP_SIZE,
        height: KEYCAP_SIZE,
        flexShrink: 0,
        minWidth: 0,
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
      <Icon size={16} strokeWidth={active ? 2.35 : 2} />
      <span
        style={{
          fontFamily: "'Chakra Petch', sans-serif",
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: "0.06em",
          lineHeight: 1,
        }}
      >
        {section.shortLabel}
      </span>
    </motion.button>
  );
}

/**
 * Mobile/tablet shell: desktop-proportion tuner (tick + dial + gauge)
 * with the same rim-mark section keycaps underneath.
 */
export default function TouchKeycapDial({
  sections,
  category,
  channelIndex,
  total,
  channelTitle,
  reducedMotion = false,
  pulseGuide = false,
  onCategoryChange,
  onChannelSelect,
  clock,
  profile,
  screen,
  stamp,
}: TouchKeycapDialProps) {
  const [showProfile, setShowProfile] = useState(false);
  const active = sections.find((s) => s.id === category) ?? sections[0];
  const channelIndexRef = useRef(channelIndex);
  channelIndexRef.current = channelIndex;
  const safeTotal = Math.max(total, 1);

  const onStep = useCallback(
    (dir: 1 | -1) => {
      if (total <= 0) return;
      onChannelSelect((channelIndexRef.current + dir + total) % total);
    },
    [onChannelSelect, total],
  );

  return (
    <div
      className="relative"
      style={{
        width: "100vw",
        height: "100dvh",
        background: "#0A0B0E",
        overflow: "hidden",
      }}
    >
      <div className="absolute inset-0 dot-grid pointer-events-none" style={{ zIndex: 0 }} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          paddingTop: 48,
          paddingBottom: DOCK_PAD,
          paddingLeft: 10,
          paddingRight: 10,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid #252B3A",
            boxShadow:
              "0 12px 40px #00000088, inset 0 1px 0 #ffffff08, 0 0 0 1px #0E1016",
          }}
        >
          {screen}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          height: 44,
          padding: "0 12px",
          paddingTop: "env(safe-area-inset-top, 0px)",
          gap: 8,
          borderBottom: "1px solid #252B3A66",
          ...glass,
        }}
      >
        <div
          style={{
            fontFamily: "'Chakra Petch', sans-serif",
            fontSize: 10,
            fontWeight: 700,
            color: "#525F7B",
            letterSpacing: "0.3em",
          }}
        >
          RS-691
        </div>
        <div style={{ width: 1, height: 10, background: "#252B3A" }} />
        <div
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "#F5A00F",
            boxShadow: "0 0 6px #F5A00F",
          }}
        />
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: "#F5A00F",
            letterSpacing: "0.15em",
          }}
        >
          {active?.shortLabel}
        </span>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: "#525F7B",
          }}
        >
          {String(channelIndex + 1).padStart(2, "0")}/
          {String(safeTotal).padStart(2, "0")}
        </span>
        <div style={{ flex: 1 }} />
        <motion.button
          type="button"
          onClick={() => setShowProfile((p) => !p)}
          className="console-focus"
          aria-expanded={showProfile}
          aria-label="System profile"
          style={{
            border: "none",
            background: "none",
            padding: 6,
            cursor: "pointer",
            borderRadius: 8,
          }}
        >
          <User size={16} style={{ color: showProfile ? "#F5A00F" : "#525F7B" }} />
        </motion.button>
        {clock}
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 20,
          padding: "8px 12px calc(8px + env(safe-area-inset-bottom, 0px))",
          borderTop: "1px solid #252B3A66",
          ...glass,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        <AnimatePresence>
          {pulseGuide && !reducedMotion && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                color: "#F5A00F",
                letterSpacing: "0.1em",
                textAlign: "center",
              }}
            >
              KEYCAPS = SECTION · DIAL / GAUGE = CHANNEL
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${category}-${channelIndex}`}
            initial={reducedMotion ? false : { opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -2 }}
            transition={{ duration: 0.16 }}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              color: "#F5A00F",
              letterSpacing: "0.06em",
              textAlign: "center",
              maxWidth: "100%",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              padding: "0 8px",
            }}
          >
            {channelTitle ?? active?.label}
          </motion.div>
        </AnimatePresence>

        {/* Desktop-like tuner proportions (tick + dial + gauge) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            width: "100%",
            padding: "0 4px",
          }}
        >
          <TickChannelNumber
            value={channelIndex + 1}
            total={safeTotal}
            scale={0.95}
          />
          <RotaryDial
            channelIndex={channelIndex}
            total={safeTotal}
            onStep={onStep}
            onSelect={onChannelSelect}
            size={110}
            ariaLabel="Channel dial"
          />
          <div style={{ flex: "1 1 auto", maxWidth: 320 }}>
            <ChannelGauge
              channelIndex={channelIndex}
              total={safeTotal}
              onStep={onStep}
              onSelect={onChannelSelect}
              compact
              reducedMotion={reducedMotion}
            />
          </div>
        </div>

        {/* Section keycaps — centered, evenly spaced */}
        <div
          role="tablist"
          aria-label="Sections"
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            gap: 12,
            paddingTop: 2,
          }}
        >
          {sections.map((s) => (
            <SectionKeycap
              key={s.id}
              section={s}
              active={s.id === category}
              reducedMotion={reducedMotion}
              onSelect={() => onCategoryChange(s.id)}
            />
          ))}
        </div>

        {stamp}
      </div>

      <AnimatePresence>
        {showProfile && (
          <>
            <motion.button
              type="button"
              aria-label="Close profile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfile(false)}
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 30,
                border: "none",
                background: "#00000088",
                backdropFilter: "blur(2px)",
                cursor: "pointer",
              }}
            />
            <motion.div
              initial={reducedMotion ? false : { y: "100%" }}
              animate={{ y: 0 }}
              exit={reducedMotion ? undefined : { y: "100%" }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 320, damping: 34 }
              }
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 40,
                height: "min(72dvh, 560px)",
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                overflow: "hidden",
                border: "1px solid #252B3A",
                borderBottom: "none",
                boxShadow: "0 -16px 48px #000000aa",
                ...glass,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderBottom: "1px solid #252B3A",
                }}
              >
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    color: "#F5A00F",
                    letterSpacing: "0.16em",
                  }}
                >
                  SYSTEM PROFILE
                </span>
                <button
                  type="button"
                  onClick={() => setShowProfile(false)}
                  className="console-focus"
                  aria-label="Close"
                  style={{
                    border: "none",
                    background: "none",
                    color: "#525F7B",
                    cursor: "pointer",
                    padding: 4,
                    borderRadius: 6,
                  }}
                >
                  <X size={16} />
                </button>
              </div>
              <div style={{ height: "calc(100% - 42px)", overflow: "hidden" }}>
                {profile}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
