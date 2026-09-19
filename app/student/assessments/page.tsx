"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { getAuth } from "@/lib/auth";
import { ApiError, listTests, TestListItem } from "@/lib/api";

const DISCIPLINES = ["IT", "Medical", "Commerce", "Arts", "Science"];

export default function AssessmentsPage() {
  const router = useRouter();
  const [tests, setTests] = useState<TestListItem[]>([]);
  const [discipline, setDiscipline] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function loadTests(filter?: string) {
    setLoading(true);
    setError("");
    listTests(filter || undefined)
      .then(setTests)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load tests."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const { token, user } = getAuth();
    if (!token || user?.role !== "student") {
      router.push("/login");
      return;
    }
    loadTests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  function handleFilter(d: string) {
    const next = d === discipline ? "" : d;
    setDiscipline(next);
    loadTests(next);
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="flex">
        <Sidebar role="student" />
        <main className="flex-1 px-8 py-8">
          <h1 className="font-display text-2xl font-semibold text-ink">Skill assessments</h1>
          <p className="mt-1 text-sm text-ink-light">
            Take a timed test in any language or domain. Your best score becomes your verified
            skill percentage on your resume.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {DISCIPLINES.map((d) => (
              <button
                key={d}
                onClick={() => handleFilter(d)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  discipline === d
                    ? "border-indigo-300 bg-indigo-50 text-indigo-600"
                    : "border-indigo-100 bg-white text-ink-light hover:border-indigo-200"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="mt-6 max-w-3xl">
            {loading ? (
              <p className="text-sm text-ink-light">Loading tests…</p>
            ) : error ? (
              <p className="rounded-md bg-clay-50 px-3 py-2 text-sm text-clay-500">{error}</p>
            ) : tests.length === 0 ? (
              <p className="text-sm text-ink-light">No tests available right now.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {tests.map((test) => (
                  <Card key={test.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-display text-sm font-semibold text-ink">{test.title}</p>
                      <p className="mt-0.5 text-xs text-ink-light">
                        {test.discipline}
                        {test.subcategory ? ` · ${test.subcategory}` : test.topic ? ` · ${test.topic}` : ""}
                        {` · ${test.duration_minutes} min`}
                      </p>
                    </div>
                    <Link href={`/student/assessments/${test.id}`}>
                      <Button>Start test</Button>
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
