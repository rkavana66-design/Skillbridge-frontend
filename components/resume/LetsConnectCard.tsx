import { Github, Code2, Linkedin, Globe, Mail, ScanLine } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { StudentProfile } from "@/lib/types/resume";

interface LetsConnectCardProps {
  profile: StudentProfile;
  email?: string | null;
  origin: string;
}

export default function LetsConnectCard({ profile, email, origin }: LetsConnectCardProps) {
  const contactEmail = profile.email || email;

  const links: { label: string; href: string; icon: typeof Github }[] = [];
  if (profile.linkedin_url) links.push({ label: profile.linkedin_url.replace(/^https?:\/\//, ""), href: profile.linkedin_url, icon: Linkedin });
  if (profile.github_url) links.push({ label: profile.github_url.replace(/^https?:\/\//, ""), href: profile.github_url, icon: Github });
  if (profile.leetcode_url) links.push({ label: profile.leetcode_url.replace(/^https?:\/\//, ""), href: profile.leetcode_url, icon: Code2 });
  if (profile.portfolio_url) links.push({ label: profile.portfolio_url.replace(/^https?:\/\//, ""), href: profile.portfolio_url, icon: Globe });
  if (contactEmail) links.push({ label: contactEmail, href: `mailto:${contactEmail}`, icon: Mail });

  if (links.length === 0 && !origin) return null;

  return (
    <div className="break-inside-avoid rounded-xl border border-[#1D3B52] bg-[#0A2033] p-6">
      <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-[#38BDF8]">
        Let&apos;s Connect
      </h2>

      <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        {links.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {links.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noreferrer"
                className="no-print inline-flex items-center gap-2 text-xs text-[#9FB3C8] hover:text-[#38BDF8]"
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-[#4F7CFF]" />
                <span className="break-all">{label}</span>
              </a>
            ))}
          </div>
        )}

        {origin && (
          <div className="flex shrink-0 flex-col items-center gap-2 self-center">
            <div className="rounded-lg bg-white p-2.5">
              <QRCodeSVG value={`${origin}/verify-profile/${profile.id}`} size={96} />
            </div>
            <p className="inline-flex items-center gap-1 text-[10px] text-[#9FB3C8]">
              <ScanLine className="h-3 w-3" /> Scan to verify
            </p>
          </div>
        )}
      </div>
      <p className="mt-4 border-t border-[#1D3B52] pt-3 text-[11px] text-[#9FB3C8]">
        Public page shows verified information only.
      </p>
    </div>
  );
}
