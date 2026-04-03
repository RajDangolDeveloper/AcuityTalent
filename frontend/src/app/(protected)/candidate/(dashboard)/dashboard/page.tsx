"use client";

import {
  useGetCandidateApplicationInterviewRate,
  useGetCandidateApplicationResponseRate,
  useGetCandidateTotalApplication,
  useGetCandidateTotalOffers,
} from "@/src/hooks/useDashboardApi";
import { ArrowDownLeft, Briefcase, Computer, Mail } from "lucide-react";

export default function CandidateDashboard() {
  const { data: responseRateData } = useGetCandidateApplicationResponseRate();
  const { data: interviewRateData } = useGetCandidateApplicationInterviewRate();
  const { data: totalApplicationData } = useGetCandidateTotalApplication(); // Added missing ()
  const { data: totalOffersData } = useGetCandidateTotalOffers();

  const responseRate = responseRateData?.data ?? 0;
  const interviewRate = interviewRateData?.data ?? 0;
  const totalApplications = totalApplicationData?.data ?? 0;
  const totalOffers = totalOffersData?.data ?? 0;

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans text-gray-800">
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-6">Recommended Jobs</h2>

          <div className="border border-gray-200 rounded-lg p-4 flex justify-between items-start">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-md"></div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-indigo-900">
                    IT Support
                  </h3>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded">
                    70%
                  </span>
                </div>
                <p className="text-sm text-gray-500">TechCorp Solutions</p>
                <p className="text-xs text-gray-400 mb-2">📍 Kathmandu</p>
                <div className="flex gap-2">
                  <span className="text-[10px] border border-gray-300 px-2 py-0.5 rounded text-gray-500">
                    Full-Time
                  </span>
                  <span className="text-[10px] border border-gray-300 px-2 py-0.5 rounded text-gray-500">
                    $15,000 - 20,000 USD/Year
                  </span>
                </div>
              </div>
            </div>
            <span className="text-xs text-gray-400 font-medium">
              Posted 4 days ago
            </span>
          </div>
        </div>

        <div className="col-span-4 grid grid-cols-2 gap-4">
          <div className="bg-white border border-indigo-200 rounded-2xl p-6 flex flex-col justify-between">
            <div className="text-primary-500 text-3xl mb-2">
              <ArrowDownLeft size={50} />
            </div>
            <div>
              <div className="text-3xl font-bold">{responseRate}%</div>
              <div className="text-xs text-gray-500">Response Rate</div>
            </div>
          </div>
          <div className="bg-white border border-indigo-200 rounded-2xl p-6 flex flex-col justify-between">
            <div className="text-primary-500 text-3xl mb-2">
              <Briefcase size={50} />
            </div>
            <div>
              <div className="text-3xl font-bold">{interviewRate}%</div>
              <div className="text-xs text-gray-500">Interview Rate</div>
            </div>
          </div>
          <div className="bg-white border border-indigo-200 rounded-2xl p-6 flex flex-col justify-between">
            <div className="text-primary-500 text-3xl mb-2">
              <Computer size={50} />
            </div>
            <div>
              {/* Replaced hardcoded 137 with dynamic data */}
              <div className="text-3xl font-bold">{totalApplications}</div>
              <div className="text-xs text-gray-500">Total Applications</div>
            </div>
          </div>
          <div className="bg-white border border-indigo-200 rounded-2xl p-6 flex flex-col justify-between">
            <div className="text-primary-500 text-3xl mb-2">
              <Mail size={50} />
            </div>
            <div>
              <div className="text-3xl font-bold">{totalOffers}</div>
              <div className="text-xs text-gray-500">Offers</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Recent Jobs Applications</h2>
            <a href="#" className="text-sm font-bold">
              see all{" "}
            </a>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-600 border-b border-gray-200">
                <th className="pb-4 font-semibold">Job Title</th>
                <th className="pb-4 font-semibold">Status</th>
                <th className="pb-4 font-semibold">Location Type</th>
                <th className="pb-4 font-semibold">Location</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-gray-50 last:border-0">
                <td className="py-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  Senior Frontend Developer
                </td>
                <td className="py-4">In Review</td>
                <td className="py-4">Remote</td>
                <td className="py-4">Kathmandu, Nepal</td>
              </tr>
              <tr className="border-b border-gray-50 last:border-0">
                <td className="py-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  Senior Frontend Developer
                </td>
                <td className="py-4">In Review</td>
                <td className="py-4">Remote</td>
                <td className="py-4">Kathmandu, Nepal</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="col-span-4 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-6">Activity</h2>
          <div className="border border-gray-200 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <span className="text-xs font-semibold">
                Junior Frontend Developer
              </span>
            </div>
            <span className="text-[10px] border border-indigo-400 text-indigo-600 px-2 py-0.5 rounded">
              2:30
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
