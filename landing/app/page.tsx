import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import AgentNetwork from "@/components/sections/AgentNetwork";
import InteractiveWorkflow from "@/components/sections/InteractiveWorkflow";
import BentoShowcase from "@/components/sections/BentoShowcase";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <AgentNetwork />
        <InteractiveWorkflow />
        <BentoShowcase />
      </main>
      <Footer />
    </>
  );
}
