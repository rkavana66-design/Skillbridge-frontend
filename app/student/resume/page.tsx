"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Printer, Download } from "lucide-react";

import { getAuth, clearAuth } from "@/lib/auth";
import { getResumeProfile } from "@/lib/api";
import type { StudentProfile } from "@/lib/types/resume";

import ResumeHeader from "@/components/resume/ResumeHeader";
import EducationCard from "@/components/resume/EducationCard";
import SkillRadar from "@/components/resume/SkillRadar";
import SkillBars from "@/components/resume/SkillBars";
import ProjectsSection from "@/components/resume/ProjectsSection";
import CertificatesSection from "@/components/resume/CertificatesSection";
import LetsConnectCard from "@/components/resume/LetsConnectCard";
import AchievementsSection from "@/components/resume/AchievementsSection";
import LanguagesSection from "@/components/resume/LanguagesSection";
import ResumeLoading from "@/components/resume/ResumeLoading";
import ResumeEmptyState from "@/components/resume/ResumeEmptyState";

export default function ResumePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [origin, setOrigin] = useState("");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);

    const { token, user } = getAuth();
    if (!token || user?.role !== "student") {
      router.push("/login");
      return;
    }
    setEmail(user.email ?? null);

    getResumeProfile(token)
      .then(setProfile)
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Unable to load student profile";
        if (message.toLowerCase().includes("expired") || message.toLowerCase().includes("invalid")) {
          clearAuth();
          router.push("/login");
          return;
        }
        setError(message);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  if (loading) return <ResumeLoading />;

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#061522] px-4">
        <div className="w-full max-w-md rounded-xl border border-[#1D3B52] bg-[#0A2033] p-8 text-center">
          <p className="text-sm text-[#EF4444]">{error}</p>
          <button
            onClick={() => router.push("/student/dashboard")}
            className="mt-5 rounded-md bg-[#4F7CFF] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const hasAnyContent =
    (profile.skills?.length ?? 0) > 0 ||
    (profile.language_scores?.length ?? 0) > 0 ||
    (profile.projects?.length ?? 0) > 0 ||
    (profile.documents?.length ?? 0) > 0;

  return (
    <div className="min-h-screen bg-[#061522] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => router.push("/student/dashboard")}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#1D3B52] bg-[#0A2033] px-3.5 py-2 text-sm font-medium text-[#F8FAFC] hover:border-[#4F7CFF]"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#1D3B52] bg-[#0A2033] px-3.5 py-2 text-sm font-medium text-[#F8FAFC] hover:border-[#4F7CFF]"
            >
              <Printer className="h-4 w-4" /> Print Resume
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#4F7CFF] px-3.5 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              <Download className="h-4 w-4" /> Save as PDF
            </button>
          </div>
        </div>
        <p className="no-print -mt-3 mb-6 text-xs text-[#9FB3C8]">
          Choose &quot;Save as PDF&quot; in the browser print dialog.
        </p>

        <div className="resume-print-area">
          {!hasAnyContent ? (
            <ResumeEmptyState
              title="Your resume is looking a little empty"
              description="Add skills, projects, or complete an assessment to build out your resume."
            />
          ) : (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <ResumeHeader profile={profile} email={email} />
                </div>
                <EducationCard profile={profile} />
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="flex flex-col gap-6 lg:col-span-2">
                  <SkillRadar profile={profile} />
                  <ProjectsSection profile={profile} />
                  <CertificatesSection profile={profile} />
                  <AchievementsSection profile={profile} />
                </div>

                <div className="flex flex-col gap-6">
                  <SkillBars profile={profile} />
                  <LanguagesSection profile={profile} />
                  <LetsConnectCard profile={profile} email={email} origin={origin} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
