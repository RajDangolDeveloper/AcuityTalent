import React from "react";
import { ResumeData } from "../candidate/InputResumeDetails";

export const ModernTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  return (
    <div className="max-w-4xl min-h-screen mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="grid grid-cols-3 gap-0">
        <div className="col-span-1 min-h-screen bg-indigo-700 text-white p-6">
          <h1 className="text-2xl font-bold">{data.fullName}</h1>
          <div className="mt-6 space-y-3 text-sm">
            {data.email && <div>📧 {data.email}</div>}
            {data.phone && <div>📞 {data.phone}</div>}
            {(data.city || data.country) && (
              <div>
                📍 {[data.city, data.country].filter(Boolean).join(", ")}
              </div>
            )}
            {data.nationality && <div>🌍 {data.nationality}</div>}
          </div>
          {data.skills && data.skills.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-3">Skills</h2>
              <div className="space-y-2">
                {data.skills.map((skill, i) => (
                  <div key={i}>
                    <span className="text-sm">{skill.skill}</span>
                    <div className="w-full bg-indigo-500 rounded-full h-1.5 mt-1">
                      <div
                        className="bg-white h-1.5 rounded-full"
                        style={{ width: `${skill.level * 10}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="col-span-2 p-6">
          {data.summary && (
            <section className="mb-6">
              <h2 className="text-xl font-semibold border-b border-gray-300 pb-1 mb-3">
                Professional Summary
              </h2>
              <p className="text-gray-700">{data.summary}</p>
            </section>
          )}

          {data.experience && data.experience.length > 0 && (
            <section className="mb-6">
              <h2 className="text-xl font-semibold border-b border-gray-300 pb-1 mb-3">
                Experience
              </h2>
              {data.experience.map((job, idx) => (
                <div key={idx} className="mb-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold">{job.title}</h3>
                    <span className="text-sm text-gray-600">
                      {job.start} – {job.end}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">
                    {job.employer}
                    {job.city && `, ${job.city}`}
                  </p>
                  <p className="text-gray-600 mt-1 text-sm">
                    {job.description}
                  </p>
                </div>
              ))}
            </section>
          )}

          {data.education && data.education.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold border-b border-gray-300 pb-1 mb-3">
                Education
              </h2>
              {data.education.map((edu, idx) => (
                <div key={idx} className="mb-3">
                  <div className="flex justify-between">
                    <h3 className="font-bold">{edu.degree}</h3>
                    <span className="text-sm text-gray-600">
                      {edu.start} – {edu.end}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">
                    {edu.school}
                    {edu.city && `, ${edu.city}`}
                  </p>
                  {edu.description && (
                    <p className="text-gray-600 text-sm mt-1">
                      {edu.description}
                    </p>
                  )}
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
