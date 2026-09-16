"use client";

import React from "react";
import { CheckCircle2, Clock, CircleDot, Shield } from "lucide-react";

export const PhaseRoadmap: React.FC = () => {
  const phases = [
    {
      phase: 0,
      title: "Setup & Baseline",
      duration: "2 Weeks",
      status: "completed",
      deliverable: "Repo, Docker Compose, CI skeleton, pgvector DB schema draft, Security Architecture & Baseline Apps",
      security: "Secret scanning in CI, PII log filter, .gitignore for secrets",
    },
    {
      phase: 1,
      title: "Identity & Access",
      duration: "2 Weeks",
      status: "completed",
      deliverable: "Working signup/login, JWT access + refresh auth, Candidate & Admin RBAC, Brute-force protection",
      security: "Bcrypt 12-round hashing, sliding-window rate-limiting, IDOR token isolation (T1.1–T1.6 passed)",
    },
    {
      phase: 2,
      title: "Candidate Profile & Resume Builder",
      duration: "3 Weeks",
      status: "in_progress",
      deliverable: "Structured profile (single source of truth) + Resume Builder UI",
      security: "Field validation, user-scoped authorization, rich-text sanitization",
    },
    {
      phase: 3,
      title: "Resume Parsing",
      duration: "3 Weeks",
      status: "pending",
      deliverable: "PDF/DOCX document parser → structured JSON representation",
      security: "Magic byte MIME validation, size limits, ephemeral temp cleanup",
    },
    {
      phase: 4,
      title: "Job Description Analysis",
      duration: "2 Weeks",
      status: "pending",
      deliverable: "Paste JD → categorized & weighted requirement extraction",
      security: "Prompt injection defense, untrusted text delimiters, input size limits",
    },
    {
      phase: 5,
      title: "AI Evaluation Engine",
      duration: "5 Weeks",
      status: "pending",
      deliverable: "Semantic + exact match, skill gaps, evidence quality & attention heatmap",
      security: "pgvector access isolation, AI circuit breaker, dual-mode fallback",
    },
  ];

  return (
    <div className="glass-panel rounded-2xl p-6 mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 border-b border-white/10">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <CircleDot className="w-5 h-5 text-indigo-400" />
            <span>Development Roadmap & Phase Progress</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            28-week phased milestone delivery plan with embedded security gates at each step.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Phase 0 & 1 Completed
          </span>
          <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Phase 2 Next
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {phases.map((p) => {
          const isDone = p.status === "completed";
          const isCurrent = p.status === "in_progress";

          return (
            <div
              key={p.phase}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                isDone
                  ? "bg-emerald-950/20 border-emerald-500/30"
                  : isCurrent
                  ? "bg-indigo-950/30 border-indigo-500/40 shadow-md shadow-indigo-500/10"
                  : "bg-slate-900/40 border-white/5 opacity-75"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300">
                    Phase {p.phase} • {p.duration}
                  </span>
                  {isDone ? (
                    <span className="flex items-center space-x-1 text-emerald-400 text-xs font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Completed</span>
                    </span>
                  ) : isCurrent ? (
                    <span className="flex items-center space-x-1 text-indigo-400 text-xs font-medium animate-pulse">
                      <Clock className="w-3.5 h-3.5" />
                      <span>In Progress</span>
                    </span>
                  ) : (
                    <span className="text-slate-500 text-xs">Upcoming</span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-white mt-2.5">{p.title}</h4>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{p.deliverable}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-start space-x-1.5 text-[11px] text-slate-400">
                <Shield className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-violet-300">Security Gate:</strong> {p.security}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
