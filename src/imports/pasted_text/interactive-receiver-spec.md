### SYSTEM ROLE & OBJECTIVE
You are an elite front-end creative developer specializing in skeuomorphic hardware interfaces, micro-interactions, SVG physics animations, and Next.js / Tailwind CSS v4.

Your task is to build an interactive skeuomorphic "Tactile Hardware Receiver / Telemetry Deck" web application. The design mimics an industrial cyber-physical diagnostic receiver with corner fasteners, frosted floating terminals, physical knurled encoders, and an animated human robotic/skeuomorphic hand that interacts with the dial to tune through different telemetry channels.

---

### TECH STACK & DEPENDENCIES
- Framework: Next.js (App Router, Client Component)
- Styling: Tailwind CSS v4 (using `@theme` variables for `#0D0E11` obsidian, `#181A20` titanium, `#272A34` borders, and `#F59E0B` phosphor amber)
- Animation Engine: `framer-motion` (for spring physics, SVG kinematics, keyframes, and AnimatePresence screen cross-fades)
- Icons: `lucide-react`
- Fonts: `JetBrains Mono` (telemetry/code) and `Chakra Petch` or `Plus Jakarta Sans` (hardware headers)

---

### CORE ARCHITECTURE & LAYOUT SPECIFICATION

1. INDUSTRIAL ENCLOSURE FRAME:
   - Outer Chassis: Full-viewport container centered around a 16:9 fixed-aspect or responsive deck with a deep obsidian hue (`#0A0B0E`), rounded 36px corners, 6px metallic beveled border (`#1C1F27`), and deep inset drop shadows.
   - Four Corner Fasteners: Hex screws in each corner with randomized rotational angles (-15°, 30°, 45°, 90°).
   - Backdrop Grid: Dot matrix / grid lines in low-opacity amber (`#F59E0B` at 8% opacity).
   - Active Bus Traces: Glowing SVG circuit lines running from the left module across the deck to the right viewport, terminating in glowing LED nodes.

2. BOTTOM HARDWARE CONTROL DECK (4 SECTION BUTTONS):
   Equidistantly spaced on the bottom hardware control bar are 4 heavy physical push buttons with bevel highlights and realistic click actuation (`whileTap={{ y: 2, scale: 0.97 }}`):
   - Button 1: [PROJECTS] (Icon: FolderGit2)
   - Button 2: [EXPERIENCE] (Icon: Cpu / Briefcase)
   - Button 3: [SKILLS & ARCH] (Icon: Terminal / Layers)
   - Button 4: [EDUCATION & HONORS] (Icon: GraduationCap / Award)
   *Action:* Clicking any button changes the active resume category. When changed, the right display screen smoothly cross-fades (`AnimatePresence mode="wait"`), and resets the sub-channel tuner to item 0.

3. THE INTERACTIVE ROTARY ENCODER & THE GUIDING HAND:
   - Placement: Positioned on the hardware receiver (e.g., top-left or bottom console).
   - The Hand Kinematics (Framer Motion SVG):
     * Entry Animation: On initial page load, a realistic vector/illustrated hand smoothly rises from below the bottom viewport (`y: 120%` -> `y: 0%`).
     * Tuning Idle Loop: The hand's thumb and forefinger grip the knurled dial. It performs a natural "hunting/fine-tuning" gesture: oscillating the dial back and forth slightly (e.g., `rotate: [-8°, 12°, -4°, 6°, 0°]`), as if searching for a clear radio frequency or resolving signal static.
     * User Interaction Takeover:
       - On Hover: The hand slightly relaxes its grip or transitions to a subtle indicator pose.
       - On User Click / Dial Scroll: The hand tracks the turn or retracts downward (`y: 100%`) allowing manual dial manipulation, or animates a continuous turn each time the user clicks the dial.
   - Dial Physical Behavior:
     * The knurled dial rotates on spring physics (`type: "spring", stiffness: 260, damping: 20`).
     * Each click or turn of the dial advances through the sub-items of the currently selected section (e.g., in "Projects", it steps from YourOpoly -> Multi-Product Admin -> Autonomous Commerce -> Django System -> Task Board API).
     * Turning the dial triggers a momentary CRT static flicker / signal scanline glitch before the new screen data stabilizes.

4. THE DISPLAY VIEWPORTS (STATIC LEFT & DYNAMIC RIGHT):

   [LEFT MODULE: FIXED SYSTEM IDENTITY PROFILE]
   - Window Title: `● SYSTEM PROFILE [PWR: ON]`
   - Header:
     * Name: `ROBERT STEWART`
     * Title: `Full-Stack Software Engineer`
     * Contact: `Council Bluffs, IA | 402-595-0211 | rms.dev@outlook.com`
     * Links: `github.com/rs691` | `linkedin.com/in/robert-stewart-m` | `robert-stewart.dev`
   - Code Block Display:
     ```typescript
     // Multi-tenant production isolation context
     export interface SystemContext {
       engineer: "Robert Stewart";
       currentRole: "NE Innovation Labs";
       degree: "M.S. Data Science (In Progress)";
       cloudCluster: "AWS ECS Fargate (1,000+ Concurrent)";
       orchestration: "Gemini API Multi-Agent Engine";
       isolationMode: "JWT_CLAIM_SCOPED_RLS";
     }
     ```
   - Primary Stack Badges: `Flutter`, `Node.js`, `Express`, `AWS ECS`, `Gemini API`, `MySQL`, `Redis`, `Next.js`.

   [RIGHT MODULE: DYNAMIC TUNED TELEMETRY SCREEN]
   The content in this viewport is reactive to both the Bottom 4 Buttons (Category) and the Rotary Dial (Item Index):

   CATEGORY 1: PROJECTS (Tuned via Dial)
     - Channel 01: "YourOpoly Platform" (Flutter, Node.js, MySQL, AWS ECS, Redis, Socket.io, Gemini API). Concurrency: 1,000+ regional users. Automated tenant onboarding (-35% setup time). QR check-ins, leaderboards, map discovery, and background Gemini player agent. Distribution: App Store & Google Play live.
     - Channel 02: "Multi-Product Admin Platform" (Node.js, React/Next.js, MySQL, AWS). Centralized console serving YourOpoly and Good Life Bingo. Strict RBAC separating privileged super-admin controls from tenant self-service with zero cross-tenant leakage.
     - Channel 03: "Autonomous E-Commerce Platform" (Next.js 15, Supabase, PostgreSQL, Stripe, Vercel AI SDK). Streaming AI copilot with pgvector RAG, server-side function calling, automated contract evals in CI, and Stripe webhook order persistence.
     - Channel 04: "Django Reservation System" (Django, HTMX, Python, SQLite). Transaction-safe scheduling conflict resolution and automated email workflows.
     - Channel 05: "Multi-Tenant Task Board API" (C#, ASP.NET Core, EF Core, SQLite, JWT, Azure). EF Core global query filters enforcing tenant data isolation at the ORM layer; automated GitHub Actions CI/CD to Azure.

   CATEGORY 2: EXPERIENCE (Tuned via Dial)
     - Channel 01: "NE Innovation Labs" | Full-Stack Software Engineer (Dec 2025 - Present). Architectural leadership of multi-tenant Flutter mobile apps, AWS ECS Fargate migrations, Genkit/Gemini AI workflows on Groq, and semantic CI/CD gates.
     - Channel 02: "Bellevue University" | CIS Peer Tutor (Dec 2023 - Apr 2026). Mentored 100+ students in Clean Code, Python, JavaScript, and TDD; created standard database rubrics.
     - Channel 03: "Pierson Wireless" | Junior Web Developer & IT Specialist (Oct 2022 - Nov 2023). Blazor / C# internal tools, 40% reduction in quoting time, JumpCloud directory automation, CrowdStrike security.

   CATEGORY 3: TECHNICAL SKILLS & ARCHITECTURE (Tuned via Dial)
     - Channel 01: Languages & Full-Stack (Python, Java, C#, Dart, TypeScript, JavaScript, SQL, React, Next.js, Flutter, HTMX, Tailwind CSS).
     - Channel 02: Backend & Distributed Data (Node.js, Express, Django, ASP.NET, Socket.io WebSockets, PostgreSQL, MySQL, Redis, Supabase, pgvector).
     - Channel 03: Cloud & AI Orchestration (AWS ECS/Lambda/RDS, Azure, Docker, GitHub Actions CI/CD, Gemini API, Multi-Agent Systems, LLM Tool Calling).

   CATEGORY 4: EDUCATION & HONORS (Consolidated)
     - Channel 01: Degrees (M.S. in Data Science - Bellevue University [Expected Jun 2028]; B.S. in Software Development - Bellevue University [Jun 2025]; A.A. in Computer Programming - Iowa Western [May 2023]).
     - Channel 02: Honors & Awards (Darrel H. Gottsch Endowed Scholarship, DREAM Scholarship, Dean's List, Omega Nu Lambda National Honor Society).

---

### ANIMATION & INTERACTION REQUIREMENTS
1. Mount Animation:
   - Deck powers on with a subtle phosphor glow flare.
   - Hand enters from bottom, hovers over the dial, and executes the fine-tuning hunting loop (`rotate: [-10deg, 14deg, -6deg, 8deg, 0deg]`).
2. Dial Rotation Physics:
   - Smooth rotational state synchronized with dial notches and amber LED tick indicators.
   - Tuning changes immediately emit a CRT flicker/scanline opacity shift on the right screen (`opacity: [0.3, 1], filter: ["blur(2px)", "blur(0px)"]`).
3. Button States:
   - Physical 3D keycap look: Gradient background, border highlights, inset shadows on press, and bright amber LED indicator dot above the active tab.

Ensure all code is strictly typed in TypeScript, zero external image assets are required (render all mechanical dials and hand kinematics with SVG/CSS/Framer Motion), and all resume content is faithfully represented without truncation.