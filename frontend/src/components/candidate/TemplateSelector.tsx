import React from "react";

const templates = Array(6).fill(null);

const TemplateSelector: React.FC = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Templates & Colors</h2>
      <div className="grid grid-cols-3 gap-4">
        {templates.map((_, idx) => (
          <div
            key={idx}
            className="h-40 border border-gray-300 flex items-center justify-center text-sm text-gray-500"
          >
            Classic
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;
