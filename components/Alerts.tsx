import React, { useEffect, useState } from 'react';
import { AlertProps } from '@/types';

const Alert: React.FC<AlertProps> = ({ message, type = 'info', duration = 10000 }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(false), duration);
        return () => clearTimeout(timer);
    }, [duration]);

    if (!visible) return null;

    const alertStyles = {
        success: 'bg-green-100 text-green-700 border-green-500',
        error: 'bg-red-100 text-red-700 border-red-500',
        info: 'bg-blue-100 text-blue-700 border-blue-500',
        warning: 'bg-yellow-100 text-yellow-700 border-yellow-500',
    };

    return (
        <div className={`fixed top-5 right-5 z-50 max-w-lg w-full p-4 rounded border ${alertStyles[type as keyof typeof alertStyles]}`}>
            <div className="flex justify-between items-center">
                <span>{message}</span>
                <button
                    onClick={() => setVisible(false)}
                    className="ml-4 text-lg font-bold focus:outline-none"
                >
                    &times;
                </button>
            </div>
        </div>
    );
};

export default Alert;
