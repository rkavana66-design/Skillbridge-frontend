import { StudentProfile } from "@/lib/api";

export default function ResumeDocument({ profile }: { profile: StudentProfile }) {
  const verifiedDocs = profile.documents.filter((d) => d.verification_status === "verified");
  const otherDocs = profile.documents.filter((d) => d.verification_status !== "verified");

  return (
    <div className="rounded-lg border border-indigo-100 bg-white p-10 shadow-card print:border-0 print:shadow-none">
      <header className="border-b border-indigo-100 pb-6">
        <h1 className="font-display text-3xl font-bold text-ink">{profile.name}</h1>
        <p className="mt-1 text-sm font-medium text-indigo-600">{profile.discipline}</p>
        <p className="mt-2 text-sm text-ink-light">{profile.email}</p>
      </header>

      <Section title="Education">
        <p className="text-sm text-ink">
          {profile.college ?? "College not specified"}
          {profile.year ? ` · Year ${profile.year}` : ""}
          {profile.cgpa ? ` · CGPA ${profile.cgpa}` : ""}
        </p>
      </Section>

      <Section title="Skills">
        {profile.skills.length === 0 ? (
          <p className="text-sm text-ink-light">No skills listed.</p>
        ) : (
          <ul className="flex flex-wrap gap-x-2 gap-y-1 text-sm text-ink">
            {profile.skills.map((skill, i) => (
              <li key={skill.name}>
                {skill.name}
                {i < profile.skills.length - 1 ? " ·" : ""}
              </li>
            ))}
          </ul>
        )}
      </Section>

      {profile.language_scores && profile.language_scores.length > 0 && (
        <Section title="Verified skill scores">
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink">
            {profile.language_scores.map((s) => (
              <li key={s.language}>
                {s.language} – <span className="font-semibold text-indigo-600">{s.percent}%</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Projects">
        {profile.projects.length === 0 ? (
          <p className="text-sm text-ink-light">No projects listed.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {profile.projects.map((project) => (
              <div key={project.title}>
                <div className="flex items-baseline justify-between">
                  <p className="text-sm font-semibold text-ink">{project.title}</p>
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-indigo-500 hover:underline"
                    >
                      Repository
                    </a>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-ink-light">{project.description}</p>
                <p className="mt-1 text-xs text-indigo-500">{project.tech_stack}</p>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Certificates">
        {verifiedDocs.length === 0 ? (
          <p className="text-sm text-ink-light">No AI-verified certificates yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {verifiedDocs.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between">
                <span className="text-sm capitalize text-ink">{doc.type}</span>
                <span className="rounded-full bg-verdant-50 px-2.5 py-0.5 text-xs font-medium text-verdant-600">
                  AI-verified
                </span>
              </li>
            ))}
          </ul>
        )}
        {otherDocs.length > 0 && (
          <p className="mt-3 text-xs text-ink-light">
            {otherDocs.length} additional document{otherDocs.length > 1 ? "s" : ""} pending or unverified.
          </p>
        )}
      </Section>

      <Section title="External profiles">
        <ul className="flex flex-col gap-1.5 text-sm text-ink">
          {profile.github_url && (
            <li>
              GitHub — {profile.github_url}
              {profile.github_username && (
                <span className="ml-1 text-verdant-600">(verified @{profile.github_username})</span>
              )}
            </li>
          )}
          {profile.linkedin_url && <li>LinkedIn — {profile.linkedin_url}</li>}
          {profile.leetcode_url && (
            <li>
              LeetCode — {profile.leetcode_url}
              {profile.leetcode_username && (
                <span className="ml-1 text-verdant-600">
                  (verified {profile.leetcode_username}
                  {profile.leetcode_rating ? `, rating ${profile.leetcode_rating}` : ""})
                </span>
              )}
            </li>
          )}
          {!profile.github_url && !profile.linkedin_url && !profile.leetcode_url && (
            <li className="text-ink-light">No external profiles linked.</li>
          )}
        </ul>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-indigo-500">
        {title}
      </h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}
