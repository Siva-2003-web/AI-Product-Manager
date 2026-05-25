import React, { useState, useEffect, useMemo } from "react";
import {
  UIWireframeConfig,
  LayoutElement,
  LayoutRow,
  ProjectState,
} from "../types";
import {
  Layout,
  CheckCircle2,
  Star,
  Sparkles,
  Code,
  Play,
  Monitor,
  Tablet,
  Smartphone,
  Copy,
  Check,
  Plus,
  Trash2,
  RotateCcw,
  Compass,
  Activity,
  FileCode,
  Edit3,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

interface UIWireframeTabProps {
  wireframe: UIWireframeConfig | undefined;
  project?: ProjectState;
}

// Custom internal representation of Layout Elements with editable states
interface EditableElement extends LayoutElement {
  placeholderText?: string;
}

interface EditableRow {
  rowId: string;
  colSpan: number;
  elements: EditableElement[];
}

export default function UIWireframeTab({
  wireframe,
  project,
}: UIWireframeTabProps) {
  const projectId = project?.id || "demo-proj";

  // State configurations
  const [viewportMode, setViewportMode] = useState<
    "desktop" | "tablet" | "mobile"
  >("desktop");
  const [canvasTheme, setCanvasTheme] = useState<
    "blueprint" | "graphite" | "brutal" | "cozypaper"
  >("blueprint");
  const [activeElement, setActiveElement] = useState<EditableElement | null>(
    null,
  );
  const [localRows, setLocalRows] = useState<EditableRow[]>([]);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [showExporterTab, setShowExporterTab] = useState<"inspector" | "code">(
    "inspector",
  );

  // Load and sync rows with localStorage or prop
  useEffect(() => {
    if (!wireframe) return;
    try {
      const storedKey = `custom_wireframe_rows_${projectId}`;
      const saved = localStorage.getItem(storedKey);
      if (saved) {
        setLocalRows(JSON.parse(saved) as EditableRow[]);
      } else {
        setLocalRows(wireframe.layoutRows as EditableRow[]);
      }
    } catch (e) {
      console.error("Failed loading cached wireframe layout", e);
      setLocalRows(wireframe.layoutRows as EditableRow[]);
    }
  }, [wireframe, projectId]);

  // Persists local custom layout adjustments
  const commitRows = (updated: EditableRow[]) => {
    setLocalRows(updated);
    try {
      const storedKey = `custom_wireframe_rows_${projectId}`;
      localStorage.setItem(storedKey, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed saving cached wireframe layout", e);
    }
  };

  const handleResetToDefault = () => {
    if (!wireframe) return;
    if (
      window.confirm(
        "Are you sure you want to revert all custom layout changes back to default spec?",
      )
    ) {
      try {
        const storedKey = `custom_wireframe_rows_${projectId}`;
        localStorage.removeItem(storedKey);
        setLocalRows(wireframe.layoutRows as EditableRow[]);
        setActiveElement(null);
      } catch (e) {
        console.error("Error clearing schema", e);
      }
    }
  };

  // Live Stats calculations
  const layoutStats = useMemo(() => {
    let elementCount = 0;
    let totalHeight = 0;
    let countsByType: Record<string, number> = {};

    localRows.forEach((row) => {
      row.elements.forEach((el) => {
        elementCount++;
        totalHeight += el.heightPx || 100;
        countsByType[el.type] = (countsByType[el.type] || 0) + 1;
      });
    });

    const averageHeight =
      elementCount > 0 ? Math.round(totalHeight / elementCount) : 0;
    const uiDensity =
      elementCount > 8
        ? "Heavy Workspace"
        : elementCount > 4
          ? "Balanced Layout"
          : "Minimalist Canvas";
    const scoringRatio = Math.min(100, 70 + elementCount * 3);

    return {
      elementCount,
      averageHeight,
      uiDensity,
      scoringRatio,
      countsByType,
    };
  }, [localRows]);

  // Element actions: Modification
  const handleUpdateElementField = (
    elemId: string,
    updates: Partial<EditableElement>,
  ) => {
    const nextRows = localRows.map((row) => ({
      ...row,
      elements: row.elements.map((el) => {
        if (el.id === elemId) {
          const mod = { ...el, ...updates };
          if (activeElement?.id === elemId) {
            setActiveElement(mod);
          }
          return mod;
        }
        return el;
      }),
    }));
    commitRows(nextRows);
  };

  // Element actions: Rearranging elements
  const handleMoveElement = (elemId: string, direction: "left" | "right") => {
    const nextRows = localRows.map((row) => {
      const index = row.elements.findIndex((el) => el.id === elemId);
      if (index === -1) return row;

      const newIndex = direction === "left" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= row.elements.length) return row;

      const updatedElements = [...row.elements];
      const [temp] = updatedElements.splice(index, 1);
      updatedElements.splice(newIndex, 0, temp);

      return {
        ...row,
        elements: updatedElements,
      };
    });
    commitRows(nextRows);
  };

  // Add generic placeholder component to a row
  const handleAddElementToRow = (rowId: string) => {
    const baseId = `component-${Date.now()}`;
    const newComponent: EditableElement = {
      id: baseId,
      type: "chart_card",
      label: "📈 Adaptive Metrics Graph",
      widthSpan: 2,
      heightPx: 130,
      purpose:
        "Renders performance tracking telemetry stats or records count values.",
      placeholderText: "Dataset updated live via localhost:27017",
    };

    const nextRows = localRows.map((row) => {
      if (row.rowId === rowId) {
        return {
          ...row,
          elements: [...row.elements, newComponent],
        };
      }
      return row;
    });
    commitRows(nextRows);
    setActiveElement(newComponent);
    setShowExporterTab("inspector");
  };

  // Delete element
  const handleDeleteElement = (elemId: string) => {
    const nextRows = localRows.map((row) => ({
      ...row,
      elements: row.elements.filter((el) => el.id !== elemId),
    }));
    commitRows(nextRows);
    if (activeElement?.id === elemId) {
      setActiveElement(null);
    }
  };

  // Add or spawn an empty row layout
  const handleCreateNewRow = (colSpan: number = 4) => {
    const newRowId = `row-${Date.now()}`;
    const newRow: EditableRow = {
      rowId: newRowId,
      colSpan,
      elements: [],
    };
    commitRows([...localRows, newRow]);
  };

  // Delete an entire layout row
  const handleDeleteRow = (rowId: string) => {
    if (
      window.confirm(
        "Are you sure you want to remove this entire row lane and all its items?",
      )
    ) {
      const nextRows = localRows.filter((row) => row.rowId !== rowId);
      commitRows(nextRows);
      setActiveElement(null);
    }
  };

  // Helper code generator switcher
  const generatedCodeSnippet = useMemo(() => {
    if (!activeElement) return "";

    const cleanLabel = activeElement.label
      .replace(
        /[\u2704-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g,
        "",
      )
      .trim();

    switch (activeElement.type) {
      case "header":
        return `import React from 'react';\nimport { Bell, User, Settings } from 'lucide-react';\n\nexport function HeaderWidget() {\n  return (\n    <header className="w-full bg-slate-900 border-b-2 border-slate-950 px-6 py-4 flex items-center justify-between text-white shadow-[0_4px_0px_0px_rgba(0,0,0,1)]">\n      <div className="flex items-center gap-3">\n        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse" />\n        <h1 className="font-extrabold text-sm tracking-tight uppercase">\${cleanLabel || "Workspace Header"}</h1>\n      </div>\n      <div className="flex items-center gap-4 text-xs font-mono text-slate-400">\n        <span>URI: mongodb://localhost:27017</span>\n        <span className="text-slate-700">|</span>\n        <span className="bg-indigo-600 px-2 py-0.5 rounded text-white font-bold text-[10px]">VERIFIED</span>\n      </div>\n    </header>\n  );\n}`;
      case "hero_card":
        return `import React from 'react';\nimport { Sparkles, ArrowUpRight } from 'lucide-react';\n\nexport function BrandHeroPanel() {\n  return (\n    <div className="w-full bg-linear-to-br from-indigo-550 to-indigo-700 border-2 border-slate-900 p-6 rounded-2xl text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">\n      <span className="inline-block bg-white/20 text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full mb-3">Enterprise Core</span>\n      <h2 className="text-lg font-black tracking-tight">\${cleanLabel || "Dynamic Banner Title"}</h2>\n      <p className="text-xs text-indigo-100/90 leading-relaxed mt-2 italic font-medium">\n        "\${activeElement.placeholderText || "Ready to connect live database sync channels."}"\n      </p>\n    </div>\n  );\n}`;
      case "chart_card":
        return `import React from 'react';\nimport { Activity } from 'lucide-react';\n\nexport function MiniChartMetric() {\n  return (\n    <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex flex-col justify-between min-h-35">\n      <div className="flex items-center justify-between">\n        <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">\${cleanLabel || "Metrics Live Feed"}</span>\n        <Activity className="w-4 h-4 text-indigo-600 animate-pulse" />\n      </div>\n      <div className="my-2 h-16 w-full">\n        <svg viewBox="0 0 100 30" className="w-full h-full text-indigo-500 stroke-indigo-600 fill-indigo-500/10" preserveAspectRatio="none">\n          <path d="M 0 25 Q 15 5, 30 18 T 60 5 T 80 20 T 100 8 L 100 30 L 0 30 Z" strokeWidth="2.5" strokeLinecap="round" />\n        </svg>\n      </div>\n      <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[9px] font-semibold text-slate-500 font-mono">\n        <span>\${activeElement.purpose || "Telemetry monitor module"}</span>\n        <span className="text-indigo-605 font-bold">MongoDB</span>\n      </div>\n    </div>\n  );\n}`;
      case "data_table":
        return `import React from 'react';\n\nexport function DataTableGrid() {\n  return (\n    <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">\n      <h3 className="text-xs font-black text-slate-900 border-b border-slate-100 pb-2 mb-2 uppercase tracking-wide">\${cleanLabel || "Data Set Record Grid"}</h3>\n      <div className="space-y-1.5 text-xs font-mono text-slate-700">\n        <div className="flex justify-between items-center p-2 bg-slate-50 border border-slate-200 rounded-xl">\n          <span>Collections Status</span>\n          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase px-2 py-0.5 rounded">CONNECTED</span>\n        </div>\n      </div>\n    </div>\n  );\n}`;
      case "form":
        return `import React, { useState } from 'react';\nimport { Send } from 'lucide-react';\n\nexport function FormController() {\n  const [value, setValue] = useState("");\n  return (\n    <form className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]" onSubmit={(e) => e.preventDefault()}>\n      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest pl-0.5 mb-2">\house\${cleanLabel || "Input Form"}</h3>\n      <div className="space-y-3">\n        <input \n          type="text" \n          value={value} \n          onChange={(e) => setValue(e.target.value)} \n          placeholder="\${activeElement.placeholderText || "Enter parameters..."}" \n          className="w-full text-xs p-2.5 border-2 border-slate-200 rounded-xl focus:border-slate-950 focus:outline-none focus:ring-0 font-medium bg-slate-50"\n        />\n        <button type="submit" className="w-full py-2 bg-indigo-600 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_#000]">\n          <span>Submit Payload Node</span>\n        </button>\n      </div>\n    </form>\n  );\n}`;
      case "button":
        return `import React from 'react';\nimport { Zap } from 'lucide-react';\n\nexport function TriggerButton() {\n  return (\n    <button \n      type="button" \n      className="w-full py-3 bg-slate-950 border-2 border-slate-950 hover:bg-slate-900 hover:border-slate-900 text-white transition-all font-black rounded-2xl text-xs flex flex-col items-center justify-center gap-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"\n    >\n      <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" /> \${cleanLabel || "Execute Router Command"}</span>\n    </button>\n  );\n}`;
      case "input_field":
        return `import React from 'react';\n\nexport function InputFieldWidget() {\n  return (\n    <div className="flex flex-col gap-1.5 text-left bg-white p-3 border-2 border-slate-900 rounded-2xl shadow-[3px_3px_0px_0px_#000]">\n      <label className="text-[10px] uppercase font-black text-slate-400 pl-0.5 font-sans">\${cleanLabel || "Variable Input"}</label>\n      <input type="text" placeholder="\${activeElement.placeholderText || "Insert text params..."}" className="w-full font-mono text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-none focus:border-indigo-600" />\n    </div>\n  );\n}`;
      case "stat_badge":
        return `import React from 'react';\nimport { Star } from 'lucide-react';\n\nexport function StatBadgePanel() {\n  return (\n    <div className="bg-lime-100/90 text-slate-900 border-2 border-slate-900 p-4 rounded-2xl font-black shadow-[4px_4px_0px_0px_#000] flex items-center gap-3">\n      <Star className="w-5 h-5 text-amber-500 fill-amber-500" />\n      <div>\n        <span className="text-[9px] text-slate-500 uppercase font-mono tracking-widest leading-none">Diagnostic Badge</span>\n        <h4 className="text-xs leading-none mt-1">\${cleanLabel || "Standard Rating"}</h4>\n      </div>\n    </div>\n  );\n}`;
      default:
        return `import React from 'react';\n\nexport function GenericWidget() {\n  return (\n    <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">\n      <h4 className="text-xs font-bold text-slate-900">\${cleanLabel || "Placeholder Item"}</h4>\n      <p className="text-xs text-slate-550 italic leading-relaxed mt-1">"\${activeElement.purpose || "User experience alignment block."}"</p>\n    </div>\n  );\n}`;
    }
  }, [activeElement]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCodeSnippet);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (e) {
      console.error("Clipboard blocked", e);
    }
  };

  if (!wireframe) return null;

  // Render proper Theme styles
  const getThemeContainerClass = () => {
    switch (canvasTheme) {
      case "blueprint":
        return "bg-slate-950 border-4 border-slate-900 p-6 relative overflow-y-auto custom-scrollbar [background-image:radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] text-cyan-400 font-mono";
      case "graphite":
        return "bg-[#18181b] border-4 border-[#27272a] p-6 relative overflow-y-auto custom-scrollbar text-[#a1a1aa]";
      case "brutal":
        return "bg-amber-50 border-4 border-slate-950 p-6 relative overflow-y-auto custom-scrollbar text-slate-900";
      case "cozypaper":
        return "bg-[#fafaf6] border-4 border-[#dfdfd5] p-6 relative overflow-y-auto custom-scrollbar text-[#555243] shadow-[inner_0px_2px_4px_rgba(0,0,0,0.06)]";
    }
  };

  // Render single interactive mock card with chosen theme classes
  const renderInteractiveElement = (elem: EditableElement) => {
    const isSelected = activeElement?.id === elem.id;

    // Outer wireframe frame style with extreme 3D neobrutalist alignments
    let cardStyle =
      "border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between p-4 rounded-xl select-none group min-h-[110px] ";

    if (canvasTheme === "blueprint") {
      cardStyle += isSelected
        ? "bg-cyan-950/45 border-cyan-400 text-cyan-200 ring-2 ring-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
        : "bg-slate-920/80 border-indigo-950 text-cyan-400 hover:border-cyan-500/30 hover:bg-slate-900/95";
    } else if (canvasTheme === "graphite") {
      cardStyle += isSelected
        ? "bg-[#27272a] border-white text-white shadow-xl shadow-black/40"
        : "bg-[#09090b] border-zinc-800 text-zinc-400 hover:border-zinc-500";
    } else if (canvasTheme === "brutal") {
      cardStyle += isSelected
        ? "bg-indigo-100 border-slate-950 text-slate-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-x-1 -translate-y-1"
        : "bg-white border-slate-900 text-slate-800 hover:shadow-[5px_5px_0px_0px_#000] hover:-translate-y-0.5 hover:-translate-x-0.5";
    } else {
      // cozypaper
      cardStyle += isSelected
        ? "bg-[#f4efe2] border-[#a59a72] text-[#4d4834] shadow-md border-dashed"
        : "bg-white border-[#dfdfd5] text-[#716e5c] hover:border-[#b8b39a] hover:bg-[#fafaf6]/20";
    }

    return (
      <div
        onClick={() => {
          setActiveElement(elem);
          setShowExporterTab("inspector");
        }}
        className={`${cardStyle} min-h-[${elem.heightPx || 120}px]`}
      >
        {/* Component Header / Icons */}
        <div className="flex items-start justify-between gap-1 w-full text-xs">
          <div className="flex items-center gap-1.5 font-black truncate">
            {canvasTheme === "blueprint" ? (
              <span className="text-[10px] text-cyan-400 animate-pulse font-mono">
                ◆
              </span>
            ) : (
              <span className="text-xs">🕹️</span>
            )}
            <span className="truncate tracking-wide font-extrabold">
              {elem.label}
            </span>
          </div>
          <span className="text-[8.5px] font-mono uppercase bg-black/25 hover:bg-black/40 px-1.5 py-0.5 rounded tracking-widest font-black opacity-80 shrink-0 select-none border border-white/5">
            {elem.type}
          </span>
        </div>

        {/* Visual Mockups based on type */}
        <div className="my-2.5 flex-1 flex flex-col justify-center">
          {elem.type === "chart_card" && (
            <div className="h-12 w-full flex items-end">
              <svg
                viewBox="0 0 100 25"
                className="w-full h-full text-indigo-500 opacity-60"
                preserveAspectRatio="none"
              >
                <path
                  d="M 0 22 C 12 8, 25 2, 40 18 C 55 24, 70 8, 85 12 L 100 2 L 100 25 L 0 25 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )}

          {elem.type === "form" && (
            <div className="space-y-1 w-full text-[10px]">
              <div className="h-6 w-full bg-black/15 rounded-xl border border-white/5 px-2.5 flex items-center text-slate-400 italic text-[9px] truncate">
                {elem.placeholderText || "Enter parameters..."}
              </div>
              <div className="h-6.5 w-full bg-indigo-650/20 hover:bg-indigo-650/30 border border-indigo-400/30 text-indigo-300 font-extrabold rounded-xl flex items-center justify-center text-[9px] uppercase tracking-wider transition-colors">
                Submit Access Request
              </div>
            </div>
          )}

          {elem.type === "data_table" && (
            <div className="space-y-1.5 w-full text-[9px] font-mono leading-none">
              <div className="flex justify-between p-1 bg-black/15 rounded border border-white/5">
                <span className="text-slate-400">Collections Root</span>
                <span className="text-emerald-400 font-bold uppercase text-[8px]">
                  URI Active
                </span>
              </div>
              <div className="flex justify-between p-1 bg-black/15 rounded border border-white/5">
                <span className="text-slate-400">Total Users Index</span>
                <span className="text-cyan-400 font-bold">12 entries</span>
              </div>
            </div>
          )}

          {elem.type === "button" && (
            <div className="h-7.5 w-full bg-slate-900 border-t border-white/10 active:scale-[0.98] rounded-xl flex items-center justify-center text-[9.5px] font-extrabold uppercase tracking-widest gap-1 shadow-inner">
              <Play className="w-3 h-3 text-cyan-400 fill-cyan-400" />
              <span className="truncate overflow-hidden wrap-break-word">
                {elem.label || "Click Command Trigger"}
              </span>
            </div>
          )}

          {elem.type === "input_field" && (
            <div className="w-full text-left font-mono">
              <div className="bg-slate-950/65 border border-slate-850 px-2 py-1.5 rounded-xl text-slate-300 flex items-center text-xs truncate italic gap-1.5 font-normal">
                <span className="text-slate-600 font-bold font-sans">#</span>
                <span className="truncate">
                  {elem.placeholderText || "mongodb://localhost:27017/... "}
                </span>
              </div>
            </div>
          )}

          {elem.type === "stat_badge" && (
            <div className="flex items-center gap-2 bg-emerald-900/10 border-l-4 border-emerald-500 rounded p-1.5">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-bounce" />
              <div className="text-left font-sans">
                <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                  DIAGNOSTIC STATUS
                </span>
                <span className="text-[10px] font-extrabold text-slate-350">
                  {elem.placeholderText || "100% Secure Verified"}
                </span>
              </div>
            </div>
          )}

          {elem.type !== "chart_card" &&
            elem.type !== "form" &&
            elem.type !== "data_table" &&
            elem.type !== "button" &&
            elem.type !== "input_field" &&
            elem.type !== "stat_badge" && (
              <p className="text-[10px] opacity-75 leading-normal line-clamp-2 italic font-mono pl-1">
                "
                {elem.purpose || "Adaptive user intent layout alignment block."}
                "
              </p>
            )}
        </div>

        {/* Small metadata bar at footer */}
        <div className="flex items-center justify-between border-t border-black/10 pt-1.5 text-[8px] opacity-60 font-mono tracking-wider">
          <span>COMP: {elem.id.substring(0, 10)}...</span>
          <span>Col Span: {elem.widthSpan}/4</span>
        </div>

        {/* Rearrange buttons visible on hover */}
        <div className="absolute right-1 bottom-1 opacity-0 group-hover:opacity-100 flex items-center gap-1.5 transition-opacity bg-black/85 px-2 py-1 rounded-md text-white border border-white/10 shadow-lg z-10">
          <button
            type="button"
            title="Move component left"
            onClick={(e) => {
              e.stopPropagation();
              handleMoveElement(elem.id, "left");
            }}
            className="p-0.5 hover:text-cyan-400 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Move component right"
            onClick={(e) => {
              e.stopPropagation();
              handleMoveElement(elem.id, "right");
            }}
            className="p-0.5 hover:text-cyan-400 cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Delete component"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteElement(elem.id);
            }}
            className="p-0.5 hover:text-rose-450 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div id="ui-wireframe-tab" className="space-y-6 animate-fade-in font-sans">
      {/* Visual Analytics Scorecard row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-slate-900 rounded-3xl p-4 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] flex items-center gap-3">
          <div className="p-2.5 bg-slate-900 text-white rounded-xl">
            <Layout className="w-5 h-5 col-span-1" />
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 uppercase font-black tracking-wider leading-none">
              Layout Density
            </span>
            <span className="text-xs font-black text-slate-800 leading-tight block mt-1">
              {layoutStats.uiDensity}
            </span>
          </div>
        </div>

        <div className="bg-white border-2 border-slate-900 rounded-3xl p-4 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] flex items-center gap-3">
          <div className="p-2.5 bg-slate-900 text-white rounded-xl">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 uppercase font-black tracking-wider leading-none">
              Elements in View
            </span>
            <span className="text-xs font-black text-slate-800 leading-tight block mt-1">
              {layoutStats.elementCount} Active Items
            </span>
          </div>
        </div>

        <div className="bg-white border-2 border-slate-900 rounded-3xl p-4 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] flex items-center gap-3">
          <div className="p-2.5 bg-slate-900 text-white rounded-xl">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 uppercase font-black tracking-wider leading-none">
              MongoDB Node Port
            </span>
            <span className="text-xs font-mono font-black text-slate-800 leading-tight block mt-1">
              27017 Daemon
            </span>
          </div>
        </div>

        <div className="bg-white border-2 border-slate-900 rounded-3xl p-4 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] flex items-center gap-3">
          <div className="p-2.5 bg-indigo-650 text-indigo-50 rounded-xl">
            <Sparkles className="w-5 h-5 text-indigo-50 animate-bounce" />
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 uppercase font-black tracking-wider leading-none">
              Design Theme archetype
            </span>
            <span className="text-xs font-black text-indigo-600 block leading-tight mt-1 truncate capitalize">
              {canvasTheme} Mode
            </span>
          </div>
        </div>
      </div>

      {/* Editor Preferences Controls Section */}
      <div className="bg-white border-2 border-slate-900 rounded-3xl p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        {/* Device Viewport Selector */}
        <div className="space-y-1 shrink-0">
          <span className="block text-[9.5px] font-black text-slate-400 uppercase tracking-wider pl-0.5">
            Device Frame Sizer
          </span>
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setViewportMode("desktop")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 hover:bg-white cursor-pointer ${
                viewportMode === "desktop"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500"
              }`}
            >
              <Monitor className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              onClick={() => setViewportMode("tablet")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 hover:bg-white cursor-pointer ${
                viewportMode === "tablet"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500"
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tablet</span>
            </button>
            <button
              onClick={() => setViewportMode("mobile")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 hover:bg-white cursor-pointer ${
                viewportMode === "mobile"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile (390px)</span>
            </button>
          </div>
        </div>

        {/* Theme Sketch Architect selector */}
        <div className="space-y-1">
          <span className="block text-[9.5px] font-black text-slate-400 uppercase tracking-wider pl-0.5">
            Styling Archetypes
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "blueprint", label: "🔵 Blueprint Blue" },
              { id: "graphite", label: "⚫ Matte Graphite" },
              { id: "brutal", label: "💥 Comic Brutal" },
              { id: "cozypaper", label: "📄 Ink & Paper" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setCanvasTheme(t.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer border transition-all ${
                  canvasTheme === t.id
                    ? "bg-slate-900 text-white border-slate-900 shadow-md"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Global Operations */}
        <div className="flex items-end self-start md:self-end gap-2">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3.5 py-2 border-2 border-slate-900 rounded-xl font-bold text-xs hover:bg-slate-50 text-slate-700 hover:text-slate-950 flex items-center gap-1.5 transition-all shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Spec</span>
          </button>
        </div>
      </div>

      {/* Row Spawner Tools and quick template help label */}
      <div className="bg-slate-50 border-2 border-slate-900 rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <div className="text-left font-sans">
          <span className="text-[10px] uppercase font-black text-slate-400 block tracking-widest pl-0.5">
            Grid Layout Lane Spawner
          </span>
          <p className="text-xs font-semibold text-slate-700 mt-1">
            Insert customizable structural row lanes into your active 3D draft
            viewport:
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCreateNewRow(4)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-lg transition-colors border border-slate-950 flex items-center gap-1 shadow-sm cursor-pointer"
          >
            <Plus className="w-3 h-3 text-cyan-400" />
            <span>Full Row (Span 4)</span>
          </button>
          <button
            onClick={() => handleCreateNewRow(2)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-lg transition-colors border border-slate-950 flex items-center gap-1 shadow-sm cursor-pointer"
          >
            <Plus className="w-3 h-3 text-teal-400" />
            <span>Split Row (Span 2)</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Two-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUMN 1 (CENTER WORKSPACE): Interactive Wireframe Simulation Device Grid */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <div
            className={`w-full transition-all duration-300 ease-in-out ${
              viewportMode === "mobile"
                ? "max-w-97.5"
                : viewportMode === "tablet"
                  ? "max-w-3xl"
                  : "max-w-full"
            }`}
          >
            {/* Mock structural device holder boundaries */}
            <div className="bg-slate-900 border-x-4 border-t-4 border-slate-900 rounded-t-3xl pt-2 pb-0.5 px-4 flex items-center justify-between text-white select-none shadow-md">
              <div className="flex items-center gap-1 text-[10px] font-mono leading-none">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-slate-400 font-bold ml-1.5 hidden sm:inline tracking-wider font-mono uppercase text-[9px]">
                  3D WIREFRAME SIMULATOR
                </span>
              </div>
              <div className="text-[9px] font-mono tracking-tight text-slate-400 bg-slate-950 px-2.5 py-0.5 rounded-md truncate max-w-70">
                sandbox://mock-mongodb-dashboard-{canvasTheme}.html
              </div>
              <span className="bg-indigo-600 font-sans px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest leading-normal animate-pulse shadow-sm">
                ACTIVE
              </span>
            </div>

            {/* Inner Blueprint rendering container */}
            <div
              className={`${getThemeContainerClass()} rounded-b-3xl min-h-140`}
            >
              <div id="blueprint-canvas-scroll" className="space-y-6">
                {localRows.length === 0 ? (
                  <div className="text-center py-24 select-none flex flex-col justify-center items-center">
                    <span className="w-12 h-12 bg-slate-900/60 rounded-full flex items-center justify-center text-cyan-400 border border-cyan-805/20 mx-auto mb-4 text-xl">
                      🛸
                    </span>
                    <h5 className="font-extrabold uppercase opacity-80 tracking-widest text-xs">
                      Sandbox Blueprint Empty
                    </h5>
                    <p className="text-[11px] opacity-60 leading-normal max-w-65 mx-auto mt-2 italic">
                      Spawn a new empty structural lane from the toolbar above
                      to synthesize dashboards.
                    </p>
                  </div>
                ) : (
                  localRows.map((row) => {
                    return (
                      <div
                        key={row.rowId}
                        className="space-y-2 border-b border-white/5 pb-4 last:border-0 last:pb-0 p-3 rounded-2xl transition-all"
                      >
                        {/* Header bar of Row Lane and diagnostics */}
                        <div className="flex items-center justify-between opacity-50 hover:opacity-100 transition-opacity select-none border-b border-white/5 pb-1 mb-2">
                          <span className="text-[8px] font-mono uppercase tracking-widest text-slate-500">
                            🏁 Group Row Lane: ID {row.rowId.substring(0, 8)} |
                            Spans: {row.colSpan || 4}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] font-semibold text-slate-500 uppercase tracking-tight">
                              Components count: {row.elements.length}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteRow(row.rowId)}
                              className="text-[9px] text-rose-500 font-extrabold flex items-center gap-0.5 hover:underline pl-2 cursor-pointer"
                              title="Delete this entire layout lane"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Purge Lane</span>
                            </button>
                          </div>
                        </div>

                        {/* Elements Grid of Row */}
                        {row.elements.length === 0 ? (
                          <div className="border border-dashed border-cyan-500/10 bg-black/10 rounded-xl py-6 text-center select-none text-[10px] opacity-45 pointer-events-none">
                            🎯 [ Empty Lane: Drag elements here or click Insert
                            to populate ]
                          </div>
                        ) : (
                          <div
                            className={`grid gap-4 ${
                              row.colSpan === 4
                                ? "grid-cols-4"
                                : row.colSpan === 3
                                  ? "grid-cols-3"
                                  : row.colSpan === 2
                                    ? "grid-cols-2"
                                    : "grid-cols-1"
                            }`}
                          >
                            {row.elements.map((elem) => {
                              const spanClass =
                                elem.widthSpan === 4
                                  ? "col-span-full"
                                  : elem.widthSpan === 3
                                    ? "col-span-3"
                                    : elem.widthSpan === 2
                                      ? "col-span-2"
                                      : "col-span-1";
                              return (
                                <div key={elem.id} className={spanClass}>
                                  {renderInteractiveElement(elem)}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Quick Row insertion option button */}
                        <div className="flex items-center justify-center p-1 border-t border-dashed border-indigo-505/10 text-indigo-500 pt-3">
                          <button
                            type="button"
                            onClick={() => handleAddElementToRow(row.rowId)}
                            className="text-[9.5px] font-black uppercase tracking-wider py-1 px-3 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-slate-100 rounded-lg flex items-center gap-1 cursor-pointer select-none transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Quick Add Core Node Component</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 2 (RIGHT SIDEBAR): Properties Editor & React Code Exporter */}
        <div className="lg:col-span-4 space-y-4">
          {/* Main Toggles Panel tab */}
          <div className="bg-white border-2 border-slate-900 rounded-3xl p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] min-h-91.25 flex flex-col text-left">
            <div className="flex border-b border-slate-100 pb-3 mb-4 select-none">
              <button
                onClick={() => setShowExporterTab("inspector")}
                className={`flex-1 text-center py-1 text-xs font-black uppercase tracking-wide border-b-2 transition-all cursor-pointer ${
                  showExporterTab === "inspector"
                    ? "text-slate-900 border-slate-900"
                    : "text-slate-400 border-transparent hover:text-slate-600"
                }`}
              >
                🛠️ Element Editor
              </button>
              <button
                onClick={() => {
                  if (!activeElement) {
                    alert(
                      "Please click any element component on the left layout to view its code generator.",
                    );
                    return;
                  }
                  setShowExporterTab("code");
                }}
                className={`flex-1 text-center py-1 text-xs font-black uppercase tracking-wide border-b-2 transition-all cursor-pointer ${
                  showExporterTab === "code"
                    ? "text-slate-900 border-slate-900"
                    : "text-slate-400 border-transparent hover:text-slate-600"
                }`}
              >
                ⚡ React Code Exporter
              </button>
            </div>

            {/* TAB: Properties Editor */}
            {showExporterTab === "inspector" && (
              <div className="flex-1 flex flex-col justify-between">
                {activeElement ? (
                  <div className="space-y-3 font-sans">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-[9.5px] bg-slate-900 text-white font-extrabold px-2 py-0.5 rounded tracking-wide font-mono uppercase">
                        ID: {activeElement.id.substring(0, 10)}...
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteElement(activeElement.id)}
                        className="text-[9.5px] text-rose-600 font-extrabold flex items-center gap-0.5 hover:underline cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>

                    <div className="space-y-4 text-xs text-slate-600">
                      {/* Labeled Item Title input */}
                      <div className="space-y-1">
                        <label
                          htmlFor={`active-title-${activeElement.id}`}
                          className="block text-[9.5px] font-black text-slate-400 uppercase tracking-widest font-sans pl-0.5"
                        >
                          Labled Component Title
                        </label>
                        <input
                          id={`active-title-${activeElement.id}`}
                          type="text"
                          value={activeElement.label}
                          onChange={(e) =>
                            handleUpdateElementField(activeElement.id, {
                              label: e.target.value,
                            })
                          }
                          className="w-full p-2.5 border-2 border-slate-200 focus:border-slate-900 rounded-xl focus:outline-none font-bold text-slate-850 bg-slate-50"
                        />
                      </div>

                      {/* Component Type selector */}
                      <div className="space-y-1">
                        <label
                          htmlFor={`active-type-${activeElement.id}`}
                          className="block text-[9.5px] font-black text-slate-400 uppercase tracking-widest font-sans pl-0.5"
                        >
                          Component Core Type
                        </label>
                        <select
                          id={`active-type-${activeElement.id}`}
                          value={activeElement.type}
                          onChange={(e) =>
                            handleUpdateElementField(activeElement.id, {
                              type: e.target.value as any,
                            })
                          }
                          className="w-full p-2.5 border-2 border-slate-200 focus:border-slate-900 rounded-xl focus:outline-none font-bold bg-white text-slate-800"
                        >
                          <option value="header">Header Banner</option>
                          <option value="sidebar">Sidebar Navigation</option>
                          <option value="hero_card">Hero Branding Card</option>
                          <option value="chart_card">
                            Interactive Chart Card
                          </option>
                          <option value="data_table">Data Set Table</option>
                          <option value="form">Input Actions Form</option>
                          <option value="button">Trigger Button</option>
                          <option value="stat_badge">
                            Glowing Analytics Medal
                          </option>
                          <option value="input_field">
                            Code Variable Field
                          </option>
                          <option value="list_item">Task Checklist Node</option>
                        </select>
                      </div>

                      {/* Dimensions adjust (Height and WidthSpan) */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label
                            htmlFor={`active-width-${activeElement.id}`}
                            className="block text-[9px] font-black text-slate-400 uppercase tracking-widest font-sans pl-0.5"
                          >
                            Canvas Column Span
                          </label>
                          <select
                            id={`active-width-${activeElement.id}`}
                            value={activeElement.widthSpan}
                            onChange={(e) =>
                              handleUpdateElementField(activeElement.id, {
                                widthSpan: Number(e.target.value),
                              })
                            }
                            className="w-full p-2 border-2 border-slate-200 focus:border-slate-900 rounded-xl focus:outline-none font-bold text-slate-705 bg-white"
                          >
                            <option value={1}>1 / 4 Span</option>
                            <option value={2}>2 / 4 Span</option>
                            <option value={3}>3 / 4 Span</option>
                            <option value={4}>4 / 4 Full Row</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label
                            htmlFor={`active-height-${activeElement.id}`}
                            className="block text-[9px] font-black text-slate-400 uppercase tracking-widest font-sans pl-0.5"
                          >
                            Min Height Px
                          </label>
                          <input
                            id={`active-height-${activeElement.id}`}
                            type="number"
                            min={60}
                            max={400}
                            step={10}
                            value={activeElement.heightPx}
                            onChange={(e) =>
                              handleUpdateElementField(activeElement.id, {
                                heightPx: Number(e.target.value),
                              })
                            }
                            className="w-full p-2 border-2 border-slate-200 focus:border-slate-900 rounded-xl focus:outline-none font-bold text-slate-705 bg-slate-50"
                          />
                        </div>
                      </div>

                      {/* Field Placeholder parameter updates */}
                      <div className="space-y-1">
                        <label
                          htmlFor={`active-placeholder-${activeElement.id}`}
                          className="block text-[9.5px] font-black text-slate-400 uppercase tracking-widest font-sans pl-0.5"
                        >
                          Mock Placeholder details
                        </label>
                        <input
                          id={`active-placeholder-${activeElement.id}`}
                          type="text"
                          value={activeElement.placeholderText || ""}
                          onChange={(e) =>
                            handleUpdateElementField(activeElement.id, {
                              placeholderText: e.target.value,
                            })
                          }
                          className="w-full p-2 border-2 border-slate-200 focus:border-slate-900 rounded-xl focus:outline-none text-xs font-semibold text-slate-750 bg-slate-50"
                          placeholder="e.g. mongodb://localhost:27017"
                        />
                      </div>

                      {/* Component descriptive purpose and annotations */}
                      <div className="space-y-1">
                        <label
                          htmlFor={`active-purpose-${activeElement.id}`}
                          className="block text-[9.5px] font-black text-slate-400 uppercase tracking-widest font-sans pl-0.5"
                        >
                          Product UX Purpose
                        </label>
                        <textarea
                          id={`active-purpose-${activeElement.id}`}
                          rows={2}
                          value={activeElement.purpose || ""}
                          onChange={(e) =>
                            handleUpdateElementField(activeElement.id, {
                              purpose: e.target.value,
                            })
                          }
                          className="w-full p-2 border-2 border-slate-200 focus:border-slate-900 rounded-xl focus:outline-none text-[11px] font-medium leading-normal text-slate-600 bg-slate-50 italic"
                          placeholder="Explain what role this card serves for users..."
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 select-none">
                      <button
                        type="button"
                        onClick={() => setShowExporterTab("code")}
                        className="flex-1 text-center py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11px] uppercase tracking-wide rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                      >
                        ⚡ Generate Code template
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 flex-1 flex flex-col justify-center select-none">
                    <span className="w-11 h-11 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-3.5 text-lg font-bold">
                      💡
                    </span>
                    <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">
                      Interface Inspector Node
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed max-w-52.5 mx-auto mt-1">
                      Click any component layout card left to customize its
                      width spans, heights, labels, types, and auto-export clean
                      React structures.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB: React & Tailwind Exporter */}
            {showExporterTab === "code" && activeElement && (
              <div className="flex-1 flex flex-col justify-between font-mono text-[10px]">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-sans font-black text-slate-450 uppercase tracking-wider">
                      React Component Scaffold
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="px-2 py-1 bg-slate-100 border border-slate-200 text-slate-700 font-sans hover:bg-slate-200 text-[10px] font-extrabold rounded-md flex items-center gap-1 cursor-pointer select-none"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">
                            Copied!
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Payload</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Code frame */}
                  <div className="bg-slate-950 text-slate-300 rounded-2xl p-4 overflow-x-auto max-h-75 border border-slate-900 leading-normal custom-scrollbar scrollbar-thin">
                    <pre className="whitespace-pre">{generatedCodeSnippet}</pre>
                  </div>

                  <span className="block text-[8.5px] font-sans text-slate-400 italic text-center leading-normal">
                    Designed with standard tailwind styling arrays, fully
                    customizable.
                  </span>
                </div>

                <div className="flex justify-end pt-3 text-right">
                  <button
                    type="button"
                    onClick={() => setShowExporterTab("inspector")}
                    className="px-3.5 py-1.5 border border-slate-200 hover:border-slate-300 text-slate-600 text-[11px] font-black rounded-xl cursor-pointer select-none"
                  >
                    Return to Inspector
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* UX Usability Highlights container */}
          <div className="bg-indigo-600 text-white border-2 border-slate-900 rounded-3xl p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] leading-relaxed select-none text-left">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-indigo-500 text-indigo-100 rounded text-[9.5px] font-extrabold uppercase mb-2 mr-1">
              <Sparkles className="w-3 h-3" />
              <span>UX & Usability Insights</span>
            </span>
            <ul className="space-y-3 text-xs font-sans text-indigo-100 leading-normal">
              {wireframe.UXHighlights.map((highlight, idx) => (
                <li key={idx} className="flex items-start gap-2 text-[11px]">
                  <Star className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-300 fill-amber-300" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
