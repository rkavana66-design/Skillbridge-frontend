"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { getAuth } from "@/lib/auth";
import {
  ApiError,
  logProctoringEvent,
  StartAttemptResponse,
  startTest,
  SubmitAttemptResponse,
  submitAttempt,
  uploadSnapshot,
} from "@/lib/api";

const SNAPSHOT_INTERVAL_MS = 30_000;

type Phase = "loading" | "in_progress" | "disqualified" | "submitted" | "error";

export default function TakeTestPage() {
  const router = useRouter();
  const params = useParams<{ testId: string }>();

  const [phase, setPhase] = useState<Phase>("loading");
  const [attempt, setAttempt] = useState<StartAttemptResponse | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [disqualifyReason, setDisqualifyReason] = useState("");
  const [result, setResult] = useState<SubmitAttemptResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [cameraStatus, setCameraStatus] = useState<"pending" | "active" | "unavailable">("pending");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const attemptRef = useRef<StartAttemptResponse | null>(null);
  const answersRef = useRef<Record<string, number>>({});
  const submittedRef = useRef(false);

  // Keep refs in sync so interval/event callbacks always see current state
  // without needing to be re-created on every render.
  useEffect(() => {
    attemptRef.current = attempt;
  }, [attempt]);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const doSubmit = useCallback(async () => {
    if (submittedRef.current || !attemptRef.current) return;
    submittedRef.current = true;
    stopCamera();
    try {
      const res = await submitAttempt(attemptRef.current.attempt_id, answersRef.current);
      setResult(res);
      setPhase("submitted");
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : "Could not submit your answers.");
      setPhase("error");
    }
  }, [stopCamera]);

  // ---- Start the attempt on mount ----
  useEffect(() => {
    const { token, user } = getAuth();
    if (!token || user?.role !== "student") {
      router.push("/login");
      return;
    }

    startTest(params.testId)
      .then((res) => {
        setAttempt(res);
        setSecondsLeft(res.duration_minutes * 60);
        setPhase("in_progress");
      })
      .catch((err) => {
        setErrorMessage(err instanceof ApiError ? err.message : "Could not start this test.");
        setPhase("error");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.testId, router]);

  // ---- Countdown timer ----
  useEffect(() => {
    if (phase !== "in_progress") return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          doSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, doSubmit]);

  // ---- Tab-switch / visibility proctoring ----
  useEffect(() => {
    if (phase !== "in_progress") return;

    function handleVisibilityChange() {
      if (document.hidden && attemptRef.current) {
        logProctoringEvent(attemptRef.current.attempt_id, "tab_switch")
          .then((res) => {
            setTabSwitchCount(res.tab_switch_count);
            if (res.disqualified) {
              setDisqualifyReason(
                `You switched tabs ${res.tab_switch_count} times, which exceeds the allowed limit.`
              );
              setPhase("disqualified");
              stopCamera();
            }
          })
          .catch(() => {
            // Non-fatal — proctoring logging shouldn't block the test itself.
          });
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [phase, stopCamera]);

  // ---- Camera: request access, show preview, periodic snapshots ----
  useEffect(() => {
    if (phase !== "in_progress") return;

    let cancelled = false;

    navigator.mediaDevices
      ?.getUserMedia({ video: true })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraStatus("active");
      })
      .catch(() => {
        setCameraStatus("unavailable");
      });

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [phase, stopCamera]);

  useEffect(() => {
    if (phase !== "in_progress" || cameraStatus !== "active") return;

    const interval = setInterval(() => {
      const video = videoRef.current;
      const attemptId = attemptRef.current?.attempt_id;
      if (!video || !attemptId || video.readyState < 2) return;

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) uploadSnapshot(attemptId, blob).catch(() => {});
      }, "image/jpeg", 0.7);
    }, SNAPSHOT_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [phase, cameraStatus]);

  function selectAnswer(questionId: string, optionIndex: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  }

  function formatTime(totalSeconds: number) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 py-8">
        {phase === "loading" && <p className="text-sm text-ink-light">Starting test…</p>}

        {phase === "error" && (
          <Card>
            <p className="rounded-md bg-clay-50 px-3 py-2 text-sm text-clay-500">{errorMessage}</p>
            <Link href="/student/assessments" className="mt-4 inline-block text-sm font-medium text-indigo-600">
              Back to assessments
            </Link>
          </Card>
        )}

        {phase === "disqualified" && (
          <Card className="text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-clay-50">
              <span className="text-clay-500">✕</span>
            </div>
            <h1 className="mt-4 font-display text-lg font-semibold text-ink">Test disqualified</h1>
            <p className="mt-1 text-sm text-ink-light">{disqualifyReason}</p>
            <Link
              href="/student/assessments"
              className="mt-6 inline-block rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Back to assessments
            </Link>
          </Card>
        )}

        {phase === "submitted" && result && (
          <Card className="text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-verdant-50">
              <span className="text-verdant-500">✓</span>
            </div>
            <h1 className="mt-4 font-display text-lg font-semibold text-ink">Test submitted</h1>
            <p className="mt-2 text-3xl font-bold text-indigo-600">{result.percent}%</p>
            <p className="mt-1 text-sm text-ink-light">
              {result.score} / {result.total_marks} marks ·{" "}
              <span className={result.passed ? "text-verdant-600" : "text-clay-500"}>
                {result.passed ? "Passed" : "Below passing score"}
              </span>
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/student/assessments">
                <Button variant="outline">More tests</Button>
              </Link>
              <Link href="/student/resume">
                <Button>View resume</Button>
              </Link>
            </div>
          </Card>
        )}

        {phase === "in_progress" && attempt && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h1 className="font-display text-xl font-semibold text-ink">{attempt.title}</h1>
                <p className="mt-0.5 text-xs text-ink-light">
                  {tabSwitchCount > 0 && (
                    <span className="text-amber-500">
                      {tabSwitchCount} tab switch{tabSwitchCount > 1 ? "es" : ""} detected ·{" "}
                    </span>
                  )}
                  {cameraStatus === "active" && "Camera monitoring active"}
                  {cameraStatus === "unavailable" && "Camera unavailable — proceeding without it"}
                  {cameraStatus === "pending" && "Requesting camera access…"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {cameraStatus === "active" && (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="h-14 w-20 rounded-md border border-indigo-100 object-cover"
                  />
                )}
                <div className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white">
                  {formatTime(secondsLeft)}
                </div>
              </div>
            </div>

            <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-500">
              Don't switch tabs or exit fullscreen — repeated switches will disqualify this attempt.
            </p>

            <div className="flex flex-col gap-4">
              {attempt.questions.map((question, index) => (
                <Card key={question.id}>
                  <p className="text-sm font-medium text-ink">
                    {index + 1}. {question.text}
                  </p>
                  <div className="mt-3 flex flex-col gap-2">
                    {question.options.map((option, optionIndex) => (
                      <label
                        key={optionIndex}
                        className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                          answers[question.id] === optionIndex
                            ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                            : "border-indigo-100 text-ink hover:border-indigo-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name={question.id}
                          checked={answers[question.id] === optionIndex}
                          onChange={() => selectAnswer(question.id, optionIndex)}
                          className="accent-indigo-600"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </Card>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={doSubmit}>Submit test</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
