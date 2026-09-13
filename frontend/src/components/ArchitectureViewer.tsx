"use client";

import React, { useState } from "react";
import { Layers, FileText, Briefcase, Zap, Cpu, Lock, ArrowRight, Check } from "lucide-react";

export const ArchitectureViewer: React.FC = () => {
  const [selectedLayer, setSelectedLayer] = useState<string>("ai-platform");

  const layers = [
    {
      id: "client-layer",
      name: "Presentation Layer",
      subtitle: "Next.js 14 App Router + Tailwind CSS",
      icon: Layers,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
      border: "border-sky-500/30",
      details: [
        "Candidate & Admin interactive dashboards with real-time feedback",
        "Resume Builder & Multi-column PDF/DOCX Parser interface",
        "Role-Specific Multi-Version comparison & diff visualizations",
        "Salience & Attention Heatmap visualizer",
      ],
    },
    {
      id: "api-gateway",
      name: "API & Security Layer",
      subtitle: "FastAPI + RBAC + PII Sanitization",
      icon: Lock,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      border: "border-violet-500/30",
      details: [
        "Short-lived JWT Access Tokens + Rotating Refresh Tokens",
        "Zero-trust Authorization enforcing strict user isolation (no IDOR)",
        "Logging hygiene filter scrubbing email, tokens, and PII from stdout",
        "Rate limiting on authentication and AI evaluation endpoints",
      ],
    },
    {
      id: "ai-platform",
      name: "Shared AI & Intelligence Platform",
      subtitle: "Semantic ATS Matching & Dual-Mode AI Gateway",
      icon: Cpu,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/30",
      details: [
        "Pluggable Dual-Mode AI Gateway: Local Ollama (₹0 cost) / Azure OpenAI (Deployed)",
        "Circuit Breaker & Bounded Retry: Graceful degradation without fake mock output",
        "Sentence Transformers (all-MiniLM-L6-v2) for local dense semantic embeddings",
        "AI Integrity Validator: Rejects hallucinations and enforces fact-grounded recommendations",
      ],
    },
    {
      id: "data-layer",
      name: "Data & Storage Layer",
      subtitle: "PostgreSQL 16 + pgvector + Redis Cache",
      icon: Zap,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      details: [
        "Relational tables for Users, Master Profiles, Resumes, Versions, JDs, and Evaluations",
        "pgvector table with HNSW Cosine Distance index for sub-millisecond similarity search",
        "Audit Events log for event-driven decoupled subscriber architecture",
        "Cascading user data deletion supporting complete 'Delete My Data' compliance",
      ],
    },
  ];

  return (
    <div className="glass-panel rounded-2xl p-6 mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 border-b border-white/10">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Platform Architecture (Modular Monolith)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Built for MCA academic excellence and production resilience. Select a layer to inspect technical capabilities.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Layer Selector Column */}
        <div className="lg:col-span-5 space-y-3">
          {layers.map((layer) => {
            const Icon = layer.icon;
            const isSelected = selectedLayer === layer.id;
            return (
              <button
                key={layer.id}
                onClick={() => setSelectedLayer(layer.id)}
                className={`w-full text-left p-4 rounded-xl transition-all flex items-center justify-between ${
                  isSelected
                    ? `${layer.bg} ${layer.border} border shadow-lg`
                    : "bg-slate-900/40 border border-white/5 hover:border-white/10 hover:bg-slate-900/70"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-lg ${layer.bg} ${layer.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{layer.name}</h4>
                    <p className="text-xs text-slate-400">{layer.subtitle}</p>
                  </div>
                </div>
                <ArrowRight className={`w-4 h-4 transition-transform ${isSelected ? `${layer.color} translate-x-1` : "text-slate-600"}`} />
              </button>
            );
          })}
        </div>

        {/* Layer Detail View Column */}
        <div className="lg:col-span-7 p-6 rounded-xl bg-slate-900/70 border border-white/10 flex flex-col justify-between">
          {(() => {
            const active = layers.find((l) => l.id === selectedLayer) || layers[2];
            const Icon = active.icon;
            return (
              <div>
                <div className="flex items-center space-x-3 pb-4 border-b border-white/10">
                  <div className={`p-2 rounded-lg ${active.bg} ${active.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">{active.name}</h4>
                    <p className="text-xs text-indigo-300 font-mono">{active.subtitle}</p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Core Engineering Highlights
                  </h5>
                  <ul className="space-y-2.5">
                    {active.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-300 leading-relaxed">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })()}

          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Status: Phase 0 Baseline Initialized</span>
            <span className="text-indigo-400">Ready for Module Implementation</span>
          </div>
        </div>
      </div>
    </div>
  );
};
