import React from "react";
import { templates } from "../templates";
import { ResumeData } from "./InputResumeDetails";

interface ResumePreviewProps {
  resumeData?: ResumeData;
  isLoading?: boolean;
  template: keyof typeof templates;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({
  resumeData,
  isLoading = false,
  template,
}) => {
  if (isLoading) {
    return <div className="p-8">Loading resume...</div>;
  }

  if (!resumeData) {
    return <div className="p-8">No resume data available</div>;
  }

  const TemplateComponent = templates[template];
  return <TemplateComponent data={resumeData} />;
};

export default ResumePreview;
