import { useRef, type ReactNode } from "react";
import { animate, motion, useMotionValue } from "framer-motion";

/** Soft floor contact shadow under the deck. */
export function ChassisShadow() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: "8%",
        right: "8%",
        bottom: -28,
        height: 36,
        borderRadius: "50%",
        background: "radial-gradient(ellipse at center, #000000cc 0%, transparent 70%)",
        filter: "blur(8px)",
        zIndex: 0,
        pointerEvents: "none",
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
        padding: "28px 20px 48px",
        position: "relative",
      }}
    >
      <ChassisShadow />
      <motion.div
        className={className}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          transformOrigin: "center center",
          position: "relative",
          zIndex: 1,
          ...style,
        }}
      >
        {/* Extruded outer bezel lip */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: -10,
            borderRadius: 40,
            background:
              "linear-gradient(160deg, #1C1F27 0%, #0E1015 40%, #08090C 100%)",
            boxShadow:
              "0 18px 0 #050607, 0 22px 40px #000000aa, inset 0 1px 0 #3A3F5044",
            zIndex: -1,
            transform: "translateZ(-12px)",
          }}
        />
        {children}
      </motion.div>
    </div>
  );
}
