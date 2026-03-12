import React from "react";
import { templates } from "../templates"; // same import as in page

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
      <div className="grid grid-cols-3 gap-4">
        {templateKeys.map((key) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`
              h-40 border-2 flex items-center justify-center text-sm capitalize
              ${
                selectedTemplate === key
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-300 text-gray-500 hover:border-gray-400"
              }
            `}
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;
