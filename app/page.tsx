import Link from "next/link";
import Navbar from "@/components/Navbar";
import Reveal from "@/components/Reveal";

const steps = [
  {
    n: "01",
    title: "Sign up & verify email",
    body: "Create a student or recruiter account and confirm it's really you.",
  },
  {
    n: "02",
    title: "Upload certificates & profiles",
    body: "Add certificates, GitHub, LinkedIn and LeetCode alongside your skills and projects.",
  },
  {
    n: "03",
    title: "AI scans documents & builds a verified resume",
    body: "Each certificate is checked automatically and your resume reflects only what's confirmed.",
  },
  {
    n: "04",
    title: "Recruiters search & hire",
    body: "Companies search verified profiles and open a full, trustworthy resume for every candidate.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-paper">
      <Navbar />

      {/* Hero with floating gradient orbs + dot-grid backdrop */}
      <section className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #C7CEF0 1.5px, transparent 1.5px)",
            backgroundSize: "26px 26px",
          }}
        />
        <div
          aria-hidden
          className="animate-float-slow pointer-events-none absolute -left-32 top-0 h-[26rem] w-[26rem] rounded-full bg-gradient-to-br from-indigo-400/60 via-indigo-300/40 to-transparent blur-3xl"
        />
        <div
          aria-hidden
          className="animate-float-slower pointer-events-none absolute -right-24 top-16 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-verdant-400/55 via-verdant-200/40 to-transparent blur-3xl"
        />
        <div
          aria-hidden
          className="animate-float-slow pointer-events-none absolute left-1/3 -top-10 h-64 w-64 rounded-full bg-gradient-to-br from-amber-400/35 to-transparent blur-3xl"
          style={{ animationDelay: "2s" }}
        />
        <div
          aria-hidden
          className="animate-float-slower pointer-events-none absolute right-1/4 bottom-0 h-56 w-56 rounded-full bg-gradient-to-br from-indigo-500/30 to-transparent blur-3xl"
          style={{ animationDelay: "4s" }}
        />

        <div className="relative mx-auto max-w-5xl px-6 pb-20 pt-20 text-center">
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-3.5 py-1.5 text-xs font-medium text-indigo-600 shadow-card">
            <span className="h-1.5 w-1.5 rounded-full bg-verdant-500" />
            Built for Smart India Hackathon
          </div>

          <h1
            className="animate-fade-up mt-6 font-display text-4xl font-bold leading-tight text-ink sm:text-5xl"
            style={{ animationDelay: "80ms" }}
          >
            <span
              className="animate-gradient-text bg-gradient-to-r from-indigo-600 via-verdant-500 to-indigo-600 bg-clip-text text-transparent"
            >
              AI-verified
            </span>{" "}
            student skills & placement portal
          </h1>

          <p
            className="animate-fade-up mx-auto mt-5 max-w-2xl text-lg text-ink-light"
            style={{ animationDelay: "160ms" }}
          >
            Upload certificates, get an AI-verified profile, and connect with companies.
          </p>

          <div
            className="animate-fade-up mt-9 flex items-center justify-center gap-4"
            style={{ animationDelay: "240ms" }}
          >
            <Link
              href="/login"
              className="group relative overflow-hidden rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-card transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              Student login
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-indigo-200 bg-white px-6 py-3 text-sm font-semibold text-indigo-600 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-indigo-50 hover:shadow-card"
            >
              Recruiter login
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-indigo-100 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold text-ink">How it works</h2>
          </Reveal>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {steps.map((step, i) => (
              <Reveal key={step.n} delay={i * 90}>
                <div className="group flex gap-4 rounded-lg border border-transparent p-3 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-100 hover:bg-paper hover:shadow-card">
                  <span className="font-display text-2xl font-bold text-indigo-200 transition-colors duration-300 group-hover:text-indigo-400">
                    {step.n}
                  </span>
                  <div>
                    <h3 className="font-display text-base font-semibold text-ink">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm text-ink-light">{step.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-indigo-100 bg-paper">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-ink-light sm:flex-row">
          <p>© {new Date().getFullYear()} Setu — built for Smart India Hackathon.</p>
          <div className="flex gap-5">
            <Link href="/login" className="hover:text-ink">
              Log in
            </Link>
            <Link href="/signup" className="hover:text-ink">
              Sign up
            </Link>
            <Link href="/insights/dashboard" className="hover:text-ink">
              Skill demand insights
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
