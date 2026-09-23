"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Card from "@/components/ui/Card";
import Label from "@/components/ui/Label";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { getAuth } from "@/lib/auth";
import { addProject, addSkill, ApiError, getDocumentVerification, getStudentProfile, scanDocument, uploadDocument, VerificationStatus } from "@/lib/api";
import VerificationBadge from "@/components/ui/VerificationBadge";

type Notice = { type: "success" | "error"; text: string } | null;

export default function StudentUploadsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { token, user } = getAuth();
    if (!token || user?.role !== "student") {
      router.push("/login");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="flex">
          <Sidebar role="student" />
          <main className="flex-1 px-8 py-8">
            <p className="text-sm text-ink-light">Loading…</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-paper">
      <div
        aria-hidden
        className="animate-float-slower pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-gradient-to-br from-verdant-200/35 to-transparent blur-3xl"
      />
      <Navbar />
      <div className="flex">
        <Sidebar role="student" />
        <main className="flex-1 px-8 py-8">
          <h1 className="animate-fade-up font-display text-2xl font-semibold text-ink">Add to your profile</h1>
          <p className="mt-1 text-sm text-ink-light">
            Upload certificates and add skills or projects. Certificates are scanned automatically.
          </p>

          <div className="mt-8 grid max-w-3xl gap-6">
            <UploadDocumentCard />
            <AddSkillCard />
            <AddProjectCard />
          </div>
        </main>
      </div>
    </div>
  );
}

function NoticeBanner({ notice }: { notice: Notice }) {
  if (!notice) return null;
  return (
    <p
      className={`mt-4 rounded-md px-3 py-2 text-sm ${
        notice.type === "success"
          ? "bg-verdant-50 text-verdant-600"
          : "bg-clay-50 text-clay-500"
      }`}
    >
      {notice.text}
    </p>
  );
}

function UploadDocumentCard() {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState("certificate");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<VerificationStatus | null>(null);
  const [resultNotes, setResultNotes] = useState<string | null>(null);

  async function pollVerification(documentId: string | number) {
    // Poll a handful of times since scanning may take a moment; stop early
    // once the status leaves "pending".
    for (let attempt = 0; attempt < 8; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      try {
        const res = await getDocumentVerification(documentId);
        setResult(res.verification_status);
        setResultNotes((res as any).verification_details?.notes ?? null);
        if (res.verification_status !== "pending") {
          return;
        }
      } catch {
        // Keep trying — a transient failure here shouldn't stop polling.
      }
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) {
      setNotice({ type: "error", text: "Choose a file to upload." });
      return;
    }
    setLoading(true);
    setNotice(null);
    setResult(null);
    setResultNotes(null);
    try {
      const uploaded = await uploadDocument(file, type);
      setNotice({ type: "success", text: "Document uploaded — running AI verification…" });
      setFile(null);
      (document.getElementById("file-input") as HTMLInputElement | null)?.value &&
        ((document.getElementById("file-input") as HTMLInputElement).value = "");

      if (uploaded.id !== undefined) {
        setScanning(true);
        try {
          await scanDocument(uploaded.id);
        } catch {
          // Scan may already run automatically server-side — fall through to polling either way.
        }
        await pollVerification(uploaded.id);
        setScanning(false);
      }
    } catch (err) {
      setNotice({
        type: "error",
        text: err instanceof ApiError ? err.message : "Upload failed. Try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card title="Upload a certificate or document">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="file-input">File</Label>
          <Input
            id="file-input"
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <div>
          <Label htmlFor="doc-type">Type</Label>
          <div className="field-shell">
            <select
              id="doc-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-md bg-transparent px-3.5 py-2.5 text-sm text-ink outline-none"
            >
              <option value="certificate">Certificate</option>
              <option value="internship">Internship letter</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <Button type="submit" loading={loading} className="self-start">
          Upload document
        </Button>
        <NoticeBanner notice={notice} />
        {scanning && (
          <p className="flex items-center gap-2 text-sm text-ink-light">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
            Running AI verification on your document…
          </p>
        )}
        {!scanning && result && (
          <div className="text-sm text-ink-light">
            <div className="flex items-center gap-2">
              Result: <VerificationBadge status={result} />
              {result === "pending" && (
                <span className="text-xs">Still processing — check your Profile page shortly.</span>
              )}
            </div>
            {resultNotes && <p className="mt-2 text-xs text-ink-light">{resultNotes}</p>}
          </div>
        )}
      </form>
    </Card>
  );
}

function AddSkillCard() {
  const [name, setName] = useState("");
  const [proficiency, setProficiency] = useState(60);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setNotice(null);
    try {
      await addSkill({ name, proficiency, source: source || undefined });
      setNotice({ type: "success", text: `Added "${name}" to your skills.` });
      setName("");
      setSource("");
      setProficiency(60);
    } catch (err) {
      setNotice({
        type: "error",
        text: err instanceof ApiError ? err.message : "Could not add skill.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card title="Add a skill">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="skill-name">Skill</Label>
          <Input
            id="skill-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="React"
            required
          />
        </div>
        <div>
          <Label htmlFor="skill-proficiency">Proficiency ({proficiency}%)</Label>
          <input
            id="skill-proficiency"
            type="range"
            min={0}
            max={100}
            value={proficiency}
            onChange={(e) => setProficiency(Number(e.target.value))}
            className="w-full accent-indigo-600"
          />
        </div>
        <div>
          <Label htmlFor="skill-source">Source (optional)</Label>
          <Input
            id="skill-source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Coursework, internship, project…"
          />
        </div>
        <Button type="submit" loading={loading} className="self-start">
          Add skill
        </Button>
        <NoticeBanner notice={notice} />
      </form>
    </Card>
  );
}

function AddProjectCard() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [techStack, setTechStack] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setNotice(null);
    try {
      await addProject({
        title,
        description,
        tech_stack: techStack,
        github_url: githubUrl || undefined,
      });
      setNotice({ type: "success", text: `Added "${title}" to your projects.` });
      setTitle("");
      setDescription("");
      setTechStack("");
      setGithubUrl("");
    } catch (err) {
      setNotice({
        type: "error",
        text: err instanceof ApiError ? err.message : "Could not add project.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card title="Add a project">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="project-title">Title</Label>
          <Input
            id="project-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Campus Placement Tracker"
            required
          />
        </div>
        <div>
          <Label htmlFor="project-description">Description</Label>
          <Input
            id="project-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What it does and the problem it solves"
            required
          />
        </div>
        <div>
          <Label htmlFor="project-stack">Tech stack</Label>
          <Input
            id="project-stack"
            value={techStack}
            onChange={(e) => setTechStack(e.target.value)}
            placeholder="Next.js, FastAPI, PostgreSQL"
            required
          />
        </div>
        <div>
          <Label htmlFor="project-github">GitHub URL (optional)</Label>
          <Input
            id="project-github"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/username/repo"
          />
        </div>
        <Button type="submit" loading={loading} className="self-start">
          Add project
        </Button>
        <NoticeBanner notice={notice} />
      </form>
    </Card>
  );
}
