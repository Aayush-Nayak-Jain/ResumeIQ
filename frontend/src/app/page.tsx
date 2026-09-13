"use client";

import React from "react";
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2, FileCheck2, Cpu, Database } from "lucide-react";
import { SystemHealthDashboard } from "../components/SystemHealthDashboard";
import { ArchitectureViewer } from "../components/ArchitectureViewer";
import { PhaseRoadmap } from "../components/PhaseRoadmap";

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative text-center py-10 px-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-6 glow-badge">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Phase 0 Setup & Baseline Successfully Initialized</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
          AI Resume Intelligence &{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400 bg-clip-text text-transparent">
            Semantic ATS Alignment
          </span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Bridging the gap between what candidates write and what recruiters evaluate.
          Equipped with exact + semantic vector matching, fact-grounded recommendations, and role-specific version intelligence.
        </p>

        {/* Action Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>FastAPI + PostgreSQL + pgvector</span>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-300">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span>Dual-Mode AI (Ollama / Azure OpenAI)</span>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-violet-400" />
            <span>PII Redaction & Zero Hallucination</span>
          </div>
        </div>
      </section>

      {/* Live System Health & Telemetry Dashboard */}
      <SystemHealthDashboard />

      {/* Interactive Platform Architecture */}
      <ArchitectureViewer />

      {/* Development Phases Roadmap */}
      <PhaseRoadmap />
    </div>
  );
}
