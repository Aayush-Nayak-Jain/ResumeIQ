"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  FileText, 
  Target, 
  Award, 
  Layers, 
  ArrowRight, 
  CheckCircle, 
  ShieldCheck,
  Zap,
  Briefcase,
  Star,
  ChevronRight,
  Sparkles,
  Check,
  X,
  FileSearch,
  Sliders,
  Users,
  Lock,
  ExternalLink
} from "lucide-react";

export default function HomePage() {
  const [selectedTemplate, setSelectedTemplate] = useState(0);

  const templates = [
    {
      id: "modern",
      name: "Modern Technical",
      role: "Senior Software Engineer",
      tag: "Most Popular",
      summary: "Full-stack developer with 6+ years specializing in distributed systems, high-concurrency APIs, and Next.js.",
      company: "InnovateTech Labs",
      experience: "Architected microservices handling 15M daily requests with 99.99% uptime. Reduced API response times by 35%.",
      skills: ["FastAPI", "TypeScript", "PostgreSQL", "Docker", "pgvector"]
    },
    {
      id: "executive",
      name: "Executive Minimal",
      role: "Engineering Director",
      tag: "Leadership",
      summary: "Strategic technology executive leading cross-functional teams of 30+ engineers delivering enterprise SaaS solutions.",
      company: "Apex Cloud Enterprise",
      experience: "Spearheaded platform replatforming reducing operational cloud spend by $420K annually while growing ARR 45%.",
      skills: ["Executive Strategy", "Cloud Architecture", "System Design", "Budgeting"]
    },
    {
      id: "classic",
      name: "Double Column Clean",
      role: "Data & ML Engineer",
      tag: "ATS Compliant",
      summary: "Data engineer experienced in productionizing semantic search pipelines, vector embeddings, and ETL microservices.",
      company: "Cognitive Vector AI",
      experience: "Implemented hybrid semantic + BM25 search engine cutting candidate query latency from 850ms to 92ms.",
      skills: ["Python", "PyTorch", "pgvector", "Redis", "Kafka"]
    },
    {
      id: "timeline",
      name: "Timeline Focus",
      role: "Product & Solutions Architect",
      tag: "Career Changer",
      summary: "Product-minded architect bridging the gap between customer enterprise workflows and technical backend execution.",
      company: "NextGen Software",
      experience: "Delivered 12 enterprise customer integrations generating $2.1M in expansion revenue across FY25.",
      skills: ["REST APIs", "Solutions Design", "CI/CD", "PostgreSQL"]
    }
  ];

  const comparisonFeatures = [
    {
      feature: "Semantic Vector Alignment (pgvector)",
      description: "Scores experience against role descriptions using vector embeddings, not just exact keyword density",
      resumeIQ: true,
      enhancv: "Partial (Keyword)",
      traditional: false
    },
    {
      feature: "Evidence & Metric Quality Auditing",
      description: "Detects quantified business impact, metric presence, and strong action verbs in real time",
      resumeIQ: true,
      enhancv: "Basic Checks",
      traditional: false
    },
    {
      feature: "Multi-Version Targeting from 1 Master Profile",
      description: "Single ground-truth career history spawning multiple tailored resume versions with version tracking",
      resumeIQ: true,
      enhancv: "Manual Duplicate",
      traditional: false
    },
    {
      feature: "Zero Hallucination Fact-Grounding",
      description: "Strict isolation ensuring AI never invents fake work history, titles, or dates",
      resumeIQ: true,
      enhancv: false,
      traditional: false
    },
    {
      feature: "100% Single-Column ATS Clean Parse",
      description: "Formatted specifically to pass Greenhouse, Workday, and Lever parsers without errors",
      resumeIQ: true,
      enhancv: true,
      traditional: "Varies"
    },
    {
      feature: "Data Privacy & Token Isolation",
      description: "Candidate PII scrubbing, JWT zero-trust role control, and optional local LLM execution (Ollama)",
      resumeIQ: true,
      enhancv: "Cloud Third-Party",
      traditional: false
    },
    {
      feature: "Free & Open-Access Architecture",
      description: "No paywalls on downloading ATS-compliant PDFs or creating role versions",
      resumeIQ: true,
      enhancv: "Subscription Paywall",
      traditional: "Trial / Watermarked"
    }
  ];

  return (
    <div className="space-y-24 animate-fadeIn pb-12">
      {/* 1. HERO SECTION (Inspired by Enhancv) */}
      <section className="relative text-center pt-8 sm:pt-14 pb-12 px-4 max-w-5xl mx-auto">
        {/* Social Proof Pill */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-slate-900 border border-emerald-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium mb-8 shadow-sm">
          <div className="flex -space-x-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="font-semibold text-slate-900 dark:text-white">Rated 4.9/5</span>
          <span className="text-slate-400">•</span>
          <span>ATS-Friendly Resume Intelligence</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
          Land More Interviews with an{" "}
          <span className="text-emerald-600 dark:text-emerald-400 underline decoration-emerald-500/40 underline-offset-8">
            Evidence-Backed
          </span>{" "}
          Resume
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Create professional, recruiter-approved resumes powered by semantic job matching, bullet point metric auditing, and synchronized version intelligence. Free, private, and engineered for modern hiring pipelines.
        </p>

        {/* Dual Primary Call-to-Actions */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/builder"
            className="inline-flex items-center space-x-2.5 px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-sm shadow-xl shadow-slate-950/10 transition-all hover:scale-[1.02]"
          >
            <FileText className="w-4 h-4" />
            <span>Build Your Resume</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-semibold text-sm shadow-sm transition-all"
          >
            <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Open Master Profile</span>
          </Link>
        </div>

        {/* Quick Social Proof Counters */}
        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-white/5 flex flex-wrap items-center justify-center gap-8 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span><strong>99.4%</strong> ATS Parse Accuracy</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span><strong>Zero</strong> Hallucinated Facts</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span><strong>100%</strong> Free Open Architecture</span>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE TEMPLATE PREVIEW CAROUSEL (Enhancv Style) */}
      <section className="glass-panel rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-white/10 shadow-xl">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Pick a Layout & Tailor for Any Job
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Engineered to highlight achievements, metrics, and technical competencies without confusing automated ATS scanners.
          </p>
        </div>

        {/* Template Selector Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {templates.map((tpl, idx) => (
            <button
              key={tpl.id}
              onClick={() => setSelectedTemplate(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedTemplate === idx
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md"
                  : "bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              {tpl.name}
            </button>
          ))}
        </div>

        {/* Live Interactive Resume Mockup Card */}
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-2xl transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
            <div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-semibold">
                {templates[selectedTemplate].tag}
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1.5">
                Alex Mercer
              </h3>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {templates[selectedTemplate].role}
              </p>
            </div>
            <Link
              href="/builder"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all self-start sm:self-auto"
            >
              <span>Use This Template</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-left">
            {/* Left 2 Cols: Experience & Summary */}
            <div className="md:col-span-2 space-y-5">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 font-mono">
                  Executive Summary
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {templates[selectedTemplate].summary}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 font-mono">
                  Experience & Accomplishments
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {templates[selectedTemplate].role} — <span className="font-normal text-slate-600 dark:text-slate-400">{templates[selectedTemplate].company}</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">2022 - Present</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 pl-3 border-l-2 border-emerald-500 leading-relaxed">
                    {templates[selectedTemplate].experience}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Col: Competencies & Evidence Score */}
            <div className="space-y-5 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 md:pl-6 pt-4 md:pt-0">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 font-mono">
                  Evidence Score
                </h4>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">ATS Readiness</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">94%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full w-[94%]"></div>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    Quantified metrics verified across 3 bullet points.
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 font-mono">
                  Core Competencies
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {templates[selectedTemplate].skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE VALUE PILLARS (Features Inspired by Enhancv) */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Everything You Need to Stand Out
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            A purpose-built suite of candidate tools designed to eliminate blind spots and pass automated recruiter screenings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-white/10 space-y-3 glass-panel-hover">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Semantic ATS Alignment</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Traditional checkers only count keywords. Our pgvector semantic engine analyzes the contextual fit of your experience against the target job posting.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-white/10 space-y-3 glass-panel-hover">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Evidence Quality Auditing</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Real-time audit badges highlight accomplishment statements that lack quantifiable business outcomes, helping you convert passive tasks into powerful metric-backed bullets.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-white/10 space-y-3 glass-panel-hover">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Role-Specific Multi-Versioning</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Keep your entire career history organized in one master profile. Branch customized versions for specific applications with automated version numbering.
            </p>
          </div>
        </div>
      </section>

      {/* 4. COMPARISON SECTION (ResumeIQ vs. Enhancv vs. Traditional Builders) */}
      <section className="glass-panel rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-white/10 shadow-xl space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-50 dark:bg-slate-900 border border-emerald-200 dark:border-slate-800 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
            <span>Market Benchmark</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Why ResumeIQ Stands Out
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Compare our semantic intelligence and evidence verification platform against commercial builders.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs">
                <th className="py-4 px-4 font-bold text-slate-700 dark:text-slate-300 w-2/5">Capability / Feature</th>
                <th className="py-4 px-4 font-extrabold text-emerald-600 dark:text-emerald-400 w-1/5 text-center bg-emerald-50/50 dark:bg-emerald-950/20 rounded-t-xl">
                  ResumeIQ
                </th>
                <th className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-400 w-1/5 text-center">
                  Enhancv
                </th>
                <th className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-400 w-1/5 text-center">
                  Legacy Builders
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-xs">
              {comparisonFeatures.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{row.feature}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{row.description}</div>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/10">
                    {row.resumeIQ === true ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                        <Check className="w-4 h-4" />
                      </span>
                    ) : (
                      row.resumeIQ
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-600 dark:text-slate-400">
                    {row.enhancv === true ? (
                      <Check className="w-4 h-4 mx-auto text-emerald-500" />
                    ) : row.enhancv === false ? (
                      <X className="w-4 h-4 mx-auto text-slate-400" />
                    ) : (
                      <span className="font-medium text-[11px]">{row.enhancv}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-500 dark:text-slate-500">
                    {row.traditional === true ? (
                      <Check className="w-4 h-4 mx-auto text-emerald-500" />
                    ) : row.traditional === false ? (
                      <X className="w-4 h-4 mx-auto text-slate-400" />
                    ) : (
                      <span className="font-medium text-[11px]">{row.traditional}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. WORKFLOW SECTION ("How It Works") */}
      <section className="glass-panel rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-white/10 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            How The Platform Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            A structured engineering workflow from master career history to tailored job submission.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          <div className="space-y-3 border-t-2 border-emerald-500 pt-5">
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">01 / MASTER PROFILE</span>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Centralize Career Facts</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Consolidate all past experiences, projects, and certifications in a single ground-truth profile. No more hunting for old documents.
            </p>
          </div>

          <div className="space-y-3 border-t-2 border-emerald-500 pt-5">
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">02 / AUDIT & ALIGN</span>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Verify Metric Evidence</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Our automated evidence linter inspects your bullet points for metrics and action verbs while comparing semantic similarity to target job postings.
            </p>
          </div>

          <div className="space-y-3 border-t-2 border-emerald-500 pt-5">
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">03 / EXPORT & APPLY</span>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Clean Single-Column PDF</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Download clean, single-column ATS-compliant PDFs ready for automated HR applicant tracking systems without parse errors.
            </p>
          </div>
        </div>
      </section>

      {/* 6. BOTTOM BANNER CTA */}
      <section className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-900 dark:to-slate-950 text-white text-center space-y-6 shadow-2xl border border-slate-800">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Ready to Upgrade Your Career Trajectory?
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Join thousands of engineering candidates tailoring high-impact, evidence-backed resumes with ResumeIQ.
        </p>
        <div className="pt-2">
          <Link
            href="/builder"
            className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl transition-all hover:scale-105"
          >
            <span>Create Your Resume Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
