import { GraduationCap, CalendarDays, TrendingUp, Target, BriefcaseBusiness } from "lucide-react";
import type { StudentProfile } from "@/lib/types/resume";

interface EducationCardProps {
  profile: StudentProfile;
}

export default function EducationCard({ profile }: EducationCardProps) {
  const rows: { icon: typeof GraduationCap; label: string; value: string }[] = [];

  if (profile.college) rows.push({ icon: GraduationCap, label: "College", value: profile.college });
  if (profile.degree) rows.push({ icon: GraduationCap, label: "Degree", value: profile.degree });
  if (profile.graduation_year) rows.push({ icon: CalendarDays, label: "Graduation Year", value: String(profile.graduation_year) });
  if (profile.cgpa !== undefined && profile.cgpa !== null && profile.cgpa !== "")
    rows.push({ icon: TrendingUp, label: "CGPA", value: String(profile.cgpa) });
  if (profile.career_goal) rows.push({ icon: Target, label: "Career Goal", value: profile.career_goal });
  if (profile.work_preference) rows.push({ icon: BriefcaseBusiness, label: "Work Preference", value: profile.work_preference });

  if (rows.length === 0) return null;

  return (
    <div className="break-inside-avoid rounded-xl border border-[#1D3B52] bg-[#0A2033] p-6">
      <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-[#38BDF8]">Education</h2>
      <div className="mt-4 flex flex-col gap-3">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-3">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#4F7CFF]" />
            <div>
              <p className="text-[11px] uppercase tracking-wide text-[#9FB3C8]">{label}</p>
              <p className="text-sm text-[#F8FAFC]">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
