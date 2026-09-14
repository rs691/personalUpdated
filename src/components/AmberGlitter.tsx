import { motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { useChassisTilt } from "@/components/PerspectiveChassis";

/** Sparse amber particulate glitter — contest polish without clutter. */
export default function AmberGlitter({
  density = 18,
  showSheen = false,
  sheenY,
}: {
  density?: number;
  /** CRT light sweep — tilt-linked when inside PerspectiveChassis */
  showSheen?: boolean;
  /** Optional scroll-linked vertical offset for the sheen (few px). */
  sheenY?: MotionValue<number>;
}) {
  const tilt = useChassisTilt();
  const fallbackX = useMotionValue(0);
  const fallbackY = useMotionValue(0);

  const rotateX = tilt?.rotateX ?? fallbackX;
  const rotateY = tilt?.rotateY ?? fallbackY;
  const restX = tilt?.restX ?? 0;
  const maxY = tilt?.maxY ?? 1.5;
  const maxXDelta = tilt?.maxXDelta ?? 0.9;

  const dots = Array.from({ length: density }, (_, i) => {
    const left = ((i * 37) % 100) + (i % 3);
    const top = ((i * 53) % 100) + (i % 5);
    const delay = (i * 0.37) % 4;
    const dur = 3.5 + (i % 5) * 0.55;
    const size = 1 + (i % 3);
    return { left, top, delay, dur, size, key: i };
  });

  const tiltAmount = useTransform([rotateX, rotateY], ([x, y]) => {
    const dx = Math.abs(x - restX) / maxXDelta;
    const dy = Math.abs(y) / maxY;
    return Math.min(1, Math.sqrt(dx * dx + dy * dy));
  });

  const sheenOpacity = useTransform(
    tiltAmount,
    [0, 0.12, 0.55, 1],
    [0, 0.12, 0.28, 0.38],
  );
  const sheenX = useTransform(rotateY, [-maxY, maxY], [-48, 48]);

  return (
    <div
      aria-hidden
      className="amber-glitter"
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 3,
        borderRadius: "inherit",
      }}
    >
      {dots.map((d) => (
        <span
          key={d.key}
          style={{
            position: "absolute",
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            borderRadius: "50%",
            background: "#F5A00F",
            boxShadow: "0 0 6px #F5A00F88",
            animation: `amber-float ${d.dur}s ease-in-out ${d.delay}s infinite`,
            opacity: 0.35,
          }}
        />
      ))}
      {showSheen && tilt && (
        <motion.div
          className="crt-sheen crt-sheen--tilt"
          style={{
            x: sheenX,
            y: sheenY,
            opacity: sheenOpacity,
            rotate: 8,
          }}
        />
      )}
      {showSheen && !tilt && <div className="crt-sheen" />}
    </div>
  );
}
