"use client";

import { signInWithGoogle, signUpWithEmail } from "@/lib/auth";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" className="flex-shrink-0">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const EyeIcon = ({ show }: { show: boolean }) =>
  show ? (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

// Password strength helper
function getPasswordStrength(pwd: string): { label: string; color: string; width: string } {
  if (pwd.length === 0) return { label: "", color: "bg-gray-200", width: "0%" };
  if (pwd.length < 6) return { label: "Too short", color: "bg-red-400", width: "25%" };
  if (pwd.length < 8) return { label: "Weak", color: "bg-orange-400", width: "50%" };
  const hasUpper = /[A-Z]/.test(pwd);
  const hasNum = /[0-9]/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
  const score = [hasUpper, hasNum, hasSpecial].filter(Boolean).length;
  if (score >= 2) return { label: "Strong", color: "bg-green-500", width: "100%" };
  return { label: "Good", color: "bg-[#0B5E8E]", width: "75%" };
}

export default function SignUpPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [loading, user, router]);

  const handleGoogleSignUp = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch {
      setError("Google sign-up failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setEmailLoading(true);
    try {
      await signUpWithEmail(email, password, name.trim());
    } catch (err: any) {
      const code = err?.code;
      if (code === "auth/email-already-in-use") {
        setError("An account with this email already exists. Try signing in.");
      } else if (code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (code === "auth/weak-password") {
        setError("Password must be at least 6 characters.");
      } else {
        setError("Sign-up failed. Please try again.");
      }
      setEmailLoading(false);
    }
  };

  const strength = getPasswordStrength(password);
  const isLoading = googleLoading || emailLoading;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0B5E8E] rounded-lg flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="4" width="16" height="16" rx="2" fill="white" />
              </svg>
            </div>
            <span className="text-xl font-bold text-[#0B5E8E]">ZENTRA</span>
          </Link>
          <div className="text-sm text-[#4F7D96]">
            Already have an account?{" "}
            <Link href="/signin" className="font-semibold text-[#0B5E8E] hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Badge */}
          <div className="text-center mb-5">
            <span className="inline-block px-4 py-1.5 bg-[#0B5E8E]/10 text-[#0B5E8E] text-sm font-bold rounded-full">
              🎉 Free forever — no credit card required
            </span>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
            {/* Title */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
              <p className="text-[#4F7D96] text-sm">Join thousands of learners building real wealth — for free.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { value: "10+", label: "Modules" },
                { value: "$100K", label: "Portfolio" },
                { value: "24/7", label: "AI tutor" },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="text-lg font-bold text-[#0B5E8E]">{stat.value}</div>
                  <div className="text-xs text-[#4F7D96]">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </div>
            )}

            {/* Google */}
            <button
              onClick={handleGoogleSignUp}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-5 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:border-[#0B5E8E] hover:text-[#0B5E8E] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <GoogleIcon />
              {googleLoading ? "Creating account..." : "Continue with Google"}
            </button>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-[#4F7D96]">or sign up with email</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailSignUp} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Johnson"
                  autoComplete="name"
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E]/30 focus:border-[#0B5E8E] disabled:opacity-50 transition-colors"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  autoComplete="email"
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E]/30 focus:border-[#0B5E8E] disabled:opacity-50 transition-colors"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    autoComplete="new-password"
                    disabled={isLoading}
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E]/30 focus:border-[#0B5E8E] disabled:opacity-50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <EyeIcon show={showPassword} />
                  </button>
                </div>
                {/* Strength bar */}
                {password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                          style={{ width: strength.width }}
                        />
                      </div>
                      <span className="ml-3 text-xs text-[#4F7D96] w-16 text-right">{strength.label}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={isLoading}
                    className={`w-full px-4 py-3 pr-11 rounded-xl border text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E]/30 disabled:opacity-50 transition-colors ${
                      confirmPassword && confirmPassword !== password
                        ? "border-red-300 focus:border-red-400"
                        : confirmPassword && confirmPassword === password
                        ? "border-green-400 focus:border-green-500"
                        : "border-gray-200 focus:border-[#0B5E8E]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <EyeIcon show={showConfirm} />
                  </button>
                  {/* Match indicator */}
                  {confirmPassword && (
                    <div className="absolute right-10 top-1/2 -translate-y-1/2">
                      {confirmPassword === password ? (
                        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#0B5E8E] text-white font-bold rounded-xl hover:bg-[#094a6d] transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {emailLoading ? "Creating account..." : "Create Free Account"}
              </button>
            </form>

            <p className="text-center text-xs text-[#4F7D96] mt-5">
              By creating an account, you agree to our{" "}
              <a href="#" className="underline hover:text-[#0B5E8E]">Terms of Service</a>{" "}
              and{" "}
              <a href="#" className="underline hover:text-[#0B5E8E]">Privacy Policy</a>
            </p>
          </div>

          {/* Social proof */}
          <div className="mt-5 text-center">
            <p className="text-sm text-[#4F7D96]">
              ⭐️ Trusted by thousands of learners building smarter financial habits
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-5">
        <div className="text-center text-sm text-[#4F7D96]">
          © 2026 Zentra. Making financial education accessible.
        </div>
      </footer>
    </div>
  );
}