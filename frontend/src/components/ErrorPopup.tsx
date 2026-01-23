import React, { useState, useEffect } from 'react';

interface ErrorMessage {
    id: string;
    message: string;
}

export const ErrorPopup: React.FC = () => {
    const [errors, setErrors] = useState<ErrorMessage[]>([]);

    const addError = (message: string) => {
        const id = Date.now().toString();
        setErrors((prev) => [...prev, { id, message }]);

        setTimeout(() => {
            removeError(id);
        }, 1600);
    };

    const removeError = (id: string) => {
        setErrors((prev) => prev.filter((error) => error.id !== id));
    };

    return (
        <div className="fixed bottom-4 right-4 flex flex-col gap-2 pointer-events-none">
            {errors.map((error) => (
                <div
                    key={error.id}
                    className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between gap-3 pointer-events-auto animate-slideIn"
                >
                    <span>{error.message}</span>
                    <button
                        onClick={() => removeError(error.id)}
                        className="text-white hover:text-gray-200 font-bold"
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    );
};

export const useErrorPopup = () => {
    const addError = (message: string) => {
        const event = new CustomEvent('addError', { detail: { message } });
        window.dispatchEvent(event);
    };

    return { addError };
};