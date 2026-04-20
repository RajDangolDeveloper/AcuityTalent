"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Markdown from "react-markdown";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Copy,
  DollarSign,
  MapPin,
  Share2,
  Sparkles,
} from "lucide-react";
import Notification from "@/src/element/Notification";
import { usePublicJobDetails } from "@/src/hooks/useJobApi";

export default function PublicJobPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const jobId = params?.id ? Number(params.id) : null;
  const { data: job, isLoading, isError } = usePublicJobDetails(jobId);

  useEffect(() => {
    if (job?.title) {
      document.title = `${job.title} | AcuityTalent`;
    }
  }, [job?.title]);

  const handleCopyLink = async () => {
    if (!job) return;

    try {
      const shareUrl = window.location.href;
      await navigator.clipboard.writeText(shareUrl);
      Notification({
        toastMessage: "Job link copied",
        toastStatus: "success",
      });
    } catch {
      Notification({
        toastMessage: "Failed to copy job link",
        toastStatus: "error",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 text-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
          <p className="text-white/70">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="min-h-dvh bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur">
          <p className="text-2xl font-bold">Job not found</p>
          <p className="mt-2 text-white/70">
            This link may be invalid or the job is no longer public.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => router.back()}
              className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10"
            >
              Go back
            </button>
            <Link
              href="/"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const postedLabel = job.postedDate
    ? new Date(job.postedDate).toLocaleDateString()
    : "Recently posted";

  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top,#1f2a44_0%,#0b1020_48%,#06070d_100%)] text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-2 rounded-full bg-secondary-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-secondary-400"
          >
            <Share2 className="h-4 w-4" />
            Share job
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/8 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  <Sparkles className="h-3.5 w-3.5" />
                  Public job share
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
                  {job.title}
                </h1>
                <p className="mt-3 text-lg text-white/70">{job.companyName}</p>
              </div>
            </div>

            <div className="mb-8 flex flex-wrap gap-3">
              {job.employmentType && (
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/85">
                  {job.employmentType.replace(/_/g, "-")}
                </span>
              )}
              {job.experienceLevel && (
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/85">
                  {job.experienceLevel}
                </span>
              )}
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/85">
                {job.remoteAvailable ? "Remote" : "On-site"}
              </span>
              {job.salaryRange && (
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/85">
                  {job.salaryRange}
                </span>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm text-white/60">
                  <MapPin className="h-4 w-4" />
                  Location
                </div>
                <p className="font-semibold text-white">{job.location}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm text-white/60">
                  <Briefcase className="h-4 w-4" />
                  Type
                </div>
                <p className="font-semibold text-white">
                  {job.employmentType.replace(/_/g, " ")}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm text-white/60">
                  <DollarSign className="h-4 w-4" />
                  Salary
                </div>
                <p className="font-semibold text-white">
                  {job.salaryRange || "Not specified"}
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-8 text-white/85">
              <section>
                <h2 className="mb-3 text-xl font-semibold text-white">
                  About the job
                </h2>
                <div className="prose prose-invert max-w-none prose-p:text-white/80">
                  <Markdown>{job.description}</Markdown>
                </div>
              </section>

              {job.requirements && (
                <section>
                  <h2 className="mb-3 text-xl font-semibold text-white">
                    Requirements
                  </h2>
                  <div className="prose prose-invert max-w-none prose-p:text-white/80">
                    <Markdown>{job.requirements}</Markdown>
                  </div>
                </section>
              )}
            </div>
          </div>

          <aside className="space-y-6 rounded-[28px] border border-white/10 bg-white/8 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-white/45">
                Job Snapshot
              </p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                {job.companyName}
              </h3>
              <p className="mt-2 text-sm text-white/60">Posted {postedLabel}</p>
              <p className="mt-1 text-sm text-white/60">
                {job.viewsCount} views so far
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
              <div className="flex items-center gap-2 text-white/70">
                <Copy className="h-4 w-4" />
                <span className="text-sm font-medium">Share this link</span>
              </div>
              <p className="mt-2 break-all rounded-xl bg-black/20 px-3 py-2 text-sm text-white/70">
                {typeof window !== "undefined" ? window.location.href : ""}
              </p>
              <button
                onClick={handleCopyLink}
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-100"
              >
                Copy link
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              <p className="font-semibold text-white">Apply next</p>
              <p className="mt-2">
                Sign in as a candidate to save, track, and apply for this job.
              </p>
              <Link
                href="/candidate/login"
                className="mt-4 inline-flex rounded-xl bg-secondary-500 px-4 py-2 font-semibold text-slate-950 hover:bg-secondary-400"
              >
                Candidate login
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
