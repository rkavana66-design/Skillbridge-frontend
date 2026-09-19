"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { getAuth } from "@/lib/auth";
import { ApiError, CandidateSummary, searchCandidates } from "@/lib/api";

const DISCIPLINES = ["IT", "Medical", "Commerce", "Arts", "Science"];

export default function RecruiterSearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper" />}>
      <RecruiterSearchContent />
    </Suspense>
  );
}

function RecruiterSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [discipline, setDiscipline] = useState("");
  const [candidates, setCandidates] = useState<CandidateSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const { token, user } = getAuth();
    if (!token || user?.role !== "recruiter") {
      router.push("/login");
      return;
    }
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function runSearch() {
    setLoading(true);
    setSearched(true);
    setError("");
    try {
      const results = await searchCandidates({
        q: query || undefined,
        discipline: discipline || undefined,
      });
      setCandidates(results);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not search candidates.");
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    runSearch();
  }

  function handleDisciplineClick(d: string) {
    const next = d === discipline ? "" : d;
    setDiscipline(next);
  }

  useEffect(() => {
    if (searched) runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discipline]);

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="flex">
        <Sidebar role="recruiter" />
        <main className="flex-1 px-8 py-8">
          <h1 className="font-display text-2xl font-semibold text-ink">Search candidates</h1>

          <Card className="mt-6 max-w-3xl">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or skill…"
                className="flex-1"
              />
              <Button type="submit" loading={loading}>
                Search
              </Button>
            </form>
            <div className="mt-3 flex flex-wrap gap-2">
              {DISCIPLINES.map((d) => (
                <button
                  key={d}
                  onClick={() => handleDisciplineClick(d)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    discipline === d
                      ? "border-indigo-300 bg-indigo-50 text-indigo-600"
                      : "border-indigo-100 bg-white text-ink-light hover:border-indigo-200"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </Card>

          <div className="mt-6 max-w-3xl">
            {loading ? (
              <p className="text-sm text-ink-light">Searching…</p>
            ) : error ? (
              <p className="rounded-md bg-clay-50 px-3 py-2 text-sm text-clay-500">{error}</p>
            ) : searched && candidates.length === 0 ? (
              <p className="text-sm text-ink-light">No candidates matched your search.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {candidates.map((c) => (
                  <Link key={c.id} href={`/recruiter/candidate/${c.id}`}>
                    <Card className="transition-shadow hover:shadow-none hover:border-indigo-300">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-display text-sm font-semibold text-ink">{c.name}</p>
                          <p className="mt-0.5 text-xs text-ink-light">
                            {c.discipline ?? "Discipline not listed"}
                            {c.verified_documents_count > 0 &&
                              ` · ${c.verified_documents_count} verified document${
                                c.verified_documents_count > 1 ? "s" : ""
                              }`}
                          </p>
                        </div>
                      </div>
                      {c.top_skills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {c.top_skills.map((s) => (
                            <span
                              key={s.language}
                              className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600"
                            >
                              {s.language} · {s.percent}%
                            </span>
                          ))}
                        </div>
                      )}
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
