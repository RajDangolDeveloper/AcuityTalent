"use client";

import { Font, pdf } from "@react-pdf/renderer";
import { ResumeData } from "./InputResumeDetails";
import { TemplateKey } from "@/src/types/resume";
import { useState } from "react";
import { ClassicPDFTemplate } from "../templatePdf/ClassicTemplatePdf";
import { CleanPDFTemplate } from "../templatePdf/CleanTemplatePdf";
import { ModernPDFTemplate } from "../templatePdf/ModernTemplatePdf";
import { PrimeATSPDFTemplate } from "../templatePdf/PrimeATSTemplatePdf";
import { ProfessionalPDFTemplate } from "../templatePdf/ProfessionalTemplatePdf";
import { SpecialistPDFTemplate } from "../templatePdf/SpecialistTemplate";
import apiClient from "@/src/app/api/api-client";
import { formatResumeRequirementErrors } from "./resumeValidation";

Font.register({
  family: "Helvetica-Light",
  src: "https://fonts.gstatic.com/s/helveticaneue/v70/some-link-to-light-font.ttf",
});

const SaveResumeButton = ({
  resumeData,
  userId,
  selectedTemplate,
}: {
  resumeData: ResumeData;
  userId: number;
  selectedTemplate: TemplateKey;
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const pdfTemplates: Record<TemplateKey, React.FC<{ data: ResumeData }>> = {
    modern: ModernPDFTemplate,
    classic: ClassicPDFTemplate,
    professional: ProfessionalPDFTemplate,
    clean: CleanPDFTemplate,
    primeats: PrimeATSPDFTemplate,
    specialist: SpecialistPDFTemplate,
  };

  const handleSave = async () => {
    try {
      const requirementMessage = formatResumeRequirementErrors(resumeData);
      if (requirementMessage) {
        setMessage(requirementMessage);
        return;
      }

      setMessage(null);
      setIsSaving(true);
      const PDFComponent = pdfTemplates[selectedTemplate];
      if (!PDFComponent)
        throw new Error(`Template ${selectedTemplate} not found`);

      const blob = await pdf(<PDFComponent data={resumeData} />).toBlob();
      const file = new File([blob], `resume_${Date.now()}.pdf`, {
        type: "application/pdf",
      });

      const stringifySection = (data: any): string => {
        if (!data) return "";

        if (Array.isArray(data)) {
          return data
            .map((item) =>
              typeof item === "object" ? Object.values(item).join(" ") : item,
            )
            .join(", ");
        }

        if (typeof data === "object") {
          return Object.values(data).join(" ");
        }

        return String(data);
      };

      const dataParts = [
        stringifySection(resumeData.summary),
        stringifySection(resumeData.skills),
        stringifySection(resumeData.education),
        stringifySection(resumeData.experience),
      ];

      const textContent = dataParts.filter((part) => !!part).join("\n\n");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId.toString());
      formData.append("textContent", JSON.stringify(textContent));
      formData.append("resumeText", JSON.stringify(resumeData));

      const response = await apiClient.post("/resumes/upload", formData);

      if (!response.status) throw new Error("Upload failed");
      const result = await response.data;
      setMessage("Resume saved successfully!");
    } catch (error) {
      setMessage("Error saving resume. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="bg-white text-primary-600 px-4 py-2 rounded-md shadow hover:bg-gray-100 transition disabled:opacity-50"
      >
        {isSaving ? "Saving..." : "Save Resume"}
      </button>
      {message && (
        <p
          className={`mt-2 text-sm ${
            message === "Resume saved successfully!"
              ? "text-green-700"
              : "text-red-700"
          }`}
        >
          {message}
        </p>
      )}
    </>
  );
};

export default SaveResumeButton;
