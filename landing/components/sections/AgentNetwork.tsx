"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Code,
  Database,
  Layout,
  PenTool,
  Server,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import ScrollReveal from "../ui/ScrollReveal";
import { useEffect, useState } from "react";

const AGENTS = [
  { id: "pm", name: "Product Manager", icon: PenTool, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  { id: "design", name: "UI/UX Designer", icon: Layout, color: "text-pink-500", bg: "bg-pink-500/10", border: "border-pink-500/30" },
  { id: "frontend", name: "Frontend Dev", icon: Code, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  { id: "backend", name: "Backend Dev", icon: Terminal, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/30" },
  { id: "db", name: "DB Architect", icon: Database, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/30" },
  { id: "devops", name: "DevOps Engineer", icon: Server, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/30" },
  { id: "qa", name: "QA Specialist", icon: ShieldCheck, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30" },
];

export default function AgentNetwork() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <section id="agents" className="section-padding bg-slate-950 text-white relative overflow-hidden">
      {/* Background glowing orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="section-container relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="section-heading text-white mb-4">
              Your Entire <span className="gradient-text">AI Tech Team</span>
            </h2>
            <p className="section-subheading text-slate-400 mx-auto">
              Seven autonomous AI agents collaborating in real-time to architect,
              design, build, and deploy your software.
            </p>
          </div>
        </ScrollReveal>

        <div className="relative h-[600px] max-w-4xl mx-auto flex items-center justify-center">
          {/* Central Brain */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", bounce: 0.5, duration: 1 }}
            className="relative z-20 w-32 h-32 rounded-3xl bg-slate-900 border-2 border-primary-500/50 shadow-[0_0_50px_rgba(14,165,233,0.3)] flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-2px] rounded-3xl border border-transparent border-t-primary-400 border-r-primary-500 opacity-50"
            />
            <Brain className="w-12 h-12 text-primary-400" />
          </motion.div>

          {/* Orbiting Agents */}
          {AGENTS.map((agent, index) => {
            const angle = (index * (360 / AGENTS.length)) * (Math.PI / 180);
            const radius = 220; // Distance from center
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const Icon = agent.icon;

            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, x: 0, y: 0 }}
                whileInView={{ opacity: 1, x, y }}
                viewport={{ once: true }}
                transition={{
                  type: "spring",
                  bounce: 0.4,
                  duration: 1.5,
                  delay: index * 0.1,
                }}
                className={`absolute z-10 w-20 h-20 rounded-2xl backdrop-blur-md border ${agent.bg} ${agent.border} flex flex-col items-center justify-center cursor-pointer group`}
              >
                <Icon className={`w-8 h-8 ${agent.color} mb-1 group-hover:scale-110 transition-transform`} />
                
                {/* Tooltip */}
                <div className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-xs font-bold bg-slate-800 px-3 py-1 rounded-full shadow-lg border border-slate-700">
                  {agent.name}
                </div>

                {/* Data Packet Animation */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.5, 1, 0.5],
                    x: [-x * 0.2, -x * 0.8],
                    y: [-y * 0.2, -y * 0.8],
                  }}
                  transition={{
                    duration: 2 + Math.random(),
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: "easeInOut",
                  }}
                  className={`absolute w-3 h-3 rounded-full bg-current ${agent.color} shadow-[0_0_10px_currentColor]`}
                />
              </motion.div>
            );
          })}

          {/* Connecting Lines (SVG) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
            <g style={{ transform: "translate(50%, 50%)" }}>
              {AGENTS.map((_, index) => {
                const angle = (index * (360 / AGENTS.length)) * (Math.PI / 180);
                const x = Math.cos(angle) * 220;
                const y = Math.sin(angle) * 220;
                return (
                  <motion.line
                    key={`line-${index}`}
                    x1="0"
                    y1="0"
                    x2={x}
                    y2={y}
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-slate-400"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                  />
                );
              })}
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}
