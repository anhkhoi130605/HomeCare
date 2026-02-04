import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { caregiverApi, careLogApi, feedbackApi, scheduleApi } from '../../lib/api';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-stone-800 p-4 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-xl">
                <p className="text-xs font-black text-stone-400 uppercase tracking-widest mb-2">{label}</p>
                <div className="flex flex-col gap-1">
                    <p className="text-sm font-bold text-[#5fa5ba]">Hours: {payload[0].value}h</p>
                    <p className="text-xs text-stone-500 italic font-medium">Target: {payload[1].value}h</p>
                </div>
            </div>
        );
    }
    return null;
};

const Reports = () => {
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({
        totalShifts: 0,
        completionRate: 0,
        avgRating: 0,
        totalHours: 0
    });
    const [weeklyActivity, setWeeklyActivity] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [monthlySummaries, setMonthlySummaries] = useState([]); // Could be derived
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const profileRes = await caregiverApi.getProfile();
                setProfile(profileRes);

                if (profileRes?.id) {
                    const [logsRes, schedulesRes, ratingRes, feedbacksRes] = await Promise.all([
                        careLogApi.getMy(),
                        scheduleApi.getByCaregiver(profileRes.id),
                        feedbackApi.getCaregiverRating(profileRes.id), // Assuming returns { averageRating: 4.5 } or similar? Or just number?
                        feedbackApi.getByCaregiver(profileRes.id) // Get feedbacks
                    ]);

                    // Process Stats
                    const totalShifts = schedulesRes?.length || 0;
                    const completedShifts = schedulesRes?.filter(s => s.status === 'Completed').length || 0;
                    const completionRate = totalShifts > 0 ? Math.round((completedShifts / totalShifts) * 100) : 0;

                    // Rating might be a number or object depending on API
                    const avgRating = typeof ratingRes === 'number' ? ratingRes : (ratingRes?.averageRating || 0);

                    // Calculate Hours from Completed Schedules
                    let totalHours = 0;
                    const activityMap = {}; // date -> hours

                    // Initialize last 7 days
                    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    const today = new Date();
                    const weekData = [];
                    for (let i = 6; i >= 0; i--) {
                        const d = new Date(today);
                        d.setDate(today.getDate() - i);
                        const dateStr = d.toISOString().split('T')[0];
                        const dayName = days[d.getDay()];
                        activityMap[dateStr] = { day: dayName, hours: 0, target: 8 }; // Target 8h dummy
                        weekData.push({ date: dateStr, day: dayName, hours: 0, target: 8 });
                    }

                    schedulesRes?.forEach(s => {
                        if (s.status === 'Completed') {
                            const dateStr = s.date.split('T')[0];
                            const start = new Date(`1970-01-01T${s.startTime}`);
                            const end = new Date(`1970-01-01T${s.endTime}`);
                            const hours = (end - start) / (1000 * 60 * 60);

                            totalHours += hours;

                            // Update weekly activity if falls in range
                            if (activityMap[dateStr]) {
                                activityMap[dateStr].hours += hours;
                            }
                        }
                    });

                    // Convert map back to array in order
                    const chartData = weekData.map(d => ({
                        ...d,
                        hours: activityMap[d.date]?.hours || 0
                    }));

                    setStats({
                        totalShifts,
                        completionRate,
                        avgRating: parseFloat(avgRating).toFixed(1),
                        totalHours: Math.round(totalHours)
                    });
                    setWeeklyActivity(chartData);
                    setFeedbacks(feedbacksRes || []);
                    setMonthlySummaries([
                        { m: 'May 2024', s: 42, r: '4.9 / 5.0', st: 'Current', cur: true }, // Mock for now as historical data is hard
                        { m: 'April 2024', s: 38, r: '4.8 / 5.0', st: 'Closed', cur: false },
                    ]);
                }
            } catch (err) {
                console.error("Error fetching reports data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-background-light dark:bg-stone-950">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#5fa5ba] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-stone-500 font-medium">Loading reports...</p>
                </div>
            </div>
        );
    }

    const statCards = [
        {
            label: 'Total Shifts',
            val: stats.totalShifts,
            unit: 'shifts',
            pct: '+12%',
            icon: 'calendar_month'
        },
        {
            label: 'Completion Rate',
            val: `${stats.completionRate}%`,
            unit: 'success',
            pct: '+5%',
            icon: 'check_circle'
        },
        {
            label: 'Avg Rating',
            val: stats.avgRating,
            unit: '/ 5.0',
            pct: 'Top 5%',
            icon: 'star'
        }
    ];

    return (
        <div className="flex-1 overflow-y-auto bg-background-light dark:bg-stone-950 custom-scrollbar font-manrope animate-in slide-in-from-bottom-8 fade-in duration-700">
            <header className="sticky top-0 z-20 bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border-b border-stone-100 dark:border-stone-800 px-8 py-5 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-stone-800 dark:text-white tracking-tight">Performance Reports</h1>
                    <p className="text-sm font-medium text-stone-400 mt-1">Review your care metrics and summaries</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="hidden md:flex flex-col items-end mr-2">
                        <span className="text-sm font-bold text-stone-800 dark:text-white">{profile?.fullName}</span>
                        <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">{profile?.role || 'Caregiver'}</span>
                    </div>
                    <Link to="/caregiver/profile" className="group">
                        <img alt="Caregiver profile" className="w-12 h-12 rounded-2xl object-cover shadow-lg ring-2 ring-white dark:ring-stone-800 group-hover:ring-[#5fa5ba] transition-all cursor-pointer" src={profile?.imageUrl || 'https://via.placeholder.com/48'} />
                    </Link>
                </div>
            </header>

            <div className="p-8 max-w-[1700px] mx-auto space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {statCards.map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-stone-900 p-8 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 rounded-2xl shadow-inner ${stat.label === 'Completion Rate' ? 'bg-emerald-50 text-emerald-600' : 'bg-[#5fa5ba]/10 text-[#5fa5ba]'}`}>
                                    <span className={`material-symbols-outlined text-3xl`}>{stat.icon}</span>
                                </div>
                                <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest ${stat.pct.includes('+') ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' : 'text-stone-400 bg-stone-50 dark:bg-stone-900/50'}`}>
                                    {stat.pct}
                                </span>
                            </div>
                            <h3 className="text-stone-400 dark:text-stone-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</h3>
                            <div className="flex items-baseline gap-2 mt-2">
                                <span className="text-4xl font-black text-stone-800 dark:text-white">{stat.val}</span>
                                <span className="text-stone-400 text-xs font-bold uppercase">{stat.unit}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Chart & Testimonials */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white dark:bg-stone-900 p-10 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 shadow-sm">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="font-bold text-2xl text-stone-800 dark:text-white tracking-tight">Hours Activity</h3>
                                <p className="text-sm font-medium text-stone-500 mt-1">Weekly breakdown of logged hours</p>
                            </div>
                        </div>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyActivity} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                                    <XAxis
                                        dataKey="day"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#a8a29e', fontSize: 11, fontWeight: 800 }}
                                        dy={15}
                                    />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a8a29e', fontSize: 11, fontWeight: 800 }} />
                                    <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
                                    <Bar dataKey="hours" radius={[8, 8, 8, 8]} barSize={28}>
                                        {weeklyActivity.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.hours >= (entry.target || 8) ? '#5fa5ba' : '#9ec5d1'} />
                                        ))}
                                    </Bar>
                                    <Bar dataKey="target" fill="#f5f5f4" radius={[8, 8, 8, 8]} barSize={28} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-stone-900 p-10 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 shadow-sm flex flex-col relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                            <span className="material-symbols-outlined text-9xl">format_quote</span>
                        </div>
                        <h3 className="font-bold text-2xl text-stone-800 dark:text-white mb-8 tracking-tight relative z-10">Patient Testimonials</h3>
                        <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10 max-h-[400px]">
                            {feedbacks.length === 0 ? (
                                <p className="text-stone-400 italic">No feedback yet.</p>
                            ) : feedbacks.slice(0, 5).map((test, i) => (
                                <div key={i} className={`border-l-[3px] border-[#5fa5ba] bg-[#5fa5ba]/5 pl-6 py-4 transition-all hover:bg-stone-50 dark:hover:bg-stone-800 rounded-r-2xl`}>
                                    <p className="text-sm italic font-medium text-stone-600 dark:text-stone-300 leading-relaxed">"{test.comment || 'Great service!'}"</p>
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-[10px] font-black text-stone-900 dark:text-white uppercase tracking-widest">{test.from || 'Family'}</span>
                                        <div className="flex text-amber-400 gap-0.5">
                                            {[...Array(5)].map((_, j) => (
                                                <span key={j} className="material-symbols-outlined text-[16px] font-fill">
                                                    {j < (test.rating || 5) ? 'star' : 'star_outline'}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-extrabold text-stone-800 dark:text-white px-2 tracking-tight">Recent Monthly Summaries</h2>
                    <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-stone-50 dark:bg-stone-900/50 border-b border-stone-100 dark:border-stone-800">
                                <tr>
                                    <th className="px-8 py-6 text-[10px] font-black text-stone-400 uppercase tracking-widest">Month</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-stone-400 uppercase tracking-widest">Total Shifts</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-stone-400 uppercase tracking-widest">Avg. Rating</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-stone-400 uppercase tracking-widest">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                {monthlySummaries.map((row, i) => (
                                    <tr key={i} className="hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-all group">
                                        <td className="px-8 py-6 font-bold text-stone-900 dark:text-white">{row.m}</td>
                                        <td className="px-8 py-6 text-sm text-stone-500 font-semibold">{row.s} Shifts</td>
                                        <td className="px-8 py-6 text-sm text-stone-500 font-bold">{row.r}</td>
                                        <td className="px-8 py-6">
                                            <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${row.cur ? 'bg-[#5fa5ba]/10 text-[#5fa5ba]' : 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400'}`}>
                                                {row.st}
                                            </span>
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