import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { familyApi, authApi } from '@/lib/api';
import ScrollAnimation from "@/components/ui/scroll-animation";

const FamilyDashboard = () => {
    const [patients, setPatients] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const user = authApi.getCurrentUser();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [patientsData, profileData] = await Promise.all([
                    familyApi.getPatients(),
                    familyApi.getProfile()
                ]);
                setPatients(patientsData || []);
                setProfile(profileData);
            } catch (error) {
                console.error("Failed to fetch family data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getUserName = () => {
        if (profile?.fullName) return profile.fullName.split(' ')[0];
        if (user?.email) return user.email.split('@')[0];
        return 'Family';
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const today = new Date();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
    const monthName = today.toLocaleDateString('en-US', { month: 'long' });
    const dayNumber = today.getDate();

    return (
        <div className="font-['Public_Sans'] space-y-6 pb-12">

            {/* 1. Header & Quick Stats Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Welcome Banner - Span 2 */}
                <ScrollAnimation animation="fade-in" className="xl:col-span-2">
                    <div className="bg-[#99C5D3] rounded-[2.5rem] p-8 text-white relative overflow-hidden h-full flex flex-col justify-between min-h-[220px] shadow-xl shadow-[#99C5D3]/20">
                        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-teal-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>

                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 mb-2 bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                                    <span className="material-symbols-outlined text-white text-sm animate-pulse">light_mode</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">Daily Update</span>
                                </div>
                                <h1 className="text-4xl font-medium tracking-tight leading-tight mb-2">
                                    {getGreeting()}, <br />
                                    <span className="text-white/80">{getUserName()}</span>
                                </h1>
                            </div>
                            <button className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center backdrop-blur-md border border-white/20 transition-colors shadow-sm">
                                <span className="material-symbols-outlined text-white">notifications</span>
                            </button>
                        </div>

                        {/* Quick Dates / Weather Mini */}
                        <div className="relative z-10 flex gap-6 items-end">
                            <div className="bg-white/20 backdrop-blur-md px-5 py-3 rounded-[1.5rem] border border-white/20 flex items-center gap-3 shadow-inner">
                                <span className="text-2xl font-bold">{dayNumber}</span>
                                <div className="h-8 w-[1px] bg-white/30"></div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase font-bold text-white/70">{monthName}</span>
                                    <span className="text-xs font-bold">{dayName}</span>
                                </div>
                            </div>
                            <div className="flex-1"></div>
                            <p className="text-white/80 text-xs text-right max-w-[150px] hidden sm:block">
                                You have <span className="text-white font-bold">{patients.length} patient{patients.length !== 1 ? 's' : ''}</span> registered.
                            </p>
                        </div>
                    </div>
                </ScrollAnimation>

                {/* Right Column: Active Contract (Compact) */}
                <ScrollAnimation animation="fade-in" delay={0.1} className="xl:col-span-1">
                    <div className="bg-[#5fa5ba] rounded-[2.5rem] p-8 text-white h-full relative overflow-hidden group hover:shadow-xl hover:shadow-[#5fa5ba]/20 transition-all">
                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors"></div>
                        <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                            <div className="flex justify-between items-start">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-inner">
                                    <span className="material-symbols-outlined text-2xl">verified_user</span>
                                </div>
                                <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm border border-white/10">
                                    {patients.length > 0 ? 'Active' : 'Setup'}
                                </span>
                            </div>
                            <div>
                                <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-1">Your Account</p>
                                <h3 className="text-2xl font-bold mb-1">{profile?.fullName || user?.email?.split('@')[0] || 'Welcome!'}</h3>
                                <p className="text-sm text-white/90">{profile?.phone || 'Complete your profile'}</p>
                            </div>
                            <div className="pt-4 border-t border-white/20 flex justify-between items-center">
                                <span className="text-lg font-bold">{patients.length} Patient{patients.length !== 1 ? 's' : ''}</span>
                                <Link to="/family/patients" className="w-10 h-10 bg-white text-[#5fa5ba] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </ScrollAnimation>
            </div>

            {/* 2. Irregular Grid - "Professional Layout" */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Column A: Schedule (Tall Sidebar) - Span 4 */}
                <div className="lg:col-span-4 lg:row-span-2">
                    <ScrollAnimation animation="fade-up" delay={0.2} className="h-full">
                        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-stone-100 h-full flex flex-col hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#5fa5ba]">calendar_today</span>
                                    Timeline
                                </h2>
                                <Link to="/family/schedule" className="text-xs font-bold text-[#5fa5ba] hover:text-[#4d8ca0] uppercase tracking-wider border border-[#B2EBF2] px-3 py-1 rounded-full hover:bg-[#E0F2F1] transition-colors">View All</Link>
                            </div>

                            <div className="flex-1 relative space-y-8 pl-4">
                                <div className="absolute left-[20px] top-2 bottom-2 w-[2px] bg-stone-100"></div>

                                {loading ? (
                                    <div className="text-center py-8 text-stone-400">Loading...</div>
                                ) : (
                                    <>
                                        <div className="relative pl-8 group cursor-pointer">
                                            <div className="absolute left-0 top-1 w-[10px] h-[10px] bg-[#5fa5ba] rounded-full border-2 border-white ring-4 ring-[#E0F2F1] group-hover:ring-[#B2EBF2] transition-all z-10"></div>
                                            <div className="bg-stone-50 group-hover:bg-[#E0F2F1] p-4 rounded-[1.5rem] transition-colors border border-transparent group-hover:border-[#B2EBF2]">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-[10px] font-bold text-stone-400 uppercase">Welcome</span>
                                                </div>
                                                <h4 className="font-bold text-stone-800 text-sm mb-1">Get Started</h4>
                                                <p className="text-xs text-stone-500">Add patients to start scheduling</p>
                                            </div>
                                        </div>

                                        <div className="relative pl-8">
                                            <div className="absolute left-[1px] top-1 w-[8px] h-[8px] bg-stone-200 rounded-full border border-white z-10"></div>
                                            <p className="text-xs text-stone-400 italic">No visits scheduled yet</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </ScrollAnimation>
                </div>

                {/* Column B: Family & Stats - Span 8 */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    {/* Top Split: Family List (Horizontal) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <ScrollAnimation animation="fade-up" delay={0.3}>
                            <Link to="/family/patients" className="block bg-white rounded-[2.5rem] p-6 border border-stone-100 shadow-sm h-full hover:border-[#85c2d3] hover:shadow-lg hover:shadow-[#85c2d3]/5 transition-all cursor-pointer group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-[#E0F2F1] text-[#00695C] flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined">family_restroom</span>
                                    </div>
                                    <span className="material-symbols-outlined text-stone-300 group-hover:text-[#5fa5ba]">arrow_forward</span>
                                </div>
                                <h3 className="text-2xl font-bold text-stone-900 mb-1">{loading ? '...' : patients.length}</h3>
                                <p className="text-sm text-stone-500 font-medium">Registered Patients</p>
                                <div className="flex -space-x-2 mt-4 ml-2">
                                    {patients.slice(0, 3).map((p, i) => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-[#5fa5ba] border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                                            {p.fullName?.charAt(0) || 'P'}
                                        </div>
                                    ))}
                                    <div className="w-8 h-8 rounded-full bg-stone-50 border-2 border-white flex items-center justify-center text-[10px] font-bold text-stone-400">+</div>
                                </div>
                            </Link>
                        </ScrollAnimation>

                        <ScrollAnimation animation="fade-up" delay={0.4}>
                            <div className="bg-white rounded-[2.5rem] p-6 border border-stone-100 shadow-sm h-full hover:border-[#85c2d3] hover:shadow-lg hover:shadow-[#85c2d3]/5 transition-all cursor-pointer group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-[#E0F2F1] text-[#00695C] flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined">monitor_heart</span>
                                    </div>
                                    <span className="material-symbols-outlined text-stone-300 group-hover:text-[#5fa5ba]">add</span>
                                </div>
                                <h3 className="text-2xl font-bold text-stone-900 mb-1">Health Status</h3>
                                <p className="text-sm text-stone-500 font-medium">Monitor Your Patients</p>

                                <div className="mt-4 flex items-center gap-3">
                                    <div className="bg-stone-50 px-3 py-1.5 rounded-full flex items-center gap-2 border border-stone-100">
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        <span className="text-xs font-bold text-stone-600">All Healthy</span>
                                    </div>
                                </div>
                            </div>
                        </ScrollAnimation>
                    </div>

                    {/* Bottom Split: Quick Actions Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Care Report', icon: 'description', color: 'text-stone-900', bg: 'bg-stone-100', link: '/family/reports' },
                            { label: 'Requests', icon: 'assignment_add', color: 'text-stone-900', bg: 'bg-stone-100', link: '/family/requests' },
                            { label: 'Payments', icon: 'payments', color: 'text-stone-900', bg: 'bg-stone-100', link: '/family/payments' },
                            { label: 'Profile', icon: 'account_circle', color: 'text-stone-900', bg: 'bg-stone-100', link: '/family/profile' },
                        ].map((action, i) => (
                            <ScrollAnimation key={i} animation="scale-up" delay={0.5 + i * 0.1}>
                                <Link to={action.link} className="w-full bg-white p-4 rounded-[2rem] border-[3px] border-stone-900 shadow-sm hover:shadow-black/20 hover:-translate-y-1 transition-all flex flex-col items-center gap-3 h-full justify-center group">
                                    <div className={`w-12 h-12 rounded-full ${action.bg} flex items-center justify-center group-hover:scale-110 transition-transform border border-stone-200`}>
                                        <span className={`material-symbols-outlined ${action.color}`}>{action.icon}</span>
                                    </div>
                                    <span className="text-xs font-black text-stone-900 uppercase tracking-wide group-hover:text-stone-700">{action.label}</span>
                                </Link>
                            </ScrollAnimation>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3. Recent Activity - Full Width Table (Styled) */}
            <ScrollAnimation animation="fade-up" delay={0.6}>
                <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden mt-2">
                    <div className="px-8 py-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/30">
                        <div className="flex items-center gap-3">
                            <span className="w-2 h-6 bg-[#5fa5ba] rounded-full"></span>
                            <h2 className="text-lg font-bold text-stone-900">Recent Care Activity</h2>
                        </div>
                        <button className="text-xs font-bold text-[#5fa5ba] hover:text-[#4d8ca0] flex items-center gap-1">
                            View All History
                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </button>
                    </div>
                    <div className="p-4">
                        <div className="space-y-2">
                            {patients.length === 0 ? (
                                <div className="text-center py-8 text-stone-400">
                                    <span className="material-symbols-outlined text-4xl mb-2">event_note</span>
                                    <p>No activity yet. Add patients to get started.</p>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4 p-4 rounded-[1.5rem] hover:bg-[#E0F2F1] transition-colors group cursor-pointer border border-transparent hover:border-[#B2EBF2]">
                                    <div className="w-12 h-12 rounded-2xl bg-stone-50 flex flex-col items-center justify-center font-bold text-stone-500 shrink-0 group-hover:bg-white group-hover:text-[#5fa5ba] transition-colors">
                                        <span className="text-xs">{monthName.slice(0, 3).toUpperCase()}</span>
                                        <span className="text-lg leading-none">{dayNumber}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-sm font-bold text-stone-900 truncate group-hover:text-[#00695C]">Account Created</h4>
                                            <span className="text-[10px] font-bold text-stone-400 group-hover:text-[#5fa5ba] bg-white px-2 py-1 rounded-full border border-stone-100 group-hover:border-[#B2EBF2]">Today</span>
                                        </div>
                                        <p className="text-xs text-stone-500 mt-1 truncate">Welcome to HomeCare! Start by adding your patients.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </ScrollAnimation>

        </div>
    );
};

export default FamilyDashboard;
