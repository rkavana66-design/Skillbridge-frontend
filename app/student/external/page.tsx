"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Card from "@/components/ui/Card";
import Label from "@/components/ui/Label";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { getAuth } from "@/lib/auth";
import {
  ApiError,
  getStudentProfile,
  StudentProfile,
  updateExternalProfiles,
  uploadProfilePhoto,
  verifyExternalProfiles,
} from "@/lib/api";

type Notice = { type: "success" | "error"; text: string } | null;

export default function StudentExternalPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [leetcodeUrl, setLeetcodeUrl] = useState("");
  const [summary, setSummary] = useState("");

  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  function loadProfile() {
    return getStudentProfile().then((p) => {
      setProfile(p);
      setGithubUrl(p.github_url ?? "");
      setLinkedinUrl(p.linkedin_url ?? "");
      setLeetcodeUrl(p.leetcode_url ?? "");
      setSummary(p.summary ?? "");
    });
  }

  useEffect(() => {
    const { token, user } = getAuth();
    if (!token || user?.role !== "student") {
      router.push("/login");
      return;
    }
    loadProfile()
      .catch(() => setNotice({ type: "error", text: "Could not load your profile." }))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      await updateExternalProfiles({
        github_url: githubUrl || undefined,
        linkedin_url: linkedinUrl || undefined,
        leetcode_url: leetcodeUrl || undefined,
        summary: summary || undefined,
      });
      await loadProfile();
      setNotice({ type: "success", text: "Profile saved." });
    } catch (err) {
      setNotice({
        type: "error",
        text: err instanceof ApiError ? err.message : "Could not save profiles.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    setNotice(null);
    try {
      await uploadProfilePhoto(file);
      await loadProfile();
      setNotice({ type: "success", text: "Profile photo updated." });
    } catch (err) {
      setNotice({
        type: "error",
        text: err instanceof ApiError ? err.message : "Could not upload photo.",
      });
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  }

  async function handleVerify() {
    setVerifying(true);
    setNotice(null);
    try {
      await verifyExternalProfiles();
      await loadProfile();
      setNotice({ type: "success", text: "Verification complete." });
    } catch (err) {
      setNotice({
        type: "error",
        text: err instanceof ApiError ? err.message : "Verification failed.",
      });
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-paper">
      <div
        aria-hidden
        className="animate-float-slow pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-gradient-to-br from-amber-200/35 to-transparent blur-3xl"
      />
      <Navbar />
      <div className="flex">
        <Sidebar role="student" />
        <main className="flex-1 px-8 py-8">
          <h1 className="animate-fade-up font-display text-2xl font-semibold text-ink">External profiles</h1>
          <p className="mt-1 text-sm text-ink-light">
            Add a photo and short bio, link your GitHub, LinkedIn and LeetCode. GitHub and LeetCode
            can be verified automatically.
          </p>

          {loading ? (
            <p className="mt-6 text-sm text-ink-light">Loading…</p>
          ) : (
            <div className="mt-8 flex max-w-3xl flex-col gap-6">
              <Card title="Photo">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-indigo-100 bg-indigo-50">
                    {profile?.profile_photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profile.profile_photo_url}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-bold text-indigo-500">
                        {(profile?.name ?? "?").slice(0, 1).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handlePhotoChange}
                      disabled={uploadingPhoto}
                    />
                    <p className="mt-1.5 text-xs text-ink-light">JPEG or PNG, up to 5MB.</p>
                  </div>
                </div>
              </Card>

              <div className="grid gap-6 lg:grid-cols-2">
              <Card title="Links">
                <form onSubmit={handleSave} className="flex flex-col gap-4">
                  <div>
                    <Label htmlFor="github">GitHub URL</Label>
                    <Input
                      id="github"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedin">LinkedIn URL</Label>
                    <Input
                      id="linkedin"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="leetcode">LeetCode URL</Label>
                    <Input
                      id="leetcode"
                      value={leetcodeUrl}
                      onChange={(e) => setLeetcodeUrl(e.target.value)}
                      placeholder="https://leetcode.com/username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="summary">Short bio</Label>
                    <textarea
                      id="summary"
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="A couple of sentences about you — like a LinkedIn headline and summary."
                      rows={4}
                      className="w-full rounded-md border border-indigo-100 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-light/50 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" loading={saving}>
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      loading={verifying}
                      onClick={handleVerify}
                    >
                      Verify
                    </Button>
                  </div>

                  {notice && (
                    <p
                      className={`rounded-md px-3 py-2 text-sm ${
                        notice.type === "success"
                          ? "bg-verdant-50 text-verdant-600"
                          : "bg-clay-50 text-clay-500"
                      }`}
                    >
                      {notice.text}
                    </p>
                  )}
                </form>
              </Card>

              <Card title="Verification results">
                <div className="flex flex-col gap-4 text-sm">
                  <ResultRow
                    label="GitHub"
                    verified={Boolean(profile?.github_username)}
                    detail={
                      profile?.github_username
                        ? `Verified as @${profile.github_username}`
                        : "Not yet verified"
                    }
                  />
                  <ResultRow
                    label="LeetCode"
                    verified={Boolean(profile?.leetcode_username)}
                    detail={
                      profile?.leetcode_username
                        ? `Verified as ${profile.leetcode_username}${
                            profile.leetcode_rating ? ` · Rating ${profile.leetcode_rating}` : ""
                          }`
                        : "Not yet verified"
                    }
                  />
                  <ResultRow
                    label="LinkedIn"
                    verified={false}
                    detail={
                      profile?.linkedin_url
                        ? "Self-reported — not independently verified"
                        : "Not added"
                    }
                  />
                </div>
              </Card>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function ResultRow({
  label,
  verified,
  detail,
}: {
  label: string;
  verified: boolean;
  detail: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-indigo-50 pb-3 last:border-0 last:pb-0">
      <p className="font-medium text-ink">{label}</p>
      <span className={verified ? "text-verdant-600" : "text-ink-light"}>{detail}</span>
    </div>
  );
}
