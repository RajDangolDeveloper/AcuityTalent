import React from "react";
import { ResumeData } from "../candidate/InputResumeDetails";

export const ClassicTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  return (
    <div className="max-w-3xl min-h-screen mx-auto bg-white p-8 font-serif">
      {}
      <div className="text-center border-b-2 border-gray-300 pb-4 mb-6">
        <h1 className="text-4xl font-bold uppercase tracking-wide">
          {data.fullName}
        </h1>
        <div className="mt-2 text-gray-600 text-sm">
          {data.email} {data.phone && `| ${data.phone}`}
          {(data.city || data.country) && (
            <> | {[data.city, data.country].filter(Boolean).join(", ")}</>
          )}
        </div>
      </div>

      {data.summary && (
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Professional Summary</h2>
          <p className="text-gray-700">{data.summary}</p>
        </section>
      )}

      {data.experience && data.experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Experience</h2>
          {data.experience.map((job, idx) => (
            <div key={idx} className="mb-5">
              <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-lg">{job.title}</h3>
                <span className="text-gray-600 text-sm italic">
                  {job.start} – {job.end}
                </span>
              </div>
              <p className="text-gray-700">
                {job.employer}
                {job.city && `, ${job.city}`}
              </p>
              <p className="text-gray-600 mt-2">{job.description}</p>
            </div>
          ))}
        </section>
      )}

      {data.education && data.education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Education</h2>
          {data.education.map((edu, idx) => (
            <div key={idx} className="mb-3">
              <div className="flex justify-between items-baseline">
                <h3 className="font-bold">{edu.degree}</h3>
                <span className="text-gray-600 text-sm italic">
                  {edu.start} – {edu.end}
                </span>
              </div>
              <p className="text-gray-700">
                {edu.school}
                {edu.city && `, ${edu.city}`}
              </p>
              {edu.description && (
                <p className="text-gray-600 mt-1">{edu.description}</p>
              )}
            </div>
          ))}
        </section>
      )}

      {data.skills && data.skills.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, idx) => (
              <span key={idx} className="bg-gray-200 px-3 py-1 rounded text-sm">
                {skill.skill}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
