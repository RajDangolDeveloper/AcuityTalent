"use client";

import { useState, useEffect } from "react";
import { Building2 } from "lucide-react";
import {
  useGetRecruiterCompanies,
  useUpdateCompany,
} from "@/src/hooks/useCompanyApi";

export default function ViewCompanyPage() {
  const { data: company, isLoading, error } = useGetRecruiterCompanies();
  const updateCompany = useUpdateCompany();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    size: "",
    industry: "",
    address: "",
    website: "",
    description: "",
  });

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || "",
        size: company.companySize || "",
        industry: company.industry || "",
        address: company.officeAddress || "",
        website: company.websiteUrl || "",
        description: company.description || "",
      });
    }
  }, [company]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!company) return;
    try {
      await updateCompany.mutateAsync({
        id: company.id,
        data: {
          name: formData.name,
          companySize: formData.size as any,
          industry: formData.industry as any,
          officeAddress: formData.address,
          websiteUrl: formData.website,
          description: formData.description,
        },
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update company:", error);
    }
  };

  const handleCancel = () => {
    if (company) {
      setFormData({
        name: company.name || "",
        size: company.companySize || "",
        industry: company.industry || "",
        address: company.officeAddress || "",
        website: company.websiteUrl || "",
        description: company.description || "",
      });
    }
    setIsEditing(false);
  };

  if (isLoading) return <div className="p-6">Loading company...</div>;
  if (error)
    return <div className="p-6 text-red-500">Error loading company</div>;
  if (!company)
    return (
      <div className="p-6 h-full w-full flex flex-row gap-2 justify-center items-center ">
        <Building2 className="font-semibold" size={48} />
        <div className="text-xl font-semibold">No Company Found</div>
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-lg border border-gray-200 overflow-hidden">
        {!isEditing ? (
          <>
            <div className="p-8 border-b border-gray-200">
              <div className="flex justify-between items-center px-4">
                <div>
                  <div className="flex gap-4">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {company.name}
                    </h1>
                    {company.isVerified && (
                      <span className="inline-flex items-center gap-1 text-primary-600 font-medium">
                        Verified
                        <svg
                          className="w-4 h-4 fill-current"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812z"
                            clipRule="evenodd"
                          />
                          <path
                            className="text-white"
                            fillRule="evenodd"
                            d="M13.78 7.72a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-2-2a.75.75 0 011.06-1.06l1.47 1.47 3.97-3.97a.75.75 0 011.06 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    {company.websiteUrl && (
                      <a
                        href={company.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-500 hover:underline"
                      >
                        {company.websiteUrl}
                      </a>
                    )}
                    <span>•</span>
                    <span>{company.industry || "N/A"}</span>
                    <span>•</span>
                    <span>{company.officeAddress || "N/A"}</span>
                  </div>
                </div>
                <div className="w-30 h-30 bg-gray-300 rounded-full">
                  {company.logoUrl && (
                    <img
                      src={company.logoUrl}
                      alt={company.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="p-12">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                About the Company
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {company.description || "No description provided."}
              </p>
            </div>
          </>
        ) : (
          <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Edit Company
            </h1>

            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Main Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="eg. LinkedIn"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Company Size
                    </label>
                    <select
                      name="size"
                      value={formData.size}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border form-select appearance-none pr-8 pl-4 bg-no-repeat border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
                    >
                      <option value="" disabled>
                        Select company size
                      </option>
                      <option value="ONE_TO_TEN">1‑10 employees</option>
                      <option value="ELEVEN_TO_FIFTY">11‑50 employees</option>
                      <option value="FIFTY_ONE_TO_TWO_HUNDRED">
                        51‑200 employees
                      </option>
                      <option value="TWO_HUNDRED_ONE_TO_FIVE_HUNDRED">
                        201‑500 employees
                      </option>
                      <option value="FIVE_HUNDRED_ONE_TO_ONE_THOUSAND">
                        501‑1000 employees
                      </option>
                      <option value="ONE_THOUSAND_PLUS">1000+ employees</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Industry
                    </label>
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border form-select appearance-none pr-8 pl-4 bg-no-repeat border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
                    >
                      <option value="" disabled>
                        Select industry
                      </option>
                      <option value="TECHNOLOGY">Technology</option>
                      <option value="FINANCE">Finance</option>
                      <option value="HEALTHCARE">Healthcare</option>
                      <option value="EDUCATION">Education</option>
                      <option value="RETAIL">Retail</option>
                      <option value="MANUFACTURING">Manufacturing</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="eg. Kathmandu, Nepal"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Website URL
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="eg. www.linkedin.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Write a detailed company description using markdown formatting..."
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleCancel}
                  className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-primary-500 text-white font-semibold rounded hover:bg-primary-600 transition disabled:opacity-50"
                >
                  {"Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {!isEditing && (
        <div className="max-w-7xl flex mx-auto justify-end items-end mt-4">
          <button
            onClick={() => setIsEditing(true)}
            className="bg-primary-500 text-white px-6 py-4 rounded-xl hover:bg-primary-600 transition"
          >
            Edit Company
          </button>
        </div>
      )}
    </div>
  );
}
