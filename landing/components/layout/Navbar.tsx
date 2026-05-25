"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap, LogOut, Loader2 } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { NAV_LINKS } from "@/lib/constants";
import { useRouter } from "next/navigation";

interface NavbarUser {
  id: string;
  name: string;
  email: string;
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState<NavbarUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  const dashboardUrl = typeof window !== "undefined" && window.location.port === "3001"
    ? `http://${window.location.hostname}:3000/dashboard`
    : "/dashboard";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error("Auth check failed in Navbar:", err);
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setUser(null);
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className={`fixed top-4 left-4 right-4 z-50 rounded-2xl transition-all duration-300 ${
          isScrolled
            ? "glass-nav shadow-lg"
            : "bg-white/60 backdrop-blur-md border border-transparent"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 relative">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-9 h-9 bg-linear-to-br from-primary-500 to-primary-400 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-200">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-bold text-xl text-text">
                AI <span className="text-primary-500">PM</span>
              </span>
            </Link>

            {/* Desktop links - Centered and Stylish */}
            <div className="hidden md:flex items-center gap-1 bg-surface-muted/50 p-1.5 rounded-full border border-surface-subtle absolute left-1/2 -translate-x-1/2">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-text-muted hover:text-primary-600 hover:bg-white rounded-full transition-all duration-300 cursor-pointer hover:shadow-sm"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              {authLoading ? (
                <div className="w-[180px] flex justify-end pr-4">
                  <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
                </div>
              ) : user ? (
                <>
                  <a href={dashboardUrl}>
                    <Button variant="ghost" size="sm">
                      Dashboard
                    </Button>
                  </a>
                  <Button variant="primary" size="sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" /> Log Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" size="sm">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-primary-50 transition-colors cursor-pointer"
              aria-label={isMobileOpen ? "Close menu" : "Open menu"}
            >
              {isMobileOpen ? (
                <X className="w-5 h-5 text-text" />
              ) : (
                <Menu className="w-5 h-5 text-text" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="absolute top-24 left-4 right-4 bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col gap-4">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileOpen(false)}
                    className="text-base font-medium text-text hover:text-primary-500 transition-colors py-2 cursor-pointer"
                  >
                    {link.label}
                  </a>
                ))}
                <hr className="border-gray-100" />
                <div className="flex flex-col gap-3 pt-2">
                  {authLoading ? (
                    <div className="flex justify-center py-2">
                      <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
                    </div>
                  ) : user ? (
                    <>
                      <a href={dashboardUrl} onClick={() => setIsMobileOpen(false)}>
                        <Button variant="secondary" className="w-full">
                          Dashboard
                        </Button>
                      </a>
                      <Button variant="primary" className="w-full" onClick={() => { setIsMobileOpen(false); handleLogout(); }}>
                        <LogOut className="w-4 h-4 mr-2 inline" /> Log Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setIsMobileOpen(false)}>
                        <Button variant="secondary" className="w-full">
                          Log In
                        </Button>
                      </Link>
                      <Link href="/register" onClick={() => setIsMobileOpen(false)}>
                        <Button variant="primary" className="w-full">
                          Get Started
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
