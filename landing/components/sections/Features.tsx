"use client";

import { FileText, Kanban, Boxes } from "lucide-react";
import ScrollReveal from "@/components/animations/ScrollReveal";
import Badge from "@/components/ui/Badge";
import { FEATURES } from "@/lib/constants";

const iconMap = {
  FileText,
  Kanban,
  Boxes,
} as const;

export default function Features() {
  return (
    <section id="features" className="section-padding relative">
      <div className="section-container">
        <ScrollReveal className="text-center mb-12 lg:mb-16">
          <Badge className="mb-4">Features</Badge>
          <h2 className="section-heading mb-4">
            Everything You Need to{" "}
            <span className="gradient-text">Plan & Build</span>
          </h2>
          <p className="section-subheading mx-auto">
            From idea to architecture — AI handles the heavy lifting so you can
            focus on strategy and execution.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {FEATURES.map((feature, index) => {
            const Icon = iconMap[feature.icon];
            return (
              <ScrollReveal key={feature.title} delay={index * 0.15}>
                <div className="group bg-white rounded-card p-6 lg:p-8 shadow-md hover:shadow-xl border border-gray-100 hover:border-primary-200 transition-all duration-250 cursor-pointer h-full">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary-500 transition-colors duration-250">
                    <Icon className="w-6 h-6 text-primary-600 group-hover:text-white transition-colors duration-250" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-text mb-3">
                    {feature.title}
                  </h3>
                  <p className="font-body text-text-muted leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
