"use client";

import { useState } from "react";
import AiReview from "@/src/components/candidate/AiReview";
import InputResumeDetails, {
  ResumeData,
} from "@/src/components/candidate/InputResumeDetails";
import ResumePreview from "@/src/components/candidate/ResumePreview";
import TemplateSelector from "@/src/components/candidate/TemplateSelector";
import { templates } from "@/src/components/templates";
import { pdf, PDFDownloadLink } from "@react-pdf/renderer";
import { useUploadResume } from "@/src/hooks/useResumeApi";
import { ClassicPDFTemplate } from "@/src/components/templatePdf/ClassicTemplatePdf";
import { CleanPDFTemplate } from "@/src/components/templatePdf/CleanTemplatePdf";
import { ModernPDFTemplate } from "@/src/components/templatePdf/ModernTemplatePdf";
import { PrimeATSPDFTemplate } from "@/src/components/templatePdf/PrimeATSTemplatePdf";
import { ProfessionalPDFTemplate } from "@/src/components/templatePdf/ProfessionalTemplatePdf";
import { SpecialistPDFTemplate } from "@/src/components/templatePdf/SpecialistTemplate";
import { TemplateKey } from "@/src/types/resume";
import SaveResumeButton from "@/src/components/candidate/SaveResumeButton";
import { useSession } from "next-auth/react";

export default function CreateResumePage() {
  const session = useSession();
  const [activeTab, setActiveTab] = useState<"edit" | "customize" | "ai">(
    "edit",
  );
  const [selectedTemplate, setSelectedTemplate] =
    useState<keyof typeof templates>("modern");

  const [resumeData, setResumeData] = useState<ResumeData>({
    experience: [],
    education: [],
    skills: [],
  });

  const pdfTemplates: Record<TemplateKey, React.FC<{ data: ResumeData }>> = {
    modern: ModernPDFTemplate,
    classic: ClassicPDFTemplate,
    professional: ProfessionalPDFTemplate,
    clean: CleanPDFTemplate,
    primeats: PrimeATSPDFTemplate,
    specialist: SpecialistPDFTemplate,
  };

  const PDFComponent = pdfTemplates[selectedTemplate];

  const uploadResume = useUploadResume();

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
        <SaveResumeButton
          resumeData={resumeData}
          selectedTemplate={selectedTemplate}
          userId={Number(session.data?.user.id)}
        />
      </div>
      {/* main content */}
      <div className="flex flex-1 overflow-hidden w-full">
        <div className="w-1/2 overflow-auto border-r">
          {(activeTab === "edit" || activeTab === "ai") && (
            <InputResumeDetails resume={resumeData} onChange={setResumeData} />
          )}
          {activeTab === "customize" && (
            <div>
              <TemplateSelector
                selectedTemplate={selectedTemplate}
                onSelect={setSelectedTemplate}
              />
            </div>
          )}
        </div>
        <div className="w-1/2 overflow-y-clip relative">
          {activeTab === "customize" && (
            <ResumePreview
              resumeData={resumeData}
              template={selectedTemplate}
            />
          )}
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
