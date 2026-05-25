"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-16">
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary-100/40 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-orange-100/30 rounded-full blur-3xl" />
      </div>

      <div className="section-container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Copy */}
          <div className="flex flex-col gap-6 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Badge>✦ AI-Powered Product Management</Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text leading-[1.1]"
            >
              Ship Products{" "}
              <span className="gradient-text">10× Faster</span>{" "}
              with AI
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-lg sm:text-xl text-text-muted max-w-lg mx-auto lg:mx-0 leading-relaxed"
            >
              Transform raw product ideas into comprehensive PRDs, sprint plans,
              architecture designs, and roadmaps — all in minutes, not weeks.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link href="/register">
                <Button variant="primary" size="lg">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Button variant="secondary" size="lg">
                <Play className="w-5 h-5" />
                Watch Demo
              </Button>
            </motion.div>

          </div>

          {/* Right: Product mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              {/* Main mockup card */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-2 text-xs text-text-light font-body">
                    AI Product Manager Suite
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="h-8 bg-linear-to-r from-primary-100 to-primary-50 rounded-lg" />
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-24 bg-primary-50 rounded-lg border border-primary-100 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary-500 font-heading">
                          PRD
                        </div>
                        <div className="text-[10px] text-text-light">
                          Generated
                        </div>
                      </div>
                    </div>
                    <div className="h-24 bg-orange-50 rounded-lg border border-orange-100 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-cta font-heading">
                          Sprint
                        </div>
                        <div className="text-[10px] text-text-light">
                          Planned
                        </div>
                      </div>
                    </div>
                    <div className="h-24 bg-green-50 rounded-lg border border-green-100 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-500 font-heading">
                          API
                        </div>
                        <div className="text-[10px] text-text-light">
                          Designed
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 w-20 bg-primary-100 rounded-full" />
                    <div className="h-6 w-16 bg-orange-100 rounded-full" />
                    <div className="h-6 w-24 bg-green-100 rounded-full" />
                  </div>
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-50 rounded w-1/2" />
                </div>
              </div>

              {/* Floating accent card */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg border border-gray-100 p-4 w-48"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-text font-heading">
                      PRD Ready
                    </div>
                    <div className="text-[10px] text-text-light">
                      Generated in 12s
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Capabilities Marquee */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 lg:mt-24 relative overflow-hidden flex w-full"
        >
          {/* Fade overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-linear-to-r from-primary-50 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-primary-50 to-transparent z-10" />
          
          <div className="flex animate-logo-scroll w-max gap-8 items-center py-4">
            {[
              "PRD Generation",
              "Database Architecture",
              "UI/UX Wireframing",
              "Sprint Planning",
              "Code Generation",
              "API Specifications",
              "Cloud Deployment",
              // Repeat for infinite loop
              "PRD Generation",
              "Database Architecture",
              "UI/UX Wireframing",
              "Sprint Planning",
              "Code Generation",
              "API Specifications",
              "Cloud Deployment",
            ].map((capability, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/60 border border-primary-100 shadow-sm whitespace-nowrap group hover:scale-105 hover:bg-white transition-all cursor-default"
              >
                <Sparkles className="w-4 h-4 text-primary-400 group-hover:text-primary-500" />
                <span className="font-heading font-semibold text-text-muted group-hover:text-primary-600">
                  {capability}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
