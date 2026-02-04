import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contractApi } from '@/lib/api';
import ScrollAnimation from "@/components/ui/scroll-animation";

const FamilyContract = () => {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({ active: 0, pending: 0, nextRenewal: null });

    useEffect(() => {
        const fetchContracts = async () => {
            try {
                setLoading(true);
                const data = await contractApi.getMyContracts();
                setContracts(data);

                // Calculate stats
                const active = data.filter(c => c.status === 'Active' || c.status === 'Approved').length;
                const pending = data.filter(c => c.status === 'Pending').length;
                const nearestRenewal = data
                    .filter(c => c.endDate)
                    .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))[0];

                setStats({
                    active,
                    pending,
                    nextRenewal: nearestRenewal?.endDate ? new Date(nearestRenewal.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null
                });
            } catch (err) {
                console.error('Failed to fetch contracts:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchContracts();
    }, []);

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse pb-12 font-['Public_Sans']">
                <div className="bg-stone-200 rounded-[2.5rem] h-48"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="bg-stone-200 h-32 rounded-[2.5rem]"></div>)}
                </div>
                <div className="bg-stone-200 rounded-[2.5rem] h-96"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <span className="material-symbols-outlined text-4xl text-red-400 mb-4">error</span>
                <p className="text-red-600 font-medium">Failed to load contracts</p>
                <p className="text-stone-500 text-sm">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in-up pb-12 font-['Public_Sans']">
            {/* Blue Header */}
            <ScrollAnimation animation="fade-in">
                <div className="bg-[#99C5D3] rounded-[2.5rem] p-8 md:p-10 text-white shadow-xl shadow-[#99C5D3]/20 relative overflow-hidden flex flex-col md:flex-row justify-between items-end gap-6">
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                                <span className="material-symbols-outlined text-sm">history_edu</span>
                            </span>
                            <span className="text-xs font-bold uppercase tracking-widest text-white/90">Agreements</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Care Contracts</h1>
                        <p className="text-white/80 font-medium mt-1 max-w-lg">Manage and monitor your healthcare agreements efficiently.</p>
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                        <Link to="/family/contracts/new" className="flex items-center gap-2 px-6 py-3 bg-white text-[#5fa5ba] rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                            <span className="material-symbols-outlined text-xl">add</span>
                            New Contract
                        </Link>
                    </div>
                </div>
            </ScrollAnimation>

            {/* Contract Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ScrollAnimation animation="fade-up" delay={0.1}>
                    <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm relative group hover:shadow-lg hover:border-[#B2EBF2] transition-all">
                        <div className="absolute top-8 right-8 w-10 h-10 bg-[#E0F2F1] rounded-xl flex items-center justify-center text-[#00695C]">
                            <span className="material-symbols-outlined fill">check_box</span>
                        </div>
                        <p className="text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Active Contracts</p>
                        <div className="flex items-baseline gap-4">
                            <span className="text-5xl font-black text-stone-900">{String(stats.active).padStart(2, '0')}</span>
                        </div>
                    </div>
                </ScrollAnimation>

                <ScrollAnimation animation="fade-up" delay={0.2}>
                    <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm relative hover:shadow-lg hover:border-[#B2EBF2] transition-all">
                        <div className="absolute top-8 right-8 w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
                            <span className="material-symbols-outlined">assignment_late</span>
                        </div>
                        <p className="text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Pending Approval</p>
                        <div className="flex flex-col">
                            <span className="text-5xl font-black text-stone-900">{String(stats.pending).padStart(2, '0')}</span>
                            <span className="text-stone-400 font-bold text-sm mt-1">Requiring admin review</span>
                        </div>
                    </div>
                </ScrollAnimation>

                <ScrollAnimation animation="fade-up" delay={0.3}>
                    <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm relative hover:shadow-lg hover:border-[#B2EBF2] transition-all">
                        <div className="absolute top-8 right-8 w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500">
                            <span className="material-symbols-outlined">event_repeat</span>
                        </div>
                        <p className="text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Next Renewal</p>
                        <div className="flex flex-col">
                            <span className="text-3xl font-black tracking-tight text-stone-900">{stats.nextRenewal || 'N/A'}</span>
                            {stats.nextRenewal && (
                                <span className="text-rose-500 font-bold text-sm mt-2 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">notification_important</span>
                                    Action required soon
                                </span>
                            )}
                        </div>
                    </div>
                </ScrollAnimation>
            </div>

            {/* Active Agreements Table */}
            <ScrollAnimation animation="fade-up" delay={0.4}>
                <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-stone-50 flex flex-col md:flex-row items-center justify-between gap-4">
                        <h2 className="text-xl font-bold text-stone-900">Active Agreements</h2>
                        <div className="relative w-full md:w-auto">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-300">search</span>
                            <input className="pl-12 pr-6 py-3 bg-[#F0F8FF] border-none rounded-xl w-full md:w-72 text-sm font-medium focus:ring-2 focus:ring-[#99C5D3] text-stone-600 placeholder:text-stone-400" placeholder="Search patients..." />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#F0F8FF]/50">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-[#5fa5ba] uppercase tracking-widest">Patient</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-[#5fa5ba] uppercase tracking-widest">Caregiver</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-[#5fa5ba] uppercase tracking-widest">Service Type</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-[#5fa5ba] uppercase tracking-widest">Duration</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-[#5fa5ba] uppercase tracking-widest text-center">Status Tracking</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-50">
                                {contracts.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-12 text-center text-stone-400">
                                            <span className="material-symbols-outlined text-4xl mb-2 block">folder_open</span>
                                            No contracts found
                                        </td>
                                    </tr>
                                ) : contracts.map((c) => {
                                    const duration = c.startDate && c.endDate
                                        ? `${new Date(c.startDate).toLocaleDateString()} - ${new Date(c.endDate).toLocaleDateString()}`
                                        : 'Ongoing';
                                    return (
                                        <tr key={c.id} className="hover:bg-[#E0F2F1]/30 transition-colors group cursor-pointer">
                                            <td className="px-8 py-6 font-bold flex items-center gap-3">
                                                <div className="w-1.5 h-8 bg-[#5fa5ba] rounded-full mr-2 group-hover:h-10 transition-all"></div>
                                                <span className="text-stone-900">{c.patientName || c.patient?.name || 'Patient'}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-[#5fa5ba] text-white flex items-center justify-center text-xs font-bold border border-stone-100 shadow-sm">
                                                        {c.caregiverName?.charAt(0) || c.caregiver?.name?.charAt(0) || 'C'}
                                                    </div>
                                                    <span className="font-bold text-stone-600 text-sm">{c.caregiverName || c.caregiver?.name || 'Pending Assignment'}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 font-medium text-stone-500 text-sm">{c.serviceName || c.service?.name || 'Care Service'}</td>
                                            <td className="px-8 py-6">
                                                <span className="px-4 py-1.5 bg-stone-50 text-stone-600 rounded-full text-xs font-bold border border-stone-100">{duration}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className={`text-[10px] font-black tracking-tighter uppercase px-3 py-1 rounded-md ${c.status === 'Active' || c.status === 'Approved' ? 'text-[#5fa5ba] border border-[#B2EBF2] bg-[#E0F2F1]' : c.status === 'Pending' ? 'text-orange-500 border border-orange-200 bg-orange-50' : 'text-stone-500 border border-stone-200 bg-stone-50'}`}>{c.status}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </ScrollAnimation>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-4">
                {/* Schedule Link */}
                <ScrollAnimation animation="fade-up" delay={0.5}>
                    <Link to="/family/schedule" className="block text-inherit no-underline h-full">
                        <div className="bg-white p-10 rounded-[2.5rem] border border-stone-100 shadow-sm relative overflow-hidden h-full hover:border-[#B2EBF2] transition-colors group cursor-pointer">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-[#E0F2F1] rounded-2xl flex items-center justify-center text-[#00695C] group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-2xl">calendar_month</span>
                                </div>
                                <span className="material-symbols-outlined text-stone-300 group-hover:text-[#5fa5ba] transition-colors">arrow_forward</span>
                            </div>
                            <h3 className="text-xl font-bold text-stone-900 mb-2">My Care Schedule</h3>
                            <p className="text-stone-400 font-medium text-sm">View upcoming shifts and caregiver assignments.</p>
                        </div>
                    </Link>
                </ScrollAnimation>

                {/* Payment Link */}
                <ScrollAnimation animation="fade-up" delay={0.6}>
                    <Link to="/family/payments" className="block text-inherit no-underline h-full">
                        <div className="bg-white p-10 rounded-[2.5rem] border border-stone-100 shadow-sm h-full hover:border-[#B2EBF2] transition-colors group cursor-pointer">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-2xl">payments</span>
                                </div>
                                <span className="material-symbols-outlined text-stone-300 group-hover:text-green-600 transition-colors">arrow_forward</span>
                            </div>
                            <h3 className="text-xl font-bold text-stone-900 mb-2">Payment History</h3>
                            <p className="text-stone-400 font-medium text-sm">Review invoices and track payment status.</p>
                        </div>
                    </Link>
                </ScrollAnimation>
            </div>
        </div>
    );
};

export default FamilyContract;
