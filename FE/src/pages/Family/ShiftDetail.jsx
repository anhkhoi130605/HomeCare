import React, { useState, useEffect } from 'react';
import { ChevronLeft, Clock, Calendar, Activity, ClipboardList, MapPin, Phone } from 'lucide-react';
import { formatTimeSpan } from '@/lib/utils';
import { Link, useParams } from 'react-router-dom';
import { scheduleApi, careLogApi } from '@/lib/api';
import ScrollAnimation from "@/components/ui/scroll-animation";

const ShiftDetail = () => {
    const { id } = useParams();
    const [shift, setShift] = useState(null);
    const [careLogs, setCareLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const shiftData = await scheduleApi.getById(id);
                setShift(shiftData);

                try {
                    const logs = await careLogApi.getBySchedule(id);
                    setCareLogs(logs || []);
                } catch (e) {
                    console.warn('No logs found for this shift');
                }
            } catch (err) {
                console.error('Failed to fetch shift details:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const formatTime = (timeStr) => formatTimeSpan(timeStr);

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateTimeStr) => {
        if (!dateTimeStr) return '--:--';
        try {
            const date = new Date(dateTimeStr);
            return date.toLocaleTimeString('en-GB', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
            });
        } catch (e) {
            return '--:--';
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center font-['Public_Sans']"><span className="material-symbols-outlined animate-spin text-4xl text-[#5fa5ba]">progress_activity</span></div>;

    if (error || !shift) return (
        <div className="h-screen flex flex-col items-center justify-center font-['Public_Sans'] text-center px-4">
            <span className="material-symbols-outlined text-6xl text-red-100 mb-6 bg-red-50 p-6 rounded-full">error</span>
            <h2 className="text-2xl font-bold text-stone-800 mb-2">Failed to Load Shift</h2>
            <p className="text-stone-500 mb-8 max-w-md">{error || "The shift details could not be found."}</p>
            <Link to="/family/schedule" className="px-8 py-3 bg-[#5fa5ba] text-white rounded-full font-bold shadow-lg shadow-[#5fa5ba]/20 hover:bg-[#4d8ca0] transition-all">
                Back to Schedule
            </Link>
        </div>
    );

    const mainLog = careLogs.length > 0 ? careLogs[0] : null;

    return (
        <div className="flex h-full min-h-screen font-['Public_Sans'] bg-slate-50 text-stone-900 animate-fade-in-up pb-12">
            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto space-y-8">
                {/* Blue Header Banner */}
                <ScrollAnimation animation="fade-in">
                    <div className="bg-[#99C5D3] rounded-b-[2.5rem] p-8 md:p-10 text-white shadow-xl shadow-[#99C5D3]/10 relative overflow-hidden flex flex-col md:flex-row justify-between items-end gap-6 pb-20 -mx-4 md:mx-0 md:rounded-[2.5rem]">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                        <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-4 self-start md:self-center">
                                <Link to="/family/schedule" className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-white hover:text-[#5fa5ba] transition-all">
                                    <span className="material-symbols-outlined">arrow_back</span>
                                </Link>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold uppercase tracking-widest text-white/90 bg-white/10 px-2 py-0.5 rounded-md">Shift #{shift.id}</span>
                                    </div>
                                    <h2 className="text-3xl font-bold tracking-tight">Shift Detail</h2>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollAnimation>

                <div className="max-w-7xl w-full mx-auto px-4 md:px-0 -mt-16 relative z-20">
                    {/* Caregiver Profile Card */}
                    <ScrollAnimation animation="fade-up">
                        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-[#99C5D3]/10 border border-stone-100 mb-8">
                            <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    <div className="relative">
                                        <div className="size-28 rounded-full bg-center bg-cover border-4 border-white shadow-2xl ring-4 ring-[#E0F2F1]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=200')" }}></div>
                                        <div className="absolute bottom-1 right-1 size-6 bg-emerald-500 border-4 border-white rounded-full"></div>
                                    </div>
                                    <div className="text-center md:text-left">
                                        <h3 className="text-3xl font-bold text-stone-900">{shift.caregiverName || 'Assigned Caregiver'}</h3>
                                        <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                                            <span className="material-symbols-outlined text-[#5fa5ba] text-xl">medical_services</span>
                                            <p className="text-stone-500 font-bold text-lg leading-none">{shift.serviceName || 'Home Care Service'} for <span className="text-stone-900">{shift.patientName}</span></p>
                                        </div>
                                        <p className="text-sm text-[#5fa5ba] mt-3 font-bold uppercase tracking-wider bg-[#E0F2F1] w-fit px-3 py-1 rounded-full mx-auto md:mx-0">Date: {formatDate(shift.date)}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center lg:items-end gap-6 w-full lg:w-auto">
                                    <div className={`px-8 py-3 rounded-full font-bold text-xs flex items-center gap-2 uppercase tracking-widest border ${shift.status === 'Completed'
                                        ? 'bg-[#E0F2F1] text-[#00695C] border-[#B2EBF2]'
                                        : shift.status === 'Failed'
                                            ? 'bg-rose-50 text-rose-600 border-rose-100'
                                            : 'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                        <span className="material-symbols-outlined text-base">
                                            {shift.status === 'Completed' ? 'check_circle' : (shift.status === 'Failed' ? 'error' : 'pending')}
                                        </span>
                                        {shift.status === 'Failed' ? 'Not Completed' : (shift.status === 'Scheduled' ? 'Upcoming' : shift.status)}
                                    </div>
                                    <button className="w-full lg:w-auto flex items-center justify-center gap-3 px-10 py-4 rounded-full bg-[#5fa5ba] text-white font-bold hover:bg-[#4d8ca0] transition-all shadow-lg shadow-[#5fa5ba]/20 text-md">
                                        <span className="material-symbols-outlined text-xl">chat</span>
                                        Contact Caregiver
                                    </button>
                                </div>
                            </div>
                        </div>
                    </ScrollAnimation>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Timeline Section */}
                        <section className="lg:col-span-5">
                            <ScrollAnimation animation="fade-up" delay={0.1} className="h-full">
                                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-stone-100 h-full">
                                    <h4 className="text-lg font-bold mb-10 flex items-center gap-3 text-stone-900">
                                        <span className="material-symbols-outlined text-[#5fa5ba] text-2xl">schedule</span>
                                        Visit Timeline
                                    </h4>
                                    <div className="relative pl-2">
                                        <div className="absolute left-4 top-5 bottom-12 w-0 border-l-2 border-dashed border-stone-200"></div>
                                        <div className="relative flex gap-8 pb-12">
                                            <div className="relative z-10 size-8 bg-white border-2 border-[#5fa5ba] rounded-full flex items-center justify-center translate-x-[-1px] shadow-sm">
                                                <div className="size-2.5 bg-[#5fa5ba] rounded-full"></div>
                                            </div>
                                            <div>
                                                <p className="font-bold text-stone-600 text-sm mb-1 uppercase tracking-wider">Scheduled Window</p>
                                                <p className="text-[#5fa5ba] font-black text-2xl">{formatTime(shift.startTime)} - {formatTime(shift.endTime)}</p>
                                            </div>
                                        </div>
                                        <div className="relative flex gap-8 pb-12">
                                            <div className={`relative z-10 size-8 rounded-full flex items-center justify-center text-white translate-x-[-1px] shadow-md ${shift.checkInTime ? 'bg-emerald-500 ring-4 ring-emerald-50' : 'bg-stone-100'}`}>
                                                <span className="material-symbols-outlined text-[16px] font-black">{shift.checkInTime ? 'check' : 'login'}</span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-stone-900 text-sm mb-1 uppercase tracking-wider">Actual Check-in</p>
                                                <p className={`${shift.checkInTime ? 'text-emerald-600' : 'text-stone-300'} font-black text-2xl`}>{formatDateTime(shift.checkInTime)}</p>
                                                {shift.checkInTime && (
                                                    <p className="text-xs text-stone-400 flex items-center gap-2 mt-2 font-bold bg-stone-50 w-fit px-3 py-1.5 rounded-full border border-stone-100">
                                                        <span className="material-symbols-outlined text-sm text-[#5fa5ba]">location_on</span>
                                                        GPS Verified
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="relative flex gap-8">
                                            <div className={`relative z-10 size-8 bg-white border-2 rounded-full flex items-center justify-center translate-x-[-1px] ${shift.checkOutTime ? 'border-emerald-500' : 'border-stone-200'}`}>
                                                <span className={`material-symbols-outlined text-[16px] ${shift.checkOutTime ? 'text-emerald-500' : 'text-stone-400'}`}>logout</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-stone-600 text-sm mb-1 uppercase tracking-wider">Actual Check-out</p>
                                                <p className="text-stone-900 font-black text-2xl">{formatDateTime(shift.checkOutTime)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ScrollAnimation>
                        </section>

                        <div className="lg:col-span-7 flex flex-col gap-8">
                            {/* Activities Section */}
                            <ScrollAnimation animation="fade-up" delay={0.2}>
                                <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-stone-100">
                                    <h4 className="text-lg font-bold mb-8 flex items-center gap-3 text-stone-900">
                                        <span className="material-symbols-outlined text-[#5fa5ba] text-2xl">check_circle</span>
                                        Activities Performed
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {mainLog ? (
                                            <>
                                                {mainLog.activities?.split(',').map((activity, i) => (
                                                    <div key={i} className="flex items-start gap-4 p-5 rounded-3xl bg-[#F8FAFC] border border-stone-100 hover:border-[#B2EBF2] hover:bg-[#E0F2F1]/30 transition-colors group">
                                                        <span className="material-symbols-outlined text-emerald-500 text-xl mt-0.5">check_circle</span>
                                                        <div>
                                                            <p className="text-base font-bold text-stone-900 group-hover:text-[#00695C]">{activity.trim()}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {mainLog.medicationsGiven && (
                                                    <div className="flex items-start gap-4 p-5 rounded-3xl bg-blue-50/30 border border-blue-100">
                                                        <span className="material-symbols-outlined text-blue-500 text-xl mt-0.5">medication</span>
                                                        <div>
                                                            <p className="text-base font-bold text-stone-900">Medications Given</p>
                                                            <p className="text-sm text-stone-500 mt-1">{mainLog.medicationsGiven}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {mainLog.vitalSigns && (
                                                    <div className="flex items-start gap-4 p-5 rounded-3xl bg-red-50/30 border border-red-100">
                                                        <span className="material-symbols-outlined text-red-500 text-xl mt-0.5">vital_signs</span>
                                                        <div>
                                                            <p className="text-base font-bold text-stone-900">Vital Signs</p>
                                                            <p className="text-sm text-stone-500 mt-1">{mainLog.vitalSigns}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="col-span-2 py-12 text-center text-stone-400 bg-stone-50 rounded-3xl border-2 border-dashed border-stone-100">
                                                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">description</span>
                                                <p className="font-bold">No activity logs recorded for this shift yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </ScrollAnimation>

                            {/* Notes Section */}
                            {mainLog && mainLog.notes && (
                                <ScrollAnimation animation="fade-up" delay={0.3}>
                                    <section className="bg-[#FFF8E1] rounded-[2.5rem] p-8 md:p-10 shadow-sm relative overflow-hidden border border-[#FFECB3]">
                                        <div className="absolute -top-4 -right-2 text-[#FFE082] scale-[3.5] pointer-events-none opacity-40">
                                            <span className="material-symbols-outlined text-8xl">format_quote</span>
                                        </div>
                                        <h4 className="text-lg font-bold mb-6 flex items-center gap-3 text-amber-700">
                                            <span className="material-symbols-outlined text-2xl">chat_bubble</span>
                                            Note from {shift.caregiverName?.split(' ')[0]}
                                        </h4>
                                        <p className="text-stone-700 leading-relaxed italic text-lg pr-8 font-serif relative z-10 border-l-4 border-amber-300 pl-4 py-2 bg-white/50 rounded-r-xl">
                                            "{mainLog.notes}"
                                        </p>
                                        <div className="mt-6 flex items-center gap-3 relative z-10">
                                            <div className="size-2 bg-amber-400 rounded-full"></div>
                                            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Logged at {new Date(mainLog.loggedAt).toLocaleTimeString()}</p>
                                        </div>
                                    </section>
                                </ScrollAnimation>
                            )}

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-4 mt-2">
                                <Link to={`/family/reports?patientId=${shift.patientId}`} className="flex-1 bg-[#5fa5ba] text-white font-bold py-4 px-8 rounded-full shadow-lg shadow-[#5fa5ba]/20 hover:bg-[#4d8ca0] transition-all flex items-center justify-center gap-3 text-base group">
                                    <span className="material-symbols-outlined group-hover:scale-110 transition-transform">analytics</span>
                                    View Patient Reports
                                </Link>
                                <button className="px-8 py-4 rounded-full bg-white font-bold text-stone-600 hover:bg-stone-50 transition-colors text-base flex items-center justify-center border border-stone-200 hover:border-[#99C5D3]">
                                    Download PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ShiftDetail;
