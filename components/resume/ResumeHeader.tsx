import { Mail, Phone, MapPin, Github, Linkedin, Code2, Globe, ShieldCheck } from "lucide-react";
import type { StudentProfile } from "@/lib/types/resume";

interface ResumeHeaderProps {
  profile: StudentProfile;
  email?: string | null;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ResumeHeader({ profile, email }: ResumeHeaderProps) {
  const hasVerifiedDoc = (profile.documents ?? []).some((d) => d.verification_status === "verified");
  const hasLanguageScores = (profile.language_scores ?? []).length > 0;
  const showVerifiedBadge = hasVerifiedDoc || hasLanguageScores;
  const contactEmail = profile.email || email;

  const links: { label: string; href: string; icon: typeof Github }[] = [];
  if (profile.github_url) links.push({ label: "GitHub", href: profile.github_url, icon: Github });
  if (profile.linkedin_url) links.push({ label: "LinkedIn", href: profile.linkedin_url, icon: Linkedin });
  if (profile.leetcode_url) links.push({ label: "LeetCode", href: profile.leetcode_url, icon: Code2 });
  if (profile.portfolio_url) links.push({ label: "Portfolio", href: profile.portfolio_url, icon: Globe });

  return (
    <div className="break-inside-avoid rounded-xl border border-[#1D3B52] bg-[#0A2033] p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#1D3B52] bg-gradient-to-br from-[#102A40] to-[#0A2033] shadow-lg">
          {profile.profile_photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.profile_photo_url} alt={profile.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-3xl font-bold text-[#38BDF8]">{initials(profile.name)}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl font-bold tracking-tight text-[#F8FAFC]">{profile.name}</h1>
            {showVerifiedBadge && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[#22C55E]/35 bg-[#22C55E]/10 px-2.5 py-1 text-[11px] font-semibold text-[#22C55E]">
                <ShieldCheck className="h-3 w-3" />
                AI-Verified Profile
              </span>
            )}
          </div>

          {profile.discipline && (
            <p className="mt-1.5 text-sm font-semibold uppercase tracking-wide text-[#38BDF8]">
              {profile.discipline}
            </p>
          )}
          {profile.degree && <p className="mt-0.5 text-sm text-[#9FB3C8]">{profile.degree}</p>}
          {profile.summary && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#9FB3C8]">{profile.summary}</p>}

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#9FB3C8]">
            {contactEmail && (
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> {contactEmail}
              </span>
            )}
            {profile.phone && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> {profile.phone}
              </span>
            )}
            {profile.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> {profile.location}
              </span>
            )}
          </div>

          {links.length > 0 && (
            <div className="no-print mt-4 flex flex-wrap gap-2">
              {links.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#1D3B52] bg-[#102A40] px-3 py-1.5 text-xs font-medium text-[#F8FAFC] hover:border-[#4F7CFF]"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
