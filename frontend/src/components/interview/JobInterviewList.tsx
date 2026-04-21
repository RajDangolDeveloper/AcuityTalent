"use client";
import { useState } from "react";
import { Menu, LayoutGrid, MoreVertical, Users } from "lucide-react";

const JOBS_DATA = [
  {
    id: 1,
    company: "Google",
    position: "Frontend Engineer",
    applicants: 45,
    status: "Active",
  },
  {
    id: 2,
    company: "Meta",
    position: "Product Designer",
    applicants: 12,
    status: "Urgent",
  },
  {
    id: 3,
    company: "Vercel",
    position: "Solutions Architect",
    applicants: 8,
    status: "Closed",
  },
];

export default function JobInterviewList() {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  return (
    <div className="w-full bg-white">
      {}
      <div className="flex justify-between px-8 py-7 items-center border-b border-gray-50">
        <div className="text-2xl font-semibold text-slate-800">Jobs</div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white shadow-sm text-indigo-600" : "text-gray-400"}`}
          >
            <Menu size={20} />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-indigo-600" : "text-gray-400"}`}
          >
            <LayoutGrid size={20} />
          </button>
        </div>
      </div>

      <div className="p-6">
        {viewMode === "list" ? (
          <table className="w-full text-left">
            <thead className="text-xs text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Position</th>
                <th className="px-4 py-3 font-medium">Applicants</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {JOBS_DATA.map((job) => (
                <tr
                  key={job.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-4 py-4 font-bold text-slate-700">
                    {job.company}
                  </td>
                  <td className="px-4 py-4 text-slate-600">{job.position}</td>
                  <td className="px-4 py-4 text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Users size={14} /> {job.applicants}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        job.status === "Active"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-orange-50 text-orange-600"
                      }`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button className="text-gray-300 hover:text-gray-600">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {JOBS_DATA.map((job) => (
              <div
                key={job.id}
                className="p-5 border border-gray-100 rounded-2xl bg-slate-50/50 hover:border-indigo-100 transition-all"
              >
                <h3 className="font-bold text-slate-800">{job.position}</h3>
                <p className="text-sm text-slate-500 mb-4">{job.company}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">
                    {job.applicants} Applicants
                  </span>
                  <span className="text-xs font-bold text-indigo-600 uppercase">
                    {job.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
