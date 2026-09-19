"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { AuthUser, getAuth } from "@/lib/auth";
import { ApiError, getUpcomingInterviews, Interview } from "@/lib/api";

export default function RecruiterDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [query, setQuery] = useState("");
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loadingInterviews, setLoadingInterviews] = useState(true);
  const [interviewsError, setInterviewsError] = useState("");

  useEffect(() => {
    const { token, user } = getAuth();
    if (!token || user?.role !== "recruiter") {
      router.push("/login");
      return;
    }
    setUser(user);

    getUpcomingInterviews()
      .then(setInterviews)
      .catch((err) =>
        setInterviewsError(err instanceof ApiError ? err.message : "Could not load interviews.")
      )
      .finally(() => setLoadingInterviews(false));
  }, [router]);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    router.push(`/recruiter/search${query ? `?q=${encodeURIComponent(query)}` : ""}`);
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="flex">
        <Sidebar role="recruiter" />
        <main className="flex-1 px-8 py-8">
          <h1 className="font-display text-2xl font-semibold text-ink">Welcome, {user.name}</h1>
          <p className="mt-1 text-sm text-ink-light">
            {user.email} · Recruiter
          </p>

          <div className="mt-8 grid max-w-3xl gap-6">
            <Card title="Find candidates">
              <form onSubmit={handleSearch} className="flex gap-3">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by skill, discipline or college…"
                  className="flex-1"
                />
                <Button type="submit">Search</Button>
              </form>
            </Card>

            <Card title="Upcoming interviews" subtitle="Interviews you've booked with candidates">
              {loadingInterviews ? (
                <p className="text-sm text-ink-light">Loading…</p>
              ) : interviewsError ? (
                <p className="text-sm text-clay-500">{interviewsError}</p>
              ) : interviews.length === 0 ? (
                <p className="text-sm text-ink-light">
                  No interviews booked yet. Search candidates and book one from their resume.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {interviews.map((interview) => (
                    <div
                      key={interview.id}
                      className="flex items-center justify-between rounded-md border border-indigo-50 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-ink">{interview.student_name}</p>
                        <p className="text-xs text-ink-light">
                          {new Date(interview.scheduled_at).toLocaleString()} ·{" "}
                          {interview.duration_minutes} min · {interview.mode}
                        </p>
                        {interview.location_or_link && (
                          <p className="mt-0.5 text-xs text-indigo-500">{interview.location_or_link}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
