import { VerificationStatus } from "@/lib/api";

interface VerificationBadgeProps {
  status: VerificationStatus;
  className?: string;
}

const config: Record<VerificationStatus, { label: string; classes: string; dot: string }> = {
  verified: {
    label: "Verified",
    classes: "bg-verdant-50 text-verdant-600 border-verdant-100",
    dot: "bg-verdant-500",
  },
  suspicious: {
    label: "Suspicious",
    classes: "bg-amber-50 text-amber-500 border-amber-100",
    dot: "bg-amber-400",
  },
  rejected: {
    label: "Rejected",
    classes: "bg-clay-50 text-clay-500 border-clay-100",
    dot: "bg-clay-400",
  },
  pending: {
    label: "Pending review",
    classes: "bg-indigo-50 text-indigo-500 border-indigo-100",
    dot: "bg-indigo-300",
  },
};

export default function VerificationBadge({ status, className = "" }: VerificationBadgeProps) {
  const c = config[status] ?? config.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${c.classes} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
