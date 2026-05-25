"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Brain,
  Code,
  Database,
  Layout,
  PenTool,
  Server,
  ShieldCheck,
  Terminal,
  Check,
  Loader2,
} from "lucide-react";
import Link from "next/link";

/* ─── Floating Particle System ─── */
function ParticleField() {
  const particles = Array.from({ length: 35 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 10,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background:
              p.id % 3 === 0
                ? "rgba(124, 58, 237, 0.6)"
                : p.id % 3 === 1
                  ? "rgba(56, 189, 248, 0.5)"
                  : "rgba(167, 139, 250, 0.4)",
          }}
          animate={{
            y: [0, -200, -400],
            x: [0, Math.random() * 60 - 30],
            opacity: [0, 0.8, 0],
            scale: [0, 1, 0.5],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

/* ─── Background Waves ─── */
function BackgroundWaves() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={{ x: ["-10%", "10%", "-10%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 -left-1/4 w-[150%] h-full opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at 30% 50%, rgba(124, 58, 237, 0.15) 0%, transparent 60%)",
        }}
      />
      <motion.div
        animate={{ x: ["10%", "-10%", "10%"] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 -right-1/4 w-[150%] h-full opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at 70% 60%, rgba(56, 189, 248, 0.12) 0%, transparent 60%)",
        }}
      />
    </div>
  );
}

/* ─── Floating 3D Shapes ─── */
function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={{ y: [0, -30, 0], rotate: [0, 180, 360] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[12%] left-[8%] w-16 h-16 border border-purple-500/20"
        style={{
          clipPath:
            "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
        }}
      />
      <motion.div
        animate={{ y: [0, 20, 0], rotate: [0, -360] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[65%] left-[6%] w-20 h-20 border-2 border-cyan-500/15 rounded-full"
      />
      <motion.div
        animate={{ y: [0, -25, 0], x: [0, 15, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[25%] right-[10%] w-14 h-14 border border-purple-400/20"
        style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
      />
      <motion.div
        animate={{ y: [0, 35, 0], rotate: [45, 135, 45] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[18%] right-[12%] w-12 h-12 border border-sky-400/20"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[78%] left-[22%] w-3 h-3 rounded-full bg-purple-500/30"
      />
    </div>
  );
}

/* ─── Neon Input Component ─── */
function NeonInput({
  label,
  error,
  ...props
}: {
  label: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false);
  const inputId = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-sm font-medium text-slate-300">
        {label}
      </label>
      <div className="relative group">
        <motion.div
          className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          animate={focused ? { opacity: 1 } : {}}
          style={{
            background: "linear-gradient(135deg, #7C3AED, #38BDF8, #7C3AED)",
            backgroundSize: "200% 200%",
          }}
        >
          <motion.div
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-xl"
            style={{
              background:
                "linear-gradient(135deg, #7C3AED, #38BDF8, #A78BFA, #7C3AED)",
              backgroundSize: "300% 300%",
            }}
          />
        </motion.div>
        <input
          id={inputId}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`relative w-full px-4 py-3.5 rounded-xl text-base text-white placeholder:text-slate-500 transition-all duration-300
            bg-[#1a1a3e]/80 backdrop-blur-sm border
            focus:outline-none focus:ring-0
            ${
              error
                ? "border-rose-500/70"
                : focused
                  ? "border-transparent"
                  : "border-slate-700/50 hover:border-slate-600/60"
            }`}
          {...props}
        />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-rose-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

/* ─── Neon Glow Button ─── */
function NeonButton({
  children,
  loading,
  ...props
}: {
  children: React.ReactNode;
  loading?: boolean;
} & HTMLMotionProps<"button">) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative w-full py-4 rounded-xl font-semibold text-white text-lg cursor-pointer transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-2 bg-[linear-gradient(135deg,#7C3AED,#6D28D9)]"
      disabled={loading}
      {...props}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[inset_0_0_30px_rgba(124,58,237,0.4),0_0_40px_rgba(124,58,237,0.3)]" />
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-30 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] w-1/2"
        animate={{ x: ["-100%", "200%"] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 1,
        }}
      />
      <span className="relative z-10 flex items-center gap-2">
        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
        {children}
      </span>
    </motion.button>
  );
}

/* ─── Password Strength ─── */
function PasswordStrength({ password }: { password: string }) {
  const getStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = getStrength(password);
  const labels = ["", "Weak", "Fair", "Good", "Strong", "Excellent"];
  const colors = [
    "bg-slate-700",
    "bg-rose-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-emerald-500",
    "bg-cyan-400",
  ];

  if (!password) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <motion.div
            key={level}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: level * 0.08 }}
            className={`h-1.5 flex-1 rounded-full origin-left transition-colors duration-300 ${
              level <= strength ? colors[strength] : "bg-slate-700"
            }`}
          />
        ))}
      </div>
      <p
        className={`text-xs font-medium ${
          strength <= 1
            ? "text-rose-400"
            : strength <= 2
              ? "text-orange-400"
              : strength <= 3
                ? "text-yellow-400"
                : "text-emerald-400"
        }`}
      >
        {labels[strength]}
      </p>
    </div>
  );
}

/* ─── Orbiting Agent Icons (Left Panel) ─── */
const AI_AGENTS = [
  {
    icon: PenTool,
    label: "Product Manager",
    positionClass: "top-4 left-1/2 -translate-x-1/2",
    toneClass: "text-sky-400",
    toneSoftClass:
      "bg-sky-400/15 border-sky-400/30 shadow-[0_0_20px_rgba(56,189,248,0.18)]",
  },
  {
    icon: Layout,
    label: "UI/UX Designer",
    positionClass: "top-1/4 right-4 -translate-y-1/2",
    toneClass: "text-pink-400",
    toneSoftClass:
      "bg-pink-400/15 border-pink-400/30 shadow-[0_0_20px_rgba(244,114,182,0.18)]",
  },
  {
    icon: Code,
    label: "Frontend Dev",
    positionClass: "bottom-1/4 right-6 translate-y-1/2",
    toneClass: "text-amber-400",
    toneSoftClass:
      "bg-amber-400/15 border-amber-400/30 shadow-[0_0_20px_rgba(251,191,36,0.18)]",
  },
  {
    icon: Terminal,
    label: "Backend Dev",
    positionClass: "bottom-4 left-1/2 -translate-x-1/2",
    toneClass: "text-emerald-400",
    toneSoftClass:
      "bg-emerald-400/15 border-emerald-400/30 shadow-[0_0_20px_rgba(52,211,153,0.18)]",
  },
  {
    icon: Database,
    label: "DB Architect",
    positionClass: "bottom-1/4 left-6 translate-y-1/2",
    toneClass: "text-violet-400",
    toneSoftClass:
      "bg-violet-400/15 border-violet-400/30 shadow-[0_0_20px_rgba(167,139,250,0.18)]",
  },
  {
    icon: Server,
    label: "DevOps Engineer",
    positionClass: "top-1/4 left-4 -translate-y-1/2",
    toneClass: "text-orange-400",
    toneSoftClass:
      "bg-orange-400/15 border-orange-400/30 shadow-[0_0_20px_rgba(251,146,60,0.18)]",
  },
  {
    icon: ShieldCheck,
    label: "QA Specialist",
    positionClass: "top-1/2 left-6 -translate-y-1/2",
    toneClass: "text-rose-400",
    toneSoftClass:
      "bg-rose-400/15 border-rose-400/30 shadow-[0_0_20px_rgba(248,113,113,0.18)]",
  },
];

function AgentOrbit() {
  const [activeAgent, setActiveAgent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAgent((prev) => (prev + 1) % AI_AGENTS.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-sm mx-auto aspect-square flex items-center justify-center">
      {/* Central brain */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[30%] rounded-full border border-purple-500/20"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[15%] rounded-full border border-cyan-500/10"
      />
      <div className="relative z-10 w-20 h-20 rounded-2xl flex items-center justify-center border border-purple-500/40 bg-[linear-gradient(135deg,rgba(124,58,237,0.2),rgba(56,189,248,0.1))] shadow-[0_0_40px_rgba(124,58,237,0.2)]">
        <Brain className="w-10 h-10 text-purple-400" />
      </div>

      {/* Orbiting agents */}
      {AI_AGENTS.map((agent, index) => {
        const Icon = agent.icon;
        const isActive = index === activeAgent;

        return (
          <motion.div
            key={agent.label}
            className={`absolute flex items-center justify-center cursor-pointer ${agent.positionClass}`}
            animate={{
              scale: isActive ? 1.3 : 1,
              opacity: isActive ? 1 : 0.5,
            }}
            transition={{ duration: 0.3 }}
            onClick={() => setActiveAgent(index)}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                isActive
                  ? agent.toneSoftClass
                  : "bg-white/5 border-white/10 shadow-none"
              }`}
            >
              <Icon className={`w-5 h-5 ${agent.toneClass}`} />
            </div>
          </motion.div>
        );
      })}

      {/* Active agent label */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeAgent}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-4 text-center"
        >
          <p className="text-white font-semibold text-sm">
            {AI_AGENTS[activeAgent].label}
          </p>
          <p className="text-slate-500 text-xs">
            Agent #{activeAgent + 1} — Online
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Registration Page ─── */
export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [serverError, setServerError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const validate = useCallback(() => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Invalid email address";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 8)
      errs.password = "Must be at least 8 characters";
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    if (!agreedToTerms) errs.terms = "You must agree to the terms";
    return errs;
  }, [form, agreedToTerms]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const message =
          typeof data?.error === "string"
            ? data.error
            : data?.error?.message || "Registration failed.";
        setServerError(message);
        return;
      }
      const dashboardUrl =
        typeof window !== "undefined" && window.location.port === "3001"
          ? `http://${window.location.hostname}:3000/dashboard`
          : "/dashboard";
      window.location.href = dashboardUrl;
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-[linear-gradient(135deg,#0a0a1a_0%,#0f0f2e_40%,#0a0a1a_100%)]">
      {/* Background effects */}
      <ParticleField />
      <BackgroundWaves />
      <FloatingShapes />

      {/* Cinematic gradient orbs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] left-[-10%] w-150 h-150 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.2),transparent_70%)]"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute bottom-[-20%] right-[-10%] w-175 h-175 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.15),transparent_70%)]"
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[linear-gradient(rgba(124,58,237,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(124,58,237,0.3)_1px,transparent_1px)] bg-size-[60px_60px]" />

      {/* ─── LEFT: Visual Panel ─── */}
      <div className="hidden lg:flex lg:w-[45%] items-center justify-center relative z-10 p-12">
        <div className="max-w-md w-full">
          {/* Back to Home Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-200 mb-12 group text-sm font-medium"
          >
            <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl font-bold text-white mb-6 leading-[1.15] tracking-tight"
          >
            Build the future
            <br />
            <span className="bg-[linear-gradient(90deg,#A78BFA,#38BDF8)] bg-clip-text text-transparent">
              with AI agents.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-slate-400 text-lg leading-relaxed mb-10"
          >
            Seven autonomous AI specialists collaborate in real-time to
            transform your product ideas into production-ready software.
          </motion.p>

          {/* Agent orbit visualization */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <AgentOrbit />
          </motion.div>
        </div>
      </div>

      {/* ─── RIGHT: Form Panel ─── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* Card glow */}
          <div className="absolute -inset-1 rounded-3xl opacity-30 blur-xl bg-[linear-gradient(135deg,rgba(124,58,237,0.3),rgba(56,189,248,0.2))]" />

          {/* Glassmorphism card */}
          <div className="relative rounded-3xl border border-white/10 p-8 sm:p-10 backdrop-blur-xl bg-[linear-gradient(135deg,rgba(15,15,40,0.85),rgba(20,20,50,0.9))]">
            {/* Mobile Back to Home */}
            <div className="lg:hidden mb-6">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-200 group text-sm font-medium"
              >
                <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                Back to Home
              </Link>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                Create your account
              </h1>
              <p className="text-slate-400 text-sm">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-purple-400 hover:text-purple-300 font-medium cursor-pointer transition-colors duration-200"
                >
                  Log in
                </Link>
              </p>
            </motion.div>

            {/* Server error */}
            <AnimatePresence>
              {serverError && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="mb-6 p-3 rounded-xl border text-sm bg-rose-500/10 border-rose-500/30 text-rose-400"
                >
                  {serverError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <NeonInput
                  label="Full Name"
                  placeholder="Jane Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  error={errors.name}
                  autoComplete="name"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <NeonInput
                  label="Email"
                  type="email"
                  placeholder="jane@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  error={errors.email}
                  autoComplete="email"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="relative"
              >
                <NeonInput
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  error={errors.password}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9.5 text-slate-500 hover:text-slate-300 cursor-pointer transition-colors duration-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 }}
              >
                <PasswordStrength password={form.password} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <NeonInput
                  label="Confirm Password"
                  type="password"
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                  error={errors.confirmPassword}
                  autoComplete="new-password"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65 }}
              >
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded bg-slate-800 border-slate-600 text-purple-500 focus:ring-purple-500/50 cursor-pointer"
                  />
                  <span className="text-sm text-slate-400">
                    I agree to the{" "}
                    <a
                      href="#"
                      className="text-purple-400 hover:text-purple-300 cursor-pointer transition-colors duration-200"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="#"
                      className="text-purple-400 hover:text-purple-300 cursor-pointer transition-colors duration-200"
                    >
                      Privacy Policy
                    </a>
                  </span>
                </label>
                {errors.terms && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-rose-400 mt-1"
                  >
                    {errors.terms}
                  </motion.p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <NeonButton type="submit" loading={loading}>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </NeonButton>
              </motion.div>
            </form>

            {/* Feature checklist */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85 }}
              className="mt-6 grid grid-cols-2 gap-2"
            >
              {[
                "Auto PRD Generation",
                "Sprint Planning AI",
                "Architecture Designer",
                "Real-Time Streaming",
              ].map((perk) => (
                <div
                  key={perk}
                  className="flex items-center gap-2 text-xs text-slate-500"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{perk}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
