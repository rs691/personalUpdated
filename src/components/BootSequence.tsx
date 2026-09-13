import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const BOOT_LINES = [
  "RS-691 CONSOLE · INIT",
  "LOADING TELEMETRY BUFFERS…",
  "TUNER DECK ONLINE",
  "PROFILE LINKED · READY",
];

type BootSequenceProps = {
  reducedMotion?: boolean;
  onDone: () => void;
};

export default function BootSequence({ reducedMotion = false, onDone }: BootSequenceProps) {
  const [line, setLine] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (reducedMotion) {
      onDone();
      setVisible(false);
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      if (i >= BOOT_LINES.length) {
        clearInterval(id);
        setTimeout(() => {
          setVisible(false);
          onDone();
        }, 420);
      } else {
        setLine(i);
      }
    }, 380);
    return () => clearInterval(id);
  }, [reducedMotion, onDone]);

  return (
    <AnimatePresence>
      {visible && !reducedMotion && (
        <motion.div
          key="boot"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "#0A0B0E",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <div style={{ width: "min(420px, 86vw)" }}>
            <div
              style={{
                fontFamily: "'Chakra Petch', sans-serif",
                fontSize: 22,
                fontWeight: 700,
                color: "#F5A00F",
                letterSpacing: "0.2em",
                marginBottom: 20,
                textShadow: "0 0 24px #F5A00F55",
              }}
            >
              RS-691
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {BOOT_LINES.slice(0, line + 1).map((text, idx) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: idx === line ? 1 : 0.45, x: 0 }}
                  style={{
                    fontSize: 12,
                    color: idx === line ? "#F5A00F" : "#525F7B",
                    letterSpacing: "0.08em",
                  }}
                >
                  <span style={{ opacity: 0.5 }}>{">"} </span>
                  {text}
                  {idx === line && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      style={{ marginLeft: 4 }}
                    >
                      ▊
                    </motion.span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
