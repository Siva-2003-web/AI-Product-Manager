"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Cpu,
  Activity,
  Check,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { getMainAppUrl } from "@/lib/navigation";

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
        className="absolute top-[78%] left-[22%] w-3 h-3 rounded-full bg-rose-400/30"
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
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[5%] rounded-full border border-dashed border-rose-300/20"
      />

      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[20%] rounded-full border border-orange-300/10"
        style={{
          boxShadow:
            "0 0 25px rgba(251, 146, 60, 0.05), inset 0 0 25px rgba(251, 146, 60, 0.05)",
        }}
      />

      <motion.div
        animate={{ scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-[35%] rounded-full border border-rose-500/30"
      />

      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 400 400"
      >
        {[
          { x: 80, y: 120, label: "SECURE" },
          { x: 320, y: 100, label: "AUTH" },
          { x: 70, y: 280, label: "SYNC" },
          { x: 330, y: 260, label: "ENCRYPT" },
        ].map((node, i) => (
          <g key={i}>
            <motion.line
              x1={node.x}
              y1={node.y}
              x2="200"
              y2="200"
              stroke="rgba(251, 146, 60, 0.22)"
              strokeWidth="1.5"
              strokeDasharray="5, 5"
              animate={{ strokeDashoffset: [0, -20] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
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
            <circle
              cx={node.x}
              cy={node.y}
              r="6"
              fill="#FB7185"
              opacity="0.3"
            />
            <motion.circle
              cx={node.x}
              cy={node.y}
              r="3.5"
              fill="#F59E0B"
              animate={{ scale: [1, 1.6, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
            />
            <text
              x={node.x}
              y={node.y - 12}
              textAnchor="middle"
              fill="#FDBA74"
              fontSize="9"
              fontWeight="600"
              letterSpacing="0.05em"
              opacity="0.7"
            >
              {node.label}
            </text>
          </g>
        ))}

        <defs>
          <linearGradient id="pulseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F472B6" stopOpacity="0" />
            <stop offset="50%" stopColor="#FB7185" stopOpacity="1" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      <div className="relative z-10 w-20 h-20 rounded-2xl flex items-center justify-center border border-orange-400/40 bg-[linear-gradient(135deg,rgba(251,146,60,0.18),rgba(244,114,182,0.12))] shadow-[0_0_35px_rgba(251,146,60,0.22)]">
        <Cpu className="w-10 h-10 text-orange-300" />
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-2xl border-2 border-orange-300"
        />
      </div>

      <div className="absolute bottom-4 flex flex-col items-center">
        <motion.div
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="bg-rose-950/40 border border-orange-500/20 px-3 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-md"
        >
          <Activity className="w-3.5 h-3.5 text-orange-300 animate-pulse" />
          <span className="text-[11px] font-mono text-orange-200 font-semibold tracking-wider">
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
        <motion.div
          className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          animate={focused ? { opacity: 1 } : {}}
          style={{
            background: "linear-gradient(135deg, #FB7185, #F59E0B, #FDE047)",
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
                "linear-gradient(135deg, #FB7185, #F59E0B, #FDE047, #FB7185)",
              backgroundSize: "300% 300%",
            }}
          />
        </motion.div>
        <input
          id={inputId}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`relative w-full px-4 py-3.5 rounded-xl text-base text-white placeholder:text-slate-500 transition-all duration-300
            bg-[#120912]/80 backdrop-blur-sm border
            focus:outline-none focus:ring-0
            ${
              error
                ? "border-rose-500/70"
                : focused
                  ? "border-transparent"
                  : "border-orange-900/50 hover:border-orange-500/60"
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
      className="relative w-full py-4 rounded-xl font-semibold text-white text-lg cursor-pointer transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-2 bg-[linear-gradient(135deg,#FB7185,#F59E0B,#FDE047)]"
      disabled={loading}
      {...props}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[inset_0_0_30px_rgba(251,113,133,0.35),0_0_40px_rgba(245,158,11,0.28)]" />
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
        credentials: "include",
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
    <div className="min-h-screen flex relative overflow-hidden lg:flex-row-reverse bg-[radial-gradient(circle_at_top_right,#1f1027_0%,#090611_46%,#040308_100%)]">
      {/* Background effects */}
      <ParticleField />
      <BackgroundWaves />
      <FloatingShapes />

      {/* Cinematic gradient orbs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] left-[-10%] w-150 h-150 rounded-full bg-[radial-gradient(circle,rgba(244,114,182,0.22),transparent_70%)]"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute bottom-[-20%] right-[-10%] w-175 h-175 rounded-full bg-[radial-gradient(circle,rgba(251,146,60,0.18),transparent_70%)]"
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[linear-gradient(rgba(251,146,60,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(251,146,60,0.25)_1px,transparent_1px)] bg-size-[60px_60px]" />

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
            <span className="bg-[linear-gradient(90deg,#FDBA74,#FB7185,#FDE047)] bg-clip-text text-transparent">
              launch account.
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
      </div>

      {/* ─── RIGHT: Form Panel ─── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          {/* Card glow */}
          <div className="absolute -inset-1 rounded-3xl opacity-35 blur-xl bg-[linear-gradient(135deg,rgba(244,114,182,0.28),rgba(251,146,60,0.22),rgba(253,224,71,0.16))]" />

          {/* Glassmorphism card */}
          <div className="relative rounded-3xl border border-orange-200/10 p-6 sm:p-8 backdrop-blur-xl bg-[linear-gradient(135deg,rgba(19,10,25,0.88),rgba(32,16,18,0.94))] shadow-[0_0_80px_rgba(251,146,60,0.12)]">
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
                Create your account
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-orange-300 hover:text-orange-200 font-medium cursor-pointer transition-colors duration-200"
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
            <form onSubmit={handleSubmit} className="space-y-3">
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
                  className="absolute right-3 top-9.5 text-slate-500 hover:text-orange-200 cursor-pointer transition-colors duration-200"
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
                    className="mt-0.5 w-4 h-4 rounded bg-slate-800 border-orange-700 text-orange-400 focus:ring-orange-400/50 cursor-pointer"
                  />
                  <span className="text-sm text-slate-300">
                    I agree to the{" "}
                    <a
                      href="#"
                      className="text-orange-300 hover:text-orange-200 cursor-pointer transition-colors duration-200"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="#"
                      className="text-orange-300 hover:text-orange-200 cursor-pointer transition-colors duration-200"
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
              className="mt-5 grid grid-cols-2 gap-2"
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
