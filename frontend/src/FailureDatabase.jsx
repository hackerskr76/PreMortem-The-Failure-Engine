import React, { useState, useMemo } from "react";
import { Search, Plus, X, ChevronDown, CheckCircle2 } from "lucide-react";

// ---- Design tokens (kept outside Tailwind's default palette on purpose) ----
const C = {
  ink: "#131D2B",        // page background — deep archive-room navy
  blueprint: "#2A4A63",  // grid lines / dividers
  paper: "#E7DEC4",      // card surface — manila folder paper
  paperDark: "#D9C9A0",  // folder tab / chip surface
  stamp: "#9C3B2E",      // rubber-stamp ink red
  cyan: "#6FB3D1",       // blueprint highlight / links / focus
  textInk: "#1B2430",    // text on paper
  textLight: "#DCE3EC",  // text on navy
};

const DOMAINS = [
  "Startup",
  "Hardware",
  "ML / AI",
  "Marketing",
  "Personal Project",
  "Career",
  "Open Source",
  "Finance",
];

const SEED_FAILURES = [
  {
    id: 1,
    case: "FDB-1001",
    domain: "Startup",
    title: "Hyperlocal grocery app, 6 cities in 3 months",
    snippet:
      "Scaled delivery logistics before unit economics worked in even one city. Burned 9 months of runway chasing city count instead of margin.",
    lessons:
      "Prove the unit economics in one market before you copy-paste it elsewhere. Growth hides broken math, it doesn't fix it.",
    date: "Mar 2024",
  },
  {
    id: 2,
    case: "FDB-1002",
    domain: "ML / AI",
    title: "Resume screening classifier for a hiring startup",
    snippet:
      "Trained on 5 years of internal hiring data. The model quietly learned the company's historical bias and amplified it at scale.",
    lessons:
      "Audit training data for who it excluded, not just who it included. A clean accuracy score can still be an unfair model.",
    date: "Nov 2023",
  },
  {
    id: 3,
    case: "FDB-1003",
    domain: "Hardware",
    title: "DIY weather station, custom PCB v1",
    snippet:
      "Skipped a proper ground plane to save board space. Sensor readings drifted by 4°C whenever the Wi-Fi module transmitted.",
    lessons:
      "Routing shortcuts on a PCB always show up later as 'mystery' noise. Budget the extra layer up front, it's cheaper than v2.",
    date: "Jan 2024",
  },
  {
    id: 4,
    case: "FDB-1004",
    domain: "Marketing",
    title: "College fest Instagram reel campaign",
    snippet:
      "Posted 40 reels in two weeks chasing reach. Engagement per follower actually dropped, the algorithm read it as spam-like behavior.",
    lessons:
      "Frequency without a content angle just trains the algorithm to ignore you. One sharp idea beats ten rushed ones.",
    date: "Sep 2023",
  },
  {
    id: 5,
    case: "FDB-1005",
    domain: "Personal Project",
    title: "Habit tracker side project, abandoned at week 9",
    snippet:
      "Added cloud sync, social streaks, and a leaderboard before the core tracking flow even felt good to use daily.",
    lessons:
      "Make the one core loop addictive first. Every feature you add before that is procrastination dressed as productivity.",
    date: "Jun 2024",
  },
  {
    id: 6,
    case: "FDB-1006",
    domain: "Career",
    title: "Switched majors twice chasing 'placement trends'",
    snippet:
      "Picked a specialization based on a LinkedIn trend post, not on any actual coursework I'd done or enjoyed.",
    lessons:
      "Trends are a snapshot of last year's hiring, not a guarantee of next year's. Pick depth in something you'll actually finish.",
    date: "Aug 2023",
  },
  {
    id: 7,
    case: "FDB-1007",
    domain: "Open Source",
    title: "First PR to a 10k-star repo, closed without review",
    snippet:
      "Refactored 14 files to 'clean up' the codebase in one PR, with no issue filed and no discussion with maintainers first.",
    lessons:
      "Small, discussed, single-purpose PRs get merged. Large unsolicited ones get closed, no matter how correct the code is.",
    date: "Feb 2024",
  },
  {
    id: 8,
    case: "FDB-1008",
    domain: "Finance",
    title: "First SIP, paused after one red month",
    snippet:
      "Stopped a monthly investment after a single 6% dip, then re-entered three months later at a higher price.",
    lessons:
      "Reacting to one month of volatility usually costs more than the volatility itself. Decide your exit rule before you start, not during the dip.",
    date: "Dec 2023",
  },
  {
    id: 9,
    case: "FDB-1009",
    domain: "ML / AI",
    title: "Research paper submission, rejected pre-review",
    snippet:
      "Submitted to a venue without checking scope or formatting requirements closely. Desk-rejected in 48 hours, no reviewer comments.",
    lessons:
      "Read five accepted papers from the exact venue before writing a word. Desk rejection wastes a cycle you can't get back.",
    date: "Apr 2024",
  },
];

function DomainTag({ domain }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-[10px] font-semibold uppercase tracking-wider"
      style={{ backgroundColor: C.paperDark, color: C.textInk, fontFamily: "'IBM Plex Mono', monospace" }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: C.cyan }} />
      {domain}
    </span>
  );
}

function FailureCard({ failure }) {
  const tilt = failure.id % 2 === 0 ? "-0.5deg" : "0.6deg";
  return (
    <article
      className="group relative rounded-sm p-5 shadow-md transition-transform duration-200 hover:rotate-0 hover:shadow-xl"
      style={{
        backgroundColor: C.paper,
        borderTop: `4px solid ${C.blueprint}`,
        transform: `rotate(${tilt})`,
      }}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <DomainTag domain={failure.domain} />
        <span
          className="text-[10px] tracking-wider opacity-60"
          style={{ color: C.textInk, fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {failure.case}
        </span>
      </div>

      <h3
        className="mb-2 text-lg font-bold leading-snug"
        style={{ color: C.textInk, fontFamily: "'Zilla Slab', serif" }}
      >
        {failure.title}
      </h3>

      <p className="mb-6 text-sm leading-relaxed opacity-80" style={{ color: C.textInk }}>
        {failure.snippet}
      </p>

      <div className="flex items-end justify-between">
        <span
          className="text-[10px] tracking-wider opacity-50"
          style={{ color: C.textInk, fontFamily: "'IBM Plex Mono', monospace" }}
        >
          FILED {failure.date}
        </span>

        <div
          className="-rotate-6 select-none rounded-sm border-2 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest opacity-90"
          style={{ borderColor: C.stamp, color: C.stamp }}
          title={failure.lessons}
        >
          <span className="flex items-center gap-1">
            <CheckCircle2 size={11} strokeWidth={2.5} />
            Lessons Learned
          </span>
        </div>
      </div>

      {/* Lessons text revealed on hover, anchored under the stamp */}
      <div
        className="pointer-events-none absolute inset-x-5 bottom-0 translate-y-2 rounded-sm p-3 text-xs leading-relaxed opacity-0 shadow-lg transition-all duration-200 group-hover:translate-y-[calc(100%+8px)] group-hover:opacity-100"
        style={{ backgroundColor: C.ink, color: C.textLight }}
      >
        {failure.lessons}
      </div>
    </article>
  );
}

function ReportFailureModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    title: "",
    domain: DOMAINS[0],
    whatHappened: "",
    lessons: "",
  });

  if (!open) return null;

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setForm({ title: "", domain: DOMAINS[0], whatHappened: "", lessons: "" });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(19,29,43,0.75)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-sm p-6 shadow-2xl sm:p-8"
        style={{ backgroundColor: C.paper, borderTop: `5px solid ${C.stamp}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p
              className="text-[10px] uppercase tracking-widest opacity-60"
              style={{ color: C.textInk, fontFamily: "'IBM Plex Mono', monospace" }}
            >
              New Case File · FDB-PENDING
            </p>
            <h2
              className="mt-1 text-xl font-bold"
              style={{ color: C.textInk, fontFamily: "'Zilla Slab', serif" }}
            >
              Report a Failure
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-sm p-1 opacity-60 transition hover:opacity-100 focus-visible:outline focus-visible:outline-2"
            style={{ color: C.textInk, outlineColor: C.cyan }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="mb-1 block text-xs font-semibold uppercase tracking-wide"
              style={{ color: C.textInk, fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Project title
            </label>
            <input
              required
              value={form.title}
              onChange={update("title")}
              placeholder="e.g. Weekend SaaS launch on Product Hunt"
              className="w-full rounded-sm border px-3 py-2 text-sm outline-none transition focus:ring-2"
              style={{ borderColor: C.paperDark, backgroundColor: "#fff", color: C.textInk }}
            />
          </div>

          <div>
            <label
              className="mb-1 block text-xs font-semibold uppercase tracking-wide"
              style={{ color: C.textInk, fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Domain
            </label>
            <select
              value={form.domain}
              onChange={update("domain")}
              className="w-full rounded-sm border px-3 py-2 text-sm outline-none"
              style={{ borderColor: C.paperDark, backgroundColor: "#fff", color: C.textInk }}
            >
              {DOMAINS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="mb-1 block text-xs font-semibold uppercase tracking-wide"
              style={{ color: C.textInk, fontFamily: "'IBM Plex Mono', monospace" }}
            >
              What happened, and why did it fail?
            </label>
            <textarea
              required
              rows={3}
              value={form.whatHappened}
              onChange={update("whatHappened")}
              placeholder="Be specific about the decision that backfired, not just the outcome."
              className="w-full resize-none rounded-sm border px-3 py-2 text-sm outline-none"
              style={{ borderColor: C.paperDark, backgroundColor: "#fff", color: C.textInk }}
            />
          </div>

          <div>
            <label
              className="mb-1 block text-xs font-semibold uppercase tracking-wide"
              style={{ color: C.textInk, fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Lessons learned
            </label>
            <textarea
              required
              rows={2}
              value={form.lessons}
              onChange={update("lessons")}
              placeholder="What would you tell someone about to make the same call?"
              className="w-full resize-none rounded-sm border px-3 py-2 text-sm outline-none"
              style={{ borderColor: C.paperDark, backgroundColor: "#fff", color: C.textInk }}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-sm px-4 py-2 text-sm font-semibold opacity-70 transition hover:opacity-100"
              style={{ color: C.textInk }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-sm px-4 py-2 text-sm font-bold uppercase tracking-wide text-white transition hover:brightness-110 focus-visible:outline focus-visible:outline-2"
              style={{ backgroundColor: C.stamp, outlineColor: C.cyan }}
            >
              Stamp &amp; file report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function FailureDatabase() {
  const [query, setQuery] = useState("");
  const [domainFilter, setDomainFilter] = useState("All domains");
  const [modalOpen, setModalOpen] = useState(false);
  const [failures, setFailures] = useState(SEED_FAILURES);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return failures.filter((f) => {
      const matchesDomain = domainFilter === "All domains" || f.domain === domainFilter;
      const matchesQuery =
        !q ||
        f.title.toLowerCase().includes(q) ||
        f.snippet.toLowerCase().includes(q) ||
        f.domain.toLowerCase().includes(q) ||
        f.lessons.toLowerCase().includes(q);
      return matchesDomain && matchesQuery;
    });
  }, [query, domainFilter, failures]);

  const handleNewFailure = (form) => {
    const newCase = {
      id: Date.now(),
      case: `FDB-${1009 + failures.length + 1}`,
      domain: form.domain,
      title: form.title,
      snippet: form.whatHappened,
      lessons: form.lessons,
      date: "Just now",
    };
    setFailures((prev) => [newCase, ...prev]);
    setModalOpen(false);
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }} className="min-h-screen">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@500;700&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap');
        input:focus, textarea:focus, select:focus { box-shadow: 0 0 0 2px ${C.cyan}; border-color: ${C.cyan}; }
      `}</style>

      {/* Top bar */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between gap-3 px-4 py-3 sm:px-8"
        style={{ backgroundColor: C.ink, borderBottom: `1px solid ${C.blueprint}` }}
      >
        <span
          className="text-sm font-semibold uppercase tracking-[0.2em]"
          style={{ color: C.textLight, fontFamily: "'IBM Plex Mono', monospace" }}
        >
          Failure<span style={{ color: C.cyan }}>/</span>DB
        </span>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white transition hover:brightness-110 focus-visible:outline focus-visible:outline-2"
          style={{ backgroundColor: C.stamp, outlineColor: C.cyan }}
        >
          <Plus size={14} strokeWidth={3} />
          Report a Failure
        </button>
      </header>

      {/* Hero / search */}
      <section
        className="px-4 py-14 sm:px-8 sm:py-20"
        style={{
          backgroundColor: C.ink,
          backgroundImage: `linear-gradient(${C.blueprint}33 1px, transparent 1px), linear-gradient(90deg, ${C.blueprint}33 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      >
        <div className="mx-auto max-w-2xl text-center">
          <p
            className="mb-3 text-xs uppercase tracking-[0.25em] opacity-70"
            style={{ color: C.cyan, fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {failures.length} documented cases · open archive
          </p>
          <h1
            className="mb-8 text-3xl font-bold leading-tight sm:text-4xl"
            style={{ color: C.textLight, fontFamily: "'Zilla Slab', serif" }}
          >
            Before you build it, see who already broke it.
          </h1>

          <div
            className="flex items-center gap-2 rounded-sm p-1.5 shadow-lg"
            style={{ backgroundColor: C.paper }}
          >
            <Search size={20} className="ml-2 shrink-0" style={{ color: C.textInk, opacity: 0.5 }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search past failures before you start..."
              className="w-full bg-transparent py-2 text-sm outline-none sm:text-base"
              style={{ color: C.textInk }}
            />
            <button
              className="shrink-0 rounded-sm px-4 py-2 text-xs font-bold uppercase tracking-wide transition hover:brightness-110 sm:text-sm"
              style={{ backgroundColor: C.cyan, color: C.ink }}
            >
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Filter row */}
      <section
        className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-8"
        style={{ backgroundColor: C.ink, borderBottom: `1px solid ${C.blueprint}` }}
      >
        <div className="relative">
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="appearance-none rounded-sm py-2 pl-3 pr-9 text-xs font-semibold uppercase tracking-wide outline-none focus-visible:outline focus-visible:outline-2"
            style={{ backgroundColor: C.blueprint, color: C.textLight, outlineColor: C.cyan, fontFamily: "'IBM Plex Mono', monospace" }}
          >
            <option>All domains</option>
            {DOMAINS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: C.textLight }}
          />
        </div>

        <p
          className="text-xs opacity-60"
          style={{ color: C.textLight, fontFamily: "'IBM Plex Mono', monospace" }}
        >
          Showing {filtered.length} of {failures.length} cases
        </p>
      </section>

      {/* Grid */}
      <section className="px-4 py-10 sm:px-8" style={{ backgroundColor: C.ink }}>
        {filtered.length === 0 ? (
          <p
            className="py-16 text-center text-sm opacity-60"
            style={{ color: C.textLight, fontFamily: "'IBM Plex Mono', monospace" }}
          >
            No cases match that search. Be the first to file one for this topic.
          </p>
        ) : (
          <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((f) => (
              <FailureCard key={f.id} failure={f} />
            ))}
          </div>
        )}
      </section>

      <ReportFailureModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleNewFailure}
      />
    </div>
  );
}
