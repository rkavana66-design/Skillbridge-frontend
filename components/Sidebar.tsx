"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuth } from "@/lib/auth";
import { Role } from "@/lib/auth";

interface SidebarProps {
  role: Role;
}

const studentLinks = [
  { href: "/student/dashboard", label: "Dashboard" },
  { href: "/student/profile", label: "Profile" },
  { href: "/student/assessments", label: "Assessments" },
  { href: "/student/resume", label: "Resume" },
  { href: "/student/uploads", label: "Uploads" },
  { href: "/student/external", label: "External profiles" },
];

const recruiterLinks = [
  { href: "/recruiter/dashboard", label: "Dashboard" },
  { href: "/recruiter/search", label: "Search candidates" },
];

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const links = role === "student" ? studentLinks : recruiterLinks;

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  return (
    <aside className="w-56 shrink-0 border-r border-white/10 bg-white/5 backdrop-blur-xl px-3 py-6">
      <nav className="flex flex-col gap-1">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-500/15 text-indigo-300"
                  : "text-ink-light hover:bg-white/5 hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
        <div className="my-2 h-px bg-white/10" />
        <button
          onClick={handleLogout}
          className="rounded-md px-3 py-2 text-left text-sm font-medium text-clay-400 hover:bg-clay-500/10"
        >
          Log out
        </button>
      </nav>
    </aside>
  );
}
