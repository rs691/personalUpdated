# RS-691 — Personal Portfolio Console

Interactive hardware-console portfolio for **Robert Stewart** — amber/titanium CRT telemetry, rotary mode + channel dials, and scrollable résumé dossiers.

**Live:** [https://rs691.github.io/personalUpdated/](https://rs691.github.io/personalUpdated/)  
**Profile:** [github.com/rs691](https://github.com/rs691) · **Resume:** [PDF](https://rs691.github.io/personalUpdated/images/Resume.pdf)

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111827)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-222222?logo=github&logoColor=white)](https://github.com/rs691/personalUpdated/actions/workflows/deploy-pages.yml)
[![Build](https://github.com/rs691/personalUpdated/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/rs691/personalUpdated/actions/workflows/deploy-pages.yml)

## Stack

- React 19 + Vite 8 + TypeScript
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Motion via `framer-motion`
- Icons: `lucide-react`
- Package manager: `pnpm`

## Quick start

```bash
pnpm install
pnpm dev
```

Dev server defaults to [http://localhost:5173/personalUpdated/](http://localhost:5173/personalUpdated/) (`base: '/personalUpdated/'` for GitHub Pages).

```bash
pnpm build    # output → dist/
pnpm preview  # preview production build
pnpm format   # oxfmt
```

## How to use

| Control | Action |
| --- | --- |
| **MODE SELECT** (bottom dial + rim keys) | Switch section: Projects · Experience · Skills · Education |
| **TUNER DECK** (right dial / ‹ ›) | Step channels within the active section |
| **CRT feed** | Scroll for SUMMARY → IMPACT → DETAIL / ARCH |
| **Action strip** | Resume PDF, GitHub, email, and related links |
| **Keyboard** | `←` `→` change channel · `1`–`4` jump to section |

Bottom **OPERATOR GUIDE** LCD summarizes the same controls. On first visit it amber-pulses once after boot (`localStorage` key `rs691-guide-pulse`).

Desktop deck tilts slightly with the pointer; the CRT amber sheen responds subtly to that tilt. `prefers-reduced-motion` disables tilt, sheen, and decorative motion.

## Project layout

| Path | Role |
| --- | --- |
| `src/App.tsx` | Layouts (desktop / tablet / mobile), routing via hash `#section/channel` |
| `src/content.ts` | Dossier content (`summary` / `body` / `detail` / links) + `RESUME_HREF` |
| `src/components/TelemetryDossier.tsx` | CRT screen: sticky head, scroll progress, section reveals, summary decode |
| `src/components/SectionModeDial.tsx` | MODE SELECT · dial · OPERATOR GUIDE triad |
| `src/components/PerspectiveChassis.tsx` | Desktop chassis + pointer tilt context |
| `src/components/RotaryDial.tsx` / `ChannelGauge.tsx` | Channel / mode hardware controls |
| `src/components/ActionStrip.tsx` | CRT action keys (including Resume PDF) |
| `public/images/Resume.pdf` | Résumé asset (served under Vite `base`) |

## Deploy

GitHub Pages via [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml). Production URL uses `base: '/personalUpdated/'` in [`vite.config.ts`](vite.config.ts).

Push to `main` to rebuild and publish automatically.

## Notes

- Resume link: `${import.meta.env.BASE_URL}images/Resume.pdf` so it works on Pages and locally.
- Agent / scaffold conventions live in [`AGENTS.md`](AGENTS.md).
