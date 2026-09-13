import { useState, useEffect, useRef, useCallback, type ElementType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderGit2, Cpu, Terminal, GraduationCap,
  GitBranch, Link, Globe, Mail, Phone, MapPin, User,
} from "lucide-react";
import RotaryDial from "@/components/RotaryDial";
import TickChannelNumber from "@/components/TickChannelNumber";
import ChannelGauge from "@/components/ChannelGauge";
import ActionStrip, { type ContentLink } from "@/components/ActionStrip";
import BootSequence from "@/components/BootSequence";
import AmberGlitter from "@/components/AmberGlitter";
import SectionModeDial from "@/components/SectionModeDial";
import PerspectiveChassis, { RecessedWell } from "@/components/PerspectiveChassis";

/** Consistent spacing rhythm (px) */
const S = { xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 32 } as const;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
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

type ContentEntry = {
  title: string;
  meta: string;
  tags: string[];
  body: string[];
  links?: ContentLink[];
};

const CONTENT: Record<string, ContentEntry[]> = {
  projects: [
    {
      title: "YourOpoly Platform",
      meta: "Production · Mobile · Multi-tenant",
      tags: ["Flutter", "Node.js", "MySQL", "AWS ECS", "Redis", "Socket.io", "Gemini API"],
      body: [
        "1,000+ concurrent regional users across live deployment",
        "Automated tenant onboarding pipeline — 35% reduction in setup time",
        "QR check-ins, real-time leaderboards, map discovery layer",
        "Background Gemini multi-agent player intelligence engine",
        "Shipped to App Store & Google Play — live in production",
      ],
      links: [
        { label: "PORTFOLIO", href: "https://robert-stewart.dev" },
        { label: "GITHUB", href: "https://github.com/rs691" },
        { label: "COPY EMAIL", href: "copy:rms.dev@outlook.com", kind: "copy" },
      ],
    },
    {
      title: "Multi-Product Admin Platform",
      meta: "Internal Tool · RBAC · Centralized Console",
      tags: ["Node.js", "React", "Next.js", "MySQL", "AWS"],
      body: [
        "Centralized management console for YourOpoly and Good Life Bingo",
        "Strict RBAC separating super-admin controls from tenant self-service",
        "Zero cross-tenant data leakage — verified by integration test suite",
        "Unified audit log and permission matrix across all tenants",
      ],
      links: [
        { label: "GITHUB", href: "https://github.com/rs691" },
        { label: "COPY EMAIL", href: "copy:rms.dev@outlook.com", kind: "copy" },
      ],
    },
    {
      title: "Autonomous E-Commerce Platform",
      meta: "AI-Native · Streaming · Full-Stack",
      tags: ["Next.js 15", "Supabase", "PostgreSQL", "Stripe", "Vercel AI SDK"],
      body: [
        "Streaming AI copilot with pgvector RAG over product catalog",
        "Server-side function calling pipeline with tool orchestration",
        "Automated contract evaluations running in CI on every push",
        "Stripe webhook order persistence with idempotency guarantees",
      ],
      links: [
        { label: "GITHUB", href: "https://github.com/rs691" },
        { label: "SITE", href: "https://robert-stewart.dev" },
      ],
    },
    {
      title: "Django Reservation System",
      meta: "Backend · Scheduling · Transactional",
      tags: ["Django", "HTMX", "Python", "SQLite"],
      body: [
        "Transaction-safe scheduling conflict resolution at the DB layer",
        "Automated email notification and reminder workflow engine",
        "HTMX-powered real-time slot availability without full reloads",
        "Admin dashboard with full conflict audit trail",
      ],
      links: [{ label: "GITHUB", href: "https://github.com/rs691" }],
    },
    {
      title: "Multi-Tenant Task Board API",
      meta: "API · Cloud · CI/CD · Security",
      tags: ["C#", "ASP.NET Core", "EF Core", "SQLite", "JWT", "Azure"],
      body: [
        "EF Core global query filters enforce tenant isolation at ORM layer",
        "JWT claim-scoped RLS — zero cross-tenant data surface",
        "Automated GitHub Actions CI/CD pipeline deploying to Azure",
        "Fully documented OpenAPI surface with contract tests",
      ],
      links: [{ label: "GITHUB", href: "https://github.com/rs691" }],
    },
  ],
  experience: [
    {
      title: "NE Innovation Labs",
      meta: "Full-Stack Software Engineer · Dec 2025 – Present",
      tags: ["Flutter", "AWS ECS", "Gemini", "Groq", "CI/CD"],
      body: [
        "Architectural lead for multi-tenant Flutter mobile application suite",
        "Migrated infrastructure to AWS ECS Fargate — improved scalability 4×",
        "Built Genkit / Gemini AI workflows running on Groq inference layer",
        "Implemented semantic CI/CD gates and automated quality rails",
      ],
      links: [
        { label: "LINKEDIN", href: "https://www.linkedin.com/in/robert-stewart-m" },
        { label: "COPY EMAIL", href: "copy:rms.dev@outlook.com", kind: "copy" },
      ],
    },
    {
      title: "Bellevue University",
      meta: "CIS Peer Tutor · Dec 2023 – Apr 2026",
      tags: ["Python", "JavaScript", "Clean Code", "TDD", "SQL"],
      body: [
        "Mentored 100+ students in Clean Code, TDD, and system design",
        "Delivered Python, JavaScript, and database design curriculum",
        "Authored standardized database assessment rubrics adopted dept-wide",
        "Hosted weekly office hours and targeted exam review sessions",
      ],
      links: [{ label: "UNIVERSITY", href: "https://www.bellevue.edu" }],
    },
    {
      title: "Pierson Wireless",
      meta: "Junior Web Developer & IT Specialist · Oct 2022 – Nov 2023",
      tags: ["Blazor", "C#", "JumpCloud", "CrowdStrike"],
      body: [
        "Built Blazor / C# internal tooling — 40% reduction in quoting time",
        "Automated JumpCloud directory provisioning and deprovisioning",
        "Deployed CrowdStrike endpoint security across 80+ devices",
        "Conducted full network infrastructure audit and remediation",
      ],
      links: [{ label: "LINKEDIN", href: "https://www.linkedin.com/in/robert-stewart-m" }],
    },
  ],
  skills: [
    {
      title: "Languages & Full-Stack",
      meta: "Frontend · Backend · Mobile",
      tags: ["TypeScript", "Python", "Java", "C#", "Dart", "SQL"],
      body: [
        "TypeScript · JavaScript · Python · Java · C# · Dart · SQL",
        "React · Next.js · Flutter · HTMX · Tailwind CSS",
        "REST API design · GraphQL · WebSocket protocols",
        "Component architecture · accessibility · responsive layout",
      ],
      links: [{ label: "GITHUB", href: "https://github.com/rs691" }],
    },
    {
      title: "Backend & Distributed Data",
      meta: "Services · Databases · Real-time",
      tags: ["Node.js", "Express", "PostgreSQL", "Redis", "Supabase"],
      body: [
        "Node.js · Express · Django · ASP.NET Core",
        "Socket.io WebSockets · event-driven architecture",
        "PostgreSQL · MySQL · Redis · SQLite · Supabase · pgvector",
        "EF Core · ORM-layer tenant isolation · query optimization",
      ],
    },
    {
      title: "Cloud & AI Orchestration",
      meta: "Infrastructure · AI · DevOps",
      tags: ["AWS", "Azure", "Docker", "Gemini API", "GitHub Actions"],
      body: [
        "AWS ECS / Lambda / RDS · Azure App Services",
        "Docker · GitHub Actions CI/CD · automated deployment pipelines",
        "Gemini API · multi-agent system design · LLM tool calling",
        "RAG pipelines · pgvector semantic search · Groq inference",
      ],
    },
  ],
  education: [
    {
      title: "Academic Degrees",
      meta: "Bellevue University · Iowa Western Community College",
      tags: ["M.S. Data Science", "B.S. Software Dev", "A.A. CS"],
      body: [
        "M.S. Data Science — Bellevue University [Expected Jun 2028]",
        "B.S. Software Development — Bellevue University [Jun 2025]",
        "A.A. Computer Programming — Iowa Western [May 2023]",
        "Consistent Dean's List recognition across all programs",
      ],
      links: [{ label: "BELLEVUE U", href: "https://www.bellevue.edu" }],
    },
    {
      title: "Honors & Scholarships",
      meta: "National Societies · Merit Awards",
      tags: ["Omega Nu Lambda", "Dean's List", "DREAM", "Gottsch"],
      body: [
        "Darrel H. Gottsch Endowed Scholarship recipient",
        "DREAM Scholarship — merit-based award",
        "Dean's List — multiple consecutive semesters",
        "Omega Nu Lambda National Honor Society member",
      ],
    },
  ],
};

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

function NoiseLayer({ opacity = 0.045 }: { opacity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = 256;
    canvas.height = 256;
    let rafId: number;
    let last = 0;
    const render = (now: number) => {
      rafId = requestAnimationFrame(render);
      if (now - last < 1000 / 14) return;
      last = now;
      const img = ctx.createImageData(256, 256);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
    };
    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, []);
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity, mixBlendMode: "screen", zIndex: 8, borderRadius: "inherit" }}
    />
  );
}

// ─── Typewriter hook ──────────────────────────────────────────────────────────

function useTypewriter(text: string, speed = 28, startDelay = 0) {
  const [displayed, setDisplayed] = useState(speed === 0 ? text : "");
  useEffect(() => {
    if (speed === 0) {
      setDisplayed(text);
      return;
    }
    setDisplayed("");
    let i = 0;
    let tick: ReturnType<typeof setInterval> | undefined;
    const t = setTimeout(() => {
      tick = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length && tick) clearInterval(tick);
      }, speed);
    }, startDelay);
    return () => {
      clearTimeout(t);
      if (tick) clearInterval(tick);
    };
  }, [text, speed, startDelay]);
  return displayed;
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
    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#F59E0B", letterSpacing: "0.12em" }}>
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
        padding: `0 ${compact ? 14 : 24}px`,
        borderBottom: "1px solid #1C1F27",
        background: "linear-gradient(90deg, #0C0E13 0%, #0A0B0E 100%)",
        position: "relative",
        zIndex: 10,
      }}
    >
      <div style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: compact ? 9 : 10, fontWeight: 700, color: "#2A2D38", letterSpacing: "0.3em" }}>
        RS-691
      </div>
      <div style={{ width: 1, height: 12, background: "#1C1F27" }} />
      <div className="flex items-center gap-2">
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#F59E0B", boxShadow: "0 0 6px #F59E0B", flexShrink: 0 }} />
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: compact ? 9 : 10, color: "#F59E0B", letterSpacing: "0.18em", whiteSpace: "nowrap" }}>
          {compact ? cat?.shortLabel : cat?.label}
        </span>
      </div>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: compact ? 9 : 10, color: "#3A3F50", letterSpacing: "0.12em" }}>
        {String(channelIndex + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
      </span>
      <div style={{ flex: 1 }} />
      <div className="flex items-end gap-0.5">
        {[3, 5, 7, 9, 11].map((h, i) => (
          <div key={i} style={{ width: 3, height: h, borderRadius: 1, background: i < 4 ? "#F59E0B" : "#1C1F27", opacity: i < 4 ? 0.8 : 1 }} />
        ))}
      </div>
      <div style={{ width: 1, height: 12, background: "#1C1F27" }} />
      <LiveClock />
    </div>
  );
}

// ─── Corner Fastener ──────────────────────────────────────────────────────────

function Fastener({ rotation }: { rotation: number }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" fill="#13151B" stroke="#272A34" strokeWidth="1" />
      <circle cx="10" cy="10" r="5.5" fill="#1C1F27" stroke="#3A3F50" strokeWidth="0.5" />
      <g transform={`rotate(${rotation} 10 10)`}>
        <line x1="10" y1="4.5" x2="10" y2="15.5" stroke="#3A3F50" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="4.5" y1="10" x2="15.5" y2="10" stroke="#3A3F50" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <circle cx="10" cy="10" r="1.8" fill="#272A34" />
    </svg>
  );
}

// ─── Circuit Traces ────────────────────────────────────────────────────────────

function CircuitTraces() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1200 720" preserveAspectRatio="none" style={{ zIndex: 1 }}>
      <path d="M 220 160 L 380 160 L 400 180 L 800 180 L 820 160 L 980 160" stroke="#F59E0B" strokeWidth="0.7" fill="none" opacity="0.12" strokeDasharray="6 5" />
      <path d="M 220 560 L 360 560 L 380 540 L 820 540 L 840 560 L 980 560" stroke="#F59E0B" strokeWidth="0.7" fill="none" opacity="0.08" strokeDasharray="8 6" />
      {[{ cx: 980, cy: 160, dur: "2.1s" }, { cx: 980, cy: 560, dur: "3.4s" }, { cx: 220, cy: 160, dur: "1.7s" }, { cx: 220, cy: 560, dur: "2.8s" }].map(({ cx, cy, dur }, i) => (
        <circle key={i} cx={cx} cy={cy} r="2.5" fill="#F59E0B" opacity="0.5">
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
}: {
  channelIndex: number;
  total: number;
  onSelect: (index: number) => void;
  horizontal?: boolean;
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
        gap: horizontal ? 14 : 16,
        flexWrap: horizontal ? "wrap" : "nowrap",
      }}
    >
      {!horizontal && (
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            color: "#3A3F50",
            letterSpacing: "0.22em",
          }}
        >
          CHANNEL SELECT
        </div>
      )}
      <TickChannelNumber
        value={channelIndex + 1}
        total={total}
        scale={horizontal ? 0.95 : 1.15}
      />
      <RotaryDial
        channelIndex={channelIndex}
        total={total}
        onStep={onStep}
        onSelect={onSelect}
        size={horizontal ? 110 : 148}
      />
      <ChannelGauge
        channelIndex={channelIndex}
        total={total}
        onStep={onStep}
        onSelect={onSelect}
        compact={horizontal}
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
}: {
  category: string;
  channelIndex: number;
  channelTotal: number;
  onCategoryChange: (id: string) => void;
  compact?: boolean;
}) {
  return (
    <SectionModeDial
      sections={CATEGORIES}
      activeId={category}
      channelIndex={channelIndex}
      channelTotal={channelTotal}
      onChange={onCategoryChange}
      compact={compact}
    />
  );
}

// ─── Profile Panel ────────────────────────────────────────────────────────────

function ProfilePanel({ compact = false }: { compact?: boolean }) {
  return (
    <div className="h-full flex flex-col overflow-hidden" style={{
      background: "linear-gradient(180deg, #0C0F14 0%, #090B10 100%)",
      border: "1px solid #1C1F27", borderRadius: 10, position: "relative",
      boxShadow: "inset 0 1px 0 #ffffff08, 0 8px 24px #00000055",
    }}>
      <NoiseLayer opacity={0.03} />
      <div style={{ borderBottom: "1px solid #1C1F27", padding: "8px 14px", background: "#0A0C11", flexShrink: 0, display: "flex", alignItems: "center", gap: 8, position: "relative", zIndex: 2 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#F59E0B", boxShadow: "0 0 6px #F59E0B", animation: "pulse-amber 2s ease-in-out infinite" }} />
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#F59E0B", letterSpacing: "0.18em" }}>SYSTEM PROFILE</span>
      </div>
      <div className="flex-1 overflow-y-auto" style={{ padding: compact ? "12px 12px" : "16px", position: "relative", zIndex: 2 }}>
        <div style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: compact ? 20 : 24, fontWeight: 700, color: "#F59E0B", letterSpacing: "0.06em", lineHeight: 1.1, textShadow: "0 0 24px #F59E0B44", marginBottom: 4, whiteSpace: "pre-line" }}>
          {compact ? "ROBERT STEWART" : "ROBERT\nSTEWART"}
        </div>
        <div style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 11, color: "#6A7080", letterSpacing: "0.14em", marginBottom: 14 }}>
          FULL-STACK SOFTWARE ENGINEER
        </div>
        <div style={{ height: 1, background: "linear-gradient(90deg, #F59E0B22, transparent)", marginBottom: 12 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: compact ? S.sm : S.md, marginBottom: S.md }}>
          {PROFILE_LINKS.map(({ Icon, text, href }) => {
            const inner = (
              <>
                <Icon size={12} style={{ color: "#F59E0B", opacity: 0.55, flexShrink: 0 }} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: href ? "#8A9AB0" : "#6A7080", lineHeight: 1.3, wordBreak: "break-all", textDecoration: href ? "underline" : "none", textUnderlineOffset: 3 }}>{text}</span>
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
            <div style={{ height: 1, background: "#1C1F27", marginBottom: 12 }} />
            <div style={{ background: "#06080B", border: "1px solid #1A1D24", borderRadius: 5, padding: "10px 12px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, lineHeight: 1.7, marginBottom: 12 }}>
              <div style={{ color: "#3A4050" }}>{"// context"}</div>
              {[["currentRole",'"NE Innovation Labs"'],["degree",'"M.S. Data Science"'],["cloud",'"AWS ECS Fargate"'],["ai",'"Gemini Multi-Agent"'],["isolation",'"JWT_CLAIM_RLS"']].map(([k, v]) => (
                <div key={k}><span style={{ color: "#6A7A9A" }}>{k}</span><span style={{ color: "#2A3040" }}>: </span><span style={{ color: "#6A9058" }}>{v}</span></div>
              ))}
            </div>
            <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#3A3F50", letterSpacing: "0.15em", marginBottom: 8 }}>PRIMARY STACK</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {STACK_BADGES.map(b => (
                <span key={b} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, padding: "4px 8px", background: "#0D0F14", border: "1px solid #1C1F27", borderRadius: 3, color: "#5A6070" }}>{b}</span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Content Screen ──────────────────────────────────────────────────────

const screenVariants = {
  enter:  { opacity: 0, y: 14, filter: "blur(4px) brightness(2)" },
  center: { opacity: 1, y: 0,  filter: "blur(0px) brightness(1)" },
  exit:   { opacity: 0, y: -10, filter: "blur(3px) brightness(0.5)" },
};

function MainScreen({ category, channelIndex, flickering, fontSize, reducedMotion = false }: {
  category: string; channelIndex: number; flickering: boolean; fontSize?: number; reducedMotion?: boolean;
}) {
  const channels = CONTENT[category] || [];
  const entry = channels[channelIndex] || channels[0];
  const title = useTypewriter(entry.title, reducedMotion ? 0 : 28, reducedMotion ? 0 : 100);
  const catObj = CATEGORIES.find(c => c.id === category);
  const titleSize = fontSize ?? 52;
  const bodySize = Math.max(16, Math.min(19, titleSize * 0.36));
  const showFlicker = flickering && !reducedMotion;

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{
      background: "linear-gradient(160deg, #0A0C12 0%, #080A0F 100%)",
      border: "1px solid #1C1F27", borderRadius: 12, position: "relative",
      boxShadow: "inset 0 1px 0 #ffffff0a, inset 0 0 40px #00000055, 0 12px 40px #00000066",
    }}>
      <div className="scanline-overlay" style={{ zIndex: 6 }} />
      <NoiseLayer opacity={0.05} />
      {!reducedMotion && <AmberGlitter density={14} showSheen />}
      <div style={{ borderBottom: "1px solid #1C1F27", padding: `${S.sm}px ${S.lg}px`, background: "#08090E", flexShrink: 0, display: "flex", alignItems: "center", gap: S.sm, position: "relative", zIndex: 9 }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#F59E0B", boxShadow: "0 0 8px #F59E0B", animation: reducedMotion ? undefined : "pulse-amber 2s ease-in-out infinite" }} />
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#F59E0B", letterSpacing: "0.2em" }}>TELEMETRY FEED</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#3A3F50", letterSpacing: "0.12em" }}>
          SRC:{catObj?.shortLabel} · CH:{String(channelIndex + 1).padStart(2, "0")}
        </span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${category}-${channelIndex}`}
          variants={reducedMotion ? undefined : screenVariants}
          initial={reducedMotion ? false : "enter"}
          animate={showFlicker ? { opacity: [0.2, 0.9, 0.4, 1], filter: ["blur(3px)", "blur(0px)"] } : reducedMotion ? { opacity: 1 } : "center"}
          exit={reducedMotion ? undefined : "exit"}
          transition={{ duration: reducedMotion ? 0 : 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 flex flex-col overflow-y-auto"
          style={{ padding: `${S.xl}px ${S.xxl}px`, position: "relative", zIndex: 7 }}
        >
          <motion.div initial={reducedMotion ? false : { opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}
            style={{ display: "flex", alignItems: "center", gap: S.sm, marginBottom: S.lg }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#0A0B0E", background: "#F59E0B", padding: "5px 12px", borderRadius: 3, letterSpacing: "0.18em", fontWeight: 600 }}>
              CH:{String(channelIndex + 1).padStart(2, "0")}
            </div>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, #F59E0B44, transparent)" }} />
          </motion.div>

          <h1 style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: titleSize, fontWeight: 700, color: "#F0EAD8", letterSpacing: "0.02em", lineHeight: 1.1, textShadow: "0 0 40px #F59E0B14", marginBottom: S.sm, minHeight: titleSize * 1.15 }}>
            {reducedMotion ? entry.title : title}
            {!reducedMotion && (
              <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }} style={{ color: "#F59E0B", marginLeft: 3 }}>
                {title.length < entry.title.length ? "▊" : ""}
              </motion.span>
            )}
          </h1>

          <motion.div initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "#5A6070", letterSpacing: "0.06em", marginBottom: S.md }}>
            {entry.meta}
          </motion.div>

          <motion.div initial={reducedMotion ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            style={{ display: "flex", flexWrap: "wrap", gap: S.sm, marginBottom: S.xl }}>
            {entry.tags.map((tag, i) => (
              <motion.span key={tag} initial={reducedMotion ? false : { opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.04, type: "spring", stiffness: 300, damping: 22 }}
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, padding: "5px 12px", background: "#0D1018", border: "1px solid #F59E0B2A", borderRadius: 4, color: "#C9954A", letterSpacing: "0.05em" }}>
                {tag}
              </motion.span>
            ))}
          </motion.div>

          <div style={{ height: 1, background: "linear-gradient(90deg, #F59E0B1A, transparent)", marginBottom: S.lg }} />

          <div style={{ display: "flex", flexDirection: "column", gap: S.md }}>
            {entry.body.map((line, i) => (
              <motion.div key={`${category}-${channelIndex}-${i}`} initial={reducedMotion ? false : { opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.08, type: "spring", stiffness: 260, damping: 26 }}
                style={{ display: "flex", alignItems: "flex-start", gap: S.md }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#F59E0B", opacity: 0.5, flexShrink: 0, marginTop: 3, letterSpacing: "0.1em" }}>
                  {String(i + 1).padStart(2, "0")}›
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: bodySize, color: "#B8B09A", lineHeight: 1.65, letterSpacing: "0.02em" }}>
                  {line}
                </span>
              </motion.div>
            ))}
          </div>

          <ActionStrip links={entry.links} reducedMotion={reducedMotion} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Desktop Layout ───────────────────────────────────────────────────────────

function DesktopLayout({ category, channelIndex, flickering, total, goToChannel, handleCategoryChange, reducedMotion }: LayoutProps) {
  const FASTENERS = [-15, 30, 45, 90];
  const FASTENER_POS = [{ top: 12, left: 14 }, { top: 12, right: 14 }, { bottom: 132, left: 14 }, { bottom: 132, right: 14 }];
  return (
    <PerspectiveChassis
      reducedMotion={reducedMotion}
      className={reducedMotion ? undefined : "chassis-breathe"}
      style={{
        width: "min(1420px, 96vw)",
        height: "min(880px, 92vh)",
        background: "#0A0B0E",
        borderRadius: 32,
        border: "1.5px solid #1A1D24",
        boxShadow:
          "0 0 80px #F59E0B0a, 0 24px 80px #000000aa, inset 0 1px 0 #2A2D3844, inset 0 -1px 0 #00000088",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div className="absolute inset-0 dot-grid pointer-events-none" style={{ zIndex: 0 }} />
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
          <MainScreen category={category} channelIndex={channelIndex} flickering={flickering} fontSize={52} reducedMotion={reducedMotion} />
        </RecessedWell>
        <RecessedWell style={{ width: 236, flexShrink: 0 }}>
          <div className="flex flex-col items-center justify-center h-full" style={{
            gap: S.lg,
            background: "linear-gradient(180deg, #0C0E14 0%, #08090E 100%)",
            padding: S.lg, position: "relative",
          }}>
            <NoiseLayer opacity={0.03} />
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#3A3F50", letterSpacing: "0.22em", position: "relative", zIndex: 2 }}>TUNER DECK</div>
            <div style={{ position: "relative", zIndex: 2 }}>
              <ChannelTuner channelIndex={channelIndex} total={total} onSelect={goToChannel} />
            </div>
            <div style={{ position: "relative", zIndex: 2, textAlign: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#2A2D38", letterSpacing: "0.1em", lineHeight: 1.8 }}>
              CLICK DIAL · GAUGE ‹ ›<br />← → · MODE DIAL BELOW
            </div>
          </div>
        </RecessedWell>
      </div>
      <div style={{ padding: `${S.md}px ${S.xl}px ${S.lg}px`, borderTop: "1px solid #0E1016", position: "relative", zIndex: 5, flexShrink: 0 }}>
        <SectionSelect category={category} channelIndex={channelIndex} channelTotal={total} onCategoryChange={handleCategoryChange} />
      </div>
    </PerspectiveChassis>
  );
}

// ─── Tablet Layout ────────────────────────────────────────────────────────────

function TabletLayout({ category, channelIndex, flickering, total, goToChannel, handleCategoryChange, reducedMotion }: LayoutProps) {
  return (
    <div className="relative flex flex-col" style={{
      width: "100vw", height: "100dvh",
      background: "#0A0B0E", position: "relative", overflow: "hidden",
    }}>
      <div className="absolute inset-0 dot-grid pointer-events-none" style={{ zIndex: 0 }} />
      {!reducedMotion && <AmberGlitter density={8} />}
      <StatusBar category={category} channelIndex={channelIndex} total={total} compact />
      <div className="flex flex-1" style={{ gap: S.md, padding: S.md, paddingBottom: S.sm, position: "relative", zIndex: 5, minHeight: 0 }}>
        <div className="flex-1 min-w-0">
          <MainScreen category={category} channelIndex={channelIndex} flickering={flickering} fontSize={42} reducedMotion={reducedMotion} />
        </div>
        <div className="flex flex-col items-center justify-center" style={{
          width: 210, flexShrink: 0, gap: S.md,
          background: "linear-gradient(180deg, #0C0E14 0%, #08090E 100%)",
          border: "1px solid #1C1F27", borderRadius: 12, padding: S.md, position: "relative",
          boxShadow: "inset 0 2px 12px #000000aa",
        }}>
          <NoiseLayer opacity={0.03} />
          <div style={{ position: "relative", zIndex: 2 }}>
            <ChannelTuner channelIndex={channelIndex} total={total} onSelect={goToChannel} />
          </div>
        </div>
      </div>
      <div style={{ padding: `${S.sm}px ${S.md}px ${S.md}px`, borderTop: "1px solid #0E1016", position: "relative", zIndex: 5, flexShrink: 0 }}>
        <SectionSelect category={category} channelIndex={channelIndex} channelTotal={total} onCategoryChange={handleCategoryChange} />
      </div>
    </div>
  );
}

// ─── Mobile Layout ────────────────────────────────────────────────────────────

function MobileLayout({ category, channelIndex, flickering, total, goToChannel, handleCategoryChange, reducedMotion }: LayoutProps) {
  const [showProfile, setShowProfile] = useState(false);
  return (
    <div className="relative flex flex-col" style={{ width: "100vw", height: "100dvh", background: "#0A0B0E", overflow: "hidden" }}>
      <div className="absolute inset-0 dot-grid pointer-events-none" style={{ zIndex: 0 }} />

      <div style={{ display: "flex", alignItems: "center", height: 40, padding: "0 12px", borderBottom: "1px solid #1C1F27", background: "#0C0E13", flexShrink: 0, gap: 8, position: "relative", zIndex: 10 }}>
        <div style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 10, fontWeight: 700, color: "#3A3F50", letterSpacing: "0.3em" }}>RS-691</div>
        <div style={{ width: 1, height: 10, background: "#1C1F27" }} />
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#F59E0B", boxShadow: "0 0 6px #F59E0B" }} />
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#F59E0B", letterSpacing: "0.15em" }}>
          {CATEGORIES.find(c => c.id === category)?.shortLabel}
        </span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#3A3F50" }}>
          {String(channelIndex + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
        </span>
        <div style={{ flex: 1 }} />
        <motion.button
          type="button"
          onClick={() => setShowProfile(p => !p)}
          className="console-focus"
          style={{ border: "none", background: "none", padding: 4, cursor: "pointer", borderRadius: 6 }}
        >
          <User size={16} style={{ color: showProfile ? "#F59E0B" : "#3A3F50" }} />
        </motion.button>
        <LiveClock />
      </div>

      <AnimatePresence>
        {showProfile && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 240, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ overflow: "hidden", flexShrink: 0, position: "relative", zIndex: 8, borderBottom: "1px solid #1C1F27" }}
          >
            <ProfilePanel compact />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1" style={{ padding: S.sm, paddingBottom: S.xs, minHeight: 0, position: "relative", zIndex: 5 }}>
        <MainScreen category={category} channelIndex={channelIndex} flickering={flickering} fontSize={32} reducedMotion={reducedMotion} />
      </div>

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: `${S.sm}px ${S.md}px`, borderTop: "1px solid #0E1016",
        background: "linear-gradient(0deg, #08090E 0%, #0A0B0E 100%)",
        flexShrink: 0, position: "relative", zIndex: 5,
      }}>
        <ChannelTuner channelIndex={channelIndex} total={total} onSelect={goToChannel} horizontal />
      </div>

      <div style={{ padding: `${S.sm}px ${S.sm}px ${S.md}px`, borderTop: "1px solid #0E1016", flexShrink: 0, position: "relative", zIndex: 5 }}>
        <SectionSelect category={category} channelIndex={channelIndex} channelTotal={total} onCategoryChange={handleCategoryChange} compact />
      </div>
    </div>
  );
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
  const flickerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onBootDone = useCallback(() => setBooted(true), []);

  useEffect(() => {
    if (!booted) return;
    const t = setTimeout(() => setPowered(true), reducedMotion ? 0 : 80);
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
  };

  return (
    <>
      <BootSequence reducedMotion={reducedMotion} onDone={onBootDone} />
      <motion.div
        className="w-screen h-screen flex items-center justify-center"
        style={{ background: "#060709" }}
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
              <div className="dot-grid" style={{ background: "#060709", padding: 0 }}>
                <DesktopLayout {...layoutProps} />
              </div>
            )}
        </motion.div>
      </motion.div>
    </>
  );
}
