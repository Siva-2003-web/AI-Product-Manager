import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  ProjectState,
  ProjectOverview,
  SprintPlan,
  DatabaseSchema,
  UIWireframeConfig,
  APISpecification,
  RoadmapPhase,
} from "./types";
import ProjectSetup from "./components/ProjectSetup";
import OverviewTab from "./components/OverviewTab";
import PRDTab from "./components/PRDTab";
import UserStoriesTab from "./components/UserStoriesTab";
import DatabaseSchemaTab from "./components/DatabaseSchemaTab";
import UIWireframeTab from "./components/UIWireframeTab";
import APISpecificationTab from "./components/APISpecificationTab";
import DevelopmentRoadmapTab from "./components/DevelopmentRoadmapTab";
import PMPrioritizationTab from "./components/PMPrioritizationTab";
import { exportAllArtifactsAsPDF } from "./utils/pdfExporter";
import { THEME_PRESETS, ThemeStyle } from "./utils/themePresets";

import {
  Sparkles,
  Cpu,
  Layers,
  FileText,
  CheckSquare,
  Database,
  Layout,
  Network,
  CalendarRange,
  Code2,
  Trash2,
  ArrowUpRight,
  Check,
  AlertCircle,
  RefreshCw,
  FileDown,
  MessageSquare,
  TrendingUp,
  LogOut,
} from "lucide-react";

const BUILD_STEPS_INFO = [
  {
    id: "overview",
    label: "Product Overview",
    agent: "Business Analyst",
    icon: Layers,
  },
  {
    id: "prd",
    label: "Product Spec (PRD)",
    agent: "Senior Solutions Architect",
    icon: FileText,
  },
  {
    id: "userStories",
    label: "Sprint Backlog",
    agent: "Agile Product Owner",
    icon: CheckSquare,
  },
  {
    id: "databaseSchema",
    label: "Entity Schemas",
    agent: "Database Expert",
    icon: Database,
  },
  {
    id: "uiWireframe",
    label: "UI Wireframes",
    agent: "Lead UI Designer",
    icon: Layout,
  },
  {
    id: "apiStructure",
    label: "REST Gateway Specs",
    agent: "Sanjay Patel (API Staff)",
    icon: Network,
  },
  {
    id: "roadmap",
    label: "Rollout Roadmap",
    agent: "Release Architect",
    icon: CalendarRange,
  },
];

const PROGRESS_WIDTH_CLASSES: Record<number, string> = {
  0: "w-0",
  5: "w-[5%]",
  10: "w-[10%]",
  15: "w-[15%]",
  20: "w-[20%]",
  25: "w-1/4",
  30: "w-[30%]",
  35: "w-[35%]",
  40: "w-2/5",
  45: "w-[45%]",
  50: "w-1/2",
  55: "w-[55%]",
  60: "w-3/5",
  65: "w-[65%]",
  70: "w-[70%]",
  75: "w-3/4",
  80: "w-4/5",
  85: "w-[85%]",
  90: "w-[90%]",
  95: "w-[95%]",
  100: "w-full",
};

function getProgressWidthClass(progress: number): string {
  const bucket = Math.max(0, Math.min(100, Math.round(progress / 5) * 5));
  return PROGRESS_WIDTH_CLASSES[bucket] ?? "w-0";
}

export default function App() {
  const [project, setProject] = useState<ProjectState | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [loaderStatus, setLoaderStatus] = useState<string>("");
  const [buildProgress, setBuildProgress] = useState<number | null>(null);
  const [currentBuildStep, setCurrentBuildStep] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(true);

  // Backups / historical projects list in client-side localStorage
  const [history, setHistory] = useState<ProjectState[]>([]);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);

  // Check health and load cache on mount
  useEffect(() => {
    // Check if server API and Key are alive
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        setHasApiKey(data.hasApiKey);
      })
      .catch((err) => console.error("Health check error:", err));

    // Support loading from dynamic hash-share links securely
    const hash = window.location.hash;
    if (hash && hash.startsWith("#shared=")) {
      try {
        const rawBase64 = hash.substring(8);
        if (rawBase64) {
          const jsonStr = decodeURIComponent(escape(atob(rawBase64)));
          const decodedProject = JSON.parse(jsonStr) as ProjectState;
          if (decodedProject && decodedProject.id) {
            setProject(decodedProject);
            localStorage.setItem(
              "ai_pm_active_project",
              JSON.stringify(decodedProject),
            );
            setActiveTab("overview");
            window.history.replaceState(null, "", window.location.pathname);
            return;
          }
        }
      } catch (err) {
        console.error("Shared project parsing fail:", err);
      }
    }

    // Load history and active project from local state
    try {
      const storedHistory = localStorage.getItem("ai_pm_history");
      const storedActive = localStorage.getItem("ai_pm_active_project");
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
      if (storedActive) {
        const parsed = JSON.parse(storedActive);
        setProject(parsed);
      }
    } catch (e) {
      console.error("Local storage restoration fail:", e);
    }
  }, []);

  const handleLogout = () => {
    setUser(null);
    window.location.href = "/";
  };

  // Sync state to local storage
  const saveProjectStateToStorage = (proj: ProjectState | null) => {
    if (proj) {
      localStorage.setItem("ai_pm_active_project", JSON.stringify(proj));

      // Upsert into history lists
      setHistory((prev) => {
        const filtered = prev.filter((item) => item.id !== proj.id);
        const updated = [proj, ...filtered].slice(0, 5); // Keep top 5
        localStorage.setItem("ai_pm_history", JSON.stringify(updated));
        return updated;
      });
    } else {
      localStorage.removeItem("ai_pm_active_project");
    }
  };

  const handleCreateNewProject = (
    idea: string,
    techKeywords: string,
    extraDetails: string,
    theme: ThemeStyle,
  ) => {
    setIsLoading(true);
    setBuildProgress(5);
    setCurrentBuildStep("overview");
    setLoaderStatus(
      "Orchestrating Business Analyst agent (Overview Generation)...",
    );

    const newProj: ProjectState = {
      id: Math.random().toString(36).substring(2, 9),
      idea,
      techKeywords,
      extraDetails,
      themePreference: theme,
      createdAt: new Date().toISOString(),
    };

    // First, call generate endpoint key-value for Overview
    fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idea: `Idea: ${idea}. Technology stack keywords preferred: ${techKeywords}.`,
        artifactType: "overview",
        extraDetails,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("BA Agent overview generation timed out.");
        return res.json();
      })
      .then((data) => {
        const updated = { ...newProj, overview: data.output };
        setProject(updated);
        saveProjectStateToStorage(updated);
        setActiveTab("overview");
        setBuildProgress(15);

        // Kickoff background generation sequence for other files progressively
        triggerProgressiveBuild(updated, true);
      })
      .catch((err) => {
        alert(
          err.message ||
            "Failed to initialize virtual teams. Please verify your system API settings.",
        );
        setIsLoading(false);
        setBuildProgress(null);
        setCurrentBuildStep(null);
      });
  };

  // Triggers progressive load sequence sequentially so the user doesn't wait high durations
  const triggerProgressiveBuild = async (
    currentProj: ProjectState,
    isFromScratch: boolean = false,
  ) => {
    setIsLoading(true);
    const listToProgress = [
      { type: "prd", label: "Product Specifications & Goals (PRD)" },
      { type: "userStories", label: "Sprint backlogs and User Stories" },
      { type: "databaseSchema", label: "Model schemas & data relationships" },
      { type: "uiWireframe", label: "User Interface wireframes & layout grid" },
      { type: "apiStructure", label: "REST endpoint gateway specifications" },
      { type: "roadmap", label: "Incremental rollout milestones & roadmaps" },
    ];

    let stateObj = { ...currentProj };
    const totalSteps = isFromScratch ? 7 : 6;

    for (let i = 0; i < listToProgress.length; i++) {
      const step = listToProgress[i];
      setCurrentBuildStep(step.type);

      const stepIndex = isFromScratch ? i + 1 : i;
      const currentPercent = Math.min(
        98,
        Math.round(((stepIndex + 0.3) / totalSteps) * 100),
      );
      setBuildProgress(currentPercent);

      setLoaderStatus(`Virtual agent designing: ${step.label}...`);
      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idea: stateObj.idea,
            artifactType:
              step.type === "roadmap" ? "developmentRoadmap" : step.type,
            currentContext: stateObj.overview,
            extraDetails: stateObj.extraDetails,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          // Map correct target parameters
          stateObj = { ...stateObj, [step.type]: result.output };
          setProject(stateObj);
          saveProjectStateToStorage(stateObj);
        }
      } catch (e) {
        console.error(`Progressive generation error on step: ${step.type}`, e);
      }

      const postPercent = Math.round(((stepIndex + 1) / totalSteps) * 100);
      setBuildProgress(Math.min(100, postPercent));
    }

    setIsLoading(false);
    setLoaderStatus("");
    setBuildProgress(null);
    setCurrentBuildStep(null);
  };

  const handleTriggerRebuildStep = async (type: string) => {
    if (!project) return;
    setIsLoading(true);
    setLoaderStatus(`Regenerating specialized ${type} blueprint components...`);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: project.idea,
          artifactType: type === "roadmap" ? "developmentRoadmap" : type,
          currentContext: project.overview,
          extraDetails: project.extraDetails,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const updated = { ...project, [type]: result.output };
        setProject(updated);
        saveProjectStateToStorage(updated);
      } else {
        alert("Regeneration failed. Check API configuration setup.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
      setLoaderStatus("");
    }
  };

  const handleChangeTheme = (theme: ThemeStyle) => {
    if (!project) return;
    const updated = { ...project, themePreference: theme };
    setProject(updated);
    saveProjectStateToStorage(updated);
  };

  const handleResetWorkspace = () => {
    if (
      confirm(
        "Reset current blueprint workspace and start a new product catalog?",
      )
    ) {
      setProject(null);
      localStorage.removeItem("ai_pm_active_project");
    }
  };

  const loadHistoryItem = (item: ProjectState) => {
    setProject(item);
    localStorage.setItem("ai_pm_active_project", JSON.stringify(item));
    setActiveTab("overview");
  };

  const deleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    localStorage.setItem("ai_pm_history", JSON.stringify(updated));
  };

  const currentThemeStyle: ThemeStyle =
    project?.themePreference || "Industrial";
  const themePresetData = THEME_PRESETS[currentThemeStyle];

  return (
    <div
      className={`min-h-screen ${project ? themePresetData.bgClass : "bg-slate-100"} flex flex-col font-sans text-slate-900 transition-colors duration-300 overflow-x-hidden`}
    >
      {/* Dynamic Header Section */}
      <header className="bg-white border-b-2 border-slate-900 px-4 sm:px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-extrabold text-2xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] border-2 border-slate-900 select-none">
            Σ
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              SYNTHESIS{" "}
              <span className="text-indigo-600 font-extrabold">AI</span>
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              Product Architect &amp; Builder Suite
            </p>
          </div>
        </div>
        {/* Global actions and metrics */}
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 border-2 border-slate-900 rounded-xl shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                {user.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <span className="text-xs font-bold text-slate-800 hidden sm:inline">
                {user.name}
              </span>
            </div>
          )}

          {project && (
            <div className="flex items-center gap-3">
              {/* Overlapping collaborative avatars */}
              <div
                className="hidden sm:flex items-center -space-x-1.5 mr-1 select-none"
                title="Colleague PMs viewing the blueprint"
              >
                <span
                  className="w-7 h-7 rounded-full bg-indigo-600 border-2 border-white text-white text-[9px] font-black flex items-center justify-center hover:-translate-y-0.5 transition-transform shadow-xs"
                  title="Sarah Jenkins (Senior Product Director)"
                >
                  SJ
                </span>
                <span
                  className="w-7 h-7 rounded-full bg-emerald-600 border-2 border-white text-white text-[9px] font-black flex items-center justify-center hover:-translate-y-0.5 transition-transform shadow-xs"
                  title="David Kim (Lead Systems Architect)"
                >
                  DK
                </span>
                <span
                  className="w-7 h-7 rounded-full bg-amber-500 border-2 border-white text-white text-[9px] font-black flex items-center justify-center hover:-translate-y-0.5 transition-transform shadow-xs"
                  title="Elena Rostova (AI Orchestrator PM)"
                >
                  ER
                </span>
                <span
                  className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white text-slate-500 text-[8px] font-bold flex items-center justify-center hover:-translate-y-0.5 transition-transform"
                  title="Interactive Peer Connect active"
                >
                  +3
                </span>
              </div>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-xs font-semibold">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span>Workspace Sync Active</span>
              </div>
            </div>
          )}

          {project && (
            <button
              onClick={handleResetWorkspace}
              disabled={isLoading}
              className="bg-slate-900 hover:bg-slate-800 active:bg-slate-900 disabled:bg-slate-300 text-white font-extrabold text-xs px-4 py-2.5 rounded-full border-2 border-slate-900 transition-all shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:shadow-none active:translate-y-0.5 cursor-pointer flex items-center gap-1.5"
              title="Start a new chat session for a fresh concept"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>New Chat &amp; Fresh Concept</span>
            </button>
          )}

          <button
            onClick={handleLogout}
            className="bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-full border-2 border-slate-900 transition-all shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:shadow-none active:translate-y-0.5 cursor-pointer flex items-center gap-1.5"
            title="Log out of your account"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="grow p-3 sm:p-4 md:p-6 lg:p-8 max-w-360 w-full mx-auto flex flex-col gap-6">
        {/* Loading Overlay */}
        {isLoading &&
          (buildProgress !== null ? (
            <div className="border-2 border-slate-900 bg-white shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] rounded-3xl p-6 flex flex-col gap-6 no-print">
              {/* Header block */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-block w-2.5 h-2.5 bg-indigo-600 rounded-full animate-ping" />
                    <span className="text-[10px] uppercase tracking-widest text-indigo-600 font-black">
                      Progressive Build Pipeline
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    Orchestrating Autonomous PM Scrum Session
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Designing, drafting, and validating the holistic product
                    blueprint sequentially.
                  </p>
                </div>
                <div className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-slate-700">
                    BUILD TRACK:
                  </span>
                  <span className="font-mono text-sm font-black text-indigo-600 bg-white px-2 py-0.5 rounded-lg border border-slate-100">
                    {buildProgress}%
                  </span>
                </div>
              </div>

              {/* Progress bar tracker */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                  <span className="flex items-center gap-1.5 font-mono text-slate-900 font-extrabold">
                    <Cpu className="w-4 h-4 text-indigo-600 animate-spin" />
                    {loaderStatus}
                  </span>
                  <span className="text-slate-400 font-mono">
                    {Math.round((buildProgress / 100) * 7)} / 7 steps
                  </span>
                </div>

                {/* Visual track */}
                <div className="h-4 bg-slate-100 rounded-full overflow-hidden border-2 border-slate-900 p-0.5 flex">
                  <div
                    className={`h-full bg-indigo-600 rounded-full transition-all duration-500 ease-out ${getProgressWidthClass(buildProgress)}`}
                  />
                </div>
              </div>

              {/* Sub-steps agents check-list grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                {BUILD_STEPS_INFO.map((step, idx) => {
                  const isDone = !!(
                    project && project[step.id as keyof typeof project]
                  );
                  const isInProgress = currentBuildStep === step.id;
                  const StepIcon = step.icon;

                  let statusBadge = (
                    <span className="inline-flex items-center gap-1.5 text-[9px] font-black tracking-wider uppercase text-slate-400 bg-slate-50 border border-slate-150 px-2 py-1 rounded-md">
                      Pending
                    </span>
                  );
                  let cardBorderClass =
                    "border-slate-200 bg-slate-50/50 opacity-60";

                  if (isInProgress) {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[9px] font-black tracking-wider uppercase px-2 py-1 rounded-md animate-pulse">
                        <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-ping mr-1" />
                        Building
                      </span>
                    );
                    cardBorderClass =
                      "border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-500/20";
                  } else if (isDone) {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-bold tracking-wider uppercase px-2 py-1 rounded-md">
                        <Check className="w-3 h-3 text-emerald-600 animate-pulse" />
                        Drafted
                      </span>
                    );
                    cardBorderClass = "border-emerald-500 bg-emerald-50/25";
                  }

                  return (
                    <div
                      key={step.id}
                      className={`border-2 rounded-2xl p-3.5 transition-all duration-300 flex flex-col justify-between gap-3 ${cardBorderClass}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-1.5 rounded-lg border ${
                              isDone
                                ? "bg-emerald-150/40 border-emerald-200 text-emerald-700"
                                : isInProgress
                                  ? "bg-indigo-150/40 border-indigo-200 text-indigo-700 animate-spin"
                                  : "bg-slate-100 border-slate-200 text-slate-400"
                            }`}
                          >
                            <StepIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[9px] font-extrabold tracking-wider text-slate-400 block font-mono">
                              AGENT 0{idx + 1}
                            </span>
                            <span className="text-xs font-black text-slate-800 line-clamp-1">
                              {step.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 border-t border-slate-100/50 pt-2 text-[10px]">
                        <span
                          className="font-mono text-slate-500 truncate"
                          title={step.agent}
                        >
                          {step.agent}
                        </span>
                        {statusBadge}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl flex items-center gap-4 shadow-sm text-indigo-900 text-sm animate-pulse no-print">
              <Cpu className="w-5 h-5 text-indigo-600 animate-spin shrink-0" />
              <div className="grow">
                <span className="font-bold">
                  Virtual Planning Agent Active:{" "}
                </span>
                <span className="text-indigo-950 font-medium font-mono">
                  {loaderStatus}
                </span>
              </div>
              <span className="text-xs text-indigo-500 bg-white px-2 py-0.5 rounded-full font-bold border border-indigo-100">
                Orchestrating...
              </span>
            </div>
          ))}

        {/* Landing Workspace or Project Dashboard */}
        {!project ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8">
              <ProjectSetup
                onGenerate={handleCreateNewProject}
                isLoading={isLoading}
                hasApiKey={hasApiKey}
              />
            </div>

            {/* Side board history / presets panel */}
            <div className="lg:col-span-4 bg-white border-2 border-slate-900 rounded-3xl p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] space-y-6">
              <div>
                <h3 className="text-md font-bold text-slate-900 flex items-center gap-1.5">
                  <RefreshCw className="w-4.5 h-4.5 text-indigo-600" />
                  <span>Recent Workspaces</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Quick-restore previously engineered blueprints cached in local
                  memory
                </p>
              </div>

              {history.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-200 bg-slate-50 rounded-2xl">
                  <span className="text-xl">🗄️</span>
                  <p className="text-xs font-bold text-slate-400 mt-2">
                    No active sessions cached yet
                  </p>
                  <p className="text-[10px] text-slate-400 max-w-37.5 mx-auto mt-1">
                    Specify an idea to build complete interactive catalogs.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-95 overflow-y-auto pr-1 custom-scrollbar font-sans">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => loadHistoryItem(item)}
                      className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 hover:border-indigo-300 transition-all cursor-pointer flex justify-between items-start gap-4 group"
                    >
                      <div className="space-y-1 overflow-hidden">
                        <span className="block font-bold text-slate-900 text-xs truncate group-hover:text-indigo-600 transition-colors">
                          {item.overview?.elevatorPitch ||
                            "Product Concept Catalog"}
                        </span>
                        <p className="text-[10px] text-slate-400 line-clamp-1 italic">
                          {item.idea}
                        </p>
                      </div>

                      <button
                        onClick={(e) => deleteHistoryItem(e, item.id)}
                        disabled={isLoading}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Main Bento Dashboard Workspace */
          <div className="space-y-6">
            {/* Bento Brain Input Card (Constant preview) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Primary session info banner */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className={`lg:col-span-8 ${themePresetData.primaryCard}`}
              >
                <div className="flex justify-between items-start gap-3 mb-4">
                  <div className="space-y-1">
                    <span className={themePresetData.badgeTag}>
                      Current Live Session
                    </span>
                    <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mt-1 leading-tight text-slate-950">
                      &ldquo;
                      {project.overview?.elevatorPitch ||
                        "Product Ideation Catalyst"}
                      &rdquo;
                    </h2>
                  </div>
                </div>

                <div className="bg-slate-50/70 border border-slate-200/60 rounded-xl p-3.5 text-xs text-slate-600 italic leading-relaxed">
                  <strong>User Requirement Input:</strong> {project.idea}
                </div>

                {/* Micro tech tags */}
                <div className="flex flex-wrap items-center gap-1.5 mt-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-1">
                    Preferred Stack:
                  </span>
                  {project.techKeywords.split(",").map((tag, idx) => (
                    <span key={idx} className={themePresetData.badgeTag}>
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Blueprint Summary Bento Stat Box */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
                className={`lg:col-span-4 ${themePresetData.statCard}`}
              >
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/85">
                    System Architecture Blueprint
                  </h3>

                  <div className="grid grid-cols-2 gap-3 mt-4 text-xs font-sans">
                    <div className="bg-black/15 p-2 rounded-xl border border-white/10">
                      <span className="block text-white/70 text-[9px] font-extrabold uppercase">
                        PRD Output
                      </span>
                      <span className="block text-white font-bold mt-0.5">
                        {project.prd ? "✓ Ready" : "⏰ Building..."}
                      </span>
                    </div>
                    <div className="bg-black/15 p-2 rounded-xl border border-white/10">
                      <span className="block text-white/70 text-[9px] font-extrabold uppercase">
                        Sprint Backlog
                      </span>
                      <span className="block text-white font-bold mt-0.5">
                        {project.userStories ? "✓ Ready" : "⏰ Building..."}
                      </span>
                    </div>
                    <div className="bg-black/15 p-2 rounded-xl border border-white/10">
                      <span className="block text-white/70 text-[9px] font-extrabold uppercase">
                        Data Models
                      </span>
                      <span className="block text-white font-bold mt-0.5">
                        {project.databaseSchema ? "✓ Ready" : "⏰ Building..."}
                      </span>
                    </div>
                    <div className="bg-black/15 p-2 rounded-xl border border-white/10">
                      <span className="block text-white/70 text-[9px] font-extrabold uppercase">
                        UI Wireframe
                      </span>
                      <span className="block text-white font-bold mt-0.5">
                        {project.uiWireframe ? "✓ Ready" : "⏰ Building..."}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Workspace Live Theme Selector controls */}
                <div className="mt-4 pt-3 border-t border-white/10 no-print">
                  <div className="flex items-center justify-between text-[10px] text-white/80 font-bold uppercase tracking-wider mb-2">
                    <span>Active Workspace Theme</span>
                    <span className="text-[8px] font-mono opacity-60">
                      apply styles
                    </span>
                  </div>
                  <div className="grid grid-cols-3 bg-black/20 p-1 rounded-xl gap-1 border border-white/5">
                    {(
                      ["Industrial", "Minimalist", "Playful"] as ThemeStyle[]
                    ).map((thm) => {
                      const isSel = currentThemeStyle === thm;
                      return (
                        <button
                          key={thm}
                          id={`workspace-btn-${thm.toLowerCase()}`}
                          onClick={() => handleChangeTheme(thm)}
                          className={`text-[10px] py-1.5 rounded-lg font-black transition-all cursor-pointer ${
                            isSel
                              ? "bg-white text-slate-900 shadow-sm"
                              : "text-white/70 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {thm}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 text-[10px] text-white/70 font-medium flex justify-between items-center mt-3">
                  <span>Engine: gemini-3.5-flash</span>
                  <span
                    className="font-bold underline cursor-pointer hover:text-white"
                    onClick={() => triggerProgressiveBuild(project)}
                  >
                    Regen Suite ↺
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Tab navigation rail for maximized interactive bento views */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center border-b border-slate-200 pb-3 no-print">
              <div className="flex flex-wrap gap-2.5">
                {[
                  {
                    id: "overview",
                    label: "Dashboard",
                    icon: Layers,
                    isReady: !!project.overview,
                  },
                  {
                    id: "prd",
                    label: "PRD",
                    icon: FileText,
                    isReady: !!project.prd,
                  },
                  {
                    id: "userStories",
                    label: "User Stories",
                    icon: CheckSquare,
                    isReady: !!project.userStories,
                  },
                  {
                    id: "pmPrioritization",
                    label: "PM Prioritizer",
                    icon: TrendingUp,
                    isReady: true,
                  },
                  {
                    id: "databaseSchema",
                    label: "Database Schema",
                    icon: Database,
                    isReady: !!project.databaseSchema,
                  },
                  {
                    id: "uiWireframe",
                    label: "UI Wireframes",
                    icon: Layout,
                    isReady: !!project.uiWireframe,
                  },
                  {
                    id: "apiStructure",
                    label: "API Structure",
                    icon: Network,
                    isReady: !!project.apiStructure,
                  },
                  {
                    id: "developmentRoadmap",
                    label: "Milestones Roadmap",
                    icon: CalendarRange,
                    isReady: !!project.roadmap,
                  },
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={themePresetData.tabButton(isActive)}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{tab.label}</span>
                      {!tab.isReady && (
                        <span
                          className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping shrink-0"
                          title="Constructing..."
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto shrink-0">
                {/* New Chat & Fresh Concept Action */}
                <button
                  disabled={isLoading}
                  onClick={handleResetWorkspace}
                  className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white border-2 border-slate-900 rounded-xl font-black text-xs transition-all shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-none active:translate-y-0.5 cursor-pointer font-sans"
                  title="Start a fresh chat concept from scratch and reset current workspace"
                >
                  <MessageSquare className="w-4 h-4 text-indigo-100" />
                  <span>New Chat &amp; Start Fresh Concept</span>
                </button>

                {/* Mega Concatenated Exports Action */}
                <button
                  disabled={isExportingPDF}
                  onClick={async () => {
                    if (isExportingPDF) return;
                    setIsExportingPDF(true);
                    try {
                      await exportAllArtifactsAsPDF({
                        projectName:
                          project.overview?.elevatorPitch ||
                          "Synthesis Product Blueprint",
                        elevatorPitch: project.overview?.elevatorPitch || "",
                        idea: project.idea,
                        techKeywords: project.techKeywords,
                        prdMarkdown: project.prd,
                        userStories: project.userStories,
                        roadmap: project.roadmap,
                        projectId: project.id,
                      });
                    } catch (err) {
                      console.error("Failed to render PDF document:", err);
                    } finally {
                      setIsExportingPDF(false);
                    }
                  }}
                  className={`w-full lg:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-white border-2 border-slate-900 rounded-xl font-black text-xs transition-all font-sans ${
                    isExportingPDF
                      ? "bg-slate-400 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-none active:translate-y-0.5 cursor-pointer"
                  }`}
                  title="Concatenate PRD, User Stories and Roadmap Milestone checklists into a single multi-page formal corporate PDF"
                >
                  {isExportingPDF ? (
                    <>
                      <RefreshCw className="w-4 h-4 text-emerald-100 animate-spin" />
                      <span>Processing & Drawing PDF...</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4 text-emerald-100" />
                      <span>Export All Artifacts as PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Active maximized Bento component */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={themePresetData.maximizedContainer}
            >
              {activeTab === "overview" && (
                <OverviewTab overview={project.overview} />
              )}

              {activeTab === "prd" &&
                (project.prd ? (
                  <PRDTab prdMarkdown={project.prd} project={project} />
                ) : (
                  <div className="text-center py-16 font-sans">
                    <Cpu className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
                    <h3 className="font-bold text-slate-800 text-sm">
                      Synthesizing Product Requirement Document...
                    </h3>
                    <p className="text-xs text-slate-400 max-w-62.5 mx-auto mt-1">
                      Specialized Business Analyst is cataloging requirements.
                      Click the regenerate button to speed up.
                    </p>
                    <button
                      onClick={() => handleTriggerRebuildStep("prd")}
                      className="mt-4 px-3 py-1.5 border border-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                      Re-trigger Agent
                    </button>
                  </div>
                ))}

              {activeTab === "userStories" &&
                (project.userStories ? (
                  <UserStoriesTab
                    sprintPlans={project.userStories}
                    projectId={project.id}
                  />
                ) : (
                  <div className="text-center py-16 font-sans">
                    <Cpu className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
                    <h3 className="font-bold text-slate-800 text-sm">
                      Drafting Agile User Stories &amp; Sprint Sizing...
                    </h3>
                    <p className="text-xs text-slate-400 max-w-62.5 mx-auto mt-1">
                      Our Scrum Master is cataloging tasks and estimating
                      points.
                    </p>
                    <button
                      onClick={() => handleTriggerRebuildStep("userStories")}
                      className="mt-4 px-3 py-1.5 border border-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                      Re-trigger Agent
                    </button>
                  </div>
                ))}

              {activeTab === "pmPrioritization" && (
                <PMPrioritizationTab project={project} />
              )}

              {activeTab === "databaseSchema" &&
                (project.databaseSchema ? (
                  <DatabaseSchemaTab schema={project.databaseSchema} />
                ) : (
                  <div className="text-center py-16 font-sans">
                    <Cpu className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
                    <h3 className="font-bold text-slate-800 text-sm">
                      Building Data Blueprints &amp; Primary Relations...
                    </h3>
                    <p className="text-xs text-slate-400 max-w-62.5 mx-auto mt-1">
                      System Architect is engineering relational constraints.
                    </p>
                    <button
                      onClick={() => handleTriggerRebuildStep("databaseSchema")}
                      className="mt-4 px-3 py-1.5 border border-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                      Re-trigger Agent
                    </button>
                  </div>
                ))}

              {activeTab === "uiWireframe" &&
                (project.uiWireframe ? (
                  <UIWireframeTab
                    wireframe={project.uiWireframe}
                    project={project}
                  />
                ) : (
                  <div className="text-center py-16 font-sans">
                    <Cpu className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
                    <h3 className="font-bold text-slate-800 text-sm">
                      Creating Wireframes &amp; Layout grids...
                    </h3>
                    <p className="text-xs text-slate-400 max-w-62.5 mx-auto mt-1">
                      UX Designer is composing mockup alignments and views.
                    </p>
                    <button
                      onClick={() => handleTriggerRebuildStep("uiWireframe")}
                      className="mt-4 px-3 py-1.5 border border-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                      Re-trigger Agent
                    </button>
                  </div>
                ))}

              {activeTab === "apiStructure" &&
                (project.apiStructure ? (
                  <APISpecificationTab apiSpec={project.apiStructure} />
                ) : (
                  <div className="text-center py-16 font-sans">
                    <Cpu className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
                    <h3 className="font-bold text-slate-800 text-sm">
                      Mapping Web API Endpoint Security &amp; Schemas...
                    </h3>
                    <p className="text-xs text-slate-400 max-w-62.5 mx-auto mt-1">
                      Lead Backend Engineer model specification parsing...
                    </p>
                    <button
                      onClick={() => handleTriggerRebuildStep("apiStructure")}
                      className="mt-4 px-3 py-1.5 border border-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                      Re-trigger Agent
                    </button>
                  </div>
                ))}

              {activeTab === "developmentRoadmap" &&
                (project.roadmap ? (
                  <DevelopmentRoadmapTab
                    roadmap={project.roadmap}
                    projectId={project.id}
                  />
                ) : (
                  <div className="text-center py-16 font-sans">
                    <Cpu className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
                    <h3 className="font-bold text-slate-800 text-sm">
                      Establishing Milestone Sequences &amp; Phasing...
                    </h3>
                    <p className="text-xs text-slate-400 max-w-62.5 mx-auto mt-1">
                      Project Coordinator structuring phase checklists...
                    </p>
                    <button
                      onClick={() => handleTriggerRebuildStep("roadmap")}
                      className="mt-4 px-3 py-1.5 border border-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                      Re-trigger Agent
                    </button>
                  </div>
                ))}
            </motion.div>
          </div>
        )}
      </div>

      {/* Aesthetic Footer Status Bar precisely matching the Bento Theme instructions */}
      <footer className="mt-auto border-t-2 border-slate-900 bg-white py-4 px-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest shrink-0 select-none no-print">
        <div className="flex flex-wrap gap-4 items-center justify-center">
          <span>
            Local Environment:{" "}
            <span className="text-slate-900 font-extrabold font-mono">
              V2.1.0-STABLE
            </span>
          </span>
          <span className="hidden sm:inline text-slate-350">•</span>
          <span>
            Core Agent Sync:{" "}
            <span className="text-slate-900 font-extrabold font-mono">
              SY-PREMIUM-03
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span>Architecture Workspace Ready</span>
        </div>
      </footer>
    </div>
  );
}
