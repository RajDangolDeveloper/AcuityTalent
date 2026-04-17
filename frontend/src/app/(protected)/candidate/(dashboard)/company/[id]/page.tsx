"use client";

import { Building2, Globe, MapPin, BadgeCheck } from "lucide-react";
import { useParams } from "next/navigation";
import { useGetCompanyById } from "@/src/hooks/useCompanyApi";

export default function CandidateCompanyDetailPage() {
  const params = useParams<{ id: string }>();
  const companyId = Number(params?.id);
  const {
    data: company,
    isLoading,
    isError,
  } = useGetCompanyById(Number.isFinite(companyId) ? companyId : null);

  if (isLoading) {
    return <div className="p-6">Loading company details...</div>;
  }

  if (isError || !company) {
    return (
      <div className="p-6 text-red-600">Unable to load company details.</div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {company.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                {company.industry && <span>{company.industry}</span>}
                {company.officeAddress && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={14} /> {company.officeAddress}
                  </span>
                )}
                {company.companySize && <span>{company.companySize}</span>}
                {company.isVerified && (
                  <span className="inline-flex items-center gap-1 text-emerald-600">
                    <BadgeCheck size={14} /> Verified
                  </span>
                )}
              </div>
            </div>

            <div className="h-16 w-16 overflow-hidden rounded-full bg-gray-200">
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={company.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-500">
                  <Building2 size={22} />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6 p-6">
          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-800">About</h2>
            <p className="text-sm leading-6 text-gray-700">
              {company.description || "No company description provided yet."}
            </p>
          </section>

          {company.websiteUrl && (
            <section>
              <h2 className="mb-2 text-lg font-semibold text-gray-800">
                Website
              </h2>
              <a
                href={company.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary-600 hover:underline"
              >
                <Globe size={14} />
                {company.websiteUrl}
              </a>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
