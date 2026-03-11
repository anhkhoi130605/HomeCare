import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { scheduleApi, familyApi } from '@/lib/api';
import { formatTimeSpan } from '@/lib/utils';
import ScrollAnimation from "@/components/ui/scroll-animation";

const CareSchedule = () => {
    const [view, setView] = useState('Monthly');
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                setLoading(true);
                // Get all patients first
                const patients = await familyApi.getPatients();

                // Fetch schedules for all patients
                const allSchedules = [];
                for (const patient of patients) {
                    try {
                        const patientSchedules = await scheduleApi.getByPatient(patient.id);
                        allSchedules.push(...patientSchedules.map(s => ({
                            ...s,
                            patientName: patient.fullName
                        })));
                    } catch (e) {
                        console.warn(`Failed to fetch schedules for patient ${patient.id}`);
                    }
                }

                setSchedules(allSchedules);
            } catch (err) {
                console.error('Failed to fetch schedules:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchSchedules();
    }, []);

    const upcomingVisits = schedules
        .filter(s => s.status !== 'Completed' && new Date(s.date) >= new Date().setHours(0, 0, 0, 0))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    const nextVisit = upcomingVisits[0];

    // Convert API schedules to calendar events
    const getEventsForDay = (day) => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const checkDate = new Date(year, month, day);

        return schedules.filter(s => {
            const scheduleDate = new Date(s.date);
            // Normalize both dates to midnight local time for robust comparison
            const checkDay = new Date(year, month, day);
            const d = new Date(scheduleDate.getFullYear(), scheduleDate.getMonth(), scheduleDate.getDate());

            return d.getTime() === checkDay.getTime();
        }).map(s => ({
            id: s.id,
            day: day,
            name: s.serviceName || s.service?.name || 'Care Visit',
            type: 'CONTRACT',
            time: s.startTime ? formatTimeSpan(s.startTime) : '09:00 AM',
            patient: s.patientName || s.patient?.name,
            isDone: s.status === 'Completed',
            status: s.status,
            isToday: checkDate.toDateString() === new Date().toDateString()
        }));
    };

    // Dynamic calendar generation based on currentMonth
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // Generate prev month placeholder days
    const prevDays = Array.from({ length: firstDayOfMonth }, (_, i) => prevMonthDays - firstDayOfMonth + i + 1);

    const goToPrevMonth = () => {
        setCurrentMonth(new Date(year, month - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentMonth(new Date(year, month + 1, 1));
    };

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse pb-12 pt-4 font-['Public_Sans']">
                <div className="bg-stone-200 rounded-2xl h-24"></div>
                <div className="bg-stone-200 rounded-[2rem] h-[600px]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <span className="material-symbols-outlined text-4xl text-red-400 mb-4">error</span>
                <p className="text-red-600 font-medium">Failed to load schedule</p>
                <p className="text-stone-500 text-sm">{error}</p>
            </div>
        );
    }

    return (
        <div className="font-['Public_Sans'] space-y-8 pb-12 pt-4 bg-transparent animate-fade-in-up">

            {/* 1. Page Header & Actions - Clean Surface */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 px-2">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-[#5fa5ba] text-2xl">calendar_month</span>
                        <h1 className="text-3xl font-medium text-stone-900 tracking-tight">Care Schedule</h1>
                    </div>
                    <p className="text-stone-500 font-medium max-w-lg">Manage medical appointments, caregiver shifts, and family visits in one unified view.</p>
                </div>

                {/* View Toggles & Actions */}
                <div className="flex items-center gap-3">
                    <div className="bg-white border border-stone-200 rounded-full p-1 flex shadow-sm">
                        {['Monthly', 'Weekly', 'List'].map(v => (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${view === v ? 'bg-stone-900 text-white shadow-md' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'}`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>
                    <Link to="/family/booking" className="w-11 h-11 rounded-full bg-[#5fa5ba] text-white flex items-center justify-center shadow-lg hover:bg-[#4d8ca0] transition-transform hover:scale-105">
                        <span className="material-symbols-outlined">add</span>
                    </Link>
                </div>
            </div>

            {/* 2. Main Calendar Surface - Professional Unified Grid */}
            <ScrollAnimation animation="fade-up">
                <div className="bg-white rounded-[2rem] border border-stone-200 shadow-sm overflow-hidden relative">
                    {/* Decorative Top Line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#5fa5ba] to-teal-400"></div>

                    {/* Controls Bar */}
                    <div className="px-6 py-5 border-b border-stone-100 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-bold text-stone-800">{monthNames[month]} {year}</h2>
                            <div className="flex gap-1">
                                <button onClick={goToPrevMonth} className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50 text-stone-500 hover:text-[#5fa5ba] transition-colors">
                                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                                </button>
                                <button onClick={goToNextMonth} className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50 text-stone-500 hover:text-[#5fa5ba] transition-colors">
                                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                                </button>
                            </div>
                        </div>

                        {/* Event Status Legend */}
                        <div className="flex flex-wrap justify-center gap-4 md:gap-6 bg-stone-50 px-4 py-2 rounded-full border border-stone-100">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Done
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Upcoming
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span> Cancelled
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                                <span className="w-2 h-2 rounded-full bg-stone-400"></span> Failed
                            </div>
                        </div>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 border-b border-stone-200 bg-stone-50/80">
                        {weekDays.map(d => (
                            <div key={d} className="py-3 text-center text-[10px] font-black text-stone-400 tracking-[0.2em]">{d}</div>
                        ))}
                    </div>

                    {/* Grid Components */}
                    {view === 'Monthly' && (
                        <div className="grid grid-cols-7 bg-stone-200 gap-px border-b border-stone-200">
                            {/* Empty Slots (Prev Month) */}
                            {prevDays.map(day => (
                                <div key={`prev-${day}`} className="bg-white/50 min-h-[120px] md:min-h-[160px] p-2 flex flex-col justify-end pb-4 items-center md:items-start md:justify-start md:p-3 relative">
                                    <span className="text-sm font-bold text-stone-300 pointer-events-none">{day}</span>
                                    <div className="absolute inset-0 bg-stone-50/50 pattern-grid-lg opacity-30"></div>
                                </div>
                            ))}

                            {/* Month Days */}
                            {days.map(day => {
                                const dayEvents = getEventsForDay(day);
                                const event = dayEvents[0]; // Show first event
                                const today = new Date();
                                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

                                return (
                                    <div key={day} className={`bg-white min-h-[120px] md:min-h-[160px] p-2 md:p-3 transition-colors hover:bg-stone-50 group relative flex flex-col gap-2 ${isToday ? 'bg-sky-50/20' : ''}`}>

                                        {/* Day Number */}
                                        <div className="flex justify-center md:justify-between items-start">
                                            <span className={`text-sm md:text-base font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-[#5fa5ba] text-white shadow-md' : 'text-stone-700'}`}>
                                                {day}
                                            </span>
                                            {isToday && <span className="hidden md:inline-block text-[9px] font-bold text-[#5fa5ba] bg-[#5fa5ba]/10 px-2 py-0.5 rounded-full">TODAY</span>}
                                        </div>

                                        {/* Event Rendering */}
                                        {event ? (
                                            <Link to={`/family/schedule/detail/${event.id}`} className="flex-1">
                                                {event.status === 'Completed' ? (
                                                    <div className="mt-1 flex items-center justify-center md:justify-start gap-1 p-1.5 md:p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100/50 group-hover:border-emerald-200 transition-colors">
                                                        <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                                                            <span className="material-symbols-outlined text-[12px] font-bold">check</span>
                                                        </div>
                                                        <span className="hidden md:block text-[11px] font-bold truncate line-through opacity-60">Completed</span>
                                                    </div>
                                                ) : event.status === 'Cancelled' ? (
                                                    <div className="mt-1 flex items-center justify-center md:justify-start gap-1 p-1.5 md:p-2 rounded-lg bg-red-50 text-red-700 border border-red-100/50 group-hover:border-red-200 transition-colors">
                                                        <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                                                            <span className="material-symbols-outlined text-[12px] font-bold">block</span>
                                                        </div>
                                                        <span className="hidden md:block text-[11px] font-bold truncate line-through opacity-60 text-red-400">Cancelled</span>
                                                    </div>
                                                ) : event.status === 'Failed' ? (
                                                    <div className="mt-1 flex items-center justify-center md:justify-start gap-1 p-1.5 md:p-2 rounded-lg bg-stone-50 text-stone-600 border border-stone-200/50 group-hover:border-stone-300 transition-colors">
                                                        <div className="w-5 h-5 bg-stone-200 rounded-full flex items-center justify-center shrink-0">
                                                            <span className="material-symbols-outlined text-[12px] font-bold">error</span>
                                                        </div>
                                                        <div className="hidden md:flex flex-col min-w-0">
                                                            <span className="text-[10px] font-bold opacity-70 leading-tight">{event.time}</span>
                                                            <span className="text-[11px] font-bold truncate leading-tight">{event.name}</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="mt-1 p-1.5 md:p-2 rounded-lg border flex flex-col md:flex-row items-start md:items-center gap-1.5 transition-all hover:shadow-md bg-blue-50 border-blue-200 text-blue-700">
                                                        <div className="w-1.5 h-full rounded-full absolute left-0 top-0 bottom-0 bg-blue-500 md:hidden"></div>

                                                        {/* Event Icon Pill */}
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${event.status === 'InProgress' ? 'bg-white text-blue-500 shadow-sm animate-pulse' : 'bg-white text-blue-500 shadow-sm'}`}>
                                                            <span className="material-symbols-outlined text-[14px]">
                                                                {event.status === 'InProgress' ? 'sync' : 'stethoscope'}
                                                            </span>
                                                        </div>

                                                        <div className="hidden md:flex flex-col min-w-0">
                                                            <span className="text-[10px] font-bold opacity-70 leading-tight">{event.time}</span>
                                                            <span className="text-[11px] font-bold truncate leading-tight">{event.name}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </Link>
                                        ) : (
                                            // Empty state click target
                                            <Link to="/family/booking" className="flex-1 hidden group-hover:block w-full h-full cursor-cell"></Link>
                                        )}

                                        {/* Quick Add Button (Hover) */}
                                        <Link to="/family/booking" className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-white border border-stone-200 text-stone-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-[#5fa5ba] hover:text-white hover:border-[#5fa5ba] shadow-sm z-20">
                                            <span className="material-symbols-outlined text-[16px]">add</span>
                                        </Link>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {view === 'Weekly' && (
                        <div className="p-6">
                            <div className="flex flex-col gap-4">
                                {Array.from({ length: 7 }).map((_, i) => {
                                    const date = new Date();
                                    date.setDate(date.getDate() - date.getDay() + i);
                                    const dayEvents = schedules.filter(s => new Date(s.date).toDateString() === date.toDateString());
                                    const isToday = date.toDateString() === new Date().toDateString();

                                    return (
                                        <div key={i} className={`flex gap-4 p-4 rounded-3xl border transition-all ${isToday ? 'bg-sky-50/30 border-sky-100 shadow-sm' : 'bg-white border-stone-100 hover:border-stone-200'}`}>
                                            <div className="flex flex-col items-center justify-center w-16 shrink-0">
                                                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                                <span className={`text-xl font-black ${isToday ? 'text-[#5fa5ba]' : 'text-stone-700'}`}>{date.getDate()}</span>
                                            </div>
                                            <div className="flex-1 flex flex-col gap-2">
                                                {dayEvents.length > 0 ? dayEvents.map(s => (
                                                    <Link key={s.id} to={`/family/schedule/detail/${s.id}`} className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 transition-colors border border-stone-100">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#5fa5ba] shadow-sm">
                                                                <span className="material-symbols-outlined text-xl">medical_services</span>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-stone-800">{s.serviceName || 'Care Visit'}</p>
                                                                <p className="text-[11px] text-stone-500 font-medium">With {s.caregiverName || 'TBD'} • For {s.patientName || 'Family Member'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs font-bold text-stone-700">{s.startTime ? s.startTime.substring(0, 5) : '09:00'}</p>
                                                            <p className={`text-[10px] font-bold uppercase tracking-wide ${s.status === 'Completed' ? 'text-emerald-500' : 'text-[#5fa5ba]'}`}>{s.status}</p>
                                                        </div>
                                                    </Link>
                                                )) : (
                                                    <div className="h-full flex items-center px-4">
                                                        <p className="text-xs text-stone-400 font-medium">No visits scheduled</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {view === 'List' && (
                        <div className="p-6">
                            <div className="divide-y divide-stone-100">
                                {schedules.sort((a, b) => new Date(a.date) - new Date(b.date)).map(s => (
                                    <Link key={s.id} to={`/family/schedule/detail/${s.id}`} className="flex items-center justify-between py-6 group">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-2xl bg-stone-50 flex flex-col items-center justify-center group-hover:bg-[#5fa5ba]/10 transition-colors">
                                                <span className="text-[10px] font-bold text-stone-400 uppercase">{new Date(s.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                                                <span className="text-xl font-black text-stone-700 group-hover:text-[#5fa5ba]">{new Date(s.date).getDate()}</span>
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-stone-900 group-hover:text-[#5fa5ba] transition-colors">{s.serviceName || 'Care Visit'}</h4>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <span className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                                                        <span className="material-symbols-outlined text-sm">schedule</span>
                                                        {s.startTime ? s.startTime.substring(0, 5) : '09:00'}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                                                        <span className="material-symbols-outlined text-sm">person</span>
                                                        For: {s.patientName}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                                                        <span className="material-symbols-outlined text-sm">badge</span>
                                                        Caregiver: {s.caregiverName || 'TBD'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${s.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-[#5fa5ba]/5 text-[#5fa5ba]'}`}>
                                                {s.status}
                                            </span>
                                            <span className="material-symbols-outlined text-stone-300 group-hover:text-[#5fa5ba] group-hover:translate-x-1 transition-all">chevron_right</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </ScrollAnimation>

            {/* 3. Upcoming Agenda List - Simplified List View for "Next Up" */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ScrollAnimation animation="fade-up" delay={0.2} className="md:col-span-2">
                    <div className="bg-white rounded-[2rem] border border-stone-200 shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        {nextVisit ? (
                            <>
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-[#E0F2F1] rounded-2xl flex items-center justify-center text-[#00695C]">
                                        <span className="material-symbols-outlined text-2xl">event_upcoming</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-stone-900">Upcoming Visit</h3>
                                        <p className="text-sm text-stone-500">
                                            {new Date(nextVisit.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} at <span className="font-bold text-stone-700">{nextVisit.startTime.substring(0, 5)}</span> with <span className="font-bold text-stone-700">{nextVisit.caregiverName || 'TBD'}</span>
                                        </p>
                                    </div>
                                </div>
                                <Link to={`/family/schedule/detail/${nextVisit.id}`} className="px-6 py-3 bg-stone-900 text-white rounded-full text-sm font-bold hover:bg-stone-800 transition-colors shadow-lg shadow-stone-900/10">
                                    View Details
                                </Link>
                            </>
                        ) : (
                            <div className="flex items-center gap-4 py-2">
                                <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-400">
                                    <span className="material-symbols-outlined text-2xl">event_busy</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-stone-400">No Upcoming Visits</h3>
                                    <p className="text-sm text-stone-400 font-medium">Schedule a new visit to get started.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollAnimation>

                <ScrollAnimation animation="fade-up" delay={0.3}>
                    <div className="bg-[#5fa5ba] rounded-[2rem] p-6 text-white text-center relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="relative z-10">
                            <span className="material-symbols-outlined text-4xl mb-2">download</span>
                            <h3 className="font-bold text-lg">Export Schedule</h3>
                            <button className="mt-4 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold hover:bg-white hover:text-[#5fa5ba] transition-all border border-white/20">
                                Download PDF
                            </button>
                        </div>
                    </div>
                </ScrollAnimation>
            </div>
        </div>
    );
};

export default CareSchedule;
