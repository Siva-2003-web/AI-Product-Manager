import React, { useState, useEffect } from "react";
import { SprintPlan, UserStory } from "../types";
import {
  Calendar,
  Tag,
  CheckSquare,
  Sparkles,
  Filter,
  ChevronRight,
  ChevronDown,
  Download,
  CheckSquare as CheckIcon,
} from "lucide-react";
import SprintBurndownChart from "./SprintBurndownChart";
import CommentSection from "./CommentSection";

interface UserStoriesTabProps {
  sprintPlans: SprintPlan[] | undefined;
  projectId?: string;
}

export default function UserStoriesTab({
  sprintPlans,
  projectId,
}: UserStoriesTabProps) {
  const [selectedSprintIdx, setSelectedSprintIdx] = useState(0);
  const [expandedStoryId, setExpandedStoryId] = useState<string | null>(null);

  const [checkedCriteria, setCheckedCriteria] = useState<
    Record<string, boolean>
  >(() => {
    if (!projectId) return {};
    try {
      const saved = localStorage.getItem(`ai_pm_${projectId}_checked_criteria`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [completedStoryIds, setCompletedStoryIds] = useState<
    Record<string, boolean>
  >(() => {
    if (!projectId) return {};
    try {
      const saved = localStorage.getItem(
        `ai_pm_${projectId}_completed_stories`,
      );
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Keep them in sync when project changes
  useEffect(() => {
    if (!projectId) return;
    try {
      const savedCriteria = localStorage.getItem(
        `ai_pm_${projectId}_checked_criteria`,
      );
      setCheckedCriteria(savedCriteria ? JSON.parse(savedCriteria) : {});

      const savedStories = localStorage.getItem(
        `ai_pm_${projectId}_completed_stories`,
      );
      setCompletedStoryIds(savedStories ? JSON.parse(savedStories) : {});
    } catch {
      // ignore
    }
  }, [projectId]);

  // Keep localStorage updated when state changes
  useEffect(() => {
    if (!projectId) return;
    localStorage.setItem(
      `ai_pm_${projectId}_checked_criteria`,
      JSON.stringify(checkedCriteria),
    );
  }, [checkedCriteria, projectId]);

  useEffect(() => {
    if (!projectId) return;
    localStorage.setItem(
      `ai_pm_${projectId}_completed_stories`,
      JSON.stringify(completedStoryIds),
    );
  }, [completedStoryIds, projectId]);

  if (!sprintPlans || sprintPlans.length === 0) return null;

  const currentSprint = sprintPlans[selectedSprintIdx];
  const totalStoryPoints = currentSprint.stories.reduce(
    (acc, story) => acc + story.storyPoints,
    0,
  );

  const toggleStory = (id: string) => {
    setExpandedStoryId(expandedStoryId === id ? null : id);
  };

  const handleToggleCriteria = (
    storyId: string,
    criteriaIdx: number,
    currentStory: UserStory,
  ) => {
    const key = `${storyId}-${criteriaIdx}`;
    const nextChecked = !checkedCriteria[key];

    const updatedChecked = { ...checkedCriteria, [key]: nextChecked };
    setCheckedCriteria(updatedChecked);

    // Auto-update story completion status based on all acceptance criteria checked
    const hasCriteria = currentStory.acceptanceCriteria.length > 0;
    if (hasCriteria) {
      const allChecked = currentStory.acceptanceCriteria.every((_, idx) => {
        const checkKey = `${storyId}-${idx}`;
        return checkKey === key ? nextChecked : !!checkedCriteria[checkKey];
      });
      setCompletedStoryIds((prev) => ({ ...prev, [storyId]: allChecked }));
    }
  };

  const handleToggleStoryCompletion = (story: UserStory) => {
    const isNowCompleted = !completedStoryIds[story.id];
    setCompletedStoryIds((prev) => ({ ...prev, [story.id]: isNowCompleted }));

    // Sync all corresponding acceptance criteria
    const updated = { ...checkedCriteria };
    story.acceptanceCriteria.forEach((_, idx) => {
      const key = `${story.id}-${idx}`;
      updated[key] = isNowCompleted;
    });
    setCheckedCriteria(updated);
  };

  const handleDownloadCSV = (sprint: SprintPlan) => {
    const escapeCsv = (str: string) => {
      const escaped = str.replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const headers = [
      "Story ID",
      "Title",
      "Story Points",
      "Priority",
      "Role",
      "Want",
      "Benefit",
      "Acceptance Criteria",
      "Guidance Notes",
    ];

    const rows = sprint.stories.map((story) => [
      story.id,
      story.title,
      story.storyPoints.toString(),
      story.priority,
      story.role,
      story.want,
      story.benefit,
      story.acceptanceCriteria.join(" | "),
      story.notes || "",
    ]);

    const csvContent = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${sprint.sprintName.toLowerCase().replace(/\s+/g, "_")}_backlog.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="user-stories-tab" className="space-y-6 animate-fade-in">
      {/* Tab Navigation header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-md font-bold text-slate-900 flex items-center gap-1.5 font-sans">
            <Calendar className="w-4.5 h-4.5 text-indigo-600" />
            <span>Sprint Backlog &amp; User Stories</span>
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Scope grouped by sprints, estimated via story points
          </p>
        </div>

        {/* Sprint selector tabs as interactive cards */}
        <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-100">
          {sprintPlans.map((s, idx) => {
            const isActive = selectedSprintIdx === idx;
            return (
              <div
                key={idx}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all border ${
                  isActive
                    ? "bg-white text-indigo-600 shadow-xs border-slate-200/50"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/40 border-transparent"
                }`}
              >
                <button
                  onClick={() => {
                    setSelectedSprintIdx(idx);
                    setExpandedStoryId(null);
                  }}
                  className="font-bold text-xs font-sans cursor-pointer max-w-35 truncate"
                >
                  <span className="inline-block truncate">{s.sprintName}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadCSV(s);
                  }}
                  title={`Download ${s.sprintName} CSV`}
                  className={`p-1 rounded-md transition-colors cursor-pointer ${
                    isActive
                      ? "hover:bg-slate-100 text-indigo-500 hover:text-indigo-700"
                      : "hover:bg-slate-200/50 text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <Download className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Speed Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl flex flex-col justify-between items-start">
          <div className="space-y-1">
            <span className="text-xs font-bold text-indigo-500 block uppercase tracking-wider">
              Sprint Goal &amp; Focus
            </span>
            <span className="text-xs font-bold text-indigo-950 block truncate overflow-hidden max-w-full">
              {currentSprint.focus}
            </span>
          </div>
          <button
            onClick={() => handleDownloadCSV(currentSprint)}
            className="mt-3.5 inline-flex items-center gap-1 px-2.5 py-1 text-[10px] text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-md font-bold transition-all cursor-pointer shadow-xs shrink-0 self-start"
            title={`Download ${currentSprint.sprintName} CSV Backlog`}
          >
            <Download className="w-3 h-3" />
            <span>Download CSV</span>
          </button>
        </div>
        <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl flex flex-col justify-center">
          <span className="text-xs font-bold text-indigo-500 block uppercase tracking-wider">
            Estimated Story Points
          </span>
          <span className="text-xl font-black text-indigo-900 mt-0.5">
            {totalStoryPoints} pts
          </span>
        </div>
        <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl flex flex-col justify-center">
          <span className="text-xs font-bold text-indigo-500 block uppercase tracking-wider">
            Workforce Velocity
          </span>
          <span className="text-xs font-medium text-indigo-900 mt-1 block">
            Optimal team of 3 devs: {Math.ceil(totalStoryPoints / 10)} Sprints
          </span>
        </div>
      </div>

      {/* D3.js Sprint Burn-down Visual Analytics */}
      <SprintBurndownChart
        sprintPlans={sprintPlans}
        completedStoryIds={completedStoryIds}
      />

      {/* Stories list */}
      <div className="space-y-3">
        {currentSprint.stories.map((story) => {
          const isExpanded = expandedStoryId === story.id;
          const priorityColor =
            story.priority === "High"
              ? "bg-rose-50 text-rose-700 border-rose-100"
              : story.priority === "Medium"
                ? "bg-amber-50 text-amber-700 border-amber-100"
                : "bg-slate-100 text-slate-700 border-slate-200";

          return (
            <div
              key={story.id}
              className={`border rounded-xl transition-all bg-white hover:border-slate-300 ${
                isExpanded
                  ? "border-indigo-300 ring-4 ring-indigo-50"
                  : "border-slate-200"
              }`}
            >
              {/* Header card preview */}
              <div
                onClick={() => toggleStory(story.id)}
                className="p-4 flex items-start gap-4 justify-between cursor-pointer select-none font-sans"
              >
                <div className="flex items-start gap-3">
                  {/* Direct story completion toggle */}
                  <div
                    className="flex items-center mt-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={!!completedStoryIds[story.id]}
                      onChange={() => handleToggleStoryCompletion(story)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded cursor-pointer accent-indigo-600 border-slate-300 focus:ring-indigo-500"
                      title="Toggle direct completion of user story"
                    />
                  </div>
                  <span
                    className={`font-mono text-xs font-bold rounded px-1.5 py-0.5 mt-0.5 transition-all ${
                      completedStoryIds[story.id]
                        ? "bg-slate-200 text-slate-400 line-through border border-slate-200"
                        : "text-slate-400 bg-slate-50 border border-slate-200"
                    }`}
                  >
                    {story.id}
                  </span>
                  <div className="space-y-1">
                    <h4
                      className={`font-bold transition-all text-sm truncate max-w-105 ${
                        completedStoryIds[story.id]
                          ? "text-slate-400 line-through"
                          : "text-slate-900"
                      }`}
                    >
                      {story.title}
                    </h4>
                    <p
                      className={`text-xs transition-all line-clamp-1 leading-relaxed ${
                        completedStoryIds[story.id]
                          ? "text-slate-400 italic"
                          : "text-slate-600"
                      }`}
                    >
                      <strong>As a</strong> {story.role},{" "}
                      <strong>I want to</strong> {story.want},{" "}
                      <strong>so that</strong> {story.benefit}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityColor}`}
                  >
                    {story.priority}
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full">
                    {story.storyPoints} SP
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Collapsible detail panel */}
              {isExpanded && (
                <div className="border-t border-slate-100 p-4 bg-slate-50/50 space-y-4 text-xs font-sans">
                  {/* Detailed Description */}
                  <div className="space-y-1">
                    <span className="block font-bold text-slate-400 uppercase tracking-widest text-[9px]">
                      Requirement Definition
                    </span>
                    <p className="text-slate-700 leading-relaxed text-xs">
                      <strong>As a</strong> {story.role},<br />
                      <strong>I want to</strong> {story.want},<br />
                      <strong>So that</strong> {story.benefit}.
                    </p>
                  </div>

                  {/* Acceptance Criteria */}
                  <div className="space-y-2">
                    <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px] flex items-center gap-1">
                      <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Acceptance Criteria</span>
                    </span>
                    <ul className="space-y-1.5">
                      {story.acceptanceCriteria.map((ac, idx) => {
                        const checkedKey = `${story.id}-${idx}`;
                        const isChecked = !!checkedCriteria[checkedKey];
                        return (
                          <li
                            key={idx}
                            onClick={() =>
                              handleToggleCriteria(story.id, idx, story)
                            }
                            className="flex items-start gap-2.5 p-2 bg-white border border-slate-100 rounded-lg hover:border-slate-200 cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}} // Synced on click
                              title="Toggle acceptance criteria"
                              aria-label="Toggle acceptance criteria"
                              className="w-3.5 h-3.5 cursor-pointer accent-indigo-600 mt-0.5 rounded"
                            />
                            <span
                              className={`text-xs text-slate-600 ${isChecked ? "line-through text-slate-400" : ""} truncate overflow-hidden`}
                            >
                              {ac}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Notes / Comments */}
                  {story.notes && (
                    <div className="border-t border-slate-100 pt-3 space-y-1">
                      <span className="block font-bold text-slate-400 uppercase tracking-widest text-[9px]">
                        Architectural / UX Guidance Notes
                      </span>
                      <p className="text-slate-500 italic leading-normal text-xs overflow-hidden wrap-break-word">
                        {story.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* User Stories Tab Feed comment thread */}
      <CommentSection
        projectId={projectId || "demo-proj"}
        scope="userStories"
      />
    </div>
  );
}
