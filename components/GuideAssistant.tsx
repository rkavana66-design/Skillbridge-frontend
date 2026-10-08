"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AuthUser, getAuth } from "@/lib/auth";
import { getStudentProfile, StudentProfile } from "@/lib/api";

type Role = AuthUser["role"];
type IconName =
  | "plus" | "upload" | "bolt" | "folder" | "test" | "user"
  | "search" | "shield" | "sparkle" | "close" | "send" | "check";

interface Cta { label: string; href: string }
interface TourLink { label: string; href: string; desc: string }
interface Reply { text: string; cta?: Cta; links?: TourLink[] }
interface ChatMessage extends Reply { from: "bot" | "me" }
interface Step { key: string; label: string; hint: string; done: boolean; href: string; cta: string }
interface QuickAction { href: string; label: string; icon: IconName }
interface Chip { id: string; label: string }

/* ---------------- icons ---------------- */

const ICON_PATHS: Record<IconName, string> = {
  plus: "M12 5v14M5 12h14",
  upload: "M12 16V4m0 0l-4 4m4-4l4 4M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3",
  bolt: "M13 2L4 14h7l-1 8 9-12h-7l1-8z",
  folder: "M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z",
  test: "M9 5h6M9 5a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12l2 2 4-4",
  user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM4 21a8 8 0 0116 0",
  search: "M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3zM9 12l2 2 4-4",
  sparkle: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z",
  close: "M6 6l12 12M18 6L6 18",
  send: "M5 12h14M13 6l6 6-6 6",
  check: "M5 13l4 4L19 7",
};

function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

/* ---------------- content ---------------- */

const QUICK_ACTIONS: Record<Role, QuickAction[]> = {
  student: [
    { href: "/student/uploads", label: "Upload a certificate", icon: "upload" },
    { href: "/student/uploads", label: "Add a skill", icon: "bolt" },
    { href: "/student/uploads", label: "Add a project", icon: "folder" },
    { href: "/student/assessments", label: "Take an assessment", icon: "test" },
    { href: "/student/external", label: "Edit profile and links", icon: "user" },
  ],
  recruiter: [
    { href: "/recruiter/search", label: "Search candidates", icon: "search" },
    { href: "/recruiter/dashboard", label: "My dashboard", icon: "user" },
  ],
  admin: [
    { href: "/admin/review", label: "Review documents", icon: "shield" },
    { href: "/admin/users", label: "Verify accounts", icon: "user" },
  ],
};

const CHIPS: Record<Role, Chip[]> = {
  student: [
    { id: "next", label: "What should I do next?" },
    { id: "tour", label: "Show me everything" },
    { id: "verify", label: "How does verification work?" },
    { id: "tests", label: "How do assessments work?" },
    { id: "resume", label: "Where is my resume?" },
    { id: "recruiters", label: "What do recruiters see?" },
  ],
  recruiter: [
    { id: "tour", label: "Show me everything" },
    { id: "find", label: "How do I find candidates?" },
    { id: "verified", label: "What does verified mean?" },
    { id: "interview", label: "How do I book an interview?" },
  ],
  admin: [
    { id: "tour", label: "Show me everything" },
    { id: "review", label: "What do I review?" },
    { id: "accounts", label: "How do I verify accounts?" },
  ],
};

const TOURS: Record<Role, TourLink[]> = {
  student: [
    { label: "Dashboard", href: "/student/dashboard", desc: "Your overview at a glance" },
    { label: "Profile", href: "/student/profile", desc: "What recruiters see: skills, projects, verified certificates" },
    { label: "Assessments", href: "/student/assessments", desc: "Timed tests that build your language scores" },
    { label: "Resume", href: "/student/resume", desc: "A printable resume built from your verified profile" },
    { label: "Uploads", href: "/student/uploads", desc: "Certificates (PDF), skills and projects" },
    { label: "External profiles", href: "/student/external", desc: "Photo, bio, college, GitHub, LinkedIn, LeetCode" },
  ],
  recruiter: [
    { label: "Dashboard", href: "/recruiter/dashboard", desc: "Your upcoming interviews" },
    { label: "Search candidates", href: "/recruiter/search", desc: "Filter by skill, discipline or score" },
  ],
  admin: [
    { label: "Document review", href: "/admin/review", desc: "Approve or reject certificates the system could not confirm" },
    { label: "Verify accounts", href: "/admin/users", desc: "Approve new sign-ups while email verification is offline" },
  ],
};

const PAGE_TIPS: Record<string, string> = {
  "/student/dashboard": "You are on your dashboard, a quick overview of where you stand.",
  "/student/profile": "This page is what recruiters see: your skills, projects and verified certificates.",
  "/student/uploads": "Here you can upload certificates (PDF) and add skills and projects.",
  "/student/assessments": "Pick a test to build your language scores.",
  "/student/external": "Add your college, photo, bio and GitHub or LeetCode links here.",
  "/student/resume": "This is your resume, built from your verified profile.",
  "/recruiter/search": "Search by skill or discipline, then open a profile.",
  "/recruiter/dashboard": "Your upcoming interviews appear here.",
  "/admin/review": "Approve or reject certificates the system could not verify.",
  "/admin/users": "Verify new accounts here while email verification is offline.",
};

const ANSWERS: Record<Role, Record<string, Reply>> = {
  student: {
    verify: {
      text:
        "Upload your certificate as a PDF. We look for a QR code from a trusted issuer, read the text for your name and college, and check for signs of editing. Clear matches are verified. Photos or scans we cannot read go to an admin for review. Adding your college under External profiles helps us recognise your certificates.",
      cta: { label: "Upload a certificate", href: "/student/uploads" },
    },
    tests: {
      text:
        "Pick a test under Assessments. Questions and answer options are shuffled for every attempt. Keep the test tab open and visible: switching tabs ends the test immediately. A camera preview shows during the test and snapshots are taken about every 30 seconds. Your results build the language scores recruiters see.",
      cta: { label: "Open assessments", href: "/student/assessments" },
    },
    resume: {
      text: "Your resume is built from your profile, verified certificates, skills and projects. Open it to view or print it.",
      cta: { label: "Open my resume", href: "/student/resume" },
    },
    recruiters: {
      text:
        "Recruiters see your name, discipline, top language scores and how many certificates are verified. They can open your resume and book an interview with you.",
      cta: { label: "See my profile", href: "/student/profile" },
    },
  },
  recruiter: {
    find: {
      text:
        "Open Search candidates, type a skill such as Python, or filter by discipline or minimum score. Open a profile to see verified certificates, language scores and the resume.",
      cta: { label: "Search candidates", href: "/recruiter/search" },
    },
    verified: {
      text:
        "Verified means the certificate passed our automated checks (trusted QR code, matching name, no signs of editing) or an admin approved it. It is a strong signal, not a guarantee.",
    },
    interview: {
      text:
        "Open a candidate's profile and use the interview booking option to choose a date, time and mode (online or offline). Upcoming interviews appear on your dashboard.",
      cta: { label: "Go to my dashboard", href: "/recruiter/dashboard" },
    },
  },
  admin: {
    review: {
      text:
        "Document review lists certificates the system could not confirm, mostly photos and scans. Open each file, look at it, then approve or reject.",
      cta: { label: "Open document review", href: "/admin/review" },
    },
    accounts: {
      text:
        "Until verification emails are live, new accounts wait on the Verify accounts page. Only verify people you have confirmed are real.",
      cta: { label: "Verify accounts", href: "/admin/users" },
    },
  },
};

const KEYWORDS: Record<Role, [string, string[]][]> = {
  student: [
    ["tour", ["everything", "tour", "pages", "menu", "what can you do", "help"]],
    ["next", ["next", "progress", "start", "todo", "to do", "what should", "strength", "complete"]],
    ["verify", ["verif", "certificate", "upload", "fake", "qr", "badge"]],
    ["tests", ["test", "assess", "exam", "quiz", "score", "camera", "tab", "proctor"]],
    ["resume", ["resume", "cv", "print", "pdf"]],
    ["recruiters", ["recruiter", "company", "hire", "job", "placement", "visible", "see my"]],
  ],
  recruiter: [
    ["tour", ["everything", "tour", "pages", "menu", "what can you do", "help"]],
    ["find", ["find", "search", "candidate", "filter"]],
    ["verified", ["verified", "badge", "trust", "certificate"]],
    ["interview", ["interview", "book", "schedule"]],
  ],
  admin: [
    ["tour", ["everything", "tour", "pages", "menu", "what can you do", "help"]],
    ["review", ["review", "document", "certificate", "approve"]],
    ["accounts", ["account", "verify", "user", "signup", "email"]],
  ],
};

/* ---------------- logic ---------------- */

function matchTopic(role: Role, text: string): string | null {
  const t = text.toLowerCase();
  for (const [topic, words] of KEYWORDS[role]) {
    if (words.some((w) => t.includes(w))) return topic;
  }
  return null;
}

function buildSteps(p: StudentProfile): Step[] {
  const docs = p.documents ?? [];
  const scores = p.language_scores ?? [];
  return [
    {
      key: "college", label: "Add your college", done: Boolean(p.college), href: "/student/external", cta: "Add college",
      hint: "Add your college under External profiles. It helps us recognise your certificates.",
    },
    {
      key: "photo", label: "Add a profile photo", done: Boolean(p.profile_photo_url), href: "/student/external", cta: "Add photo",
      hint: "Add a profile photo so recruiters see a real person.",
    },
    {
      key: "bio", label: "Write a short bio", done: Boolean(p.summary), href: "/student/external", cta: "Write bio",
      hint: "Write a two-line bio about yourself.",
    },
    {
      key: "links", label: "Link GitHub, LinkedIn or LeetCode",
      done: Boolean(p.github_url || p.linkedin_url || p.leetcode_url), href: "/student/external", cta: "Add links",
      hint: "Link your GitHub or LeetCode so your work can be checked.",
    },
    {
      key: "cert", label: "Upload a certificate", done: docs.length > 0, href: "/student/uploads", cta: "Upload",
      hint: "Upload a certificate as a PDF. A PDF with a QR code verifies fastest.",
    },
    {
      key: "verified", label: "Get a certificate verified",
      done: docs.some((d) => d.verification_status === "verified"), href: "/student/uploads", cta: "Check status",
      hint: "None of your certificates are verified yet. Photos and scans go to an admin for review, so a PDF with a QR code is fastest.",
    },
    {
      key: "skills", label: "Add at least 3 skills", done: (p.skills ?? []).length >= 3, href: "/student/uploads", cta: "Add skills",
      hint: "Add at least three skills with your honest level.",
    },
    {
      key: "project", label: "Add a project", done: (p.projects ?? []).length >= 1, href: "/student/uploads", cta: "Add project",
      hint: "Add one project with its tech stack and a GitHub link.",
    },
    {
      key: "test", label: "Take an assessment", done: scores.some((s) => (s.tests_taken ?? 0) > 0), href: "/student/assessments", cta: "Take a test",
      hint: "Take an assessment to earn a language score recruiters can see.",
    },
  ];
}

function nextStepReply(steps: Step[] | null): Reply {
  if (!steps) {
    return {
      text: "I could not check your progress just now. Open your profile to see where you stand.",
      cta: { label: "Open my profile", href: "/student/profile" },
    };
  }
  const next = steps.find((s) => !s.done);
  if (!next) {
    return {
      text: "Everything on your checklist is done. Take another assessment to strengthen your scores.",
      cta: { label: "Take a test", href: "/student/assessments" },
    };
  }
  return { text: `Your next step: ${next.hint}`, cta: { label: next.cta, href: next.href } };
}

function answerFor(role: Role, topic: string, steps: Step[] | null): Reply {
  if (topic === "tour") return { text: "Here is everything you can do:", links: TOURS[role] };
  if (role === "student" && topic === "next") return nextStepReply(steps);
  return (
    ANSWERS[role][topic] ?? {
      text: "I am a guided helper, so I only know a set of topics. Tap one of the suggestions below.",
    }
  );
}

function greeting(user: AuthUser, pathname: string): Reply {
  const first = user.name.split(" ")[0] || "there";
  const tip: string | undefined = PAGE_TIPS[pathname];
  const base =
    user.role === "student"
      ? `Hi ${first}! I am your Setu guide. I can walk you through your profile, certificate verification, assessments and resume.`
      : user.role === "recruiter"
        ? `Hi ${first}! I am your Setu guide. I can show you how to find verified candidates and book interviews.`
        : `Hi ${first}! I am your Setu guide. Here is what needs your attention as an admin.`;
  return { text: tip ? `${base} ${tip}` : base };
}

const HIDDEN_EXACT = ["/", "/login", "/signup", "/forgot-password", "/reset-password"];

function isHiddenPath(pathname: string): boolean {
  if (HIDDEN_EXACT.includes(pathname)) return true;
  if (pathname.startsWith("/verify-email")) return true;
  // Never show the guide during a live test.
  if (/^\/student\/assessments\/[^/]+/.test(pathname)) return true;
  return false;
}

/* ---------------- small pieces ---------------- */

function Ring({ percent }: { percent: number }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-12 w-12 shrink-0">
      <svg viewBox="0 0 44 44" className="h-12 w-12 -rotate-90" aria-hidden>
        <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="4" />
        <circle
          cx="22" cy="22" r={r} fill="none" stroke="#818CF8" strokeWidth="4" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - percent / 100)}
          style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-ink">
        {percent}%
      </span>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex w-fit items-center gap-1 rounded-2xl rounded-tl-sm bg-white/10 px-3.5 py-3" aria-label="Typing">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="typing-dot block h-1.5 w-1.5 rounded-full bg-indigo-300"
          style={{ animationDelay: `${i * 160}ms` }}
        />
      ))}
    </div>
  );
}

/* ---------------- main component ---------------- */

export default function GuideAssistant() {
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [fabOpen, setFabOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [live, setLive] = useState<string | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [profileError, setProfileError] = useState(false);
  const [showList, setShowList] = useState(false);
  const [draft, setDraft] = useState("");

  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const delay = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<ChatMessage | null>(null);
  const greeted = useRef(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  const hidden = isHiddenPath(pathname);
  const email = user?.email ?? null;
  const steps = profile ? buildSteps(profile) : null;

  /* typing helpers */
  const clearTimers = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    if (delay.current) clearTimeout(delay.current);
    timer.current = null;
    delay.current = null;
  }, []);

  const flush = useCallback(() => {
    clearTimers();
    const earlier = pending.current;
    pending.current = null;
    if (earlier) setMessages((m) => [...m, earlier]);
    setLive(null);
  }, [clearTimers]);

  const say = useCallback(
    (reply: Reply) => {
      flush();
      const full: ChatMessage = { from: "bot", ...reply };
      const reduce =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        setMessages((m) => [...m, full]);
        return;
      }
      pending.current = full;
      setLive(""); // shows the typing dots
      delay.current = setTimeout(() => {
        let i = 0;
        timer.current = setInterval(() => {
          i += 2;
          if (i >= reply.text.length) {
            if (timer.current) clearInterval(timer.current);
            timer.current = null;
            pending.current = null;
            setMessages((m) => [...m, full]);
            setLive(null);
          } else {
            setLive(reply.text.slice(0, i));
          }
        }, 16);
      }, 450);
    },
    [flush]
  );

  const loadProfile = useCallback(async () => {
    try {
      setProfile(await getStudentProfile());
      setProfileError(false);
    } catch {
      setProfileError(true);
    }
  }, []);

  function ask(label: string, topic: string | null) {
    if (!user) return;
    flush();
    setMessages((m) => [...m, { from: "me", text: label }]);
    say(
      topic
        ? answerFor(user.role, topic, steps)
        : { text: "I am a guided helper, so I only know a set of topics. Tap one of the suggestions below." }
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !user) return;
    setDraft("");
    ask(text, matchTopic(user.role, text));
  }

  /* who is logged in (re-checked on every page change, so it appears right after login) */
  useEffect(() => {
    setUser(getAuth().user);
    setFabOpen(false);
  }, [pathname]);

  /* a different user (or logout) starts a fresh conversation */
  useEffect(() => {
    clearTimers();
    pending.current = null;
    greeted.current = false;
    setMessages([]);
    setLive(null);
    setProfile(null);
    setProfileError(false);
    setOpen(false);
    setFabOpen(false);
  }, [email, clearTimers]);

  /* first ever visit: open the guide by itself */
  useEffect(() => {
    if (!email || hidden) return;
    let seen = false;
    try {
      seen = localStorage.getItem(`setu_guide_seen:${email}`) === "1";
    } catch {
      /* storage unavailable: just skip the auto-open */
      return;
    }
    if (seen) return;
    const t = setTimeout(() => {
      setOpen(true);
      try {
        localStorage.setItem(`setu_guide_seen:${email}`, "1");
      } catch {
        /* ignore */
      }
    }, 1200);
    return () => clearTimeout(t);
  }, [email, hidden]);

  /* opening the panel: refresh progress, greet once */
  useEffect(() => {
    if (!open || !user) return;
    if (user.role === "student") loadProfile();
    if (!greeted.current) {
      greeted.current = true;
      say(greeting(user, pathname));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /* keep the newest message in view */
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, live, open, showList]);

  /* Escape closes things */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setFabOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* stop timers when the component goes away */
  useEffect(() => clearTimers, [clearTimers]);

  if (!user || hidden) return null;

  const role = user.role;
  const actions = QUICK_ACTIONS[role] ?? [];
  const chips = CHIPS[role] ?? [];
  const doneCount = steps ? steps.filter((s) => s.done).length : 0;
  const percent = steps ? Math.round((doneCount / steps.length) * 100) : 0;
  const nextStep = steps ? steps.find((s) => !s.done) : undefined;

  function closeOnSmallScreen() {
    if (typeof window !== "undefined" && window.innerWidth < 640) setOpen(false);
  }

  return (
    <div className="no-print">
      {fabOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setFabOpen(false)} aria-hidden />
      )}

      {/* quick actions */}
      {fabOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-3"
          role="menu"
          aria-label="Quick actions"
        >
          {actions.map((a, i) => (
            <Link
              key={`${a.href}-${a.label}`}
              href={a.href}
              role="menuitem"
              onClick={() => setFabOpen(false)}
              style={{ animationDelay: `${(actions.length - 1 - i) * 55}ms` }}
              className="animate-fab-item flex items-center gap-3 rounded-full border border-white/10 bg-[#161a23]/95 py-2 pl-4 pr-2 text-sm font-medium text-ink shadow-card backdrop-blur-xl transition hover:border-indigo-400/60 hover:bg-indigo-500/10"
            >
              {a.label}
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-verdant-500 text-white">
                <Icon name={a.icon} className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* guide panel */}
      {open && (
        <section
          role="dialog"
          aria-label="Setu guide"
          className="animate-guide-pop fixed bottom-24 right-6 z-50 flex max-h-[min(72vh,640px)] w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#12151c]/95 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl"
        >
          <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-verdant-500 text-white shadow-[0_0_16px_rgba(79,70,229,0.5)]">
              <Icon name="sparkle" className="h-4 w-4" />
            </span>
            <div className="flex-1">
              <p className="font-display text-sm font-semibold leading-tight text-ink">Setu Guide</p>
              <p className="text-xs capitalize leading-tight text-ink-light">{role} help</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close guide"
              className="rounded-md p-1.5 text-ink-light hover:bg-white/10 hover:text-ink"
            >
              <Icon name="close" className="h-4 w-4" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
            {role === "student" && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                {steps ? (
                  <>
                    <div className="flex items-center gap-3">
                      <Ring percent={percent} />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-ink">Profile strength</p>
                        <p className="text-xs text-ink-light">
                          {doneCount} of {steps.length} steps done
                        </p>
                      </div>
                      <button
                        onClick={() => setShowList((v) => !v)}
                        className="text-xs font-medium text-indigo-300 hover:text-indigo-200"
                      >
                        {showList ? "Hide" : "Checklist"}
                      </button>
                    </div>
                    {nextStep && !showList && (
                      <Link
                        href={nextStep.href}
                        onClick={closeOnSmallScreen}
                        className="mt-3 block rounded-lg bg-indigo-500/15 px-3 py-2 text-xs font-medium text-indigo-200 hover:bg-indigo-500/25"
                      >
                        Next: {nextStep.label} →
                      </Link>
                    )}
                    {showList && (
                      <ul className="mt-3 space-y-1">
                        {steps.map((s) => (
                          <li key={s.key}>
                            <Link
                              href={s.href}
                              onClick={closeOnSmallScreen}
                              className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-xs hover:bg-white/5"
                            >
                              <span
                                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                                  s.done
                                    ? "border-verdant-400 bg-verdant-500/20 text-verdant-300"
                                    : "border-white/25 text-transparent"
                                }`}
                              >
                                <Icon name="check" className="h-2.5 w-2.5" />
                              </span>
                              <span className={s.done ? "text-ink-light line-through" : "text-ink"}>
                                {s.label}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-ink-light">
                    {profileError ? "Could not load your progress right now." : "Checking your progress…"}
                  </p>
                )}
              </div>
            )}

            {messages.map((m, i) =>
              m.from === "me" ? (
                <div key={i} className="flex justify-end">
                  <p className="max-w-[85%] rounded-2xl rounded-tr-sm bg-gradient-to-r from-indigo-600 to-indigo-500 px-3.5 py-2 text-sm text-white">
                    {m.text}
                  </p>
                </div>
              ) : (
                <div key={i} className="animate-fade-up space-y-2">
                  <p className="max-w-[92%] rounded-2xl rounded-tl-sm bg-white/10 px-3.5 py-2.5 text-sm leading-relaxed text-ink">
                    {m.text}
                  </p>
                  {m.links && (
                    <div className="space-y-1.5">
                      {m.links.map((l) => (
                        <Link
                          key={l.href}
                          href={l.href}
                          onClick={closeOnSmallScreen}
                          className="block rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition hover:border-indigo-400/50 hover:bg-indigo-500/10"
                        >
                          <span className="block text-sm font-medium text-ink">{l.label} →</span>
                          <span className="block text-xs text-ink-light">{l.desc}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                  {m.cta && (
                    <Link
                      href={m.cta.href}
                      onClick={closeOnSmallScreen}
                      className="inline-block rounded-full bg-gradient-to-r from-indigo-600 to-verdant-500 px-3.5 py-1.5 text-xs font-medium text-white shadow-[0_0_16px_rgba(79,70,229,0.35)] hover:opacity-90"
                    >
                      {m.cta.label} →
                    </Link>
                  )}
                </div>
              )
            )}

            {live !== null &&
              (live === "" ? (
                <TypingDots />
              ) : (
                <p className="max-w-[92%] rounded-2xl rounded-tl-sm bg-white/10 px-3.5 py-2.5 text-sm leading-relaxed text-ink">
                  {live}
                  <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-indigo-300 align-middle" />
                </p>
              ))}
            <div ref={endRef} />
          </div>

          <div className="border-t border-white/10 px-4 pb-3 pt-3">
            <div className="mb-2.5 flex flex-wrap gap-1.5">
              {chips.map((c) => (
                <button
                  key={c.id}
                  onClick={() => ask(c.label, c.id)}
                  className="rounded-full border border-white/15 px-2.5 py-1 text-xs text-ink-light transition hover:border-indigo-400/60 hover:bg-indigo-500/10 hover:text-ink"
                >
                  {c.label}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="field-shell flex items-center gap-2 pl-3 pr-1.5">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={120}
                placeholder="Ask about verification, tests, resume…"
                aria-label="Ask the guide"
                className="h-10 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-light/60"
              />
              <button
                type="submit"
                aria-label="Send"
                className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-500 text-white hover:bg-indigo-400"
              >
                <Icon name="send" className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>
      )}

      {/* the two floating buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        <button
          onClick={() => {
            setFabOpen(false);
            setOpen((v) => !v);
          }}
          aria-expanded={open}
          aria-label="Open the Setu guide"
          className={`flex h-12 items-center gap-2 rounded-full border border-indigo-400/40 bg-[#161a23]/95 px-4 text-sm font-medium text-ink shadow-card backdrop-blur-xl transition hover:border-indigo-300 hover:bg-indigo-500/10 ${
            !open && messages.length === 0 ? "animate-pulse-ring" : ""
          }`}
        >
          <Icon name="sparkle" className="animate-bobble h-4 w-4 text-indigo-300" />
          Guide
        </button>
        <button
          onClick={() => {
            setOpen(false);
            setFabOpen((v) => !v);
          }}
          aria-expanded={fabOpen}
          aria-label="Quick actions"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-verdant-500 text-white shadow-[0_8px_30px_rgba(79,70,229,0.55)] transition hover:scale-105"
        >
          <Icon
            name="plus"
            className={`h-6 w-6 transition-transform duration-300 ${fabOpen ? "rotate-45" : ""}`}
          />
        </button>
      </div>
    </div>
  );
}
