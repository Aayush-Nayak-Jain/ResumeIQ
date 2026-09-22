export interface HealthStatus {
  status: string;
  app_name: string;
  version: string;
  environment: string;
  llm_provider: "ollama" | "azure_openai" | string;
  llm_model: string;
  timestamp: string;
}

export interface ReadinessStatus {
  status: "ready" | "degraded" | string;
  database_configured: boolean;
  redis_configured: boolean;
  ai_gateway_mode: string;
  checks: {
    database: string;
    redis: string;
    ai_gateway: {
      provider: string;
      configured: boolean;
      timeout_seconds: number;
      circuit_breaker_threshold: number;
    };
    embeddings: {
      model: string;
      dimension: number;
    };
  };
  timestamp: string;
}

export interface PhaseMilestone {
  phase: number;
  title: string;
  status: "completed" | "in_progress" | "pending";
  description: string;
  modules: string[];
  securityFocus: string;
}

export interface ParsedContactInfo {
  full_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
}

export interface ParsedWorkExperience {
  id: string;
  company: string;
  title: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current?: boolean;
  bullets: string[];
  technologies: string[];
}

export interface ParsedEducation {
  id: string;
  institution: string;
  degree: string;
  field_of_study?: string;
  start_date: string;
  end_date?: string;
  grade?: string;
}

export interface ParsedSkill {
  name: string;
  category: "technical" | "soft" | "domain" | "tool";
  proficiency: "beginner" | "intermediate" | "expert";
}

export interface ParsedProject {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  bullets: string[];
  repo_url?: string;
  demo_url?: string;
}

export interface ParsedCertification {
  id: string;
  name: string;
  issuer: string;
  issue_date?: string;
  credential_id?: string;
  url?: string;
}

export interface ParserMetadata {
  file_name: string;
  file_type: string;
  file_size_bytes: number;
  parsing_duration_ms: number;
  detected_sections: string[];
  section_counts: Record<string, number>;
  confidence_score: number;
}

export interface ParsedResumeStructuredData {
  personal_info: ParsedContactInfo;
  summary: string;
  experience: ParsedWorkExperience[];
  education: ParsedEducation[];
  skills: ParsedSkill[];
  projects: ParsedProject[];
  certifications: ParsedCertification[];
}

export interface ParsedResumeResponse {
  raw_text: string;
  structured_data: ParsedResumeStructuredData;
  metadata: ParserMetadata;
  completeness_score: number;
}
