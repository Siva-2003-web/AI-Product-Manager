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
                ? "rgba(16, 185, 129, 0.55)"
                : p.id % 3 === 1
                  ? "rgba(34, 211, 238, 0.5)"
                  : "rgba(110, 231, 183, 0.35)",
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
            "radial-gradient(ellipse at 30% 50%, rgba(20, 184, 166, 0.18) 0%, transparent 60%)",
        }}
      />
      <motion.div
        animate={{ x: ["10%", "-10%", "10%"] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 -right-1/4 w-[150%] h-full opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at 70% 60%, rgba(34, 211, 238, 0.12) 0%, transparent 60%)",
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
        className="absolute top-[15%] left-[10%] w-16 h-16 border border-cyan-400/20 rotate-45"
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
        className="absolute top-[30%] right-[12%] w-14 h-14 border border-teal-300/20"
        style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
      />
      {/* Diamond */}
      <motion.div
        animate={{ y: [0, 35, 0], rotate: [45, 135, 45] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[20%] right-[15%] w-12 h-12 border border-emerald-400/20"
      />
      {/* Small dot cluster */}
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[75%] left-[25%] w-3 h-3 rounded-full bg-cyan-400/30"
      />
      <motion.div
        animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute top-[20%] right-[30%] w-2 h-2 rounded-full bg-emerald-400/30"
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
    <div className="relative w-full max-w-xl mx-auto aspect-square flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[8%] rounded-full border border-dashed border-cyan-300/20"
      />

      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[20%] rounded-full border border-cyan-500/10"
        style={{
          boxShadow:
            "0 0 34px rgba(34, 211, 238, 0.08), inset 0 0 24px rgba(34, 211, 238, 0.05)",
        }}
      />

      <motion.div
        animate={{ scale: [0.95, 1.08, 0.95] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-[34%] rounded-full border border-emerald-400/25"
      />

      <svg
        className="absolute inset-0 h-full w-full pointer-events-none"
        viewBox="0 0 400 400"
      >
        {[
          { x: 92, y: 116, label: "INPUT" },
          { x: 316, y: 110, label: "VERIFY" },
          { x: 88, y: 292, label: "SYNC" },
          { x: 314, y: 284, label: "LOCK" },
        ].map((node, i) => (
          <g key={node.label}>
            <motion.line
              x1={node.x}
              y1={node.y}
              x2="200"
              y2="200"
              stroke="rgba(34, 211, 238, 0.16)"
              strokeWidth="1.5"
              strokeDasharray="6, 6"
              animate={{ strokeDashoffset: [0, -24] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
            />
            <motion.line
              x1={node.x}
              y1={node.y}
              x2="200"
              y2="200"
              stroke="url(#pulseGrad)"
              strokeWidth="2.5"
              animate={{ opacity: [0, 1, 0] }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                delay: i * 0.55,
                ease: "easeInOut",
              }}
            />
            <circle
              cx={node.x}
              cy={node.y}
              r="6"
              fill="#22D3EE"
              opacity="0.22"
            />
            <motion.circle
              cx={node.x}
              cy={node.y}
              r="3.5"
              fill="#34D399"
              animate={{ scale: [1, 1.55, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.35 }}
            />
            <text
              x={node.x}
              y={node.y - 12}
              textAnchor="middle"
              fill="#A7F3D0"
              fontSize="9"
              fontWeight="600"
              letterSpacing="0.06em"
              opacity="0.75"
            >
              {node.label}
            </text>
          </g>
        ))}

        <defs>
          <linearGradient id="pulseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0" />
            <stop offset="50%" stopColor="#34D399" stopOpacity="1" />
            <stop offset="100%" stopColor="#A7F3D0" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      <div className="relative z-10 w-24 h-24 rounded-[1.75rem] flex items-center justify-center border border-cyan-300/40 bg-[linear-gradient(135deg,rgba(2,6,23,0.8),rgba(15,23,42,0.92))] shadow-[0_0_55px_rgba(34,211,238,0.18)]">
        <Cpu className="w-11 h-11 text-cyan-300" />
        <motion.div
          animate={{ scale: [1, 1.24, 1], opacity: [0.45, 0, 0.45] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-[1.75rem] border-2 border-cyan-300"
        />
      </div>

      <div className="absolute bottom-2 flex flex-col items-center">
        <motion.div
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="bg-cyan-950/45 border border-cyan-500/20 px-3 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-md"
        >
          <Activity className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
          <span className="text-[11px] font-mono text-cyan-200 font-semibold tracking-wider">
            ACCESS ROUTE: {syncPercentage}%
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
            background: "linear-gradient(135deg, #14B8A6, #22D3EE, #34D399)",
            backgroundSize: "200% 200%",
          }}
        >
          <motion.div
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-xl"
            style={{
              background:
                "linear-gradient(135deg, #14B8A6, #22D3EE, #A7F3D0, #14B8A6)",
              backgroundSize: "300% 300%",
            }}
          />
        </motion.div>
        <input
          id={inputId}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`relative w-full px-4 py-3.5 rounded-xl text-base text-white placeholder:text-slate-500 transition-all duration-300
            bg-[#03111e]/80 backdrop-blur-sm border
            focus:outline-none focus:ring-0
            ${
              error
                ? "border-rose-500/70"
                : focused
                  ? "border-transparent"
                  : "border-cyan-900/50 hover:border-cyan-500/60"
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
      className="relative w-full py-4 rounded-xl font-semibold text-white text-lg cursor-pointer transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-2 bg-[linear-gradient(135deg,#14B8A6,#2563EB,#22D3EE)]"
      disabled={loading}
      {...props}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[inset_0_0_30px_rgba(45,212,191,0.35),0_0_40px_rgba(34,211,238,0.28)]" />
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
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#03131f_0%,#020617_42%,#01020a_100%)]">
      {/* Background effects */}
      <ParticleField />
      <BackgroundWaves />
      <FloatingShapes />

      {/* Cinematic gradient orbs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] left-[-10%] w-150 h-150 rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.22),transparent_70%)]"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute bottom-[-20%] right-[-10%] w-175 h-175 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.18),transparent_70%)]"
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[linear-gradient(rgba(45,212,191,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(45,212,191,0.35)_1px,transparent_1px)] bg-size-[60px_60px]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-6 py-10 sm:px-10 lg:px-12">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Left visual panel */}
          <div className="hidden lg:flex flex-col justify-center pr-8 xl:pr-12">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-200 mb-12 group text-sm font-medium self-start"
            >
              <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl xl:text-6xl font-bold text-white mb-6 leading-[1.04] tracking-tight max-w-xl"
            >
              Access your
              <br />
              <span className="bg-[linear-gradient(90deg,#2DD4BF,#22D3EE,#A7F3D0)] bg-clip-text text-transparent">
                command center.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-slate-400 text-lg xl:text-xl leading-relaxed mb-10 max-w-lg"
            >
              Enter your credentials to connect with your autonomous AI
              development squad and monitor active builds.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="w-full"
            >
              <QuantumNetwork />
            </motion.div>
          </div>

          {/* Login form */}
          <div className="flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-sm"
            >
              {/* Card outer glow */}
              <div className="absolute -inset-1 rounded-4xl opacity-35 blur-xl bg-[linear-gradient(135deg,rgba(45,212,191,0.32),rgba(34,211,238,0.24),rgba(167,243,208,0.12))]" />

              {/* Glassmorphism card */}
              <div className="relative rounded-4xl border border-cyan-300/10 p-6 sm:p-8 backdrop-blur-xl bg-[linear-gradient(135deg,rgba(2,6,23,0.88),rgba(8,15,28,0.95))] shadow-[0_0_80px_rgba(34,211,238,0.12)]">
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
                  <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
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
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
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
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
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
                        className="w-4 h-4 rounded bg-slate-800 border-cyan-700 text-cyan-400 focus:ring-cyan-400/50 cursor-pointer"
                      />
                      <span className="text-sm text-slate-300">
                        Remember me
                      </span>
                    </label>
                    <a
                      href="#"
                      className="text-sm text-cyan-300 hover:text-cyan-200 cursor-pointer transition-colors duration-200"
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
                      className="text-cyan-300 hover:text-cyan-200 font-medium cursor-pointer transition-colors duration-200"
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
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Encrypted</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-slate-700" />
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>SOC 2</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
