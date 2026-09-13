import { motion } from "framer-motion";
import { ExternalLink, Mail, Copy, Check, type LucideIcon } from "lucide-react";
import { useState } from "react";

export type ContentLink = {
  label: string;
  href: string;
  kind?: "external" | "mail" | "copy";
};

type ActionStripProps = {
  links?: ContentLink[];
  reducedMotion?: boolean;
};

export default function ActionStrip({ links = [], reducedMotion = false }: ActionStripProps) {
  const [copied, setCopied] = useState(false);

  if (links.length === 0) {
    return (
      <div
        style={{
          marginTop: 20,
          paddingTop: 16,
          borderTop: "1px solid #252B3A",
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <ActionKey
          label="COPY EMAIL"
          icon={copied ? Check : Mail}
          onClick={async () => {
            await navigator.clipboard.writeText("rms.dev@outlook.com");
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          }}
          active={copied}
        />
        <ActionKey
          label="GITHUB"
          icon={ExternalLink}
          href="https://github.com/rs691"
        />
        <ActionKey
          label="PORTFOLIO"
          icon={ExternalLink}
          href="https://robert-stewart.dev"
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.35 }}
      style={{
        marginTop: 20,
        paddingTop: 16,
        borderTop: "1px solid #252B3A",
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
      }}
    >
      {links.map((link) => {
        if (link.kind === "copy" || link.href.startsWith("copy:")) {
          const text = link.href.replace(/^copy:/, "");
          return (
            <ActionKey
              key={link.label}
              label={copied ? "COPIED" : link.label}
              icon={copied ? Check : Copy}
              active={copied}
              onClick={async () => {
                await navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 1600);
              }}
            />
          );
        }
        return (
          <ActionKey
            key={link.label}
            label={link.label}
            icon={link.kind === "mail" ? Mail : ExternalLink}
            href={link.href}
          />
        );
      })}
    </motion.div>
  );
}

function ActionKey({
  label,
  icon: Icon,
  href,
  onClick,
  active = false,
}: {
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  active?: boolean;
}) {
  const shared = {
    display: "inline-flex" as const,
    alignItems: "center" as const,
    gap: 8,
    padding: "8px 12px",
    borderRadius: 8,
    border: `1px solid ${active ? "#F5A00F66" : "#252B3A"}`,
    background: active
      ? "linear-gradient(165deg, #2A2418 0%, #1A1D24 100%)"
      : "linear-gradient(165deg, #1A1D24 0%, #12141A 100%)",
    boxShadow: active
      ? "inset 0 1px 0 #ffffff14, 0 0 16px #F5A00F22"
      : "inset 0 1px 0 #ffffff0c, 0 3px 0 #050607",
    color: active ? "#F5A00F" : "#C9954A",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    letterSpacing: "0.12em",
    textDecoration: "none" as const,
    cursor: "pointer",
  };

  if (href) {
    return (
      <motion.a
        href={href}
        target={href.startsWith("mailto:") || href.startsWith("tel:") ? undefined : "_blank"}
        rel="noopener noreferrer"
        whileTap={{ y: 2, scale: 0.98 }}
        className="console-focus"
        style={shared}
      >
        <Icon size={13} />
        {label}
      </motion.a>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ y: 2, scale: 0.98 }}
      className="console-focus"
      style={{ ...shared, border: shared.border }}
    >
      <Icon size={13} />
      {label}
    </motion.button>
  );
}
