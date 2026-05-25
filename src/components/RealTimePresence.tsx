import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, Activity, MessageSquareCode, Radio, Plus, UserPlus, Play, Pause, Circle, Sparkles, AlertCircle } from "lucide-react";

interface Collaborator {
  id: string;
  name: string;
  role: string;
  avatarText: string;
  avatarBg: string;
  currentTab: string;
  status: "active" | "typing" | "idle";
  joinedAt: string;
}

const INITIAL_COLLABORATORS: Collaborator[] = [
  {
    id: "collab-1",
    name: "Sarah Jenkins",
    role: "Senior Product Director",
    avatarText: "SJ",
    avatarBg: "bg-indigo-600",
    currentTab: "overview",
    status: "active",
    joinedAt: "10m ago"
  },
  {
    id: "collab-2",
    name: "David Kim",
    role: "Lead Systems Architect",
    avatarText: "DK",
    avatarBg: "bg-emerald-600",
    currentTab: "databaseSchema",
    status: "active",
    joinedAt: "5m ago"
  },
  {
    id: "collab-3",
    name: "Elena Rostova",
    role: "AI Orchestrator PM",
    avatarText: "ER",
    avatarBg: "bg-amber-500",
    currentTab: "prd",
    status: "typing",
    joinedAt: "just now"
  }
];

const MOCK_NAMES = [
  { name: "Alex Mercer", role: "DevOps Engineer", avatarText: "AM", avatarBg: "bg-rose-500" },
  { name: "Priya Nair", role: "UX Design Lead", avatarText: "PN", avatarBg: "bg-fuchsia-500" },
  { name: "Oliver Bennett", role: "Release Manager", avatarText: "OB", avatarBg: "bg-cyan-500" },
  { name: "Sophia Martinez", role: "Data Scientist", avatarText: "SM", avatarBg: "bg-violet-500" }
];

const TAB_LABELS: Record<string, string> = {
  overview: "Dashboard",
  prd: "PRD Specs",
  userStories: "User Stories",
  databaseSchema: "DB Schema",
  uiWireframe: "UI Wireframes",
  apiStructure: "API Specification",
  developmentRoadmap: "Rollout Milestones",
  starterCode: "Starter Boilerplate"
};

export default function RealTimePresence() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>(INITIAL_COLLABORATORS);
  const [isDemoActive, setIsDemoActive] = useState(true);
  const [activities, setActivities] = useState<string[]>([
    "Elena Rostova joined the workspace blueprint.",
    "David Kim updated a field in Database Schema."
  ]);

  // Handle simulated presence activity loops
  useEffect(() => {
    if (!isDemoActive) return;

    const interval = setInterval(() => {
      setCollaborators((prev) => {
        if (prev.length === 0) return prev;
        
        // Randomly pick a collaborator to perform an action
        const updated = [...prev];
        const randomIndex = Math.floor(Math.random() * updated.length);
        const target = { ...updated[randomIndex] };

        const actions = ["status_change", "tab_change", "idle_trigger"];
        const chosenAction = actions[Math.floor(Math.random() * actions.length)];

        if (chosenAction === "status_change") {
          const statuses: Array<"active" | "typing" | "idle"> = ["active", "typing"];
          const oldStatus = target.status;
          target.status = statuses[Math.floor(Math.random() * statuses.length)];
          
          if (oldStatus !== target.status && target.status === "typing") {
            addActivityLog(`${target.name} started editing on the ${TAB_LABELS[target.currentTab] || "project"}.`);
          }
        } else if (chosenAction === "tab_change") {
          const tabs = ["overview", "prd", "userStories", "databaseSchema", "uiWireframe", "apiStructure", "developmentRoadmap", "starterCode"];
          const newTab = tabs[Math.floor(Math.random() * tabs.length)];
          const oldTab = target.currentTab;
          
          if (oldTab !== newTab) {
            target.currentTab = newTab;
            target.status = "active";
            addActivityLog(`${target.name} jumped to ${TAB_LABELS[newTab]} workspace section.`);
          }
        } else {
          target.status = "idle";
        }

        updated[randomIndex] = target;
        return updated;
      });
    }, 6500);

    return () => clearInterval(interval);
  }, [isDemoActive]);

  const addActivityLog = (msg: string) => {
    setActivities((prev) => {
      const updated = [msg, ...prev];
      return updated.slice(0, 5); // Keep last 5 activities
    });
  };

  // Add random collaborator user
  const handleAddCollaborator = () => {
    if (collaborators.length >= 6) {
      alert("Maximum simulated team size is 6 active concurrent managers.");
      return;
    }
    
    // Choose one not in active squad
    const activeNames = collaborators.map(c => c.name);
    const available = MOCK_NAMES.filter(m => !activeNames.includes(m.name));

    if (available.length === 0) return;

    const chosen = available[Math.floor(Math.random() * available.length)];
    const newMember: Collaborator = {
      id: `collab-${Date.now()}`,
      name: chosen.name,
      role: chosen.role,
      avatarText: chosen.avatarText,
      avatarBg: chosen.avatarBg,
      currentTab: "overview",
      status: "active",
      joinedAt: "just joined"
    };

    setCollaborators((prev) => [...prev, newMember]);
    addActivityLog(`${chosen.name} (${chosen.role}) joined the system environment.`);
  };

  // Kick out random collaborator
  const handleRemoveCollaborator = (id: string, name: string) => {
    setCollaborators((prev) => prev.filter(c => c.id !== id));
    addActivityLog(`${name} has closed their blueprint workspace.`);
  };

  const activeCount = useMemo(() => {
    return collaborators.filter(c => c.status !== "idle").length;
  }, [collaborators]);

  return (
    <div id="co-working-presence-card" className="bg-white border-2 border-slate-900 rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] font-sans flex flex-col justify-between">
      {/* Real-time telemetry header */}
      <div className="flex justify-between items-start border-b border-slate-100 pb-3.5 mb-4">
        <div className="space-y-1 select-none">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-500 animate-pulse shrink-0" />
            <span className="text-[10px] font-black text-rose-500 tracking-wider uppercase block">LIVE BLUEPRINT CHRONO COLLAB</span>
          </div>
          <h3 className="text-slate-900 font-extrabold text-sm flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Interactive Peer Presence</span>
          </h3>
        </div>

        {/* Dynamic status indicators */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDemoActive(!isDemoActive)}
            className={`p-1.5 border border-slate-200 rounded-lg transition-colors cursor-pointer ${
              isDemoActive ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
            }`}
            title={isDemoActive ? "Pause simulated dynamic updates" : "Resume simulated dynamic updates"}
          >
            {isDemoActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          
          <button
            onClick={handleAddCollaborator}
            disabled={collaborators.length >= 6}
            className="p-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-100 disabled:opacity-50 rounded-lg transition-all font-semibold cursor-pointer inline-flex items-center gap-1 text-xs"
            title="Invite simulated collaborator peer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Invite PM</span>
          </button>
        </div>
      </div>

      {/* Mini online stack */}
      <div className="flex items-center gap-2 mb-4 bg-slate-50 border border-slate-100 rounded-xl p-2.5">
        <div className="flex -space-x-2.5 overflow-hidden">
          {collaborators.map((c) => (
            <div
              key={c.id}
              className={`w-7.5 h-7.5 rounded-full ${c.avatarBg} text-white font-extrabold text-[11px] flex items-center justify-center border-2 border-white select-none`}
              title={`${c.name} - ${c.role}`}
            >
              {c.avatarText}
            </div>
          ))}
        </div>
        <div className="text-[11px]">
          <strong className="text-slate-800 text-xs">{collaborators.length} connected</strong>
          <span className="text-slate-500 font-medium block">({activeCount} active user{activeCount !== 1 ? "s" : ""})</span>
        </div>
      </div>

      {/* Scrollable list of detail peer state monitors */}
      <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 select-none custom-scrollbar">
        <AnimatePresence initial={false}>
          {collaborators.map((c) => {
            const isTyping = c.status === "typing";
            const isIdle = c.status === "idle";
            
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="p-2.5 border border-slate-100 hover:border-slate-200/80 bg-slate-50/25 rounded-2xl flex items-center justify-between gap-3 relative transition-all group overflow-hidden"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <div className={`w-8.5 h-8.5 rounded-full ${c.avatarBg} text-white font-bold text-xs flex items-center justify-center`}>
                      {c.avatarText}
                    </div>
                    {/* Status dot indicator bubble */}
                    <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${
                      isTyping ? "bg-amber-400" : isIdle ? "bg-slate-300" : "bg-emerald-500"
                    }`} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <strong className="text-slate-805 text-[11.5px] truncate font-extrabold block leading-tight">{c.name}</strong>
                      {isTyping && (
                        <span className="flex items-center gap-0.5 px-1 py-0.5 bg-amber-50 rounded text-[8px] font-black text-amber-600 animate-pulse border border-amber-100">
                          TYPING
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-450 truncate block leading-tight font-medium mt-0.5">{c.role}</span>
                  </div>
                </div>

                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                  {/* Tab Location Pill bubble badge */}
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 border rounded-lg max-w-[110px] truncate block ${
                    isIdle 
                      ? "bg-slate-55 border-slate-105 text-slate-400" 
                      : "bg-indigo-50 border-indigo-105 text-indigo-700 font-sans"
                  }`}>
                    📍 {TAB_LABELS[c.currentTab] || "Overview"}
                  </span>
                  
                  {/* Remove hover trigger */}
                  <button
                    onClick={() => handleRemoveCollaborator(c.id, c.name)}
                    className="opacity-0 group-hover:opacity-100 text-[8px] font-extrabold text-slate-400 hover:text-rose-500 rounded px-1 transition-all underline shrink-0 cursor-pointer"
                    title="Simulate user exit"
                  >
                    Kick
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Tiny Transient Live Event ticker streams */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1.5">Blueprint Sync Event feed</span>
        <div className="space-y-1 max-h-[85px] overflow-y-auto custom-scrollbar font-sans text-[10px]">
          {activities.length === 0 ? (
            <span className="text-[10px] text-slate-400 block italic">Waiting for environment activity pulses...</span>
          ) : (
            activities.map((act, index) => (
              <div key={index} className="flex gap-1.5 items-start leading-relaxed text-slate-500">
                <span className="text-indigo-400 font-bold shrink-0">›</span>
                <span className="truncate" title={act}>{act}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
