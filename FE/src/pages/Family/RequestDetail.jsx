
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { careRequestApi } from '@/lib/api';
import { formatTimeSpan } from '@/lib/utils';
import ScrollAnimation from "@/components/ui/scroll-animation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, User, FileText, ChevronLeft, MapPin } from "lucide-react";

const RequestDetail = () => {
    const { id } = useParams();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRequest = async () => {
            try {
                setLoading(true);
                const data = await careRequestApi.getById(id);
                setRequest(data);
            } catch (err) {
                console.error("Failed to fetch request:", err);
                setError("Could not load request details. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchRequest();
    }, [id]);

    const getStatusVariant = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved': return "success"; // Using custom variants or default classes later
            case 'pending': return "warning";
            case 'rejected': return "destructive";
            default: return "secondary";
        }
    };

    const getStatusColorClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved': return "bg-green-100 text-green-700 border-green-200";
            case 'pending': return "bg-amber-100 text-amber-700 border-amber-200";
            case 'rejected': return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-12 h-12 border-4 border-[#5fa5ba] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !request) {
        return (
            <div className="text-center py-20">
                <p className="text-stone-500 mb-4">{error || "Request not found"}</p>
                <Link to="/family/requests" className="text-[#5fa5ba] hover:underline font-bold">Return to List</Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-12 font-['Public_Sans'] space-y-8 animate-fade-in-up">
            {/* Header */}
            <div>
                <Link to="/family/requests" className="inline-flex items-center text-sm font-bold text-stone-400 hover:text-[#5fa5ba] mb-4 transition-colors">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to requests
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Request #{request.id}</h1>
                        <p className="text-stone-500 font-medium">Created on {formatDate(request.createdAt)}</p>
                    </div>
                    <Badge className={`px-4 py-1.5 rounded-full text-sm font-bold capitalize ${getStatusColorClass(request.status)} border-0`}>
                        {request.status}
                    </Badge>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Details */}
                <div className="lg:col-span-2 space-y-6">
                    <ScrollAnimation animation="fade-up">
                        <div className="bg-white rounded-[2rem] p-8 border border-stone-100 shadow-sm space-y-8">
                            <div>
                                <h3 className="text-lg font-bold text-stone-900 border-b border-stone-100 pb-4 mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-[#5fa5ba]" />
                                    Service Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Service Type</p>
                                        <p className="text-lg font-bold text-stone-800">{request.serviceName || 'General Care'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Request Type</p>
                                        <p className="text-lg font-bold text-stone-800">{request.type}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-stone-900 border-b border-stone-100 pb-4 mb-4 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-[#5fa5ba]" />
                                    Schedule & Time
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Requested Date</p>
                                        <p className="text-lg font-bold text-stone-800">{formatDate(request.requestedDate)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Duration</p>
                                        <p className="text-lg font-bold text-stone-800 flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-stone-400" />
                                            {formatTimeSpan(request.startTime)} - {formatTimeSpan(request.endTime)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {request.notes && (
                                <div>
                                    <h3 className="text-lg font-bold text-stone-900 border-b border-stone-100 pb-4 mb-4">Additional Notes</h3>
                                    <div className="bg-stone-50 p-6 rounded-2xl text-stone-600 font-medium leading-relaxed">
                                        {request.notes}
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollAnimation>
                </div>

                {/* Right: Patient & Status */}
                <div className="space-y-6">
                    <ScrollAnimation animation="fade-left">
                        <div className="bg-white rounded-[2rem] p-8 border border-stone-100 shadow-sm">
                            <h3 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
                                <User className="w-5 h-5 text-[#5fa5ba]" />
                                Patient Info
                            </h3>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 bg-[#E0F2F1] text-[#00695C] rounded-2xl flex items-center justify-center font-bold text-2xl shadow-inner">
                                    {request.patientName?.[0] || 'P'}
                                </div>
                                <div>
                                    <p className="font-bold text-lg text-stone-800">{request.patientName}</p>
                                    <p className="text-sm font-medium text-stone-400">Patient ID: {request.patientId}</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3 text-sm font-medium text-stone-600">
                                    <MapPin className="w-4 h-4 text-stone-400 mt-1 shrink-0" />
                                    <span className="leading-tight">{request.location || 'Home Address'}</span>
                                </div>
                            </div>
                        </div>
                    </ScrollAnimation>

                    {request.assignedCaregiverName && (
                        <ScrollAnimation animation="fade-left" delay={0.1}>
                            <div className="bg-[#E0F2F1] rounded-[2rem] p-8 border border-[#B2EBF2] shadow-sm">
                                <h3 className="text-lg font-bold text-[#00695C] mb-4">Assigned Caregiver</h3>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-[#00695C] shadow-sm">
                                        {request.assignedCaregiverName[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#004D40]">{request.assignedCaregiverName}</p>
                                        <p className="text-xs font-bold text-[#00695C] opacity-70 uppercase tracking-widest">Professional</p>
                                    </div>
                                </div>
                            </div>
                        </ScrollAnimation>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RequestDetail;
