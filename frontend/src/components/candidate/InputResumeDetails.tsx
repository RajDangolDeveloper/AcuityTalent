import React from "react";

export interface ResumeData {
  fullName?: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  nationality?: string;
  dateOfBirth?: string;
  drivingLicense?: string;
  summary?: string;
  experience?: Array<{
    title: string;
    employer: string;
    start: string;
    end: string;
    city: string;
    description: string;
  }>;
  education?: Array<{
    school: string;
    degree: string;
    start: string;
    end: string;
    city: string;
    description: string;
  }>;
  skills?: Array<{ skill: string; level: number }>;
}

export type ResumeTemplate = React.FC<{ data: ResumeData }>;

interface ResumeDetailsProps {
  resume: ResumeData;
  onChange: (r: ResumeData) => void;
}

const ResumeDetails: React.FC<ResumeDetailsProps> = ({ resume, onChange }) => {
  const update = (patch: Partial<ResumeData>) => {
    onChange({ ...resume, ...patch });
  };

  const updateArrayItem = <T extends object>(
    key: keyof ResumeData,
    index: number,
    patch: Partial<T>,
  ) => {
    const arr = (resume[key] as any[]) || [];
    const updated = [...arr];
    updated[index] = { ...updated[index], ...patch };
    update({ [key]: updated } as any);
  };

  const addArrayItem = (key: keyof ResumeData, emptyItem: any) => {
    const arr = (resume[key] as any[]) || [];
    update({ [key]: [...arr, emptyItem] } as any);
  };

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Personal details (8 fields)
    const personalFields = [
      "fullName",
      "email",
      "phone",
      "city",
      "country",
      "nationality",
      "dateOfBirth",
      "drivingLicense",
    ] as const;
    personalFields.forEach((field) => {
      total++;
      if (resume[field]) completed++;
    });

    // Professional summary
    total++;
    if (resume.summary) completed++;

    // Experience (count as 1 if at least one exists)
    total++;
    if (resume.experience && resume.experience.length > 0) completed++;

    // Education (count as 1 if at least one exists)
    total++;
    if (resume.education && resume.education.length > 0) completed++;

    // Skills (count as 1 if at least one exists)
    total++;
    if (resume.skills && resume.skills.length > 0) completed++;

    return (completed / total) * 100;
  };

  const getProgressColor = () => {
    const completion = calculateCompletion();
    if (completion < 30) return "bg-red-500";
    if (completion < 50) return "bg-orange-500";
    if (completion < 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="p-4 space-y-8">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Profile Completion</span>
          <span className="text-sm font-medium">
            {Math.round(calculateCompletion())}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`${getProgressColor()} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${calculateCompletion()}%` }}
          />
        </div>
      </div>

      {/* personal details */}
      <section className="p-5 border border-gray-300 drop-shadow-xl rounded-md ">
        <h3 className="text-xl font-semibold mb-4">Personal Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <input
            placeholder="Full Name"
            value={resume.fullName || ""}
            onChange={(e) => update({ fullName: e.target.value })}
            className="border border-gray-300 drop-shadow-xs p-2 rounded-sm"
          />
          <input
            placeholder="Email"
            value={resume.email || ""}
            onChange={(e) => update({ email: e.target.value })}
            className="border border-gray-300 drop-shadow-xs p-2 rounded-sm"
          />
          <input
            placeholder="Phone Number"
            value={resume.phone || ""}
            onChange={(e) => update({ phone: e.target.value })}
            className="border border-gray-300 drop-shadow-xs p-2 rounded-sm"
          />
          <input
            placeholder="City, State"
            value={resume.city || ""}
            onChange={(e) => update({ city: e.target.value })}
            className="border border-gray-300 drop-shadow-xs p-2 rounded-sm"
          />
          <input
            placeholder="Country"
            value={resume.country || ""}
            onChange={(e) => update({ country: e.target.value })}
            className="border border-gray-300 drop-shadow-xs p-2 rounded-sm"
          />
          <input
            placeholder="Nationality"
            value={resume.nationality || ""}
            onChange={(e) => update({ nationality: e.target.value })}
            className="border border-gray-300 drop-shadow-xs p-2 rounded-sm"
          />
          <input
            placeholder="Date of Birth"
            type="date"
            value={resume.dateOfBirth || ""}
            onChange={(e) => update({ dateOfBirth: e.target.value })}
            className="border border-gray-300 drop-shadow-xs p-2 rounded-sm"
          />
          <input
            placeholder="Driving License"
            value={resume.drivingLicense || ""}
            onChange={(e) => update({ drivingLicense: e.target.value })}
            className="border border-gray-300 drop-shadow-xs p-2 rounded-sm col-span-2"
          />
        </div>
      </section>

      {/* professional summary */}
      <section className="p-5 border border-gray-300 drop-shadow-xl rounded-md ">
        <h3 className="text-xl font-semibold mb-2">Professional Summary</h3>
        <textarea
          placeholder="Write a 2–4 short, energetic sentences about your greatness..."
          value={resume.summary || ""}
          onChange={(e) => update({ summary: e.target.value })}
          className="w-full border border-gray-300 rounded-xs p-2 h-32"
        />
      </section>

      {/* experience */}
      <section className="p-5 border border-gray-300 drop-shadow-xl rounded-md ">
        <h3 className="text-xl font-semibold mb-2">Experience</h3>
        {(resume.experience || []).map((job, idx) => (
          <div key={idx} className="space-y-2 mb-4 rounded">
            <input
              placeholder="Job Title"
              value={job.title}
              onChange={(e) =>
                updateArrayItem("experience", idx, { title: e.target.value })
              }
              className="border p-2 w-full"
            />
            <input
              placeholder="Employer"
              value={job.employer}
              onChange={(e) =>
                updateArrayItem("experience", idx, { employer: e.target.value })
              }
              className="border p-2 w-full"
            />
            <div className="flex gap-2">
              <input
                placeholder="Start Date"
                type="month"
                value={job.start}
                onChange={(e) =>
                  updateArrayItem("experience", idx, { start: e.target.value })
                }
                className="border p-2 flex-1"
              />
              <span>-</span>
              <input
                placeholder="End Date"
                type="month"
                value={job.end}
                onChange={(e) =>
                  updateArrayItem("experience", idx, { end: e.target.value })
                }
                className="border p-2 flex-1"
              />
            </div>
            <input
              placeholder="City, State"
              value={job.city}
              onChange={(e) =>
                updateArrayItem("experience", idx, { city: e.target.value })
              }
              className="border p-2 w-full"
            />
            <textarea
              placeholder="Description"
              value={job.description}
              onChange={(e) =>
                updateArrayItem("experience", idx, {
                  description: e.target.value,
                })
              }
              className="border p-2 w-full h-24"
            />
          </div>
        ))}
        <button
          type="button"
          className="text-primary-500"
          onClick={() =>
            addArrayItem("experience", {
              title: "",
              employer: "",
              start: "",
              end: "",
              city: "",
              description: "",
            })
          }
        >
          + Add more employment
        </button>
      </section>

      {/* education */}
      <section className="p-5 border border-gray-300 drop-shadow-xl rounded-md ">
        <h3 className="text-xl font-semibold mb-2">Education</h3>
        {(resume.education || []).map((edu, idx) => (
          <div key={idx} className="space-y-2 mb-4 border p-4 rounded">
            <input
              placeholder="School"
              value={edu.school}
              onChange={(e) =>
                updateArrayItem("education", idx, { school: e.target.value })
              }
              className="border p-2 w-full"
            />
            <input
              placeholder="Degree"
              value={edu.degree}
              onChange={(e) =>
                updateArrayItem("education", idx, { degree: e.target.value })
              }
              className="border p-2 w-full"
            />
            <div className="flex gap-2">
              <input
                placeholder="Start Date"
                type="month"
                value={edu.start}
                onChange={(e) =>
                  updateArrayItem("education", idx, { start: e.target.value })
                }
                className="border p-2 flex-1"
              />
              <span>-</span>
              <input
                placeholder="End Date"
                type="month"
                value={edu.end}
                onChange={(e) =>
                  updateArrayItem("education", idx, { end: e.target.value })
                }
                className="border p-2 flex-1"
              />
            </div>
            <input
              placeholder="City, State"
              value={edu.city}
              onChange={(e) =>
                updateArrayItem("education", idx, { city: e.target.value })
              }
              className="border p-2 w-full"
            />
            <textarea
              placeholder="Description"
              value={edu.description}
              onChange={(e) =>
                updateArrayItem("education", idx, {
                  description: e.target.value,
                })
              }
              className="border p-2 w-full h-24"
            />
          </div>
        ))}
        <button
          type="button"
          className="text-primary-500"
          onClick={() =>
            addArrayItem("education", {
              school: "",
              degree: "",
              start: "",
              end: "",
              city: "",
              description: "",
            })
          }
        >
          + Add more education
        </button>
      </section>

      {/* skills */}
      <section className="p-5 border border-gray-300 drop-shadow-xl rounded-md ">
        <h3 className="text-xl font-semibold mb-2">Skills</h3>
        {(resume.skills || []).map((skill, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-4">
            <input
              placeholder="Skill"
              value={skill.skill}
              onChange={(e) =>
                updateArrayItem("skills", idx, { skill: e.target.value })
              }
              className="border p-2 flex-1"
            />
          </div>
        ))}
        <button
          type="button"
          className="text-primary-500"
          onClick={() => addArrayItem("skills", { skill: "", level: 0 })}
        >
          + Add more skills
        </button>
      </section>
    </div>
  );
};

export default ResumeDetails;
