import React from "react";
import { templates, templatePreviews } from "../templates";

interface TemplateSelectorProps {
  selectedTemplate: keyof typeof templates;
  onSelect: (template: keyof typeof templates) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onSelect,
}) => {
  const templateKeys = Object.keys(templates) as Array<keyof typeof templates>;
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Templates & Colors</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {templateKeys.map((key) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`
              relative group h-86 w-full border-2 rounded-lg overflow-hidden transition-all
              ${
                selectedTemplate === key
                  ? "border-blue-500 ring-2 ring-blue-200"
                  : "border-gray-200 hover:border-gray-400"
              }
            `}
          >
            <img
              src={`${templatePreviews[key]}`}
              alt={`${key} template preview`}
              className="w-full h-full object-cover bg-gray-100"
            />

            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-white font-medium text-lg capitalize tracking-wide">
                {key}
              </span>
            </div>

            {selectedTemplate === key && (
              <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;
