"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Cpu, LogIn, UserPlus, LogOut, Shield, LayoutDashboard, Edit3, Home } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Navbar: React.FC = () => {
  const { user, openAuthModal, logout } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Overview", icon: Home },
    { href: "/dashboard", label: "Master Profile", icon: LayoutDashboard },
    { href: "/builder", label: "Resume Builder", icon: Edit3 },
  ];

  return (
    <header className="border-b border-white/10 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-all">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">
                  ResumeIQ
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                  v3.0 • Phase 2
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                AI Resume Intelligence & Multi-Version ATS Platform
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Actions & Status */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dual-Mode AI:</span>
            <span className="text-emerald-400 font-semibold font-mono">Ollama / Azure OpenAI</span>
          </div>

          {user ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs">
                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-[10px]">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="font-medium text-white leading-none">{user.full_name}</div>
                  <div className="text-[10px] text-indigo-300 flex items-center space-x-1 mt-0.5">
                    {user.role === "admin" && <Shield className="w-2.5 h-2.5 text-violet-400 inline" />}
                    <span className="capitalize">{user.role}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all text-xs"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => openAuthModal("signin")}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-white/10 text-xs font-medium transition-all"
              >
                <LogIn className="w-3.5 h-3.5 text-indigo-400" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => openAuthModal("signup")}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
