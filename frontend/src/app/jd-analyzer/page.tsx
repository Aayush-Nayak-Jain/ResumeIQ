"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Award,
  BookOpen,
  Cpu,
  Search,
  Save,
  Trash2,
  ArrowRight,
  RefreshCw,
  FileText,
  Building,
  GraduationCap,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  analyzeJobDescription,
  createJobDescription,
  deleteJobDescription,
  listJobDescriptions,
} from "../../lib/api";
import {
  CategorizedRequirements,
  JobDescriptionAnalysisResponse,
  JobDescriptionSummaryResponse,
  WeightsConfig,
} from "../../types";

const SAMPLE_JD_PRESETS = [
  {
    name: "Senior Backend (Python/FastAPI)",
    title: "Senior Backend Engineer",
    company: "CloudScale Systems",
    text: `Senior Backend Engineer (Python / FastAPI)
Company: CloudScale Systems
Location: Remote

About the Role:
We are seeking an experienced Senior Backend Engineer to architect high-throughput microservices and generative AI backend integrations.

Key Responsibilities:
- Design, build, and maintain high-performance RESTful APIs and asynchronous background workers using Python and FastAPI.
- Architect scalable PostgreSQL databases with pgvector for lightning-fast semantic embeddings search.
- Implement CI/CD automation using GitHub Actions, Docker containerization, and Kubernetes deployments on AWS.
- Collaborate with AI researchers and frontend teams to productionize LLM evaluation pipelines.
- Mentor junior software developers on scalable system design, clean architecture, and testing.

Required Qualifications:
- 4+ years of hands-on professional backend software development experience with Python.
- Deep expertise with modern web frameworks (FastAPI, Django, or Flask).
- Solid experience in database modeling with PostgreSQL, Redis caching, and async querying.
- Hands-on experience with Docker, Linux environments, and AWS cloud infrastructure.
- Bachelor's degree in Computer Science, Software Engineering, or equivalent technical experience.
- Strong analytical and cross-team communication skills.

Preferred Qualifications (Bonus):
- Experience with PyTorch, LangChain, or LLM application engineering.
- Knowledge of pgvector or vector databases.
- Familiarity with TypeScript and Next.js modern frontend development.`,
  },
  {
    name: "Full Stack Engineer (React/Node)",
    title: "Full Stack Software Engineer",
    company: "FinVenture Tech",
    text: `Full Stack Software Engineer
Company: FinVenture Tech
Location: New York, NY / Hybrid

About Us:
FinVenture is redefining enterprise banking APIs and real-time ledger intelligence.

Responsibilities:
- Build responsive, highly interactive web applications using React, Next.js, and Tailwind CSS.
- Develop robust backend microservices in Node.js and TypeScript connected to PostgreSQL.
- Optimize web application performance and sub-second page rendering for high-volume transactions.
- Write end-to-end and unit tests using Jest, Cypress, and Playwright.

Requirements:
- 3+ years of professional full-stack development experience.
- Strong proficiency in JavaScript/TypeScript, React, Next.js, and CSS frameworks.
- Experience designing RESTful and GraphQL APIs in Node.js.
- Strong knowledge of SQL databases (PostgreSQL or MySQL).
- Bachelor's degree in Computer Science or related field.

Nice to Have:
- Experience with Docker, CI/CD pipelines, and cloud platforms (GCP or Azure).
- Understanding of financial data security and OAuth2 authentication flows.`,
  },
];

export default function JDAnalyzerPage() {
  const { user, token, openAuthModal } = useAuth();

  // Form State
  const [rawText, setRawText] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [showWeightsConfig, setShowWeightsConfig] = useState(false);

  // Scoring Weights State (sums to 100%)
  const [weights, setWeights] = useState<WeightsConfig>({
    skills: 0.4,
    experience: 0.2,
    projects: 0.15,
    education: 0.1,
    semantic_similarity: 0.1,
    certifications: 0.05,
  });

  // UI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] =
    useState<JobDescriptionAnalysisResponse | null>(null);

  // Saved JDs Drawer
  const [savedJds, setSavedJds] = useState<JobDescriptionSummaryResponse[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);

  // Load Saved JDs for authenticated candidate
  useEffect(() => {
    if (token) {
      loadSavedJds();
    }
  }, [token]);

  const loadSavedJds = async () => {
    if (!token) return;
    setIsLoadingSaved(true);
    const res = await listJobDescriptions(token);
    if (res.success && res.data) {
      setSavedJds(res.data);
    }
    setIsLoadingSaved(false);
  };

  const handleWeightChange = (key: keyof WeightsConfig, value: number) => {
    setWeights((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetWeights = () => {
    setWeights({
      skills: 0.4,
      experience: 0.2,
      projects: 0.15,
      education: 0.1,
      semantic_similarity: 0.1,
      certifications: 0.05,
    });
  };

  const totalWeightsPercent = Math.round(
    (weights.skills +
      weights.experience +
      weights.projects +
      weights.education +
      weights.semantic_similarity +
      weights.certifications) *
      100
  );

  const handlePresetSelect = (preset: (typeof SAMPLE_JD_PRESETS)[0]) => {
    setRawText(preset.text);
    setTitle(preset.title);
    setCompany(preset.company);
    setErrorMessage(null);
  };

  const handleAnalyze = async () => {
    if (!rawText.trim() || rawText.trim().length < 20) {
      setErrorMessage(
        "Please paste a valid Job Description with at least 20 characters."
      );
      return;
    }
    if (totalWeightsPercent !== 100) {
      setErrorMessage(
        `Scoring weights must sum to exactly 100% (currently ${totalWeightsPercent}%).`
      );
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsAnalyzing(true);

    try {
      const res = await analyzeJobDescription(
        rawText,
        title.trim() || undefined,
        company.trim() || undefined,
        weights,
        token || undefined
      );

      if (res.success && res.data) {
        setAnalysisResult(res.data);
        if (res.data.structured_requirements.job_title && !title) {
          setTitle(res.data.structured_requirements.job_title);
        }
        if (res.data.structured_requirements.company && !company) {
          setCompany(res.data.structured_requirements.company);
        }
      } else {
        setErrorMessage(res.error || "Failed to analyze Job Description.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveJD = async () => {
    if (!token) {
      openAuthModal("signin");
      return;
    }

    if (!rawText.trim()) return;

    setIsSaving(true);
    setErrorMessage(null);

    const res = await createJobDescription(
      rawText,
      title.trim() || undefined,
      company.trim() || undefined,
      weights,
      token
    );

    if (res.success) {
      setSuccessMessage("Target Job Description saved successfully!");
      loadSavedJds();
    } else {
      setErrorMessage(res.error || "Failed to save Job Description.");
    }
    setIsSaving(false);
  };

  const handleDeleteSaved = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;
    const res = await deleteJobDescription(id, token);
    if (res.success) {
      setSavedJds((prev) => prev.filter((j) => j.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold tracking-wider uppercase mb-1">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Module 5 &bull; AI Job Intelligence</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Job Description Analyzer
            </h1>
            <p className="mt-1 text-slate-400 text-base max-w-2xl">
              Paste any target job description to extract categorized requirements,
              required vs preferred skills, seniority expectations, and ATS scoring weights.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition"
            >
              <Briefcase className="w-4 h-4 text-indigo-400" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Preset Selector Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Load Sample JD:
          </span>
          {SAMPLE_JD_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handlePresetSelect(preset)}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300 hover:border-indigo-500 hover:text-indigo-300 transition-all flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>{preset.name}</span>
            </button>
          ))}
        </div>

        {/* Error / Success Notifications */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-sm">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-sm">{successMessage}</div>
          </div>
        )}

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Input Form & Weight Config */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span>Job Description Content</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Job Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Backend Engineer"
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Company Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. CloudScale Systems"
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Pasted Job Description Text <span className="text-red-400">*</span>
                  </label>
                  <span className="text-xs text-slate-500">
                    {rawText.length} chars (min 20)
                  </span>
                </div>
                <textarea
                  rows={12}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste the complete job description text here including requirements, qualifications, and responsibilities..."
                  className="w-full p-4 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed transition"
                />
              </div>

              {/* Scoring Weights Accordion */}
              <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/40">
                <button
                  type="button"
                  onClick={() => setShowWeightsConfig(!showWeightsConfig)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left text-sm font-semibold text-slate-300 hover:bg-slate-800/50 transition"
                >
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    <span>Scoring Weights Configuration</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                        totalWeightsPercent === 100
                          ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                          : "bg-red-950/80 text-red-300 border border-red-800"
                      }`}
                    >
                      {totalWeightsPercent}%
                    </span>
                  </div>
                  {showWeightsConfig ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {showWeightsConfig && (
                  <div className="p-4 border-t border-slate-800/80 space-y-4 bg-slate-950/60">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>Customize category weights for AI ATS match scoring:</span>
                      <button
                        type="button"
                        onClick={resetWeights}
                        className="text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Reset Defaults</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                          <span>Skills Match</span>
                          <span className="font-mono text-indigo-400 font-bold">
                            {Math.round(weights.skills * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="0.8"
                          step="0.05"
                          value={weights.skills}
                          onChange={(e) =>
                            handleWeightChange("skills", parseFloat(e.target.value))
                          }
                          className="w-full accent-indigo-500"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                          <span>Experience Match</span>
                          <span className="font-mono text-indigo-400 font-bold">
                            {Math.round(weights.experience * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="0.5"
                          step="0.05"
                          value={weights.experience}
                          onChange={(e) =>
                            handleWeightChange("experience", parseFloat(e.target.value))
                          }
                          className="w-full accent-indigo-500"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                          <span>Projects Relevance</span>
                          <span className="font-mono text-indigo-400 font-bold">
                            {Math.round(weights.projects * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="0.4"
                          step="0.05"
                          value={weights.projects}
                          onChange={(e) =>
                            handleWeightChange("projects", parseFloat(e.target.value))
                          }
                          className="w-full accent-indigo-500"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                          <span>Education Level</span>
                          <span className="font-mono text-indigo-400 font-bold">
                            {Math.round(weights.education * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="0.3"
                          step="0.05"
                          value={weights.education}
                          onChange={(e) =>
                            handleWeightChange("education", parseFloat(e.target.value))
                          }
                          className="w-full accent-indigo-500"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                          <span>Semantic Similarity</span>
                          <span className="font-mono text-indigo-400 font-bold">
                            {Math.round(weights.semantic_similarity * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="0.3"
                          step="0.05"
                          value={weights.semantic_similarity}
                          onChange={(e) =>
                            handleWeightChange(
                              "semantic_similarity",
                              parseFloat(e.target.value)
                            )
                          }
                          className="w-full accent-indigo-500"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                          <span>Certifications</span>
                          <span className="font-mono text-indigo-400 font-bold">
                            {Math.round(weights.certifications * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="0.2"
                          step="0.05"
                          value={weights.certifications}
                          onChange={(e) =>
                            handleWeightChange(
                              "certifications",
                              parseFloat(e.target.value)
                            )
                          }
                          className="w-full accent-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !rawText.trim()}
                  className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Extracting Structured Intelligence...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Run AI JD Analysis</span>
                    </>
                  )}
                </button>

                {analysisResult && (
                  <button
                    type="button"
                    onClick={handleSaveJD}
                    disabled={isSaving}
                    className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition"
                  >
                    {isSaving ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 text-emerald-400" />
                    )}
                    <span>Save JD</span>
                  </button>
                )}
              </div>
            </div>

            {/* Saved Target JDs Mini List */}
            {user && (
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-indigo-400" />
                    <span>Your Saved Target Job Postings ({savedJds.length})</span>
                  </span>
                  {isLoadingSaved && (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-500" />
                  )}
                </h3>

                {savedJds.length === 0 ? (
                  <p className="text-xs text-slate-500 py-2">
                    No saved job descriptions yet. Analyze and save roles to compare against your resumes in Module 6.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {savedJds.map((saved) => (
                      <div
                        key={saved.id}
                        className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/60 flex items-center justify-between hover:border-slate-700 transition"
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-200">
                            {saved.title}
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                            {saved.company && <span>{saved.company} &bull;</span>}
                            <span className="text-indigo-400">
                              {saved.required_skills_count} Required Skills
                            </span>
                            <span>&bull; {saved.seniority_level}</span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => handleDeleteSaved(saved.id, e)}
                          title="Delete Job Description"
                          className="p-1.5 text-slate-500 hover:text-red-400 rounded transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Structured Analysis Output */}
          <div className="lg:col-span-6 space-y-6">
            {!analysisResult ? (
              <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[500px]">
                <div className="w-16 h-16 rounded-2xl bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-center mb-4 text-indigo-400 shadow-inner">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  No Analysis Generated Yet
                </h3>
                <p className="text-sm text-slate-400 max-w-sm mb-6">
                  Paste a job description on the left and click &quot;Run AI JD Analysis&quot; to inspect required skills, seniority, responsibilities, and ATS parameters.
                </p>
                <div className="grid grid-cols-2 gap-3 text-left max-w-xs text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Skill Categorization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Experience Detection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Education Requirements</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>ATS Keyword Cloud</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Header Summary Card */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/50 border border-indigo-900/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 mb-2">
                        {analysisResult.structured_requirements.seniority_level} Level
                      </span>
                      <h2 className="text-2xl font-black text-white">
                        {analysisResult.structured_requirements.job_title}
                      </h2>
                      {analysisResult.structured_requirements.company && (
                        <p className="text-sm font-medium text-slate-400 mt-0.5 flex items-center gap-1.5">
                          <Building className="w-4 h-4 text-slate-400" />
                          <span>{analysisResult.structured_requirements.company}</span>
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono text-slate-400 block">
                        Engine: {analysisResult.metadata.llm_provider}
                      </span>
                      <span className="text-xs font-mono text-emerald-400 font-semibold block">
                        {analysisResult.metadata.extraction_duration_ms} ms
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                    {analysisResult.structured_requirements.summary}
                  </p>

                  {/* Requirements Quick Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Experience Range</span>
                      <span className="font-bold text-slate-200">
                        {analysisResult.structured_requirements.experience_requirements.min_years !== null
                          ? `${analysisResult.structured_requirements.experience_requirements.min_years}+ Years`
                          : "Not Specified"}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Education Degree</span>
                      <span className="font-bold text-slate-200">
                        {analysisResult.structured_requirements.education_requirements.degree_level}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800 col-span-2 sm:col-span-1">
                      <span className="text-slate-400 block text-[11px]">Key Skills Count</span>
                      <span className="font-bold text-indigo-300">
                        {analysisResult.structured_requirements.required_skills.length} Required &bull;{" "}
                        {analysisResult.structured_requirements.preferred_skills.length} Bonus
                      </span>
                    </div>
                  </div>
                </div>

                {/* Skills Taxonomy Section */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-indigo-400" />
                    <span>Categorized Skill Requirements</span>
                  </h3>

                  {/* Required Skills */}
                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span>Required Technical Skills (Must Have)</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.structured_requirements.required_skills.length === 0 ? (
                        <span className="text-xs text-slate-500">None explicitly detected.</span>
                      ) : (
                        analysisResult.structured_requirements.required_skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 shadow-sm"
                          >
                            {skill}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Preferred Skills */}
                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-violet-400"></span>
                      <span>Preferred &amp; Bonus Skills (Nice to Have)</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.structured_requirements.preferred_skills.length === 0 ? (
                        <span className="text-xs text-slate-500">None detected.</span>
                      ) : (
                        analysisResult.structured_requirements.preferred_skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-lg text-xs font-semibold bg-violet-950/60 text-violet-300 border border-violet-800/80 shadow-sm"
                          >
                            {skill}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Tools & DevOps */}
                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                      <span>Tools, Cloud &amp; Platforms</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.structured_requirements.tools_and_technologies.length === 0 ? (
                        <span className="text-xs text-slate-500">No tools detected.</span>
                      ) : (
                        analysisResult.structured_requirements.tools_and_technologies.map(
                          (tool, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700"
                            >
                              {tool}
                            </span>
                          )
                        )
                      )}
                    </div>
                  </div>

                  {/* Soft Skills */}
                  {analysisResult.structured_requirements.behavioral_expectations.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        <span>Behavioral &amp; Soft Competencies</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.structured_requirements.behavioral_expectations.map(
                          (soft, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-950/40 text-amber-200 border border-amber-800/60"
                            >
                              {soft}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Key Responsibilities */}
                {analysisResult.structured_requirements.responsibilities.length > 0 && (
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-3">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Layers className="w-5 h-5 text-indigo-400" />
                      <span>Key Responsibilities ({analysisResult.structured_requirements.responsibilities.length})</span>
                    </h3>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {analysisResult.structured_requirements.responsibilities.map(
                        (resp, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                            <span className="leading-relaxed">{resp}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                {/* ATS Keyword Cloud */}
                {analysisResult.structured_requirements.keywords.length > 0 && (
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-3">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Award className="w-5 h-5 text-indigo-400" />
                      <span>ATS High-Salience Keyword Cloud</span>
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {analysisResult.structured_requirements.keywords.map((kw, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-md bg-slate-950 text-slate-300 border border-slate-800 text-xs font-mono"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
