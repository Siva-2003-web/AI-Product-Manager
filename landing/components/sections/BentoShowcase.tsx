"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { MouseEvent } from "react";
import { Activity, Database, DownloadCloud, Sparkles } from "lucide-react";
import ScrollReveal from "../ui/ScrollReveal";

function BentoCard({
  title,
  description,
  icon: Icon,
  className = "",
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  className?: string;
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`group relative rounded-3xl border border-white/10 bg-slate-900 overflow-hidden ${className}`}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              600px circle at ${mouseX}px ${mouseY}px,
              rgba(14, 165, 233, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full flex flex-col p-8 z-10">
        <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700 mb-6">
          <Icon className="w-6 h-6 text-primary-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export default function BentoShowcase() {
  return (
    <section id="architecture" className="section-padding bg-slate-950">
      <div className="section-container">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="section-heading text-white mb-4">
              Enterprise-Grade <span className="gradient-text">Architecture</span>
            </h2>
            <p className="section-subheading text-slate-400 mx-auto">
              Under the hood, our AI network utilizes state-of-the-art tooling to
              ensure your generated applications are robust and scalable.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Large Featured Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 md:row-span-2"
          >
            <BentoCard
              title="Real-Time Streaming Generation"
              description="Watch your application build in real-time. Our agents stream their thought processes, architecture decisions, and code snippets directly to your dashboard without delay. Experience the magic of transparent AI development as you observe the Business Analyst outlining the PRD, the UI Designer drafting Tailwind components, and the Database Architect spinning up your MongoDB collections. This continuous feedback loop ensures that you remain in complete control, allowing you to intercept, review, or course-correct the generation process at any second."
              icon={Activity}
              className="h-full min-h-[300px]"
            />
          </motion.div>

          {/* Standard Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <BentoCard
              title="MongoDB Integration"
              description="Seamlessly connected to your MongoDB instance for persistent state, chat histories, and vector embeddings."
              icon={Database}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <BentoCard
              title="One-Click Export"
              description="Export your fully generated application as a production-ready Next.js + Tailwind codebase."
              icon={DownloadCloud}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="md:col-span-3"
          >
            <BentoCard
              title="Advanced Prompt Engineering"
              description="Built on top of Gemini 2.0 Flash, our custom system prompts instruct agents to think step-by-step, review each other's work, and output deterministic code structures."
              icon={Sparkles}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
