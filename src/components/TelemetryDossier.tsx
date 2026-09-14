import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import ActionStrip from "@/components/ActionStrip";
import AmberGlitter from "@/components/AmberGlitter";
import type { ContentEntry } from "@/content";

const S = { xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 32 } as const;

type TelemetryDossierProps = {
  entry: ContentEntry;
  category: string;
  channelIndex: number;
  categoryShort?: string;
  flickering: boolean;
  fontSize?: number;
  reducedMotion?: boolean;
  noiseLayer?: ReactNode;
};

function useTypewriter(text: string, speed = 28, startDelay = 0) {
  const [out, setOut] = useState("");
  useEffect(() => {
    setOut("");
    if (speed <= 0) {
      setOut(text);
      return;
    }
    let i = 0;
    let interval: ReturnType<typeof setInterval> | undefined;
    const start = window.setTimeout(() => {
      interval = setInterval(() => {
        i += 1;
        setOut(text.slice(0, i));
        if (i >= text.length && interval) clearInterval(interval);
      }, speed);
    }, startDelay);
    return () => {
      window.clearTimeout(start);
      if (interval) clearInterval(interval);
    };
  }, [text, speed, startDelay]);
  return out;
}

const DECODE_GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@$%&*<>/\\|";

/** Cipher-crack reveal — glyphs churn until each character settles L→R. */
function useDecodeScramble(
  text: string,
  {
    tickMs = 28,
    startDelay = 220,
    charsPerTick = 1.15,
    reducedMotion = false,
  }: {
    tickMs?: number;
    startDelay?: number;
    charsPerTick?: number;
    reducedMotion?: boolean;
  } = {},
) {
  const [out, setOut] = useState(reducedMotion ? text : "");

  useEffect(() => {
    if (reducedMotion || tickMs <= 0) {
      setOut(text);
      return;
    }

    const scramble = (revealCount: number) =>
      text
        .split("")
        .map((ch, i) => {
          if (ch === " " || ch === "\n" || ch === "\t") return ch;
          if (i < revealCount) return ch;
          return DECODE_GLYPHS[(Math.random() * DECODE_GLYPHS.length) | 0];
        })
        .join("");

    setOut(scramble(0));
    let reveal = 0;
    let interval: ReturnType<typeof setInterval> | undefined;
    const start = window.setTimeout(() => {
      interval = setInterval(() => {
        reveal += charsPerTick;
        if (reveal >= text.length) {
          setOut(text);
          if (interval) clearInterval(interval);
          return;
        }
        setOut(scramble(Math.floor(reveal)));
      }, tickMs);
    }, startDelay);

    return () => {
      window.clearTimeout(start);
      if (interval) clearInterval(interval);
    };
  }, [text, tickMs, startDelay, charsPerTick, reducedMotion]);

  return out;
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        color: "#94A3B8",
        letterSpacing: "0.2em",
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

function DossierBlock({
  label,
  children,
  reducedMotion,
  root,
}: {
  label: string;
  children: ReactNode;
  reducedMotion: boolean;
  root: React.RefObject<HTMLElement | null>;
}) {
  return (
    <motion.section
      initial={reducedMotion ? false : { opacity: 0, y: 16 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={
        reducedMotion
          ? undefined
          : { root: root as React.RefObject<Element | null>, amount: 0.2, once: true }
      }
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      style={{ marginBottom: S.xl, position: "relative", zIndex: 1 }}
    >
      <SectionLabel>{label}</SectionLabel>
      {children}
    </motion.section>
  );
}

const screenVariants = {
  enter: { opacity: 0, y: 14, filter: "blur(4px) brightness(2)" },
  center: { opacity: 1, y: 0, filter: "blur(0px) brightness(1)" },
  exit: { opacity: 0, y: -10, filter: "blur(3px) brightness(0.5)" },
};

/** CRT dossier — sticky head + scrollable SUMMARY / IMPACT / DETAIL. */
export default function TelemetryDossier({
  entry,
  category,
  channelIndex,
  categoryShort,
  flickering,
  fontSize = 34,
  reducedMotion = false,
  noiseLayer,
}: TelemetryDossierProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const title = useTypewriter(
    entry.title,
    reducedMotion ? 0 : 28,
    reducedMotion ? 0 : 100,
  );
  const summary = useDecodeScramble(entry.summary, {
    reducedMotion,
    startDelay: reducedMotion ? 0 : 280,
    tickMs: 26,
    charsPerTick: 1.35,
  });
  const titleSize = Math.min(fontSize, entry.title.length > 28 ? fontSize * 0.88 : fontSize);
  const bodySize = Math.max(14, Math.min(17, titleSize * 0.3));
  const showFlicker = flickering && !reducedMotion;

  const { scrollYProgress } = useScroll({
    container: scrollRef,
    layoutEffect: false,
    trackContentSize: true,
  });

  const sheenY = useTransform(scrollYProgress, [0, 1], [0, 18]);
  const gridY = useTransform(scrollYProgress, [0, 1], [0, -10]);
  const endCueOpacity = useTransform(scrollYProgress, [0.82, 1], [0, 1]);

  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = 0;
    });
    return () => cancelAnimationFrame(id);
  }, [category, channelIndex]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const measure = () => {
      setCanScroll(el.scrollHeight > el.clientHeight + 8);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [category, channelIndex, entry]);

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #0A0C12 0%, #080A0F 100%)",
        border: "1px solid #252B3A",
        borderRadius: 12,
        position: "relative",
        boxShadow:
          "inset 0 1px 0 #ffffff0a, inset 0 0 40px #00000055, 0 12px 40px #00000066",
      }}
    >
      <div className="scanline-overlay" style={{ zIndex: 6 }} />
      {noiseLayer}
      {!reducedMotion && (
        <AmberGlitter density={14} showSheen sheenY={sheenY as MotionValue<number>} />
      )}

      {/* Subtle parallax grid */}
      {!reducedMotion && (
        <motion.div
          aria-hidden
          className="dot-grid pointer-events-none"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            opacity: 0.35,
            y: gridY,
          }}
        />
      )}

      <div
        style={{
          borderBottom: "1px solid #252B3A",
          padding: `${S.sm}px ${S.lg}px`,
          background: "#0A0B0E",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: S.sm,
          position: "relative",
          zIndex: 9,
        }}
      >
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#F5A00F",
            boxShadow: "0 0 8px #F5A00F",
            animation: reducedMotion
              ? undefined
              : "pulse-amber 2s ease-in-out infinite",
          }}
        />
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: "#F5A00F",
            letterSpacing: "0.2em",
          }}
        >
          TELEMETRY FEED
        </span>
        <div style={{ flex: 1 }} />
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: "#525F7B",
            letterSpacing: "0.12em",
          }}
        >
          SRC:{categoryShort} · CH:{String(channelIndex + 1).padStart(2, "0")}
        </span>
      </div>

      {/* Scroll progress */}
      <div
        style={{
          height: 2,
          background: "#11141B",
          flexShrink: 0,
          position: "relative",
          zIndex: 9,
          overflow: "hidden",
        }}
      >
        <motion.div
          style={{
            height: "100%",
            width: "100%",
            originX: 0,
            scaleX: scrollYProgress,
            background: "linear-gradient(90deg, #925B03, #F5A00F, #FCD34D)",
            boxShadow: "0 0 8px #F5A00F88",
          }}
        />
      </div>

      <div className="flex-1 relative min-h-0" style={{ zIndex: 7 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${category}-${channelIndex}`}
            variants={reducedMotion ? undefined : screenVariants}
            initial={reducedMotion ? false : "enter"}
            animate={
              showFlicker
                ? {
                    opacity: [0.2, 0.9, 0.4, 1],
                    filter: ["blur(3px)", "blur(0px)"],
                  }
                : reducedMotion
                  ? { opacity: 1 }
                  : "center"
            }
            exit={reducedMotion ? undefined : "exit"}
            transition={{
              duration: reducedMotion ? 0 : 0.32,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="absolute inset-0 flex flex-col"
          >
            {/* Sticky dossier head — CH + title only */}
            <div
              style={{
                flexShrink: 0,
                padding: `${S.md}px ${S.xxl}px ${S.sm}px`,
                background:
                  "linear-gradient(180deg, #0A0C12 70%, #0A0C12ee 100%)",
                borderBottom: "1px solid #252B3A55",
                position: "relative",
                zIndex: 4,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: S.sm,
                  marginBottom: S.sm,
                }}
              >
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    color: "#0A0B0E",
                    background: "#F5A00F",
                    padding: "4px 10px",
                    borderRadius: 3,
                    letterSpacing: "0.18em",
                    fontWeight: 600,
                  }}
                >
                  CH:{String(channelIndex + 1).padStart(2, "0")}
                </div>
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: "linear-gradient(90deg, #F5A00F44, transparent)",
                  }}
                />
              </div>

              <div style={{ position: "relative" }}>
                <h1
                  aria-hidden
                  style={{
                    fontFamily: "'Chakra Petch', sans-serif",
                    fontSize: titleSize,
                    fontWeight: 700,
                    letterSpacing: "0.02em",
                    lineHeight: 1.2,
                    margin: 0,
                    visibility: "hidden",
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                  }}
                >
                  {entry.title}
                </h1>
                <h1
                  style={{
                    fontFamily: "'Chakra Petch', sans-serif",
                    fontSize: titleSize,
                    fontWeight: 700,
                    color: "#F0EAD8",
                    letterSpacing: "0.02em",
                    lineHeight: 1.2,
                    textShadow: "0 0 40px #F5A00F14",
                    margin: 0,
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                  }}
                >
                  {reducedMotion ? entry.title : title}
                  {!reducedMotion && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                      style={{ color: "#F5A00F", marginLeft: 3 }}
                    >
                      {title.length < entry.title.length ? "▊" : ""}
                    </motion.span>
                  )}
                </h1>
              </div>
            </div>

            {/* Scrollable dossier body */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto crt-scroll"
              style={{
                padding: `${S.md}px ${S.xxl}px ${S.xxl}px`,
                position: "relative",
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 13,
                  color: "#94A3B8",
                  letterSpacing: "0.06em",
                  marginBottom: S.sm,
                  lineHeight: 1.45,
                }}
              >
                {entry.meta}
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: S.lg,
                }}
              >
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11,
                      padding: "4px 10px",
                      background: "#11141B",
                      border: "1px solid #F5A00F2A",
                      borderRadius: 4,
                      color: "#C9954A",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <DossierBlock
                label="SUMMARY"
                reducedMotion={reducedMotion}
                root={scrollRef}
              >
                <p
                  aria-label={entry.summary}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: bodySize,
                    color: "#B8B09A",
                    lineHeight: 1.75,
                    letterSpacing: "0.02em",
                    margin: 0,
                  }}
                >
                  {summary}
                </p>
              </DossierBlock>

              <DossierBlock
                label="IMPACT"
                reducedMotion={reducedMotion}
                root={scrollRef}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: S.md,
                  }}
                >
                  {entry.body.map((line, i) => (
                    <motion.div
                      key={`${category}-${channelIndex}-b-${i}`}
                      initial={reducedMotion ? false : { opacity: 0, x: -14 }}
                      whileInView={
                        reducedMotion ? undefined : { opacity: 1, x: 0 }
                      }
                      viewport={
                        reducedMotion
                          ? undefined
                          : {
                              root: scrollRef as React.RefObject<Element | null>,
                              amount: 0.4,
                              once: true,
                            }
                      }
                      transition={{
                        delay: reducedMotion ? 0 : i * 0.05,
                        duration: 0.3,
                      }}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: S.md,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 11,
                          color: "#F5A00F",
                          opacity: 0.55,
                          flexShrink: 0,
                          marginTop: 3,
                          letterSpacing: "0.1em",
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}›
                      </span>
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: bodySize,
                          color: "#B8B09A",
                          lineHeight: 1.7,
                          letterSpacing: "0.02em",
                        }}
                      >
                        {line}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </DossierBlock>

              {entry.detail && entry.detail.length > 0 && (
                <DossierBlock
                  label="DETAIL / ARCH"
                  reducedMotion={reducedMotion}
                  root={scrollRef}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: S.sm,
                      padding: S.md,
                      borderRadius: 10,
                      background: "#11141B88",
                      border: "1px solid #252B3A",
                      boxShadow: "inset 0 2px 10px #00000088",
                    }}
                  >
                    {entry.detail.map((line, i) => (
                      <motion.div
                        key={`${category}-${channelIndex}-d-${i}`}
                        initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                        whileInView={
                          reducedMotion ? undefined : { opacity: 1, y: 0 }
                        }
                        viewport={
                          reducedMotion
                            ? undefined
                            : {
                                root: scrollRef as React.RefObject<
                                  Element | null
                                >,
                                amount: 0.35,
                                once: true,
                              }
                        }
                        transition={{
                          delay: reducedMotion ? 0 : i * 0.04,
                          duration: 0.28,
                        }}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 10,
                        }}
                      >
                        <span
                          style={{
                            color: "#925B03",
                            flexShrink: 0,
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 12,
                            marginTop: 2,
                          }}
                        >
                          ▸
                        </span>
                        <span
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: Math.max(13, bodySize - 1),
                            color: "#94A3B8",
                            lineHeight: 1.65,
                            letterSpacing: "0.02em",
                          }}
                        >
                          {line}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </DossierBlock>
              )}

              {canScroll && (
                <motion.div
                  aria-hidden
                  style={{
                    opacity: reducedMotion ? 1 : endCueOpacity,
                    marginTop: S.md,
                    marginBottom: S.sm,
                    paddingTop: S.md,
                    borderTop: "1px solid #252B3A55",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    color: "#525F7B",
                    letterSpacing: "0.16em",
                    textAlign: "center",
                  }}
                >
                  END OF TRANSMISSION · RESUME BELOW
                </motion.div>
              )}

              <ActionStrip links={entry.links} reducedMotion={reducedMotion} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
