"use client";

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Save, 
  Eye, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  Code, 
  FolderGit2, 
  User, 
  Download,
  Check
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function BuilderPage() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("experience");
  const [template, setTemplate] = useState<"classic" | "modern" | "executive">("classic");
  const [autoSaved, setAutoSaved] = useState(true);

  // Resume Document State
  const [resumeTitle, setResumeTitle] = useState("Senior Full-Stack Engineer Resume - Master Profile");
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "Alex Rivera",
    email: "alex.rivera@example.com",
    phone: "+1 (555) 234-5678",
    location: "Seattle, WA",
    linkedin: "linkedin.com/in/alexrivera",
    github: "github.com/alexrivera",
  });

  const [summary, setSummary] = useState(
    "Results-driven Senior Full-Stack Engineer with 5+ years of experience designing scalable microservices, low-latency REST APIs, and responsive React applications. Proven track record reducing API response times by 35% and mentoring engineering teams."
  );

  const [experiences, setExperiences] = useState([
    {
      id: "1",
      company: "InnovateTech Inc.",
      title: "Senior Full-Stack Engineer",
      location: "Seattle, WA",
      dates: "2022 - Present",
      bullets: [
        "Architected distributed microservices handling 15M daily requests with 99.99% uptime.",
        "Engineered asynchronous processing pipeline with FastAPI and Redis, cutting latency by 40%.",
        "Mentored a team of 4 junior developers and established CI/CD automated testing standards.",
      ],
    },
    {
      id: "2",
      company: "CloudVantage Labs",
      title: "Software Engineer",
      location: "San Francisco, CA",
      dates: "2020 - 2022",
      bullets: [
        "Built responsive Next.js frontend with Tailwind CSS, increasing candidate conversion by 25%.",
        "Designed PostgreSQL schema with pgvector similarity indexing for semantic candidate matching.",
      ],
    },
  ]);

  const [education, setEducation] = useState([
    {
      id: "1",
      institution: "University of Washington",
      degree: "B.S. in Computer Science",
      dates: "2016 - 2020",
      grade: "3.82 CGPA",
    },
  ]);

  const [skills, setSkills] = useState([
    { name: "Python", category: "technical", proficiency: "expert" },
    { name: "FastAPI", category: "technical", proficiency: "expert" },
    { name: "TypeScript", category: "technical", proficiency: "expert" },
    { name: "Next.js", category: "technical", proficiency: "expert" },
    { name: "PostgreSQL", category: "technical", proficiency: "intermediate" },
    { name: "pgvector", category: "domain", proficiency: "intermediate" },
    { name: "Docker", category: "tool", proficiency: "intermediate" },
  ]);

  const [projects, setProjects] = useState([
    {
      id: "1",
      title: "ResumeIQ Intelligence Platform",
      description: "Dual-mode semantic ATS resume evaluation engine with fact-grounded recommendations.",
      technologies: "FastAPI, Next.js, PostgreSQL, pgvector",
    },
  ]);

  // Handle live input change with auto-save simulation
  const handleDataChange = () => {
    setAutoSaved(false);
    setTimeout(() => setAutoSaved(true), 800);
  };

  // Helper to detect evidence quality badge on bullet points
  const getEvidenceBadge = (bullet: string) => {
    const hasMetric = /\b\d+([%kKmMxX+])?\b/.test(bullet);
    const hasActionVerb = /^(Architected|Engineered|Built|Designed|Developed|Implemented|Spearheaded|Reduced|Increased|Mentored|Scaled)\b/i.test(bullet.trim());

    if (hasMetric) {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
          <Check className="w-2.5 h-2.5" />
          <span>Metric-backed</span>
        </span>
      );
    }
    if (hasActionVerb) {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-mono">
          <span>Action-oriented</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono">
        <span>Needs metric</span>
      </span>
    );
  };

  const completeness = 88;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Workspace Header */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/10 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <input
              type="text"
              value={resumeTitle}
              onChange={(e) => {
                setResumeTitle(e.target.value);
                handleDataChange();
              }}
              className="text-base sm:text-lg font-bold text-white bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1 transition-all"
            />
            <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
              <span>ATS Resume Builder</span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center space-x-1 font-mono">
                {autoSaved ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Auto-saved</span>
                  </>
                ) : (
                  <span className="text-slate-400">Saving changes...</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Right Header Controls: Gauge, Template selector & Print */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Completeness Gauge */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/5">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <svg className="w-8 h-8 transform -rotate-90">
                <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="2.5" className="text-slate-800" fill="transparent" />
                <circle
                  cx="16"
                  cy="16"
                  r="13"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-indigo-400"
                  fill="transparent"
                  strokeDasharray="81.68"
                  strokeDashoffset={81.68 - (81.68 * completeness) / 100}
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-white">{completeness}%</span>
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-[11px] font-semibold text-white">Completeness</div>
              <div className="text-[9px] text-emerald-400 font-mono">ATS Ready</div>
            </div>
          </div>

          {/* Template Picker */}
          <select
            value={template}
            onChange={(e: any) => setTemplate(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="classic">Classic Professional</option>
            <option value="modern">Modern Technical</option>
            <option value="executive">Executive Minimal</option>
          </select>

          {/* Print/Download Button */}
          <button
            onClick={() => window.print()}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export ATS PDF</span>
          </button>
        </div>
      </div>

      {/* Split-Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Structured Form Editor (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Editor Tabs Navigation */}
          <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-slate-900/90 border border-white/10 text-xs">
            {[
              { id: "contact", label: "Contact", icon: User },
              { id: "summary", label: "Summary", icon: Sparkles },
              { id: "experience", label: "Experience", icon: Briefcase },
              { id: "education", label: "Education", icon: GraduationCap },
              { id: "skills", label: "Skills", icon: Code },
              { id: "projects", label: "Projects", icon: FolderGit2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Content Panel */}
          <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-5">
            {/* Contact Tab */}
            {activeTab === "contact" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <User className="w-4 h-4 text-indigo-400" />
                  <span>Personal & Contact Information</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={personalInfo.fullName}
                      onChange={(e) => {
                        setPersonalInfo({ ...personalInfo, fullName: e.target.value });
                        handleDataChange();
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Email</label>
                    <input
                      type="email"
                      value={personalInfo.email}
                      onChange={(e) => {
                        setPersonalInfo({ ...personalInfo, email: e.target.value });
                        handleDataChange();
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Phone</label>
                    <input
                      type="text"
                      value={personalInfo.phone}
                      onChange={(e) => {
                        setPersonalInfo({ ...personalInfo, phone: e.target.value });
                        handleDataChange();
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Location</label>
                    <input
                      type="text"
                      value={personalInfo.location}
                      onChange={(e) => {
                        setPersonalInfo({ ...personalInfo, location: e.target.value });
                        handleDataChange();
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Summary Tab */}
            {activeTab === "summary" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>Professional Summary</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">{summary.length} characters</span>
                </div>
                <textarea
                  rows={5}
                  value={summary}
                  onChange={(e) => {
                    setSummary(e.target.value);
                    handleDataChange();
                  }}
                  className="w-full p-3 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
                <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-200 flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>ATS Tip:</strong> Highlight your total years of experience, core technical stack, and a quantified achievement in the first two sentences.
                  </span>
                </div>
              </div>
            )}

            {/* Experience Tab */}
            {activeTab === "experience" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Briefcase className="w-4 h-4 text-indigo-400" />
                    <span>Work Experience & Impact</span>
                  </h3>
                </div>

                {experiences.map((exp, expIdx) => (
                  <div key={exp.id} className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const newExp = [...experiences];
                            newExp[expIdx].company = e.target.value;
                            setExperiences(newExp);
                            handleDataChange();
                          }}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-950 border border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Job Title</label>
                        <input
                          type="text"
                          value={exp.title}
                          onChange={(e) => {
                            const newExp = [...experiences];
                            newExp[expIdx].title = e.target.value;
                            setExperiences(newExp);
                            handleDataChange();
                          }}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-950 border border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Dates</label>
                        <input
                          type="text"
                          value={exp.dates}
                          onChange={(e) => {
                            const newExp = [...experiences];
                            newExp[expIdx].dates = e.target.value;
                            setExperiences(newExp);
                            handleDataChange();
                          }}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-950 border border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Location</label>
                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e) => {
                            const newExp = [...experiences];
                            newExp[expIdx].location = e.target.value;
                            setExperiences(newExp);
                            handleDataChange();
                          }}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-950 border border-white/10 text-white"
                        />
                      </div>
                    </div>

                    {/* Bullet Points with Evidence Quality Evaluation */}
                    <div className="space-y-2 mt-2">
                      <label className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                        Accomplishment Bullet Points
                      </label>
                      {exp.bullets.map((b, bIdx) => (
                        <div key={bIdx} className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={b}
                              onChange={(e) => {
                                const newExp = [...experiences];
                                newExp[expIdx].bullets[bIdx] = e.target.value;
                                setExperiences(newExp);
                                handleDataChange();
                              }}
                              className="flex-1 px-2.5 py-1.5 text-xs rounded-lg bg-slate-950 border border-white/10 text-white"
                            />
                            {getEvidenceBadge(b)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Skills Tab */}
            {activeTab === "skills" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Code className="w-4 h-4 text-indigo-400" />
                  <span>Skills & Competencies</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs"
                    >
                      <span className="font-semibold text-white">{s.name}</span>
                      <span className="text-[10px] text-indigo-400 font-mono px-1.5 py-0.5 rounded bg-indigo-500/10">
                        {s.proficiency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education Tab */}
            {activeTab === "education" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4 text-indigo-400" />
                  <span>Education</span>
                </h3>
                {education.map((edu, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-2">
                    <div className="text-xs font-bold text-white">{edu.degree}</div>
                    <div className="text-xs text-slate-400">{edu.institution} • {edu.dates}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Projects Tab */}
            {activeTab === "projects" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <FolderGit2 className="w-4 h-4 text-indigo-400" />
                  <span>Key Projects</span>
                </h3>
                {projects.map((proj, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-1.5">
                    <div className="text-xs font-bold text-white">{proj.title}</div>
                    <div className="text-xs text-slate-400 leading-relaxed">{proj.description}</div>
                    <div className="text-[10px] text-indigo-300 font-mono">{proj.technologies}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Real-Time Live ATS Document Preview (6 cols) */}
        <div className="lg:col-span-6 sticky top-24">
          <div className="flex items-center justify-between pb-2 text-xs text-slate-400 font-mono">
            <span className="flex items-center space-x-1.5 text-white font-semibold">
              <Eye className="w-4 h-4 text-indigo-400" />
              <span>Live ATS Document Preview</span>
            </span>
            <span className="text-emerald-400">Standard ATS Format</span>
          </div>

          {/* Rendered Resume Document Card */}
          <div
            id="ats-preview-doc"
            className="w-full bg-white text-slate-900 p-8 sm:p-10 rounded-xl shadow-2xl font-serif min-h-[750px] leading-normal transition-all"
          >
            {/* Document Header */}
            <div className="text-center border-b border-slate-300 pb-4 mb-4">
              <h1 className="text-2xl font-bold tracking-tight text-black font-sans uppercase">
                {personalInfo.fullName || "Candidate Name"}
              </h1>
              <div className="text-xs text-slate-700 mt-1 flex flex-wrap items-center justify-center gap-2 font-sans">
                {personalInfo.location && <span>{personalInfo.location}</span>}
                {personalInfo.phone && <span>• {personalInfo.phone}</span>}
                {personalInfo.email && <span>• {personalInfo.email}</span>}
                {personalInfo.linkedin && <span>• {personalInfo.linkedin}</span>}
              </div>
            </div>

            {/* Professional Summary */}
            {summary && (
              <div className="mb-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-slate-300 pb-0.5 mb-1 font-sans">
                  Professional Summary
                </h2>
                <p className="text-xs text-slate-800 leading-relaxed">{summary}</p>
              </div>
            )}

            {/* Experience Section */}
            {experiences.length > 0 && (
              <div className="mb-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-slate-300 pb-0.5 mb-2 font-sans">
                  Work Experience
                </h2>
                <div className="space-y-3">
                  {experiences.map((exp) => (
                    <div key={exp.id}>
                      <div className="flex justify-between items-baseline text-xs font-sans">
                        <span className="font-bold text-black">{exp.title} — <span className="font-normal">{exp.company}</span></span>
                        <span className="text-slate-600 font-mono text-[11px]">{exp.dates}</span>
                      </div>
                      <ul className="list-disc list-outside pl-4 mt-1 space-y-1 text-xs text-slate-800 leading-snug">
                        {exp.bullets.map((b, idx) => (
                          <li key={idx}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills Section */}
            {skills.length > 0 && (
              <div className="mb-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-slate-300 pb-0.5 mb-1.5 font-sans">
                  Technical & Core Competencies
                </h2>
                <div className="text-xs text-slate-800 font-sans">
                  <strong>Languages & Tools: </strong>
                  {skills.map((s) => s.name).join(", ")}
                </div>
              </div>
            )}

            {/* Education Section */}
            {education.length > 0 && (
              <div className="mb-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-slate-300 pb-0.5 mb-1.5 font-sans">
                  Education
                </h2>
                {education.map((edu) => (
                  <div key={edu.id} className="flex justify-between items-baseline text-xs font-sans">
                    <div>
                      <span className="font-bold text-black">{edu.degree}</span>
                      <span className="text-slate-700">, {edu.institution}</span>
                    </div>
                    <span className="text-slate-600 font-mono text-[11px]">{edu.dates}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Projects Section */}
            {projects.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-slate-300 pb-0.5 mb-1.5 font-sans">
                  Projects
                </h2>
                {projects.map((proj) => (
                  <div key={proj.id} className="text-xs font-sans mb-1.5">
                    <span className="font-bold text-black">{proj.title}: </span>
                    <span className="text-slate-800">{proj.description}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
