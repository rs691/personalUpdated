import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  animate,
} from "framer-motion";
import { ChevronLeft, ChevronRight, User, X } from "lucide-react";

const HOLD_MS = 280;
const CYCLE_MS = 420;
const DOCK_PAD = 252;

type Section = {
  id: string;
  label: string;
  shortLabel: string;
  icon: ElementType;
  detail?: string;
};

export type TouchConsoleProps = {
  sections: Section[];
  category: string;
  channelIndex: number;
  total: number;
  channelTitle?: string;
  flickering: boolean;
  reducedMotion?: boolean;
  pulseGuide?: boolean;
  onCategoryChange: (id: string) => void;
  onChannelSelect: (index: number) => void;
  clock: ReactNode;
  profile: ReactNode;
  screen: ReactNode;
  stamp?: ReactNode;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function vibrate(ms = 8) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* ignore */
  }
}

/** Soft pointer tilt for the CRT card — capped, never flips. */
function TiltFrame({
  children,
  reducedMotion = false,
}: {
  children: ReactNode;
  reducedMotion?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const restX = 1.0;
  const maxY = 1.2;
  const maxXDelta = 0.7;
  const rotateX = useMotionValue(reducedMotion ? 0 : restX);
  const rotateY = useMotionValue(0);
  const transform = useMotionTemplate`perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

  const onMove = (e: React.PointerEvent) => {
    if (reducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    const px = clamp((e.clientX - rect.left) / rect.width - 0.5, -0.5, 0.5);
    const py = clamp((e.clientY - rect.top) / rect.height - 0.5, -0.5, 0.5);
    rotateY.set(clamp(px * (maxY * 2), -maxY, maxY));
    rotateX.set(
      clamp(restX - py * (maxXDelta * 2), restX - maxXDelta, restX + maxXDelta),
    );
  };

  const onLeave = () => {
    if (reducedMotion) return;
    animate(rotateX, restX, { type: "spring", stiffness: 180, damping: 22 });
    animate(rotateY, 0, { type: "spring", stiffness: 180, damping: 22 });
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{
        transform,
        transformStyle: "preserve-3d",
        height: "100%",
        width: "100%",
        willChange: "transform",
      }}
    >
      {children}
    </motion.div>
  );
}

function HoldProgressRing({
  progress,
  active,
}: {
  progress: number;
  active: boolean;
}) {
  const r = 18;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - clamp(progress, 0, 1));
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 44 44"
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        margin: "auto",
        pointerEvents: "none",
        opacity: active || progress > 0.02 ? 1 : 0,
        transition: "opacity 0.15s ease",
      }}
    >
      <circle
        cx="22"
        cy="22"
        r={r}
        fill="none"
        stroke="#252B3A"
        strokeWidth="2.5"
      />
      <circle
        cx="22"
        cy="22"
        r={r}
        fill="none"
        stroke="#F5A00F"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 22 22)"
        style={{ filter: "drop-shadow(0 0 4px #F5A00F88)" }}
      />
    </svg>
  );
}

function useHoldCycle({
  onStep,
  reducedMotion = false,
}: {
  onStep: (dir: 1 | -1) => void;
  reducedMotion?: boolean;
}) {
  const [dir, setDir] = useState<1 | -1>(1);
  const [progress, setProgress] = useState(0);
  const [cycling, setCycling] = useState(false);
  const pressedAt = useRef<number | null>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cycleTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const raf = useRef<number | null>(null);
  const stepped = useRef(false);
  const dirRef = useRef(dir);
  dirRef.current = dir;

  const onStepRef = useRef(onStep);
  onStepRef.current = onStep;

  const clearAll = useCallback(() => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    if (cycleTimer.current) clearInterval(cycleTimer.current);
    if (raf.current) cancelAnimationFrame(raf.current);
    holdTimer.current = null;
    cycleTimer.current = null;
    raf.current = null;
    pressedAt.current = null;
    setProgress(0);
    setCycling(false);
  }, []);

  useEffect(() => () => clearAll(), [clearAll]);

  const startProgress = () => {
    const start = performance.now();
    const tick = (now: number) => {
      const t = clamp((now - start) / HOLD_MS, 0, 1);
      setProgress(t);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    clearAll();
    stepped.current = false;
    pressedAt.current = performance.now();
    if (reducedMotion) return;
    startProgress();
    holdTimer.current = setTimeout(() => {
      setCycling(true);
      setProgress(1);
      onStepRef.current(dirRef.current);
      stepped.current = true;
      vibrate(10);
      cycleTimer.current = setInterval(() => {
        onStepRef.current(dirRef.current);
        vibrate(6);
      }, CYCLE_MS);
    }, HOLD_MS);
  };

  const onPointerUp = () => {
    const heldFor =
      pressedAt.current != null ? performance.now() - pressedAt.current : 0;
    const wasCycling = stepped.current;
    clearAll();
    if (!wasCycling && heldFor < HOLD_MS) {
      onStepRef.current(dirRef.current);
      vibrate(8);
    }
  };

  const flipDir = () => {
    setDir((d) => (d === 1 ? -1 : 1));
    vibrate(12);
  };

  return {
    dir,
    progress,
    cycling,
    onPointerDown,
    onPointerUp,
    onPointerCancel: clearAll,
    flipDir,
  };
}

const chevronVariants = {
  idle: {
    x: 0,
    opacity: 0.7,
    scale: 1,
    transition: {
      x: {
        duration: 1.4,
        repeat: Infinity,
        repeatType: "mirror" as const,
        ease: "easeInOut" as const,
      },
      opacity: {
        duration: 1.4,
        repeat: Infinity,
        repeatType: "mirror" as const,
        ease: "easeInOut" as const,
      },
    },
  },
  pressed: {
    x: 0,
    opacity: 1,
    scale: 0.88,
    transition: { type: "spring" as const, stiffness: 500, damping: 28 },
  },
  cycling: {
    opacity: [0.45, 1, 0.45],
    scale: [1, 1.08, 1],
    transition: {
      duration: 0.42,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

/** Idle breathe offset — left chevrons nudge left, right nudge right. */
function chevronIdleX(side: "left" | "right") {
  return side === "left" ? [0, -4, 0] : [0, 4, 0];
}

function AnimatedChevronButton({
  side,
  state,
  reducedMotion,
  onStep,
  label,
}: {
  side: "left" | "right";
  state: "idle" | "pressed" | "cycling";
  reducedMotion?: boolean;
  onStep: () => void;
  label: string;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  const trail = side === "left" ? [-5, -9] : [5, 9];

  return (
    <motion.button
      type="button"
      className="console-focus"
      aria-label={label}
      onClick={onStep}
      whileTap={reducedMotion ? undefined : { scale: 0.9 }}
      style={{
        position: "relative",
        width: 44,
        height: 44,
        flexShrink: 0,
        borderRadius: 12,
        border: `1px solid ${state === "cycling" ? "#F5A00F66" : "#252B3A"}`,
        background:
          state === "cycling"
            ? "linear-gradient(165deg, #F5A00F22 0%, #0A0B0Eee 100%)"
            : "linear-gradient(165deg, #12151Ccc 0%, #0A0B0Eee 100%)",
        boxShadow:
          state === "cycling"
            ? "0 0 16px #F5A00F44, inset 0 1px 0 #ffffff10"
            : "inset 0 2px 6px #00000099",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: "#F5A00F",
        padding: 0,
      }}
    >
      {/* Ghost trail — visible while cycling */}
      {!reducedMotion && state === "cycling" && (
        <>
          <motion.span
            aria-hidden
            style={{
              position: "absolute",
              display: "flex",
              opacity: 0.25,
              x: trail[1],
            }}
          >
            <Icon size={18} strokeWidth={2} />
          </motion.span>
          <motion.span
            aria-hidden
            style={{
              position: "absolute",
              display: "flex",
              opacity: 0.45,
              x: trail[0],
            }}
          >
            <Icon size={18} strokeWidth={2} />
          </motion.span>
        </>
      )}
      <motion.span
        variants={
          reducedMotion
            ? undefined
            : {
                ...chevronVariants,
                idle: {
                  ...chevronVariants.idle,
                  x: chevronIdleX(side),
                },
                cycling: {
                  ...chevronVariants.cycling,
                  x: chevronIdleX(side).map((v) => v * 1.4),
                },
              }
        }
        animate={reducedMotion ? undefined : state}
        initial={false}
        style={{ display: "flex", position: "relative", zIndex: 1 }}
      >
        <Icon size={22} strokeWidth={2.4} />
      </motion.span>
    </motion.button>
  );
}

function HoldPad({
  label,
  hint,
  dir,
  progress,
  cycling,
  reducedMotion,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onFlipDir,
  leading,
}: {
  label: string;
  hint: string;
  dir: 1 | -1;
  progress: number;
  cycling: boolean;
  reducedMotion?: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerUp: () => void;
  onPointerCancel: () => void;
  onFlipDir: () => void;
  leading?: ReactNode;
}) {
  const state = cycling ? "cycling" : progress > 0 ? "pressed" : "idle";
  const side = dir === -1 ? "left" : "right";
  const Icon = dir === -1 ? ChevronLeft : ChevronRight;
  return (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9,
          color: "#525F7B",
          letterSpacing: "0.16em",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 2px",
        }}
      >
        <span>{label}</span>
        <button
          type="button"
          onClick={onFlipDir}
          className="console-focus"
          aria-label={`Reverse ${label} direction`}
          style={{
            border: "1px solid #252B3A",
            background: "#0A0B0Eaa",
            color: "#F5A00F",
            borderRadius: 6,
            fontSize: 10,
            padding: "2px 8px",
            cursor: "pointer",
            letterSpacing: "0.08em",
          }}
        >
          {dir === 1 ? "FWD ›" : "‹ REV"}
        </button>
      </div>
      <motion.button
        type="button"
        className="console-focus"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onContextMenu={(e) => e.preventDefault()}
        whileTap={reducedMotion ? undefined : { scale: 0.97 }}
        aria-label={`${label}. Tap to step, hold to cycle.`}
        style={{
          position: "relative",
          height: 56,
          borderRadius: 14,
          border: `1px solid ${cycling ? "#F5A00F88" : "#252B3A"}`,
          background:
            "linear-gradient(165deg, #12151Ccc 0%, #0A0B0Eee 55%, #050607f2 100%)",
          boxShadow: cycling
            ? "0 0 20px #F5A00F33, inset 0 1px 0 #ffffff10"
            : "inset 0 2px 8px #000000aa, inset 0 1px 0 #ffffff08",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          cursor: "pointer",
          touchAction: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
          color: "#F5A00F",
          overflow: "hidden",
        }}
      >
        <HoldProgressRing progress={progress} active={cycling} />
        {leading}
        <motion.div
          variants={
            reducedMotion
              ? undefined
              : {
                  ...chevronVariants,
                  idle: {
                    ...chevronVariants.idle,
                    x: chevronIdleX(side),
                  },
                  cycling: {
                    ...chevronVariants.cycling,
                    x: chevronIdleX(side).map((v) => v * 1.5),
                  },
                }
          }
          animate={reducedMotion ? undefined : state}
          style={{ display: "flex", alignItems: "center", gap: 2 }}
        >
          <Icon size={18} strokeWidth={2.2} />
        </motion.div>
        <div style={{ textAlign: "left", minWidth: 0 }}>
          <div
            style={{
              fontFamily: "'Chakra Petch', sans-serif",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.08em",
              color: "#F5A00F",
            }}
          >
            {cycling ? "SCAN…" : "HOLD"}
          </div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              color: "#525F7B",
              letterSpacing: "0.06em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 110,
            }}
          >
            {hint}
          </div>
        </div>
      </motion.button>
    </div>
  );
}

const glass: CSSProperties = {
  background: "linear-gradient(180deg, #11141Bcc 0%, #0A0B0Ef2 70%)",
  backdropFilter: "blur(16px) saturate(1.2)",
  WebkitBackdropFilter: "blur(16px) saturate(1.2)",
  borderColor: "#252B3Aaa",
};

export default function TouchConsole({
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
}: TouchConsoleProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [hint, setHint] = useState(false);
  const activeIndex = Math.max(
    0,
    sections.findIndex((s) => s.id === category),
  );
  const channelIndexRef = useRef(channelIndex);
  const activeIndexRef = useRef(activeIndex);
  channelIndexRef.current = channelIndex;
  activeIndexRef.current = activeIndex;

  const stepChannel = useCallback(
    (dir: 1 | -1) => {
      if (total <= 0) return;
      onChannelSelect((channelIndexRef.current + dir + total) % total);
    },
    [onChannelSelect, total],
  );

  const stepMode = useCallback(
    (dir: 1 | -1) => {
      if (sections.length === 0) return;
      const next =
        (activeIndexRef.current + dir + sections.length) % sections.length;
      onCategoryChange(sections[next].id);
    },
    [onCategoryChange, sections],
  );

  const channelHold = useHoldCycle({ onStep: stepChannel, reducedMotion });
  const modeHold = useHoldCycle({ onStep: stepMode, reducedMotion });

  useEffect(() => {
    if (!pulseGuide || reducedMotion) return;
    setHint(true);
    const t = setTimeout(() => setHint(false), 2400);
    return () => clearTimeout(t);
  }, [pulseGuide, reducedMotion]);

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
      <div aria-hidden="true" className="absolute inset-0 dot-grid pointer-events-none" style={{ zIndex: 0 }} />

      {/* Full-bleed CRT */}
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
        <TiltFrame reducedMotion={reducedMotion}>
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
        </TiltFrame>
      </div>

      {/* Frosted status overlay */}
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
          {sections[activeIndex]?.shortLabel}
        </span>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: "#525F7B",
          }}
        >
          {String(channelIndex + 1).padStart(2, "0")}/
          {String(Math.max(total, 1)).padStart(2, "0")}
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

      {/* Frosted control dock overlay */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 20,
          padding: "10px 12px calc(10px + env(safe-area-inset-bottom, 0px))",
          borderTop: "1px solid #252B3A66",
          ...glass,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <AnimatePresence>
          {hint && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                color: "#F5A00F",
                letterSpacing: "0.1em",
                textAlign: "center",
              }}
            >
              HOLD PADS TO SCAN · TAP TABS TO JUMP
            </motion.div>
          )}
        </AnimatePresence>

        {/* Channel HUD — animated chevrons + title + segments */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            minHeight: 44,
          }}
        >
          <AnimatedChevronButton
            side="left"
            label="Previous channel"
            reducedMotion={reducedMotion}
            state={
              channelHold.cycling && channelHold.dir === -1
                ? "cycling"
                : "idle"
            }
            onStep={() => stepChannel(-1)}
          />
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${category}-${channelIndex}`}
                initial={reducedMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, y: -3 }}
                transition={{ duration: 0.18 }}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: "#F5A00F",
                  letterSpacing: "0.06em",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textAlign: "center",
                }}
              >
                CH {String(channelIndex + 1).padStart(2, "0")}
                {channelTitle ? ` · ${channelTitle}` : ""}
              </motion.div>
            </AnimatePresence>
            <div style={{ display: "flex", gap: 3, justifyContent: "center" }}>
              {Array.from({ length: Math.max(total, 1) }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Channel ${i + 1}`}
                  onClick={() => onChannelSelect(i)}
                  className="console-focus"
                  style={{
                    width: total > 8 ? 8 : 12,
                    height: 6,
                    borderRadius: 2,
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    background: i === channelIndex ? "#F5A00F" : "#252B3A",
                    boxShadow: i === channelIndex ? "0 0 8px #F5A00F88" : "none",
                  }}
                />
              ))}
            </div>
          </div>
          <AnimatedChevronButton
            side="right"
            label="Next channel"
            reducedMotion={reducedMotion}
            state={
              channelHold.cycling && channelHold.dir === 1
                ? "cycling"
                : "idle"
            }
            onStep={() => stepChannel(1)}
          />
        </div>

        {/* Hold pads */}
        <div style={{ display: "flex", gap: 10 }}>
          <HoldPad
            label="CHANNEL"
            hint="entries"
            dir={channelHold.dir}
            progress={channelHold.progress}
            cycling={channelHold.cycling}
            reducedMotion={reducedMotion}
            onPointerDown={channelHold.onPointerDown}
            onPointerUp={channelHold.onPointerUp}
            onPointerCancel={channelHold.onPointerCancel}
            onFlipDir={channelHold.flipDir}
          />
          <HoldPad
            label="MODE"
            hint={sections[activeIndex]?.shortLabel ?? "section"}
            dir={modeHold.dir}
            progress={modeHold.progress}
            cycling={modeHold.cycling}
            reducedMotion={reducedMotion}
            onPointerDown={modeHold.onPointerDown}
            onPointerUp={modeHold.onPointerUp}
            onPointerCancel={modeHold.onPointerCancel}
            onFlipDir={modeHold.flipDir}
          />
        </div>

        {/* Section tabs */}
        <div
          role="tablist"
          aria-label="Sections"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${sections.length}, 1fr)`,
            gap: 6,
            position: "relative",
          }}
        >
          {sections.map((s) => {
            const Icon = s.icon;
            const active = s.id === category;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onCategoryChange(s.id)}
                className="console-focus"
                style={{
                  position: "relative",
                  height: 44,
                  borderRadius: 12,
                  border: `1px solid ${active ? "#F5A00F55" : "#252B3A"}`,
                  background: active ? "#F5A00F14" : "#0A0B0E88",
                  color: active ? "#F5A00F" : "#525F7B",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  zIndex: 1,
                }}
              >
                {active && (
                  <motion.div
                    layoutId="touch-section-pill"
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 12,
                      border: "1px solid #F5A00F66",
                      boxShadow: "0 0 16px #F5A00F33, inset 0 0 12px #F5A00F11",
                      pointerEvents: "none",
                    }}
                    transition={
                      reducedMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 380, damping: 32 }
                    }
                  />
                )}
                <Icon size={15} style={{ position: "relative", zIndex: 1 }} />
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9,
                    letterSpacing: "0.12em",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {s.shortLabel}
                </span>
              </button>
            );
          })}
        </div>

        {stamp}
      </div>

      {/* Profile sheet overlay */}
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
