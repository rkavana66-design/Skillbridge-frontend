import { VerificationStatus } from "@/lib/types/resume";

interface VerificationBadgeProps {
  status: VerificationStatus;
}

const CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  verified: { label: "AI-VERIFIED", color: "#22C55E", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.35)" },
  pending: { label: "PENDING REVIEW", color: "#F59E0B", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.35)" },
  suspicious: { label: "SUSPICIOUS", color: "#FB923C", bg: "rgba(251,146,60,0.12)", border: "rgba(251,146,60,0.35)" },
  rejected: { label: "REJECTED", color: "#EF4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.35)" },
};

export default function VerificationBadge({ status }: VerificationBadgeProps) {
  const cfg = CONFIG[status] ?? {
    label: status.toUpperCase(),
    color: "#9FB3C8",
    bg: "rgba(159,179,200,0.12)",
    border: "rgba(159,179,200,0.35)",
  };

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide"
      style={{ color: cfg.color, backgroundColor: cfg.bg, borderColor: cfg.border }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
      {cfg.label}
    </span>
  );
}
