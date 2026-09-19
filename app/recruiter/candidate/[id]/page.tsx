"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Button from "@/components/ui/Button";
import ResumeHeader from "@/components/resume/ResumeHeader";
import EducationCard from "@/components/resume/EducationCard";
import SkillRadar from "@/components/resume/SkillRadar";
import SkillBars from "@/components/resume/SkillBars";
import ProjectsSection from "@/components/resume/ProjectsSection";
import CertificatesSection from "@/components/resume/CertificatesSection";
import AchievementsSection from "@/components/resume/AchievementsSection";
import LanguagesSection from "@/components/resume/LanguagesSection";
import BookInterviewModal from "@/components/recruiter/BookInterviewModal";
import { getAuth } from "@/lib/auth";
import { ApiError, getCandidateResume, Interview, StudentProfile } from "@/lib/api";
import type { StudentProfile as ResumeStudentProfile } from "@/lib/types/resume";

export default function CandidateResumePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [booked, setBooked] = useState<Interview | null>(null);

  useEffect(() => {
    const { token, user } = getAuth();
    if (!token || user?.role !== "recruiter") {
      router.push("/login");
      return;
    }
    getCandidateResume(params.id)
      .then(setProfile)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load this candidate."))
      .finally(() => setLoading(false));
  }, [router, params.id]);

  // The resume components accept the richer lib/types/resume.ts shape;
  // the fields they use (name, discipline, skills, projects, documents,
  // language_scores, external links) all exist on the api.ts StudentProfile
  // this page fetches, so this cast is safe — it's the same data, just a
  // slightly wider type used by the shared resume components.
  const resumeProfile = profile as unknown as ResumeStudentProfile | null;

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="flex">
        <Sidebar role="recruiter" />
        <main className="flex-1 px-8 py-8">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 flex items-center justify-between">
              <Link
                href="/recruiter/search"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                ← Back to search
              </Link>
              {profile && (
                <Button onClick={() => setShowModal(true)}>Book interview</Button>
              )}
            </div>

            {booked && (
              <div className="mb-4 rounded-md border border-verdant-100 bg-verdant-50 px-4 py-3 text-sm text-verdant-600">
                Interview booked for {new Date(booked.scheduled_at).toLocaleString()} ·{" "}
                {booked.duration_minutes} min · {booked.mode}.{" "}
                <Link href="/recruiter/dashboard" className="font-medium underline">
                  View in dashboard
                </Link>
              </div>
            )}

            {loading ? (
              <p className="text-sm text-ink-light">Loading candidate…</p>
            ) : error ? (
              <p className="rounded-md bg-clay-50 px-3 py-2 text-sm text-clay-500">{error}</p>
            ) : resumeProfile ? (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <ResumeHeader profile={resumeProfile} />
                  </div>
                  <EducationCard profile={resumeProfile} />
                </div>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <div className="flex flex-col gap-6 lg:col-span-2">
                    <SkillRadar profile={resumeProfile} />
                    <ProjectsSection profile={resumeProfile} />
                    <CertificatesSection profile={resumeProfile} />
                    <AchievementsSection profile={resumeProfile} />
                  </div>
                  <div className="flex flex-col gap-6">
                    <SkillBars profile={resumeProfile} />
                    <LanguagesSection profile={resumeProfile} />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </main>
      </div>

      {showModal && profile && (
        <BookInterviewModal
          studentId={String(profile.id)}
          studentName={profile.name}
          onClose={() => setShowModal(false)}
          onBooked={(interview) => {
            setBooked(interview);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
