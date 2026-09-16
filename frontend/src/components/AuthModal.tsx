"use client";

import React, { useState } from "react";
import { X, Lock, Mail, User as UserIcon, Shield, Check, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    openAuthModal,
    login,
    register,
    authError,
    clearError,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"candidate" | "admin">("candidate");
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const isSignup = authModalMode === "signup";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    clearError();

    let success = false;
    if (isSignup) {
      success = await register({
        email,
        password,
        full_name: fullName,
        role,
      });
    } else {
      success = await login({
        email,
        password,
      });
    }

    setSubmitting(false);
    if (success) {
      setEmail("");
      setPassword("");
      setFullName("");
    }
  };

  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasLetter && hasNumber;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md p-6 overflow-hidden rounded-2xl glass-panel border border-white/10 shadow-2xl bg-slate-950/90 text-white">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/15 rounded-full filter blur-3xl pointer-events-none -z-10"></div>

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center pt-2 pb-4">
          <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-white">
            {isSignup ? "Create an Account" : "Sign In to ResumeIQ"}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {isSignup
              ? "Access AI-powered ATS resume matching and version intelligence."
              : "Welcome back! Enter your credentials to manage your resumes."}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex p-1 mb-5 rounded-xl bg-slate-900 border border-white/5">
          <button
            type="button"
            onClick={() => openAuthModal("signin")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              !isSignup
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => openAuthModal("signup")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              isSignup
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {authError && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isSignup && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Mercer"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Password validation indicators for signup */}
            {isSignup && password.length > 0 && (
              <div className="mt-2 grid grid-cols-3 gap-1 text-[10px] text-slate-400">
                <span className={`flex items-center space-x-1 ${hasMinLength ? "text-emerald-400" : "text-slate-500"}`}>
                  <Check className="w-3 h-3" />
                  <span>8+ chars</span>
                </span>
                <span className={`flex items-center space-x-1 ${hasLetter ? "text-emerald-400" : "text-slate-500"}`}>
                  <Check className="w-3 h-3" />
                  <span>Letters</span>
                </span>
                <span className={`flex items-center space-x-1 ${hasNumber ? "text-emerald-400" : "text-slate-500"}`}>
                  <Check className="w-3 h-3" />
                  <span>Numbers</span>
                </span>
              </div>
            )}
          </div>

          {isSignup && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Account Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("candidate")}
                  className={`p-2 rounded-xl border text-xs font-medium flex items-center justify-center space-x-1.5 transition-all ${
                    role === "candidate"
                      ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                      : "bg-slate-900/60 border-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Candidate</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`p-2 rounded-xl border text-xs font-medium flex items-center justify-center space-x-1.5 transition-all ${
                    role === "admin"
                      ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                      : "bg-slate-900/60 border-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Administrator</span>
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || (isSignup && !isPasswordValid)}
            className="w-full mt-4 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{isSignup ? "Complete Registration" : "Sign In"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-white/5 text-center text-[11px] text-slate-500">
          <span>Protected by bcrypt hashing & zero-trust token isolation</span>
        </div>
      </div>
    </div>
  );
};
