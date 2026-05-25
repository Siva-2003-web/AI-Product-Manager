import React, { useState, useMemo, useEffect, useRef } from "react";
import * as d3 from "d3";
import { ProjectState } from "../types";
import {
  TrendingUp,
  Award,
  Layers,
  Target,
  Plus,
  Trash2,
  HelpCircle,
  Sparkles,
  Check,
  ChevronRight,
  BarChart3,
  RotateCcw,
} from "lucide-react";

interface PMPrioritizationTabProps {
  project: ProjectState;
}

interface PrioritizableItem {
  id: string;
  name: string;
  description: string;
  reach: number; // users/month affected
  impact: number; // 0.5 (min) to 3 (high)
  confidence: number; // 0.5 (50%) to 1.0 (100%)
  effort: number; // 1 to 20 (person-weeks)
  isCustom?: boolean;
}

interface FunnelStage {
  stage: "Acquisition" | "Activation" | "Retention" | "Referral" | "Revenue";
  label: string;
  metric: string;
  targetVolume: number;
  conversionRate: number; // %
  trackedEvent: string;
  strategy: string;
}

export default function PMPrioritizationTab({
  project,
}: PMPrioritizationTabProps) {
  const [activePmSubTab, setActivePmSubTab] = useState<"rice" | "aarrr">(
    "rice",
  );

  const funnelWidthClasses: Record<number, string> = {
    10: "w-[10%]",
    20: "w-[20%]",
    30: "w-[30%]",
    40: "w-[40%]",
    50: "w-[50%]",
    60: "w-[60%]",
    70: "w-[70%]",
    80: "w-[80%]",
    90: "w-[90%]",
    100: "w-full",
  };

  const getFunnelWidthClass = (percentWidth: number) => {
    const bucket = Math.min(
      100,
      Math.max(10, Math.round(percentWidth / 10) * 10),
    );
    return funnelWidthClasses[bucket] ?? "w-full";
  };

  // RICE Prioritization State
  const [priorities, setPriorities] = useState<PrioritizableItem[]>([]);
  const [newFeatureName, setNewFeatureName] = useState("");
  const [newFeatureDesc, setNewFeatureDesc] = useState("");

  // AARRR Funnel Metrics State
  const [funnelStages, setFunnelStages] = useState<FunnelStage[]>([
    {
      stage: "Acquisition",
      label: "📢 Acquisition",
      metric: "Monthly Website Visitors",
      targetVolume: 50000,
      conversionRate: 100,
      trackedEvent: "landing_page_view",
      strategy:
        "Leverage viral organic SEO posts regarding AI templates and GitHub marketing.",
    },
    {
      stage: "Activation",
      label: "⚡ Activation",
      metric: "Free Account Signups",
      targetVolume: 12500,
      conversionRate: 25,
      trackedEvent: "account_register",
      strategy:
        "Offer zero-friction single-sign-on (SSO) and immediate mock trial generation.",
    },
    {
      stage: "Retention",
      label: "🔄 Retention",
      metric: "Active Recurring Workspace Saves",
      targetVolume: 5000,
      conversionRate: 40,
      trackedEvent: "workspace_save",
      strategy:
        "Dispatch automated progressive build reports and customized slack alert hooks.",
    },
    {
      stage: "Referral",
      label: "🔗 Referral",
      metric: "Successful Workspace Shared Invites",
      targetVolume: 1000,
      conversionRate: 20,
      trackedEvent: "shared_link_click",
      strategy:
        "Incentivize with complimentary PDF exports and prioritized premium agent processing.",
    },
    {
      stage: "Revenue",
      label: "💰 Revenue",
      metric: "Enterprise Tier Upgrades",
      targetVolume: 250,
      conversionRate: 5,
      trackedEvent: "subscription_payment",
      strategy:
        "Encourage upgrade locks on enterprise rest gate syncs and relational diagram exports.",
    },
  ]);

  // Load priority list based on current project epics / modules or fallback defaults
  useEffect(() => {
    const modules = project.overview?.modules || [];
    let initialList: PrioritizableItem[] = [];

    if (modules.length > 0) {
      initialList = modules.map((m, idx) => ({
        id: `rice-epic-${idx}-${Date.now()}`,
        name: m.name,
        description: m.description,
        reach: 12000 - idx * 2000, // reasonable defaults
        impact:
          m.estimatedComplexity === "High"
            ? 3.0
            : m.estimatedComplexity === "Medium"
              ? 2.0
              : 1.0,
        confidence: 0.8,
        effort:
          m.estimatedComplexity === "High"
            ? 8
            : m.estimatedComplexity === "Medium"
              ? 4
              : 2,
      }));
    } else {
      // Robust fallbacks
      initialList = [
        {
          id: "rice-fb-1",
          name: "Interactive Customer Workspace",
          description:
            "Visual dashboards containing draggable neobrutalist cards and template loaders.",
          reach: 10000,
          impact: 3.0,
          confidence: 0.9,
          effort: 6,
        },
        {
          id: "rice-fb-2",
          name: "REST Gateway Spec Exporter",
          description:
            "Generates OpenAPI specification endpoints mapping relational data paradigms.",
          reach: 4500,
          impact: 2.0,
          confidence: 0.8,
          effort: 3,
        },
        {
          id: "rice-fb-3",
          name: "Collaborative Event Stream",
          description:
            "Real-time indicator sockets showing team coordinates and active changes.",
          reach: 3000,
          impact: 2.0,
          confidence: 0.7,
          effort: 5,
        },
      ];
    }
    setPriorities(initialList);
  }, [project]);

  // Adjust prioritization factors
  const updatePriorityFactor = (
    id: string,
    field: keyof PrioritizableItem,
    val: number,
  ) => {
    setPriorities((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: val };
        }
        return item;
      }),
    );
  };

  // Add custom priority item
  const handleAddFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeatureName.trim()) return;

    const newItem: PrioritizableItem = {
      id: `rice-custom-${Date.now()}`,
      name: newFeatureName,
      description: newFeatureDesc || "Prioritizable customer solution card.",
      reach: 5000,
      impact: 2.0,
      confidence: 0.8,
      effort: 3,
      isCustom: true,
    };

    setPriorities((prev) => [newItem, ...prev]);
    setNewFeatureName("");
    setNewFeatureDesc("");
  };

  // Delete prioritization item
  const handleDeletePriorityItem = (id: string) => {
    setPriorities((prev) => prev.filter((item) => item.id !== id));
  };

  // Reset prioritizer to defaults
  const handleResetPriorities = () => {
    if (confirm("Reset prioritization values back to module defaults?")) {
      const modules = project.overview?.modules || [];
      const resetList = modules.map((m, idx) => ({
        id: `rice-epic-${idx}-${Date.now()}`,
        name: m.name,
        description: m.description,
        reach: 10000 - idx * 1500,
        impact:
          m.estimatedComplexity === "High"
            ? 3.0
            : m.estimatedComplexity === "Medium"
              ? 2.0
              : 1.0,
        confidence: 0.8,
        effort:
          m.estimatedComplexity === "High"
            ? 8
            : m.estimatedComplexity === "Medium"
              ? 4
              : 2,
      }));
      setPriorities(resetList);
    }
  };

  // RICE score logic: (Reach * Impact * Confidence) / Effort
  const scoredPriorities = useMemo(() => {
    return priorities
      .map((item) => {
        const score = Math.round(
          (item.reach * item.impact * item.confidence) /
            Math.max(item.effort, 0.5),
        );
        return { ...item, score };
      })
      .sort((a, b) => b.score - a.score);
  }, [priorities]);

  // Direct conversion sequence updates in the AARRR Funnel
  const updateFunnelConversion = (
    stageIndex: number,
    conversionVal: number,
  ) => {
    setFunnelStages((prev) => {
      const updated = [...prev];
      updated[stageIndex] = {
        ...updated[stageIndex],
        conversionRate: conversionVal,
      };

      // Cascade calculated volumes sequentially for stages > 0
      for (let i = 1; i < updated.length; i++) {
        const prevStageVolume = updated[i - 1].targetVolume;
        const currentConv = updated[i].conversionRate / 100;
        updated[i].targetVolume = Math.round(prevStageVolume * currentConv);
      }
      return updated;
    });
  };

  const updateFunnelEgressCount = (firstStageVolume: number) => {
    setFunnelStages((prev) => {
      const updated = [...prev];
      updated[0] = { ...updated[0], targetVolume: firstStageVolume };

      for (let i = 1; i < updated.length; i++) {
        const prevVolume = updated[i - 1].targetVolume;
        const currentConv = updated[i].conversionRate / 100;
        updated[i].targetVolume = Math.round(prevVolume * currentConv);
      }
      return updated;
    });
  };

  return (
    <div id="pm-prioritization-tab" className="space-y-6 font-sans">
      {/* Tab Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-md font-bold text-slate-900 flex items-center gap-1.5">
            <Award className="w-5 h-5 text-indigo-600 animate-pulse" />
            <span>Product Manager strategic Toolkit</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Prioritize roadmap backlogs and map system customer conversion
            funnels
          </p>
        </div>

        {/* Sub-tabs toggling control */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 select-none">
          <button
            id="subtab-rice-btn"
            onClick={() => setActivePmSubTab("rice")}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activePmSubTab === "rice"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            ⚖️ Backlog RICE Prioritizer
          </button>
          <button
            id="subtab-aarrr-btn"
            onClick={() => setActivePmSubTab("aarrr")}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activePmSubTab === "aarrr"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            📊 AARRR Funnel Architect
          </button>
        </div>
      </div>

      {activePmSubTab === "rice" ? (
        <div className="space-y-6 animate-fade-in text-left">
          {/* RICE Explainer bar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Quick Formulation card */}
            <div className="lg:col-span-2 bg-indigo-50/40 border border-indigo-200 p-4 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-indigo-600 text-xs font-extrabold uppercase tracking-wide flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>The RICE Sizing Blueprint</span>
                </span>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-1.5 mb-3">
                  Align key functional specifications to maximize investment
                  value. Drag sliders to instantly rank epic scopes via standard
                  PM unit economics:
                </p>
              </div>
              <div className="bg-white border border-indigo-100 rounded-xl p-3 grid grid-cols-4 gap-2 text-center text-xs font-mono select-none">
                <div className="p-1">
                  <span className="block font-black text-indigo-600">
                    REACH
                  </span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">
                    Audience/mo
                  </span>
                </div>
                <div className="p-1 border-l border-slate-100">
                  <span className="block font-black text-indigo-600">
                    IMPACT
                  </span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">
                    Conversion multiplier
                  </span>
                </div>
                <div className="p-1 border-l border-slate-100">
                  <span className="block font-black text-indigo-600">
                    CONFIDENCE
                  </span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">
                    Certainty %
                  </span>
                </div>
                <div className="p-1 border-l border-slate-105 bg-indigo-50/50 rounded-lg">
                  <span className="block font-black text-rose-600">EFFORT</span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">
                    Person-weeks
                  </span>
                </div>
              </div>
            </div>

            {/* Quick feature adder */}
            <div className="bg-white border border-slate-200 p-4 rounded-2xl h-full shadow-sm">
              <h4 className="text-xs font-black uppercase text-slate-900 mb-2">
                💡 Add Candidate Feature
              </h4>
              <form onSubmit={handleAddFeature} className="space-y-2">
                <input
                  id="target-custom-feature-name"
                  type="text"
                  placeholder="e.g. Real-Time Chat Sockets"
                  aria-label="New feature name"
                  value={newFeatureName}
                  onChange={(e) => setNewFeatureName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                <input
                  id="target-custom-feature-desc"
                  type="text"
                  placeholder="Micro-description of project epic"
                  aria-label="New feature short description"
                  value={newFeatureDesc}
                  onChange={(e) => setNewFeatureDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2 px-2.5 rounded-xl text-xs focus:outline-none"
                />
                <button
                  id="submit-priority-candidate"
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Enlist Epic for Sizing</span>
                </button>
              </form>
            </div>
          </div>

          {/* Sizing Interactive Table / Row Cards Stack */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Real-time Sizing Backlog Rankings
                </h3>
                <p className="text-[10px] text-slate-400">
                  Calculated priority order updated instantly
                </p>
              </div>
              <button
                id="reset-matrix-btn"
                onClick={handleResetPriorities}
                className="text-[10px] text-indigo-600 hover:text-indigo-800 font-extrabold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Matrix</span>
              </button>
            </div>

            <div className="space-y-3">
              {scoredPriorities.map((item, index) => {
                const isP0 = index === 0;
                const isP1 = index === 1;

                let scoreBadgeClass =
                  "bg-slate-100 text-slate-600 border-slate-200";
                let badgeText = "P2 - Stretch Goal";
                if (isP0) {
                  scoreBadgeClass =
                    "bg-rose-50 text-rose-700 border-rose-100 font-black";
                  badgeText = "P0 - Absolute Priority";
                } else if (isP1) {
                  scoreBadgeClass =
                    "bg-amber-50 text-amber-700 border-amber-100 font-extrabold";
                  badgeText = "P1 - Critical Path";
                }

                return (
                  <div
                    key={item.id}
                    className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    {/* Left details */}
                    <div className="lg:max-w-[30%] space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-200/60 text-slate-800 text-[10px] font-black flex items-center justify-center font-mono">
                          {index + 1}
                        </span>
                        <h4 className="font-extrabold text-slate-900 text-sm truncate line-clamp-1 overflow-hidden wrap-break-word">
                          {item.name}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 leading-normal line-clamp-2 overflow-hidden wrap-break-word">
                        {item.description}
                      </p>
                    </div>

                    {/* Sizing Interactive Sliders panel */}
                    <div className="grow grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                      {/* Reach */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide">
                          Reach:{" "}
                          <strong className="text-slate-700 font-mono">
                            {item.reach.toLocaleString()}
                          </strong>
                        </span>
                        <input
                          type="range"
                          aria-label={`Reach for ${item.name}`}
                          min="500"
                          max="20000"
                          step="500"
                          value={item.reach}
                          onChange={(e) =>
                            updatePriorityFactor(
                              item.id,
                              "reach",
                              parseInt(e.target.value),
                            )
                          }
                          className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                        />
                      </div>

                      {/* Impact */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide">
                          Impact:{" "}
                          <strong className="text-slate-700 font-mono">
                            {item.impact === 3.0
                              ? "High (3x)"
                              : item.impact === 2.0
                                ? "Medium (2x)"
                                : "Low (1x)"}
                          </strong>
                        </span>
                        <input
                          type="range"
                          aria-label={`Impact for ${item.name}`}
                          min="0.5"
                          max="3.0"
                          step="0.5"
                          value={item.impact}
                          onChange={(e) =>
                            updatePriorityFactor(
                              item.id,
                              "impact",
                              parseFloat(e.target.value),
                            )
                          }
                          className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                        />
                      </div>

                      {/* Confidence */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide">
                          Certainty:{" "}
                          <strong className="text-slate-700 font-mono">
                            {Math.round(item.confidence * 100)}%
                          </strong>
                        </span>
                        <input
                          type="range"
                          aria-label={`Confidence for ${item.name}`}
                          min="0.5"
                          max="1.0"
                          step="0.1"
                          value={item.confidence}
                          onChange={(e) =>
                            updatePriorityFactor(
                              item.id,
                              "confidence",
                              parseFloat(e.target.value),
                            )
                          }
                          className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                        />
                      </div>

                      {/* Effort */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide">
                          Effort:{" "}
                          <strong className="text-rose-600 font-mono">
                            {item.effort} wks
                          </strong>
                        </span>
                        <input
                          type="range"
                          aria-label={`Effort for ${item.name}`}
                          min="1"
                          max="16"
                          step="1"
                          value={item.effort}
                          onChange={(e) =>
                            updatePriorityFactor(
                              item.id,
                              "effort",
                              parseInt(e.target.value),
                            )
                          }
                          className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Score Output block */}
                    <div className="lg:w-[15%] flex flex-row lg:flex-col justify-between lg:justify-center items-center lg:items-end gap-3 shrink-0 border-t lg:border-t-0 border-slate-200 pt-2 lg:pt-0">
                      <div className="text-right">
                        <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold block">
                          RICE SCORE
                        </span>
                        <strong className="text-base font-black font-mono text-indigo-600">
                          {item.score.toLocaleString()}
                        </strong>
                      </div>
                      <div className="flex items-center gap-1">
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase shrink-0 ${scoreBadgeClass}`}
                        >
                          {badgeText}
                        </span>
                        {item.isCustom && (
                          <button
                            onClick={() => handleDeletePriorityItem(item.id)}
                            className="p-1 rounded-md text-slate-350 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete candidate feature"
                            aria-label={`Delete candidate feature ${item.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* AARRR Funnel Architect View */
        <div className="space-y-6 animate-fade-in text-left">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Context explain */}
            <div className="lg:col-span-2 bg-linear-to-r from-slate-900 to-indigo-950 text-white p-5 rounded-2xl flex flex-col justify-between text-left h-full">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-indigo-500/20 border border-indigo-400/20 rounded-full text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-2">
                  <Target className="w-3.5 h-3.5" />
                  <span>Interactive Growth hacking Funnel</span>
                </span>
                <p className="text-xs text-indigo-200 leading-relaxed italic">
                  &ldquo;A Product is configured not just by code, but by the
                  metrics tracking customer loops.&rdquo;
                </p>
                <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                  Map down key transactional volumes across checkout stages.
                  Modify conversion target sliders at each custom gate to
                  instantly inspect required marketing egress bandwidth in the
                  dynamic funnel chart.
                </p>
              </div>

              {/* Total volume input controllers */}
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-3">
                <span className="text-[10px] font-extrabold text-indigo-300 uppercase shrink-0">
                  Traffic Baseline:
                </span>
                <input
                  id="target-guest-visitors-range"
                  type="range"
                  aria-label="Traffic baseline"
                  min="5000"
                  max="150000"
                  step="5000"
                  value={funnelStages[0].targetVolume}
                  onChange={(e) =>
                    updateFunnelEgressCount(parseInt(e.target.value))
                  }
                  className="grow h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                />
                <span className="font-mono text-xs text-white bg-slate-800/80 px-2 py-1 rounded border border-white/5 shrink-0">
                  {funnelStages[0].targetVolume.toLocaleString()} visitors
                </span>
              </div>
            </div>

            {/* Micro benchmark */}
            <div className="bg-white border border-slate-200 p-4 rounded-2xl h-full flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black uppercase text-slate-900 mb-1">
                  🎯 Funnel benchmark metrics
                </h4>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Standard SaaS conversion baselines:
                </p>
              </div>
              <ul className="space-y-1.5 text-[11px] text-slate-600 mt-2 font-sans leading-relaxed">
                <li className="flex justify-between border-b border-slate-50 pb-1">
                  <span>Sign-up activation (Acq &rarr; Act)</span>
                  <span className="font-semibold text-slate-900 font-mono">
                    15% - 30%
                  </span>
                </li>
                <li className="flex justify-between border-b border-slate-50 pb-1">
                  <span>Wk 1 Retained core (Act &rarr; Ret)</span>
                  <span className="font-semibold text-slate-900 font-mono">
                    30% - 50%
                  </span>
                </li>
                <li className="flex justify-between border-b border-slate-50 pb-1">
                  <span>Upgrade checkout (Ret &rarr; Rev)</span>
                  <span className="font-semibold text-slate-900 font-mono">
                    2% - 8%
                  </span>
                </li>
              </ul>
              <p className="text-[9px] text-slate-400 leading-normal italic mt-1 font-mono">
                Configure slider targets above standard lines to draft stretch
                monetization routes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Visual stacked funnel bars chart */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between min-h-95">
              <div>
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                  AARRR Symmetrical Funnel Chart
                </h3>
                <p className="text-[10px] text-slate-400">
                  Visualization of volumetric customer retention
                </p>
              </div>

              {/* Graphical Funnel stack */}
              <div className="space-y-3.5 my-6">
                {funnelStages.map((stg, i) => {
                  const maxCol = funnelStages[0].targetVolume;
                  const ratio = maxCol > 0 ? stg.targetVolume / maxCol : 0;
                  const percentWidth = Math.max(10, Math.round(ratio * 100));

                  const stageColors = [
                    "from-indigo-650 to-indigo-600 shadow-[inset_0_1px_3px_rgba(255,255,255,0.2)]",
                    "from-blue-600 to-blue-550",
                    "from-teal-600 to-teal-550",
                    "from-amber-600 to-amber-550",
                    "from-rose-600 to-rose-550",
                  ];

                  return (
                    <div key={stg.stage} className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-slate-800 font-mono text-[9px] uppercase tracking-tight">
                          {stg.label}
                        </span>
                        <span className="font-mono text-slate-500 font-black">
                          {stg.targetVolume.toLocaleString()} / mo
                        </span>
                      </div>
                      <div className="h-4 bg-slate-100 rounded-lg overflow-hidden border border-slate-200/60 p-0.5 flex">
                        <div
                          className={`h-full bg-linear-to-r ${stageColors[i]} rounded-md transition-all duration-500 ease-out flex items-center justify-end pr-2 ${getFunnelWidthClass(percentWidth)}`}
                        >
                          {percentWidth > 20 && (
                            <span className="font-mono text-[8px] text-white font-extrabold">
                              {percentWidth}% vol
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[9px] text-slate-500 leading-relaxed">
                Calculated yield rate from acquisition down to transaction:{" "}
                <strong className="text-indigo-600 font-mono font-black">
                  {(
                    (funnelStages[4].targetVolume /
                      Math.max(1, funnelStages[0].targetVolume)) *
                    100
                  ).toFixed(2)}
                  %
                </strong>{" "}
                conversion index.
              </div>
            </div>

            {/* Tabular/Interactive configurations list */}
            <div className="lg:col-span-7 space-y-3">
              {funnelStages.map((stg, idx) => {
                const isAcq = idx === 0;
                return (
                  <div
                    key={stg.stage}
                    className="p-3.5 bg-white border border-slate-200 rounded-2xl hover:border-indigo-200 transition-colors flex flex-col justify-between h-full gap-2 text-xs"
                  >
                    <div className="flex justify-between items-start gap-2 border-b border-slate-50 pb-2">
                      <div>
                        <span className="text-[9px] font-extrabold text-indigo-500 block uppercase tracking-wide font-mono">
                          Stage 0{idx + 1} &bull; {stg.stage}
                        </span>
                        <h4 className="font-black text-slate-800 block">
                          {stg.metric}
                        </h4>
                      </div>

                      {/* Interactive Gate slider */}
                      {!isAcq && (
                        <div className="text-right">
                          <span className="block text-[8px] text-slate-400 font-bold uppercase">
                            Target Gate Rate
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <input
                              id={`funnel-conversion-${stg.stage}`}
                              type="range"
                              aria-label={`Conversion rate for ${stg.stage}`}
                              min="1"
                              max="100"
                              step="1"
                              value={stg.conversionRate}
                              onChange={(e) =>
                                updateFunnelConversion(
                                  idx,
                                  parseInt(e.target.value),
                                )
                              }
                              className="h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none w-16"
                            />
                            <span className="font-mono text-indigo-600 font-black px-1 text-xs">
                              {stg.conversionRate}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[11px] leading-relaxed">
                      <div>
                        <span className="text-[8px] font-mono font-bold text-slate-400 block uppercase tracking-tight">
                          Ecosystem Tracked Event Name
                        </span>
                        <span
                          className="font-mono text-indigo-700 bg-indigo-50/40 p-1 py-0.5 rounded border border-indigo-100/30 text-[9.5px] mt-0.5 block truncate max-w-50"
                          title={stg.trackedEvent}
                        >
                          window.analytics.track(&quot;{stg.trackedEvent}&quot;)
                        </span>
                      </div>
                      <div>
                        <span className="text-[8px] font-mono font-bold text-slate-400 block uppercase tracking-tight">
                          Tactical Strategy
                        </span>
                        <p className="text-slate-600 mt-1 line-clamp-2 leading-tight italic">
                          {stg.strategy}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
