"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { getAuth } from "@/lib/auth";
import {
  ApiError,
  AdminDocumentListItem,
  getAdminDocuments,
  manualVerifyDocument,
} from "@/lib/api";

const STATUS_STYLE: Record<string, string> = {
  verified: "bg-verdant-50 text-verdant-600",
  suspicious: "bg-amber-50 text-amber-500",
  rejected: "bg-clay-50 text-clay-500",
  pending: "bg-indigo-50 text-indigo-600",
};

export default function AdminReviewPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [documents, setDocuments] = useState<AdminDocumentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actingOn, setActingOn] = useState<string | null>(null);

  useEffect(() => {
    const { token, user } = getAuth();
    if (!token || user?.role !== "admin") {
      router.push("/login");
      return;
    }
    setReady(true);
  }, [router]);

  useEffect(() => {
    if (!ready) return;
    loadDocuments();
  }, [ready]);

  async function loadDocuments() {
    setLoading(true);
    setError("");
    try {
      const docs = await getAdminDocuments();
      setDocuments(docs);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load documents.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDecision(documentId: string, status: "verified" | "rejected") {
    setActingOn(documentId);
    try {
      await manualVerifyDocument(documentId, status, `Manually ${status} by admin`);
      await loadDocuments();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update document.");
    } finally {
      setActingOn(null);
    }
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <main className="px-8 py-8">
          <p className="text-sm text-ink-light">Loading…</p>
        </main>
      </div>
    );
  }

  const needsReview = documents.filter(
    (d) => d.verification_status === "suspicious" || d.verification_status === "pending"
  );
  const alreadyDecided = documents.filter(
    (d) => d.verification_status === "verified" || d.verification_status === "rejected"
  );

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="mx-auto max-w-4xl px-8 py-8">
        <h1 className="font-display text-2xl font-semibold text-ink">Document review</h1>
        <p className="mt-1 text-sm text-ink-light">
          Certificates the automated system couldn't confidently verify — mostly photos and
          scanned documents. Open each file, look at it, and approve or reject.
        </p>

        {error && (
          <p className="mt-4 rounded-md bg-clay-50 px-3 py-2 text-sm text-clay-500">{error}</p>
        )}

        {loading ? (
          <p className="mt-6 text-sm text-ink-light">Loading documents…</p>
        ) : (
          <>
            <h2 className="mt-8 font-display text-base font-semibold text-ink">
              Needs review ({needsReview.length})
            </h2>
            <div className="mt-4 flex flex-col gap-4">
              {needsReview.length === 0 && (
                <Card>
                  <p className="text-sm text-ink-light">Nothing waiting for review right now.</p>
                </Card>
              )}
              {needsReview.map((doc) => (
                <Card key={doc.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-display text-sm font-semibold text-ink">
                        {doc.student_name ?? "Unknown student"}
                      </p>
                      <p className="text-xs text-ink-light">
                        {doc.type} · uploaded {new Date(doc.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        STATUS_STYLE[doc.verification_status] ?? ""
                      }`}
                    >
                      {doc.verification_status}
                    </span>
                  </div>

                  {doc.verification_details?.notes && (
                    <p className="mt-2 text-xs text-ink-light">{doc.verification_details.notes}</p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      Open certificate →
                    </a>
                    <Button
                      onClick={() => handleDecision(doc.id, "verified")}
                      loading={actingOn === doc.id}
                      className="ml-auto"
                    >
                      Approve
                    </Button>
                    <button
                      onClick={() => handleDecision(doc.id, "rejected")}
                      disabled={actingOn === doc.id}
                      className="rounded-md border border-clay-400/30 px-3.5 py-2 text-sm font-medium text-clay-500 hover:bg-clay-50"
                    >
                      Reject
                    </button>
                  </div>
                </Card>
              ))}
            </div>

            {alreadyDecided.length > 0 && (
              <>
                <h2 className="mt-10 font-display text-base font-semibold text-ink">
                  Already decided ({alreadyDecided.length})
                </h2>
                <div className="mt-4 flex flex-col gap-3">
                  {alreadyDecided.map((doc) => (
                    <Card key={doc.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-ink">
                          {doc.student_name ?? "Unknown student"}
                        </p>
                        <p className="text-xs text-ink-light">{doc.type}</p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          STATUS_STYLE[doc.verification_status] ?? ""
                        }`}
                      >
                        {doc.verification_status}
                      </span>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
