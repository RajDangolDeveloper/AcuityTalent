import React from "react";
import apiClient from "@/src/app/api/api-client";
import Notification from "@/src/element/Notification";
import { Sparkles } from "lucide-react";
import AiUsageBlock, { AiUsage } from "@/src/components/ai/AiUsageBlock";

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

interface ImproveTextResponse {
  improved_text?: string;
  raw_response?: string;
  usage?: AiUsage;
  response?: {
    response?: string;
    usage?: AiUsage;
  };
}

const ResumeDetails: React.FC<ResumeDetailsProps> = ({ resume, onChange }) => {
  const [improvingField, setImprovingField] = React.useState<string | null>(
    null,
  );
  const [latestAiUsage, setLatestAiUsage] = React.useState<AiUsage | undefined>(
    undefined,
  );

  const update = (patch: Partial<ResumeData>) => {
    onChange({ ...resume, ...patch });
  };

  const improveText = async (
    fieldId: string,
    text: string,
    onImproved: (value: string) => void,
    topic?: string,
  ) => {
    const normalized = text?.trim() ?? "";
    if (normalized.length < 5) {
      Notification({
        toastMessage: "Enter at least a few words before improving",
        toastStatus: "error",
      });
      return;
    }

    try {
      setImprovingField(fieldId);
      const response = await apiClient.post<ImproveTextResponse>(
        "/ai/improve-text",
        {
          text: normalized,
          topic,
        },
      );

      const improved =
        response.data?.improved_text?.trim() ||
        response.data?.raw_response?.trim() ||
        response.data?.response?.response?.trim();
      setLatestAiUsage(response.data?.usage || response.data?.response?.usage);
      if (!improved) {
        throw new Error("No improved text was returned");
      }

      onImproved(improved);
      Notification({
        toastMessage: "Text improved",
        toastStatus: "success",
      });
    } catch (error) {
      Notification({
        toastMessage: "Failed to improve text",
        toastStatus: "error",
      });
    } finally {
      setImprovingField(null);
    }
  };

  const renderInputWithImprove = ({
    fieldId,
    value,
    onChange,
    placeholder,
    className,
    topic,
    type = "text",
    improve = true,
  }: {
    fieldId: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    className: string;
    topic?: string;
    type?: string;
    improve?: boolean;
  }) => {
    if (!improve) {
      return (
        <input
          placeholder={placeholder}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={className}
        />
      );
    }

    return (
      <div className="space-y-1">
        <input
          placeholder={placeholder}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={className}
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => improveText(fieldId, value, onChange, topic)}
            disabled={improvingField === fieldId}
            className="text-xs text-primary-600 disabled:text-gray-400"
          >
            {improvingField === fieldId ? "Improving..." : "Improve with AI"}
          </button>
        </div>
      </div>
    );
  };

  const renderTextareaWithImprove = ({
    fieldId,
    value,
    onChange,
    placeholder,
    className,
    topic,
  }: {
    fieldId: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    className: string;
    topic?: string;
  }) => (
    <div className="space-y-1">
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={className}
      />
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => improveText(fieldId, value, onChange, topic)}
          disabled={improvingField === fieldId}
          className="text-primary-600 disabled:text-gray-400"
          title={improvingField === fieldId ? "Improving..." : "Improve"}
          aria-label={
            improvingField === fieldId ? "Improving field" : "Improve field"
          }
        >
          {improvingField === fieldId ? (
            <span className="text-xs">...</span>
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );

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

    
    total++;
    if (resume.summary) completed++;

    
    total++;
    if (resume.experience && resume.experience.length > 0) completed++;

    
    total++;
    if (resume.education && resume.education.length > 0) completed++;

    
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
      {}
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

      <AiUsageBlock usage={latestAiUsage} />

      {}
      <section className="p-5 border border-gray-300 drop-shadow-xl rounded-md ">
        <h3 className="text-xl font-semibold mb-4">Personal Details</h3>
        <div className="grid grid-cols-2 gap-4">
          {renderInputWithImprove({
            fieldId: "fullName",
            placeholder: "Full Name",
            value: resume.fullName || "",
            onChange: (value) => update({ fullName: value }),
            className: "border border-gray-300 drop-shadow-xs p-2 rounded-sm",
            improve: false,
          })}
          {renderInputWithImprove({
            fieldId: "email",
            placeholder: "Email",
            value: resume.email || "",
            onChange: (value) => update({ email: value }),
            className: "border border-gray-300 drop-shadow-xs p-2 rounded-sm",
            improve: false,
          })}
          {renderInputWithImprove({
            fieldId: "phone",
            placeholder: "Phone Number",
            value: resume.phone || "",
            onChange: (value) => update({ phone: value }),
            className: "border border-gray-300 drop-shadow-xs p-2 rounded-sm",
            improve: false,
          })}
          {renderInputWithImprove({
            fieldId: "city",
            placeholder: "City, State",
            value: resume.city || "",
            onChange: (value) => update({ city: value }),
            className: "border border-gray-300 drop-shadow-xs p-2 rounded-sm",
            improve: false,
          })}
          {renderInputWithImprove({
            fieldId: "country",
            placeholder: "Country",
            value: resume.country || "",
            onChange: (value) => update({ country: value }),
            className: "border border-gray-300 drop-shadow-xs p-2 rounded-sm",
            improve: false,
          })}
          {renderInputWithImprove({
            fieldId: "nationality",
            placeholder: "Nationality",
            value: resume.nationality || "",
            onChange: (value) => update({ nationality: value }),
            className: "border border-gray-300 drop-shadow-xs p-2 rounded-sm",
            improve: false,
          })}
          {renderInputWithImprove({
            fieldId: "dateOfBirth",
            placeholder: "Date of Birth",
            type: "date",
            improve: false,
            value: resume.dateOfBirth || "",
            onChange: (value) => update({ dateOfBirth: value }),
            className: "border border-gray-300 drop-shadow-xs p-2 rounded-sm",
          })}
          {renderInputWithImprove({
            fieldId: "drivingLicense",
            placeholder: "Driving License",
            value: resume.drivingLicense || "",
            onChange: (value) => update({ drivingLicense: value }),
            className:
              "border border-gray-300 drop-shadow-xs p-2 rounded-sm col-span-2",
            improve: false,
          })}
        </div>
      </section>

      {}
      <section className="p-5 border border-gray-300 drop-shadow-xl rounded-md ">
        <h3 className="text-xl font-semibold mb-2">Professional Summary</h3>
        {renderTextareaWithImprove({
          fieldId: "summary",
          placeholder:
            "Write a 2-4 short, energetic sentences about your greatness...",
          value: resume.summary || "",
          onChange: (value) => update({ summary: value }),
          className: "w-full border border-gray-300 rounded-xs p-2 h-32",
          topic: "professional resume summary",
        })}
      </section>

      {}
      <section className="p-5 border border-gray-300 drop-shadow-xl rounded-md ">
        <h3 className="text-xl font-semibold mb-2">Experience</h3>
        {(resume.experience || []).map((job, idx) => (
          <div key={idx} className="space-y-2 mb-4 rounded">
            {renderInputWithImprove({
              fieldId: `experience-${idx}-title`,
              placeholder: "Job Title",
              value: job.title,
              onChange: (value) =>
                updateArrayItem("experience", idx, { title: value }),
              className: "border p-2 w-full",
              improve: false,
            })}
            {renderInputWithImprove({
              fieldId: `experience-${idx}-employer`,
              placeholder: "Employer",
              value: job.employer,
              onChange: (value) =>
                updateArrayItem("experience", idx, { employer: value }),
              className: "border p-2 w-full",
              improve: false,
            })}
            <div className="flex gap-2">
              {renderInputWithImprove({
                fieldId: `experience-${idx}-start`,
                placeholder: "Start Date",
                type: "month",
                improve: false,
                value: job.start,
                onChange: (value) =>
                  updateArrayItem("experience", idx, { start: value }),
                className: "border p-2 flex-1",
              })}
              <span>-</span>
              {renderInputWithImprove({
                fieldId: `experience-${idx}-end`,
                placeholder: "End Date",
                type: "month",
                improve: false,
                value: job.end,
                onChange: (value) =>
                  updateArrayItem("experience", idx, { end: value }),
                className: "border p-2 flex-1",
              })}
            </div>
            {renderInputWithImprove({
              fieldId: `experience-${idx}-city`,
              placeholder: "City, State",
              value: job.city,
              onChange: (value) =>
                updateArrayItem("experience", idx, { city: value }),
              className: "border p-2 w-full",
              improve: false,
            })}
            {renderTextareaWithImprove({
              fieldId: `experience-${idx}-description`,
              placeholder: "Description",
              value: job.description,
              onChange: (value) =>
                updateArrayItem("experience", idx, {
                  description: value,
                }),
              className: "border p-2 w-full h-24",
              topic: "professional work experience bullet points",
            })}
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

      {}
      <section className="p-5 border border-gray-300 drop-shadow-xl rounded-md ">
        <h3 className="text-xl font-semibold mb-2">Education</h3>
        {(resume.education || []).map((edu, idx) => (
          <div key={idx} className="space-y-2 mb-4 border p-4 rounded">
            {renderInputWithImprove({
              fieldId: `education-${idx}-school`,
              placeholder: "School",
              value: edu.school,
              onChange: (value) =>
                updateArrayItem("education", idx, { school: value }),
              className: "border p-2 w-full",
              improve: false,
            })}
            {renderInputWithImprove({
              fieldId: `education-${idx}-degree`,
              placeholder: "Degree",
              value: edu.degree,
              onChange: (value) =>
                updateArrayItem("education", idx, { degree: value }),
              className: "border p-2 w-full",
              improve: false,
            })}
            <div className="flex gap-2">
              {renderInputWithImprove({
                fieldId: `education-${idx}-start`,
                placeholder: "Start Date",
                type: "month",
                improve: false,
                value: edu.start,
                onChange: (value) =>
                  updateArrayItem("education", idx, { start: value }),
                className: "border p-2 flex-1",
              })}
              <span>-</span>
              {renderInputWithImprove({
                fieldId: `education-${idx}-end`,
                placeholder: "End Date",
                type: "month",
                improve: false,
                value: edu.end,
                onChange: (value) =>
                  updateArrayItem("education", idx, { end: value }),
                className: "border p-2 flex-1",
              })}
            </div>
            {renderInputWithImprove({
              fieldId: `education-${idx}-city`,
              placeholder: "City, State",
              value: edu.city,
              onChange: (value) =>
                updateArrayItem("education", idx, { city: value }),
              className: "border p-2 w-full",
              improve: false,
            })}
            {renderTextareaWithImprove({
              fieldId: `education-${idx}-description`,
              placeholder: "Description",
              value: edu.description,
              onChange: (value) =>
                updateArrayItem("education", idx, {
                  description: value,
                }),
              className: "border p-2 w-full h-24",
              topic: "education achievements",
            })}
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

      {}
      <section className="p-5 border border-gray-300 drop-shadow-xl rounded-md ">
        <h3 className="text-xl font-semibold mb-2">Skills</h3>
        {(resume.skills || []).map((skill, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-4">
            <div className="flex-1">
              {renderInputWithImprove({
                fieldId: `skills-${idx}-skill`,
                placeholder: "Skill",
                value: skill.skill,
                onChange: (value) =>
                  updateArrayItem("skills", idx, { skill: value }),
                className: "border p-2 flex-1 w-full",
                improve: false,
              })}
            </div>
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
