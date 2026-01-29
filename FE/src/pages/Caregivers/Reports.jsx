import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { REPORTS_METRICS } from '../../data/Caregiver/Reports';
import { CAREGIVER_INFO } from '../../data/Caregiver/CareLogs';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</p>
                <div className="flex flex-col gap-1">
                    <p className="text-sm font-bold text-primary-600">Hours: {payload[0].value}h</p>
                    <p className="text-xs text-slate-500 italic">Target: {payload[1].value}h</p>
                </div>
            </div>
        );
    }
    return null;
};

const Reports = () => {
    return (
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 custom-scrollbar">
            <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">Performance Reports</h1>
                    <p className="text-sm text-slate-500">Review your care metrics and monthly summaries</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end mr-2">
                        <span className="text-sm font-bold text-slate-800 dark:text-white">{CAREGIVER_INFO.name}</span>
                        <span className="text-xs text-slate-400 font-semibold">{CAREGIVER_INFO.role}</span>
                    </div>
                    <Link to="/caregiver/profile">
                        <img alt="Caregiver profile" className="w-12 h-12 rounded-full object-cover shadow-lg border-2 border-primary-600 cursor-pointer hover:opacity-80 transition-opacity" src={CAREGIVER_INFO.profileImage} />
                    </Link>
                </div>
            </header>

            <div className="p-8 max-w-7xl mx-auto space-y-8">
                {/* Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 px-5 py-2.5 rounded-2xl flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-bold shadow-sm text-slate-800 dark:text-white">
                            <span className="material-symbols-outlined text-slate-500">calendar_month</span>
                            <span>May 2024</span>
                            <span className="material-symbols-outlined text-slate-400">expand_more</span>
                        </button>
                        <span className="text-sm text-slate-400 font-medium">Compared to April 2024</span>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-bold rounded-2xl shadow-xl shadow-primary-600/20 hover:bg-primary-700 transition-all active:scale-95">
                        <span className="material-symbols-outlined">download</span>
                        Download PDF Report
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {REPORTS_METRICS.stats.map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 p-8 rounded-4xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 ${stat.bg} dark:bg-slate-900/50 rounded-2xl shadow-inner`}>
                                    <span className={`material-symbols-outlined ${stat.color} text-3xl`}>{stat.icon}</span>
                                </div>
                                <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest ${stat.pct.includes('+') ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30' : 'text-slate-400 bg-slate-50 dark:bg-slate-900/50'}`}>
                                    {stat.pct}
                                </span>
                            </div>
                            <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">{stat.label}</h3>
                            <div className="flex items-baseline gap-2 mt-2">
                                <span className="text-4xl font-bold text-slate-800 dark:text-white">{stat.val}</span>
                                <span className="text-slate-400 text-sm font-bold uppercase">{stat.unit}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Chart & Testimonials */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-10 rounded-4xl border border-slate-200 dark:border-slate-800 shadow-xl">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="font-bold text-2xl text-slate-800 dark:text-white">Hours Activity</h3>
                                <p className="text-sm text-slate-500 mt-1">Weekly breakdown of logged hours</p>
                            </div>
                            <div className="flex gap-6">
                                <div className="flex items-center gap-2">
                                    <span className="w-4 h-4 rounded-full bg-primary-600 shadow-[0_0_8px_rgba(20,184,166,0.4)]"></span>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Current</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700"></span>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Target</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={REPORTS_METRICS.weeklyActivity} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="day"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                                        dy={10}
                                    />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} />
                                    <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
                                    <Bar dataKey="hours" radius={[10, 10, 0, 0]} barSize={36}>
                                        {REPORTS_METRICS.weeklyActivity.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.hours >= 7 ? '#14b8a6' : '#5eead4'} />
                                        ))}
                                    </Bar>
                                    <Bar dataKey="target" fill="#e2e8f0" radius={[10, 10, 0, 0]} barSize={36} opacity={0.3} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-10 rounded-4xl border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col relative overflow-hidden group">
                        <h3 className="font-bold text-2xl text-slate-800 dark:text-white mb-8">Patient Testimonials</h3>
                        <div className="space-y-8 flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10">
                            {REPORTS_METRICS.testimonials.map((test, i) => (
                                <div key={i} className={`border-l-4 ${test.primary ? 'border-primary-600 bg-primary-50/10' : 'border-slate-200 dark:border-slate-700'} pl-6 py-3 transition-all hover:bg-slate-50 dark:hover:bg-slate-900 rounded-r-2xl`}>
                                    <p className="text-sm italic text-slate-600 dark:text-slate-400 leading-relaxed">"{test.quote}"</p>
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{test.from}</span>
                                        <div className="flex text-amber-400">
                                            {[...Array(5)].map((_, j) => (
                                                <span key={j} className="material-symbols-outlined text-sm font-fill">
                                                    {j < test.rating ? 'star' : 'star_outline'}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="mt-10 text-primary-600 font-bold text-sm hover:underline flex items-center gap-2 group">
                            View All Feedback
                            <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </button>
                    </div>
                </div>

                {/* Table Section */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white px-2">Recent Monthly Summaries</h2>
                    <div className="bg-white dark:bg-slate-800 rounded-4xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Month</th>
                                    <th className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Total Shifts</th>
                                    <th className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Avg. Rating</th>
                                    <th className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {[
                                    { m: 'May 2024', s: 42, r: '4.9 / 5.0', st: 'Current', cur: true },
                                    { m: 'April 2024', s: 38, r: '4.8 / 5.0', st: 'Closed', cur: false },
                                    { m: 'March 2024', s: 40, r: '4.9 / 5.0', st: 'Closed', cur: false }
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all group">
                                        <td className="px-8 py-6 font-bold text-slate-900 dark:text-white">{row.m}</td>
                                        <td className="px-8 py-6 text-sm text-slate-500 font-semibold">{row.s} Shifts</td>
                                        <td className="px-8 py-6 text-sm text-slate-500 font-bold">{row.r}</td>
                                        <td className="px-8 py-6">
                                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${row.cur ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-400'
                                                }`}>
                                                {row.st}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="text-primary-600 hover:text-primary-700 font-bold text-sm flex items-center gap-2 ml-auto group-hover:scale-105 transition-all">
                                                <span className="material-symbols-outlined text-lg">{row.cur ? 'visibility' : 'download'}</span>
                                                {row.cur ? 'View' : 'Download'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Reports;