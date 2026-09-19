export interface Skill {
  name: string;
  proficiency: number;
  source?: string | null;
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

export interface Project {
  title: string;
  description?: string | null;
  tech_stack?: string | null;
  github_url?: string | null;
}

export interface VerificationDetails {
  qr_found?: boolean | null;
  qr_domain?: string | null;
  domain_trusted?: boolean | null;
  notes?: string | null;
}

export type VerificationStatus = "verified" | "pending" | "suspicious" | "rejected" | string;

export interface StudentDocument {
  id: number | string;
  type: string;
  file_path?: string | null;
  original_filename?: string | null;
  verification_status: VerificationStatus;
  verification_details?: VerificationDetails | null;
}

export interface Certification {
  name: string;
  issuer?: string | null;
  verification_status?: string | null;
}

export interface SpokenLanguage {
  name: string;
  proficiency?: string | null;
}

export interface StudentProfile {
  id: number | string;
  user_id?: number | string;
  name: string;
  email?: string | null;
  discipline?: string | null;
  college?: string | null;
  degree?: string | null;
  graduation_year?: number | null;
  cgpa?: number | string | null;
  career_goal?: string | null;
  work_preference?: string | null;
  phone?: string | null;
  location?: string | null;
  profile_photo_url?: string | null;
  summary?: string | null;

  language_scores?: LanguageScore[] | null;
  skills?: Skill[] | null;
  projects?: Project[] | null;
  documents?: StudentDocument[] | null;

  github_url?: string | null;
  github_username?: string | null;
  github_verified?: boolean | null;
  github_public_repos?: number | null;

  linkedin_url?: string | null;
  linkedin_verified?: string | boolean | null;

  leetcode_url?: string | null;
  leetcode_username?: string | null;
  leetcode_rating?: number | string | null;
  leetcode_verified?: boolean | null;

  portfolio_url?: string | null;

  achievements?: string[] | null;
  certifications?: Certification[] | null;
  languages?: SpokenLanguage[] | null;

  verified_documents_count?: number | null;
}
