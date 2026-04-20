import React from "react";

export interface AiUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

interface AiUsageBlockProps {
  usage?: AiUsage;
}

const AiUsageBlock: React.FC<AiUsageBlockProps> = ({ usage }) => {
  if (
    usage?.prompt_tokens === undefined &&
    usage?.completion_tokens === undefined &&
    usage?.total_tokens === undefined
  ) {
    return null;
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 mb-2">Usage</h3>
      <div className="text-sm text-gray-700 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <p>Prompt tokens: {usage?.prompt_tokens ?? "-"}</p>
        <p>Completion tokens: {usage?.completion_tokens ?? "-"}</p>
        <p>Total tokens: {usage?.total_tokens ?? "-"}</p>
      </div>
    </div>
  );
};

export default AiUsageBlock;
