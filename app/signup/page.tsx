"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Card from "@/components/ui/Card";
import Label from "@/components/ui/Label";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { ApiError, signup } from "@/lib/api";
import { Role } from "@/lib/auth";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [discipline, setDiscipline] = useState("");
  const [college, setCollege] = useState("");
  const [designation, setDesignation] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup({
        name,
        email,
        password,
        role,
        discipline: role === "student" ? discipline : undefined,
        college: role === "student" ? college : undefined,
        designation: role === "recruiter" ? designation : undefined,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create account. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-paper">
      <div
        aria-hidden
        className="animate-float-slow pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-400/50 to-transparent blur-3xl"
      />
      <div
        aria-hidden
        className="animate-float-slower pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-gradient-to-br from-verdant-300/45 to-transparent blur-3xl"
      />
      <Navbar />
      <div className="relative mx-auto flex max-w-md flex-col justify-center px-6 py-16">
        <div className="animate-fade-up">
        <h1 className="font-display text-2xl font-semibold text-ink">Create your account</h1>
        <p className="mt-1 text-sm text-ink-light">
          Join as a student to build a verified profile, or as a recruiter to search candidates.
        </p>
        </div>

        <Card className="mt-8">
          {success ? (
            <div className="text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-verdant-50">
                <span className="text-verdant-500">✓</span>
              </div>
              <h2 className="mt-4 font-display text-lg font-semibold text-ink">
                Check your inbox
              </h2>
              <p className="mt-1 text-sm text-ink-light">
                We've sent a verification link to {email}. Confirm it to activate your account.
              </p>
              <Link
                href="/login"
                className="mt-6 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                Go to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex gap-2 rounded-md bg-indigo-50 p-1">
                {(["student", "recruiter"] as Role[]).map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRole(r)}
                    className={`flex-1 rounded px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                      role === r ? "bg-white text-indigo-600 shadow-card" : "text-ink-light"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <div>
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ananya Sharma"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@college.edu"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                />
              </div>

              {role === "student" ? (
                <>
                  <div>
                    <Label htmlFor="discipline">Discipline</Label>
                    <Input
                      id="discipline"
                      value={discipline}
                      onChange={(e) => setDiscipline(e.target.value)}
                      placeholder="Computer Science & Engineering"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="college">College / University</Label>
                    <Input
                      id="college"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="e.g. Sapthagiri NPS University"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <Label htmlFor="designation">Designation</Label>
                  <Input
                    id="designation"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="Talent Acquisition Lead"
                    required
                  />
                </div>
              )}

              {error && (
                <p className="rounded-md bg-clay-50 px-3 py-2 text-sm text-clay-500">{error}</p>
              )}

              <Button type="submit" fullWidth loading={loading}>
                Create account
              </Button>
            </form>
          )}
        </Card>

        <p className="mt-6 text-center text-sm text-ink-light">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
