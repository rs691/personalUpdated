import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const BOOT_LINES = [
  "RS-691 CONSOLE · INIT",
  "LOADING TELEMETRY BUFFERS…",
  "TUNER DECK ONLINE",
  "PROFILE LINKED · READY",
];

const BOOT_STORAGE_KEY = "rs691-booted";
const LINE_INTERVAL_MS = 340;
const HOLD_AFTER_LAST_MS = 360;

type BootSequenceProps = {
  reducedMotion?: boolean;
  onDone: () => void;
};

function hasBootedBefore(): boolean {
  try {
    return sessionStorage.getItem(BOOT_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function markBooted() {
  try {
    sessionStorage.setItem(BOOT_STORAGE_KEY, "1");
  } catch {
    /* private mode */
  }
}

export default function BootSequence({ reducedMotion = false, onDone }: BootSequenceProps) {
  const skipBoot = reducedMotion || hasBootedBefore();
  const [line, setLine] = useState(0);
  const [visible, setVisible] = useState(!skipBoot);
  const [centerCopy, setCenterCopy] = useState(
    () => (typeof window !== "undefined" ? window.innerWidth < 1024 : true),
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => setCenterCopy(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (skipBoot) {
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
          markBooted();
          onDone();
        }, HOLD_AFTER_LAST_MS);
      } else {
        setLine(i);
      }
    }, LINE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [skipBoot, onDone]);

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
          <div
            style={{
              width: "min(420px, 86vw)",
              textAlign: centerCopy ? "center" : "left",
            }}
          >
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
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                alignItems: centerCopy ? "center" : "stretch",
              }}
            >
              {BOOT_LINES.slice(0, line + 1).map((text, idx) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, x: centerCopy ? 0 : -10, y: centerCopy ? 8 : 0, filter: "blur(4px)" }}
                  animate={{
                    opacity: idx === line ? 1 : 0.35,
                    x: 0,
                    y: 0,
                    filter: "blur(0px)",
                  }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    fontSize: 12,
                    color: idx === line ? "#F5A00F" : "#525F7B",
                    letterSpacing: "0.08em",
                  }}
                >
                  <span style={{ opacity: 0.4 }}>{">"} </span>
                  {text}
                  {idx === line && (
                    <span className="boot-cursor" style={{ marginLeft: 4 }}>▊</span>
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
