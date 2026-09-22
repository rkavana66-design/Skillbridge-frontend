"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthUser, clearAuth, getAuth } from "@/lib/auth";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getAuth().user);
  }, []);

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  return (
    <nav className="border-b border-white/10 bg-paper/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-verdant-500 font-display text-sm font-bold text-white shadow-[0_0_16px_rgba(79,70,229,0.5)]">
            S
          </span>
          <span className="font-display text-lg font-semibold text-ink">Setu</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-ink leading-tight">{user.name}</p>
              <p className="text-xs capitalize text-ink-light leading-tight">{user.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-md border border-white/15 px-3 py-1.5 text-sm font-medium text-ink hover:bg-white/5"
            >
              Log out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-ink-light hover:text-ink"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-gradient-to-r from-indigo-600 to-verdant-500 px-4 py-2 text-sm font-medium text-white shadow-[0_0_20px_rgba(79,70,229,0.35)] hover:opacity-90"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
