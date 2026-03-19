"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateCompanyForm() {
  const router = useRouter();
  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-primary-500 hover:text-primary-600 mb-4 font-semibold"
      >
        <ArrowLeft size={20} />
        Back
      </button>
      <div className="max-w-7xl mx-auto bg-white rounded-lg border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Company</h1>
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
                  placeholder="eg. LinkedIn"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Size
                </label>
                <select
                  defaultValue=""
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
                  defaultValue=""
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
              placeholder="Write a detailed job description using markdown formatting..."
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-primary-500 text-white font-semibold rounded hover:bg-primary-600 transition"
            >
              Create Company
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
