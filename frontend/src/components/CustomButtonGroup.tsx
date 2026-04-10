"use client";

interface ButtonGroupProps {
  options: string[];
  selected: string;
  onChange?: (selected: string) => void;
}

export function ButtonGroup({ options, selected, onChange }: ButtonGroupProps) {
  return (
    <div className="flex space-x-px bg-gray-200 w-fit px-2 py-1 rounded-md">
      {options.map((option, index) => {
        const isActive = selected === option;
        return (
          <button
            key={option}
            onClick={() => onChange?.(option)}
            className={`
            px-4 py-2 text-sm font-medium
            rounded-sm

            ${isActive ? "bg-white" : ""}

          `}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
