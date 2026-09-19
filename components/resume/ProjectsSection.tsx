import { Github, ExternalLink } from "lucide-react";
import type { StudentProfile } from "@/lib/types/resume";

interface ProjectsSectionProps {
  profile: StudentProfile;
}

function parseTechStack(techStack?: string | null): string[] {
  if (!techStack) return [];
  return techStack
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

// Deterministic color per tech name so the same tech always renders the same
// chip color, without needing a brand-icon library. Purely presentational —
// no data is invented here, just how real tech names are displayed.
const CHIP_PALETTE = [
  "#4F7CFF", "#38BDF8", "#22C55E", "#F59E0B", "#FB923C", "#A78BFA", "#F472B6", "#2DD4BF",
];
function chipColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return CHIP_PALETTE[hash % CHIP_PALETTE.length];
}

export default function ProjectsSection({ profile }: ProjectsSectionProps) {
  const projects = profile.projects ?? [];
  if (projects.length === 0) return null;

  const seen = new Set<string>();
  const allTech: string[] = [];
  for (const project of projects) {
    for (const tech of parseTechStack(project.tech_stack)) {
      const key = tech.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        allTech.push(tech);
      }
    }
  }
  const toolChips = allTech.slice(0, 12);

  return (
    <div className="break-inside-avoid rounded-xl border border-[#1D3B52] bg-[#0A2033] p-6">
      <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-[#38BDF8]">Projects</h2>

      <div className="mt-4 flex flex-col gap-4">
        {projects.map((project) => (
          <div key={project.title} className="break-inside-avoid rounded-lg border border-[#1D3B52] bg-[#102A40] p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="text-sm font-semibold text-[#F8FAFC]">{project.title}</p>
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="no-print inline-flex items-center gap-1.5 rounded-md border border-[#1D3B52] bg-[#0A2033] px-2.5 py-1 text-xs font-medium text-[#F8FAFC] hover:border-[#4F7CFF]"
                >
                  <Github className="h-3.5 w-3.5" />
                  Code
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            {project.description && (
              <p className="mt-1.5 text-sm text-[#9FB3C8]">{project.description}</p>
            )}
            {parseTechStack(project.tech_stack).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {parseTechStack(project.tech_stack).map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-[#1D3B52] bg-[#0A2033] px-2.5 py-0.5 text-[11px] text-[#9FB3C8]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {toolChips.length > 0 && (
        <div className="mt-5 border-t border-[#1D3B52] pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[#9FB3C8]">
            Tools &amp; Technologies
          </h3>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {toolChips.map((tech) => {
              const color = chipColor(tech);
              return (
                <div
                  key={tech}
                  className="flex flex-col items-center gap-1.5 rounded-lg border border-[#1D3B52] bg-[#102A40] px-2 py-3 text-center"
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold text-white"
                    style={{ backgroundColor: color }}
                  >
                    {tech.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="text-[11px] leading-tight text-[#9FB3C8]">{tech}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
