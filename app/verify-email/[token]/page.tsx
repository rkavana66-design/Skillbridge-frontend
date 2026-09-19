"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Card from "@/components/ui/Card";
import { ApiError, verifyEmail } from "@/lib/api";

type Status = "loading" | "success" | "error";

export default function VerifyEmailTokenPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");
  // Verification tokens are single-use on the backend. React 18's dev-mode
  // double-invoke of effects would otherwise send this request twice and
  // turn a successful verification into a false "invalid/expired" error.
  const hasRequested = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }
    if (hasRequested.current) return;
    hasRequested.current = true;

    verifyEmail(token)
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setMessage(
          err instanceof ApiError ? err.message : "This link is invalid or has expired."
        );
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="mx-auto flex max-w-md flex-col justify-center px-6 py-16">
        <Card className="text-center">
          {status === "loading" && (
            <>
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
              <p className="mt-4 text-sm text-ink-light">Verifying your email…</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-verdant-50">
                <span className="text-verdant-500">✓</span>
              </div>
              <h1 className="mt-4 font-display text-lg font-semibold text-ink">
                Email verified
              </h1>
              <p className="mt-1 text-sm text-ink-light">
                Your account is active. You can log in now.
              </p>
              <Link
                href="/login"
                className="mt-6 inline-block rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Go to login
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-clay-50">
                <span className="text-clay-500">✕</span>
              </div>
              <h1 className="mt-4 font-display text-lg font-semibold text-ink">
                Verification failed
              </h1>
              <p className="mt-1 text-sm text-ink-light">{message}</p>
              <Link
                href="/signup"
                className="mt-6 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                Back to sign up
              </Link>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
