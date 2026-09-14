import type { ContentLink } from "@/components/ActionStrip";

export type ContentEntry = {
  title: string;
  meta: string;
  tags: string[];
  /** 2–3 sentence overview */
  summary: string;
  /** Impact / outcome bullets */
  body: string[];
  /** Deeper technical / architecture lines */
  detail?: string[];
  links?: ContentLink[];
};

/** Vite-aware path for GitHub Pages base. */
export const RESUME_HREF = `${import.meta.env.BASE_URL}images/Resume.pdf`;

const resumeLink: ContentLink = { label: "RESUME", href: RESUME_HREF };

export const CONTENT: Record<string, ContentEntry[]> = {
  projects: [
    {
      title: "YourOpoly Platform",
      meta: "Production · Mobile · Multi-tenant",
      tags: ["Flutter", "Node.js", "MySQL", "AWS ECS", "Redis", "Socket.io", "Gemini API"],
      summary:
        "Community rewards platform connecting players with local businesses through QR/barcode check-ins, points, promotions, and leaderboards. Live on the App Store and Google Play as part of a multi-tenant production suite.",
      body: [
        "1,000+ concurrent regional users across live deployment",
        "Automated tenant onboarding pipeline — 35% reduction in setup time",
        "QR / barcode check-ins, rewards, promotions, and real-time leaderboards",
        "Map-based business discovery and location-driven gameplay",
        "Shipped to App Store & Google Play — live in production",
      ],
      detail: [
        "Background agent service tracks player activity and generates analytics",
        "Redis-backed caching keeps leaderboard and activity queries responsive under load",
        "Gemini multi-agent player intelligence running as a background engine",
        "Shared Flutter clients with JWT/OAuth across multiple backend services",
      ],
      links: [
        { label: "PORTFOLIO", href: "https://robert-stewart.dev" },
        { label: "GITHUB", href: "https://github.com/rs691" },
        resumeLink,
        { label: "COPY EMAIL", href: "copy:rms.dev@outlook.com", kind: "copy" },
      ],
    },
    {
      title: "Multi-Product Admin Platform",
      meta: "Internal Tool · RBAC · Centralized Console",
      tags: ["Node.js", "React", "Next.js", "MySQL", "AWS"],
      summary:
        "Centralized administrative console for managing game logic, permissions, configuration, and platform operations across multiple products — built so new titles integrate without a separate admin stack.",
      body: [
        "Shared admin tooling for YourOpoly and Good Life Bingo",
        "Layered RBAC separating privileged internal controls from tenant self-service",
        "Zero cross-tenant data leakage — verified by integration test suite",
        "Unified audit log and permission matrix across all tenants",
      ],
      detail: [
        "Organization-scoped role-based access across Google, Microsoft, and Apple OAuth clients",
        "Reusable platform surface for game logic, config, and platform-level operations",
        "Designed for additional products to plug in without forking administration",
      ],
      links: [
        { label: "GITHUB", href: "https://github.com/rs691" },
        resumeLink,
        { label: "COPY EMAIL", href: "copy:rms.dev@outlook.com", kind: "copy" },
      ],
    },
    {
      title: "Autonomous E-Commerce Platform",
      meta: "AI-Native · Streaming · Full-Stack",
      tags: ["Next.js 15", "Supabase", "PostgreSQL", "Stripe", "Vercel AI SDK"],
      summary:
        "Production-style Next.js 15 e-commerce demo with Supabase Auth, Postgres RLS, Stripe Checkout, and AI design/admin copilots that treat model output like any other tested code path.",
      body: [
        "Streaming AI copilots with pgvector RAG over the product catalog",
        "Server-side function calling pipeline with tool orchestration",
        "Automated contract evaluations running in CI on every push",
        "Stripe webhook order persistence with idempotency guarantees",
      ],
      detail: [
        "Supabase Auth + Postgres with RLS-backed data models",
        "Persistent cart for custom-configured and catalog products",
        "Vercel AI SDK + AI Gateway copilots gated behind CI contract evals",
      ],
      links: [
        { label: "GITHUB", href: "https://github.com/rs691" },
        { label: "SITE", href: "https://robert-stewart.dev" },
        resumeLink,
      ],
    },
    {
      title: "Django Reservation System",
      meta: "Backend · Scheduling · Transactional",
      tags: ["Django", "HTMX", "Python", "SQLite"],
      summary:
        "Booking application focused on correctness under concurrency — conflict resolution at the database layer, automated email workflows, and live slot availability without full page reloads.",
      body: [
        "Transaction-safe scheduling conflict resolution at the DB layer",
        "Automated email notification and reminder workflow engine",
        "HTMX-powered real-time slot availability without full reloads",
        "Admin dashboard with full conflict audit trail",
      ],
      detail: [
        "Conflict detection and booking invariants enforced transactionally",
        "Reminder pipeline keeps guests and operators in sync with schedule changes",
      ],
      links: [
        { label: "GITHUB", href: "https://github.com/rs691" },
        resumeLink,
      ],
    },
    {
      title: "Multi-Tenant Task Board API",
      meta: "API · Cloud · CI/CD · Security",
      tags: ["C#", "ASP.NET Core", "EF Core", "SQLite", "JWT", "Azure"],
      summary:
        "ASP.NET Core multi-tenant API exploring EF Core global query filters so tenant isolation lives at the ORM layer — with JWT claim scoping and Azure CI/CD.",
      body: [
        "EF Core global query filters enforce tenant isolation at ORM layer",
        "JWT claim-scoped RLS — zero cross-tenant data surface",
        "Automated GitHub Actions CI/CD pipeline deploying to Azure",
        "Fully documented OpenAPI surface with contract tests",
      ],
      detail: [
        "Isolation enforced in the data layer rather than scattered application checks",
        "GitHub Actions deploy path targeting Azure App Service",
      ],
      links: [
        { label: "GITHUB", href: "https://github.com/rs691" },
        resumeLink,
      ],
    },
  ],
  experience: [
    {
      title: "NE Innovation Labs",
      meta: "Full-Stack Software Engineer · Dec 2025 – Present · Omaha, NE",
      tags: ["Flutter", "AWS ECS", "Gemini", "Groq", "Socket.io", "CI/CD"],
      summary:
        "Design and operate multi-tenant production systems end to end — mobile clients, REST and real-time backends, admin tooling, CI/CD, and AWS infrastructure — with tenant isolation and AI features in live apps.",
      body: [
        "Architected shared Flutter iOS/Android apps with unified JWT/OAuth and deep-link QR workflows",
        "Multi-tenant Node.js/Express platform powering Chamberopoly, Bingo, and Game Builder",
        "Scaled to 1,000+ concurrent users; cut new-tenant setup time by 35%",
        "Genkit / Gemini workflows on Groq for player chatbot and admin digests",
        "Led multi-repo GitHub Actions with test gates to Play, TestFlight, and Docker",
      ],
      detail: [
        "Idempotent REST-authoritative real-time workflows (QR completion, blackout) with Socket.io push-after-commit",
        "Migrated Firebase prototypes to ECS Fargate, RDS MySQL, ElastiCache Redis, S3/CloudFront",
        "Docker Compose parity for local development against production architecture",
        "Firebase A/B testing with notifications and in-app messaging for engagement experiments",
        "AI-assisted engineering rails (Copilot, Cursor, Claude) with tests + human validation governing merges",
      ],
      links: [
        { label: "LINKEDIN", href: "https://www.linkedin.com/in/robert-stewart-m" },
        resumeLink,
        { label: "COPY EMAIL", href: "copy:rms.dev@outlook.com", kind: "copy" },
      ],
    },
    {
      title: "Bellevue University",
      meta: "CIS Peer Tutor · Dec 2023 – Apr 2026 · Bellevue, NE",
      tags: ["Python", "JavaScript", "Clean Code", "TDD", "SQL"],
      summary:
        "Mentored students across programming and systems courses with an emphasis on Clean Code, TDD, and database design — materials that scaled beyond one-on-one sessions.",
      body: [
      "In educational and mentorship settings, I guided more than 100 students through foundational software engineering principles, relational database design, Python, and JavaScript.",
      "Regular code reviews focused on Clean Code standards, test-driven development, and core system design fundamentals.",
      "Multiple CIS course sections adopted the structured review materials and database design rubrics I created.",
      ],
      detail: [
        "Curriculum support spanning intro programming through database design assessments",
        "Rubrics standardized evaluation quality across multiple course sections",
        "Detailed documentation for each tutoring session, including student progress, code examples, and key concepts covered.",
        "Learned to navigate complex technical concepts and effectively communicate them to students at different learning levels.",
        "Developed patience and empathy in guiding students through challenging technical topics.",
       ],
      links: [
        { label: "UNIVERSITY", href: "https://www.bellevue.edu" },
        resumeLink,
      ],
    },
    {
      title: "Pierson Wireless",
      meta: "Junior Web Developer / IT Support · Oct 2022 – Nov 2023 · Omaha, NE",
      tags: ["Blazor", "C#", "SQL Server", "Azure", "JumpCloud", "CrowdStrike"],
      summary:
        "Built internal .NET business apps and modernized IT operations — quoting tooling, CMS safety workflows, directory automation, and endpoint security.",
      body: [
        "For internal business operations, I developed enterprise applications using C#, Blazor, and SQL Server, deploying them continuously through Azure CI/CD pipelines.",
        "Manual quote generation workload dropped by 40% following the launch of a web-based cost estimation tool.",
        "The internal company CMS was expanded to integrate safety compliance forms, hazard reporting tools, and a centralized service desk ticketing system.",
        "Administrative overhead was reduced by 50% through automated user provisioning and directory synchronization with JumpCloud, alongside managing endpoint security using CrowdStrike Falcon.",
      ],
      detail: [
        "Integrated safety compliance forms, hazard reporting, and service desk into company CMS",
        "Directory sync and user lifecycle automation for onboarding / offboarding",
      ],
      links: [
        { label: "LINKEDIN", href: "https://www.linkedin.com/in/robert-stewart-m" },
        resumeLink,
      ],
    },
  ],
  skills: [
    {
      title: "Languages & Full-Stack",
      meta: "Frontend · Backend · Mobile",
      tags: ["TypeScript", "Python", "Java", "C#", "Dart", "SQL"],
      summary:
        "Comfortable across the stack — from Flutter and React clients to Node, Django, and ASP.NET services — with strong SQL and API design fundamentals.",
      body: [
        "Languages: TypeScript, JavaScript, Python, Java, C#, Dart, SQL, HTML/CSS",
        "Frontend: React, Next.js, Flutter, Vue.js, HTMX, Tailwind CSS",
        "REST API design · WebSocket protocols · accessible responsive UI",
      ],
      detail: [
        "Component architecture and mobile reuse patterns across shared Flutter clients",
        "Testing with Jest, React Testing Library, Flutter Test, and Postman",
      ],
      links: [
        { label: "GITHUB", href: "https://github.com/rs691" },
        resumeLink,
      ],
    },
    {
      title: "Backend & Distributed Data",
      meta: "Services · Databases · Real-time",
      tags: ["Node.js", "Express", "PostgreSQL", "Redis", "Supabase"],
      summary:
        "Event-driven backends and data layers built for multi-tenant isolation, caching, and concurrent real-time updates.",
      body: [
        "Node.js · Express · Django · ASP.NET Core",
        "Socket.io · event-driven architecture · push-after-commit consistency",
        "PostgreSQL · MySQL · Redis · SQLite · Supabase · pgvector",
      ],
      detail: [
        "EF Core / ORM-layer tenant isolation and query optimization",
        "Redis caching strategies for leaderboards and hot activity paths",
      ],
      links: [resumeLink],
    },
    {
      title: "Cloud & AI Orchestration",
      meta: "Infrastructure · AI · DevOps",
      tags: ["AWS", "Azure", "Docker", "Gemini API", "GitHub Actions"],
      summary:
        "Production cloud migrations and AI workflows — from ECS Fargate platforms to Gemini/Groq multi-agent features with CI gates.",
      body: [
        "AWS ECS / Lambda / RDS · Azure App Services · Docker · Vercel",
        "GitHub Actions CI/CD with automated test and deploy gates",
        "Gemini API · multi-agent orchestration · LLM tool calling · RAG",
      ],
      detail: [
        "Groq inference for low-latency chatbot and admin digest paths",
        "Contract evaluations treating AI output as tested production code",
      ],
      links: [
        { label: "GITHUB", href: "https://github.com/rs691" },
        resumeLink,
      ],
    },
  ],
  education: [
    {
      title: "Academic Degrees",
      meta: "Bellevue University · Iowa Western Community College",
      tags: ["M.S. Data Science", "B.S. Software Dev", "A.A. CS"],
      summary:
        "Progressive CS and data science path — from programming foundations through software development into an in-progress M.S. focused on systems thinking.",
      body: [
        "M.S. Data Science — Bellevue University (Expected Jun 2028)",
        "B.S. Software Development — Bellevue University (Jun 2025)",
        "A.A. Computer Programming — Iowa Western (May 2023)",
      ],
      detail: [
        "Dean's List recognition across programs",
        "Coursework spanning software engineering, databases, and data science foundations",
      ],
      links: [
        { label: "BELLEVUE U", href: "https://www.bellevue.edu" },
        resumeLink,
      ],
    },
    {
      title: "Honors & Scholarships",
      meta: "National Societies · Merit Awards",
      tags: ["Omega Nu Lambda", "Dean's List", "DREAM", "Gottsch"],
      summary:
        "Merit scholarships and national honor recognition alongside consistent academic performance.",
      body: [
        "Darrel H. Gottsch Endowed Scholarship recipient",
        "DREAM Scholarship — merit-based award",
        "Dean's List — multiple consecutive semesters",
        "Omega Nu Lambda National Honor Society member",
      ],
      links: [resumeLink],
    },
  ],
};
