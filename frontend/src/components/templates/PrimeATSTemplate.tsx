import React from "react";
import { ResumeData } from "../candidate/InputResumeDetails";

export const PrimeATSTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  return (
    <div className="max-w-3xl min-h-screen mx-auto bg-white p-8 font-sans">
      <div className="space-y-5">
        <div>
          <h1 className="text-3xl font-bold">{data.fullName}</h1>
          <div className="text-sm text-gray-700 mt-1">
            {data.email} | {data.phone} |{" "}
            {[data.city, data.country].filter(Boolean).join(", ")}
          </div>
        </div>

        {data.summary && (
          <section>
            <h2 className="text-xl font-bold border-b border-gray-400 pb-1">
              SUMMARY
            </h2>
            <p className="mt-2">{data.summary}</p>
          </section>
        )}

        {data.experience && data.experience.length > 0 && (
          <section>
            <h2 className="text-xl font-bold border-b border-gray-400 pb-1">
              EXPERIENCE
            </h2>
            {data.experience.map((job, idx) => (
              <div key={idx} className="mt-3">
                <div className="flex justify-between font-bold">
                  <span>{job.title}</span>
                  <span className="font-normal">
                    {job.start} – {job.end}
                  </span>
                </div>
                <div className="text-gray-700">
                  {job.employer}
                  {job.city && `, ${job.city}`}
                </div>
                <p className="text-gray-600 mt-1">{job.description}</p>
              </div>
            ))}
          </section>
        )}

        {data.education && data.education.length > 0 && (
          <section>
            <h2 className="text-xl font-bold border-b border-gray-400 pb-1">
              EDUCATION
            </h2>
            {data.education.map((edu, idx) => (
              <div key={idx} className="mt-2">
                <div className="flex justify-between">
                  <span className="font-bold">{edu.degree}</span>
                  <span>
                    {edu.start} – {edu.end}
                  </span>
                </div>
                <div className="text-gray-700">
                  {edu.school}
                  {edu.city && `, ${edu.city}`}
                </div>
                {edu.description && (
                  <p className="text-gray-600 mt-1">{edu.description}</p>
                )}
              </div>
            ))}
          </section>
        )}

        {data.skills && data.skills.length > 0 && (
          <section>
            <h2 className="text-xl font-bold border-b border-gray-400 pb-1">
              SKILLS
            </h2>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
              {data.skills.map((skill, idx) => (
                <span key={idx} className="text-gray-800">
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
