import type { ResumeData } from "./InputResumeDetails";

export type ResumeRequirementError = {
  field: string;
  message: string;
};

export const getResumeRequirementErrors = (
  resume: ResumeData,
): ResumeRequirementError[] => {
  const errors: ResumeRequirementError[] = [];

  if (!resume.fullName?.trim()) {
    errors.push({ field: "fullName", message: "Full name is required." });
  }

  if (!resume.email?.trim()) {
    errors.push({ field: "email", message: "Email is required." });
  }

  if (!resume.phone?.trim()) {
    errors.push({ field: "phone", message: "Phone number is required." });
  }

  if (!resume.summary?.trim()) {
    errors.push({
      field: "summary",
      message: "Professional summary is required.",
    });
  }

  if (!resume.experience || resume.experience.length === 0) {
    errors.push({
      field: "experience",
      message: "Add at least one work experience entry.",
    });
  }

  if (!resume.education || resume.education.length === 0) {
    errors.push({
      field: "education",
      message: "Add at least one education entry.",
    });
  }

  if (!resume.skills || resume.skills.length === 0) {
    errors.push({ field: "skills", message: "Add at least one skill." });
  }

  return errors;
};

export const formatResumeRequirementErrors = (resume: ResumeData): string => {
  const errors = getResumeRequirementErrors(resume);

  if (errors.length === 0) {
    return "";
  }

  return errors.map((error) => error.message).join(" ");
};
