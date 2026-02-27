import React, { useState } from 'react';

interface ResumeTemplate {
    id: string;
    name: string;
    description: string;
    preview: React.ReactNode;
}

const Templates: React.FC = () => {
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

    const templates: ResumeTemplate[] = [
        {
            id: 'modern',
            name: 'Modern',
            description: 'Clean and contemporary design',
            preview: <div className="p-8 bg-white border-2 border-gray-300 rounded-lg">Modern Template Preview</div>,
        },
        {
            id: 'classic',
            name: 'Classic',
            description: 'Traditional and professional layout',
            preview: <div className="p-8 bg-white border-2 border-gray-300 rounded-lg">Classic Template Preview</div>,
        },
        {
            id: 'creative',
            name: 'Creative',
            description: 'Eye-catching and unique design',
            preview: <div className="p-8 bg-white border-2 border-gray-300 rounded-lg">Creative Template Preview</div>,
        },
    ];

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">Resume Templates</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {templates.map((template) => (
                    <div
                        key={template.id}
                        className={`cursor-pointer p-4 border-2 rounded-lg transition ${
                            selectedTemplate === template.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300 hover:border-blue-300'
                        }`}
                        onClick={() => setSelectedTemplate(template.id)}
                    >
                        <h2 className="text-xl font-semibold mb-2">{template.name}</h2>
                        <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                        {template.preview}
                    </div>
                ))}
            </div>

            {selectedTemplate && (
                <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-bold mb-4">
                        Selected: {templates.find((t) => t.id === selectedTemplate)?.name}
                    </h3>
                    <button className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
                        Use This Template
                    </button>
                </div>
            )}
        </div>
    );
};

export default Templates;