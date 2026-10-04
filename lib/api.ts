import { getAuth } from "./auth";

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
export const API_BASE_URL = BASE_URL;

export type VerificationStatus = "verified" | "suspicious" | "rejected" | "pending";

export interface VerificationDetails {
  qr_found: boolean;
  qr_domain: string | null;
  domain_trusted: boolean | null;
  qr_name: string | null;
  name_match: boolean | null;
  ocr_name_found: boolean | null;
  ocr_issuer_found: string | null;
  tamper_signals: {
    has_exif: boolean;
    exif_software: string | null;
    resolution: [number, number] | null;
    analysis_available: boolean;
  };
  notes: string;
}

export interface StudentDocument {
  id: string | number;
  type: string;
  file_path: string;
  verification_status: VerificationStatus;
  verification_details?: VerificationDetails;
}

export interface StudentSkill {
  name: string;
  proficiency: number;
  source?: string;
}

export interface StudentProject {
  title: string;
  description: string;
  tech_stack: string;
  github_url?: string;
}

export interface LanguageScore {
  language: string;
  percent: number;
  tests_taken: number;
  test_percent?: number | null;
  skill_percent?: number | null;
  project_count?: number;
  sources?: string[];
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  discipline: string;
  college?: string;
  year?: string | number;
  cgpa?: string | number;
  skills: StudentSkill[];
  projects: StudentProject[];
  documents: StudentDocument[];
  github_url?: string;
  github_username?: string;
  linkedin_url?: string;
  leetcode_url?: string;
  leetcode_username?: string;
  leetcode_rating?: string | number;
  language_scores?: LanguageScore[];
  summary?: string;
  profile_photo_url?: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  role: "student" | "recruiter";
  discipline?: string;
  college?: string;
  designation?: string;
}

export interface LoginResponse {
  access_token: string;
  role: "student" | "recruiter" | "admin";
  name: string;
  email: string;
}

export interface CandidateSummary {
  id: string;
  name: string;
  discipline?: string | null;
  top_skills: LanguageScore[];
  verified_documents_count: number;
}

export interface Interview {
  id: string;
  student_id: string;
  student_name: string;
  scheduled_at: string;
  duration_minutes: number;
  mode: "online" | "offline";
  location_or_link?: string | null;
  notes?: string | null;
  status: string;
}

export interface InterviewCreatePayload {
  student_id: string;
  scheduled_at: string;
  duration_minutes: number;
  mode: "online" | "offline";
  location_or_link?: string;
  notes?: string;
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = false
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (auth) {
    const { token } = getAuth();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  let data: any = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const message =
      (data && (data.detail || data.message)) || `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }

  return data as T;
}

// ---------- Auth ----------

export function signup(payload: SignupPayload) {
  return request<{ message?: string }>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function verifyEmail(token: string) {
  return request<{ message?: string }>(`/api/auth/verify-email/${token}`, {
    method: "GET",
  });
}

export function login(email: string, password: string) {
  return request<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function forgotPassword(email: string) {
  return request<{ message?: string }>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(token: string, password: string) {
  return request<{ message?: string }>(`/api/auth/reset-password/${token}`, {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

// ---------- Student ----------

export function getStudentProfile() {
  return request<StudentProfile>("/api/student/profile", { method: "GET" }, true);
}

export function updateExternalProfiles(payload: {
  github_url?: string;
  linkedin_url?: string;
  leetcode_url?: string;
  summary?: string;
}) {
  return request<{ message?: string }>(
    "/api/student/profile/external",
    { method: "PUT", body: JSON.stringify(payload) },
    true
  );
}

export function uploadProfilePhoto(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return request<{ profile_photo_url: string; message: string }>(
    "/api/student/profile/photo",
    { method: "POST", body: formData },
    true
  );
}

export function verifyExternalProfiles() {
  return request<{ message?: string }>(
    "/api/student/profile/verify-external",
    { method: "POST" },
    true
  );
}

export function addSkill(payload: StudentSkill) {
  return request<{ message?: string }>(
    "/api/student/skills",
    { method: "POST", body: JSON.stringify(payload) },
    true
  );
}

export function addProject(payload: StudentProject) {
  return request<{ message?: string }>(
    "/api/student/projects",
    { method: "POST", body: JSON.stringify(payload) },
    true
  );
}

export function uploadDocument(file: File, type: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);
  return request<{ message?: string; id?: string | number }>(
    "/api/student/documents",
    { method: "POST", body: formData },
    true
  );
}

export function scanDocument(documentId: string | number) {
  return request<{ message?: string }>(
    `/api/verification/scan-document/${documentId}`,
    { method: "POST" },
    true
  );
}

export function getDocumentVerification(documentId: string | number) {
  return request<{ verification_status: VerificationStatus; verification_details?: VerificationDetails }>(
    `/api/verification/document/${documentId}/verification`,
    { method: "GET" },
    true
  );
}

export function clientOcrRescan(documentId: string | number, ocrText: string) {
  return request<{ verification_status: VerificationStatus; verification_details?: VerificationDetails }>(
    `/api/verification/document/${documentId}/client-ocr-rescan`,
    { method: "POST", body: JSON.stringify({ ocr_text: ocrText }) },
    true
  );
}

// ---------- Recruiter ----------

export function searchCandidates(params: { q?: string; discipline?: string; minScore?: number }) {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.discipline) query.set("discipline", params.discipline);
  if (params.minScore !== undefined) query.set("min_score", String(params.minScore));
  const qs = query.toString();
  return request<CandidateSummary[]>(
    `/api/recruiter/candidates${qs ? `?${qs}` : ""}`,
    { method: "GET" },
    true
  );
}

export function getCandidateResume(studentId: string) {
  return request<StudentProfile>(
    `/api/recruiter/candidate/${studentId}/resume`,
    { method: "GET" },
    true
  );
}

export function scheduleInterview(payload: InterviewCreatePayload) {
  return request<Interview>(
    "/api/recruiter/interviews",
    { method: "POST", body: JSON.stringify(payload) },
    true
  );
}

export function getUpcomingInterviews() {
  return request<Interview[]>("/api/recruiter/interviews", { method: "GET" }, true);
}

// ---------- Assessment ----------

export interface TestListItem {
  id: string;
  title: string;
  discipline: string;
  category?: string;
  subcategory?: string;
  topic?: string;
  duration_minutes: number;
  passing_percent: number;
}

export interface QuestionForStudent {
  id: string;
  question_type: "mcq" | "coding";
  text: string;
  options?: string[];
  starter_code?: string;
  language?: string;
}

export interface StartAttemptResponse {
  attempt_id: string;
  test_id: string;
  title: string;
  duration_minutes: number;
  started_at: string;
  questions: QuestionForStudent[];
}

export interface SubmitAttemptResponse {
  attempt_id: string;
  status: string;
  score: number;
  total_marks: number;
  percent: number;
  passed: boolean;
}

export interface ProctoringEventResponse {
  logged: boolean;
  disqualified: boolean;
  tab_switch_count: number;
}

export interface LanguageScoreSummary {
  scores: LanguageScore[];
  top_scores: LanguageScore[];
}

export function listTests(discipline?: string) {
  const query = discipline ? `?discipline=${encodeURIComponent(discipline)}` : "";
  return request<TestListItem[]>(`/api/assessment/tests${query}`, { method: "GET" }, true);
}

export function startTest(testId: string) {
  return request<StartAttemptResponse>(
    `/api/assessment/tests/${testId}/start`,
    { method: "POST" },
    true
  );
}

export function submitAttempt(
  attemptId: string,
  answers: Record<string, number>,
  codeAnswers: Record<string, string> = {}
) {
  return request<SubmitAttemptResponse>(
    `/api/assessment/attempts/${attemptId}/submit`,
    { method: "POST", body: JSON.stringify({ answers, code_answers: codeAnswers }) },
    true
  );
}

export interface RunCodeResult {
  stdout: string;
  stderr: string;
  success: boolean;
}

export function runCode(attemptId: string, language: string, code: string, stdin?: string) {
  return request<RunCodeResult>(
    `/api/assessment/attempts/${attemptId}/run-code`,
    { method: "POST", body: JSON.stringify({ language, code, stdin }) },
    true
  );
}

export function logProctoringEvent(
  attemptId: string,
  eventType: string,
  eventData?: Record<string, unknown>
) {
  return request<ProctoringEventResponse>(
    `/api/assessment/attempts/${attemptId}/event`,
    { method: "POST", body: JSON.stringify({ event_type: eventType, event_data: eventData }) },
    true
  );
}

export function uploadSnapshot(attemptId: string, blob: Blob) {
  const formData = new FormData();
  formData.append("file", blob, "snapshot.jpg");
  return request<{ id: string; captured_at: string; message: string }>(
    `/api/assessment/attempts/${attemptId}/snapshot`,
    { method: "POST", body: formData },
    true
  );
}

export function getLanguageScores() {
  return request<LanguageScoreSummary>(
    "/api/assessment/profile/language-scores",
    { method: "GET" },
    true
  );
}

export interface Recommendation {
  language: string;
  percent: number;
  level: "low" | "average" | "strong";
  message: string;
  suggested_actions: string[];
}

export interface RecommendationsResponse {
  recommendations: Recommendation[];
}

export function getRecommendations() {
  return request<RecommendationsResponse>(
    "/api/assessment/profile/recommendations",
    { method: "GET" },
    true
  );
}

// ---------- Skill demand insights (government/institution dashboard) ----------

export interface SkillDemandItem {
  skill: string;
  search_count: number;
}

export interface SkillDemandResponse {
  total_searches: number;
  top_skills: SkillDemandItem[];
}

export function getSkillDemand(discipline?: string) {
  const qs = discipline ? `?discipline=${encodeURIComponent(discipline)}` : "";
  // No auth required — this is a public institutional dashboard, not a
  // recruiter/student account view.
  return request<SkillDemandResponse>(`/api/insights/skill-demand${qs}`, { method: "GET" }, false);
}

// ---------- Resume page ----------
// Named distinctly from getStudentProfile() above (which returns this file's
// own StudentProfile shape) to avoid a collision — this one returns the
// richer lib/types/resume.ts shape used only by the new resume page.
import type { StudentProfile as ResumeStudentProfile } from "./types/resume";

export async function getResumeProfile(token: string): Promise<ResumeStudentProfile> {
  const res = await fetch(`${BASE_URL}/api/student/profile`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    let detail: string | undefined;
    try {
      const data = await res.json();
      detail = data?.detail;
    } catch {
      // response wasn't JSON — fall through to the generic message
    }
    throw new Error(detail || "Unable to load student profile");
  }

  return res.json();
}

export { ApiError };

// ---------- Resume page (richer profile shape, used only by app/student/resume) ----------
// Kept as a separate function (not a change to getStudentProfile above) so the
// dashboard, profile, uploads, and external pages that already depend on the
// original getStudentProfile()/StudentProfile shape keep working unchanged.
import type { StudentProfile as ResumeProfile } from "./types/resume";

export async function getStudentResumeProfile(token: string): Promise<ResumeProfile> {
  const res = await fetch(`${API_BASE_URL}/api/student/profile`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  let data: any = null;
  try {
    const text = await res.text();
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    if (res.status === 401) {
      const err = new Error(data?.detail || "Session expired. Please log in again.");
      (err as any).status = 401;
      throw err;
    }
    throw new Error(data?.detail || "Unable to load student profile");
  }

  return data as ResumeProfile;
}

// ---------- Admin: manual document review ----------

export interface AdminDocumentListItem {
  id: string;
  student_id: string;
  student_name: string | null;
  type: string;
  file_url: string;
  verification_status: VerificationStatus;
  verification_details?: VerificationDetails;
  created_at: string;
}

export function getAdminDocuments() {
  return request<AdminDocumentListItem[]>("/api/verification/admin/documents", { method: "GET" }, true);
}

export function manualVerifyDocument(
  documentId: string,
  status: "verified" | "suspicious" | "rejected",
  notes?: string
) {
  return request<{ message?: string }>(
    `/api/verification/manual-verify-document/${documentId}`,
    { method: "POST", body: JSON.stringify({ status, notes }) },
    true
  );
}
