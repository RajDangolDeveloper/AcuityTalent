"use client";

import { useState } from "react";
import AiReview from "@/src/components/candidate/AiReview";
import InputResumeDetails, {
  ResumeData,
} from "@/src/components/candidate/InputResumeDetails";
import ResumePreview from "@/src/components/candidate/ResumePreview";
import TemplateSelector from "@/src/components/candidate/TemplateSelector";

export default function CreateResumePage() {
  const [activeTab, setActiveTab] = useState<"edit" | "customize" | "ai">(
    "edit",
  );

  const [resumeData, setResumeData] = useState<ResumeData>({
    experience: [],
    education: [],
    skills: [],
  });

  return (
    <div className="flex flex-col h-screen w-full justify-center items-center ">
      {/* top bar */}
      <div className="bg-primary-600 w-full flex justify-center items-center">
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
      </div>
      {/* main content */}
      <div className="flex flex-1 overflow-hidden w-full">
        {/* left column: inputs */}
        <div className="w-1/2 overflow-auto border-r">
          <InputResumeDetails resume={resumeData} onChange={setResumeData} />
        </div>
        {/* right column: varies */}
        <div className="w-1/2 overflow-auto">
          {activeTab === "edit" && <ResumePreview resumeData={resumeData} />}
          {activeTab === "customize" && <TemplateSelector />}
          {activeTab === "ai" && <AiReview />}
        </div>
      </div>
    </div>
  );
}
