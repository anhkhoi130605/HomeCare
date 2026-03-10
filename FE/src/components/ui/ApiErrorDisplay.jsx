import React from 'react';
import { NetworkError } from '../../lib/api';

/**
 * Reusable error display component for API errors
 * @param {Object} props
 * @param {Error} props.error - The error object
 * @param {Function} props.onRetry - Callback to retry the failed action
 * @param {string} props.className - Additional CSS classes
 */
const ApiErrorDisplay = ({ error, onRetry, className = '' }) => {
    const isNetworkError = error?.isNetworkError || error?.name === 'NetworkError';

    const getErrorConfig = () => {
        if (isNetworkError) {
            return {
                icon: 'wifi_off',
                title: 'Lỗi Kết Nối',
                message: error.message || 'Không thể kết nối đến server',
                bgColor: 'bg-amber-50 dark:bg-amber-900/20',
                iconColor: 'text-amber-500',
                textColor: 'text-amber-700 dark:text-amber-400',
                buttonColor: 'bg-amber-500 hover:bg-amber-600'
            };
        }

        // API error (4xx, 5xx)
        return {
            icon: 'error',
            title: 'Đã Xảy Ra Lỗi',
            message: error?.message || 'Có lỗi xảy ra khi tải dữ liệu',
            bgColor: 'bg-red-50 dark:bg-red-900/20',
            iconColor: 'text-red-500',
            textColor: 'text-red-700 dark:text-red-400',
            buttonColor: 'bg-red-500 hover:bg-red-600'
        };
    };

    const config = getErrorConfig();

    return (
        <div className={`${config.bgColor} rounded-2xl p-8 ${className}`}>
            <div className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-full ${config.bgColor} flex items-center justify-center mb-4`}>
                    <span className={`material-symbols-outlined text-4xl ${config.iconColor}`}>
                        {config.icon}
                    </span>
                </div>

                <h3 className={`text-lg font-bold ${config.textColor} mb-2`}>
                    {config.title}
                </h3>

                <p className={`text-sm ${config.textColor} opacity-80 mb-6 max-w-md`}>
                    {config.message}
                </p>

                {onRetry && (
                    <button
                        onClick={onRetry}
                        className={`${config.buttonColor} text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg`}
                    >
                        <span className="material-symbols-outlined text-xl">refresh</span>
                        Thử Lại
                    </button>
                )}
            </div>
        </div>
    );
};

export default ApiErrorDisplay;
