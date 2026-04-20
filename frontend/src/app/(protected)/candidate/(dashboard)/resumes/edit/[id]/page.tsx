"use client";

import { useEffect, useMemo, useState } from "react";
import AiReview from "@/src/components/candidate/AiReview";
import InputResumeDetails, {
  ResumeData,
} from "@/src/components/candidate/InputResumeDetails";
import ResumePreview from "@/src/components/candidate/ResumePreview";
import TemplateSelector from "@/src/components/candidate/TemplateSelector";
import PdfDownloadButton from "@/src/components/candidate/PdfDownloadButton";
import { templates } from "@/src/components/templates";
import { useGetResumeById } from "@/src/hooks/useResumeApi";
import { ClassicPDFTemplate } from "@/src/components/templatePdf/ClassicTemplatePdf";
import { CleanPDFTemplate } from "@/src/components/templatePdf/CleanTemplatePdf";
import { ModernPDFTemplate } from "@/src/components/templatePdf/ModernTemplatePdf";
import { PrimeATSPDFTemplate } from "@/src/components/templatePdf/PrimeATSTemplatePdf";
import { ProfessionalPDFTemplate } from "@/src/components/templatePdf/ProfessionalTemplatePdf";
import { SpecialistPDFTemplate } from "@/src/components/templatePdf/SpecialistTemplate";
import { TemplateKey } from "@/src/types/resume";
import SaveResumeButton from "@/src/components/candidate/SaveResumeButton";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";

export default function UpdateResumePage() {
  const params = useParams();

  const resumeId = params?.id ? parseInt(params.id as string) : null;
  const session = useSession();
  const [activeTab, setActiveTab] = useState<"edit" | "customize" | "ai">(
    "edit",
  );
  const [selectedTemplate, setSelectedTemplate] =
    useState<keyof typeof templates>("modern");

  const templateKeys = Object.keys(templates) as Array<keyof typeof templates>;
  const availableTemplates = templateKeys;

  useEffect(() => {
    if (!availableTemplates.includes(selectedTemplate)) {
      setSelectedTemplate(availableTemplates[0] ?? "modern");
    }
  }, [availableTemplates, selectedTemplate]);

  const getResume = useGetResumeById(resumeId).data;
  const resumeText = getResume?.resumeText ?? "";
  const resumeJSON = useMemo(() => {
    if (!resumeText) return null;
    try {
      return JSON.parse(resumeText) as ResumeData;
    } catch (e) {
      console.error("Failed to parse resume JSON", e);
      return null;
    }
  }, [resumeText]);

  const [resumeData, setResumeData] = useState<ResumeData>({
    experience: [],
    education: [],
    skills: [],
  });

  useEffect(() => {
    if (!resumeJSON) return;

    setResumeData((prev) => ({
      ...prev,
      ...resumeJSON,
      experience: Array.isArray(resumeJSON.experience)
        ? resumeJSON.experience
        : [],
      education: Array.isArray(resumeJSON.education)
        ? resumeJSON.education
        : [],
      skills: Array.isArray(resumeJSON.skills) ? resumeJSON.skills : [],
    }));
  }, [resumeJSON]);

  const pdfTemplates: Record<TemplateKey, React.FC<{ data: ResumeData }>> = {
    modern: ModernPDFTemplate,
    classic: ClassicPDFTemplate,
    professional: ProfessionalPDFTemplate,
    clean: CleanPDFTemplate,
    primeats: PrimeATSPDFTemplate,
    specialist: SpecialistPDFTemplate,
  };

  const PDFComponent = pdfTemplates[selectedTemplate];

  return (
    <div className="flex flex-col h-screen min-w-full justify-center items-center">
      <div className="bg-primary-600 w-full flex justify-center items-center relative">
        <div className="bg-primary-600 w-full grid grid-cols-3 items-center px-6 py-2">
          <div />
          <div className="flex justify-center">
            <div className="flex gap-2 rounded-md bg-gray-200 p-1">
              <button
                className={`px-6 py-2 transition-all ${
                  activeTab === "edit"
                    ? "bg-white text-gray-900 shadow-md rounded-md"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setActiveTab("edit")}
              >
                Edit
              </button>
              <button
                className={`px-6 py-2 transition-all ${
                  activeTab === "customize"
                    ? "bg-white text-gray-900 shadow-md rounded-md"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setActiveTab("customize")}
              >
                Customize
              </button>
              <button
                className={`px-6 py-2 transition-all ${
                  activeTab === "ai"
                    ? "bg-white text-gray-900 shadow-md rounded-md"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setActiveTab("ai")}
              >
                AI Review
              </button>
            </div>
          </div>

          {/* Right Column (Save Button) */}
          <div className="flex justify-end">
            <SaveResumeButton
              resumeData={resumeData}
              selectedTemplate={selectedTemplate}
              userId={Number(session.data?.user.id)}
            />
          </div>
        </div>
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
                availableTemplates={availableTemplates}
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
              <PdfDownloadButton
                className="absolute right-5 bottom-5 rounded-md bg-primary-500 p-4 text-gray-200"
                document={<PDFComponent data={resumeData} />}
                fileName="temp.pdf"
              >
                {({ loading }) =>
                  loading ? "Generating PDF..." : "Download PDF"
                }
              </PdfDownloadButton>
            </div>
          )}
          {activeTab === "ai" && <AiReview resumeData={resumeData} />}
        </div>
      </div>
    </div>
  );
}
