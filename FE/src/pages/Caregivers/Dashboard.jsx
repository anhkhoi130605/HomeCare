import React from 'react';
import { Link } from 'react-router-dom';
// Import dữ liệu từ data.js - ĐÃ THÊM CAREGIVER_INFO VÀO ĐÂY
import {
    CAREGIVER_INFO,
    DASHBOARD_STATS,
    UPCOMING_SHIFTS,
    RECENT_LOGS_MINI
} from '../../data/Caregiver/Dashboard';
import { PATIENT_DATA as ACTIVE_PATIENT } from '../../data/Caregiver/ActiveShift';


const Dashboard = () => {
    return (
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 custom-scrollbar">
            <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Caregiver Dashboard</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back, {DASHBOARD_STATS.caregiverName}</p>
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
                <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Banner Active Shift */}
                    <div className="xl:col-span-2 bg-gradient-to-br from-teal-600 to-teal-800 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <span className="material-symbols-outlined text-9xl">health_and_safety</span>
                        </div>
                        <div className="flex-1 space-y-4 relative z-10">
                            <div>
                                <span className="bg-teal-500/30 text-teal-100 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border border-teal-400/20">Active Shift</span>
                                <h2 className="text-3xl font-bold mt-2">Current Appointment</h2>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-teal-200">person</span>
                                    <span className="text-lg font-medium">Mrs. {ACTIVE_PATIENT.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-teal-200">schedule</span>
                                    <span>09:00 AM - 01:00 PM (4 hours)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-teal-200">location_on</span>
                                    <span>{ACTIVE_PATIENT.address}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex-shrink-0 relative z-10">
                            <Link to="/caregiver/active-shift" className="bg-white text-teal-700 hover:bg-teal-50 px-8 py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center gap-2 transition-transform active:scale-95">
                                <span className="material-symbols-outlined">login</span>
                                QUICK CHECK-IN
                            </Link>
                            <p className="text-teal-200 text-sm mt-3 text-center italic">Arrived at location? Tap to start log.</p>
                        </div>
                    </div>

                    {/* Today's Overview */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
                            <span className="material-symbols-outlined text-teal-600">analytics</span>
                            Today's Overview
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                                <span className="text-slate-500 dark:text-slate-400">Total Hours</span>
                                <span className="font-bold text-lg text-slate-800 dark:text-white">{DASHBOARD_STATS.totalHours}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                                <span className="text-slate-500 dark:text-slate-400">Completed Shifts</span>
                                <span className="font-bold text-lg text-slate-800 dark:text-white">{DASHBOARD_STATS.completedShifts}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                                <span className="text-slate-500 dark:text-slate-400">Incidents Reported</span>
                                <span className={`font-bold text-lg ${DASHBOARD_STATS.incidents > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                    {DASHBOARD_STATS.incidents}
                                </span>
                            </div>
                        </div>
                        <Link to="/caregiver/my-schedule" className="block text-center w-full mt-6 py-2.5 text-teal-600 border border-teal-600 hover:bg-teal-600 hover:text-white rounded-xl transition-all font-semibold">
                            View Full Schedule
                        </Link>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Upcoming Section */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                                <span className="material-symbols-outlined text-teal-600">event_note</span>
                                Upcoming Today
                            </h2>
                            <span className="text-sm text-slate-500 font-medium">May 24, 2024</span>
                        </div>
                        <div className="space-y-3">
                            {UPCOMING_SHIFTS.map((shift, i) => (
                                <div key={i} className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                                                <span className="material-symbols-outlined text-3xl">person</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 dark:text-white">{shift.name}</h4>
                                                <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                                                    <span className="material-symbols-outlined text-xs">location_on</span>
                                                    {shift.addr}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-bold text-teal-600">{shift.time}</span>
                                            <p className="text-xs text-slate-400">Scheduled</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        {shift.tags.map(tag => (
                                            <span key={tag} className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-medium">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Recent Logs Table Section */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                                <span className="material-symbols-outlined text-teal-600">history_edu</span>
                                Recent Care Logs
                            </h2>
                            <Link to="/caregiver/care-logs" className="text-sm text-teal-600 font-medium hover:underline">See all</Link>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Patient</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date/Time</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {RECENT_LOGS_MINI.map((log, i) => (
                                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{log.p}</td>
                                            <td className="px-6 py-4 text-sm text-slate-500">{log.dt}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${log.s === 'Submitted' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                                                    }`}>
                                                    {log.s}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                {/* Emergency/Incident Section */}
                <section className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center text-red-600 dark:text-red-400">
                            <span className="material-symbols-outlined">warning</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-red-800 dark:text-red-200">Something went wrong?</h3>
                            <p className="text-sm text-red-700/70 dark:text-red-300/60">Report incidents immediately to ensure patient safety and company compliance.</p>
                        </div>
                    </div>
                    <Link to="/caregiver/incidents" className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-200 dark:shadow-none transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined">add_circle</span>
                        NEW INCIDENT REPORT
                    </Link>
                </section>
            </div>

        </div>
    );
};

export default Dashboard;