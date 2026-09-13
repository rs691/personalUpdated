import { useRef, type ReactNode } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";

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
        left: "10%",
        right: "10%",
        bottom: 8,
        height: 44,
        borderRadius: "50%",
        background:
          "radial-gradient(ellipse at center, #000000dd 0%, #00000088 35%, transparent 72%)",
        filter: "blur(10px)",
        zIndex: 0,
        pointerEvents: "none",
        x,
        y,
        opacity: 0.9,
      }}
    />
  );
}

/** Carved pocket for profile / CRT / tuner panels. */
export function RecessedWell({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        padding: 5,
        borderRadius: 16,
        background: "linear-gradient(165deg, #050607 0%, #0C0E14 55%, #08090E 100%)",
        boxShadow:
          "inset 0 5px 14px #000000dd, inset 0 1px 0 #ffffff0a, inset 0 -1px 0 #1C1F2744, 0 1px 0 #1A1D24",
        minHeight: 0,
        ...style,
      }}
    >
      <div
        style={{
          height: "100%",
          minHeight: 0,
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 0 0 1px #1C1F27",
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

/** Desktop deck with slight perspective + pointer tilt. */
export default function PerspectiveChassis({
  children,
  reducedMotion = false,
  className,
  style,
}: PerspectiveChassisProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const restX = 2.5;
  const maxY = 3;
  const maxXDelta = 2;
  const rotateX = useMotionValue(reducedMotion ? 0 : restX);
  const rotateY = useMotionValue(0);

  // Contact shadow slides opposite the card tilt (clamped range)
  const shadowX = useTransform(rotateY, [-maxY, maxY], [14, -14]);
  const shadowY = useTransform(
    rotateX,
    [restX - maxXDelta, restX + maxXDelta],
    [10, -2],
  );

  const onMove = (e: React.MouseEvent) => {
    if (reducedMotion || !shellRef.current) return;
    // Measure the untransformed shell so tilt never feeds back into the hit rect
    const rect = shellRef.current.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    const px = Math.max(
      -0.5,
      Math.min(0.5, (e.clientX - rect.left) / rect.width - 0.5),
    );
    const py = Math.max(
      -0.5,
      Math.min(0.5, (e.clientY - rect.top) / rect.height - 0.5),
    );
    const nextY = Math.max(-maxY, Math.min(maxY, px * (maxY * 2)));
    const nextX = Math.max(
      restX - maxXDelta,
      Math.min(restX + maxXDelta, restX - py * (maxXDelta * 2)),
    );
    rotateY.set(nextY);
    rotateX.set(nextX);
  };

  const onLeave = () => {
    if (reducedMotion) return;
    animate(rotateX, restX, { type: "spring", stiffness: 120, damping: 18 });
    animate(rotateY, 0, { type: "spring", stiffness: 120, damping: 18 });
  };

  return (
    <div
      ref={shellRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        perspective: 1800,
        perspectiveOrigin: "50% 45%",
        padding: "36px 28px 56px",
        position: "relative",
        // Contrasting stage — lighter titanium recess the card sits in
        background:
          "radial-gradient(ellipse 80% 70% at 50% 42%, #1A1F2A 0%, #12161E 45%, #0A0C10 100%)",
        borderRadius: 48,
        boxShadow:
          "inset 0 1px 0 #3A425544, inset 0 -20px 40px #00000088, inset 0 0 0 1px #0E1016",
      }}
    >
      {/* Stage floor vignette for extra separation from page */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 12,
          borderRadius: 40,
          background:
            "radial-gradient(ellipse at 50% 100%, #00000066 0%, transparent 55%)",
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
            left: "10%",
            right: "10%",
            bottom: 8,
            height: 44,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at center, #000000dd 0%, transparent 72%)",
            filter: "blur(10px)",
            zIndex: 0,
            pointerEvents: "none",
            opacity: 0.75,
          }}
        />
      )}

      <motion.div
        className={className}
        style={{
          rotateX,
          rotateY,
          // Micro lift so perspective separates face from stage at rest
          z: reducedMotion ? 0 : 8,
          transformStyle: "preserve-3d",
          transformOrigin: "center center",
          position: "relative",
          zIndex: 1,
          ...style,
        }}
      >
        {/* Extruded outer bezel lip — sharper luminance rim */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: -11,
            borderRadius: 42,
            background:
              "linear-gradient(155deg, #3A4250 0%, #1C212C 22%, #12151C 55%, #06080B 100%)",
            boxShadow: `
              0 20px 0 #040506,
              0 26px 48px #000000bb,
              inset 0 1px 0 #6A738844,
              inset 0 -2px 0 #000000aa,
              inset 1px 0 0 #2A303A44,
              inset -1px 0 0 #00000066
            `,
            zIndex: -1,
            transform: "translateZ(-14px)",
          }}
        />
        {/* Thin bright ring peeking around the face */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: -2,
            borderRadius: 34,
            pointerEvents: "none",
            boxShadow:
              "0 0 0 1px #4A556644, inset 0 1px 0 #ffffff14, 0 1px 0 #00000088",
            zIndex: 2,
          }}
        />
        {children}
      </motion.div>
    </div>
  );
}
