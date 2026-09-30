"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Label from "@/components/ui/Label";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { ApiError, login } from "@/lib/api";
import { saveAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(email, password);
      saveAuth(res.access_token, {
        name: res.name,
        email: res.email,
        role: res.role,
      });
      router.push(
        res.role === "student"
          ? "/student/dashboard"
          : res.role === "admin"
          ? "/admin/review"
          : "/recruiter/dashboard"
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not log in. Check your details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-600 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="animate-float-slow pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden
          className="animate-float-slower pointer-events-none absolute -right-16 bottom-20 h-80 w-80 rounded-full bg-purple-300/20 blur-3xl"
        />
        <Link href="/" className="relative flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white font-display text-base font-bold text-indigo-600">
            S
          </span>
          <span className="font-display text-xl font-semibold text-white">Setu</span>
        </Link>

        <div className="relative animate-fade-up">
          <h2 className="font-display text-4xl font-bold leading-tight text-white">
            Proof that moves careers forward.
          </h2>
          <p className="mt-4 max-w-sm text-indigo-100">
            Verified certificates, real assessment scores, and a resume recruiters can actually trust.
          </p>
        </div>

        <div className="relative flex gap-8 text-sm text-indigo-100">
          <div>
            <div className="font-display text-2xl font-bold text-white">100%</div>
            <div>AI-verified certificates</div>
          </div>
          <div>
            <div className="font-display text-2xl font-bold text-white">11</div>
            <div>Skill assessments</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center bg-white px-6 py-16 sm:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600 font-display text-sm font-bold text-white">
              S
            </span>
            <span className="font-display text-lg font-semibold text-ink">Setu</span>
          </div>

          <div className="animate-fade-up">
            <h1 className="font-display text-2xl font-semibold text-ink">Welcome back</h1>
            <p className="mt-1 text-sm text-ink-light">Log in to your Setu account.</p>
          </div>

          <div className="animate-fade-up mt-8" style={{ animationDelay: "100ms" }}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="mb-0">
                    Password
                  </Label>
                  <Link href="/forgot-password" className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <p className="rounded-md bg-clay-50 px-3 py-2 text-sm text-clay-500">{error}</p>
              )}

              <Button type="submit" fullWidth loading={loading}>
                Log in
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-ink-light">
              Don't have an account?{" "}
              <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-700">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
