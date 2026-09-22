"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Layers,
  Award,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { parseResume, uploadAndCreateResume } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { ParsedResumeResponse } from "../types";

interface ResumeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToBuilder?: (parsedData: ParsedResumeResponse) => void;
  onUploadSuccess?: (createdResume: any) => void;
  mode?: "builder" | "dashboard";
}

export const ResumeUploadModal: React.FC<ResumeUploadModalProps> = ({
  isOpen,
  onClose,
  onApplyToBuilder,
  onUploadSuccess,
  mode = "builder",
}) => {
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [parsedResult, setParsedResult] = useState<ParsedResumeResponse | null>(null);
  const [resumeTitle, setResumeTitle] = useState("");
  const [isMaster, setIsMaster] = useState(false);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndSelectFile = (file: File) => {
    setErrorMessage(null);
    const validExtensions = [".pdf", ".docx"];
    const fileExt = "." + file.name.split(".").pop()?.toLowerCase();

    if (!validExtensions.includes(fileExt)) {
      setErrorMessage("Invalid file format. Please upload a PDF (.pdf) or Word document (.docx).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("File exceeds 10MB limit. Please upload a smaller document.");
      return;
    }

    setSelectedFile(file);
    const baseTitle = file.name.replace(/\.[^/.]+$/, "");
    setResumeTitle(baseTitle.charAt(0).toUpperCase() + baseTitle.slice(1) + " Resume");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSelectFile(e.target.files[0]);
    }
  };

  const handleParseDocument = async () => {
    if (!selectedFile || !token) {
      setErrorMessage("Please ensure you are logged in and have selected a valid document.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setStatusMessage("Inspecting binary magic bytes and running multi-column extractor...");

    try {
      const res = await parseResume(selectedFile, token);
      if (res.success && res.data) {
        setParsedResult(res.data);
      } else {
        setErrorMessage(res.error || "Failed to parse document. Please check file integrity.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during document parsing.");
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  const handleSaveToDashboard = async () => {
    if (!selectedFile || !token) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setStatusMessage("Persisting resume and generating initial version snapshot...");

    try {
      const res = await uploadAndCreateResume(selectedFile, resumeTitle, isMaster, token);
      if (res.success && res.data) {
        if (onUploadSuccess) onUploadSuccess(res.data);
        handleClose();
      } else {
        setErrorMessage(res.error || "Failed to create resume document.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error while saving parsed resume.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyToBuilder = () => {
    if (parsedResult && onApplyToBuilder) {
      onApplyToBuilder(parsedResult);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setParsedResult(null);
    setErrorMessage(null);
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-zinc-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-zinc-100">
                {parsedResult ? "Resume Extracted Successfully" : "Upload & Parse Resume"}
              </h3>
              <p className="text-xs text-zinc-400">
                {parsedResult
                  ? "Review extracted entities before importing"
                  : "Module 4 • Multi-column PDF & DOCX Ingestion Engine"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMessage && (
            <div className="flex items-start gap-3 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {!parsedResult ? (
            /* Upload & Dropzone View */
            <div className="space-y-4">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                  dragActive
                    ? "border-emerald-500 bg-emerald-500/5 scale-[0.99]"
                    : selectedFile
                    ? "border-emerald-500/50 bg-zinc-950/50"
                    : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/30 hover:bg-zinc-950/60"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-zinc-300 mb-4 group-hover:scale-105 transition-transform">
                  {selectedFile ? (
                    <FileText className="w-7 h-7 text-emerald-400" />
                  ) : (
                    <UploadCloud className="w-7 h-7 text-zinc-400" />
                  )}
                </div>

                {selectedFile ? (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-zinc-100">{selectedFile.name}</p>
                    <p className="text-xs text-zinc-400">
                      {(selectedFile.size / 1024).toFixed(1)} KB • Click or drop to replace
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium text-zinc-200">
                      Drag and drop your resume file, or <span className="text-emerald-400 underline underline-offset-2">browse</span>
                    </p>
                    <p className="text-xs text-zinc-400">
                      Supports PDF (.pdf) & Microsoft Word (.docx) up to 10MB
                    </p>
                  </div>
                )}
              </div>

              {/* Security Safeguard Callout */}
              <div className="p-3.5 bg-zinc-950/60 border border-zinc-800 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Module 4 Security & Layout Protections</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Files are validated via binary magic-bytes (%PDF- / PK headers), sanitized, and processed column-aware. Candidate PII is never emitted in system logs.
                </p>
              </div>

              {selectedFile && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                      Resume Title
                    </label>
                    <input
                      type="text"
                      value={resumeTitle}
                      onChange={(e) => setResumeTitle(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
                      placeholder="e.g. Senior Backend Engineer Resume"
                    />
                  </div>

                  {mode === "dashboard" && (
                    <label className="flex items-center gap-2.5 text-xs text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isMaster}
                        onChange={(e) => setIsMaster(e.target.checked)}
                        className="rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500 bg-zinc-800"
                      />
                      <span>Set as Master Profile Resume</span>
                    </label>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Parsed Structured Preview View */
            <div className="space-y-4">
              {/* Summary Stats Header */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-xl">
                  <div className="text-[11px] text-zinc-400">ATS Completeness</div>
                  <div className="text-xl font-bold text-emerald-400">
                    {parsedResult.completeness_score}%
                  </div>
                </div>
                <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-xl">
                  <div className="text-[11px] text-zinc-400">Confidence</div>
                  <div className="text-xl font-bold text-zinc-100">
                    {parsedResult.metadata.confidence_score}%
                  </div>
                </div>
                <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-xl">
                  <div className="text-[11px] text-zinc-400">Parse Time</div>
                  <div className="text-xl font-bold text-zinc-100">
                    {parsedResult.metadata.parsing_duration_ms}ms
                  </div>
                </div>
              </div>

              {/* Extracted Contact Info */}
              <div className="p-4 bg-zinc-950/50 border border-zinc-800 rounded-xl space-y-2">
                <div className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  Candidate Contact Information
                </div>
                <div className="text-sm font-medium text-zinc-100">
                  {parsedResult.structured_data.personal_info.full_name || "Name not explicitly detected"}
                </div>
                <div className="text-xs text-zinc-400 flex flex-wrap gap-x-4 gap-y-1">
                  {parsedResult.structured_data.personal_info.email && (
                    <span>Email: {parsedResult.structured_data.personal_info.email}</span>
                  )}
                  {parsedResult.structured_data.personal_info.phone && (
                    <span>Phone: {parsedResult.structured_data.personal_info.phone}</span>
                  )}
                  {parsedResult.structured_data.personal_info.location && (
                    <span>Location: {parsedResult.structured_data.personal_info.location}</span>
                  )}
                </div>
              </div>

              {/* Extracted Sections Overview */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-zinc-950/50 border border-zinc-800 rounded-xl flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-200">
                      {parsedResult.structured_data.experience.length} Positions
                    </div>
                    <div className="text-[11px] text-zinc-400">Work Experience entries</div>
                  </div>
                </div>

                <div className="p-3 bg-zinc-950/50 border border-zinc-800 rounded-xl flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-200">
                      {parsedResult.structured_data.education.length} Degrees
                    </div>
                    <div className="text-[11px] text-zinc-400">Education records</div>
                  </div>
                </div>
              </div>

              {/* Extracted Skills Badges */}
              {parsedResult.structured_data.skills.length > 0 && (
                <div className="p-4 bg-zinc-950/50 border border-zinc-800 rounded-xl space-y-2">
                  <div className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    Detected Skills ({parsedResult.structured_data.skills.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {parsedResult.structured_data.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-[11px] font-medium bg-zinc-800/80 text-zinc-200 border border-zinc-700/60 rounded-md"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Cancel
          </button>

          {!parsedResult ? (
            <button
              disabled={!selectedFile || isProcessing}
              onClick={handleParseDocument}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/10"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{statusMessage || "Parsing Document..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Parse & Inspect Document</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-3">
              {mode === "builder" && onApplyToBuilder && (
                <button
                  onClick={handleApplyToBuilder}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-all shadow-lg shadow-emerald-500/10"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Import into Builder</span>
                </button>
              )}

              <button
                disabled={isProcessing}
                onClick={handleSaveToDashboard}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-all"
              >
                {isProcessing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Layers className="w-4 h-4" />
                )}
                <span>Save as New Resume Document</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
