import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { careRequestApi, familyApi } from '../../lib/api';
import ScrollAnimation from "@/components/ui/scroll-animation";

const Request = () => {
    const [requests, setRequests] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [profileRes, requestsRes] = await Promise.all([
                    familyApi.getProfile(),
                    careRequestApi.getMy()
                ]);
                setProfile(profileRes);
                setRequests(requestsRes || []);
            } catch (err) {
                console.error('Error fetching requests:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('vi-VN');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'bg-green-100 text-green-700';
            case 'Rejected': return 'bg-red-100 text-red-700';
            case 'Cancelled': return 'bg-gray-100 text-gray-700';
            default: return 'bg-amber-100 text-amber-700';
        }
    };

    const pendingCount = requests.filter(r => r.status === 'Pending').length;
    const completedCount = requests.filter(r => r.status === 'Approved').length;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#5fa5ba] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-stone-500 font-medium">Loading requests...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in-up pb-12 font-['Public_Sans']">
            {/* Blue Header */}
            <ScrollAnimation animation="fade-in">
                <div className="bg-[#99C5D3] rounded-[2.5rem] p-8 md:p-10 text-white shadow-xl shadow-[#99C5D3]/20 relative overflow-hidden flex flex-col md:flex-row justify-between items-end gap-6">
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                                <span className="material-symbols-outlined text-sm">assignment_add</span>
                            </span>
                            <span className="text-xs font-bold uppercase tracking-widest text-white/90">Care Requests</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">My Care Requests</h1>
                        <p className="text-white/80 font-medium mt-1 max-w-lg">Request additional care sessions for your family members.</p>
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                        <Link to="/family/requests/new" className="flex items-center gap-2 px-6 py-3 bg-white text-[#5fa5ba] rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                            <span className="material-symbols-outlined text-xl">add</span>
                            New Request
                        </Link>
                    </div>
                </div>
            </ScrollAnimation>

            {/* Stats Banner */}
            <div className="bg-[#E0F2F1] border border-[#B2EBF2] p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="max-w-xl">
                    <h2 className="text-2xl font-bold text-[#00695C] mb-2">Welcome, {profile?.fullName || 'Family'}</h2>
                    <p className="text-[#004D40] font-medium opacity-80">
                        {pendingCount > 0
                            ? `You have ${pendingCount} pending care request(s) awaiting approval.`
                            : 'All your care requests have been processed.'}
                    </p>
                </div>
                <div className="flex gap-12 text-center md:border-l border-[#B2EBF2] md:pl-12">
                    <div>
                        <p className="text-4xl font-black text-[#5fa5ba]">{String(pendingCount).padStart(2, '0')}</p>
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">PENDING</p>
                    </div>
                    <div>
                        <p className="text-4xl font-black text-stone-300">{String(completedCount).padStart(2, '0')}</p>
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">APPROVED</p>
                    </div>
                </div>
            </div>

            {/* Requests List */}
            <div className="space-y-6">
                {requests.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] border border-stone-100 p-12 text-center">
                        <span className="material-symbols-outlined text-6xl text-stone-300 mb-4">inbox</span>
                        <p className="text-stone-500 font-medium">No care requests yet</p>
                    </div>
                ) : requests.map((req) => (
                    <ScrollAnimation key={req.id} animation="fade-up">
                        <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden group hover:border-[#B2EBF2] hover:shadow-lg hover:shadow-[#99C5D3]/10 transition-all">
                            <div className="p-8 pb-4 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-6 w-full">
                                    <div className="w-16 h-16 bg-[#E0F2F1] rounded-2xl flex items-center justify-center text-[#00695C] shadow-inner">
                                        <span className="material-symbols-outlined text-3xl fill">calendar_month</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-xl font-bold tracking-tight text-stone-900">
                                                {req.serviceName} - {req.type}
                                            </h3>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(req.status)}`}>
                                                {req.status}
                                            </span>
                                        </div>
                                        <p className="text-stone-400 font-bold text-sm">
                                            {req.patientName} <span className="mx-2 text-stone-300">•</span>
                                            {req.startTime} - {req.endTime}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right w-full md:w-auto">
                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">REQUESTED DATE</p>
                                    <p className="font-bold text-stone-800">{formatDate(req.requestedDate)}</p>
                                </div>
                            </div>

                            {req.notes && (
                                <div className="px-8 py-4 border-t border-stone-50">
                                    <p className="text-sm text-stone-600"><strong>Notes:</strong> {req.notes}</p>
                                </div>
                            )}

                            {req.assignedCaregiverName && (
                                <div className="px-8 py-4 bg-green-50 border-t border-green-100">
                                    <p className="text-sm text-green-700 font-medium">
                                        <span className="material-symbols-outlined text-sm align-middle mr-2">person</span>
                                        Assigned to: {req.assignedCaregiverName}
                                    </p>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="bg-[#F0F8FF]/50 p-6 flex items-center justify-between border-t border-stone-50">
                                <p className="text-stone-400 text-xs font-medium">
                                    Created: {formatDate(req.createdAt)}
                                </p>
                                <Link to={`/family/requests/${req.id}`} className="px-6 py-3 bg-[#5fa5ba] text-white rounded-xl font-bold text-xs shadow-lg shadow-[#5fa5ba]/20 hover:bg-[#4d8ca0] transition-all">
                                    View Details
                                </Link>
                            </div>
                        </div>
                    </ScrollAnimation>
                ))}
            </div>

            {/* New Request CTA */}
            <ScrollAnimation animation="fade-up">
                <div className="bg-white border-4 border-dashed border-[#B2EBF2] rounded-[3rem] p-12 text-center group cursor-pointer hover:bg-[#E0F2F1]/30 transition-all">
                    <div className="w-16 h-16 bg-[#E0F2F1] text-[#00695C] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-3xl">add</span>
                    </div>
                    <h3 className="text-xl font-bold text-stone-900 mb-2">Need additional care?</h3>
                    <p className="text-stone-400 font-medium max-w-sm mx-auto mb-6 text-sm">Request extra care sessions for doctor appointments, special occasions, or additional support.</p>
                    <Link to="/family/requests/new" className="px-8 py-3 bg-[#5fa5ba] text-white rounded-full font-bold text-xs hover:bg-[#4d8ca0] transition-all uppercase tracking-widest inline-block shadow-lg shadow-[#5fa5ba]/20">
                        Create New Request
                    </Link>
                </div>
            </ScrollAnimation>
        </div>
    );
};

export default Request;
