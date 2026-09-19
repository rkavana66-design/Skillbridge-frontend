"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileCheck2, FolderKanban, Sparkles, User2, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Card from "@/components/ui/Card";
import Reveal from "@/components/Reveal";
import { getAuth } from "@/lib/auth";
import { getRecommendations, getStudentProfile, Recommendation, StudentProfile } from "@/lib/api";

export default function StudentDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

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

    getRecommendations()
      .then((res) => setRecommendations(res.recommendations))
      .catch(() => {})
      .finally(() => setLoadingRecs(false));
  }, [router]);

  const verifiedCount =
    profile?.documents.filter((d) => d.verification_status === "verified").length ?? 0;

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="flex">
        <Sidebar role="student" />
        <main className="relative flex-1 overflow-hidden px-8 py-8">
          <div
            aria-hidden
            className="animate-float-slow pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-300/30 to-transparent blur-3xl"
          />
          <div
            aria-hidden
            className="animate-float-slower pointer-events-none absolute -left-16 top-40 h-64 w-64 rounded-full bg-gradient-to-br from-verdant-200/30 to-transparent blur-3xl"
          />

          {loading ? (
            <p className="relative text-sm text-ink-light">Loading dashboard…</p>
          ) : error ? (
            <p className="relative rounded-md bg-clay-50 px-3 py-2 text-sm text-clay-500">{error}</p>
          ) : profile ? (
            <div className="relative">
              <div className="animate-fade-up rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 text-white shadow-card">
                <h1 className="font-display text-2xl font-semibold">
                  Welcome back, {profile.name}
                </h1>
                <p className="mt-1 text-sm text-indigo-100">
                  {profile.email} · {profile.discipline}
                </p>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Reveal>
                  <StatCard
                    icon={FileCheck2}
                    label="Documents uploaded"
                    value={profile.documents.length}
                    accent="indigo"
                  />
                </Reveal>
                <Reveal delay={80}>
                  <StatCard
                    icon={Sparkles}
                    label="Verified documents"
                    value={verifiedCount}
                    accent="verdant"
                  />
                </Reveal>
                <Reveal delay={160}>
                  <StatCard icon={User2} label="Skills" value={profile.skills.length} accent="amber" />
                </Reveal>
                <Reveal delay={240}>
                  <StatCard
                    icon={FolderKanban}
                    label="Projects"
                    value={profile.projects.length}
                    accent="clay"
                  />
                </Reveal>
              </div>

              <div className="mt-10">
                <h2 className="font-display text-base font-semibold text-ink">Quick links</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Reveal delay={0}>
                    <QuickLink href="/student/profile" label="Profile" body="View and manage your full profile." />
                  </Reveal>
                  <Reveal delay={60}>
                    <QuickLink href="/student/resume" label="Resume" body="See your verified, printable resume." />
                  </Reveal>
                  <Reveal delay={120}>
                    <QuickLink href="/student/uploads" label="Uploads" body="Add certificates, skills and projects." />
                  </Reveal>
                  <Reveal delay={180}>
                    <QuickLink href="/student/external" label="External profiles" body="Link GitHub, LinkedIn and LeetCode." />
                  </Reveal>
                </div>
              </div>

              <div className="mt-10">
                <h2 className="font-display text-base font-semibold text-ink">
                  Suggestions to improve your score
                </h2>
                <p className="mt-1 text-sm text-ink-light">
                  Based on your verified test scores, self-reported skills, and real projects.
                </p>

                {loadingRecs ? (
                  <p className="mt-4 text-sm text-ink-light">Loading suggestions…</p>
                ) : recommendations.length === 0 ? (
                  <Card className="mt-4">
                    <p className="text-sm text-ink-light">
                      Take an assessment or add a skill to get personalized suggestions here.
                    </p>
                  </Card>
                ) : (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {recommendations
                      .filter((r) => r.level !== "strong")
                      .slice(0, 4)
                      .map((r, i) => (
                        <Reveal key={r.language} delay={i * 70}>
                          <RecommendationCard recommendation={r} />
                        </Reveal>
                      ))}
                    {recommendations.every((r) => r.level === "strong") && (
                      <Card className="sm:col-span-2">
                        <p className="text-sm text-verdant-600">
                          You're doing well across the board — no urgent gaps right now.
                        </p>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}

const ACCENT_STYLES = {
  indigo: { text: "text-indigo-600", bg: "bg-indigo-50", icon: "text-indigo-500" },
  verdant: { text: "text-verdant-500", bg: "bg-verdant-50", icon: "text-verdant-500" },
  amber: { text: "text-amber-500", bg: "bg-amber-50", icon: "text-amber-500" },
  clay: { text: "text-clay-500", bg: "bg-clay-50", icon: "text-clay-500" },
} as const;

function StatCard({
  icon: Icon,
  label,
  value,
  accent = "indigo",
}: {
  icon: typeof FileCheck2;
  label: string;
  value: number;
  accent?: keyof typeof ACCENT_STYLES;
}) {
  const styles = ACCENT_STYLES[accent];
  return (
    <Card className="p-5">
      <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${styles.bg}`}>
        <Icon className={`h-4 w-4 ${styles.icon}`} />
      </div>
      <p className="mt-3 text-sm text-ink-light">{label}</p>
      <p className={`mt-1 font-display text-3xl font-bold ${styles.text}`}>{value}</p>
    </Card>
  );
}

function QuickLink({ href, label, body }: { href: string; label: string; body: string }) {
  return (
    <Link href={href}>
      <Card className="group h-full transition-all hover:-translate-y-1 hover:shadow-none hover:border-indigo-300">
        <div className="flex items-center justify-between">
          <p className="font-display text-sm font-semibold text-ink">{label}</p>
          <ArrowRight className="h-4 w-4 text-indigo-300 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
        </div>
        <p className="mt-1 text-sm text-ink-light">{body}</p>
      </Card>
    </Link>
  );
}

function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  const isLow = recommendation.level === "low";
  return (
    <Card className="transition-all hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <p className="font-display text-sm font-semibold text-ink">{recommendation.language}</p>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            isLow ? "bg-clay-50 text-clay-500" : "bg-amber-50 text-amber-500"
          }`}
        >
          {recommendation.percent}%
        </span>
      </div>
      <p className="mt-1.5 text-sm text-ink-light">{recommendation.message}</p>
      <ul className="mt-3 flex flex-col gap-1.5">
        {recommendation.suggested_actions.map((action, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-ink-light">
            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-indigo-400" />
            {action}
          </li>
        ))}
      </ul>
    </Card>
  );
}
