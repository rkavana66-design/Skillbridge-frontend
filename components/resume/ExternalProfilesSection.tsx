import { Github, Code2, Linkedin, Globe, ShieldCheck } from "lucide-react";
import type { StudentProfile } from "@/lib/types/resume";

interface ExternalProfilesSectionProps {
  profile: StudentProfile;
}

function StatusLabel({ verified }: { verified: boolean }) {
  return verified ? (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#22C55E]">
      <ShieldCheck className="h-3 w-3" /> Verified
    </span>
  ) : (
    <span className="text-[11px] font-medium text-[#9FB3C8]">Self-reported</span>
  );
}

export default function ExternalProfilesSection({ profile }: ExternalProfilesSectionProps) {
  const cards: JSX.Element[] = [];

  if (profile.github_url) {
    cards.push(
      <div key="github" className="rounded-lg border border-[#1D3B52] bg-[#102A40] p-4">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-[#F8FAFC]">
            <Github className="h-4 w-4 text-[#4F7CFF]" /> GitHub
          </span>
          <StatusLabel verified={profile.github_verified === true} />
        </div>
        <div className="mt-1.5 text-xs text-[#9FB3C8]">
          {profile.github_username && <span>@{profile.github_username}</span>}
          {profile.github_public_repos !== undefined && profile.github_public_repos !== null && (
            <span> · {profile.github_public_repos} public repos</span>
          )}
        </div>
        <a
          href={profile.github_url}
          target="_blank"
          rel="noreferrer"
          className="no-print mt-3 inline-block rounded-md border border-[#1D3B52] bg-[#0A2033] px-3 py-1.5 text-xs font-medium text-[#F8FAFC] hover:border-[#4F7CFF]"
        >
          View profile
        </a>
      </div>
    );
  }

  if (profile.leetcode_url) {
    cards.push(
      <div key="leetcode" className="rounded-lg border border-[#1D3B52] bg-[#102A40] p-4">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-[#F8FAFC]">
            <Code2 className="h-4 w-4 text-[#4F7CFF]" /> LeetCode
          </span>
          <StatusLabel verified={profile.leetcode_verified === true} />
        </div>
        <div className="mt-1.5 text-xs text-[#9FB3C8]">
          {profile.leetcode_username && <span>{profile.leetcode_username}</span>}
          {profile.leetcode_rating !== undefined && profile.leetcode_rating !== null && profile.leetcode_rating !== "" && (
            <span> · Rating {profile.leetcode_rating}</span>
          )}
        </div>
        <a
          href={profile.leetcode_url}
          target="_blank"
          rel="noreferrer"
          className="no-print mt-3 inline-block rounded-md border border-[#1D3B52] bg-[#0A2033] px-3 py-1.5 text-xs font-medium text-[#F8FAFC] hover:border-[#4F7CFF]"
        >
          View profile
        </a>
      </div>
    );
  }

  if (profile.linkedin_url) {
    const verified = profile.linkedin_verified === true || profile.linkedin_verified === "verified";
    cards.push(
      <div key="linkedin" className="rounded-lg border border-[#1D3B52] bg-[#102A40] p-4">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-[#F8FAFC]">
            <Linkedin className="h-4 w-4 text-[#4F7CFF]" /> LinkedIn
          </span>
          <StatusLabel verified={verified} />
        </div>
        <a
          href={profile.linkedin_url}
          target="_blank"
          rel="noreferrer"
          className="no-print mt-3 inline-block rounded-md border border-[#1D3B52] bg-[#0A2033] px-3 py-1.5 text-xs font-medium text-[#F8FAFC] hover:border-[#4F7CFF]"
        >
          View profile
        </a>
      </div>
    );
  }

  if (profile.portfolio_url) {
    cards.push(
      <div key="portfolio" className="rounded-lg border border-[#1D3B52] bg-[#102A40] p-4">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-[#F8FAFC]">
            <Globe className="h-4 w-4 text-[#4F7CFF]" /> Portfolio
          </span>
          <StatusLabel verified={false} />
        </div>
        <a
          href={profile.portfolio_url}
          target="_blank"
          rel="noreferrer"
          className="no-print mt-3 inline-block rounded-md border border-[#1D3B52] bg-[#0A2033] px-3 py-1.5 text-xs font-medium text-[#F8FAFC] hover:border-[#4F7CFF]"
        >
          Visit site
        </a>
      </div>
    );
  }

  if (cards.length === 0) return null;

  return (
    <div className="break-inside-avoid rounded-xl border border-[#1D3B52] bg-[#0A2033] p-6">
      <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-[#38BDF8]">
        External Profiles
      </h2>
      <div className="mt-4 flex flex-col gap-3">{cards}</div>
    </div>
  );
}
