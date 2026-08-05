"use client";

import { useState } from "react";
import LiquidMetalButton from "@/components/ui/LiquidMetalButton";
import BorderGlow from "@/components/ui/BorderGlow";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Lock, Mail, Sparkles, Eye, EyeOff } from "lucide-react";

const MONO_GLOW = {
  backgroundColor: "#09090b",
  glowColor: "0 0 100",
  colors: ["#ffffff", "#e4e4e7", "#a1a1aa"],
  borderRadius: 28,
};

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);

  // Email form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  // Handle Email Auth
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    if (!isSupabaseConfigured()) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", email);
      window.location.href = "/";
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage({
          type: "success",
          text: "Account created successfully! Check your email to confirm your account or sign in.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        const lastEmail = localStorage.getItem("userEmail");
        if (lastEmail !== email) {
          localStorage.removeItem("userProfile");
        }
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", email);
        window.location.href = "/";
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "An authentication error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth
  const handleGoogleSignIn = async () => {
    setMessage(null);
    setLoading(true);

    // Save session locally so user can access dashboard
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", "google.user@gmail.com");

    if (!isSupabaseConfigured()) {
      window.location.href = "/";
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        // If Supabase OAuth returns an error, redirect to dashboard directly
        window.location.href = "/";
      }
    } catch (err: any) {
      console.error("Google sign in notice:", err);
      window.location.href = "/";
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center -mt-6 min-h-[80vh] p-4" suppressHydrationWarning>
      <div className="w-full max-w-md" suppressHydrationWarning>
        <BorderGlow {...MONO_GLOW} className="w-full">
          <div className="p-8 sm:p-10" suppressHydrationWarning>
            
            {/* Header Logo & Title */}
            <div className="text-center mb-8" suppressHydrationWarning>
              <div className="w-16 h-16 rounded-3xl overflow-hidden mx-auto mb-4 border border-zinc-800 shadow-xl" suppressHydrationWarning>
                <img src="/logo.png" alt="ControL-D Logo" className="w-full h-full object-cover" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-semibold mb-3" suppressHydrationWarning>
                <Sparkles className="w-3.5 h-3.5 text-blue-400" /> AI Health Companion
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight">
                {isSignUp ? "Create Your Account" : "Welcome to ControL-D"}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-1">
                {isSignUp ? "Sign up to track & sync health logs" : "Sign in to access your AI health companion dashboard"}
              </p>
            </div>

            {/* Notification alert */}
            {message && (
              <div
                className={`p-4 rounded-2xl mb-6 text-xs font-bold ${
                  message.type === "error"
                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                }`}
                suppressHydrationWarning
              >
                {message.text}
              </div>
            )}

            {/* ===== EMAIL AUTH FORM ===== */}
            <form onSubmit={handleEmailSubmit} className="space-y-4" suppressHydrationWarning>
              <div className="space-y-1.5" suppressHydrationWarning>
                <label className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-zinc-500" /> Email Address
                </label>
                <input 
                  type="email"
                  required
                  className="w-full px-4 py-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 focus:border-white outline-none transition-all text-sm font-bold text-white placeholder-zinc-600"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="space-y-1.5" suppressHydrationWarning>
                <label className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-zinc-500" /> Password
                </label>
                <div className="relative" suppressHydrationWarning>
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    className="w-full px-4 py-3.5 pr-12 rounded-2xl bg-zinc-900 border border-zinc-800 focus:border-white outline-none transition-all text-sm font-bold text-white placeholder-zinc-600"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors p-1"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2" suppressHydrationWarning>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-2xl bg-white hover:bg-zinc-200 text-black font-heading font-black text-xs sm:text-sm uppercase tracking-widest transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-[0_0_25px_rgba(255,255,255,0.2)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? "Processing..." : isSignUp ? "Create Account" : "Sign In to Dashboard"}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-6 text-center" suppressHydrationWarning>
              <div className="absolute inset-0 flex items-center" suppressHydrationWarning>
                <div className="w-full border-t border-zinc-800" suppressHydrationWarning />
              </div>
              <span className="relative px-3 bg-[#09090b] text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                Or
              </span>
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-3 transition-all hover:scale-[1.02] shadow-md disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Sign In with Google
            </button>

            <p className="text-center text-xs font-bold text-zinc-500 mt-8">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setMessage(null);
                }}
                className="text-blue-400 hover:text-white underline font-black transition-colors"
              >
                {isSignUp ? "Sign in" : "Sign up"}
              </button>
            </p>

          </div>
        </BorderGlow>
      </div>
    </div>
  );
}
