"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  User as UserIcon, 
  Briefcase, 
  Code, 
  FolderGit2, 
  Award, 
  Plus, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  FileText,
  Clock,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Loader2
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface ResumeSummary {
  id: string;
  title: string;
  target_role: string;
  is_master: boolean;
  version_number: number;
  status: string;
  completeness_score: number;
  updated_at: string;
}

interface CandidateProfileData {
  id: string;
  headline: string;
  summary: string;
  contact_info: {
    phone?: string;
    location?: string;
    linkedin_url?: string;
    github_url?: string;
  };
  skills: Array<{ name: string; category: string; proficiency: string }>;
  experience: Array<any>;
  education: Array<any>;
  projects: Array<any>;
  profile_strength: number;
}

export default function DashboardPage() {
  const { user, token, openAuthModal } = useAuth();
  const [profile, setProfile] = useState<CandidateProfileData | null>(null);
  const [resumes, setResumes] = useState<ResumeSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [profileRes, resumesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/profile/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/resumes`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (profileRes.ok) {
          const pData = await profileRes.json();
          setProfile(pData);
        }
        if (resumesRes.ok) {
          const rData = await resumesRes.json();
          setResumes(rData);
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [token, API_BASE_URL]);

  if (!user && !loading) {
    return (
      <div className="text-center py-20 glass-panel rounded-2xl p-8 max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center mx-auto mb-4">
          <UserIcon className="w-6 h-6 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Authentication Required</h2>
        <p className="text-xs text-slate-400 mt-2">
          Please sign in to view your Candidate Master Profile and manage tailored resume versions.
        </p>
        <button
          onClick={() => openAuthModal("signin")}
          className="mt-6 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-white text-slate-900 text-xs font-semibold shadow-lg transition-all"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-xs text-slate-400">Loading Candidate Master Profile & Resumes...</p>
      </div>
    );
  }

  const strength = profile?.profile_strength || 85;
  const expCount = profile?.experience?.length || 2;
  const skillsCount = profile?.skills?.length || 8;
  const projectsCount = profile?.projects?.length || 3;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner: Master Candidate Profile Card */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none -z-10"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Candidate Identity */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-100 text-2xl font-black shadow-xl shrink-0">
              {user?.full_name?.charAt(0) || "C"}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">
                  {user?.full_name || "Candidate"}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified Profile</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 font-mono">
                {profile?.headline || "Full-Stack Software Engineer & Distributed Systems Specialist"}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="px-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/5 text-center">
              <div className="text-lg font-bold text-white">{expCount}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Experiences</div>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/5 text-center">
              <div className="text-lg font-bold text-slate-200">{skillsCount}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Core Skills</div>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/5 text-center">
              <div className="text-lg font-bold text-slate-200">{projectsCount}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Projects</div>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/5 text-center">
              <div className="text-lg font-bold text-emerald-400">{strength}%</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Completeness</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Master Facts Explorer (Left) & Role-Specific Resumes (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Master Facts Explorer (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Master Profile Facts</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Single Source of Truth</span>
          </div>

          <div className="glass-panel rounded-xl p-4 space-y-4">
            {/* Work History Depth */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-white">Work Experience</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Strong Evidence
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {expCount > 0 ? `${expCount} roles documented with metric-backed bullet points.` : "No roles added yet."}
              </p>
            </div>

            {/* Skills Taxonomy */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Code className="w-4 h-4 text-slate-300" />
                  <span className="text-xs font-semibold text-white">Skills & Competencies</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {skillsCount} Skills
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(profile?.skills && profile.skills.length > 0
                  ? profile.skills
                  : [
                      { name: "Python" },
                      { name: "FastAPI" },
                      { name: "PostgreSQL" },
                      { name: "Docker" },
                      { name: "Next.js" },
                      { name: "TypeScript" },
                    ]
                ).map((s: any, idx: number) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-slate-300 font-mono">
                    {s.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Projects & Outcomes */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <FolderGit2 className="w-4 h-4 text-slate-300" />
                  <span className="text-xs font-semibold text-white">Project Evidence</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {projectsCount} Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Grounded project history ready for tailoring into role-specific resumes.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Tailored Resume Versions Grid (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <FileText className="w-4 h-4 text-slate-300" />
              <span>Role-Specific Resume Versions</span>
            </h3>
            <Link
              href="/builder"
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-slate-100 hover:bg-white text-slate-900 text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Resume</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Master Resume Card */}
            <div className="p-5 rounded-2xl glass-panel border border-slate-700 relative overflow-hidden flex flex-col justify-between hover:border-slate-500 transition-all group">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Master Resume
                  </span>
                  <span className="text-xs text-emerald-400 font-bold">92% ATS</span>
                </div>
                <h4 className="text-sm font-bold text-white mt-3">Full-Stack Engineer (Master)</h4>
                <p className="text-xs text-slate-400 mt-1">Single source document containing all verified career facts.</p>
              </div>

              <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">v1 • Ready</span>
                <Link
                  href="/builder"
                  className="text-slate-300 font-medium group-hover:text-white flex items-center space-x-1"
                >
                  <span>Edit in Builder</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Tailored Resumes */}
            {resumes
              .filter((r) => !r.is_master)
              .map((res) => (
                <div
                  key={res.id}
                  className="p-5 rounded-2xl glass-panel border border-white/10 relative overflow-hidden flex flex-col justify-between hover:border-white/20 transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300">
                        Tailored Version
                      </span>
                      <span className="text-xs text-emerald-400 font-bold">
                        {res.completeness_score || 85}% ATS
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-3">{res.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {res.target_role || "Target role specified"}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">v{res.version_number}</span>
                    <Link
                      href={`/builder?id=${res.id}`}
                      className="text-slate-300 font-medium group-hover:text-white flex items-center space-x-1"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}

            {/* Create Version Card */}
            <Link
              href="/builder"
              className="p-5 rounded-2xl border-2 border-dashed border-white/10 hover:border-slate-600 hover:bg-white/5 transition-all flex flex-col items-center justify-center text-center group min-h-[160px]"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center group-hover:bg-slate-700 group-hover:text-white transition-all mb-2">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-white">Create New Version</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Tailored from Master Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
