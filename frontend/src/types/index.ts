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
