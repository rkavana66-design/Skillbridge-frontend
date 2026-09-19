import type { StudentProfile } from "@/lib/types/resume";
import ResumeEmptyState from "./ResumeEmptyState";

interface SkillBarsProps {
  profile: StudentProfile;
}

function clamp(value: number): number {
  return Math.min(100, Math.max(0, value));
}

export default function SkillBars({ profile }: SkillBarsProps) {
  const languageScores = (profile.language_scores ?? [])
    .map((s) => ({
      name: s.language,
      percent: clamp(Number(s.percent)),
      testsTaken: s.tests_taken,
      sources: s.sources ?? (s.tests_taken > 0 ? ["test"] : []),
      testPercent: s.test_percent,
      skillPercent: s.skill_percent,
      projectCount: s.project_count ?? 0,
    }))
    .filter((s) => s.name && Number.isFinite(s.percent))
    .sort((a, b) => b.percent - a.percent);

  const skills = (profile.skills ?? [])
    .map((s) => ({ name: s.name, percent: clamp(Number(s.proficiency)) }))
    .filter((s) => s.name && Number.isFinite(s.percent))
    .sort((a, b) => b.percent - a.percent);

  const usingLanguageScores = languageScores.length > 0;

  function basisText(s: (typeof languageScores)[number]): string {
    const parts: string[] = [];
    if (s.sources.includes("test")) {
      parts.push(`Test: ${s.testPercent}% (${s.testsTaken} attempt${s.testsTaken === 1 ? "" : "s"})`);
    }
    if (s.sources.includes("skill")) {
      parts.push(`Self-rated: ${s.skillPercent}%`);
    }
    if (s.sources.includes("projects")) {
      parts.push(`${s.projectCount} project${s.projectCount === 1 ? "" : "s"}`);
    }
    return parts.length > 0 ? parts.join(" · ") : "No data";
  }

  if (!usingLanguageScores && skills.length === 0) {
    return (
      <div className="break-inside-avoid rounded-xl border border-[#1D3B52] bg-[#0A2033] p-6">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-[#38BDF8]">
          Technical Skills
        </h2>
        <div className="mt-4">
          <ResumeEmptyState
            title="No skills recorded"
            description="Add skills or complete an assessment to see them here."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="break-inside-avoid rounded-xl border border-[#1D3B52] bg-[#0A2033] p-6">
      <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-[#38BDF8]">
        Technical Skills
      </h2>
      <div className="mt-4 flex flex-col gap-4">
        {usingLanguageScores
          ? languageScores.map((s) => (
              <div key={s.name}>
                <div className="flex items-baseline justify-between">
                  <p className="text-sm font-medium text-[#F8FAFC]">{s.name}</p>
                  <p className="text-sm font-semibold text-[#38BDF8]">{s.percent}%</p>
                </div>
                <p className="mt-0.5 text-[11px] text-[#9FB3C8]">{basisText(s)}</p>
                <div
                  role="progressbar"
                  aria-valuenow={s.percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${s.name} verified assessment score`}
                  className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#102A40]"
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#4F7CFF] to-[#38BDF8]"
                    style={{ width: `${s.percent}%` }}
                  />
                </div>
              </div>
            ))
          : skills.map((s) => (
              <div key={s.name}>
                <div className="flex items-baseline justify-between">
                  <p className="text-sm font-medium text-[#F8FAFC]">{s.name}</p>
                  <p className="text-sm font-semibold text-[#38BDF8]">{s.percent}%</p>
                </div>
                <p className="mt-0.5 text-[11px] text-[#9FB3C8]">Self-reported skill level</p>
                <div
                  role="progressbar"
                  aria-valuenow={s.percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${s.name} self-reported skill level`}
                  className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#102A40]"
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#4F7CFF]/60 to-[#38BDF8]/60"
                    style={{ width: `${s.percent}%` }}
                  />
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
