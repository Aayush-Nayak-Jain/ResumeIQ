"use client";

import React, { useEffect, useState } from "react";
import { 
  Activity, 
  Database, 
  Cpu, 
  ShieldCheck, 
  RefreshCw, 
  Server, 
  Layers, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import { fetchHealth, fetchReadiness } from "../lib/api";
import { HealthStatus, ReadinessStatus } from "../types";

export const SystemHealthDashboard: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [readiness, setReadiness] = useState<ReadinessStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<string>("");

  const refreshTelemetry = async () => {
    setLoading(true);
    try {
      const [hData, rData] = await Promise.all([fetchHealth(), fetchReadiness()]);
      setHealth(hData);
      setReadiness(rData);
      setLastCheck(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshTelemetry();
  }, []);

  const isHealthy = health?.status === "healthy";
  const isAiOllama = health?.llm_provider === "ollama";

  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full filter blur-3xl pointer-events-none -z-10"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">System Runtime & AI Gateway Telemetry</h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Monitoring FastAPI backend, PostgreSQL + pgvector storage, and dual-mode AI routing.
          </p>
        </div>

        <button
          onClick={refreshTelemetry}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Probe</span>
          {lastCheck && <span className="text-slate-500 text-[10px]">({lastCheck})</span>}
        </button>
      </div>

      {/* Grid of Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {/* 1. Backend Core */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">FastAPI Core</p>
              <h3 className="text-lg font-semibold text-white mt-1">
                {isHealthy ? "Operational" : "Offline / Initializing"}
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${isHealthy ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
              <Server className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 text-xs text-slate-400 flex items-center justify-between font-mono">
            <span>Environment:</span>
            <span className="text-slate-200">{health?.environment || "local"}</span>
          </div>
        </div>

        {/* 2. AI Gateway */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">AI Gateway</p>
              <h3 className="text-lg font-semibold text-white mt-1">
                {isAiOllama ? "Ollama (Free/Local)" : "Azure OpenAI"}
              </h3>
            </div>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 text-xs text-slate-400 flex items-center justify-between font-mono">
            <span>Active Model:</span>
            <span className="text-indigo-300 font-semibold">{health?.llm_model || "llama3.2:3b"}</span>
          </div>
        </div>

        {/* 3. Database & pgvector */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Storage & Vector</p>
              <h3 className="text-lg font-semibold text-white mt-1">PostgreSQL + pgvector</h3>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 text-xs text-slate-400 flex items-center justify-between font-mono">
            <span>Embeddings:</span>
            <span className="text-emerald-300">MiniLM-L6 (384-dim)</span>
          </div>
        </div>

        {/* 4. Security & Isolation */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Security Posture</p>
              <h3 className="text-lg font-semibold text-white mt-1">PII Masking & RBAC</h3>
            </div>
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 text-xs text-slate-400 flex items-center justify-between font-mono">
            <span>Integrity Rule:</span>
            <span className="text-violet-300">Zero Hallucination</span>
          </div>
        </div>
      </div>

      {/* Free Tier Cost & Resiliency Notice Banner */}
      <div className="mt-6 p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-indigo-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Free-Tier & Budget Safety Active:</strong> Local execution routes 100% to Ollama with ₹0 compute cost. Deployed runs leverage Azure OpenAI with spend-cap alerting and circuit breaker protection.
          </span>
        </div>
        <div className="shrink-0 px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[11px] border border-indigo-500/30">
          Circuit Breaker: 3 fails / 60s
        </div>
      </div>
    </div>
  );
};
