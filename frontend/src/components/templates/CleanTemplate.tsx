import React from "react";
import { ResumeData } from "../candidate/InputResumeDetails";

export const CleanTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  return (
    <div className="max-w-3xl min-h-screen mx-auto bg-white p-12">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-light text-gray-800">{data.fullName}</h1>
          <div className="mt-3 flex justify-center gap-4 text-sm text-gray-500">
            {data.email && <span>{data.email}</span>}
            {data.phone && <span>{data.phone}</span>}
            {(data.city || data.country) && (
              <span>
                {[data.city, data.country].filter(Boolean).join(", ")}
              </span>
            )}
          </div>
        </div>

        {data.summary && (
          <section className="border-t border-gray-200 pt-6">
            <h2 className="text-sm uppercase tracking-widest text-gray-400 mb-3">
              Summary
            </h2>
            <p className="text-gray-700 leading-relaxed">{data.summary}</p>
          </section>
        )}

        {data.experience && data.experience.length > 0 && (
          <section className="border-t border-gray-200 pt-6">
            <h2 className="text-sm uppercase tracking-widest text-gray-400 mb-4">
              Experience
            </h2>
            {data.experience.map((job, idx) => (
              <div key={idx} className="mb-5">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-medium text-gray-800">{job.title}</h3>
                  <span className="text-xs text-gray-500">
                    {job.start} – {job.end}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">
                  {job.employer}
                  {job.city && `, ${job.city}`}
                </p>
                <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                  {job.description}
                </p>
              </div>
            ))}
          </section>
        )}

        {data.education && data.education.length > 0 && (
          <section className="border-t border-gray-200 pt-6">
            <h2 className="text-sm uppercase tracking-widest text-gray-400 mb-4">
              Education
            </h2>
            {data.education.map((edu, idx) => (
              <div key={idx} className="mb-3">
                <div className="flex justify-between">
                  <h3 className="font-medium">{edu.degree}</h3>
                  <span className="text-xs text-gray-500">
                    {edu.start} – {edu.end}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">
                  {edu.school}
                  {edu.city && `, ${edu.city}`}
                </p>
              </div>
            ))}
          </section>
        )}

        {data.skills && data.skills.length > 0 && (
          <section className="border-t border-gray-200 pt-6">
            <h2 className="text-sm uppercase tracking-widest text-gray-400 mb-3">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm"
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
