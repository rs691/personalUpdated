import { createContext, useContext, useRef, type ReactNode } from "react";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "framer-motion";

export type ChassisTiltValue = {
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  restX: number;
  maxY: number;
  maxXDelta: number;
};

const ChassisTiltContext = createContext<ChassisTiltValue | null>(null);

/** Pointer tilt motion values from the desktop deck (null outside PerspectiveChassis). */
export function useChassisTilt() {
  return useContext(ChassisTiltContext);
}

/** Soft floor contact shadow under the deck — shifts opposite tilt. */
function ChassisShadow({
  x,
  y,
}: {
  x: ReturnType<typeof useMotionValue<number>>;
  y: ReturnType<typeof useMotionValue<number>>;
}) {
  return (
    <motion.div
      aria-hidden
      style={{
        position: "absolute",
        left: "6%",
        right: "6%",
        bottom: 4,
        height: 56,
        borderRadius: "50%",
        background:
          "radial-gradient(ellipse at center, #000000ee 0%, #00000099 32%, #00000044 58%, transparent 78%)",
        filter: "blur(12px)",
        zIndex: 0,
        pointerEvents: "none",
        x,
        y,
        opacity: 0.95,
      }}
    />
  );
}

/** Carved pocket for profile / CRT / tuner panels. */
export function RecessedWell({
  children,
  className,
  style,
  overflow = "hidden",
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Use "auto" when tall controls (e.g. tuner) must remain reachable. */
  overflow?: "hidden" | "auto";
}) {
  return (
    <div
      className={className}
      style={{
        padding: 5,
        borderRadius: 16,
        background: "linear-gradient(165deg, #050607 0%, #11141B 55%, #0A0B0E 100%)",
        boxShadow:
          "inset 0 5px 14px #000000dd, inset 0 1px 0 #ffffff0a, inset 0 -1px 0 #252B3A44, 0 1px 0 #252B3A",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      <div
        style={{
          flex: 1,
          height: "100%",
          minHeight: 0,
          borderRadius: 12,
          overflow,
          boxShadow: "0 0 0 1px #252B3A",
        }}
      >
        {children}
      </div>
    </div>
  );
}

type PerspectiveChassisProps = {
  children: ReactNode;
  reducedMotion?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/** Desktop deck — tiny pointer tilt for depth only (never flips). */
export default function PerspectiveChassis({
  children,
  reducedMotion = false,
  className,
  style,
}: PerspectiveChassisProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const restX = 1.6;
  const maxY = 2.0;
  const maxXDelta = 1.2;
  const liftZ = 8;

  const rotateX = useMotionValue(reducedMotion ? 0 : restX);
  const rotateY = useMotionValue(0);
  const animRef = useRef<{ stop: () => void }[]>([]);

  const stopAnims = () => {
    animRef.current.forEach((a) => a.stop());
    animRef.current = [];
  };

  // Contact shadow slides opposite the card tilt (small travel)
  const shadowX = useTransform(rotateY, [-maxY, maxY], [12, -12]);
  const shadowY = useTransform(
    rotateX,
    [restX - maxXDelta, restX + maxXDelta],
    [8, -2],
  );

  // Single transform string with explicit deg — no unit ambiguity / spring overshoot past caps
  const transform = useMotionTemplate`translateZ(${liftZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

  const onMove = (e: React.MouseEvent) => {
    if (reducedMotion || !shellRef.current) return;
    stopAnims();
    const rect = shellRef.current.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;

    const px = clamp((e.clientX - rect.left) / rect.width - 0.5, -0.5, 0.5);
    const py = clamp((e.clientY - rect.top) / rect.height - 0.5, -0.5, 0.5);

    rotateY.set(clamp(px * (maxY * 2), -maxY, maxY));
    rotateX.set(clamp(restX - py * (maxXDelta * 2), restX - maxXDelta, restX + maxXDelta));
  };

  const onLeave = () => {
    if (reducedMotion) return;
    stopAnims();
    animRef.current = [
      animate(rotateX, restX, { type: "spring", stiffness: 120, damping: 18, mass: 0.8 }),
      animate(rotateY, 0, { type: "spring", stiffness: 120, damping: 18, mass: 0.8 }),
    ];
  };

  return (
    <div
      ref={shellRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        perspective: 2400,
        perspectiveOrigin: "50% 42%",
        padding: "40px 32px 64px",
        position: "relative",
        // Desk / tray — cooler mid-tones so contact shadow + deck face separate
        background: `
          radial-gradient(ellipse 70% 55% at 50% 40%, #252B3A 0%, transparent 58%),
          linear-gradient(165deg, #1A2030 0%, #11141B 42%, #0C0F16 78%, #0A0B0E 100%)
        `,
        borderRadius: 52,
        boxShadow: `
          inset 0 1px 0 #525F7B44,
          inset 0 -28px 48px #00000099,
          inset 0 0 0 1px #0E1218,
          0 1px 0 #252B3A44
        `,
      }}
    >
      {/* Surface grain / tray lip */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 10,
          borderRadius: 44,
          background:
            "linear-gradient(180deg, #ffffff08 0%, transparent 18%, transparent 70%, #00000055 100%)",
          boxShadow: "inset 0 0 0 1px #252B3A66",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 12,
          borderRadius: 40,
          background:
            "radial-gradient(ellipse at 50% 100%, #00000088 0%, transparent 50%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {!reducedMotion && <ChassisShadow x={shadowX} y={shadowY} />}
      {reducedMotion && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: "6%",
            right: "6%",
            bottom: 4,
            height: 56,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at center, #000000ee 0%, transparent 72%)",
            filter: "blur(12px)",
            zIndex: 0,
            pointerEvents: "none",
            opacity: 0.85,
          }}
        />
      )}

      <ChassisTiltContext.Provider
        value={
          reducedMotion
            ? null
            : { rotateX, rotateY, restX, maxY, maxXDelta }
        }
      >
      <motion.div
        className={className}
        style={{
          ...style,
          // Transform last so parent style never overrides tilt
          transform: reducedMotion ? undefined : transform,
          transformStyle: "preserve-3d",
          transformOrigin: "center center",
          position: "relative",
          zIndex: 1,
          willChange: reducedMotion ? undefined : "transform",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: -11,
            borderRadius: 42,
            background:
              "linear-gradient(155deg, #525F7B 0%, #252B3A 22%, #11141B 55%, #0A0B0E 100%)",
            boxShadow: `
              0 20px 0 #040506,
              0 26px 48px #000000bb,
              inset 0 1px 0 #94A3B844,
              inset 0 -2px 0 #000000aa,
              inset 1px 0 0 #252B3A44,
              inset -1px 0 0 #00000066
            `,
            zIndex: -1,
            transform: "translateZ(-14px)",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: -2,
            borderRadius: 34,
            pointerEvents: "none",
            boxShadow:
              "0 0 0 1px #525F7B44, inset 0 1px 0 #ffffff14, 0 1px 0 #00000088",
            zIndex: 2,
          }}
        />
        {children}
      </motion.div>
      </ChassisTiltContext.Provider>
    </div>
  );
}
