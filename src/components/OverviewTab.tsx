import React from "react";
import { ProjectOverview } from "../types";
import {
  Users,
  Layers,
  ShieldCheck,
  Zap,
  Lightbulb,
  TrendingUp,
} from "lucide-react";
import CloudCostEstimator from "./CloudCostEstimator";
import RealTimePresence from "./RealTimePresence";

interface OverviewTabProps {
  overview: ProjectOverview | undefined;
}

export default function OverviewTab({ overview }: OverviewTabProps) {
  if (!overview) return null;

  return (
    <div id="overview-tab" className="space-y-6 animate-fade-in">
      {/* Elevator Pitch & Feasibility */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-linear-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-sm border border-indigo-950 flex flex-col justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-500/20 border border-indigo-400/20 rounded-full text-indigo-300 text-xs font-medium mb-3">
              <Zap className="w-3.5 h-3.5" />
              <span>Project Pitch</span>
            </span>
            <blockquote className="text-xl md:text-2xl font-semibold tracking-tight text-indigo-50 leading-snug mb-4">
              &ldquo;{overview.elevatorPitch}&rdquo;
            </blockquote>
          </div>
          <p className="text-sm text-indigo-200/80 leading-relaxed border-t border-indigo-800/50 pt-4">
            <strong>Core Value Proposition:</strong> {overview.coreValueProp}
          </p>
        </div>

        {/* Feasibility score & Strategic Challenge */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-slate-900 font-bold text-sm tracking-tight mb-2">
              Architectural Feasibility
            </h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-5xl font-extrabold text-indigo-600 tracking-tight">
                {overview.feasibilityScore}%
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase">
                Score
              </span>
            </div>

            {/* Feasibility progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 mb-6 overflow-hidden">
              <div
                className={`bg-indigo-600 h-2.5 rounded-full w-[${overview.feasibilityScore}%]`}
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Primary technical challenge
            </span>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              {overview.primaryChallenge}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core modules */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
            <Layers className="w-4.5 h-4.5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Key Functional Modules (Epics)
            </h3>
          </div>
          <div className="space-y-3 max-h-90 overflow-y-auto pr-1 custom-scrollbar">
            {overview.modules.map((m, idx) => {
              const complexityColor =
                m.estimatedComplexity === "High"
                  ? "bg-rose-50 text-rose-700 border-rose-100"
                  : m.estimatedComplexity === "Medium"
                    ? "bg-amber-50 text-amber-700 border-amber-100"
                    : "bg-emerald-50 text-emerald-700 border-emerald-100";
              return (
                <div
                  key={idx}
                  className="p-3 border border-slate-100 rounded-xl hover:border-slate-200 transition-all flex items-start gap-3 justify-between"
                >
                  <div className="space-y-1">
                    <span className="block font-semibold text-slate-900 text-sm">
                      {m.name}
                    </span>
                    <p className="text-xs text-slate-500 leading-normal">
                      {m.description}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${complexityColor}`}
                  >
                    {m.estimatedComplexity}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tech Stack Suggested and monetization directions */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3">
              <ShieldCheck className="w-4.5 h-4.5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Suggested Stack
              </h3>
            </div>
            <dl className="space-y-2.5 text-xs font-sans">
              <div className="flex justify-between items-center py-1">
                <dt className="text-slate-400 font-medium">Frontend UI</dt>
                <dd
                  className="text-slate-800 font-semibold text-right max-w-37.5 truncate"
                  title={overview.techStackSuggested.frontend}
                >
                  {overview.techStackSuggested.frontend}
                </dd>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-slate-50">
                <dt className="text-slate-400 font-medium">Backend API</dt>
                <dd
                  className="text-slate-800 font-semibold text-right max-w-37.5 truncate"
                  title={overview.techStackSuggested.backend}
                >
                  {overview.techStackSuggested.backend}
                </dd>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-slate-50">
                <dt className="text-slate-400 font-medium">Database Layer</dt>
                <dd
                  className="text-slate-800 font-semibold text-right max-w-37.5 truncate"
                  title={overview.techStackSuggested.database}
                >
                  {overview.techStackSuggested.database}
                </dd>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-slate-50">
                <dt className="text-slate-400 font-medium">Auth System</dt>
                <dd
                  className="text-slate-800 font-semibold text-right max-w-37.5 truncate"
                  title={overview.techStackSuggested.auth}
                >
                  {overview.techStackSuggested.auth}
                </dd>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-slate-50">
                <dt className="text-slate-400 font-medium">Hosting Platform</dt>
                <dd
                  className="text-slate-800 font-semibold text-right max-w-37.5 truncate"
                  title={overview.techStackSuggested.hosting}
                >
                  {overview.techStackSuggested.hosting}
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6">
            <div className="flex items-center gap-2 pb-3 border-b border-indigo-100 mb-3">
              <TrendingUp className="w-4.5 h-4.5 text-indigo-700" />
              <h3 className="font-bold text-indigo-950 text-sm">
                Monetization Stratagem
              </h3>
            </div>
            <ul className="space-y-2 text-xs text-indigo-900 leading-normal font-sans">
              {overview.monetizationSuggestions.map((m, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold shrink-0 mt-0.5">
                    •
                  </span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Target Audiences and personas definition */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
          <Users className="w-4.5 h-4.5 text-indigo-600" />
          <h3 className="font-bold text-slate-900 text-sm">
            Target Audience Definition
          </h3>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {overview.targetAudience.map((audience, idx) => (
            <div
              key={idx}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 font-semibold flex items-center gap-2 shadow-xs"
            >
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full shrink-0" />
              <span>{audience}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Estimator & Live Collaborator bento panel section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 flex flex-col justify-between">
          <CloudCostEstimator overview={overview} />
        </div>
        <div className="lg:col-span-4 flex flex-col">
          <RealTimePresence />
        </div>
      </div>
    </div>
  );
}
