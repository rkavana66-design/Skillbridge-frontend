"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import VerificationBadge from "@/components/ui/VerificationBadge";
import { getAuth } from "@/lib/auth";
import { getStudentProfile, StudentProfile } from "@/lib/api";

export default function StudentProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const { token, user } = getAuth();
    if (!token || user?.role !== "student") {
      router.push("/login");
      return;
    }
    getStudentProfile()
      .then(setProfile)
      .catch(() => setError("Could not load your profile."))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-paper">
      <div
        aria-hidden
        className="animate-float-slow pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-gradient-to-br from-indigo-300/35 to-transparent blur-3xl"
      />
      <Navbar />
      <div className="flex">
        <Sidebar role="student" />
        <main className="flex-1 px-8 py-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="animate-fade-up font-display text-2xl font-semibold text-ink">Your profile</h1>
            <div className="flex gap-3">
              <Link href="/student/external">
                <Button variant="outline">Edit external profiles</Button>
              </Link>
              <Link href="/student/resume">
                <Button>View resume</Button>
              </Link>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-ink-light">Loading profile…</p>
          ) : error ? (
            <p className="rounded-md bg-clay-50 px-3 py-2 text-sm text-clay-500">{error}</p>
          ) : profile ? (
            <div className="flex max-w-3xl flex-col gap-6">
              <Card title="Basic information">
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <Field label="Name" value={profile.name} />
                  <Field label="Discipline" value={profile.discipline} />
                  {profile.college && <Field label="College" value={profile.college} />}
                  {profile.year && <Field label="Year" value={String(profile.year)} />}
                  {profile.cgpa && <Field label="CGPA" value={String(profile.cgpa)} />}
                </dl>
              </Card>

              <Card title="Verified skill scores" subtitle="Best score per language/domain from proctored tests">
                {!profile.language_scores || profile.language_scores.length === 0 ? (
                  <EmptyState text="No assessments taken yet." />
                ) : (
                  <div className="flex flex-col gap-3">
                    {profile.language_scores.map((s) => (
                      <div key={s.language} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-ink">{s.language}</p>
                          <p className="text-xs text-ink-light">
                            {s.tests_taken} test{s.tests_taken > 1 ? "s" : ""} taken
                          </p>
                        </div>
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-600">
                          {s.percent}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card title="Skills" subtitle={`${profile.skills.length} listed`}>
                {profile.skills.length === 0 ? (
                  <EmptyState text="No skills added yet." />
                ) : (
                  <ul className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <li
                        key={skill.name}
                        className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-sm text-indigo-600"
                      >
                        {skill.name}
                        <span className="ml-1.5 text-indigo-400">{skill.proficiency}%</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <Card title="Projects" subtitle={`${profile.projects.length} listed`}>
                {profile.projects.length === 0 ? (
                  <EmptyState text="No projects added yet." />
                ) : (
                  <div className="flex flex-col gap-4">
                    {profile.projects.map((project) => (
                      <div key={project.title} className="border-b border-indigo-50 pb-4 last:border-0 last:pb-0">
                        <p className="font-medium text-ink">{project.title}</p>
                        <p className="mt-0.5 text-sm text-ink-light">{project.description}</p>
                        <p className="mt-1 text-xs text-indigo-500">{project.tech_stack}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card title="Certificates & documents" subtitle={`${profile.documents.length} uploaded`}>
                {profile.documents.length === 0 ? (
                  <EmptyState text="No documents uploaded yet." />
                ) : (
                  <div className="flex flex-col gap-3">
                    {profile.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between rounded-md border border-indigo-50 px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-medium capitalize text-ink">{doc.type}</p>
                          <p className="text-xs text-ink-light">{doc.file_path.split("/").pop()}</p>
                        </div>
                        <VerificationBadge status={doc.verification_status} />
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card title="External profiles">
                <div className="flex flex-col gap-3 text-sm">
                  <ExternalRow
                    label="GitHub"
                    url={profile.github_url}
                    detail={profile.github_username ? `Verified as @${profile.github_username}` : undefined}
                  />
                  <ExternalRow
                    label="LinkedIn"
                    url={profile.linkedin_url}
                    detail={profile.linkedin_url ? "Self-reported" : undefined}
                  />
                  <ExternalRow
                    label="LeetCode"
                    url={profile.leetcode_url}
                    detail={
                      profile.leetcode_username
                        ? `Verified as ${profile.leetcode_username}${
                            profile.leetcode_rating ? ` · Rating ${profile.leetcode_rating}` : ""
                          }`
                        : undefined
                    }
                  />
                </div>
              </Card>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-light">{label}</dt>
      <dd className="mt-0.5 font-medium text-ink">{value}</dd>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="text-sm text-ink-light">{text}</p>;
}

function ExternalRow({
  label,
  url,
  detail,
}: {
  label: string;
  url?: string;
  detail?: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-indigo-50 pb-3 last:border-0 last:pb-0">
      <div>
        <p className="font-medium text-ink">{label}</p>
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-indigo-500 hover:underline"
          >
            {url}
          </a>
        ) : (
          <p className="text-xs text-ink-light">Not added</p>
        )}
      </div>
      {detail && <span className="text-xs text-verdant-600">{detail}</span>}
    </div>
  );
}
