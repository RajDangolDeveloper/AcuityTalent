"use client";

import { useState } from "react";
import AiReview from "@/src/components/candidate/AiReview";
import InputResumeDetails, {
  ResumeData,
} from "@/src/components/candidate/InputResumeDetails";
import ResumePreview from "@/src/components/candidate/ResumePreview";
import TemplateSelector from "@/src/components/candidate/TemplateSelector";
import { templates } from "@/src/components/templates";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ClassicPDFTemplate } from "@/src/components/templatePdf/ClassicTemplatePdf";
import { CleanPDFTemplate } from "@/src/components/templatePdf/CleanTemplatePdf";
import { ModernPDFTemplate } from "@/src/components/templatePdf/ModernTemplatePdf";
import { PrimeATSPDFTemplate } from "@/src/components/templatePdf/PrimeATSTemplatePdf";
import { SpecialistPDFTemplate } from "@/src/components/templatePdf/SpecialistTemplate";
import { ProfessionalPDFTemplate } from "@/src/components/templatePdf/ProfessionalTemplatePdf";

export default function CreateResumePage() {
  const [activeTab, setActiveTab] = useState<"edit" | "customize" | "ai">(
    "edit",
  );
  const [selectedTemplate, setSelectedTemplate] =
    useState<keyof typeof templates>("modern");

  type TemplateKey = keyof typeof templates;

  const pdfTemplates: Record<TemplateKey, React.FC<{ data: ResumeData }>> = {
    modern: ModernPDFTemplate,
    classic: ClassicPDFTemplate,
    professional: ProfessionalPDFTemplate,
    clean: CleanPDFTemplate,
    primeats: PrimeATSPDFTemplate,
    specialist: SpecialistPDFTemplate,
  };

  const [resumeData, setResumeData] = useState<ResumeData>({
    experience: [],
    education: [],
    skills: [],
  });

  const PDFComponent = pdfTemplates[selectedTemplate];
  return (
    <div className="flex flex-col h-screen min-w-full justify-center items-center">
      {/* top bar */}
      <div className="bg-primary-600 w-full flex justify-center items-center relative">
        <div className="flex justify-center max-w-90 gap-2 my-2 rounded-md bg-gray-200">
          <button
            className={`px-6 py-3 my-1 mx-1  ${
              activeTab === "edit"
                ? "border-gray-500 drop-shadow-xl bg-white rounded-md px-2 py-3"
                : ""
            }`}
            onClick={() => setActiveTab("edit")}
          >
            Edit
          </button>
          <button
            className={`px-6 py-3 my-1 mx-1  ${
              activeTab === "customize"
                ? "border-gray-500 drop-shadow-xl bg-white rounded-md px-2 py-3"
                : ""
            }`}
            onClick={() => setActiveTab("customize")}
          >
            Customize
          </button>
          <button
            className={`px-6 py-3 my-1 mx-1  ${
              activeTab === "ai"
                ? "border-gray-500 drop-shadow-xl bg-white rounded-md px-2 py-3"
                : ""
            }`}
            onClick={() => setActiveTab("ai")}
          >
            AI Review
          </button>
        </div>
        <button
          onClick={() => {}}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white text-primary-600 px-4 py-2 rounded-md shadow hover:bg-gray-100 transition"
        >
          Save Resume
        </button>
      </div>
      {/* main content */}
      <div className="flex flex-1 overflow-hidden w-full">
        <div className="w-1/2 overflow-auto border-r">
          {(activeTab === "edit" || activeTab === "ai") && (
            <InputResumeDetails resume={resumeData} onChange={setResumeData} />
          )}
          {activeTab === "customize" && (
            <TemplateSelector
              selectedTemplate={selectedTemplate}
              onSelect={setSelectedTemplate}
            />
          )}
        </div>
        <div className="w-1/2 overflow-y-clip relative">
          {activeTab === "edit" && (
            <div className="">
              <ResumePreview
                resumeData={resumeData}
                template={selectedTemplate}
              />
              <PDFDownloadLink
                className="absolute right-5 bottom-5 rounded-md bg-primary-500 p-4 text-gray-200"
                document={<PDFComponent data={resumeData} />}
                fileName="temp.pdf"
              >
                {({ loading }) =>
                  loading ? "Generating PDF..." : "Download PDF"
                }
              </PDFDownloadLink>
            </div>
          )}
          {activeTab === "ai" && <AiReview />}
        </div>
      </div>
    </div>
  );
}
