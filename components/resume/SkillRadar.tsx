"use client";

import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts";
import type { StudentProfile } from "@/lib/types/resume";
import ResumeEmptyState from "./ResumeEmptyState";

interface SkillRadarProps {
  profile: StudentProfile;
}

interface RadarPoint {
  skill: string;
  score: number;
}

function clamp(value: number): number {
  return Math.min(100, Math.max(0, value));
}

function buildFromLanguageScores(profile: StudentProfile): RadarPoint[] {
  return (profile.language_scores ?? [])
    .map((s) => ({ skill: s.language, score: Number(s.percent) }))
    .filter((p) => p.skill && Number.isFinite(p.score))
    .map((p) => ({ skill: p.skill, score: clamp(p.score) }));
}

function buildFromSkills(profile: StudentProfile): RadarPoint[] {
  return (profile.skills ?? [])
    .map((s) => ({ skill: s.name, score: Number(s.proficiency) }))
    .filter((p) => p.skill && Number.isFinite(p.score))
    .map((p) => ({ skill: p.skill, score: clamp(p.score) }));
}

export default function SkillRadar({ profile }: SkillRadarProps) {
  const fromLanguageScores = buildFromLanguageScores(profile);
  const usingVerified = fromLanguageScores.length > 0;
  const data = (usingVerified ? fromLanguageScores : buildFromSkills(profile))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  return (
    <div className="break-inside-avoid rounded-xl border border-[#1D3B52] bg-[#0A2033] p-6">
      <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-[#38BDF8]">
        Skills Overview
      </h2>

      {data.length === 0 ? (
        <div className="mt-4">
          <ResumeEmptyState
            title="No skill data yet"
            description="Complete verified assessments to generate your skill overview."
          />
        </div>
      ) : (
        <>
          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data} outerRadius="75%">
                <PolarGrid stroke="#1D3B52" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: "#9FB3C8", fontSize: 11 }} />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: "#9FB3C8", fontSize: 10 }}
                  stroke="#1D3B52"
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#38BDF8"
                  fill="#4F7CFF"
                  fillOpacity={0.35}
                />
                <Tooltip
                  formatter={(value: number, _name, item) => [`${value}%`, item.payload.skill]}
                  labelFormatter={() => ""}
                  contentStyle={{
                    backgroundColor: "#102A40",
                    border: "1px solid #1D3B52",
                    borderRadius: 8,
                    color: "#F8FAFC",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-center text-xs text-[#9FB3C8]">
            {usingVerified
              ? "Based on verified assessment percentages."
              : "Based on self-reported skill levels."}
          </p>
        </>
      )}
    </div>
  );
}
