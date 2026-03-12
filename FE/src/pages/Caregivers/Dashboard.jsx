import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { caregiverApi, authApi } from '@/lib/api';
import { formatTimeSpan, formatDateToYYYYMMDD } from '@/lib/utils';
import ScrollAnimation from "@/components/ui/scroll-animation";

const Dashboard = () => {
    const [profile, setProfile] = useState(null);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [checkingIn, setCheckingIn] = useState(null);
    const navigate = useNavigate();

    const handleLogout = () => {
        authApi.logout();
        navigate('/login');
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch caregiver profile
                const profileData = await caregiverApi.getProfile();
                setProfile(profileData);

                // Fetch today's schedules
                const today = formatDateToYYYYMMDD(new Date());
                const schedulesData = await caregiverApi.getSchedules(today, today);
                setSchedules(schedulesData);
            } catch (err) {
                console.error('Failed to fetch data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Get current active shift
    const now = new Date();
    const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
    const activeShift = schedules.find(s => {
        const startParts = s.startTime.split(':').map(Number);
        const endParts = s.endTime.split(':').map(Number);
        
        const scheduleDate = new Date(s.date);
        const start = new Date(scheduleDate);
        start.setHours(startParts[0], startParts[1], 0, 0);
        
        let end = new Date(scheduleDate);
        end.setHours(endParts[0], endParts[1], 0, 0);
        if (end <= start) end.setDate(end.getDate() + 1);

        // STRICTOR: Only active during the actual shift time
        return now >= start && now <= end && s.status !== 'Completed';
    });

    // Upcoming shifts (not yet started)
    const upcomingShifts = schedules.filter(s => {
        const startParts = s.startTime.split(':').map(Number);
        const scheduleDate = new Date(s.date);
        const start = new Date(scheduleDate);
        start.setHours(startParts[0], startParts[1], 0, 0);
        
        // Include everything that hasn't started yet
        return now < start && s.status === 'Scheduled';
    });

    // Calculate stats
    const completedToday = schedules.filter(s => s.status === 'Completed').length;
    const totalHoursToday = schedules.reduce((acc, s) => {
        const startParts = s.startTime.split(':').map(Number);
        const endParts = s.endTime.split(':').map(Number);
        let diffHours = (endParts[0] + endParts[1]/60) - (startParts[0] + startParts[1]/60);
        if (diffHours < 0) diffHours += 24; // Crossed midnight
        return acc + diffHours;
    }, 0);

    const formatTime = (timeStr) => formatTimeSpan(timeStr);

    const handleCheckIn = async (scheduleId) => {
        try {
            setCheckingIn(scheduleId);
            await caregiverApi.checkIn(scheduleId);
            // Update local state to reflect the change
            setSchedules(prev => prev.map(s =>
                s.id === scheduleId ? { ...s, status: 'InProgress', checkInTime: new Date().toISOString() } : s
            ));
            // Navigate to active shift page
            window.location.href = '/caregiver/active-shift';
        } catch (err) {
            console.error('Check-in failed:', err);
            alert('Check-in failed: ' + err.message);
        } finally {
            setCheckingIn(null);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-background-light dark:bg-stone-950">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#5fa5ba] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-stone-500 dark:text-stone-400">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center bg-background-light dark:bg-stone-950">
                <div className="text-center text-red-500">
                    <p>Error loading dashboard: {error}</p>
                    <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto bg-background-light dark:bg-stone-950 font-manrope">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border-b border-stone-100 dark:border-stone-800 px-8 py-5 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-stone-800 dark:text-white tracking-tight">Caregiver Dashboard</h1>
                    <p className="text-sm font-medium text-stone-500 dark:text-stone-400 mt-1">Welcome back, {profile?.fullName || 'Caregiver'}</p>
                </div>
                <div className="flex items-center gap-5">
                    <button className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-[#5fa5ba] hover:bg-[#5fa5ba]/10 rounded-full transition-all relative">
                        <span className="material-symbols-outlined text-2xl">notifications</span>
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-stone-900"></span>
                    </button>
                    <div className="flex items-center gap-4 pl-6 border-l border-stone-100 dark:border-stone-800 group">
                        <Link to="/caregiver/profile">
                            <img
                                alt="Caregiver profile"
                                className="w-10 h-10 rounded-full object-cover shadow-sm ring-2 ring-white dark:ring-stone-800 group-hover:ring-[#5fa5ba] transition-all cursor-pointer"
                                src={profile?.imageUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop"}
                            />
                        </Link>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Sign Out"
                    >
                        <span className="material-symbols-outlined text-2xl">logout</span>
                    </button>
                </div>
            </header>

            <div className="p-8 max-w-[1600px] mx-auto space-y-8">
                {/* Top Section: Active Shift & Overview */}
                <ScrollAnimation animation="fade-up" delay={0.1}>
                    <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* Active Shift Card */}
                        <div className="xl:col-span-2 bg-gradient-to-br from-[#5fa5ba] to-[#458194] rounded-[2rem] p-8 text-white shadow-xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
                            {/* Decorative Background Icons */}
                            <span className="material-symbols-outlined absolute -top-10 -right-10 text-[18rem] text-white/5 rotate-12 transition-transform group-hover:rotate-6">health_and_safety</span>

                            <div className="flex-1 space-y-5 relative z-10 w-full text-center md:text-left">
                                <div>
                                    {activeShift ? (
                                        <>
                                            <span className="bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                                Active Shift
                                            </span>
                                            <h2 className="text-3xl font-extrabold mt-3 tracking-tight">Current Appointment</h2>
                                        </>
                                    ) : (
                                        <>
                                            <span className="bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                                                No Active Shift
                                            </span>
                                            <h2 className="text-3xl font-extrabold mt-3 tracking-tight">
                                                {upcomingShifts.length > 0 ? 'Next Appointment' : 'No Shifts Today'}
                                            </h2>
                                        </>
                                    )}
                                </div>
                                {(activeShift || upcomingShifts[0]) && (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 justify-center md:justify-start">
                                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-sm">person</span>
                                            </div>
                                            <span className="text-lg font-bold">{(activeShift || upcomingShifts[0])?.patientName}</span>
                                        </div>
                                        <div className="flex items-center gap-3 justify-center md:justify-start">
                                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-sm">schedule</span>
                                            </div>
                                            <span className="font-medium text-blue-50">
                                                {formatTime((activeShift || upcomingShifts[0])?.startTime)} - {formatTime((activeShift || upcomingShifts[0])?.endTime)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 justify-center md:justify-start">
                                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-sm">location_on</span>
                                            </div>
                                            <span className="font-medium text-blue-50">{(activeShift || upcomingShifts[0])?.patientAddress || 'Address not provided'}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {(activeShift || upcomingShifts[0]) && (
                                <div className="flex-shrink-0 relative z-10 flex flex-col items-center">
                                    {(() => {
                                        const shift = activeShift || upcomingShifts[0];
                                        const startParts = shift.startTime.split(':').map(Number);
                                        const start = new Date(shift.date);
                                        start.setHours(startParts[0], startParts[1], 0, 0);
                                        const isReady = now >= start;

                                        return isReady ? (
                                            <>
                                                <Link 
                                                    to={`/caregiver/active-shift?scheduleId=${shift.id}`} 
                                                    className="bg-white text-[#5fa5ba] hover:bg-blue-50 px-8 py-5 rounded-2xl font-black text-lg shadow-lg flex items-center gap-3 transition-all hover:scale-105 active:scale-95 group/btn"
                                                >
                                                    <span className="material-symbols-outlined text-2xl group-hover/btn:rotate-12 transition-transform">login</span>
                                                    QUICK CHECK-IN
                                                </Link>
                                                <p className="text-white/80 text-xs mt-3 text-center italic font-medium">Arrived at location? Tap to start log.</p>
                                            </>
                                        ) : (
                                            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-8 py-5 rounded-2xl flex flex-col items-center">
                                                <span className="text-white font-black text-lg flex items-center gap-2">
                                                    <span className="material-symbols-outlined animate-pulse text-yellow-400">lock_clock</span>
                                                    WAITING TO START
                                                </span>
                                                <p className="text-white/60 text-[10px] mt-1 font-bold uppercase tracking-wider">
                                                    Check-in available at {formatTime(shift.startTime)}
                                                </p>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>

                        {/* Today's Overview */}
                        <div className="bg-white dark:bg-stone-900 rounded-[2rem] p-8 shadow-sm border border-stone-100 dark:border-stone-800 flex flex-col">
                            <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-stone-800 dark:text-white">
                                <span className="w-8 h-8 rounded-lg bg-[#5fa5ba]/10 text-[#5fa5ba] flex items-center justify-center">
                                    <span className="material-symbols-outlined text-lg">analytics</span>
                                </span>
                                Today's Overview
                            </h3>
                            <div className="space-y-4 flex-1">
                                <div className="flex justify-between items-center p-4 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-100 dark:border-stone-800">
                                    <span className="text-stone-500 dark:text-stone-400 font-bold text-xs uppercase tracking-wider">Total Hours</span>
                                    <span className="font-black text-xl text-stone-800 dark:text-white">{totalHoursToday.toFixed(1)}h</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-100 dark:border-stone-800">
                                    <span className="text-stone-500 dark:text-stone-400 font-bold text-xs uppercase tracking-wider">Completed Shifts</span>
                                    <span className="font-black text-xl text-stone-800 dark:text-white">{completedToday}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-100 dark:border-stone-800">
                                    <span className="text-stone-500 dark:text-stone-400 font-bold text-xs uppercase tracking-wider">Total Today</span>
                                    <span className="font-black text-xl text-stone-800 dark:text-white">{schedules.length}</span>
                                </div>
                            </div>
                            <Link to="/caregiver/my-schedule" className="w-full mt-6 py-3 text-[#5fa5ba] border-2 border-[#5fa5ba]/20 hover:bg-[#5fa5ba] hover:text-white rounded-xl transition-all font-bold text-sm text-center">
                                View Full Schedule
                            </Link>
                        </div>
                    </section>
                </ScrollAnimation>

                {/* Middle Section: Upcoming & Quick Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Upcoming Today */}
                    <ScrollAnimation animation="fade-up" delay={0.2} className="h-full">
                        <section className="space-y-5 h-full">
                            <div className="flex items-center justify-between px-1">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-stone-800 dark:text-white">
                                    <span className="material-symbols-outlined text-[#5fa5ba]">event_note</span>
                                    Upcoming Today
                                </h2>
                                <span className="text-sm text-stone-400 font-bold uppercase tracking-wider">
                                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                            </div>
                            <div className="space-y-4">
                                {upcomingShifts.length === 0 ? (
                                    <div className="bg-white dark:bg-stone-900 p-8 rounded-[2rem] border border-stone-100 dark:border-stone-800 text-center">
                                        <span className="material-symbols-outlined text-4xl text-stone-300 dark:text-stone-600">event_available</span>
                                        <p className="text-stone-500 dark:text-stone-400 mt-2 font-medium">No more shifts scheduled for today</p>
                                    </div>
                                ) : (
                                    upcomingShifts.map((shift) => (
                                        <div key={shift.id} className="bg-white dark:bg-stone-900 p-6 rounded-[2rem] border border-stone-100 dark:border-stone-800 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-5">
                                                    {/* Map Preview / Location Avatar */}
                                                    <a 
                                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shift.patientAddress || shift.patientName)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-16 h-16 rounded-2xl bg-[#5fa5ba]/10 dark:bg-[#5fa5ba]/20 flex flex-col items-center justify-center text-[#5fa5ba] hover:bg-[#5fa5ba] hover:text-white transition-all group/map border border-[#5fa5ba]/20 overflow-hidden relative"
                                                        title="Open in Google Maps"
                                                    >
                                                        <span className="material-symbols-outlined text-2xl group-hover/map:scale-120 transition-transform">map</span>
                                                        <span className="text-[8px] font-black uppercase mt-1">View Map</span>
                                                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#5fa5ba_1px,transparent_1px)] [background-size:8px_8px]"></div>
                                                    </a>
                                                    <div>
                                                        <h4 className="font-extrabold text-lg text-stone-800 dark:text-white leading-tight">{shift.patientName}</h4>
                                                        <a 
                                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shift.patientAddress || shift.patientName)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1 font-bold mt-1 hover:text-[#5fa5ba] transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">location_on</span>
                                                            <span className="underline decoration-dotted">{shift.patientAddress || 'Address not provided'}</span>
                                                        </a>
                                                    </div>
                                                </div>
                                                    <div className="text-right flex flex-col items-end gap-2">
                                                        <span className="text-sm font-black text-[#5fa5ba] bg-[#5fa5ba]/10 px-3 py-1 rounded-lg block">
                                                            {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                                                        </span>
                                                        {(() => {
                                                            const startParts = shift.startTime.split(':').map(Number);
                                                            const start = new Date(shift.date);
                                                            start.setHours(startParts[0], startParts[1], 0, 0);
                                                            const isReady = now >= start;

                                                            return isReady ? (
                                                                <button
                                                                    onClick={() => handleCheckIn(shift.id)}
                                                                    disabled={checkingIn === shift.id}
                                                                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    {checkingIn === shift.id ? (
                                                                        <>
                                                                            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                                            Checking in...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <span className="material-symbols-outlined text-sm">login</span>
                                                                            Check In
                                                                        </>
                                                                    )}
                                                                </button>
                                                            ) : (
                                                                <span className="flex items-center gap-1.5 text-[10px] font-black text-amber-500 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                                                                    <span className="material-symbols-outlined text-sm">lock</span>
                                                                    LOCKED
                                                                </span>
                                                            );
                                                        })()}
                                                    </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </ScrollAnimation>

                    {/* Profile Summary */}
                    <ScrollAnimation animation="fade-up" delay={0.3} className="h-full">
                        <section className="bg-white dark:bg-stone-900 rounded-[2rem] border border-stone-100 dark:border-stone-800 overflow-hidden shadow-sm p-8 h-full">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-stone-800 dark:text-white mb-6">
                                <span className="material-symbols-outlined text-[#5fa5ba]">person</span>
                                Your Profile
                            </h2>
                            {profile && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={profile.imageUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop"}
                                            alt={profile.fullName}
                                            className="w-16 h-16 rounded-full object-cover"
                                        />
                                        <div>
                                            <h3 className="font-bold text-lg text-stone-800 dark:text-white">{profile.fullName}</h3>
                                            <p className="text-sm text-stone-500 dark:text-stone-400">{profile.specialization || 'General Care'}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
                                            <p className="text-xs text-stone-400 uppercase font-bold">Experience</p>
                                            <p className="text-lg font-bold text-stone-800 dark:text-white">{profile.experienceYears} years</p>
                                        </div>
                                        <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
                                            <p className="text-xs text-stone-400 uppercase font-bold">Status</p>
                                            <p className={`text-lg font-bold ${profile.isAvailable ? 'text-green-500' : 'text-amber-500'}`}>
                                                {profile.isAvailable ? 'Available' : 'Busy'}
                                            </p>
                                        </div>
                                    </div>
                                    <Link to="/caregiver/profile" className="block w-full mt-4 py-3 text-center text-[#5fa5ba] border-2 border-[#5fa5ba]/20 hover:bg-[#5fa5ba] hover:text-white rounded-xl transition-all font-bold text-sm">
                                        View Full Profile
                                    </Link>
                                </div>
                            )}
                        </section>
                    </ScrollAnimation>
                </div>

                {/* Incident Report Banner */}
                <ScrollAnimation animation="scale-up" delay={0.4}>
                    <section className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400 shadow-inner">
                                <span className="material-symbols-outlined text-3xl">warning</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-red-800 dark:text-red-200 text-lg">Something went wrong?</h3>
                                <p className="text-sm text-red-700/70 dark:text-red-300/60 font-medium">Report incidents immediately to ensure patient safety and company compliance.</p>
                            </div>
                        </div>
                        <Link to="/caregiver/incidents" className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-xl shadow-red-600/20 transition-all flex items-center gap-2 hover:-translate-y-0.5 active:scale-95">
                            <span className="material-symbols-outlined">add_circle</span>
                            NEW INCIDENT REPORT
                        </Link>
                    </section>
                </ScrollAnimation>
            </div>

            <footer className="p-8 text-center text-stone-400 text-xs font-bold">
                Â© 2024 HomeCare Systems Inc. All Rights Reserved. â€¢ <a className="hover:text-[#5fa5ba] underline transition-colors" href="#">Privacy Policy</a>
            </footer>
        </div>
    );
};

export default Dashboard;
