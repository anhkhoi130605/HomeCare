import React from 'react';
// Import dữ liệu từ file data.js
import { CARE_LOGS_HISTORY, CAREGIVER_INFO } from '../../data/Caregiver/CareLogs';

import { useNavigate } from 'react-router-dom';

const CareLogs = () => {
    const navigate = useNavigate();
    return (
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 custom-scrollbar">
            <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Care Logs History</h1>
                    <p className="text-sm text-slate-500">Review and manage your past submissions</p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full relative">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
                        <img
                            onClick={() => navigate('/caregiver/profile')}
                            alt="Caregiver profile"
                            className="w-10 h-10 rounded-full object-cover shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-80 transition-opacity"
                            src={CAREGIVER_INFO.profileImage}
                        />
                    </div>
                </div>
            </header>

            <div className="p-8 max-w-7xl mx-auto space-y-8">
                {/* Filters Section */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-6 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Search Patients</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input type="text" className="w-full pl-12 pr-6 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-primary-600 focus:border-primary-600 text-sm transition-all" placeholder="Search by name..." />
                        </div>
                    </div>
                    <div className="w-full md:w-56">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Date Range</label>
                        <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-primary-600 focus:border-primary-600 text-sm font-medium transition-all">
                            <option>Last 7 days</option>
                            <option>Last 30 days</option>
                            <option>Last 3 months</option>
                        </select>
                    </div>
                    <button className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 h-[48px] transition-all shadow-lg shadow-primary-600/20 active:scale-95">
                        <span className="material-symbols-outlined">filter_list</span>
                        Apply Filters
                    </button>
                </div>

                {/* Table Section */}
                <div className="bg-white dark:bg-slate-800 rounded-4xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Date</th>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Patient Name</th>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Shift Time</th>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {CARE_LOGS_HISTORY.map((log, i) => (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                                        <td className="px-8 py-6 font-bold text-slate-900 dark:text-white">{log.date}</td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${log.color.replace('text-', 'dark:text-').replace('bg-', 'dark:bg-').split(' ').join(' ')}`}>
                                                    {log.initials}
                                                </div>
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{log.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-sm text-slate-500 font-medium">{log.time}</td>
                                        <td className="px-8 py-6">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${log.status === 'Submitted' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                }`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={() => {
                                                    const path = log.status === 'Draft'
                                                        ? `/caregiver/care-logs/edit/${i}`
                                                        : `/caregiver/care-logs/${i}`;
                                                    navigate(path);
                                                }}
                                                className="text-primary-600 hover:text-primary-700 font-bold text-sm inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                                            >
                                                {log.status === 'Draft' ? 'Edit Draft' : 'View Log'}
                                                <span className="material-symbols-outlined text-lg">{log.status === 'Draft' ? 'edit_note' : 'visibility'}</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-8 py-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-500">Showing 1-5 of 24 logs</span>
                        <div className="flex gap-2">
                            <button className="p-2 border-2 border-slate-100 dark:border-slate-700 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all disabled:opacity-30" disabled>
                                <span className="material-symbols-outlined text-xl">chevron_left</span>
                            </button>
                            <button className="w-10 h-10 bg-primary-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary-600/30">1</button>
                            <button className="p-2 border-2 border-slate-100 dark:border-slate-700 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all">
                                <span className="material-symbols-outlined text-xl">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <StatCard title="This Month" value="18" label="logs submitted" icon="article" color="text-primary-600" />
                    <StatCard title="Pending Drafts" value="2" label="require attention" icon="pending_actions" color="text-amber-500" />
                    <StatCard title="Avg Shift Length" value="4.2h" label="per appointment" icon="timer" color="text-blue-500" />
                </div>
            </div>
        </div>
    );
};

// Component con để tái sử dụng cho phần Stats
const StatCard = ({ title, value, label, icon, color }) => (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-4xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
            <span className={`material-symbols-outlined text-6xl ${color}`}>{icon}</span>
        </div>
        <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</span>
            <span className={`material-symbols-outlined ${color}`}>{icon}</span>
        </div>
        <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-slate-800 dark:text-white">{value}</span>
            <span className="text-sm font-bold text-slate-400">{label}</span>
        </div>
    </div>
);

export default CareLogs;