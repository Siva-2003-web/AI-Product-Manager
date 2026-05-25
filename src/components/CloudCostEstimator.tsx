import React, { useState, useMemo, useEffect, useRef } from "react";
import * as d3 from "d3";
import { ProjectOverview } from "../types";
import { Info, HelpCircle, HardDrive, Cpu, Cloud, Database as DbIcon, DollarSign, Sparkles } from "lucide-react";

interface CloudCostEstimatorProps {
  overview: ProjectOverview;
}

interface CostCategory {
  name: string;
  value: number;
  color: string;
  icon: React.ReactNode;
  description: string;
}

export default function CloudCostEstimator({ overview }: CloudCostEstimatorProps) {
  // 1. Interactive scale slider states
  const [mau, setMau] = useState<number>(10000); // Monthly Active Users
  const [dbActivity, setDbActivity] = useState<number>(30); // DB Reads/Writes per user per month
  const [bandwidthPerUser, setBandwidthPerUser] = useState<number>(15); // MB transferred per user per month
  const [computeMinutesPerUser, setComputeMinutesPerUser] = useState<number>(5); // CPU minutes used per user per month

  // Detect suggestions from the tech stack to fine-tune unit economics multiplier defaults
  const pricingAdjustments = useMemo(() => {
    const dbLower = (overview.techStackSuggested?.database || "").toLowerCase();
    const hostingLower = (overview.techStackSuggested?.hosting || "").toLowerCase();
    const serverLower = (overview.techStackSuggested?.backend || "").toLowerCase();

    return {
      // Postgres/Cloud SQL can be more expensive at initial scale due to fixed instances compared to serverless key-value or SQLite
      dbFixedBase: dbLower.includes("postgres") || dbLower.includes("sql") || dbLower.includes("spanner") ? 15.0 : 0.0,
      dbMultiplier: dbLower.includes("firestore") || dbLower.includes("dynamo") || dbLower.includes("nosql") ? 0.00010 : 0.00025,
      // Hosting platform premiums
      hostingFactor: hostingLower.includes("aws") || hostingLower.includes("gcp") || hostingLower.includes("azure") ? 1.2 : 0.8,
      // Compute style adjustments (Serverless e.g. Lambda vs. Persistent e.g. Docker VMs/Cloud Run)
      computeMultiplier: serverLower.includes("express") || serverLower.includes("docker") || serverLower.includes("kubernetes") ? 0.0035 : 0.0020
    };
  }, [overview]);

  // Dynamic cost calculation engine
  const costCategories = useMemo<CostCategory[]>(() => {
    // A. Database layer economics
    // Free tier allocations: e.g. 50k free writes/reads for small serverless setups
    const totalDbOps = mau * dbActivity;
    const billableDbOps = Math.max(0, totalDbOps - 50000);
    const dbCost = pricingAdjustments.dbFixedBase + (billableDbOps * pricingAdjustments.dbMultiplier);

    // B. Compute & Functions execution
    const totalComputeMins = mau * computeMinutesPerUser;
    // Standard serverless container metrics (e.g. 0.0001667 USD per vCPU/sec + RAM on Cloud Run, plus free tier)
    const billableComputeMins = Math.max(0, totalComputeMins - 1000);
    const computeCost = billableComputeMins * pricingAdjustments.computeMultiplier;

    // C. Network Transit & Web Content Hosting
    const totalTrafficMB = mau * bandwidthPerUser;
    const totalGB = totalTrafficMB / 1024;
    // Standard edge network egress pricing ($0.08 to $0.15 per GB depending on AWS/Vercel)
    const egressCost = totalGB * 0.11 * pricingAdjustments.hostingFactor;
    const baseHostingCost = 5.0 * pricingAdjustments.hostingFactor; // Basic deployment tier
    const hostingCost = baseHostingCost + egressCost;

    // D. Cloud Assets & Storage (backups, user media files uploaded)
    // Assume average 10MB file storage used per active subscriber
    const totalStorageGB = (mau * 0.01);
    const billingStorage = Math.max(0, totalStorageGB - 5); // 5GB free tier limit
    const storageCost = billingStorage * 0.026; // $0.026/GB/month AWS S3 standard

    // Round items to two decimal places
    return [
      {
        name: "Database Layer",
        value: parseFloat(dbCost.toFixed(2)),
        color: "#6366f1", // indigo-500
        icon: <DbIcon className="w-4 h-4 text-indigo-600" />,
        description: `Persistent data querying of ${totalDbOps.toLocaleString()} ops across ${overview.techStackSuggested?.database || "Database"}.`
      },
      {
        name: "Server / Compute",
        value: parseFloat(computeCost.toFixed(2)),
        color: "#f59e0b", // amber-500
        icon: <Cpu className="w-4 h-4 text-amber-600" />,
        description: `Container execution metrics of ${totalComputeMins.toLocaleString()} min/month on ${overview.techStackSuggested?.hosting || "Cloud Hosting"}.`
      },
      {
        name: "Hosting & CDN",
        value: parseFloat(hostingCost.toFixed(2)),
        color: "#10b981", // emerald-500
        icon: <Cloud className="w-4 h-4 text-emerald-600" />,
        description: `Site serving & ${totalGB.toFixed(1)} GB egress data routed through distributed CDN networks.`
      },
      {
        name: "Media Storage",
        value: parseFloat(storageCost.toFixed(2)),
        color: "#ec4899", // pink-500
        icon: <HardDrive className="w-4 h-4 text-pink-600" />,
        description: `Binary user asset archives storing ~${(totalStorageGB).toFixed(1)} GB of content payloads with encryption.`
      }
    ];
  }, [mau, dbActivity, bandwidthPerUser, computeMinutesPerUser, pricingAdjustments, overview]);

  // Aggregate summation of individual cost bars
  const totalCostEstimate = useMemo(() => {
    const total = costCategories.reduce((sum, item) => sum + item.value, 0);
    return parseFloat(total.toFixed(2));
  }, [costCategories]);

  // D3 Bar Chart Setup & Mechanics
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(450);
  const chartHeight = 200;

  useEffect(() => {
    if (!containerRef.current) return;
    const handleResize = () => {
      if (containerRef.current) {
        setChartWidth(Math.max(containerRef.current.clientWidth - 32, 280));
      }
    };
    handleResize();
    const obs = new ResizeObserver(handleResize);
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clean drawing board
    const d3Svg = d3.select(svgRef.current);
    d3Svg.selectAll("*").remove();

    const margins = { top: 15, right: 15, bottom: 35, left: 55 };
    const plotWidth = chartWidth - margins.left - margins.right;
    const plotHeight = chartHeight - margins.top - margins.bottom;

    const g = d3Svg.append("g")
      .attr("transform", `translate(${margins.left}, ${margins.top})`);

    // Define Scale mapping matching calculated categories
    const x = d3.scaleBand()
      .domain(costCategories.map(d => d.name))
      .range([0, plotWidth])
      .padding(0.35);

    const maxVal = d3.max(costCategories, (d: CostCategory) => d.value) || 10;
    const y = d3.scaleLinear()
      .domain([0, maxVal * 1.15]) // Pad with 15% top overhead
      .range([plotHeight, 0]);

    // Gridlines for visual cues
    const yTicks = y.ticks(5);
    yTicks.forEach(tick => {
      g.append("line")
        .attr("x1", 0)
        .attr("x2", plotWidth)
        .attr("y1", y(tick))
        .attr("y2", y(tick))
        .attr("stroke", "#f1f5f9")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "3,3");
    });

    // Drawing Custom Rounded Rect BARS representing categories
    costCategories.forEach(d => {
      const rx = 6; // capsule round boundary
      const barX = x(d.name) || 0;
      const barY = y(d.value);
      const barW = x.bandwidth();
      const barH = Math.max(plotHeight - barY, 4); // minimum height to show color

      g.append("path")
        .attr("d", `
          M${barX},${barY + rx}
          a${rx},${rx} 0 0,1 ${rx},-${rx}
          h${barW - 2 * rx}
          a${rx},${rx} 0 0,1 ${rx},${rx}
          v${barH - rx}
          h-${barW}
          Z
        `)
        .attr("fill", d.color)
        .attr("class", "cursor-pointer transition-all duration-300 hover:opacity-90")
        .attr("filter", "drop-shadow(0px 2px 4px rgba(0,0,0,0.04))")
        // interactive trigger
        .append("title")
        .text(`${d.name}: $${d.value.toFixed(2)} / mo`);
    });

    // Add Text values directly on top of the bars
    costCategories.forEach(d => {
      const barX = x(d.name) || 0;
      const barY = y(d.value);
      const barW = x.bandwidth();

      g.append("text")
        .attr("x", barX + barW / 2)
        .attr("y", barY - 6)
        .attr("text-anchor", "middle")
        .attr("fill", "#475569") // Slate 600
        .attr("font-size", "10px")
        .attr("font-weight", "700")
        .attr("font-family", "monospace")
        .text(`$${d.value.toFixed(1)}`);
    });

    // Horizontal bottom border axis
    g.append("line")
      .attr("x1", 0)
      .attr("x2", plotWidth)
      .attr("y1", plotHeight)
      .attr("y2", plotHeight)
      .attr("stroke", "#cbd5e1")
      .attr("stroke-width", 1.5);

    // Left coordinate values Axis labels
    yTicks.forEach(tick => {
      g.append("text")
        .attr("x", -8)
        .attr("y", y(tick) + 3)
        .attr("text-anchor", "end")
        .attr("fill", "#94a3b8")
        .attr("font-size", "9px")
        .attr("font-family", "monospace")
        .attr("font-weight", "650")
        .text(`$${tick}`);
    });

    // Bottom structural category label items
    costCategories.forEach(d => {
      const bx = (x(d.name) || 0) + x.bandwidth() / 2;
      g.append("text")
        .attr("x", bx)
        .attr("y", plotHeight + 18)
        .attr("text-anchor", "middle")
        .attr("fill", "#64748b")
        .attr("font-size", "9px")
        .attr("font-weight", "bold")
        .text(d.name.split(" ")[0]); // Simplify terms to save spacing under smaller modules
    });

  }, [costCategories, chartWidth]);

  return (
    <div ref={containerRef} id="cloud-infrastructure-cost-estimator" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1 px-2.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-black uppercase rounded-lg tracking-wider">
            Calculator Tool
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm leading-tight">Monthly Serverless Cloud Cost Predictor</h3>
            <p className="text-[11px] text-slate-500">Simulate hosting & db cost scales for custom user loads</p>
          </div>
        </div>

        {/* Dynamic badge readout */}
        <div className="flex items-center gap-1.5 self-start sm:self-center bg-indigo-600 border border-indigo-700 text-white p-2 px-3.5 rounded-xl shadow-xs animate-pulse">
          <DollarSign className="w-4 h-4" />
          <div className="text-right">
            <span className="block text-[8px] uppercase tracking-widest font-black text-indigo-200">Total Run Rate</span>
            <span className="text-sm font-extrabold font-mono">${totalCostEstimate.toLocaleString()}</span>
            <span className="text-[9px] font-medium text-white/80">/mo</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Dynamic Controls Sliders */}
        <div className="md:col-span-7 space-y-4">
          {/* Slider 1: MAU */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-sans">
              <label className="text-slate-700 font-bold flex items-center gap-1">
                Monthly Active Users (MAU)
                <span className="text-[10px] text-slate-400 font-normal">({(mau / 1000).toFixed(0)}k Scale)</span>
              </label>
              <span className="font-mono text-indigo-605 font-bold bg-indigo-50/50 px-2 py-0.5 rounded border border-indigo-100/40">
                {mau.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="150000"
              step="2000"
              value={mau}
              onChange={(e) => setMau(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
            />
          </div>

          {/* Slider 2: DB Operations Per User */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-sans">
              <label className="text-slate-705 font-bold flex items-center gap-1">
                Database reads/writes
                <span className="text-[10px] text-slate-400 font-normal">(/user monthly)</span>
              </label>
              <span className="font-mono text-slate-600 font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                {dbActivity} ops
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="200"
              step="5"
              value={dbActivity}
              onChange={(e) => setDbActivity(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
            />
          </div>

          {/* Slider 3: Outbound Egress Bandwidth */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-sans">
              <label className="text-slate-705 font-bold flex items-center gap-1">
                Network Bandwidth Egress
                <span className="text-[10px] text-slate-400 font-normal">(/user monthly)</span>
              </label>
              <span className="font-mono text-slate-600 font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                {bandwidthPerUser} MB
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="150"
              step="5"
              value={bandwidthPerUser}
              onChange={(e) => setBandwidthPerUser(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
            />
          </div>

          {/* Slider 4: Serverless container compute hours */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-sans">
              <label className="text-slate-705 font-bold flex items-center gap-1">
                Server vCPU Compute Duration
                <span className="text-[10px] text-slate-400 font-normal">(/user monthly)</span>
              </label>
              <span className="font-mono text-slate-600 font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                {computeMinutesPerUser} CPU mins
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={computeMinutesPerUser}
              onChange={(e) => setComputeMinutesPerUser(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Chart View Visualization */}
        <div className="md:col-span-5 flex flex-col justify-center items-center">
          <svg ref={svgRef} width={chartWidth} height={chartHeight} className="overflow-visible" />
          
          <div className="flex items-center justify-center gap-4 text-[9px] font-bold text-slate-505 uppercase mt-1">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>DB</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Compute</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Hosting</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-pink-500" />
              <span>Assets</span>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdowns detail rows */}
      <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {costCategories.map((cat, idx) => (
          <div key={idx} className="p-3 border border-slate-50 rounded-xl hover:border-slate-100 bg-slate-50/25 flex flex-col justify-between h-auto gap-1">
            <div className="flex items-center gap-1.5">
              {cat.icon}
              <span className="text-xs font-bold text-slate-800">{cat.name}</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-snug my-1 min-h-[36px]">{cat.description}</p>
            <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-1">
              <span className="text-[9px] font-mono text-slate-501 font-semibold">ESTIMATE:</span>
              <strong className="text-xs font-mono text-slate-900">${cat.value.toFixed(2)}</strong>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-slate-50 rounded-xl flex items-start gap-2 text-[10px] leading-relaxed text-slate-600 border border-slate-100">
        <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
        <div>
          <strong>Billing assumptions:</strong> Multipliers are calculated adapting cloud providers list prices (AWS Amplify, GCP Cloud Run, and Firestore Pay-As-You-Go tiers). Adjust the sliders to match your business deployment timelines and usage projections.
        </div>
      </div>
    </div>
  );
}
