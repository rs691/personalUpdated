/** Sparse amber particulate glitter — contest polish without clutter. */
export default function AmberGlitter({
  density = 18,
  showSheen = false,
}: {
  density?: number;
  /** CRT light sweep — only enable on the center telemetry screen */
  showSheen?: boolean;
}) {
  const dots = Array.from({ length: density }, (_, i) => {
    const left = ((i * 37) % 100) + (i % 3);
    const top = ((i * 53) % 100) + (i % 5);
    const delay = (i * 0.37) % 4;
    const dur = 3.5 + (i % 5) * 0.55;
    const size = 1 + (i % 3);
    return { left, top, delay, dur, size, key: i };
  });

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
            background: "#F59E0B",
            boxShadow: "0 0 6px #F59E0B88",
            animation: `amber-float ${d.dur}s ease-in-out ${d.delay}s infinite`,
            opacity: 0.35,
          }}
        />
      ))}
      {showSheen && <div className="crt-sheen" />}
    </div>
  );
}
