"use client";

import { FormEvent, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import { ApiError, Interview, scheduleInterview } from "@/lib/api";

interface BookInterviewModalProps {
  studentId: string;
  studentName: string;
  onClose: () => void;
  onBooked: (interview: Interview) => void;
}

export default function BookInterviewModal({
  studentId,
  studentName,
  onClose,
  onBooked,
}: BookInterviewModalProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(30);
  const [mode, setMode] = useState<"online" | "offline">("online");
  const [locationOrLink, setLocationOrLink] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!date || !time) {
      setError("Choose a date and time.");
      return;
    }

    const scheduledAt = new Date(`${date}T${time}`);
    if (scheduledAt.getTime() <= Date.now()) {
      setError("Interview time must be in the future.");
      return;
    }

    setLoading(true);
    try {
      const interview = await scheduleInterview({
        student_id: studentId,
        scheduled_at: scheduledAt.toISOString(),
        duration_minutes: duration,
        mode,
        location_or_link: locationOrLink || undefined,
        notes: notes || undefined,
      });
      onBooked(interview);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not book the interview.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
      <div className="w-full max-w-md rounded-lg border border-indigo-100 bg-white p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">Book interview</h2>
          <button onClick={onClose} className="text-ink-light hover:text-ink" aria-label="Close">
            ✕
          </button>
        </div>
        <p className="mt-1 text-sm text-ink-light">with {studentName}</p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="duration">Duration</Label>
            <div className="field-shell">
              <select
                id="duration"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full rounded-md bg-transparent px-3.5 py-2.5 text-sm text-ink outline-none"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>
          </div>

          <div>
            <Label>Mode</Label>
            <div className="flex gap-2 rounded-md bg-indigo-50 p-1">
              {(["online", "offline"] as const).map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 rounded px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                    mode === m ? "bg-white text-indigo-600 shadow-card" : "text-ink-light"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="location">{mode === "online" ? "Meeting link" : "Location"}</Label>
            <Input
              id="location"
              value={locationOrLink}
              onChange={(e) => setLocationOrLink(e.target.value)}
              placeholder={mode === "online" ? "https://meet.google.com/..." : "Office address"}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything the candidate should know"
            />
          </div>

          {error && (
            <p className="rounded-md bg-clay-50 px-3 py-2 text-sm text-clay-500">{error}</p>
          )}

          <div className="mt-1 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Confirm booking
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
