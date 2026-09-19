import { FileText, QrCode, ShieldQuestion } from "lucide-react";
import type { StudentProfile } from "@/lib/types/resume";
import VerificationBadge from "./VerificationBadge";
import ResumeEmptyState from "./ResumeEmptyState";

interface CertificatesSectionProps {
  profile: StudentProfile;
}

export default function CertificatesSection({ profile }: CertificatesSectionProps) {
  const documents = profile.documents ?? [];
  const certifications = profile.certifications ?? [];

  if (documents.length === 0 && certifications.length === 0) return null;

  return (
    <div className="break-inside-avoid rounded-xl border border-[#1D3B52] bg-[#0A2033] p-6">
      <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-[#38BDF8]">
        Certificates
      </h2>

      {documents.length === 0 ? (
        <div className="mt-4">
          <ResumeEmptyState title="No documents uploaded" description="Upload a certificate to have it verified." />
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {documents.map((doc) => {
            const details = doc.verification_details;
            return (
              <div
                key={doc.id}
                className="break-inside-avoid rounded-lg border border-[#1D3B52] bg-[#102A40] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[#4F7CFF]" />
                    <div>
                      <p className="text-sm font-medium text-[#F8FAFC]">
                        {doc.original_filename || "Untitled document"}
                      </p>
                      <p className="text-xs capitalize text-[#9FB3C8]">{doc.type}</p>
                    </div>
                  </div>
                  <VerificationBadge status={doc.verification_status} />
                </div>

                {details && (
                  <div className="mt-3 flex flex-col gap-1.5 border-t border-[#1D3B52] pt-3 text-xs text-[#9FB3C8]">
                    <span className="inline-flex items-center gap-1.5">
                      <QrCode className="h-3.5 w-3.5" />
                      {details.qr_found ? "QR code found" : "QR code not found"}
                      {details.qr_found && details.qr_domain && (
                        <span className={details.domain_trusted ? "text-[#22C55E]" : "text-[#FB923C]"}>
                          · {details.qr_domain} {details.domain_trusted ? "(trusted issuer)" : "(unrecognized)"}
                        </span>
                      )}
                    </span>
                    {details.notes && (
                      <span className="inline-flex items-start gap-1.5">
                        <ShieldQuestion className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        {details.notes}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {certifications.length > 0 && (
        <div className="mt-5 border-t border-[#1D3B52] pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[#9FB3C8]">Certifications</h3>
          <div className="mt-2 flex flex-col gap-2">
            {certifications.map((cert) => (
              <div key={cert.name} className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#F8FAFC]">{cert.name}</p>
                  {cert.issuer && <p className="text-xs text-[#9FB3C8]">{cert.issuer}</p>}
                </div>
                {cert.verification_status && <VerificationBadge status={cert.verification_status} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
