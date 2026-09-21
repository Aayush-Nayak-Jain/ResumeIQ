"use client";

import React from "react";
import Link from "next/link";
import { 
  Github, 
  Linkedin, 
  Twitter, 
  ExternalLink, 
  Code2, 
  Heart, 
  MessageSquare, 
  Youtube, 
  Shield, 
  FileText, 
  CheckCircle,
  Sun,
  Moon
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export const Footer: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <footer className="border-t border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-950/80 backdrop-blur-md mt-20 text-slate-600 dark:text-slate-400 transition-colors duration-200">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 items-start">
          {/* Column 1: Brand & Developer Bio */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Code2 className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white tracking-tight text-base">
                ResumeIQ
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Engineered by Alex Rivera, Senior Full-Stack Engineer. Built with FastAPI, Next.js, and PostgreSQL pgvector to deliver zero-hallucination semantic resume matching.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* Column 2: Platform Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              Candidate Tools
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/builder" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  ATS Resume Builder
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Master Candidate Profile
                </Link>
              </li>
              <li>
                <Link href="/builder" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Evidence Quality Audit
                </Link>
              </li>
              <li>
                <Link href="/builder" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Single-Column PDF Export
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Architecture & Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              Resources & Architecture
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a 
                  href="https://github.com/alexrivera/resume-intelligence"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center space-x-1"
                >
                  <span>System Documentation</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <span className="text-slate-500 dark:text-slate-500">FastAPI + pgvector Backend</span>
              </li>
              <li>
                <span className="text-slate-500 dark:text-slate-500">Dual-Mode AI (Ollama / Azure)</span>
              </li>
              <li>
                <span className="text-slate-500 dark:text-slate-500">Zero-Trust Token Isolation</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Social Media & Connect (Requested by User) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              Connect & Social
            </h4>
            <div className="flex flex-col space-y-2.5 text-xs">
              <a
                href="https://github.com/alexrivera/resume-intelligence"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors group"
              >
                <Github className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-emerald-500 transition-colors" />
                <span className="font-medium">GitHub Repository</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <a
                href="https://linkedin.com/in/alexrivera"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors group"
              >
                <Linkedin className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-emerald-500 transition-colors" />
                <span className="font-medium">LinkedIn Profile</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <a
                href="https://x.com/alexrivera"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors group"
              >
                <Twitter className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-emerald-500 transition-colors" />
                <span className="font-medium">X / Twitter</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <a
                href="https://discord.gg/resumeiq"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors group"
              >
                <MessageSquare className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-emerald-500 transition-colors" />
                <span className="font-medium">Discord Community</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <a
                href="https://youtube.com/@resumeintelligence"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors group"
              >
                <Youtube className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-emerald-500 transition-colors" />
                <span className="font-medium">YouTube Channel</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Quick Theme Switcher */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} ResumeIQ Platform. Free-tier open architecture.</p>
          <div className="flex items-center space-x-4">
            <span>Engineered with clean design</span>
            <span>•</span>
            <button
              onClick={toggleTheme}
              className="inline-flex items-center space-x-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-700" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
