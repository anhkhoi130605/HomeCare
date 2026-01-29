import React from 'react';
import { Link } from 'react-router-dom';
import { SCHEDULE_DATA } from '../../data/Caregiver/MySchedule';
import { CAREGIVER_INFO } from '../../data/Caregiver/CareLogs';

const MySchedule = () => {
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-900">
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Schedule</h1>
                    <p className="text-sm text-slate-500">View and manage your upcoming shifts</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <button className="px-6 py-1.5 text-sm font-bold bg-white dark:bg-slate-700 shadow-sm rounded-xl text-slate-800 dark:text-white">Month</button>
                        <button className="px-6 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Week</button>
                    </div>
                    <div className="flex items-center gap-4 pl-4 border-l border-slate-200 dark:border-slate-800">
                        <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full relative">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
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

            <div className="flex-1 overflow-hidden flex">
                {/* Calendar Grid Section */}
                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                    <div className="bg-white dark:bg-slate-800 rounded-4xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col min-h-[600px]">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-4">
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{SCHEDULE_DATA.currentMonth}</h2>
                                <div className="flex gap-2 text-slate-600 dark:text-slate-400">
                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all">
                                        <span className="material-symbols-outlined">chevron_left</span>
                                    </button>
                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all">
                                        <span className="material-symbols-outlined">chevron_right</span>
                                    </button>
                                </div>
                            </div>
                            <button className="text-sm font-bold text-primary-600 hover:underline">Today</button>
                        </div>

                        <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                            {weekDays.map(day => (
                                <div key={day} className="py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">{day}</div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800 flex-1">
                            {/* Padding for May 2024 (starts on Wed) */}
                            {[...Array(3)].map((_, i) => (
                                <div key={`empty-${i}`} className="p-2 bg-slate-50/50 dark:bg-slate-900/30"></div>
                            ))}

                            {days.map(day => {
                                const shift = SCHEDULE_DATA.shifts.find(s => s.day === day);
                                const isToday = day === 24;

                                return (
                                    <div key={day} className={`min-h-[120px] p-3 group transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/20 ${isToday ? 'ring-2 ring-primary-600 ring-inset bg-primary-50/20 dark:bg-primary-900/10' : ''}`}>
                                        <span className={`text-sm font-bold ${isToday ? 'text-primary-600' : 'text-slate-400 dark:text-slate-500'}`}>{day}</span>

                                        {shift && (
                                            <div className="mt-2 space-y-1">
                                                {shift.events ? (
                                                    shift.events.map((event, idx) => (
                                                        <div key={idx} className={`p-1.5 rounded-lg text-[10px] font-bold truncate cursor-pointer shadow-sm ${event.type === 'active'
                                                            ? 'bg-primary-600 text-white shadow-md'
                                                            : 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-l-4 border-teal-500'
                                                            }`}>
                                                            {event.time} - {event.patient}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-1.5 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-lg text-[10px] font-bold border-l-4 border-teal-500 truncate cursor-pointer shadow-sm">
                                                        {shift.title}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Sidebar Details Section */}
                <aside className="w-96 flex-shrink-0 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-800 overflow-y-auto custom-scrollbar p-8">
                    <div className="mb-8">
                        <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">Selected Date</span>
                        <h3 className="text-2xl font-bold mt-1 text-slate-800 dark:text-white">{SCHEDULE_DATA.selectedDate}</h3>
                    </div>

                    <div className="space-y-6">
                        {/* Active Shift Card */}
                        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-3xl p-6 border border-primary-100 dark:border-primary-900/30 relative overflow-hidden group">
                            <div className="flex items-center justify-between mb-4">
                                <span className="bg-primary-600 text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase">Current</span>
                                <span className="text-xs text-slate-500 font-bold dark:text-slate-400">9:00 AM - 1:00 PM</span>
                            </div>
                            <h4 className="font-bold text-slate-800 dark:text-white text-xl">Eleanor Thompson</h4>
                            <div className="mt-6 space-y-4">
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-primary-600 text-xl">location_on</span>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-tight">482 Oakwood Ave, Springfield, IL 62704</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-primary-600 text-xl">assignment</span>
                                    <div className="space-y-2">
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-100">Care Requirements:</p>
                                        <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2 list-disc ml-4">
                                            <li>Blood pressure monitoring</li>
                                            <li>Assistance with meal prep</li>
                                            <li>Light mobility exercise</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <button className="w-full mt-8 bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-primary-600/20 transition-all flex items-center justify-center gap-2 group">
                                <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">login</span>
                                QUICK CHECK-IN
                            </button>
                        </div>

                        {/* Next Shifts */}
                        <div className="space-y-4">
                            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Next Shifts</h5>
                            <div className="p-5 border border-slate-100 dark:border-slate-700 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all cursor-pointer">
                                <div className="flex justify-between items-start mb-2">
                                    <h6 className="font-bold text-slate-800 dark:text-white">James Wilson</h6>
                                    <span className="text-xs font-bold text-primary-600">02:30 PM</span>
                                </div>
                                <p className="text-xs text-slate-500 flex items-center gap-1 dark:text-slate-400">
                                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                                    122 Pine St, Apt 4B
                                </p>
                            </div>
                        </div>

                        <div className="mt-10 p-5 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                            <div className="flex items-center gap-3 text-slate-500">
                                <span className="material-symbols-outlined text-2xl">help</span>
                                <p className="text-xs leading-relaxed">Need to request a shift change? Contact your supervisor or use the <strong className="text-primary-600">Reports</strong> section.</p>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default MySchedule;