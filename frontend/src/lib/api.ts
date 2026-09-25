import { HealthStatus, ReadinessStatus } from "../types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function fetchHealth(): Promise<HealthStatus> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Health check failed with HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    return {
      status: "unreachable",
      app_name: "FreeResume",
      version: "0.1.0",
      environment: "local",
      llm_provider: "ollama",
      llm_model: "offline",
      timestamp: new Date().toISOString(),
    };
  }
}

export async function fetchReadiness(): Promise<ReadinessStatus> {
  try {
    const res = await fetch(`${API_BASE_URL}/health/ready`, {
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Readiness check failed with HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    return {
      status: "offline",
      database_configured: false,
      redis_configured: false,
      ai_gateway_mode: "disconnected",
      checks: {
        database: "disconnected",
        redis: "disconnected",
        ai_gateway: {
          provider: "ollama",
          configured: false,
          timeout_seconds: 30,
          circuit_breaker_threshold: 3,
        },
        embeddings: {
          model: "all-MiniLM-L6-v2",
          dimension: 384,
        },
      },
      timestamp: new Date().toISOString(),
    };
  }
}

export async function parseResume(
  file: File,
  token: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE_URL}/resumes/parse`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: result.detail || "Failed to parse document. Please check the file format.",
      };
    }

    return { success: true, data: result };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Network error while parsing resume document.",
    };
  }
}

export async function uploadAndCreateResume(
  file: File,
  title: string | undefined,
  isMaster: boolean,
  token: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    if (title) formData.append("title", title);
    formData.append("is_master", String(isMaster));

    const res = await fetch(`${API_BASE_URL}/resumes/upload-and-create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: result.detail || "Failed to upload and create resume.",
      };
    }

    return { success: true, data: result };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Network error while uploading resume document.",
    };
  }
}

// Module 5: Job Description API Methods
export async function analyzeJobDescription(
  rawText: string,
  title?: string,
  company?: string,
  weightsConfig?: any,
  token?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/jobs/analyze`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        raw_text: rawText,
        title: title || undefined,
        company: company || undefined,
        weights_config: weightsConfig || undefined,
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: result.detail || "Failed to analyze job description.",
      };
    }

    return { success: true, data: result };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Network error while analyzing job description.",
    };
  }
}

export async function createJobDescription(
  rawText: string,
  title?: string,
  company?: string,
  weightsConfig?: any,
  token?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/jobs`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        raw_text: rawText,
        title: title || undefined,
        company: company || undefined,
        weights_config: weightsConfig || undefined,
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: result.detail || "Failed to save job description.",
      };
    }

    return { success: true, data: result };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Network error while saving job description.",
    };
  }
}

export async function listJobDescriptions(
  token: string
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/jobs`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: result.detail || "Failed to list job descriptions.",
      };
    }

    return { success: true, data: result };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Network error while fetching job descriptions.",
    };
  }
}

export async function getJobDescription(
  id: string,
  token: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: result.detail || "Failed to get job description details.",
      };
    }

    return { success: true, data: result };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Network error while fetching job description details.",
    };
  }
}

export async function deleteJobDescription(
  id: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok && res.status !== 204) {
      const result = await res.json();
      return {
        success: false,
        error: result.detail || "Failed to delete job description.",
      };
    }

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Network error while deleting job description.",
    };
  }
}


