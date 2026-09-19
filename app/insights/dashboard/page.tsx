"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Navbar from "@/components/Navbar";
import Card from "@/components/ui/Card";
import { ApiError, getSkillDemand, SkillDemandResponse } from "@/lib/api";

const DISCIPLINES = ["IT", "Medical", "Commerce", "Arts", "Science"];

export default function SkillDemandDashboardPage() {
  const [data, setData] = useState<SkillDemandResponse | null>(null);
  const [discipline, setDiscipline] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discipline]);

  function load() {
    setLoading(true);
    setError("");
    getSkillDemand(discipline || undefined)
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load insights."))
      .finally(() => setLoading(false));
  }

  const chartData = (data?.top_skills ?? []).map((s) => ({
    name: s.skill,
    searches: s.search_count,
  }));

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-md border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs text-indigo-600">
          Public institutional dashboard — shows real, aggregated skill demand from recruiter
          searches on this platform. No individual candidate or recruiter data is shown here.
        </div>

        <h1 className="mt-6 font-display text-2xl font-semibold text-ink">
          Skill demand insights
        </h1>
        <p className="mt-1 text-sm text-ink-light">
          What recruiters are actually searching for, aggregated in real time — useful for
          institutions deciding what to teach next.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => setDiscipline("")}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              discipline === ""
                ? "border-indigo-300 bg-indigo-50 text-indigo-600"
                : "border-indigo-100 bg-white text-ink-light hover:border-indigo-200"
            }`}
          >
            All disciplines
          </button>
          {DISCIPLINES.map((d) => (
            <button
              key={d}
              onClick={() => setDiscipline(d)}
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

        {loading ? (
          <p className="mt-8 text-sm text-ink-light">Loading insights…</p>
        ) : error ? (
          <p className="mt-8 rounded-md bg-clay-50 px-3 py-2 text-sm text-clay-500">{error}</p>
        ) : (
          <div className="mt-6 flex flex-col gap-6">
            <Card>
              <p className="text-sm text-ink-light">Total recruiter searches logged</p>
              <p className="mt-2 font-display text-3xl font-bold text-indigo-600">
                {data?.total_searches ?? 0}
              </p>
            </Card>

            <Card title="Top skills recruiters are searching for">
              {chartData.length === 0 ? (
                <p className="text-sm text-ink-light">
                  No searches logged yet. Once recruiters search for candidates, real demand
                  trends will appear here.
                </p>
              ) : (
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EEF0FA" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={110}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        formatter={(value: number) => [`${value} search${value === 1 ? "" : "es"}`, "Demand"]}
                      />
                      <Bar dataKey="searches" fill="#2E3B8C" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
