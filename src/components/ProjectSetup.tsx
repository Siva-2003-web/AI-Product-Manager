import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  Lightbulb,
  ShieldAlert,
  Cpu,
  Feather,
  Smile,
} from "lucide-react";

interface ProjectSetupProps {
  onGenerate: (
    idea: string,
    techKeywords: string,
    extraDetails: string,
    theme: "Industrial" | "Minimalist" | "Playful",
  ) => void;
  isLoading: boolean;
  hasApiKey: boolean;
  defaultTheme?: "Industrial" | "Minimalist" | "Playful";
}

const PRESETS = [
  {
    title: "Airbnb for Co-working Spaces",
    desc: "A mobile-first marketplace letting freelancers discover, book, and unlock shared desk spaces instantly via smart-locks and hourly micro-transactions.",
    tech: "React Native, Express, Postgres, Stripe, IoT Lock API",
    extra: "Needs a secure rating system and interactive map searches.",
  },
  {
    title: "SaaS Influencer Campaign Analytics",
    desc: "An automated analytics monitor that gathers raw metrics across TikTok/Instagram, estimates standard user engagement, calculates ROI, and structures invoice generation.",
    tech: "Next.js, FastAPI, MongoDB, Gemini API, OAuth 2.0",
    extra:
      "Focus on automated PDF reporting and daily analytics synchronization.",
  },
  {
    title: "AI Mental Health Companion",
    desc: "A highly empathetic conversation mobile app that tracks positive daily habits, offers structured breathing exercises, and integrates micro-journaling with semantic sentiment logs.",
    tech: "React, Node.js, Firestore, Gemini-3.5-flash, WebSockets",
    extra:
      "Must prioritize strict HIPAA compliance and robust client-side encryption.",
  },
];

export default function ProjectSetup({
  onGenerate,
  isLoading,
  hasApiKey,
  defaultTheme = "Industrial",
}: ProjectSetupProps) {
  const [idea, setIdea] = useState("");
  const [techKeywords, setTechKeywords] = useState(
    "Vite React, Tailwind, Node.js + Express, Postgres",
  );
  const [extraDetails, setExtraDetails] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<
    "Industrial" | "Minimalist" | "Playful"
  >(defaultTheme);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) return;
    onGenerate(idea, techKeywords, extraDetails, selectedTheme);
  };

  const selectPreset = (p: (typeof PRESETS)[0]) => {
    setIdea(p.desc);
    setTechKeywords(p.tech);
    setExtraDetails(p.extra);
  };

  return (
    <div id="project-setup" className="w-full max-w-none py-6 md:py-8 px-0">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Transform Ideas to Complete Architectures</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          AI Product Manager &amp; Builder Suite
        </h1>
        <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto">
          Describe any application concept in natural language. Our system
          orchestrates specialized AI agents to generate structured PRDs, sprint
          backlogs, database models, interactive wireframes, and scalable
          starter code.
        </p>
      </div>

      {!hasApiKey && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 text-amber-800 text-sm">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <span className="font-semibold block">Missing Gemini API Key</span>
            <span>
              The application requires GEMINI_API_KEY to act as a system
              planner. Please click on <strong>Settings &gt; Secrets</strong> in
              AI Studio to configure your API key for server activities. Saving
              mock local setups remains partially active.
            </span>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 sm:p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Idea Input */}
          <div className="space-y-2">
            <label
              htmlFor="idea-input"
              className="block font-medium text-slate-950 text-sm"
            >
              Describe Your Product Idea
            </label>
            <textarea
              id="idea-input"
              rows={4}
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="e.g., A mobile application where neighbors can share garden equipment with built-in deposit scheduling and secure payment escrow..."
              className="w-full text-slate-900 bg-white border border-slate-200 rounded-xl p-4 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner"
              required
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tech Preferences */}
            <div className="space-y-2">
              <label
                htmlFor="tech-input"
                className="block font-medium text-slate-950 text-sm"
              >
                Preferred Technology Stack
              </label>
              <input
                id="tech-input"
                type="text"
                value={techKeywords}
                onChange={(e) => setTechKeywords(e.target.value)}
                placeholder="React, Next.js, FastAPI, Node, Postgres, Firestore"
                className="w-full text-slate-900 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                disabled={isLoading}
              />
            </div>

            {/* Custom Rules */}
            <div className="space-y-2">
              <label
                htmlFor="extra-input"
                className="block font-medium text-slate-950 text-sm"
              >
                Additional Constraints or Core Goals
              </label>
              <input
                id="extra-input"
                type="text"
                value={extraDetails}
                onChange={(e) => setExtraDetails(e.target.value)}
                placeholder="e.g., MVP timeline in 4 weeks, high emphasis on data security..."
                className="w-full text-slate-900 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Theme Selection Component */}
          <div className="space-y-3 pt-2">
            <label className="block font-bold text-slate-950 text-sm">
              Design Architecture Theme Style
            </label>
            <p className="text-[11px] text-slate-500 -mt-1.5 leading-relaxed">
              Select the creative design system to apply across your Bento Grid
              workspace components.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  id: "Industrial" as const,
                  label: "Industrial Tech",
                  description:
                    "Neo-brutalist engineering. Bold lines, solid high-contrast borders, and technical monospace cues.",
                  badge: "Brutalist",
                  badgeClass: "bg-slate-900 text-white",
                  icon: Cpu,
                  borderClass:
                    "border-slate-950 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]",
                },
                {
                  id: "Minimalist" as const,
                  label: "Minimalist Studio",
                  description:
                    "Clean refined aesthetics. Spacious panels, thin borders, elegant text tracking, and soft details.",
                  badge: "Elegance",
                  badgeClass:
                    "bg-zinc-100 text-zinc-800 border border-zinc-200",
                  icon: Feather,
                  borderClass: "border-zinc-400 shadow-sm",
                },
                {
                  id: "Playful" as const,
                  label: "Playful Creative",
                  description:
                    "Vibrant and high-energy. Large rounded bubbles, vibrant soft gradients, and modern interactive elements.",
                  badge: "Creative",
                  badgeClass: "bg-purple-100 text-purple-700",
                  icon: Smile,
                  borderClass:
                    "border-purple-400 shadow-[0_5px_15px_rgba(147,51,234,0.1)]",
                },
              ].map((themeOpt) => {
                const isSelected = selectedTheme === themeOpt.id;
                const IconComp = themeOpt.icon;
                return (
                  <button
                    key={themeOpt.id}
                    id={`theme-btn-${themeOpt.id.toLowerCase()}`}
                    type="button"
                    onClick={() => setSelectedTheme(themeOpt.id)}
                    className={`text-left p-4 rounded-xl border-2 transition-all font-sans cursor-pointer flex flex-col justify-between h-auto min-h-36 relative ${
                      isSelected
                        ? `${themeOpt.borderClass} bg-white ring-2 ring-indigo-500/10`
                        : "border-slate-200 bg-slate-50/55 hover:bg-slate-50 hover:border-slate-300 shadow-xs"
                    }`}
                  >
                    <div className="w-full">
                      <div className="flex items-center justify-between gap-1 mt-0.5 mb-2">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`p-1 rounded-md ${isSelected ? "text-indigo-600 bg-indigo-50" : "text-slate-400 bg-slate-200/50"}`}
                          >
                            <IconComp className="w-4 h-4" />
                          </div>
                          <span className="font-extrabold text-slate-900 text-xs">
                            {themeOpt.label}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider ${themeOpt.badgeClass}`}
                        >
                          {themeOpt.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        {themeOpt.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between w-full">
                      <span className="text-[9px] font-mono text-slate-400 tracking-wider">
                        PREVIEW:
                      </span>
                      <div className="flex gap-1 items-center">
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                            themeOpt.id === "Industrial"
                              ? "bg-slate-950 text-white border border-slate-950"
                              : themeOpt.id === "Minimalist"
                                ? "bg-white text-slate-800 border border-slate-200"
                                : "bg-purple-600 text-white border-transparent"
                          }`}
                        >
                          Grid
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !idea.trim()}
            className="w-full flex items-center justify-center gap-2 text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-slate-300 disabled:cursor-not-allowed font-medium text-sm px-6 py-3.5 rounded-xl transition-all shadow-sm shadow-indigo-600/10 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Cpu className="w-5 h-5 animate-spin" />
                <span>Initializing Virtual PM &amp; Architect Agents...</span>
              </>
            ) : (
              <>
                <span>Orchestrate Architecture Planning</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Preset suggestions */}
        <div className="mt-8 border-t border-slate-100 pt-6">
          <div className="flex items-center gap-2 text-slate-950 font-medium text-sm mb-4">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Select a Pre-configured Catalyst Concept</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => selectPreset(p)}
                disabled={isLoading}
                className="text-left p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/70 hover:border-indigo-200 transition-all font-sans cursor-pointer group"
              >
                <span className="block font-bold text-slate-900 text-xs mb-1 group-hover:text-indigo-600 transition-colors">
                  {p.title}
                </span>
                <span className="block text-[11px] text-slate-500 line-clamp-3">
                  {p.desc}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
