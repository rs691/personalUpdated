import { palette } from "@/palette";

/** Shared raised keycap language — mode dial rim + tuner arrows. */
export const KEYCAP_SIZE = 48;
export const KEYCAP_SIZE_COMPACT = 44;

export const keycapFace = {
  borderRadius: 12,
  border: `1px solid ${palette.border}`,
  background: `linear-gradient(165deg, #1E222C 0%, ${palette.surface} 48%, #0E1015 100%)`,
  boxShadow: `inset 0 1px 0 #ffffff14, 0 4px 0 ${palette.amberDeep}44, 0 6px 12px #00000077`,
} as const;

export const keycapFaceActive = {
  border: `1px solid ${palette.amber}66`,
  background: `linear-gradient(165deg, #2A2418 0%, ${palette.surface} 48%, #12141A 100%)`,
  boxShadow: `inset 0 1px 0 #ffffff18, 0 3px 0 ${palette.amberDeep}, 0 0 18px ${palette.amber}33`,
} as const;

export const keycapHover = {
  color: palette.amber,
  borderColor: `${palette.amber}66`,
  background: `linear-gradient(165deg, #2A2418 0%, ${palette.surface} 48%, #12141A 100%)`,
  boxShadow: `inset 0 1px 0 #ffffff18, 0 4px 0 ${palette.amberDeep}88, 0 6px 12px #00000077, 0 0 14px ${palette.amber}44`,
} as const;

export const keycapTap = {
  y: 0.85,
  boxShadow: `inset 0 2px 6px #000000bb, 0 1px 0 ${palette.amberDeep}, 0 0 8px ${palette.amber}22`,
} as const;

export const keycapTransition = { type: "tween" as const, duration: 0.07 };
