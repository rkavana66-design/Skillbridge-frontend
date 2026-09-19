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
    <nav className="bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 shadow-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white font-display text-sm font-bold text-indigo-600">
            S
          </span>
          <span className="font-display text-lg font-semibold text-white">Setu</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-white leading-tight">{user.name}</p>
              <p className="text-xs capitalize text-indigo-100 leading-tight">{user.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-md border border-white/40 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10"
            >
              Log out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-indigo-100 hover:text-white"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
