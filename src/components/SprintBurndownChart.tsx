import React, { useRef, useEffect, useState, useMemo } from "react";
import * as d3 from "d3";
import { SprintPlan } from "../types";
import { TrendingDown, Award, CheckCircle } from "lucide-react";

interface SprintBurndownChartProps {
  sprintPlans: SprintPlan[];
  completedStoryIds: Record<string, boolean>;
}

interface ChartDataPoint {
  index: number;
  label: string;
  ideal: number;
  actual: number;
  completedPoints: number;
  plannedPoints: number;
}

export default function SprintBurndownChart({ sprintPlans, completedStoryIds }: SprintBurndownChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(500);
  const height = 240;

  useEffect(() => {
    if (!containerRef.current) return;
    
    const handleResize = () => {
      if (containerRef.current) {
        setWidth(Math.max(containerRef.current.clientWidth, 320));
      }
    };
    
    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Compute stats and data points
  const { chartData, totalSP, totalCompletedSP, completionRate } = useMemo(() => {
    let total = 0;
    const sprintPlannedPointsList = sprintPlans.map(s => {
      const sp = s.stories.reduce((acc, story) => acc + story.storyPoints, 0);
      total += sp;
      return sp;
    });

    const sprintCompletedPointsList = sprintPlans.map(s => {
      return s.stories.reduce((acc, story) => {
        return acc + (completedStoryIds[story.id] ? story.storyPoints : 0);
      }, 0);
    });

    const completedTotal = sprintPlans.reduce((sum, s) => {
      return sum + s.stories.reduce((acc, story) => {
        return acc + (completedStoryIds[story.id] ? story.storyPoints : 0);
      }, 0);
    }, 0);

    const dataPoints: ChartDataPoint[] = [];
    
    // Day 0 (Kickoff point)
    dataPoints.push({
      index: 0,
      label: "Kickoff",
      ideal: total,
      actual: total,
      completedPoints: 0,
      plannedPoints: 0,
    });

    let currentIdeal = total;
    let currentActual = total;

    for (let i = 0; i < sprintPlans.length; i++) {
      currentIdeal -= sprintPlannedPointsList[i];
      currentActual -= sprintCompletedPointsList[i];
      
      dataPoints.push({
        index: i + 1,
        label: sprintPlans[i].sprintName,
        ideal: Math.max(0, currentIdeal),
        actual: Math.max(0, currentActual),
        completedPoints: sprintCompletedPointsList[i],
        plannedPoints: sprintPlannedPointsList[i],
      });
    }

    return {
      chartData: dataPoints,
      totalSP: total,
      totalCompletedSP: completedTotal,
      completionRate: total > 0 ? Math.round((completedTotal / total) * 100) : 0,
    };
  }, [sprintPlans, completedStoryIds]);

  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null);

  // SVG dimensions & scales
  const margin = { top: 20, right: 30, bottom: 40, left: 45 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = useMemo(() => {
    return d3.scaleLinear()
      .domain([0, chartData.length - 1])
      .range([0, innerWidth]);
  }, [chartData, innerWidth]);

  const yScale = useMemo(() => {
    return d3.scaleLinear()
      .domain([0, Math.max(10, totalSP)])
      .range([innerHeight, 0])
      .nice();
  }, [totalSP, innerHeight]);

  // Generators for line paths
  const idealLinePath = useMemo(() => {
    const generator = d3.line<ChartDataPoint>()
      .x(d => xScale(d.index))
      .y(d => yScale(d.ideal))
      .curve(d3.curveMonotoneX);
    return generator(chartData) || "";
  }, [chartData, xScale, yScale]);

  const actualLinePath = useMemo(() => {
    const generator = d3.line<ChartDataPoint>()
      .x(d => xScale(d.index))
      .y(d => yScale(d.actual))
      .curve(d3.curveMonotoneX);
    return generator(chartData) || "";
  }, [chartData, xScale, yScale]);

  const yTicks = yScale.ticks(5);

  return (
    <div id="sprint-burndown-container" ref={containerRef} className="bg-slate-55 border border-slate-200/60 rounded-2xl p-5 shadow-xs font-sans transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-4.5 h-4.5 text-indigo-600" />
          <div>
            <span className="text-[9px] font-black text-indigo-505 font-mono tracking-widest block uppercase">PREDICTIVE RELEASE BURN-DOWN</span>
            <h4 className="text-xs font-bold text-slate-800">Sprint burndown &amp; scope tracking chart</h4>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-[10px] font-semibold text-slate-500">
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
            <span>Progress: <strong className="text-slate-800">{totalCompletedSP} / {totalSP} SP</strong> ({completionRate}%)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* SVG Chart Panel */}
        <div className="lg:col-span-8 relative">
          <svg width={width} height={height} className="overflow-visible select-none">
            <g transform={`translate(${margin.left}, ${margin.top})`}>
              {/* Horizontal Reference Gridlines */}
              {yTicks.map((tick, i) => (
                <g key={`y-grid-${i}`} transform={`translate(0, ${yScale(tick)})`}>
                  <line
                    x1={0}
                    x2={innerWidth}
                    stroke="#f1f5f9"
                    strokeWidth={1}
                    strokeDasharray="3,3"
                  />
                  <text
                    x={-8}
                    y={3}
                    textAnchor="end"
                    className="fill-slate-400 font-mono text-[9px] font-semibold"
                  >
                    {tick}
                  </text>
                </g>
              ))}

              {/* Vertical Gridlines / x-Ticks */}
              {chartData.map((d, i) => {
                const x = xScale(d.index);
                return (
                  <g key={`x-grid-${i}`}>
                    <line
                      x1={x}
                      x2={x}
                      y1={0}
                      y2={innerHeight}
                      stroke="#f1f5f9"
                      strokeWidth={1}
                    />
                    <text
                      x={x}
                      y={innerHeight + 14}
                      textAnchor="middle"
                      className="fill-slate-503 font-sans text-[9px] font-bold"
                    >
                      {d.label}
                    </text>
                  </g>
                );
              })}

              {/* Bottom solid baseline */}
              <line
                x1={0}
                x2={innerWidth}
                y1={innerHeight}
                y2={innerHeight}
                stroke="#e2e8f0"
                strokeWidth={1.5}
              />

              {/* Ideal Burndown Line (Dashed) */}
              <path
                d={idealLinePath}
                fill="none"
                stroke="#94a3b8"
                strokeWidth={1.5}
                strokeDasharray="4,4"
                className="transition-all duration-300"
              />

              {/* Actual Burndown Line (Solid Indigo) */}
              <path
                d={actualLinePath}
                fill="none"
                stroke="#4f46e5"
                strokeWidth={2.5}
                className="transition-all duration-300"
              />

              {/* Active Hover guide line */}
              {hoveredPoint !== null && (
                <line
                  x1={xScale(hoveredPoint.index)}
                  x2={xScale(hoveredPoint.index)}
                  y1={0}
                  y2={innerHeight}
                  stroke="#c7d2fe"
                  strokeWidth={1.5}
                  strokeDasharray="3,3"
                />
              )}

              {/* Ideal points circles */}
              {chartData.map((d, i) => (
                <circle
                  key={`ideal-pt-${i}`}
                  cx={xScale(d.index)}
                  cy={yScale(d.ideal)}
                  r={3.5}
                  className="fill-white stroke-slate-400 stroke-1.5 transition-all duration-300"
                />
              ))}

              {/* Actual points circles & interactions */}
              {chartData.map((d, i) => {
                const isHovered = hoveredPoint?.index === d.index;
                return (
                  <g key={`actual-pt-group-${i}`}>
                    <circle
                      cx={xScale(d.index)}
                      cy={yScale(d.actual)}
                      r={isHovered ? 6 : 4}
                      className="fill-indigo-600 stroke-white stroke-2 shadow-xs transition-all duration-150 cursor-pointer"
                      onMouseEnter={() => setHoveredPoint(d)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                    {/* Larger interactive area */}
                    <circle
                      cx={xScale(d.index)}
                      cy={yScale(d.actual)}
                      r={15}
                      className="fill-transparent cursor-pointer"
                      onMouseEnter={() => setHoveredPoint(d)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Simple custom floating tooltip HTML panel inside container */}
          {hoveredPoint && (
            <div
              className="absolute bg-slate-900 text-white rounded-lg p-2.5 text-[10px] pointer-events-none shadow-md z-30 font-sans border border-slate-800 transition-all duration-150"
              style={{
                left: `${xScale(hoveredPoint.index) + margin.left + 12}px`,
                top: `${yScale(hoveredPoint.actual) - 15}px`,
                transform: "translate(-50%, -100%)"
              }}
            >
              <div className="font-extrabold border-b border-slate-800 pb-1 mb-1 text-slate-205">
                {hoveredPoint.label}
              </div>
              <div className="space-y-0.5">
                <div className="flex justify-between gap-6">
                  <span className="text-slate-400">Remaining SP:</span>
                  <strong className="text-white font-mono">{hoveredPoint.actual} SP</strong>
                </div>
                <div className="flex justify-between gap-6">
                  <span className="text-slate-400">Ideal Target:</span>
                  <strong className="text-slate-300 font-mono">{Math.round(hoveredPoint.ideal)} SP</strong>
                </div>
                {hoveredPoint.index > 0 && (
                  <>
                    <div className="flex justify-between gap-6 border-t border-slate-800/60 mt-1 pt-1">
                      <span className="text-slate-400 font-medium">Sprint Completed:</span>
                      <strong className="text-emerald-400 font-mono">+{hoveredPoint.completedPoints} SP</strong>
                    </div>
                    <div className="flex justify-between gap-6">
                      <span className="text-slate-400 font-medium">Sprint Committed:</span>
                      <strong className="text-slate-200 font-mono">{hoveredPoint.plannedPoints} SP</strong>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Legend & Stats Sidebar panel */}
        <div className="lg:col-span-4 bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col justify-between h-full space-y-4">
          <div className="space-y-2.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Status Legend</span>
            
            <div className="space-y-2 text-[11px] font-sans">
              <div className="flex items-start gap-2">
                <div className="w-5 h-2.5 border-t-2 border-indigo-600 mt-1.5 shrink-0" />
                <div>
                  <strong className="text-slate-800 block">Actual Scope Remaining</strong>
                  <p className="text-slate-500 text-[10px]">Real-time actual burn-down curve reflecting marked tasks.</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-5 h-2.5 border-t-2 border-dashed border-slate-400 mt-1.5 shrink-0" />
                <div>
                  <strong className="text-slate-800 block">Ideal Burn Guidelines</strong>
                  <p className="text-slate-500 text-[10px]">Linear guidance path to hit 100% completion by release.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3.5 border-t border-slate-200/60 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-indigo-700">
              <Award className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Release Target</span>
            </div>
            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
              0 Remaining
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
