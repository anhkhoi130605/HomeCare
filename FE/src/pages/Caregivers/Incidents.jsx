import React from 'react';
import { Link } from 'react-router-dom';
import { INCIDENTS_DATA } from '../../data/Caregiver/Incidents';
import { CAREGIVER_INFO } from '../../data/Caregiver/CareLogs';

const Incidents = () => {
    return (
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 custom-scrollbar">
            <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Incident Reports</h1>
                    <p className="text-sm text-slate-500">Manage and track safety records</p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full relative">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                    </button>
                    <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
                        <Link to="/caregiver/profile">
                            <img
                                alt="Caregiver profile"
                                className="w-10 h-10 rounded-full object-cover shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-80 transition-opacity"
                                src={CAREGIVER_INFO.profileImage}
                            />
                        </Link>
                    </div>
                </div>
            </header>

            <div className="p-8 max-w-7xl mx-auto space-y-8">
                {/* Search and Action Button */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            className="w-full pl-12 pr-6 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-primary-600 focus:border-primary-600 text-sm shadow-sm transition-all"
                            placeholder="Search by patient or date..."
                        />
                    </div>
                    <button className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-primary-600/20 transition-all active:scale-95">
                        <span className="material-symbols-outlined">add_circle</span>
                        REPORT NEW INCIDENT
                    </button>
                </div>

                {/* Table Container */}
                <div className="bg-white dark:bg-slate-800 rounded-4xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Date & Time</th>
                                    <th className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Patient</th>
                                    <th className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Incident Summary</th>
                                    <th className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {INCIDENTS_DATA.map((incident, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-all group">
                                        <td className="px-8 py-7 whitespace-nowrap">
                                            <div className="text-sm font-bold text-slate-900 dark:text-white">{incident.date}</div>
                                            <div className="text-xs text-slate-500 font-medium">{incident.time}</div>
                                        </td>
                                        <td className="px-8 py-7 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-xs">
                                                    {incident.initials}
                                                </div>
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{incident.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className="max-w-md">
                                                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1 leading-relaxed">
                                                    {incident.summary}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${incident.color.replace('text-', 'dark:text-').replace('bg-', 'dark:bg-').split(' ').join(' ')
                                                }`}>
                                                {incident.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-7 whitespace-nowrap">
                                            <button className="text-primary-600 hover:text-primary-700 font-bold text-sm transition-all hover:translate-x-1 flex items-center gap-1">
                                                View Details
                                                <span className="material-symbols-outlined text-lg">chevron_right</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Simple Pagination */}
                    <div className="px-8 py-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-500">Showing {INCIDENTS_DATA.length} of 12 incidents</p>
                        <div className="flex gap-2">
                            <button className="p-2 border-2 border-slate-100 dark:border-slate-700 rounded-xl hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30" disabled>
                                <span className="material-symbols-outlined text-xl">chevron_left</span>
                            </button>
                            <button className="p-2 border-2 border-slate-100 dark:border-slate-700 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all">
                                <span className="material-symbols-outlined text-xl">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Guidelines Section */}
                <section className="bg-primary-600/5 dark:bg-primary-600/10 border-2 border-dashed border-primary-600/20 rounded-4xl p-8 flex items-start gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                        <span className="material-symbols-outlined text-9xl text-primary-600">info</span>
                    </div>
                    <div className="w-14 h-14 bg-primary-600 text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-600/20">
                        <span className="material-symbols-outlined text-2xl">info</span>
                    </div>
                    <div className="relative z-10">
                        <h3 className="font-bold text-xl text-slate-800 dark:text-white mb-2">Reporting Guidelines</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-4xl">
                            All incidents must be reported within 2 hours of occurrence or discovery. Ensure all descriptions are factual and objective. In case of medical emergencies, always call 911 first before filing an incident report. Providing accurate details helps us maintain high standards of care.
                        </p>
                    </div>
                </section>
            </div>

            <footer className="p-8 text-center text-slate-400 text-xs mt-auto">
                © 2024 CareFlow Systems Inc. All Rights Reserved. • <a href="#" className="hover:text-primary-600 underline">Privacy Policy</a>
            </footer>
        </div>
    );
};

export default Incidents;