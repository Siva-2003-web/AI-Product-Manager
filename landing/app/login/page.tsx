"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Shield,
  Sparkles,
  Loader2,
  Cpu,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { getMainAppUrl } from "@/lib/navigation";

/* ─── Floating Particle System ─── */
function ParticleField() {
  const particles = Array.from({ length: 40 }, (_, i) => ({
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

/* ─── Animated Background Waves ─── */
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
      {/* Hexagon */}
      <motion.div
        animate={{ y: [0, -30, 0], rotate: [0, 180, 360] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[15%] left-[10%] w-16 h-16 border border-purple-500/20 rotate-45"
        style={{
          clipPath:
            "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
        }}
      />
      {/* Circle ring */}
      <motion.div
        animate={{ y: [0, 20, 0], rotate: [0, -360] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[60%] left-[8%] w-20 h-20 border-2 border-cyan-500/15 rounded-full"
      />
      {/* Triangle */}
      <motion.div
        animate={{ y: [0, -25, 0], x: [0, 15, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[30%] right-[12%] w-14 h-14 border border-purple-400/20"
        style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
      />
      {/* Diamond */}
      <motion.div
        animate={{ y: [0, 35, 0], rotate: [45, 135, 45] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[20%] right-[15%] w-12 h-12 border border-sky-400/20"
      />
      {/* Small dot cluster */}
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[75%] left-[25%] w-3 h-3 rounded-full bg-purple-500/30"
      />
      <motion.div
        animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute top-[20%] right-[30%] w-2 h-2 rounded-full bg-cyan-400/30"
      />
    </div>
  );
}

/* ─── Quantum Connection Network (Left Panel) ─── */
function QuantumNetwork() {
  const [syncPercentage, setSyncPercentage] = useState(94.2);

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncPercentage((prev) => {
        const next = prev + (Math.random() * 0.4 - 0.2);
        return Math.min(100, Math.max(90, parseFloat(next.toFixed(1))));
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-sm mx-auto aspect-square flex items-center justify-center">
      {/* Outer Rotating Dotted Circle */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[5%] rounded-full border border-dashed border-emerald-500/20"
      />

      {/* Middle Glowing Tech Ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[20%] rounded-full border border-cyan-500/10"
        style={{
          boxShadow:
            "0 0 25px rgba(56, 189, 248, 0.05), inset 0 0 25px rgba(56, 189, 248, 0.05)",
        }}
      />

      {/* Inner Pulses */}
      <motion.div
        animate={{ scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-[35%] rounded-full border border-emerald-500/30"
      />

      {/* Futuristic Grid Nodes */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 400 400"
      >
        {/* Neural Pathways (lines to center 200, 200) */}
        {[
          { x: 80, y: 120, label: "SECURE" },
          { x: 320, y: 100, label: "AUTH" },
          { x: 70, y: 280, label: "SYNC" },
          { x: 330, y: 260, label: "ENCRYPT" },
        ].map((node, i) => (
          <g key={i}>
            {/* Pathway Line */}
            <motion.line
              x1={node.x}
              y1={node.y}
              x2="200"
              y2="200"
              stroke="rgba(52, 211, 153, 0.2)"
              strokeWidth="1.5"
              strokeDasharray="5, 5"
              animate={{ strokeDashoffset: [0, -20] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            {/* Inner Glowing Line */}
            <motion.line
              x1={node.x}
              y1={node.y}
              x2="200"
              y2="200"
              stroke="url(#pulseGrad)"
              strokeWidth="2.5"
              animate={{
                x1: [node.x, 200],
                y1: [node.y, 200],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.6,
                ease: "easeInOut",
              }}
            />
            {/* Outer Node Circle */}
            <circle
              cx={node.x}
              cy={node.y}
              r="6"
              fill="#10B981"
              opacity="0.3"
            />
            {/* Pulsing Node Core */}
            <motion.circle
              cx={node.x}
              cy={node.y}
              r="3.5"
              fill="#10B981"
              animate={{ scale: [1, 1.6, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
            />
            {/* Node Text */}
            <text
              x={node.x}
              y={node.y - 12}
              textAnchor="middle"
              fill="#94A3B8"
              fontSize="9"
              fontWeight="600"
              letterSpacing="0.05em"
              opacity="0.7"
            >
              {node.label}
            </text>
          </g>
        ))}

        {/* Dynamic Gradients */}
        <defs>
          <linearGradient id="pulseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0" />
            <stop offset="50%" stopColor="#34D399" stopOpacity="1" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Central Holographic Core */}
      <div className="relative z-10 w-20 h-20 rounded-2xl flex items-center justify-center border border-emerald-500/40 bg-[linear-gradient(135deg,rgba(52,211,153,0.15),rgba(56,189,248,0.1))] shadow-[0_0_35px_rgba(52,211,153,0.25)]">
        <Cpu className="w-10 h-10 text-emerald-400" />
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-2xl border-2 border-emerald-400"
        />
      </div>

      {/* Tech Readout Overlay */}
      <div className="absolute bottom-4 flex flex-col items-center">
        <motion.div
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="bg-emerald-950/40 border border-emerald-500/20 px-3 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-md"
        >
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="text-[11px] font-mono text-emerald-300 font-semibold tracking-wider">
            SECURE LINK SYNCED: {syncPercentage}%
          </span>
        </motion.div>
      </div>
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
        {/* Animated border glow */}
        <motion.div
          className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          animate={focused ? { opacity: 1 } : {}}
          style={{
            background: "linear-gradient(135deg, #7C3AED, #38BDF8, #7C3AED)",
            backgroundSize: "200% 200%",
          }}
        >
          <motion.div
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
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
      {/* Glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[inset_0_0_30px_rgba(124,58,237,0.4),0_0_40px_rgba(124,58,237,0.3)]" />
      {/* Shimmer sweep */}
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

/* ─── Main Login Page ─── */
export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [serverError, setServerError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const validate = useCallback(() => {
    const errs: Record<string, string> = {};
    if (!form.email.trim()) errs.email = "Email is required";
    if (!form.password) errs.password = "Password is required";
    return errs;
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        const message =
          typeof data?.error === "string"
            ? data.error
            : data?.error?.message || "Login failed.";
        setServerError(message);
        return;
      }
      const dashboardUrl = getMainAppUrl();
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
            Access your
            <br />
            <span className="bg-[linear-gradient(90deg,#34D399,#38BDF8)] bg-clip-text text-transparent">
              command center.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-slate-400 text-lg leading-relaxed mb-10"
          >
            Enter your credentials to connect with your autonomous AI
            development squad and monitor active builds.
          </motion.p>

          {/* Quantum connection network */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <QuantumNetwork />
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          {/* Card outer glow */}
          <div className="absolute -inset-1 rounded-3xl opacity-30 blur-xl bg-[linear-gradient(135deg,rgba(52,211,153,0.3),rgba(56,189,248,0.2))]" />

          {/* Glassmorphism card */}
          <div className="relative rounded-3xl border border-white/10 p-6 sm:p-8 backdrop-blur-xl bg-[linear-gradient(135deg,rgba(15,15,40,0.85),rgba(20,20,50,0.9))]">
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
              className="mb-6"
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
                Welcome back
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm">
                Log in to your AI command center
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
            <form onSubmit={handleSubmit} className="space-y-3">
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
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  error={errors.password}
                  autoComplete="current-password"
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-between"
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-purple-500 focus:ring-purple-500/50 cursor-pointer"
                  />
                  <span className="text-sm text-slate-400">Remember me</span>
                </label>
                <a
                  href="#"
                  className="text-sm text-purple-400 hover:text-purple-300 cursor-pointer transition-colors duration-200"
                >
                  Forgot password?
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <NeonButton type="submit" loading={loading}>
                  Log In
                  <ArrowRight className="w-5 h-5" />
                </NeonButton>
              </motion.div>
            </form>

            {/* Divider */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 text-center"
            >
              <p className="text-slate-500 text-sm">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-purple-400 hover:text-purple-300 font-medium cursor-pointer transition-colors duration-200"
                >
                  Create one free
                </Link>
              </p>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-6 flex items-center justify-center gap-6"
            >
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Shield className="w-3.5 h-3.5" />
                <span>Encrypted</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-700" />
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Sparkles className="w-3.5 h-3.5" />
                <span>SOC 2</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
