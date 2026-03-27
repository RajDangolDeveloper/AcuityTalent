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

Font.register({
  family: "Helvetica-Light",
  src: "https://fonts.gstatic.com/s/helveticaneue/v70/some-link-to-light-font.ttf", // You can use a local path or URL
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
      setIsSaving(true);
      const PDFComponent = pdfTemplates[selectedTemplate];
      if (!PDFComponent)
        throw new Error(`Template ${selectedTemplate} not found`);

      const blob = await pdf(<PDFComponent data={resumeData} />).toBlob();
      const file = new File([blob], `resume_${Date.now()}.pdf`, {
        type: "application/pdf",
      });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId.toString());
      formData.append("textContent", JSON.stringify(resumeData));

      const response = await apiClient.post("/resumes/upload", formData);

      if (!response.status) throw new Error("Upload failed");
      const result = await response.data;
      console.log("Resume saved:", result);
      alert("Resume saved successfully!");
    } catch (error) {
      console.error("Failed to save resume:", error);
      alert("Error saving resume. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={isSaving}
      className="bg-white text-primary-600 px-4 py-2 rounded-md shadow hover:bg-gray-100 transition disabled:opacity-50"
    >
      {isSaving ? "Saving..." : "Save Resume"}
    </button>
  );
};

export default SaveResumeButton;
