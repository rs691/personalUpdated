import { useState, useEffect, useRef, useCallback, type ElementType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderGit2, Cpu, Terminal, GraduationCap,
  GitBranch, Link, Globe, Mail, Phone, MapPin, User,
} from "lucide-react";
import RotaryDial from "@/components/RotaryDial";
import TickChannelNumber from "@/components/TickChannelNumber";
import ChannelGauge from "@/components/ChannelGauge";
import BootSequence from "@/components/BootSequence";
import AmberGlitter from "@/components/AmberGlitter";
import SectionModeDial from "@/components/SectionModeDial";
import PerspectiveChassis, { RecessedWell } from "@/components/PerspectiveChassis";
import TelemetryDossier from "@/components/TelemetryDossier";
import FabricationStamp from "@/components/FabricationStamp";
import TouchConsole from "@/components/TouchConsole";
import TouchKeycapDial from "@/components/TouchKeycapDial";
import { CONTENT } from "@/content";

/**
 * Mobile/tablet shell switcher — flip to try layouts without losing others.
 * - "keycap-dial" → 4 section keycaps + channel dial + LED lamps (current)
 * - "hold-dock"   → frosted dock with hold pads + animated chevrons
 * - "off"         → legacy stacked tuner / mode dial
 */
const TOUCH_SHELL: "keycap-dial" | "hold-dock" | "off" = "keycap-dial";

/** Consistent spacing rhythm (px) */
const S = { xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 32 } as const;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

// ─── Responsive hook ──────────────────────────────────────────────────────────

function useBreakpoint() {
  const [w, setW] = useState(() => (typeof window !== "undefined" ? window.innerWidth : 1200));
  useEffect(() => {
    const handler = () => setW(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return { isMobile: w < 640, isTablet: w >= 640 && w < 1024, isDesktop: w >= 1024, width: w };
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "projects",   label: "PROJECTS",   shortLabel: "PRJ", icon: FolderGit2,    detail: "Shipped platforms, APIs, and production builds" },
  { id: "experience", label: "EXPERIENCE", shortLabel: "EXP", icon: Cpu,           detail: "Roles, impact, and systems owned" },
  { id: "skills",     label: "SKILLS",     shortLabel: "SKL", icon: Terminal,      detail: "Stack, cloud, and engineering craft" },
  { id: "education",  label: "EDUCATION",  shortLabel: "EDU", icon: GraduationCap, detail: "Degrees, coursework, and foundations" },
];


const STACK_BADGES = ["Flutter", "Node.js", "Express", "AWS ECS", "Gemini API", "MySQL", "Redis", "Next.js"];

const PROFILE_LINKS: { Icon: ElementType; text: string; href?: string }[] = [
  { Icon: MapPin, text: "Council Bluffs, IA" },
  { Icon: Phone, text: "402-595-0211", href: "tel:4025950211" },
  { Icon: Mail, text: "rms.dev@outlook.com", href: "mailto:rms.dev@outlook.com" },
  { Icon: GitBranch, text: "github.com/rs691", href: "https://github.com/rs691" },
  { Icon: Link, text: "linkedin/robert-stewart-m", href: "https://www.linkedin.com/in/robert-stewart-m" },
  { Icon: Globe, text: "robert-stewart.dev", href: "https://robert-stewart.dev" },
];

function parseHash(): { category: string; channel: number } | null {
  const raw = window.location.hash.replace(/^#/, "");
  if (!raw) return null;
  const [cat, ch] = raw.split("/");
  if (!CATEGORIES.some((c) => c.id === cat)) return null;
  const channel = Math.max(0, (parseInt(ch || "1", 10) || 1) - 1);
  return { category: cat, channel };
}

function writeHash(category: string, channelIndex: number) {
  const next = `#${category}/${channelIndex + 1}`;
  if (window.location.hash !== next) {
    window.history.replaceState(null, "", next);
  }
}

// ─── Noise Layer ──────────────────────────────────────────────────────────────

let _noiseUrl: string | null = null;
function getNoiseTextureUrl(): string {
  if (_noiseUrl) return _noiseUrl;
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = (Math.random() * 255) | 0;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  _noiseUrl = canvas.toDataURL("image/png");
  return _noiseUrl;
}

function NoiseLayer({ opacity = 0.045 }: { opacity?: number }) {
  const url = typeof document !== "undefined" ? getNoiseTextureUrl() : null;
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none noise-drift"
      style={{
        opacity,
        mixBlendMode: "screen",
        zIndex: 8,
        borderRadius: "inherit",
        backgroundImage: url ? `url(${url})` : undefined,
        backgroundRepeat: "repeat",
        backgroundSize: "256px 256px",
      }}
    />
  );
}

// ─── Live Clock ───────────────────────────────────────────────────────────────

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#F5A00F", letterSpacing: "0.12em" }}>
      {pad(time.getHours())}:{pad(time.getMinutes())}:{pad(time.getSeconds())}
    </span>
  );
}

// ─── Status Bar ───────────────────────────────────────────────────────────────

function StatusBar({ category, channelIndex, total, compact = false }: { category: string; channelIndex: number; total: number; compact?: boolean }) {
  const cat = CATEGORIES.find(c => c.id === category);
  return (
    <div
      className="flex items-center gap-4 shrink-0"
      style={{
        height: compact ? 34 : 38,
        // Clear corner fasteners on desktop (non-compact)
        padding: `0 ${compact ? 14 : 44}px`,
        borderBottom: "1px solid #252B3A",
        background: "linear-gradient(90deg, #11141B 0%, #0A0B0E 100%)",
        position: "relative",
        zIndex: 10,
      }}
    >
      <div style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: compact ? 9 : 10, fontWeight: 700, color: "#2A2D38", letterSpacing: "0.3em" }}>
        RS-691
      </div>
      <div style={{ width: 1, height: 12, background: "#252B3A" }} />
      <div className="flex items-center gap-2">
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#F5A00F", boxShadow: "0 0 6px #F5A00F", flexShrink: 0 }} />
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: compact ? 9 : 10, color: "#F5A00F", letterSpacing: "0.18em", whiteSpace: "nowrap" }}>
          {compact ? cat?.shortLabel : cat?.label}
        </span>
      </div>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: compact ? 9 : 10, color: "#6B7A96", letterSpacing: "0.12em" }}>
        {String(channelIndex + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
      </span>
      <div style={{ flex: 1 }} />
      <div className="flex items-end gap-0.5">
        {[3, 5, 7, 9, 11].map((h, i) => (
          <div key={i} style={{ width: 3, height: h, borderRadius: 1, background: i < 4 ? "#F5A00F" : "#252B3A", opacity: i < 4 ? 0.8 : 1 }} />
        ))}
      </div>
      <div style={{ width: 1, height: 12, background: "#252B3A" }} />
      <LiveClock />
    </div>
  );
}

// ─── Corner Fastener ──────────────────────────────────────────────────────────

function Fastener({ rotation }: { rotation: number }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" fill="#11141B" stroke="#252B3A" strokeWidth="1" />
      <circle cx="10" cy="10" r="5.5" fill="#252B3A" stroke="#525F7B" strokeWidth="0.5" />
      <g transform={`rotate(${rotation} 10 10)`}>
        <line x1="10" y1="4.5" x2="10" y2="15.5" stroke="#525F7B" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="4.5" y1="10" x2="15.5" y2="10" stroke="#525F7B" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <circle cx="10" cy="10" r="1.8" fill="#252B3A" />
    </svg>
  );
}

// ─── Circuit Traces ────────────────────────────────────────────────────────────

function CircuitTraces() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1200 720" preserveAspectRatio="none" style={{ zIndex: 1 }}>
      <path d="M 220 160 L 380 160 L 400 180 L 800 180 L 820 160 L 980 160" stroke="#F5A00F" strokeWidth="0.7" fill="none" opacity="0.12" strokeDasharray="6 5" />
      <path d="M 220 560 L 360 560 L 380 540 L 820 540 L 840 560 L 980 560" stroke="#F5A00F" strokeWidth="0.7" fill="none" opacity="0.08" strokeDasharray="8 6" />
      {[{ cx: 980, cy: 160, dur: "2.1s" }, { cx: 980, cy: 560, dur: "3.4s" }, { cx: 220, cy: 160, dur: "1.7s" }, { cx: 220, cy: 560, dur: "2.8s" }].map(({ cx, cy, dur }, i) => (
        <circle key={i} cx={cx} cy={cy} r="2.5" fill="#F5A00F" opacity="0.5">
          <animate attributeName="opacity" values="0.5;0.1;0.5" dur={dur} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
}

// ─── Channel Tuner ────────────────────────────────────────────────────────────

function ChannelTuner({
  channelIndex,
  total,
  onSelect,
  horizontal = false,
  reducedMotion = false,
}: {
  channelIndex: number;
  total: number;
  onSelect: (index: number) => void;
  horizontal?: boolean;
  reducedMotion?: boolean;
}) {
  const onStep = (direction: 1 | -1) => {
    onSelect((channelIndex + direction + total) % total);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: horizontal ? "row" : "column",
        alignItems: "center",
        justifyContent: "center",
        gap: horizontal ? 14 : 12,
        flexWrap: horizontal ? "wrap" : "nowrap",
        width: "100%",
      }}
    >
      <TickChannelNumber
        value={channelIndex + 1}
        total={total}
        scale={horizontal ? 0.95 : 1}
      />
      <RotaryDial
        channelIndex={channelIndex}
        total={total}
        onStep={onStep}
        onSelect={onSelect}
        size={horizontal ? 110 : 120}
      />
      <ChannelGauge
        channelIndex={channelIndex}
        total={total}
        onStep={onStep}
        onSelect={onSelect}
        compact={horizontal}
        reducedMotion={reducedMotion}
      />
    </div>
  );
}

// ─── Section mode dial (replaces bottom keycaps) ──────────────────────────────

function SectionSelect({
  category,
  channelIndex,
  channelTotal,
  onCategoryChange,
  compact = false,
  pulseGuide = false,
  reducedMotion = false,
}: {
  category: string;
  channelIndex: number;
  channelTotal: number;
  onCategoryChange: (id: string) => void;
  compact?: boolean;
  pulseGuide?: boolean;
  reducedMotion?: boolean;
}) {
  const channels = CONTENT[category] || [];
  const channelTitle = channels[channelIndex]?.title ?? channels[0]?.title;

  return (
    <SectionModeDial
      sections={CATEGORIES}
      activeId={category}
      channelIndex={channelIndex}
      channelTotal={channelTotal}
      channelTitle={channelTitle}
      onChange={onCategoryChange}
      compact={compact}
      pulseGuide={pulseGuide}
      reducedMotion={reducedMotion}
    />
  );
}

// ─── Profile Panel ────────────────────────────────────────────────────────────

function ProfilePanel({ compact = false }: { compact?: boolean }) {
  return (
    <div className="h-full flex flex-col overflow-hidden" style={{
      background: "linear-gradient(180deg, #0C0F14 0%, #090B10 100%)",
      border: "1px solid #252B3A", borderRadius: 10, position: "relative",
      boxShadow: "inset 0 1px 0 #ffffff08, 0 8px 24px #00000055",
    }}>
      <NoiseLayer opacity={0.03} />
      <div style={{ borderBottom: "1px solid #252B3A", padding: "8px 14px", background: "#0A0C11", flexShrink: 0, display: "flex", alignItems: "center", gap: 8, position: "relative", zIndex: 2 }}>
        <div className="led-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "#F5A00F", boxShadow: "0 0 6px #F5A00F" }} />
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#F5A00F", letterSpacing: "0.18em" }}>SYSTEM PROFILE</span>
      </div>
      <div className="flex-1 overflow-y-auto" style={{ padding: compact ? "12px 12px" : "16px", position: "relative", zIndex: 2 }}>
        <div style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: compact ? 20 : 24, fontWeight: 700, color: "#F5A00F", letterSpacing: "0.06em", lineHeight: 1.1, textShadow: "0 0 24px #F5A00F44", marginBottom: 4, whiteSpace: "pre-line" }}>
          {compact ? "ROBERT STEWART" : "ROBERT\nSTEWART"}
        </div>
        <div style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 11, color: "#6B7A96", letterSpacing: "0.14em", marginBottom: 14 }}>
          FULL-STACK SOFTWARE ENGINEER
        </div>
        <div style={{ height: 1, background: "linear-gradient(90deg, #F5A00F22, transparent)", marginBottom: 12 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: compact ? S.sm : S.md, marginBottom: S.md }}>
          {PROFILE_LINKS.map(({ Icon, text, href }) => {
            const inner = (
              <>
                <Icon size={12} style={{ color: "#F5A00F", opacity: 0.55, flexShrink: 0 }} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: href ? "#95A8C0" : "#6B7A96", lineHeight: 1.3, wordBreak: "break-all", textDecoration: href ? "underline" : "none", textUnderlineOffset: 3 }}>{text}</span>
              </>
            );
            if (href) {
              return (
                <a
                  key={text}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="console-focus"
                  style={{ display: "flex", alignItems: "center", gap: S.sm, textDecoration: "none", borderRadius: 4 }}
                >
                  {inner}
                </a>
              );
            }
            return (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: S.sm }}>
                {inner}
              </div>
            );
          })}
        </div>
        {!compact && (
          <>
            <div style={{ height: 1, background: "#252B3A", marginBottom: 12 }} />
            <div style={{ background: "#06080B", border: "1px solid #1A1D24", borderRadius: 5, padding: "10px 12px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, lineHeight: 1.7, marginBottom: 12 }}>
              <div style={{ color: "#3A4050" }}>{"// context"}</div>
              {[["currentRole",'"NE Innovation Labs"'],["degree",'"M.S. Data Science"'],["cloud",'"AWS ECS Fargate"'],["ai",'"Gemini Multi-Agent"'],["isolation",'"JWT_CLAIM_RLS"']].map(([k, v]) => (
                <div key={k}><span style={{ color: "#7A8AAA" }}>{k}</span><span style={{ color: "#3A4058" }}>: </span><span style={{ color: "#7AAA68" }}>{v}</span></div>
              ))}
            </div>
            <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#525F7B", letterSpacing: "0.15em", marginBottom: 8 }}>PRIMARY STACK</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {STACK_BADGES.map(b => (
                <span key={b} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, padding: "4px 8px", background: "#11141B", border: "1px solid #252B3A", borderRadius: 3, color: "#6B7A96" }}>{b}</span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Content Screen ──────────────────────────────────────────────────────

function MainScreen({ category, channelIndex, flickering, fontSize, reducedMotion = false }: {
  category: string; channelIndex: number; flickering: boolean; fontSize?: number; reducedMotion?: boolean;
}) {
  const channels = CONTENT[category] || [];
  const entry = channels[channelIndex] || channels[0];
  const catObj = CATEGORIES.find((c) => c.id === category);

  return (
    <TelemetryDossier
      entry={entry}
      category={category}
      channelIndex={channelIndex}
      categoryShort={catObj?.shortLabel}
      flickering={flickering}
      fontSize={fontSize}
      reducedMotion={reducedMotion}
      noiseLayer={<NoiseLayer opacity={0.05} />}
    />
  );
}

// ─── Desktop Layout ───────────────────────────────────────────────────────────

function DesktopLayout({ category, channelIndex, flickering, total, goToChannel, handleCategoryChange, reducedMotion, pulseGuide }: LayoutProps) {
  const FASTENERS = [-15, 30, 45, 90];
  // True chassis corners on the faceplate lip — clear of status/clock and mode bar
  const FASTENER_POS = [
    { top: 8, left: 8 },
    { top: 8, right: 8 },
    { bottom: 8, left: 8 },
    { bottom: 8, right: 8 },
  ];
  return (
    <PerspectiveChassis
      reducedMotion={reducedMotion}
      className={reducedMotion ? undefined : "chassis-breathe"}
      style={{
        width: "min(1420px, 96vw)",
        height: "min(920px, 94vh)",
        background: "#0A0B0E",
        borderRadius: 32,
        border: "1.5px solid #1A1D24",
        boxShadow:
          "0 0 80px #F5A00F0a, 0 24px 80px #000000aa, inset 0 1px 0 #2A2D3844, inset 0 -1px 0 #00000088",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div aria-hidden="true" className="absolute inset-0 dot-grid pointer-events-none" style={{ zIndex: 0 }} />
      <CircuitTraces />
      {!reducedMotion && <AmberGlitter density={10} />}
      {FASTENERS.map((rot, i) => (
        <div key={i} className="absolute" style={{ ...FASTENER_POS[i], zIndex: 20 }}><Fastener rotation={rot} /></div>
      ))}
      <StatusBar category={category} channelIndex={channelIndex} total={total} />
      <div className="flex flex-1" style={{ gap: S.lg, padding: S.xl, paddingBottom: S.sm, position: "relative", zIndex: 5, minHeight: 0 }}>
        <RecessedWell style={{ width: 248, flexShrink: 0 }}>
          <ProfilePanel />
        </RecessedWell>
        <RecessedWell className="flex-1 min-w-0">
          <MainScreen category={category} channelIndex={channelIndex} flickering={flickering} fontSize={34} reducedMotion={reducedMotion} />
        </RecessedWell>
        <RecessedWell style={{ width: 248, flexShrink: 0, minHeight: 0 }} overflow="hidden">
          <div className="flex flex-col items-center justify-center" style={{
            gap: S.md,
            background: "linear-gradient(180deg, #11141B 0%, #0A0B0E 100%)",
            padding: `${S.md}px ${S.md}px`,
            position: "relative",
            minHeight: "100%",
            height: "100%",
            boxSizing: "border-box",
            overflow: "hidden",
          }}>
            <NoiseLayer opacity={0.03} />
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#6B7A96", letterSpacing: "0.22em", position: "relative", zIndex: 2 }}>TUNER DECK</div>
            <div style={{ position: "relative", zIndex: 2, width: "100%", display: "flex", justifyContent: "center" }}>
              <ChannelTuner channelIndex={channelIndex} total={total} onSelect={goToChannel} reducedMotion={reducedMotion} />
            </div>
          </div>
        </RecessedWell>
      </div>
      <div style={{ padding: `${S.sm}px ${S.xl}px ${S.sm}px`, borderTop: "1px solid #0E1016", position: "relative", zIndex: 5, flexShrink: 0, paddingLeft: 44, paddingRight: 44 }}>
        <SectionSelect category={category} channelIndex={channelIndex} channelTotal={total} onCategoryChange={handleCategoryChange} pulseGuide={pulseGuide} reducedMotion={reducedMotion} />
        <FabricationStamp />
      </div>
    </PerspectiveChassis>
  );
}

// ─── Touch console (mobile + tablet) — set TOUCH_SHELL to try layouts ─────────

function TouchLayout({ category, channelIndex, flickering, total, goToChannel, handleCategoryChange, reducedMotion, pulseGuide }: LayoutProps) {
  const channels = CONTENT[category] || [];
  const channelTitle = channels[channelIndex]?.title ?? channels[0]?.title;
  const shared = {
    sections: CATEGORIES,
    category,
    channelIndex,
    total,
    channelTitle,
    reducedMotion,
    pulseGuide,
    onCategoryChange: handleCategoryChange,
    onChannelSelect: goToChannel,
    clock: <LiveClock />,
    profile: <ProfilePanel compact />,
    screen: (
      <MainScreen
        category={category}
        channelIndex={channelIndex}
        flickering={flickering}
        fontSize={28}
        reducedMotion={reducedMotion}
      />
    ),
    stamp: <FabricationStamp compact />,
  };

  if (TOUCH_SHELL === "keycap-dial") {
    return <TouchKeycapDial {...shared} />;
  }
  return <TouchConsole {...shared} flickering={flickering} />;
}

function renderTouchShell(props: LayoutProps) {
  if (TOUCH_SHELL === "off") return null;
  return <TouchLayout {...props} />;
}

// ─── Tablet Layout (legacy) ───────────────────────────────────────────────────

function TabletLayoutLegacy({ category, channelIndex, flickering, total, goToChannel, handleCategoryChange, reducedMotion, pulseGuide }: LayoutProps) {
  return (
    <div className="relative flex flex-col" style={{
      width: "100vw", height: "100dvh",
      background: "#0A0B0E", position: "relative", overflow: "hidden",
    }}>
      <div aria-hidden="true" className="absolute inset-0 dot-grid pointer-events-none" style={{ zIndex: 0 }} />
      {!reducedMotion && <AmberGlitter density={8} />}
      <StatusBar category={category} channelIndex={channelIndex} total={total} compact />
      <div className="flex flex-1" style={{ gap: S.md, padding: S.md, paddingBottom: S.sm, position: "relative", zIndex: 5, minHeight: 0 }}>
        <div className="flex-1 min-w-0">
          <MainScreen category={category} channelIndex={channelIndex} flickering={flickering} fontSize={30} reducedMotion={reducedMotion} />
        </div>
        <div className="flex flex-col items-center justify-center" style={{
          width: 220, flexShrink: 0, gap: S.sm, minHeight: 0, overflow: "hidden",
          background: "linear-gradient(180deg, #11141B 0%, #0A0B0E 100%)",
          border: "1px solid #252B3A", borderRadius: 12, padding: S.md, position: "relative",
          boxShadow: "inset 0 2px 12px #000000aa",
        }}>
          <NoiseLayer opacity={0.03} />
          <div style={{ position: "relative", zIndex: 2, width: "100%", display: "flex", justifyContent: "center" }}>
            <ChannelTuner channelIndex={channelIndex} total={total} onSelect={goToChannel} reducedMotion={reducedMotion} />
          </div>
        </div>
      </div>
      <div style={{ padding: `${S.sm}px ${S.md}px ${S.sm}px`, borderTop: "1px solid #0E1016", position: "relative", zIndex: 5, flexShrink: 0 }}>
        <SectionSelect category={category} channelIndex={channelIndex} channelTotal={total} onCategoryChange={handleCategoryChange} pulseGuide={pulseGuide} reducedMotion={reducedMotion} />
        <FabricationStamp />
      </div>
    </div>
  );
}

function TabletLayout(props: LayoutProps) {
  return renderTouchShell(props) ?? <TabletLayoutLegacy {...props} />;
}

// ─── Mobile Layout (legacy) ───────────────────────────────────────────────────

function MobileLayoutLegacy({ category, channelIndex, flickering, total, goToChannel, handleCategoryChange, reducedMotion, pulseGuide }: LayoutProps) {
  const [showProfile, setShowProfile] = useState(false);
  return (
    <div className="relative flex flex-col" style={{ width: "100vw", height: "100dvh", background: "#0A0B0E", overflow: "hidden" }}>
      <div aria-hidden="true" className="absolute inset-0 dot-grid pointer-events-none" style={{ zIndex: 0 }} />

      <div style={{ display: "flex", alignItems: "center", height: 40, padding: "0 12px", borderBottom: "1px solid #252B3A", background: "#11141B", flexShrink: 0, gap: 8, position: "relative", zIndex: 10 }}>
        <div style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 10, fontWeight: 700, color: "#525F7B", letterSpacing: "0.3em" }}>RS-691</div>
        <div style={{ width: 1, height: 10, background: "#252B3A" }} />
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#F5A00F", boxShadow: "0 0 6px #F5A00F" }} />
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#F5A00F", letterSpacing: "0.15em" }}>
          {CATEGORIES.find(c => c.id === category)?.shortLabel}
        </span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#525F7B" }}>
          {String(channelIndex + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
        </span>
        <div style={{ flex: 1 }} />
        <motion.button
          type="button"
          onClick={() => setShowProfile(p => !p)}
          className="console-focus"
          style={{ border: "none", background: "none", padding: 4, cursor: "pointer", borderRadius: 6 }}
        >
          <User size={16} style={{ color: showProfile ? "#F5A00F" : "#525F7B" }} />
        </motion.button>
        <LiveClock />
      </div>

      <AnimatePresence>
        {showProfile && (
          <motion.div
            initial={reducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: 240, opacity: 1 }}
            exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 300, damping: 30 }
            }
            style={{ overflow: "hidden", flexShrink: 0, position: "relative", zIndex: 8, borderBottom: "1px solid #252B3A" }}
          >
            <ProfilePanel compact />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1" style={{ padding: S.sm, paddingBottom: S.xs, minHeight: 0, position: "relative", zIndex: 5 }}>
        <MainScreen category={category} channelIndex={channelIndex} flickering={flickering} fontSize={28} reducedMotion={reducedMotion} />
      </div>

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: `${S.sm}px ${S.md}px`, borderTop: "1px solid #0E1016",
        background: "linear-gradient(0deg, #0A0B0E 0%, #0A0B0E 100%)",
        flexShrink: 0, position: "relative", zIndex: 5,
      }}>
        <ChannelTuner channelIndex={channelIndex} total={total} onSelect={goToChannel} horizontal reducedMotion={reducedMotion} />
      </div>

      <div style={{ padding: `${S.sm}px ${S.sm}px ${S.sm}px`, borderTop: "1px solid #0E1016", flexShrink: 0, position: "relative", zIndex: 5 }}>
        <SectionSelect category={category} channelIndex={channelIndex} channelTotal={total} onCategoryChange={handleCategoryChange} compact pulseGuide={pulseGuide} reducedMotion={reducedMotion} />
        <FabricationStamp compact />
      </div>
    </div>
  );
}

function MobileLayout(props: LayoutProps) {
  return renderTouchShell(props) ?? <MobileLayoutLegacy {...props} />;
}

// ─── Layout prop type ─────────────────────────────────────────────────────────

type LayoutProps = {
  category: string;
  channelIndex: number;
  flickering: boolean;
  total: number;
  goToChannel: (index: number) => void;
  handleCategoryChange: (id: string) => void;
  reducedMotion: boolean;
  pulseGuide?: boolean;
};

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const { isMobile, isTablet } = useBreakpoint();
  const reducedMotion = usePrefersReducedMotion();
  const initial = typeof window !== "undefined" ? parseHash() : null;
  const [category, setCategory] = useState(initial?.category ?? "projects");
  const [channelIndex, setChannelIndex] = useState(() => {
    if (!initial) return 0;
    const len = (CONTENT[initial.category] || []).length;
    return Math.min(initial.channel, Math.max(0, len - 1));
  });
  const [flickering, setFlickering] = useState(false);
  const [powered, setPowered] = useState(false);
  const [booted, setBooted] = useState(reducedMotion);
  const [pulseGuide, setPulseGuide] = useState(false);
  const flickerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onBootDone = useCallback(() => setBooted(true), []);

  useEffect(() => {
    if (!booted) return;
    const t = setTimeout(() => setPowered(true), reducedMotion ? 0 : 80);
    return () => clearTimeout(t);
  }, [booted, reducedMotion]);

  useEffect(() => {
    if (!booted || reducedMotion) return;
    try {
      if (localStorage.getItem("rs691-guide-pulse")) return;
    } catch {
      return;
    }
    setPulseGuide(true);
    const t = setTimeout(() => {
      setPulseGuide(false);
      try {
        localStorage.setItem("rs691-guide-pulse", "1");
      } catch {
        /* ignore quota / private mode */
      }
    }, 2200);
    return () => clearTimeout(t);
  }, [booted, reducedMotion]);

  useEffect(() => {
    writeHash(category, channelIndex);
  }, [category, channelIndex]);

  useEffect(() => {
    const onHash = () => {
      const parsed = parseHash();
      if (!parsed) return;
      setCategory(parsed.category);
      const len = (CONTENT[parsed.category] || []).length;
      setChannelIndex(Math.min(parsed.channel, Math.max(0, len - 1)));
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const total = (CONTENT[category] || []).length;

  const triggerFlicker = useCallback(() => {
    if (reducedMotion) return;
    setFlickering(true);
    if (flickerTimer.current) clearTimeout(flickerTimer.current);
    flickerTimer.current = setTimeout(() => setFlickering(false), 380);
  }, [reducedMotion]);

  const channelRef = useRef(channelIndex);
  channelRef.current = channelIndex;
  const categoryRef = useRef(category);
  categoryRef.current = category;

  const goToChannel = useCallback((index: number) => {
    const len = (CONTENT[categoryRef.current] || []).length;
    if (len === 0) return;
    const next = ((index % len) + len) % len;
    if (next === channelRef.current) return;
    setChannelIndex(next);
    triggerFlicker();
  }, [triggerFlicker]);

  const stepChannel = useCallback((direction: 1 | -1) => {
    const len = (CONTENT[categoryRef.current] || []).length;
    if (len === 0) return;
    const next = (channelRef.current + direction + len) % len;
    if (next === channelRef.current) return;
    setChannelIndex(next);
    triggerFlicker();
  }, [triggerFlicker]);

  const handleCategoryChange = useCallback((id: string) => {
    if (id === categoryRef.current) return;
    if (reducedMotion) {
      setCategory(id);
      setChannelIndex(0);
      return;
    }
    setFlickering(true);
    setTimeout(() => { setCategory(id); setChannelIndex(0); setFlickering(false); }, 280);
  }, [reducedMotion]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") stepChannel(1);
      else if (e.key === "ArrowLeft") stepChannel(-1);
      else {
        const idx = ["1","2","3","4"].indexOf(e.key);
        if (idx >= 0) handleCategoryChange(CATEGORIES[idx].id);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [stepChannel, handleCategoryChange]);

  const layoutProps: LayoutProps = {
    category,
    channelIndex,
    flickering,
    total,
    goToChannel,
    handleCategoryChange,
    reducedMotion,
    pulseGuide,
  };

  return (
    <>
      <BootSequence reducedMotion={reducedMotion} onDone={onBootDone} />
      <motion.div
        className="w-screen h-screen flex items-center justify-center"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 45%, #252B3A 0%, #11141B 42%, #0A0B0E 100%)",
        }}
        initial={{ opacity: 0 }}
        animate={powered ? { opacity: 1 } : {}}
        transition={{ duration: reducedMotion ? 0 : 0.8 }}
      >
        <motion.div
          initial={reducedMotion ? false : { scale: 0.97, filter: "brightness(3) blur(8px)" }}
          animate={powered ? { scale: 1, filter: "brightness(1) blur(0px)" } : {}}
          transition={{ duration: reducedMotion ? 0 : 1.1, ease: [0.16, 1, 0.3, 1] }}
          style={isMobile || isTablet ? { width: "100%", height: "100%" } : {}}
          className={isMobile || isTablet ? "w-full h-full" : ""}
        >
          {isMobile
            ? <MobileLayout {...layoutProps} />
            : isTablet
            ? <TabletLayout {...layoutProps} />
            : (
              <div
                style={{
                  padding: "12px 8px 20px",
                  background:
                    "radial-gradient(ellipse 75% 60% at 50% 48%, #252B3A 0%, #11141B 38%, #0A0B0E 72%, transparent 100%)",
                  borderRadius: 56,
                }}
              >
                <DesktopLayout {...layoutProps} />
              </div>
            )}
        </motion.div>
      </motion.div>
    </>
  );
}
