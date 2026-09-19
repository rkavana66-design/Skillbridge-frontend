import { Trophy } from "lucide-react";
import type { StudentProfile } from "@/lib/types/resume";

interface AchievementsSectionProps {
  profile: StudentProfile;
}

export default function AchievementsSection({ profile }: AchievementsSectionProps) {
  const achievements = profile.achievements ?? [];
  if (achievements.length === 0) return null;

  return (
    <div className="break-inside-avoid rounded-xl border border-[#1D3B52] bg-[#0A2033] p-6">
      <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-[#38BDF8]">
        Achievements
      </h2>
      <ul className="mt-4 flex flex-col gap-2.5">
        {achievements.map((achievement, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-[#F8FAFC]">
            <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-[#F59E0B]" />
            {achievement}
          </li>
        ))}
      </ul>
    </div>
  );
}
