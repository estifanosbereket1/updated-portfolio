"use client";

import { useState, useEffect } from "react";

const GITHUB_USERNAME = "estifanosbereket1";
const ACCENT = "#4ade80";

const projects = [
  {
    name: "EthioExchange",
    tag: "Personal",
    year: "2024",
    description:
      "Real-time currency rate aggregator pulling live exchange rates from multiple Ethiopian banks after the government shifted to a floating currency system. Resilient web scraper with scheduled polling, rate normalization, and a low-latency API.",
    tech: ["TypeScript", "Web Scraping", "REST API", "Scheduler"],
    github: "https://github.com/estifanosbereket1/ethioexchange",
  },
  {
    name: "Afromessage TS SDK",
    tag: "Open Source",
    year: "2024",
    description:
      "Open-source TypeScript SDK for AfroMessage that abstracts SMS and OTP integrations into a modular client with granular error handling, configurable retry logic, and full type safety — reducing boilerplate for Ethiopian developers.",
    tech: ["TypeScript", "SDK", "SMS/OTP", "Open Source"],
    github: "https://github.com/estifanosbereket1/afromessage-ts",
  },
  {
    name: "Aimvoice",
    tag: "Freelance",
    year: "2026",
    description:
      "Full-stack payment and invoice management app with Gemini AI integration and object storage for automated document verification and secure handling.",
    tech: ["React Native", "NestJS", "Next.js", "Gemini AI"],
    github: "https://github.com/estifanosbereket1/aimvoice",
  },
];

const skills = [
  { label: "Languages", items: ["TypeScript", "Python"] },
  { label: "Mobile", items: ["React Native", "Flutter", "Expo"] },
  { label: "Frontend", items: ["React", "Next.js"] },
  { label: "Backend", items: ["NestJS", "Express", "FastAPI", "Node.js"] },
  { label: "Data", items: ["PostgreSQL", "MongoDB", "Redis", "Supabase"] },
  { label: "Infra", items: ["Docker", "AWS", "Chapa"] },
];

const experience = [
  {
    role: "Full-Stack Engineer & Mobile Developer",
    company: "Buna Labs",
    period: "Jun 2023 – Present",
    bullets: [
      "Built two ERP solutions from scratch with 15+ core modules in NestJS — custom auth and role-based permission system.",
      "Nexa Tracker (Flutter) reached 15,000+ downloads on Play Store & App Store.",
      "Architected Vita Board — cross-platform app with realtime community challenges, finance tracking, and leaderboards (Flutter + Supabase).",
      "Built Bete Nebab's admin system for an Amharic English-learning app with 5,000+ active users, integrating Carthesia AI for text-to-speech.",
      "Integrated Chapa + local bank payment flows (CBE, Awash, Abyssinia) with real-time notifications.",
    ],
  },
  {
    role: "Full-Stack Engineer",
    company: "Freelance",
    period: "Feb 2026 – Present",
    bullets: [
      "Built Aimvoice — payment & invoice management using React Native, NestJS, and Next.js with Gemini AI and object storage.",
    ],
  },
];

// ─── Types ───────────────────────────────────────────────────────────────────

type ContribDay = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };
type ContribWeek = { days: ContribDay[] };

// ─── GitHub Contribution Graph ────────────────────────────────────────────────

function getLevelColor(level: number): string {
  // matches GitHub's dark-mode greens
  const colors = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"];
  return colors[level] ?? colors[0];
}

function buildWeeks(days: ContribDay[]): ContribWeek[] {
  const weeks: ContribWeek[] = [];
  let week: ContribDay[] = [];

  // pad start so first day lands on correct weekday (Sun=0)
  const firstDay = new Date(days[0]?.date ?? "");
  const startPad = firstDay.getDay(); // 0=Sun
  for (let i = 0; i < startPad; i++) {
    week.push({ date: "", count: 0, level: 0 });
  }

  for (const day of days) {
    week.push(day);
    if (week.length === 7) {
      weeks.push({ days: week });
      week = [];
    }
  }
  if (week.length) weeks.push({ days: week });
  return weeks;
}

function getMonthLabels(
  weeks: ContribWeek[],
): { label: string; col: number }[] {
  const labels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((w, col) => {
    const firstRealDay = w.days.find((d) => d.date !== "");
    if (!firstRealDay) return;
    const month = new Date(firstRealDay.date).getMonth();
    if (month !== lastMonth) {
      labels.push({
        label: new Date(firstRealDay.date).toLocaleString("default", {
          month: "short",
        }),
        col,
      });
      lastMonth = month;
    }
  });
  return labels;
}

function ContributionGraph({ username }: { username: string }) {
  const [weeks, setWeeks] = useState<ContribWeek[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    async function fetchContribs() {
      try {
        // Use a CORS-friendly proxy that reads GitHub's SVG contribution graph
        // and returns structured JSON
        const res = await fetch(
          `https://github-contributions-api.jogruber.de/v4/${username}?y=last`,
        );
        if (!res.ok) throw new Error("fetch failed");
        const json = await res.json();

        // The API returns { total: { lastYear: N }, contributions: [{date, count, level}] }
        const rawDays: ContribDay[] = (
          json.contributions as Array<{
            date: string;
            count: number;
            level: 0 | 1 | 2 | 3 | 4;
          }>
        ).map((d) => ({
          date: d.date,
          count: d.count,
          level: d.level,
        }));

        setTotal(
          json.total?.lastYear ?? rawDays.reduce((s, d) => s + d.count, 0),
        );
        setWeeks(buildWeeks(rawDays));
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchContribs();
  }, [username]);

  const CELL = 11;
  const GAP = 3;
  const ROWS = 7;
  const cellStep = CELL + GAP;

  const monthLabels = getMonthLabels(weeks);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-6 text-xs text-white/20">
        <span className="animate-pulse" style={{ color: ACCENT }}>
          ▋
        </span>
        <span>fetching contributions…</span>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-xs text-white/20 py-4">
        Could not load contribution data. Check back later.
      </p>
    );
  }

  const svgWidth = weeks.length * cellStep;
  const svgHeight = ROWS * cellStep;

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-baseline gap-3 mb-5">
        <span className="text-white text-sm font-semibold">
          {total.toLocaleString()} contributions
        </span>
        <span className="text-xs text-white/25">in the last year</span>
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-[10px] tracking-[0.15em] uppercase flex items-center gap-1 transition-colors"
          style={{ color: "rgba(255,255,255,0.2)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = ACCENT)}
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "rgba(255,255,255,0.2)")
          }
        >
          @{username} ↗
        </a>
      </div>

      {/* Graph */}
      <div className="overflow-x-auto">
        <svg
          width={svgWidth + 4}
          height={svgHeight + 22}
          style={{ display: "block" }}
        >
          {/* Month labels */}
          {monthLabels.map(({ label, col }) => (
            <text
              key={label + col}
              x={col * cellStep + 2}
              y={10}
              fontSize={9}
              fill="rgba(255,255,255,0.25)"
              fontFamily="monospace"
            >
              {label}
            </text>
          ))}

          {/* Cells */}
          <g transform="translate(0, 16)">
            {weeks.map((week, wi) =>
              week.days.map((day, di) => {
                if (!day.date) return null;
                return (
                  <rect
                    key={day.date}
                    x={wi * cellStep}
                    y={di * cellStep}
                    width={CELL}
                    height={CELL}
                    rx={2}
                    fill={getLevelColor(day.level)}
                    style={{ cursor: "default", transition: "fill 0.1s" }}
                    onMouseEnter={(e) => {
                      const rect = (
                        e.target as SVGRectElement
                      ).getBoundingClientRect();
                      setTooltip({
                        text: `${day.count} contribution${day.count !== 1 ? "s" : ""} · ${day.date}`,
                        x: rect.left + rect.width / 2,
                        y: rect.top - 8,
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              }),
            )}
          </g>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-3">
        <span className="text-[10px] text-white/20 mr-1">Less</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <div
            key={l}
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: getLevelColor(l),
            }}
          />
        ))}
        <span className="text-[10px] text-white/20 ml-1">More</span>
      </div>

      {/* Tooltip — rendered via portal-like fixed div */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none px-2.5 py-1.5 text-[11px] text-white rounded"
          style={{
            background: "#1a1a1a",
            border: "1px solid rgba(255,255,255,0.1)",
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%)",
            whiteSpace: "nowrap",
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionLabel({ index, label }: { index: string; label: string }) {
  return (
    <div className="flex items-center gap-4 mb-7">
      <span
        className="text-[10px] tracking-[0.2em]"
        style={{ color: ACCENT + "70" }}
      >
        {index}
      </span>
      <div
        className="h-px flex-1"
        style={{ background: "rgba(255,255,255,0.06)" }}
      />
      <span className="text-[10px] tracking-[0.2em] uppercase text-white/20">
        ~/{label}
      </span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);

  return (
    <main
      className="min-h-screen bg-[#090909] text-[#b8b8b8]"
      style={{
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
      }}
    >
      {/* Grid texture */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
        }}
      />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.05] bg-[#090909]/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-6 h-6 flex items-center justify-center text-[10px] font-bold"
              style={{ border: `1px solid ${ACCENT}40`, color: ACCENT }}
            >
              EB
            </div>
            <span className="text-[10px] text-white/20 tracking-[0.2em] uppercase">
              estifanos
            </span>
          </div>
          <div className="flex items-center gap-6 text-[10px] text-white/25 tracking-[0.15em] uppercase">
            <a href="#about" className="hover:text-white/60 transition-colors">
              home
            </a>
            <a href="#work" className="hover:text-white/60 transition-colors">
              work
            </a>
            <a
              href="#projects"
              className="hover:text-white/60 transition-colors"
            >
              projects
            </a>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-4xl mx-auto px-8 pt-28 pb-24">
        {/* ── Hero ── */}
        <section id="about" className="mb-32">
          <div className="flex items-center gap-2 mb-8">
            <span style={{ color: ACCENT }} className="text-xs">
              ▶
            </span>
            <span className="text-[10px] text-white/20 tracking-[0.25em]">
              whoami
            </span>
          </div>

          <h1 className="text-[72px] font-bold leading-none tracking-tighter mb-1 text-white">
            Estifanos
          </h1>
          <h1
            className="text-[72px] font-bold leading-none tracking-tighter mb-8"
            style={{ color: ACCENT }}
          >
            Bereket_
          </h1>

          <div className="flex items-center gap-4 mb-7">
            <div className="h-px w-6" style={{ background: ACCENT + "60" }} />
            <p className="text-[10px] text-white/30 tracking-[0.25em] uppercase">
              Full-Stack Engineer · Mobile Developer · Addis Ababa
            </p>
          </div>

          <p className="text-[14px] text-white/45 leading-[2] max-w-xl mb-10">
            I build reliable backend systems and cross-platform mobile apps.
            React Native, Flutter, NestJS, Next.js. From{" "}
            <span className="text-white/70">15,000-download apps</span> to ERP
            platforms with <span className="text-white/70">15+ modules</span> —
            I care about code that scales and ships.
          </p>

          <div className="flex items-center gap-3">
            {[
              {
                label: "github",
                href: `https://github.com/${GITHUB_USERNAME}`,
              },
              { label: "email", href: "mailto:estifanosbereket297@gmail.com" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-5 py-2.5 text-[10px] tracking-[0.2em] uppercase transition-all duration-200"
                style={{
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.4)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = ACCENT + "60";
                  e.currentTarget.style.color = ACCENT;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.4)";
                }}
              >
                {label}{" "}
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                  ↗
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* ── Skills ── */}
        <section className="mb-32">
          <SectionLabel index="01" label="skills" />
          <div
            className="grid grid-cols-2 md:grid-cols-3 border"
            style={{
              borderColor: "rgba(255,255,255,0.06)",
              gap: "1px",
              background: "rgba(255,255,255,0.06)",
            }}
          >
            {skills.map(({ label, items }) => (
              <div key={label} className="bg-[#090909] p-5">
                <p
                  className="text-[9px] tracking-[0.25em] uppercase mb-3"
                  style={{ color: ACCENT + "80" }}
                >
                  {label}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((item) => (
                    <span
                      key={item}
                      className="text-[11px] text-white/50 px-2 py-0.5"
                      style={{ background: "rgba(255,255,255,0.04)" }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Experience ── */}
        <section id="work" className="mb-32">
          <SectionLabel index="02" label="experience" />
          <div className="space-y-px">
            {experience.map((job, i) => (
              <div
                key={i}
                className="p-6"
                style={{ border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <h3 className="text-white text-sm font-semibold">
                      {job.role}
                    </h3>
                    <span className="text-xs" style={{ color: ACCENT }}>
                      @ {job.company}
                    </span>
                  </div>
                  <span className="text-[10px] text-white/20 tracking-widest shrink-0 mt-0.5">
                    {job.period}
                  </span>
                </div>
                <ul className="space-y-3">
                  {job.bullets.map((b, j) => (
                    <li
                      key={j}
                      className="flex gap-3 text-[13px] text-white/40 leading-relaxed"
                    >
                      <span
                        className="shrink-0"
                        style={{ color: ACCENT + "50" }}
                      >
                        —
                      </span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── Projects ── */}
        <section id="projects" className="mb-32">
          <SectionLabel index="03" label="projects" />
          <div className="space-y-px">
            {projects.map((p, i) => (
              <div
                key={i}
                onMouseEnter={() => setHoveredProject(i)}
                onMouseLeave={() => setHoveredProject(null)}
                className="p-6 transition-all duration-300 cursor-default"
                style={{
                  border: `1px solid ${hoveredProject === i ? ACCENT + "30" : "rgba(255,255,255,0.06)"}`,
                  background:
                    hoveredProject === i ? ACCENT + "06" : "transparent",
                }}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-white font-semibold text-sm">
                      {p.name}
                    </h3>
                    <span
                      className="text-[9px] px-2 py-0.5 tracking-[0.15em] uppercase"
                      style={{
                        color: ACCENT + "cc",
                        border: `1px solid ${ACCENT}25`,
                      }}
                    >
                      {p.tag}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-[10px] text-white/20">{p.year}</span>
                    <a
                      href={p.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[10px] tracking-[0.15em] uppercase flex items-center gap-1 transition-colors duration-150"
                      style={{ color: "rgba(255,255,255,0.2)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = ACCENT)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "rgba(255,255,255,0.2)")
                      }
                    >
                      github ↗
                    </a>
                  </div>
                </div>
                <p className="text-[13px] text-white/40 leading-relaxed mb-4">
                  {p.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {p.tech.map((t) => (
                    <span
                      key={t}
                      className="text-[11px] text-white/25 px-2 py-0.5"
                      style={{ border: "1px solid rgba(255,255,255,0.07)" }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── GitHub Activity ── */}
        <section className="mb-32">
          <SectionLabel index="04" label="activity" />
          <div
            className="p-6"
            style={{ border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <ContributionGraph username={GITHUB_USERNAME} />
          </div>
        </section>

        {/* ── Education ── */}
        <section className="mb-20">
          <SectionLabel index="05" label="education" />
          <div
            className="p-6 flex items-center justify-between"
            style={{ border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div>
              <h3 className="text-white text-sm font-semibold">
                Software Engineering
              </h3>
              <p className="text-[12px] text-white/30 mt-1">
                B.Sc · In Progress
              </p>
            </div>
            <span className="text-[10px] text-white/20 tracking-widest">
              2022 — 2027
            </span>
          </div>
        </section>

        {/* Footer */}
        <div
          className="flex items-center justify-between pt-8"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <span className="text-[10px] text-white/15 tracking-widest">
            Addis Ababa · Ethiopia
          </span>
          <a
            href="mailto:estifanosbereket297@gmail.com"
            className="text-[10px] text-white/15 hover:text-white/40 transition-colors tracking-widest"
          >
            estifanosbereket297@gmail.com
          </a>
        </div>
      </div>
    </main>
  );
}
