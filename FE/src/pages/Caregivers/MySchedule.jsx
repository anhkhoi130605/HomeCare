import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ScrollAnimation from "@/components/ui/scroll-animation";
import { caregiverApi, authApi } from '@/lib/api';
import { formatTimeSpan, formatDateToYYYYMMDD } from '@/lib/utils';

const MySchedule = () => {
    const [viewMode, setViewMode] = useState('week');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [schedules, setSchedules] = useState([]);
    const [selectedShift, setSelectedShift] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const navigate = useNavigate();

    const handleLogout = () => {
        authApi.logout();
        navigate('/login');
    };

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    useEffect(() => {
        fetchData();
    }, [selectedDate, viewMode]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const profileData = await caregiverApi.getProfile();
            setProfile(profileData);

            // Calculate date range based on view mode
            let from, to;
            if (viewMode === 'week') {
                const startOfWeek = new Date(selectedDate);
                startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                from = formatDateToYYYYMMDD(startOfWeek);
                to = formatDateToYYYYMMDD(endOfWeek);
            } else {
                const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
                const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
                from = formatDateToYYYYMMDD(startOfMonth);
                to = formatDateToYYYYMMDD(endOfMonth);
            }

            const schedulesData = await caregiverApi.getSchedules(from, to);
            setSchedules(schedulesData);

            // Auto-select first schedule of today
            const today = formatDateToYYYYMMDD(new Date());
            const todaySchedule = schedulesData.find(s => s.date.split('T')[0] === today);
            if (todaySchedule) {
                setSelectedShift(todaySchedule);
            }
        } catch (err) {
            console.error('Failed to fetch schedules:', err);
        } finally {
            setLoading(false);
        }
    };

    const getDaysInView = () => {
        if (viewMode === 'week') {
            const startOfWeek = new Date(selectedDate);
            startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
            return Array.from({ length: 7 }, (_, i) => {
                const day = new Date(startOfWeek);
                day.setDate(startOfWeek.getDate() + i);
                return day;
            });
        } else {
            const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
            const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
            const startPadding = startOfMonth.getDay();
            const days = [];

            // Add padding for start of month
            for (let i = startPadding - 1; i >= 0; i--) {
                const day = new Date(startOfMonth);
                day.setDate(-i);
                days.push({ date: day, isCurrentMonth: false });
            }

            // Add days of month
            for (let i = 1; i <= endOfMonth.getDate(); i++) {
                days.push({
                    date: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i),
                    isCurrentMonth: true
                });
            }

            return days;
        }
    };

    const getSchedulesForDay = (date) => {
        const dateStr = formatDateToYYYYMMDD(date);
        return schedules.filter(s => s.date.split('T')[0] === dateStr);
    };

    const formatTime = (timeStr) => formatTimeSpan(timeStr);

    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const canCheckIn = (schedule) => {
        if (!schedule || schedule.status !== 'Scheduled') return false;

        const now = new Date();
        const scheduleDate = new Date(schedule.date);

        // If it's not today, definitely can't check in
        if (scheduleDate.toDateString() !== now.toDateString()) return false;

        // Parse "HH:mm:ss" or "HH:mm"
        const timeParts = schedule.startTime.split(':');
        const hours = parseInt(timeParts[0]);
        const minutes = parseInt(timeParts[1]);

        const shiftStart = new Date(now);
        shiftStart.setHours(hours, minutes, 0, 0);

        // Allow check-in from 30 minutes before
        const checkInWindowStart = new Date(shiftStart.getTime() - 30 * 60000);

        return now >= checkInWindowStart;
    };

    const getDisplayStatus = (schedule) => {
        if (!schedule) return '';
        const { status, date, startTime, endTime } = schedule;

        // Final statuses are permanent
        if (['Completed', 'Cancelled', 'Failed'].includes(status)) return status;

        const now = new Date();
        const scheduleDate = new Date(date);

        const parseTime = (timeStr) => {
            const parts = timeStr.split(':');
            const d = new Date(scheduleDate);
            d.setHours(parseInt(parts[0]), parseInt(parts[1]), 0, 0);
            return d;
        };

        const start = parseTime(startTime);
        let end = parseTime(endTime);
        
        // Handle shifts crossing midnight
        if (end <= start) {
            end.setDate(end.getDate() + 1);
        }

        // Logic for Upcoming vs InProgress vs Not Completed
        if (now < new Date(start.getTime() - 30 * 60000)) {
            return 'Scheduled'; // Show as Upcoming
        }

        if (now > new Date(end.getTime() + 30 * 60000) && status !== 'Completed') {
            return 'Failed'; // Show as Not Completed
        }

        return status;
    };

    const getEventStyle = (status) => {
        if (status === 'InProgress') {
            return "bg-[#5fa5ba] text-white shadow-[#5fa5ba]/30";
        } else if (status === 'Completed') {
            return "bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-300";
        } else if (status === 'Failed') {
            return "bg-rose-100 text-rose-700 border-l-4 border-rose-500 shadow-rose-100/30";
        } else {
            return "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-300";
        }
    };

    const navigateDate = (direction) => {
        const newDate = new Date(selectedDate);
        if (viewMode === 'week') {
            newDate.setDate(newDate.getDate() + (direction * 7));
        } else {
            newDate.setMonth(newDate.getMonth() + direction);
        }
        setSelectedDate(newDate);
    };

    const goToToday = () => {
        setSelectedDate(new Date());
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-background-light dark:bg-stone-950">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#5fa5ba] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-stone-500 dark:text-stone-400">Loading schedule...</p>
                </div>
            </div>
        );
    }

    const days = getDaysInView();

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-background-light dark:bg-stone-950 font-manrope">
            <ScrollAnimation animation="fade-down" delay={0.1}>
                <header className="bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800 px-8 py-5 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold text-stone-800 dark:text-white tracking-tight">My Schedule</h1>
                        <p className="text-sm font-medium text-stone-400 mt-1">View and manage your upcoming shifts</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex bg-stone-100 dark:bg-stone-800 p-1.5 rounded-2xl border border-stone-200 dark:border-stone-700">
                            <button
                                onClick={() => setViewMode('month')}
                                className={`px-6 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${viewMode === 'month' ? 'bg-white dark:bg-stone-700 shadow-sm text-stone-800 dark:text-white' : 'text-stone-500 hover:text-stone-700'}`}>
                                Month
                            </button>
                            <button
                                onClick={() => setViewMode('week')}
                                className={`px-6 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${viewMode === 'week' ? 'bg-white dark:bg-stone-700 shadow-sm text-stone-800 dark:text-white' : 'text-stone-500 hover:text-stone-700'}`}>
                                Week
                            </button>
                        </div>
                        <div className="flex items-center gap-4 pl-6 border-l border-stone-100 dark:border-stone-800">
                            <button className="p-2 text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-full transition-colors relative">
                                <span className="material-symbols-outlined text-2xl">notifications</span>
                            </button>
                            <Link to="/caregiver/profile" className="group">
                                <img
                                    alt="Caregiver profile"
                                    className="w-12 h-12 rounded-2xl object-cover shadow-sm border-2 border-white dark:border-stone-800 group-hover:border-[#5fa5ba] transition-all"
                                    src={profile?.imageUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop"}
                                />
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all ml-2"
                                title="Sign Out"
                            >
                                <span className="material-symbols-outlined text-2xl">logout</span>
                            </button>
                        </div>
                    </div>
                </header>
            </ScrollAnimation>

            <div className="flex-1 overflow-hidden flex">
                {/* Calendar Grid Section */}
                <ScrollAnimation animation="fade-right" delay={0.2} className="flex-1 overflow-hidden">
                    <div className="h-full p-8 overflow-y-auto custom-scrollbar">
                        <div className="bg-white dark:bg-stone-800 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 shadow-xl overflow-hidden flex flex-col min-h-[700px]">
                            <div className="flex items-center justify-between p-8 border-b border-stone-100 dark:border-stone-800">
                                <div className="flex items-center gap-6">
                                    <h2 className="text-3xl font-extrabold text-stone-800 dark:text-white tracking-tight">
                                        {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                                    </h2>
                                    <div className="flex gap-2 text-stone-400 dark:text-stone-400">
                                        <button
                                            onClick={() => navigateDate(-1)}
                                            className="w-10 h-10 flex items-center justify-center border border-stone-200 rounded-full hover:bg-stone-50 hover:text-stone-800 transition-all"
                                        >
                                            <span className="material-symbols-outlined">chevron_left</span>
                                        </button>
                                        <button
                                            onClick={() => navigateDate(1)}
                                            className="w-10 h-10 flex items-center justify-center border border-stone-200 rounded-full hover:bg-stone-50 hover:text-stone-800 transition-all"
                                        >
                                            <span className="material-symbols-outlined">chevron_right</span>
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={goToToday}
                                    className="text-sm font-black text-[#5fa5ba] hover:underline uppercase tracking-wider">
                                    Today
                                </button>
                            </div>

                            <div className="grid grid-cols-7 border-b border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50">
                                {weekDays.map(day => (
                                    <div key={day} className="py-4 text-center text-[10px] font-black text-stone-400 uppercase tracking-widest">{day}</div>
                                ))}
                            </div>

                            <div className={`grid grid-cols-7 divide-x divide-y divide-stone-100 dark:divide-stone-800 flex-1 ${viewMode === 'week' ? 'auto-rows-[minmax(500px,1fr)]' : ''}`}>
                                {days.map((dayItem, index) => {
                                    const date = viewMode === 'week' ? dayItem : dayItem.date;
                                    const daySchedules = getSchedulesForDay(date);
                                    const isTodayDate = isToday(date);
                                    const isCurrentMonth = viewMode === 'week' ? true : dayItem.isCurrentMonth;

                                    return (
                                        <div
                                            key={index}
                                            className={`min-h-[140px] p-4 group transition-colors 
                                                hover:bg-stone-50 dark:hover:bg-stone-700/20
                                                ${isTodayDate ? 'ring-2 ring-[#5fa5ba] ring-inset bg-[#5fa5ba]/5' : ''}
                                                ${!isCurrentMonth ? 'bg-stone-50/50 dark:bg-stone-900/30' : ''}
                                            `}
                                        >
                                            <span className={`text-sm font-bold ${isTodayDate ? 'text-[#5fa5ba]' : isCurrentMonth ? 'text-stone-400 dark:text-stone-500' : 'text-stone-300 dark:text-stone-600'}`}>
                                                {date.getDate()}
                                            </span>

                                            {daySchedules.length > 0 && (
                                                <div className="mt-3 space-y-2">
                                                    {daySchedules.map((schedule) => (
                                                        <div
                                                            key={schedule.id}
                                                            onClick={() => setSelectedShift(schedule)}
                                                            className={`p-2 rounded-xl text-[10px] font-bold truncate shadow-sm transition-transform hover:scale-105 cursor-pointer ${getEventStyle(getDisplayStatus(schedule))}`}
                                                        >
                                                            {formatTime(schedule.startTime)} - {schedule.patientName}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </ScrollAnimation>

                {/* Sidebar Details Section */}
                <ScrollAnimation animation="fade-left" delay={0.3} className="flex-shrink-0">
                    <aside className="w-[420px] h-full bg-white dark:bg-stone-800 border-l border-stone-100 dark:border-stone-800 overflow-y-auto custom-scrollbar p-8">
                        <div className="mb-8">
                            <span className="text-[10px] font-black text-[#5fa5ba] uppercase tracking-widest">Selected Shift</span>
                            <h3 className="text-3xl font-extrabold mt-1 text-stone-800 dark:text-white tracking-tight">
                                {selectedShift ? new Date(selectedShift.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : 'No shift selected'}
                            </h3>
                        </div>

                        <div className="space-y-6">
                            {selectedShift ? (
                                <div className="bg-[#5fa5ba]/5 dark:bg-[#5fa5ba]/10 rounded-[2rem] p-8 border border-[#5fa5ba]/20 dark:border-[#5fa5ba]/30 relative overflow-hidden group">
                                    <div className="flex items-center justify-between mb-6">
                                        <span className={`text-[10px] px-3 py-1.5 rounded-lg font-black uppercase tracking-wider ${getDisplayStatus(selectedShift) === 'InProgress'
                                            ? 'bg-[#5fa5ba] text-white'
                                            : getDisplayStatus(selectedShift) === 'Completed'
                                                ? 'bg-stone-200 text-stone-600'
                                                : getDisplayStatus(selectedShift) === 'Failed'
                                                    ? 'bg-rose-500 text-white'
                                                    : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                            {getDisplayStatus(selectedShift) === 'InProgress' ? 'In Progress' : (getDisplayStatus(selectedShift) === 'Failed' ? 'Not Completed' : (getDisplayStatus(selectedShift) === 'Scheduled' ? 'Upcoming' : getDisplayStatus(selectedShift)))}
                                        </span>
                                        <span className="text-xs text-stone-500 font-bold dark:text-stone-400">
                                            {formatTime(selectedShift.startTime)} - {formatTime(selectedShift.endTime)}
                                        </span>
                                    </div>
                                    <h4 className="font-extrabold text-stone-800 dark:text-white text-2xl">{selectedShift.patientName}</h4>
                                    <div className="mt-6 space-y-5">
                                        <div className="flex items-start gap-4">
                                            <span className="material-symbols-outlined text-[#5fa5ba] text-2xl">location_on</span>
                                            <p className="text-sm text-stone-600 dark:text-stone-300 font-medium leading-relaxed">
                                                {selectedShift.patientAddress || 'Address not provided'}
                                            </p>
                                        </div>
                                        {selectedShift.notes && (
                                            <div className="flex items-start gap-4">
                                                <span className="material-symbols-outlined text-[#5fa5ba] text-2xl">notes</span>
                                                <p className="text-sm text-stone-600 dark:text-stone-300 font-medium leading-relaxed">
                                                    {selectedShift.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    {canCheckIn(selectedShift) && (
                                        <Link to={`/caregiver/active-shift?scheduleId=${selectedShift.id}`} className="w-full mt-8 bg-[#5fa5ba] hover:bg-[#4d8ca0] text-white py-5 rounded-2xl font-bold text-sm shadow-xl shadow-[#5fa5ba]/20 transition-all flex items-center justify-center gap-2 group hover:scale-[1.02]">
                                            <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">login</span>
                                            QUICK CHECK-IN
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-stone-50 dark:bg-stone-900 rounded-[2rem] p-8 border border-dashed border-stone-200 dark:border-stone-800 text-center py-12">
                                    <span className="material-symbols-outlined text-4xl text-stone-300 mb-2">event_busy</span>
                                    <p className="text-stone-500 font-bold">Select a shift to view details</p>
                                    <p className="text-xs text-stone-400 mt-1">Click on any colored shift block</p>
                                </div>
                            )}

                            {/* Status Legend */}
                            <div className="p-6 bg-stone-50 dark:bg-stone-900 rounded-[2rem] border border-stone-200 dark:border-stone-700">
                                <h5 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-4">Shift Status</h5>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-[#5fa5ba]"></div>
                                        <span className="text-xs font-bold text-stone-600 dark:text-stone-300">Active / In Progress</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                        <span className="text-xs font-bold text-stone-600 dark:text-stone-300">Upcoming</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-stone-300"></div>
                                        <span className="text-xs font-bold text-stone-600 dark:text-stone-300">Completed</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                                        <span className="text-xs font-bold text-stone-600 dark:text-stone-300">Not Completed</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </ScrollAnimation>
            </div>
        </div>
    );
};

export default MySchedule;
