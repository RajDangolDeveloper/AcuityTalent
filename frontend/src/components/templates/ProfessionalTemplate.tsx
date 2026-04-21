import React from "react";
import { ResumeData } from "../candidate/InputResumeDetails";

export const ProfessionalTemplate: React.FC<{ data: ResumeData }> = ({
  data,
}) => {
  return (
    <div className="max-w-4xl min-h-screen mx-auto bg-white p-8 border-t-4 border-blue-600 shadow">
      {}
      <div className="mb-6">
        <h1 className="text-3xl font-light text-gray-800">{data.fullName}</h1>
        <div className="flex flex-wrap gap-x-4 text-sm text-gray-600 mt-2">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>{data.phone}</span>}
          {(data.city || data.country) && (
            <span>{[data.city, data.country].filter(Boolean).join(", ")}</span>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {data.summary && (
          <section>
            <h2 className="text-lg font-semibold uppercase tracking-wider text-blue-600 mb-2">
              Summary
            </h2>
            <p className="text-gray-700">{data.summary}</p>
          </section>
        )}

        {data.experience && data.experience.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold uppercase tracking-wider text-blue-600 mb-3">
              Experience
            </h2>
            {data.experience.map((job, idx) => (
              <div key={idx} className="mb-4">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-gray-800">{job.title}</h3>
                  <span className="text-sm text-gray-600">
                    {job.start} – {job.end}
                  </span>
                </div>
                <p className="text-gray-700 text-sm">
                  {job.employer}
                  {job.city && `, ${job.city}`}
                </p>
                <p className="text-gray-600 text-sm mt-1">{job.description}</p>
              </div>
            ))}
          </section>
        )}

        {data.education && data.education.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold uppercase tracking-wider text-blue-600 mb-3">
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

        {data.skills && data.skills.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold uppercase tracking-wider text-blue-600 mb-3">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {skill.skill}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
