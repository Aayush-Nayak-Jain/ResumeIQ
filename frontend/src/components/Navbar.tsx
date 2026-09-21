"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, LogIn, UserPlus, LogOut, Shield, LayoutDashboard, Edit3, Home, Sun, Moon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export const Navbar: React.FC = () => {
  const { user, openAuthModal, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Overview", icon: Home },
    { href: "/dashboard", label: "Master Profile", icon: LayoutDashboard },
    { href: "/builder", label: "Resume Builder", icon: Edit3 },
  ];

  return (
    <header className="border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 flex items-center justify-center text-emerald-600 dark:text-slate-100 shadow-sm group-hover:scale-105 transition-all">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                  ResumeIQ
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-slate-700 font-mono font-medium">
                  ATS Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Resume Intelligence & Career Platform
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
                      ? "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-white/10 font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Actions, Theme Toggle & Status */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
            className="p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 transition-all flex items-center justify-center shadow-sm"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {user ? (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs">
                <div className="w-6 h-6 rounded-full bg-slate-800 dark:bg-slate-700 flex items-center justify-center text-white font-bold text-[10px]">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="font-medium text-slate-900 dark:text-white leading-none">{user.full_name}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center space-x-1 mt-0.5">
                    {user.role === "admin" && <Shield className="w-2.5 h-2.5 text-amber-500 inline" />}
                    <span className="capitalize">{user.role}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all text-xs"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => openAuthModal("signin")}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 text-xs font-medium shadow-sm transition-all"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => openAuthModal("signup")}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-md transition-all"
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

