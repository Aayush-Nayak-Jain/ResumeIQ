"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Eye, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  Code, 
  FolderGit2, 
  User, 
  Download,
  Check,
  X,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function BuilderPage() {
  const { user } = useAuth();
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

  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillProficiency, setNewSkillProficiency] = useState("intermediate");

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
    setTimeout(() => setAutoSaved(true), 600);
  };

  // Helper to detect evidence quality badge on bullet points
  const getEvidenceBadge = (bullet: string) => {
    const hasMetric = /\b\d+([%kKmMxX+])?\b/.test(bullet);
    const hasActionVerb = /^(Architected|Engineered|Built|Designed|Developed|Implemented|Spearheaded|Reduced|Increased|Mentored|Scaled)\b/i.test(bullet.trim());

    if (hasMetric) {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono shrink-0">
          <Check className="w-2.5 h-2.5" />
          <span>Metric-backed</span>
        </span>
      );
    }
    if (hasActionVerb) {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono shrink-0">
          <span>Action-oriented</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono shrink-0">
        <span>Needs metric</span>
      </span>
    );
  };

  // Section Deletion & Addition Handlers
  const removeExperience = (id: string) => {
    setExperiences(experiences.filter((exp) => exp.id !== id));
    handleDataChange();
  };

  const addExperience = () => {
    const newExp = {
      id: Date.now().toString(),
      company: "New Company",
      title: "Role Title",
      location: "Location",
      dates: "Year - Present",
      bullets: ["Accomplished [X] as measured by [Y] by doing [Z]."],
    };
    setExperiences([...experiences, newExp]);
    handleDataChange();
  };

  const removeBullet = (expIdx: number, bulletIdx: number) => {
    const updated = [...experiences];
    updated[expIdx].bullets = updated[expIdx].bullets.filter((_, idx) => idx !== bulletIdx);
    setExperiences(updated);
    handleDataChange();
  };

  const addBullet = (expIdx: number) => {
    const updated = [...experiences];
    updated[expIdx].bullets.push("Engineered and scaled system resulting in quantifiable performance improvement.");
    setExperiences(updated);
    handleDataChange();
  };

  const removeEducation = (id: string) => {
    setEducation(education.filter((edu) => edu.id !== id));
    handleDataChange();
  };

  const addEducation = () => {
    const newEdu = {
      id: Date.now().toString(),
      institution: "University / Institution",
      degree: "Degree / Program",
      dates: "Year - Year",
      grade: "Grade / Honors",
    };
    setEducation([...education, newEdu]);
    handleDataChange();
  };

  const removeSkill = (indexToRemove: number) => {
    setSkills(skills.filter((_, idx) => idx !== indexToRemove));
    handleDataChange();
  };

  const addSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    setSkills([
      ...skills,
      {
        name: newSkillName.trim(),
        category: "technical",
        proficiency: newSkillProficiency,
      },
    ]);
    setNewSkillName("");
    handleDataChange();
  };

  const removeProject = (id: string) => {
    setProjects(projects.filter((proj) => proj.id !== id));
    handleDataChange();
  };

  const addProject = () => {
    const newProj = {
      id: Date.now().toString(),
      title: "New Project",
      description: "Brief description of the application architecture, impact, and features.",
      technologies: "Tech stack used",
    };
    setProjects([...projects, newProj]);
    handleDataChange();
  };

  const completeness = 88;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Workspace Header */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/10 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <input
              type="text"
              value={resumeTitle}
              onChange={(e) => {
                setResumeTitle(e.target.value);
                handleDataChange();
              }}
              className="text-base sm:text-lg font-bold text-white bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-slate-500 rounded px-1 transition-all"
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

        {/* Right Header Controls */}
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
                  className="text-emerald-400"
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
            className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-slate-500"
          >
            <option value="classic">Classic Professional</option>
            <option value="modern">Modern Technical</option>
            <option value="executive">Executive Minimal</option>
          </select>

          {/* Print/Download Button */}
          <button
            onClick={() => window.print()}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-white text-slate-900 text-xs font-semibold shadow-md transition-all"
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
                      ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
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
                  <User className="w-4 h-4 text-emerald-400" />
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
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-slate-500"
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
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-slate-500"
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
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-slate-500"
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
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">LinkedIn Profile</label>
                    <input
                      type="text"
                      value={personalInfo.linkedin}
                      onChange={(e) => {
                        setPersonalInfo({ ...personalInfo, linkedin: e.target.value });
                        handleDataChange();
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">GitHub / Portfolio</label>
                    <input
                      type="text"
                      value={personalInfo.github}
                      onChange={(e) => {
                        setPersonalInfo({ ...personalInfo, github: e.target.value });
                        handleDataChange();
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-slate-500"
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
                    <Sparkles className="w-4 h-4 text-emerald-400" />
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
                  className="w-full p-3 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-slate-500 leading-relaxed"
                />
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2">
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
                    <Briefcase className="w-4 h-4 text-emerald-400" />
                    <span>Work Experience & Impact</span>
                  </h3>
                  <button
                    onClick={addExperience}
                    className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-medium transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Add Experience</span>
                  </button>
                </div>

                {experiences.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl text-slate-400 text-xs">
                    No work experiences added yet. Click &quot;Add Experience&quot; above to begin.
                  </div>
                ) : (
                  experiences.map((exp, expIdx) => (
                    <div key={exp.id} className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-3 relative group">
                      {/* Section Removal Button */}
                      <div className="flex justify-between items-center pb-1 border-b border-white/5">
                        <span className="text-xs font-semibold text-slate-300">
                          Experience #{expIdx + 1}
                        </span>
                        <button
                          onClick={() => removeExperience(exp.id)}
                          title="Remove Experience Entry"
                          className="inline-flex items-center space-x-1 text-slate-500 hover:text-red-400 text-xs px-2 py-1 rounded-lg hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove Entry</span>
                        </button>
                      </div>

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
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-slate-500"
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
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-slate-500"
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
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-slate-500"
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
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-slate-500"
                          />
                        </div>
                      </div>

                      {/* Bullet Points with Sub-section removal and addition */}
                      <div className="space-y-2 mt-3">
                        <div className="flex items-center justify-between">
                          <label className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                            Accomplishment Bullets
                          </label>
                          <button
                            onClick={() => addBullet(expIdx)}
                            className="inline-flex items-center space-x-1 text-slate-400 hover:text-emerald-400 text-[11px] font-medium transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Bullet</span>
                          </button>
                        </div>

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
                                className="flex-1 px-2.5 py-1.5 text-xs rounded-lg bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-slate-500"
                              />
                              {getEvidenceBadge(b)}
                              <button
                                onClick={() => removeBullet(expIdx, bIdx)}
                                title="Remove bullet point"
                                className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Skills Tab */}
            {activeTab === "skills" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Code className="w-4 h-4 text-emerald-400" />
                    <span>Skills & Competencies</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">{skills.length} skills added</span>
                </div>

                {/* Add new skill form */}
                <form onSubmit={addSkill} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Kubernetes, Redis, PyTorch..."
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-slate-500"
                  />
                  <select
                    value={newSkillProficiency}
                    onChange={(e) => setNewSkillProficiency(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-900 border border-white/10 text-slate-300 focus:outline-none"
                  >
                    <option value="expert">Expert</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="beginner">Beginner</option>
                  </select>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-semibold flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Add</span>
                  </button>
                </form>

                {/* Skills tags with delete option */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {skills.length === 0 ? (
                    <p className="text-xs text-slate-500">No skills listed yet.</p>
                  ) : (
                    skills.map((s, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs group hover:border-slate-700 transition-all"
                      >
                        <span className="font-semibold text-white">{s.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
                          {s.proficiency}
                        </span>
                        <button
                          onClick={() => removeSkill(idx)}
                          title="Remove skill"
                          className="text-slate-500 hover:text-red-400 p-0.5 rounded transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Education Tab */}
            {activeTab === "education" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <GraduationCap className="w-4 h-4 text-emerald-400" />
                    <span>Education</span>
                  </h3>
                  <button
                    onClick={addEducation}
                    className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-medium transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Add Education</span>
                  </button>
                </div>

                {education.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl text-slate-400 text-xs">
                    No education entries added yet.
                  </div>
                ) : (
                  education.map((edu, idx) => (
                    <div key={edu.id} className="p-3.5 rounded-xl bg-slate-900 border border-white/10 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-xs font-bold text-white">{edu.degree}</div>
                          <div className="text-xs text-slate-400">{edu.institution} • {edu.dates}</div>
                          {edu.grade && <div className="text-[11px] text-emerald-400 font-mono mt-0.5">{edu.grade}</div>}
                        </div>
                        <button
                          onClick={() => removeEducation(edu.id)}
                          title="Remove Education Entry"
                          className="inline-flex items-center space-x-1 text-slate-500 hover:text-red-400 text-xs p-1 rounded hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Projects Tab */}
            {activeTab === "projects" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <FolderGit2 className="w-4 h-4 text-emerald-400" />
                    <span>Key Projects</span>
                  </h3>
                  <button
                    onClick={addProject}
                    className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-medium transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Add Project</span>
                  </button>
                </div>

                {projects.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl text-slate-400 text-xs">
                    No projects added yet.
                  </div>
                ) : (
                  projects.map((proj) => (
                    <div key={proj.id} className="p-3.5 rounded-xl bg-slate-900 border border-white/10 space-y-1.5">
                      <div className="flex justify-between items-start">
                        <div className="text-xs font-bold text-white">{proj.title}</div>
                        <button
                          onClick={() => removeProject(proj.id)}
                          title="Remove Project"
                          className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-xs text-slate-400 leading-relaxed">{proj.description}</div>
                      <div className="text-[10px] text-slate-300 font-mono">{proj.technologies}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Real-Time Live ATS Document Preview (6 cols) */}
        <div className="lg:col-span-6 sticky top-24">
          <div className="flex items-center justify-between pb-2 text-xs text-slate-400 font-mono">
            <span className="flex items-center space-x-1.5 text-white font-semibold">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Live ATS Document Preview</span>
            </span>
            <span className="text-emerald-400">Single-Column ATS Standard</span>
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
