import type { StudentProfile } from "@/lib/types/resume";

interface LanguagesSectionProps {
  profile: StudentProfile;
}

export default function LanguagesSection({ profile }: LanguagesSectionProps) {
  const languages = profile.languages ?? [];
  if (languages.length === 0) return null;

  return (
    <div className="break-inside-avoid rounded-xl border border-[#1D3B52] bg-[#0A2033] p-6">
      <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-[#38BDF8]">
        Spoken Languages
      </h2>
      <div className="mt-4 flex flex-col gap-2">
        {languages.map((lang) => (
          <div key={lang.name} className="flex items-center justify-between text-sm">
            <span className="text-[#F8FAFC]">{lang.name}</span>
            {lang.proficiency && <span className="text-[#9FB3C8]">{lang.proficiency}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
