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
    name: "afromessage-ts",
    tag: "Open Source",
    year: "2026",
    description:
      "Unofficial TypeScript SDK for the AfroMessage API. Abstracts SMS and OTP integrations into a modular client with granular typed error handling (auth, rate-limit, validation), configurable retry logic, and full type safety.",
    tech: ["TypeScript", "SDK", "SMS", "OTP"],
    github: "https://github.com/estifanosbereket1/afromessage-sdk-unofficial",
  },
  {
    name: "nestjs-afromessage",
    tag: "Open Source",
    year: "2026",
    description:
      "NestJS wrapper around afromessage-ts. Provides a fully injectable AfroMessageService with forRoot and forRootAsync support — works seamlessly with @nestjs/config for environment-driven setup.",
    tech: ["NestJS", "TypeScript", "DI", "SDK"],
    github: "https://github.com/estifanosbereket1/nestjs-afromessage",
  },
  {
    name: "DateOverlap",
    tag: "Personal",
    year: "2026",
    description:
      "Privacy-first Telegram bot using ArcFace facial embeddings and pgvector cosine distance to detect if women are dating the same person — with mutual consent before any info is shared. Photos deleted immediately after embedding extraction.",
    tech: ["FastAPI", "DeepFace", "pgvector", "PostgreSQL", "Docker"],
    github: "https://github.com/estifanosbereket1/dateoverlap",
  },
  {
    name: "Wardrobe AI",
    tag: "Personal",
    year: "2026",
    description:
      "Fully local FastAPI backend for an AI outfit suggester — no LLM API costs. Fashion-CLIP auto-tags clothing, OpenCV K-Means extracts dominant colors, and a custom rules engine scores outfit combos by weather, mood, and color harmony.",
    tech: ["FastAPI", "Fashion-CLIP", "OpenCV", "PostgreSQL", "Python"],
    github: "https://github.com/estifanosbereket1/wardrobe-ai",
  },
  {
    name: "goreactnative",
    tag: "Tool",
    year: "2025",
    description:
      "Fast portable Go CLI that automates React Native / Expo Android setup: prebuilds native folders, fixes gradle.properties, and manages Java alternatives — all embedded into a single binary via Go embed.",
    tech: ["Go", "CLI", "React Native", "Expo", "Android"],
    github: "https://github.com/estifanosbereket1/react_native_fixer",
  },
];

const skills = [
  { label: "Languages", items: ["TypeScript", "Python", "Go"] },
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

];

type ContribDay = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };
type ContribWeek = { days: ContribDay[] };

function getLevelColor(level: number): string {
  return (
    ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"][level] ?? "#161b22"
  );
}

function buildWeeks(days: ContribDay[]): ContribWeek[] {
  const weeks: ContribWeek[] = [];
  let week: ContribDay[] = [];
  const startPad = new Date(days[0]?.date ?? "").getDay();
  for (let i = 0; i < startPad; i++)
    week.push({ date: "", count: 0, level: 0 });
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
    const first = w.days.find((d) => d.date !== "");
    if (!first) return;
    const month = new Date(first.date).getMonth();
    if (month !== lastMonth) {
      labels.push({
        label: new Date(first.date).toLocaleString("default", {
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
    async function fetch_() {
      try {
        const res = await fetch(
          `https://github-contributions-api.jogruber.de/v4/${username}?y=last`,
        );
        if (!res.ok) throw new Error();
        const json = await res.json();
        const rawDays: ContribDay[] = json.contributions.map(
          (d: { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }) => ({
            date: d.date,
            count: d.count,
            level: d.level,
          }),
        );
        setTotal(
          json.total?.lastYear ??
            rawDays.reduce((s: number, d: ContribDay) => s + d.count, 0),
        );
        setWeeks(buildWeeks(rawDays));
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetch_();
  }, [username]);

  const CELL = 11,
    GAP = 3,
    cellStep = CELL + GAP;
  const monthLabels = getMonthLabels(weeks);

  if (loading)
    return (
      <div className="flex items-center gap-2 py-6 text-xs text-white/20">
        <span className="animate-pulse" style={{ color: ACCENT }}>
          ▋
        </span>
        <span>fetching contributions…</span>
      </div>
    );

  if (error)
    return (
      <p className="text-xs text-white/20 py-4">
        Could not load contribution data.
      </p>
    );

  return (
    <div className="relative">
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
      <div className="overflow-x-auto">
        <svg
          width={weeks.length * cellStep + 4}
          height={7 * cellStep + 22}
          style={{ display: "block" }}
        >
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
          <g transform="translate(0, 16)">
            {weeks.map((week, wi) =>
              week.days.map((day, di) =>
                !day.date ? null : (
                  <rect
                    key={day.date}
                    x={wi * cellStep}
                    y={di * cellStep}
                    width={CELL}
                    height={CELL}
                    rx={2}
                    fill={getLevelColor(day.level)}
                    style={{ cursor: "default" }}
                    onMouseEnter={(e) => {
                      const r = (
                        e.target as SVGRectElement
                      ).getBoundingClientRect();
                      setTooltip({
                        text: `${day.count} contribution${day.count !== 1 ? "s" : ""} · ${day.date}`,
                        x: r.left + r.width / 2,
                        y: r.top - 8,
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                ),
              ),
            )}
          </g>
        </svg>
      </div>
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
      <span className="text-[10px] tracking-[0.2em] uppercase text-white/40">
        ~/{label}
      </span>
    </div>
  );
}

const TAG_COLORS: Record<string, string> = {
  "Open Source": "#38bdf8",
  Tool: "#fb923c",
  Personal: ACCENT,
};

export default function Home() {
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("All");
  const [downloading, setDownloading] = useState(false);

  const tags = ["All", ...Array.from(new Set(projects.map((p) => p.tag)))];
  const filtered =
    filter === "All" ? projects : projects.filter((p) => p.tag === filter);

  function handleDownload() {
    setDownloading(true);
    const a = document.createElement("a");
    a.href = "/estifanos_bereket_cv.pdf";
    a.download = "Estifanos_Bereket_CV.pdf";
    a.click();
    setTimeout(() => setDownloading(false), 1800);
  }

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
          <div className="flex items-center gap-6 text-[10px] text-white/50 tracking-[0.15em] uppercase">
            <a href="#about" className="hover:text-white/80 transition-colors">
              home
            </a>
            <a href="#work" className="hover:text-white/80 transition-colors">
              work
            </a>
            <a
              href="#projects"
              className="hover:text-white/80 transition-colors"
            >
              projects
            </a>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-3 py-1.5 transition-all duration-200"
              style={{
                border: `1px solid ${ACCENT}40`,
                color: downloading ? ACCENT : "rgba(255,255,255,0.25)",
                background: downloading ? ACCENT + "10" : "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = ACCENT + "80";
                e.currentTarget.style.color = ACCENT;
                e.currentTarget.style.background = ACCENT + "10";
              }}
              onMouseLeave={(e) => {
                if (!downloading) {
                  e.currentTarget.style.borderColor = ACCENT + "40";
                  e.currentTarget.style.color = "rgba(255,255,255,0.25)";
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 13 13"
                fill="none"
                className={downloading ? "animate-bounce" : ""}
                style={{ color: "currentColor" }}
              >
                <path
                  d="M6.5 1v7M3.5 5.5l3 3 3-3M1.5 10h10"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {downloading ? "downloading…" : "cv"}
            </button>
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
          <p className="text-[14px] text-white/60 leading-[2] max-w-xl mb-10">
            I build reliable backend systems and cross-platform mobile apps.
            React Native, Flutter, NestJS, Next.js. From{" "}
            <span className="text-white/70">15,000-download apps</span> to ERP
            platforms with <span className="text-white/70">15+ modules</span> —
            I care about code that scales and ships.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
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
                      className="text-[11px] text-white/65 px-2 py-0.5"
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
                      className="flex gap-3 text-[13px] text-white/60 leading-relaxed"
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
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {tags.map((t) => {
              const active = filter === t;
              const color = t === "All" ? ACCENT : (TAG_COLORS[t] ?? ACCENT);
              return (
                <button
                  key={t}
                  onClick={() => {
                    setFilter(t);
                    setHoveredProject(null);
                  }}
                  className="text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 transition-all duration-150"
                  style={{
                    border: `1px solid ${active ? color + "50" : "rgba(255,255,255,0.08)"}`,
                    color: active ? color : "rgba(255,255,255,0.25)",
                    background: active ? color + "10" : "transparent",
                  }}
                >
                  {t}
                </button>
              );
            })}
            <span className="ml-auto text-[10px] text-white/15">
              {filtered.length} projects
            </span>
          </div>
          <div className="space-y-px">
            {filtered.map((p, i) => {
              const tagColor = TAG_COLORS[p.tag] ?? ACCENT;
              return (
                <div
                  key={p.name}
                  onMouseEnter={() => setHoveredProject(i)}
                  onMouseLeave={() => setHoveredProject(null)}
                  className="p-6 transition-all duration-300 cursor-default"
                  style={{
                    border: `1px solid ${hoveredProject === i ? tagColor + "30" : "rgba(255,255,255,0.06)"}`,
                    background:
                      hoveredProject === i ? tagColor + "06" : "transparent",
                  }}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-white font-semibold text-sm">
                        {p.name}
                      </h3>
                      <span
                        className="text-[9px] px-2 py-0.5 tracking-[0.15em] uppercase"
                        style={{
                          color: tagColor + "cc",
                          border: `1px solid ${tagColor}25`,
                        }}
                      >
                        {p.tag}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-[10px] text-white/20">
                        {p.year}
                      </span>
                      <a
                        href={p.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] tracking-[0.15em] uppercase flex items-center gap-1 transition-colors duration-150"
                        style={{ color: "rgba(255,255,255,0.2)" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = tagColor)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color =
                            "rgba(255,255,255,0.2)")
                        }
                      >
                        github ↗
                      </a>
                    </div>
                  </div>
                  <p className="text-[13px] text-white/60 leading-relaxed mb-4">
                    {p.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.tech.map((t) => (
                      <span
                        key={t}
                        className="text-[11px] text-white/45 px-2 py-0.5"
                        style={{ border: "1px solid rgba(255,255,255,0.07)" }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
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

        {/* ── CV Download ── */}
        <section className="mb-32">
          <SectionLabel index="05" label="resume" />
          <div
            className="p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            style={{
              border: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.015)",
            }}
          >
            {/* Left: info */}
            <div>
              <p className="text-white text-sm font-semibold mb-1">
                Estifanos Bereket — CV
              </p>
              <p className="text-[12px] text-white/50 mb-3">
                Full-Stack Engineer & Mobile Developer · PDF · Updated May 2026
              </p>
              <div className="flex flex-wrap gap-3 text-[10px] text-white/40">
                {["Experience", "Projects", "Skills", "Education"].map(
                  (item) => (
                    <span key={item} className="flex items-center gap-1.5">
                      <span style={{ color: ACCENT + "80" }}>✓</span> {item}
                    </span>
                  ),
                )}
              </div>
            </div>

            {/* Right: download button */}
            <button
              onClick={handleDownload}
              className="group relative flex items-center gap-3 px-6 py-3 text-[11px] tracking-[0.2em] uppercase font-semibold transition-all duration-200 shrink-0 overflow-hidden"
              style={{
                border: `1px solid ${ACCENT}50`,
                color: downloading ? ACCENT : "rgba(255,255,255,0.5)",
                background: downloading ? ACCENT + "15" : "transparent",
              }}
              onMouseEnter={(e) => {
                if (!downloading) {
                  e.currentTarget.style.background = ACCENT + "12";
                  e.currentTarget.style.color = ACCENT;
                  e.currentTarget.style.borderColor = ACCENT + "90";
                }
              }}
              onMouseLeave={(e) => {
                if (!downloading) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                  e.currentTarget.style.borderColor = ACCENT + "50";
                }
              }}
            >
              {/* Animated download icon */}
              <svg
                width="13"
                height="13"
                viewBox="0 0 13 13"
                fill="none"
                className={downloading ? "animate-bounce" : ""}
                style={{ color: ACCENT }}
              >
                <path
                  d="M6.5 1v7M3.5 5.5l3 3 3-3M1.5 10h10"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {downloading ? "downloading…" : "download cv"}
            </button>
          </div>
        </section>

        {/* ── Education ── */}
        <section className="mb-20">
          <SectionLabel index="06" label="education" />
          <div
            className="p-6 flex items-center justify-between"
            style={{ border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div>
              <h3 className="text-white text-sm font-semibold">
                Information Systems
              </h3>
              <p className="text-[12px] text-white/50 mt-1">
                B.Sc · Addis Ababa University
              </p>
            </div>
            <span className="text-[10px] text-white/20 tracking-widest">
              2022 — 2025
            </span>
          </div>
        </section>

        {/* Footer */}
        <div
          className="flex items-center justify-between pt-8"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <span className="text-[10px] text-white/35 tracking-widest">
            Addis Ababa · Ethiopia
          </span>
          <a
            href="mailto:estifanosbereket297@gmail.com"
            className="text-[10px] text-white/35 hover:text-white/60 transition-colors tracking-widest"
          >
            estifanosbereket297@gmail.com
          </a>
        </div>
      </div>
    </main>
  );
}
