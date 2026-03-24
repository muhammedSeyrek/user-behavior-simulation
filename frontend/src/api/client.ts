import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

export interface ParticipantCreate {
  age_group: string;
  education: string;
  department: string;
  it_experience: string;
  prior_training: boolean;
  consent_given: boolean;
}

export interface ParticipantOut {
  id: string;
  age_group: string;
  education: string;
  department: string;
  it_experience: string;
  prior_training: boolean;
  created_at: string;
}

export interface SessionOut {
  id: string;
  content_id: string;
  content_type: string;
  content_category: string;
  created_at: string;
}

export interface SimulationContent {
  id: string;
  type: "phishing" | "legitimate";
  category: string;
  sender_name: string;
  sender_email: string;
  subject: string;
  body: string;
  link_text: string;
  link_url: string;
  warning_signs: string[];
}

export interface DashboardStats {
  total_participants: number;
  total_sessions: number;
  total_interactions: number;
  phishing_click_rate: number;
  correct_decision_rate: number;
  avg_time_to_action_ms: number | null;
  by_department: { department: string; sessions: number }[];
  by_age_group: { age_group: string; sessions: number }[];
  by_it_experience: { it_experience: string; total: number }[];
  recent_interactions: {
    action: string;
    correct: boolean;
    time_ms: number | null;
    content_type: string;
    category: string;
  }[];
}

export const participantApi = {
  create: (data: ParticipantCreate) =>
    api.post<ParticipantOut>("/participants/", data).then((r) => r.data),
};

export const sessionApi = {
  create: (participant_id: string) =>
    api
      .post<SessionOut>("/sessions/", {
        participant_id,
        user_agent: navigator.userAgent,
      })
      .then((r) => r.data),

  createBatch: (participant_id: string, count = 5) =>
    api
      .post<SessionOut[]>("/sessions/batch", {
        participant_id,
        count,
        user_agent: navigator.userAgent,
      })
      .then((r) => r.data),

  getContent: (session_id: string) =>
    api
      .get<{ session_id: string; content: SimulationContent }>(
        `/sessions/${session_id}/content`
      )
      .then((r) => r.data),
};

export interface RoundResult {
  round: number;           // 1-indexed
  session_id: string;
  action: string;
  content: SimulationContent;
  confidence_score: number;
  decision_motivation: string[];
  time_to_action_ms: number;
}

export const interactionApi = {
  log: (data: {
    session_id: string;
    action: string;
    time_to_action_ms?: number;
    confidence_score?: number;
    decision_motivation?: string[];
    extra_data?: string;
  }) => api.post("/interactions/", data).then((r) => r.data),
};

export const surveyApi = {
  submit: (participant_id: string, responses: Record<string, unknown>) =>
    api.post("/survey/", { participant_id, responses }).then((r) => r.data),
};

export const analyticsApi = {
  getDashboard: () =>
    api.get<DashboardStats>("/analytics/dashboard").then((r) => r.data),

  exportCsv: (username: string, password: string) => {
    const token = btoa(`${username}:${password}`);
    return fetch("/api/analytics/export/csv", {
      headers: { Authorization: `Basic ${token}` },
    });
  },

  exportExcel: (username: string, password: string) => {
    const token = btoa(`${username}:${password}`);
    return fetch("/api/analytics/export/excel", {
      headers: { Authorization: `Basic ${token}` },
    });
  },

  verifyCredentials: (username: string, password: string) => {
    return fetch("/api/analytics/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  },
};
