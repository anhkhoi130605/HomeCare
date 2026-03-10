import React from 'react';

/**
 * Reusable loading spinner component
 * @param {Object} props
 * @param {string} props.message - Loading message to display
 * @param {string} props.size - 'sm' | 'md' | 'lg'
 * @param {string} props.className - Additional CSS classes
 */
const LoadingSpinner = ({ message = 'Đang tải...', size = 'md', className = '' }) => {
    const sizeClasses = {
        sm: 'text-2xl',
        md: 'text-4xl',
        lg: 'text-6xl'
    };

    return (
        <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
            <span
                className={`material-symbols-outlined ${sizeClasses[size]} text-[#5fa5ba] animate-spin`}
            >
                progress_activity
            </span>
            {message && (
                <p className="mt-3 text-stone-500 dark:text-stone-400 font-medium">
                    {message}
                </p>
            )}
        </div>
    );
};

export default LoadingSpinner;
