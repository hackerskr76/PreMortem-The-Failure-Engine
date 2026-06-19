import React, { useState, useEffect } from "react";
import { Search, Plus, X, ChevronDown, CheckCircle2, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // Integrated Framer Motion package

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

// Adjusted to match domains present within your dataset keys
const DOMAINS = [
  "Tech",
  "Biotechnology",
  "Policy",
  "Startup",
  "Hardware",
  "ML / AI",
  "Marketing",
  "Finance"
];

const API_BASE_URL = "http://127.0.0.1:8000";

// 🌟 VIDEO ANIMATION COMPONENT: Ambient background floating elements, characters, and badges inspired by Eloqwnt showcase
function FloatingBackground() {
  const layerElements = [
    // Avatars / Characters drifting smoothly around the margins
    { type: "avatar", img: "👩‍💻", label: "Dev_Iris", top: "12%", left: "6%", delay: 0, duration: 8 },
    { type: "avatar", img: "🕵️", label: "Sec_Audit", top: "78%", left: "85%", delay: 1.4, duration: 9 },
    { type: "avatar", img: "🧠", label: "ML_Agent", top: "28%", left: "88%", delay: 0.7, duration: 7 },
    { type: "avatar", img: "🚀", label: "Founder", top: "82%", left: "12%", delay: 2.1, duration: 10 },

    // Abstract Brand Chips matching your reference asset layout patterns
    { type: "chip", text: "ASOS", top: "45%", left: "4%", delay: 0.3, duration: 6 },
    { type: "chip", text: "AI LABS", top: "18%", left: "76%", delay: 1.8, duration: 8.5 },
    { type: "chip", text: "SCALE", top: "64%", left: "90%", delay: 0.9, duration: 7.5 },
    { type: "chip", text: "MARKET", top: "88%", left: "48%", delay: 2.5, duration: 9.5 },

    // Floating Engineering Code Matrices
    { type: "wire", text: "{ id: 404 }", top: "52%", left: "78%", delay: 1.1, duration: 11 },
    { type: "wire", text: "O(log n)", top: "32%", left: "15%", delay: 1.6, duration: 6.8 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 min-h-screen">
      {layerElements.map((el, i) => {
        const isAvatar = el.type === "avatar";
        const isChip = el.type === "chip";

        return (
          <motion.div
            key={i}
            className="absolute flex items-center gap-2 select-none"
            style={{ top: el.top, left: el.left }}
            animate={{
              y: [0, -25, 0],
              x: [0, i % 2 === 0 ? 12 : -12, 0],
              rotate: [
                i % 2 === 0 ? -1 : 1,
                i % 2 === 0 ? 3 : -3,
                i % 2 === 0 ? -1 : 1
              ],
            }}
            transition={{
              duration: el.duration,
              repeat: Infinity,
              delay: el.delay,
              ease: "easeInOut",
            }}
          >
            {isAvatar && (
              <div
                className="flex items-center gap-1.5 backdrop-blur-md border px-2 py-1 rounded-full shadow-lg opacity-25 hover:opacity-70 transition-opacity duration-300"
                style={{ backgroundColor: `${C.blueprint}22`, borderColor: `${C.cyan}44` }}
              >
                <span className="text-base">{el.img}</span>
                <span
                  className="text-[9px] font-bold tracking-wider uppercase text-slate-400"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {el.label}
                </span>
              </div>
            )}

            {isChip && (
              <div
                className="rounded-sm px-3 py-1.5 border opacity-15 shadow-md font-black tracking-[0.18em] text-[10px]"
                style={{
                  backgroundColor: C.blueprint,
                  borderColor: C.cyan,
                  color: C.textLight,
                  fontFamily: "'IBM Plex Mono', monospace"
                }}
              >
                {el.text}
              </div>
            )}

            {el.type === "wire" && (
              <span
                className="opacity-10 text-[10px] font-bold tracking-widest text-slate-500"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {el.text}
              </span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

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
  const [showLessons, setShowLessons] = useState(false);
  const tilt = failure.id % 2 === 0 ? "-0.5deg" : "0.6deg";

  const costDisplay = failure.financial_cost_usd
    ? `$${failure.financial_cost_usd.toLocaleString()}`
    : failure.cost || "Unknown Cost";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -6, scale: 1.01, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
      className="relative rounded-sm p-5 shadow-md flex flex-col justify-between"
      style={{
        backgroundColor: C.paper,
        borderTop: `4px solid ${C.blueprint}`,
        transform: `rotate(${tilt})`,
      }}
    >
      <div>
        <div className="mb-3 flex items-start justify-between gap-2">
          <DomainTag domain={failure.domain || "General"} />
          <span
            className="text-[10px] tracking-wider opacity-60"
            style={{ color: C.textInk, fontFamily: "'IBM Plex Mono', monospace" }}
          >
            FDB-{failure.id || "TEMP"}
          </span>
        </div>

        <h3
          className="mb-2 text-lg font-bold leading-snug"
          style={{ color: C.textInk, fontFamily: "'Zilla Slab', serif" }}
        >
          {failure.title}
        </h3>

        <p className="mb-4 text-sm leading-relaxed opacity-80" style={{ color: C.textInk }}>
          {failure.description || failure.snippet}
        </p>

        <div className="text-xs mb-4 text-slate-800 bg-[#dfd4b8] p-2.5 rounded-sm border-l-2 border-red-800">
          <strong>🚨 Root Cause:</strong> {failure.root_cause || "Unspecified parameter degradation."}
        </div>
      </div>

      {/* Accordion Slideout Container */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${showLessons ? "max-h-40 opacity-100 mb-4" : "max-h-0 opacity-0"
          }`}
      >
        <div
          className="rounded-sm p-3 text-xs leading-relaxed border-t border-dashed"
          style={{ backgroundColor: "#dfd4b8", borderColor: C.blueprint, color: C.textInk }}
        >
          <strong>💡 Takeaway:</strong> {failure.lessons_learned || failure.lessons}
        </div>
      </div>

      <div className="flex items-end justify-between mt-2 pt-2 border-t border-slate-300/40">
        <span
          className="text-[10px] tracking-wider opacity-50 uppercase"
          style={{ color: C.textInk, fontFamily: "'IBM Plex Mono', monospace" }}
        >
          SUNK: {costDisplay}
        </span>

        <button
          type="button"
          onClick={() => setShowLessons(!showLessons)}
          className="-rotate-6 select-none rounded-sm border-2 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest transition-transform active:scale-95"
          style={{
            borderColor: C.stamp,
            backgroundColor: showLessons ? C.stamp : "transparent",
            color: showLessons ? C.paper : C.stamp
          }}
        >
          <span className="flex items-center gap-1">
            <CheckCircle2 size={11} strokeWidth={2.5} />
            {showLessons ? "Hide Takeaway" : "Lessons Learned"}
          </span>
        </button>
      </div>
    </motion.article>
  );
}

function ReportFailureModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    title: "",
    domain: DOMAINS[0],
    description: "",
    root_cause: "",
    lessons_learned: "",
    financial_cost_usd: ""
  });

  if (!open) return null;

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      financial_cost_usd: form.financial_cost_usd ? parseFloat(form.financial_cost_usd) : 0
    });
    setForm({ title: "", domain: DOMAINS[0], description: "", root_cause: "", lessons_learned: "", financial_cost_usd: "" });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        style={{ backgroundColor: "rgba(19,29,43,0.75)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 15 }}
          className="w-full max-w-lg rounded-sm p-6 shadow-2xl my-8"
          style={{ backgroundColor: C.paper, borderTop: `5px solid ${C.stamp}` }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest opacity-60" style={{ color: C.textInk, fontFamily: "'IBM Plex Mono', monospace" }}>
                New Case File · FDB-LOGGING
              </p>
              <h2 className="mt-1 text-xl font-bold" style={{ color: C.textInk, fontFamily: "'Zilla Slab', serif" }}>
                Report a Failure
              </h2>
            </div>
            <button onClick={onClose} className="rounded-sm p-1 opacity-60 transition hover:opacity-100" style={{ color: C.textInk }}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 text-sm">
            <div>
              <label className="mb-0.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: C.textInk, fontFamily: "'IBM Plex Mono', monospace" }}>Project Title</label>
              <input required value={form.title} onChange={update("title")} className="w-full border px-2.5 py-1.5 rounded-sm" style={{ borderColor: C.paperDark }} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-0.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: C.textInk, fontFamily: "'IBM Plex Mono', monospace" }}>Domain</label>
                <select value={form.domain} onChange={update("domain")} className="w-full border px-2.5 py-1.5 rounded-sm" style={{ borderColor: C.paperDark }}>
                  {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-0.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: C.textInk, fontFamily: "'IBM Plex Mono', monospace" }}>Sunk Cost (USD)</label>
                <input type="number" value={form.financial_cost_usd} onChange={update("financial_cost_usd")} placeholder="e.g. 50000" className="w-full border px-2.5 py-1.5 rounded-sm" style={{ borderColor: C.paperDark }} />
              </div>
            </div>

            <div>
              <label className="mb-0.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: C.textInk, fontFamily: "'IBM Plex Mono', monospace" }}>Description</label>
              <textarea required rows={2} value={form.description} onChange={update("description")} placeholder="What was the project scope?" className="w-full border px-2.5 py-1.5 rounded-sm resize-none" style={{ borderColor: C.paperDark }} />
            </div>

            <div>
              <label className="mb-0.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: C.textInk, fontFamily: "'IBM Plex Mono', monospace" }}>What Went Wrong (Root Cause)</label>
              <textarea required rows={2} value={form.root_cause} onChange={update("root_cause")} placeholder="Exact point of architectural breakdown..." className="w-full border px-2.5 py-1.5 rounded-sm resize-none" style={{ borderColor: C.paperDark }} />
            </div>

            <div>
              <label className="mb-0.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: C.textInk, fontFamily: "'IBM Plex Mono', monospace" }}>Lessons learned</label>
              <textarea required rows={2} value={form.lessons_learned} onChange={update("lessons_learned")} placeholder="Mitigation rule for future builders..." className="w-full border px-2.5 py-1.5 rounded-sm resize-none" style={{ borderColor: C.paperDark }} />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold opacity-70" style={{ color: C.textInk }}>Cancel</button>
              <button type="submit" className="rounded-sm px-4 py-2 font-bold uppercase text-white" style={{ backgroundColor: C.stamp }}>Stamp &amp; File</button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function FailureDatabase() {
  const [query, setQuery] = useState("");
  const [domainFilter, setDomainFilter] = useState("All domains");
  const [modalOpen, setModalOpen] = useState(false);

  // Database API States
  const [failures, setFailures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // AI Pipeline Assessment States
  const [proposal, setProposal] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Programmatic server synchronization fetch hook
  const fetchBackendData = async () => {
    setLoading(true);
    setError(null);
    try {
      const urlParams = new URLSearchParams();
      if (query.trim()) urlParams.append("q", query.trim());
      if (domainFilter !== "All domains") urlParams.append("domain", domainFilter);

      const response = await fetch(`${API_BASE_URL}/failures?${urlParams.toString()}`);
      if (!response.ok) throw new Error(`HTTP Error Status: ${response.status}`);

      const data = await response.json();
      setFailures(data);
    } catch (err) {
      setError("Failed to sync matrix parameters with local PreMortem Engine.");
    } finally {
      setLoading(false);
    }
  };

  // Sync data updates live on BOTH filter dropdown updates and input string mutations
  useEffect(() => {
    fetchBackendData();
  }, [domainFilter, query]);

  // Handle post logging ingestion paths
  const handleNewFailureSubmit = async (formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/failures`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Logging request rejected by database schema validation.");

      await response.json();
      setModalOpen(false);
      fetchBackendData(); // Instantly refresh table with update rows
    } catch (err) {
      alert(err.message);
    }
  };

  // AI Generation Trigger
  const runAiRiskAssessment = async (e) => {
    e.preventDefault();
    if (!proposal.trim()) return;

    setAiLoading(true);
    setAiResult(null);
    try {
      const response = await fetch(`${API_BASE_URL}/failures/assess-risk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: proposal }),
      });
      if (!response.ok) throw new Error("AI core compilation limits exceeded.");

      const data = await response.json();
      setAiResult(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }} className="min-h-screen bg-[#0d1520] relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@500;700&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap');
        input:focus, textarea:focus, select:focus { box-shadow: 0 0 0 2px ${C.cyan}; border-color: ${C.cyan}; }
      `}</style>

      {/* Injected Ambient Floating Background Elements (Characters & Badges) */}
      <FloatingBackground />

      {/* Header element */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-3 px-4 py-3 sm:px-8 relative" style={{ backgroundColor: C.ink, borderBottom: `1px solid ${C.blueprint}` }}>
        <span className="text-sm font-black uppercase tracking-[0.2em]" style={{ color: C.textLight, fontFamily: "'IBM Plex Mono', monospace" }}>
          PREMORTEM<span style={{ color: C.cyan }}>/</span>ENGINE
        </span>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white transition hover:brightness-110" style={{ backgroundColor: C.stamp }}>
          <Plus size={14} strokeWidth={3} /> Report a Failure
        </button>
      </header>

      {/* Hero Search Block */}
      <section className="px-4 py-14 sm:px-8 sm:py-16 relative z-10" style={{ backgroundColor: C.ink, backgroundImage: `linear-gradient(${C.blueprint}33 1px, transparent 1px), linear-gradient(90deg, ${C.blueprint}33 1px, transparent 1px)`, backgroundSize: "32px 32px" }}>
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.25em]" style={{ color: C.cyan, fontFamily: "'IBM Plex Mono', monospace" }}>
            CONNECTED ARCHIVE INDEX · LIVE VECTOR STATUS
          </p>
          <h1 className="mb-8 text-3xl font-bold leading-tight sm:text-4xl" style={{ color: C.textLight, fontFamily: "'Zilla Slab', serif" }}>
            Before you build it, see who already broke it.
          </h1>

          <div className="flex items-center gap-2 rounded-sm p-1.5 shadow-lg" style={{ backgroundColor: C.paper }}>
            <Search size={20} className="ml-2 shrink-0" style={{ color: C.textInk, opacity: 0.5 }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Query structural database fingerprints..."
              className="w-full bg-transparent py-2 text-sm outline-none sm:text-base font-medium"
              style={{ color: C.textInk }}
            />
            <button onClick={fetchBackendData} className="shrink-0 rounded-sm px-4 py-2 text-xs font-bold uppercase tracking-wide text-white" style={{ backgroundColor: C.blueprint }}>
              Execute
            </button>
          </div>
        </div>
      </section>

      {/* Core AI Pipeline Section */}
      <section className="max-w-6xl mx-auto px-4 pt-6 pb-2 grid grid-cols-1 gap-4 relative z-10">
        <div className="rounded-sm p-5 border shadow-inner transition-all" style={{ backgroundColor: C.ink, borderColor: C.blueprint }}>
          <div className="flex items-center gap-2 mb-2 text-slate-200">
            <ShieldAlert size={18} style={{ color: C.cyan }} />
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Pre-Mortem Risk Summarizer</h2>
          </div>
          <form onSubmit={runAiRiskAssessment} className="flex flex-col sm:flex-row gap-3">
            <input
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
              placeholder="Paste speculative system layout description to process predictive blast radiuses..."
              className="w-full p-2.5 text-xs rounded-sm outline-none bg-[#1a2636] border text-white border-slate-600 focus:border-cyan-400"
            />
            <button type="submit" disabled={aiLoading} className="bg-red-800 text-white font-bold text-xs uppercase px-5 py-2.5 rounded-sm shrink-0 tracking-wide transition hover:bg-red-700 disabled:opacity-50">
              {aiLoading ? "Synthesizing Matrix..." : "Analyze Architectural Defect Overlaps"}
            </button>
          </form>

          <AnimatePresence>
            {aiResult && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="mt-4 p-4 border rounded-sm text-xs leading-relaxed text-slate-900 shadow-lg overflow-hidden"
                style={{ backgroundColor: C.paper, borderColor: C.stamp }}
              >
                <div className="mb-2 font-bold uppercase tracking-widest text-red-900 border-b border-red-700 pb-1">⚠️ System Failure Assessment Matrix:</div>
                <div className="whitespace-pre-wrap font-medium">{aiResult.risk_summary}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Filter and Metrics Row */}
      <section className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-8 bg-[#0f1a27] relative z-10" style={{ borderBottom: `1px solid ${C.blueprint}` }}>
        <div className="relative">
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="appearance-none rounded-sm py-2 pl-3 pr-9 text-xs font-semibold uppercase tracking-wide outline-none cursor-pointer"
            style={{ backgroundColor: C.blueprint, color: C.textLight, fontFamily: "'IBM Plex Mono', monospace" }}
          >
            <option>All domains</option>
            {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: C.textLight }} />
        </div>

        <p className="text-xs opacity-60" style={{ color: C.textLight, fontFamily: "'IBM Plex Mono', monospace" }}>
          Active Query Pool: {failures.length} Incident Nodes
        </p>
      </section>

      {/* Failure Cases Grid Interface */}
      <section className="px-4 py-10 sm:px-8 relative z-10">
        {loading ? (
          <p className="py-16 text-center text-sm animate-pulse" style={{ color: C.cyan, fontFamily: "'IBM Plex Mono', monospace" }}>
            🔄 Syncing index parameters with historical records...
          </p>
        ) : error ? (
          <p className="py-16 text-center text-sm text-red-400" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            {error} Ensure your backend server is up and listening on port 8000.
          </p>
        ) : failures.length === 0 ? (
          <p className="py-16 text-center text-sm opacity-60" style={{ color: C.textLight, fontFamily: "'IBM Plex Mono', monospace" }}>
            No cases match that search criteria. Index remains clear.
          </p>
        ) : (
          <motion.div
            layout
            className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence>
              {failures.map((f) => <FailureCard key={f.id} failure={f} />)}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      <ReportFailureModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleNewFailureSubmit} />
    </div>
  );
}