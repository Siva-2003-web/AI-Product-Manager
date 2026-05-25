import React, { useState, useRef, useEffect, useMemo } from "react";
import { RoadmapPhase } from "../types";
import {
  CalendarRange,
  Milestone,
  CheckSquare,
  ListTodo,
  Star,
  BadgeCheck,
  Download,
} from "lucide-react";
import * as d3 from "d3";

interface GanttChartProps {
  phases: Array<
    RoadmapPhase & { start: number; end: number; duration: number }
  >;
  activeIdx: number;
  onSelect: (idx: number) => void;
}

function GanttChart({ phases, activeIdx, onSelect }: GanttChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const height = phases.length * 52 + 50; // Dynamic height based on phase length

  useEffect(() => {
    if (!containerRef.current) return;

    const handleResize = () => {
      if (containerRef.current) {
        setWidth(Math.max(containerRef.current.clientWidth, 480));
      }
    };

    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const maxWeek = Math.max(8, d3.max(phases, (d) => d.end) || 8);

  const paddingLeft = 160; // Spacing for Phase Titles
  const paddingRight = 36; // Spacing for terminal milestone stars
  const paddingTop = 30;
  const paddingBottom = 15;
  const paddingYStart = paddingTop - 6;

  const xScale = d3
    .scaleLinear()
    .domain([0, maxWeek])
    .range([paddingLeft, width - paddingRight]);

  const yScale = (idx: number) => {
    return paddingTop + idx * 48;
  };

  const tickValues = d3.range(0, maxWeek + 1);

  return (
    <div
      id="gantt-chart-flow-container"
      ref={containerRef}
      className="w-full bg-slate-900 text-slate-100 rounded-3xl border-2 border-slate-900 p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] overflow-hidden font-sans"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
        <div>
          <span className="text-[9px] font-bold text-indigo-400 font-mono tracking-widest block">
            D3.JS TIMELINE INFRASTRUCTURE
          </span>
          <h4 className="text-xs font-black text-white">
            Interactive Gantt Release Track
          </h4>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1.5 font-mono text-slate-400">
            <span className="w-2 h-2 bg-indigo-500 rounded-xs inline-block" />
            <span>Active Release</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-slate-400">
            <span className="w-2 h-2 bg-slate-700 rounded-xs inline-block" />
            <span>Upcoming Release</span>
          </div>
          <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/20">
            ★ Milestone Gates
          </span>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        <svg
          width={width}
          height={height}
          className="block select-none overflow-visible"
        >
          {/* Grid lines */}
          {tickValues.map((week) => {
            const x = xScale(week);
            return (
              <g key={`grid-line-${week}`}>
                <line
                  x1={x}
                  y1={paddingYStart}
                  x2={x}
                  y2={height - paddingBottom}
                  stroke="#1e293b"
                  strokeWidth={1}
                  strokeDasharray={week === 0 ? "none" : "3,3"}
                />
                <text
                  x={x}
                  y={paddingTop - 10}
                  textAnchor="middle"
                  className="fill-slate-400 font-mono text-[9px] font-bold"
                >
                  {week === 0 ? "Kickoff" : `W${week}`}
                </text>
              </g>
            );
          })}

          {/* Phase tracks & actual pills */}
          {phases.map((phase, idx) => {
            const isActive = activeIdx === idx;
            const xStart = xScale(phase.start);
            const xEnd = xScale(phase.end);
            const barWidth = Math.max(12, xEnd - xStart);
            const y = yScale(idx);
            const barHeight = 24;

            return (
              <g
                key={phase.phaseNumber}
                onClick={() => onSelect(idx)}
                className="cursor-pointer group transition-all"
              >
                {/* Visual track backdrop */}
                <rect
                  x={10}
                  y={y - 8}
                  width={width - 20}
                  height={40}
                  rx={8}
                  fill={isActive ? "rgba(99, 102, 241, 0.08)" : "transparent"}
                  className="group-hover:fill-slate-800/40 transition-all duration-150"
                />

                {/* Phase title text label */}
                <text
                  x={20}
                  y={y + 10}
                  className={`font-sans text-[11px] font-bold ${
                    isActive
                      ? "fill-indigo-300"
                      : "fill-slate-350 group-hover:fill-white"
                  }`}
                  dominantBaseline="middle"
                >
                  Phase {phase.phaseNumber}:{" "}
                  {phase.phaseTitle.length > 20
                    ? `${phase.phaseTitle.slice(0, 18)}...`
                    : phase.phaseTitle}
                </text>

                {/* Main Duration Bar */}
                <rect
                  x={xStart}
                  y={y - 2}
                  width={barWidth}
                  height={barHeight}
                  rx={6}
                  fill={isActive ? "url(#activeGanttGrad)" : "#1e293b"}
                  stroke={isActive ? "#818cf8" : "rgba(148, 163, 184, 0.15)"}
                  strokeWidth={isActive ? 1.5 : 1}
                  className="transition-all duration-200"
                />

                {/* Left indicators indicator */}
                {isActive && (
                  <circle
                    cx={xStart + 3}
                    cy={y + 10}
                    r={2}
                    className="fill-emerald-400 animate-pulse"
                  />
                )}

                {/* Bar interior text */}
                {barWidth > 30 && (
                  <text
                    x={xStart + barWidth / 2}
                    y={y + 10}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-slate-100 font-mono text-[9px] font-black pointer-events-none"
                  >
                    {phase.durationWeeks.replace(/\s*Weeks?/i, "W")}
                  </text>
                )}

                {/* Milestone Goal Star Pin at the terminal node */}
                <g transform={`translate(${xEnd}, ${y + 10})`}>
                  <circle
                    cx={0}
                    cy={0}
                    r={6.5}
                    className={`${isActive ? "fill-indigo-700 stroke-indigo-400" : "fill-slate-800 stroke-slate-700"} stroke-1`}
                  />
                  <text
                    x={0}
                    y={0.5}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="font-sans font-black text-[9px] fill-amber-300"
                  >
                    ★
                  </text>
                  <title>{`Phase ${phase.phaseNumber} Gate Milestone Target: ${phase.milestone}`}</title>
                </g>
              </g>
            );
          })}

          {/* Gradients definitions */}
          <defs>
            <linearGradient
              id="activeGanttGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Dynamic phase summary line */}
      <div className="mt-3 pt-2.5 border-t border-slate-800 flex justify-between items-center text-[10px] font-mono text-slate-400 flex-wrap gap-2">
        <span>Timeline Stretch: 0 to {maxWeek} Weeks</span>
        <span className="text-indigo-400 font-bold bg-indigo-500/5 px-2 py-0.5 rounded-sm border border-indigo-500/10">
          Active Viewport: Phase {phases[activeIdx].phaseNumber} —{" "}
          {phases[activeIdx].durationWeeks}
        </span>
      </div>
    </div>
  );
}

interface DevelopmentRoadmapTabProps {
  roadmap: RoadmapPhase[] | undefined;
  projectId?: string;
}

export default function DevelopmentRoadmapTab({
  roadmap,
  projectId,
}: DevelopmentRoadmapTabProps) {
  const [activePhaseIdx, setActivePhaseIdx] = useState(0);
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>(
    () => {
      if (!projectId) return {};
      try {
        const saved = localStorage.getItem(
          `ai_pm_${projectId}_roadmap_completed_items`,
        );
        return saved ? JSON.parse(saved) : {};
      } catch {
        return {};
      }
    },
  );

  // Keep them in sync when project changes
  useEffect(() => {
    if (!projectId) return;
    try {
      const saved = localStorage.getItem(
        `ai_pm_${projectId}_roadmap_completed_items`,
      );
      setCompletedItems(saved ? JSON.parse(saved) : {});
    } catch {
      // ignore
    }
  }, [projectId]);

  // Keep localStorage updated when state changes
  useEffect(() => {
    if (!projectId) return;
    localStorage.setItem(
      `ai_pm_${projectId}_roadmap_completed_items`,
      JSON.stringify(completedItems),
    );
  }, [completedItems, projectId]);

  const parsedPhases = useMemo(() => {
    if (!roadmap) return [];
    let currentAccumulated = 0;
    return roadmap.map((phase) => {
      const rangeMatch = phase.durationWeeks.match(
        /Weeks?\s*(\d+)\s*-\s*(\d+)/i,
      );
      const durationMatch = phase.durationWeeks.match(/(\d+)\s*Weeks?/i);

      let start = currentAccumulated;
      let end = currentAccumulated + 2;

      if (rangeMatch) {
        start = parseInt(rangeMatch[1], 10) - 1;
        end = parseInt(rangeMatch[2], 10);
      } else if (durationMatch) {
        const dur = parseInt(durationMatch[1], 10);
        start = currentAccumulated;
        end = currentAccumulated + dur;
      }

      if (end <= start) {
        end = start + 1;
      }

      currentAccumulated = end;

      return {
        ...phase,
        start,
        end,
        duration: end - start,
      };
    });
  }, [roadmap]);

  if (!roadmap || roadmap.length === 0) return null;

  const currentPhase = roadmap[activePhaseIdx];

  const handleToggleTodo = (phaseNum: number, idx: number, type: string) => {
    const key = `${phaseNum}-${type}-${idx}`;
    setCompletedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDownloadRoadmapCSV = (phasesList: RoadmapPhase[]) => {
    const escapeCsv = (str: string) => {
      const escaped = (str || "").replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const headers = [
      "Phase Number",
      "Phase Title",
      "Duration",
      "Milestone Target",
      "Key Objectives",
      "Detailed Tasks",
      "Readiness Criteria",
    ];

    const rows = phasesList.map((phase) => [
      `Phase ${phase.phaseNumber}`,
      phase.phaseTitle,
      phase.durationWeeks,
      phase.milestone,
      phase.coreObjectives.join(" | "),
      phase.detailedTasks.join(" | "),
      phase.readinessCriteria.join(" | "),
    ]);

    const csvContent = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `product_development_roadmap.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="development-roadmap-tab" className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <CalendarRange className="w-4.5 h-4.5 text-indigo-600" />
          <div>
            <h2 className="text-md font-bold text-slate-900 font-sans">
              Development Roadmap &amp; Milestones
            </h2>
            <p className="text-xs text-slate-500 font-sans">
              Incremental rollout roadmap to track MVP sprint deployment
            </p>
          </div>
        </div>

        <button
          onClick={() => handleDownloadRoadmapCSV(roadmap)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-slate-400 rounded-xl cursor-pointer self-start sm:self-center transition-all duration-150"
          title="Download full roadmap as CSV file"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Roadmap CSV</span>
        </button>
      </div>

      {/* D3 Interactive Gantt Chart Timeline */}
      <GanttChart
        phases={parsedPhases}
        activeIdx={activePhaseIdx}
        onSelect={setActivePhaseIdx}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-4">
        {/* Left vertical timeline navigation stepper */}
        <div className="lg:col-span-5 relative space-y-4">
          <div className="absolute top-2 bottom-2 left-6 w-1/2 border-l-4 border-dashed border-slate-200 pointer-events-none -z-10" />

          {roadmap.map((phase, idx) => {
            const isActive = activePhaseIdx === idx;
            return (
              <div
                key={phase.phaseNumber}
                onClick={() => setActivePhaseIdx(idx)}
                className={`flex gap-4 items-start cursor-pointer select-none group transition-all p-3.5 rounded-2xl border-2 ${
                  isActive
                    ? "bg-white border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"
                    : "bg-slate-50 border-transparent hover:bg-slate-100"
                }`}
              >
                {/* Node circle */}
                <div
                  className={`w-10 h-10 rounded-full font-mono text-xs font-black flex items-center justify-center shrink-0 border-2 transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white border-slate-900 shadow-md scale-110"
                      : "bg-slate-200 text-slate-600 border-slate-300 group-hover:bg-indigo-50"
                  }`}
                >
                  P{phase.phaseNumber}
                </div>

                <div className="space-y-1 font-sans">
                  <span className="block font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors truncate max-w-[320px]">
                    {phase.phaseTitle}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400">
                    <span className="font-mono text-indigo-600">
                      {phase.durationWeeks}
                    </span>
                    <span>•</span>
                    <span className="truncate max-w-37.5">
                      {phase.milestone}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right phase details cardboard panel */}
        <div className="lg:col-span-7 bg-white border-2 border-slate-900 rounded-3xl p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider font-sans">
                  ACTIVE TIMELINE ARCHITECT
                </span>
                <h3 className="text-lg font-black text-slate-900 font-sans mt-0.5">
                  Phase {currentPhase.phaseNumber}: {currentPhase.phaseTitle}
                </h3>
              </div>
              <span className="px-2.5 py-1 bg-slate-900 text-white border border-slate-900 font-mono text-[10px] font-bold rounded-lg uppercase tracking-wider shrink-0">
                {currentPhase.durationWeeks}
              </span>
            </div>

            {/* Core milestone target block */}
            <div className="bg-indigo-50 border border-indigo-100 p-3.5 rounded-xl flex gap-3 text-indigo-900 text-xs mb-4">
              <Milestone className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-indigo-950 block">
                  Target Milestone Goal
                </span>
                <span className="text-[11px] text-indigo-900/80 leading-relaxed block truncate">
                  {currentPhase.milestone}
                </span>
              </div>
            </div>

            {/* Core Objectives & Checklist split screen layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-sans">
              {/* Objectives */}
              <div className="space-y-2.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Key Objectives</span>
                </span>
                <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                  {currentPhase.coreObjectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-indigo-600 font-black mt-0.5">
                        •
                      </span>
                      <span className="truncate overflow-hidden max-w-full">
                        {obj}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tasks List */}
              <div className="space-y-2.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                  <ListTodo className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Audit Task Checklist</span>
                </span>
                <ul className="space-y-2">
                  {currentPhase.detailedTasks.map((task, i) => {
                    const checkKey = `${currentPhase.phaseNumber}-task-${i}`;
                    const isChecked = !!completedItems[checkKey];
                    return (
                      <li
                        key={i}
                        onClick={() =>
                          handleToggleTodo(currentPhase.phaseNumber, i, "task")
                        }
                        className="flex items-start gap-2 p-2 bg-slate-50 hover:bg-slate-100/60 rounded-lg text-xs cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // Click is handled key item
                          title="Toggle task completion"
                          aria-label="Toggle task completion"
                          className="w-3.5 h-3.5 accent-indigo-600 mt-0.5 pointer-events-none"
                        />
                        <span
                          className={`text-[11px] text-slate-600 leading-normal ${isChecked ? "line-through text-slate-400 font-normal" : "font-medium"} truncate overflow-hidden`}
                        >
                          {task}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>

          {/* Readiness criteria bar */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5 mb-2">
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Launch Readiness Criteria</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {currentPhase.readinessCriteria.map((c, i) => {
                const checkKey = `${currentPhase.phaseNumber}-criteria-${i}`;
                const isChecked = !!completedItems[checkKey];
                return (
                  <span
                    key={i}
                    onClick={() =>
                      handleToggleTodo(currentPhase.phaseNumber, i, "criteria")
                    }
                    className={`px-2.5 py-1 border rounded-lg text-[10px] font-sans font-semibold cursor-pointer transition-all select-none ${
                      isChecked
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                        : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {isChecked ? "✓ " : ""}{" "}
                    <span className="inline-block truncate max-w-60">{c}</span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
