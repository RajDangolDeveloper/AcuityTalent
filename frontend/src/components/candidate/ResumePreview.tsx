import React from "react";

interface ResumePreviewProps {
  resumeData?: {
    name?: string;
    email?: string;
    phone?: string;
    summary?: string;
    experience?: Array<{
      company: string;
      position: string;
      duration: string;
      description: string;
    }>;
    education?: Array<{
      institution: string;
      degree: string;
      field: string;
      year: string;
    }>;
    skills?: Array<{ skill: string; level: number }>;
  };
  isLoading?: boolean;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({
  resumeData,
  isLoading = false,
}) => {
  if (isLoading) {
    return <div className="p-8">Loading resume...</div>;
  }

  if (!resumeData) {
    return <div className="p-8">No resume data available</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow">
      {/* Header */}
      <div className="mb-8 border-b pb-6">
        <h1 className="text-4xl font-bold">{resumeData.name}</h1>
        <div className="mt-2 text-gray-600">
          {resumeData.email && <span>{resumeData.email}</span>}
          {resumeData.phone && <span className="ml-4">{resumeData.phone}</span>}
        </div>
      </div>

      {/* Summary */}
      {resumeData.summary && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Professional Summary</h2>
          <p className="text-gray-700">{resumeData.summary}</p>
        </div>
      )}

      {/* Experience */}
      {resumeData.experience && resumeData.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Experience</h2>
          {resumeData.experience.map((job, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between">
                <h3 className="font-bold">{job.position}</h3>
                <span className="text-gray-600">{job.duration}</span>
              </div>
              <p className="text-gray-600">{job.company}</p>
              <p className="text-gray-700 mt-1">{job.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {resumeData.education && resumeData.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Education</h2>
          {resumeData.education.map((edu, index) => (
            <div key={index} className="mb-3">
              <h3 className="font-bold">
                {edu.degree} in {edu.field}
              </h3>
              <p className="text-gray-600">{edu.institution}</p>
              <p className="text-gray-600">{edu.year}</p>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {resumeData.skills && resumeData.skills.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {resumeData.skills.map((skill, index) => (
              <span
                key={index}
                className="bg-gray-200 px-3 py-1 rounded text-sm"
              >
                {skill.skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumePreview;
