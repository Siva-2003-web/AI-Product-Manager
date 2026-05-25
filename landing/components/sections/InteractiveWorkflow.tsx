"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { CheckCircle, Lightbulb, Rocket, Settings } from "lucide-react";
import ScrollReveal from "../ui/ScrollReveal";

const STEPS = [
  {
    id: 1,
    title: "Ideation & Discovery",
    description: "The AI Product Manager conducts market research, analyzes user needs, and writes a comprehensive PRD.",
    icon: Lightbulb,
  },
  {
    id: 2,
    title: "System Architecture",
    description: "The Database Architect and Backend Dev design the data models, API endpoints, and system diagrams.",
    icon: Settings,
  },
  {
    id: 3,
    title: "UI/UX Design",
    description: "The Lead Designer establishes the design system, creates wireframes, and ensures accessibility.",
    icon: CheckCircle,
  },
  {
    id: 4,
    title: "Development & Deployment",
    description: "Frontend and DevOps agents write the React components, configure Vite, and deploy to production.",
    icon: Rocket,
  },
];

export default function InteractiveWorkflow() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll progress through this section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  // Map scroll progress to the height of the vertical line
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="how-it-works" className="section-padding bg-slate-900" ref={containerRef}>
      <div className="section-container">
        <ScrollReveal>
          <div className="text-center mb-24">
            <h2 className="section-heading text-white mb-4">
              From Idea to <span className="gradient-text">Production</span>
            </h2>
            <p className="section-subheading text-slate-400 mx-auto">
              Watch as our AI swarm autonomously handles every stage of the
              software development lifecycle.
            </p>
          </div>
        </ScrollReveal>

        <div className="relative max-w-4xl mx-auto">
          {/* Vertical Progress Line (Background) */}
          <div className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-1 bg-slate-800 -translate-x-1/2 rounded-full" />
          
          {/* Vertical Progress Line (Fill) */}
          <motion.div
            className="absolute left-[28px] md:left-1/2 top-0 w-1 bg-primary-500 -translate-x-1/2 rounded-full shadow-[0_0_15px_rgba(14,165,233,0.5)]"
            style={{ height: lineHeight }}
          />

          <div className="space-y-24">
            {STEPS.map((step, index) => {
              const isEven = index % 2 === 0;
              const Icon = step.icon;

              return (
                <div key={step.id} className="relative flex flex-col md:flex-row items-start md:items-center w-full">
                  
                  {/* Left Content (Empty on small screens, alternating on desktop) */}
                  <div className={`hidden md:block w-1/2 ${isEven ? "pr-16 text-right" : "pl-16 order-last"}`}>
                    <motion.div
                      initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ type: "spring", bounce: 0.4, duration: 1 }}
                    >
                      <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                      <p className="text-slate-400 leading-relaxed">{step.description}</p>
                    </motion.div>
                  </div>

                  {/* Center Node */}
                  <div className="absolute left-0 md:left-1/2 -translate-x-1/2 flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ type: "spring", bounce: 0.6, duration: 0.8 }}
                      className="w-14 h-14 rounded-full bg-slate-900 border-4 border-slate-800 flex items-center justify-center z-10"
                    >
                      <Icon className="w-6 h-6 text-slate-400" />
                    </motion.div>
                  </div>

                  {/* Mobile Content (Always on right) / Desktop Content (Alternating) */}
                  <div className={`w-full pl-20 md:w-1/2 md:pl-0 ${!isEven ? "md:pr-16 md:text-right md:hidden" : ""}`}>
                     <motion.div
                      initial={{ opacity: 0, x: 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ type: "spring", bounce: 0.4, duration: 1 }}
                      className={!isEven ? "hidden md:block" : ""}
                    >
                      {!isEven && (
                        <>
                          <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                          <p className="text-slate-400 leading-relaxed">{step.description}</p>
                        </>
                      )}
                    </motion.div>
                    
                    {/* Mobile Only View */}
                    <motion.div
                      initial={{ opacity: 0, x: 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ type: "spring", bounce: 0.4, duration: 1 }}
                      className="md:hidden"
                    >
                      <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                      <p className="text-slate-400 leading-relaxed">{step.description}</p>
                    </motion.div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
