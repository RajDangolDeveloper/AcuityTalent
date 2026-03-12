import React from "react";
import { ResumeData } from "../candidate/InputResumeDetails";

export const SpecialistTemplate: React.FC<{ data: ResumeData }> = ({
  data,
}) => {
  return (
    <div className="max-w-4xl min-h-screen mx-auto bg-white p-8 border-l-8 border-green-600 shadow">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left column: Contact & Skills (more prominent) */}
        <div className="md:w-1/3">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {data.fullName}
          </h1>
          <div className="space-y-2 text-sm text-gray-600 mb-6">
            {data.email && <div>{data.email}</div>}
            {data.phone && <div>{data.phone}</div>}
            {(data.city || data.country) && (
              <div>{[data.city, data.country].filter(Boolean).join(", ")}</div>
            )}
          </div>

          {data.skills && data.skills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold uppercase tracking-wide text-green-700 mb-3">
                Core Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-md text-sm font-medium"
                  >
                    {skill.skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column: Summary, Experience, Education */}
        <div className="md:w-2/3 space-y-6">
          {data.summary && (
            <section>
              <h2 className="text-xl font-semibold border-b-2 border-green-600 pb-1 mb-3">
                Profile
              </h2>
              <p className="text-gray-700">{data.summary}</p>
            </section>
          )}

          {data.experience && data.experience.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold border-b-2 border-green-600 pb-1 mb-3">
                Experience
              </h2>
              {data.experience.map((job, idx) => (
                <div key={idx} className="mb-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">{job.title}</h3>
                    <span className="text-sm text-gray-600">
                      {job.start} – {job.end}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">
                    {job.employer}
                    {job.city && `, ${job.city}`}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    {job.description}
                  </p>
                </div>
              ))}
            </section>
          )}

          {data.education && data.education.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold border-b-2 border-green-600 pb-1 mb-3">
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
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
