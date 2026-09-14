/** Laser-etched fab plate — looks stamped into the chassis lip. */
export default function FabricationStamp({ compact = false }: { compact?: boolean }) {
  return (
    <div
      aria-label="Fabricated by Robert Stewart"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: compact ? 10 : 14,
        paddingTop: compact ? 8 : 10,
        paddingBottom: compact ? 2 : 4,
        userSelect: "none",
        pointerEvents: "none",
      }}
    >
      <span
        aria-hidden
        style={{
          flex: 1,
          maxWidth: compact ? 48 : 72,
          height: 1,
          background:
            "linear-gradient(90deg, transparent, #252B3A 30%, #525F7B44 100%)",
          boxShadow: "0 1px 0 #00000066",
        }}
      />
      <div
        style={{
          position: "relative",
          padding: compact ? "3px 10px" : "4px 14px",
          borderRadius: 2,
          // Recessed engraving well
          background:
            "linear-gradient(180deg, #0A0B0E 0%, #11141B 55%, #0E1016 100%)",
          boxShadow:
            "inset 0 2px 4px #000000cc, inset 0 -1px 0 #252B3A88, 0 1px 0 #525F7B14",
          border: "1px solid #1A1D24",
        }}
      >
        <span
          style={{
            display: "block",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: compact ? 8 : 9,
            fontWeight: 600,
            letterSpacing: compact ? "0.18em" : "0.26em",
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            // Laser-etched: warm muted phosphor fill + faint raised edge
            color: "#6B5A3A",
            textShadow:
              "0 1px 0 rgba(252, 211, 77, 0.12), 0 -1px 0 rgba(0, 0, 0, 0.85), 0 0 10px rgba(245, 160, 15, 0.08)",
          }}
        >
          FABRICATED BY ROBERT STEWART · RS-691
        </span>
      </div>
      <span
        aria-hidden
        style={{
          flex: 1,
          maxWidth: compact ? 48 : 72,
          height: 1,
          background:
            "linear-gradient(90deg, #525F7B44 0%, #252B3A 70%, transparent)",
          boxShadow: "0 1px 0 #00000066",
        }}
      />
    </div>
  );
}
