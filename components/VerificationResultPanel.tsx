import { CheckCircle2, XCircle, AlertTriangle, QrCode, User, ShieldAlert, FileWarning } from "lucide-react";
import type { VerificationStatus, VerificationDetails } from "@/lib/api";

const STATUS_STYLE: Record<VerificationStatus, { label: string; ring: string; glow: string; icon: typeof CheckCircle2 }> = {
  verified: { label: "Verified", ring: "border-verdant-400/40", glow: "shadow-[0_0_40px_-8px_rgba(16,185,129,0.35)]", icon: CheckCircle2 },
  suspicious: { label: "Suspicious", ring: "border-amber-400/40", glow: "shadow-[0_0_40px_-8px_rgba(217,119,6,0.35)]", icon: AlertTriangle },
  rejected: { label: "Rejected", ring: "border-clay-400/40", glow: "shadow-[0_0_40px_-8px_rgba(239,68,68,0.35)]", icon: XCircle },
  pending: { label: "Pending review", ring: "border-indigo-400/40", glow: "shadow-[0_0_40px_-8px_rgba(99,102,241,0.35)]", icon: FileWarning },
};

function SignalRow({
  ok,
  label,
  value,
}: {
  ok: boolean | null;
  label: string;
  value: string;
}) {
  const color = ok === null ? "text-ink-light" : ok ? "text-verdant-400" : "text-clay-400";
  const Icon = ok === null ? AlertTriangle : ok ? CheckCircle2 : XCircle;
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3.5 py-2.5">
      <Icon className={`h-4 w-4 shrink-0 ${color}`} />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-ink-light">{label}</p>
        <p className="truncate text-sm text-ink">{value}</p>
      </div>
    </div>
  );
}

export default function VerificationResultPanel({
  status,
  details,
}: {
  status: VerificationStatus;
  details?: VerificationDetails;
}) {
  const style = STATUS_STYLE[status];
  const StatusIcon = style.icon;

  return (
    <div
      className={`rounded-2xl border ${style.ring} ${style.glow} bg-slate-900/40 backdrop-blur-xl p-5 transition-all duration-500`}
    >
      <div className="flex items-center gap-3">
        <StatusIcon className="h-6 w-6 text-ink" />
        <div>
          <p className="font-display text-base font-semibold text-ink">{style.label}</p>
          {details?.notes && <p className="text-xs text-ink-light">{details.notes}</p>}
        </div>
      </div>

      {details && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <SignalRow
            ok={details.qr_found}
            label="QR code"
            value={details.qr_found ? "Found on document" : "Not detected"}
          />
          {details.qr_found && (
            <SignalRow
              ok={details.domain_trusted}
              label="Issuer domain"
              value={details.qr_domain ?? "Unknown"}
            />
          )}
          {details.qr_name && (
            <SignalRow
              ok={details.name_match}
              label="Name on certificate"
              value={details.qr_name}
            />
          )}
          {details.ocr_issuer_found && (
            <SignalRow ok={true} label="Recognized issuer (text)" value={details.ocr_issuer_found} />
          )}
          {details.tamper_signals?.exif_software && (
            <SignalRow
              ok={false}
              label="Editing software detected"
              value={details.tamper_signals.exif_software}
            />
          )}
        </div>
      )}
    </div>
  );
}
