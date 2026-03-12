import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ScrollAnimation from "@/components/ui/scroll-animation";
import { healthReportApi } from '@/lib/api';

const HealthReportDetail = () => {
    const { id } = useParams();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReport = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await healthReportApi.getById(id);
                setReport(data);
            } catch (err) {
                console.error("Failed to load report:", err);
                setError("Failed to load health report");
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [id]);

    // Parse vitals data from JSON string or human-readable string
    const parseVitals = (vitalsData) => {
        const defaultVitals = {
            bp: { value: "N/A", status: "Unknown" },
            hr: { value: "N/A", status: "Unknown" }
        };

        if (!vitalsData) return defaultVitals;

        // 1. Try JSON parsing
        try {
            const parsed = JSON.parse(vitalsData);

            // Case A: Array (from seed data) - Take the last entry
            if (Array.isArray(parsed) && parsed.length > 0) {
                const latest = parsed[parsed.length - 1];
                return {
                    bp: { value: latest.bp || latest.avgBp || latest.bloodPressure || "N/A", status: "Stable" },
                    hr: { value: latest.hr || latest.avgHr || latest.heartRate || "N/A", status: "Stable" }
                };
            }

            // Case B: Simple object with bp/hr keys
            if (parsed.bp || parsed.hr) {
                return {
                    bp: typeof parsed.bp === 'object' ? (parsed.bp || defaultVitals.bp) : { value: parsed.bp, status: "Normal" },
                    hr: typeof parsed.hr === 'object' ? (parsed.hr || defaultVitals.hr) : { value: parsed.hr, status: "Stable" }
                };
            }
            
            // Case C: Object with heartRate/bloodPressure keys
            if (parsed.bloodPressure || parsed.heartRate) {
                return {
                    bp: { value: parsed.bloodPressure || "N/A", status: "Normal" },
                    hr: { value: parsed.heartRate || "N/A", status: "Stable" }
                };
            }
        } catch (e) {
            // Not valid JSON, continue to string parsing
        }

        // 2. Fallback: Parse human-readable string like "HR: 75, Temp: 36.8, BP: 120/80"
        const result = {
            bp: { value: "N/A", status: "Unknown" },
            hr: { value: "N/A", status: "Unknown" }
        };

        const parts = vitalsData.split(',').map(p => p.trim());
        parts.forEach(part => {
            if (part.toUpperCase().startsWith('HR:') || part.toUpperCase().startsWith('HEART RATE:')) {
                result.hr.value = part.split(':')[1]?.trim() || "N/A";
                result.hr.status = 'Stable';
            } else if (part.toUpperCase().startsWith('BP:') || part.toUpperCase().startsWith('BLOOD PRESSURE:')) {
                result.bp.value = part.split(':')[1]?.trim() || "N/A";
                result.bp.status = 'Normal';
            }
        });

        return result;
    };

    // Get status color
    const getStatusColor = (status) => {
        const s = status?.toLowerCase() || '';
        if (s === 'stable' || s === 'good' || s === 'healthy') return 'emerald';
        if (s === 'warning' || s === 'monitor') return 'amber';
        if (s === 'critical' || s === 'incident') return 'rose';
        return 'emerald';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-[#5fa5ba] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-stone-500">Loading report details...</p>
                </div>
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-10">
                <span className="material-symbols-outlined text-6xl text-stone-300 mb-4">error</span>
                <p className="text-stone-500 mb-4">{error || "Report not found"}</p>
                <Link to="/family/reports" className="text-[#5fa5ba] font-bold hover:underline">
                    ← Back to Reports
                </Link>
            </div>
        );
    }

    const vitals = parseVitals(report.vitalsData);
    const statusColor = getStatusColor(report.status);

    const statusColors = {
        emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', badge: 'bg-[#E0F2F1] text-[#00695C] border-[#B2EBF2]' },
        amber: { bg: 'bg-amber-100', text: 'text-amber-700', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
        rose: { bg: 'bg-rose-100', text: 'text-rose-700', badge: 'bg-rose-50 text-rose-700 border-rose-200' }
    };

    const currentStatus = statusColors[statusColor] || statusColors.emerald;

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="flex h-full min-h-screen font-manrope bg-slate-50 text-stone-900 animate-fade-in-up pb-12">
            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto space-y-8">
                {/* Blue Header Banner */}
                <ScrollAnimation animation="fade-in">
                    <div className="bg-[#99C5D3] rounded-b-[2.5rem] p-8 md:p-10 text-white shadow-xl shadow-[#99C5D3]/10 relative overflow-hidden flex flex-col md:flex-row justify-between items-end gap-6 pb-20 -mx-4 md:mx-0 md:rounded-[2.5rem]">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                        <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-6">
                                <Link to="/family/reports" className="hidden lg:flex w-10 h-10 rounded-full bg-white/20 backdrop-blur-md items-center justify-center border border-white/20 hover:bg-white hover:text-[#5fa5ba] transition-all">
                                    <span className="material-symbols-outlined">arrow_back</span>
                                </Link>
                                <div className="flex items-center gap-5">
                                    <div className="size-16 rounded-full bg-[#5fa5ba] flex items-center justify-center text-white text-2xl font-bold border-2 border-white shadow-md ring-4 ring-[#E0F2F1]">
                                        {report.patientName?.[0] || 'P'}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold tracking-tight text-white">{report.patientName}</h2>
                                        <p className="text-sm text-white/80 font-semibold flex items-center gap-2">
                                            <span className={`size-2 rounded-full ${statusColor === 'emerald' ? 'bg-emerald-300' : statusColor === 'amber' ? 'bg-amber-300' : 'bg-rose-300'}`}></span>
                                            {report.status} Condition
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                                <div className="relative w-full sm:w-auto">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/70 text-xl">calendar_today</span>
                                    <div className="appearance-none bg-white/10 border border-white/20 rounded-full pl-12 pr-6 py-3 text-sm font-bold w-full sm:w-auto shadow-sm text-white">
                                        {report.period || formatDate(report.reportDate)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollAnimation>

                <div className="max-w-7xl mx-auto w-full px-4 md:px-0 -mt-20 relative z-20">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* LEFT COLUMN */}
                        <div className="lg:col-span-8 flex flex-col gap-8">
                            {/* Notes / Observations */}
                            <ScrollAnimation animation="fade-up" delay={0.1}>
                                <section className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-stone-200/40 border border-stone-100 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-2 h-full bg-[#5fa5ba]"></div>
                                    <h4 className="text-xl font-bold mb-8 flex items-center gap-3 text-[#5fa5ba]">
                                        <span className="material-symbols-outlined fill-icon text-2xl">history_edu</span>
                                        Health Report Notes
                                    </h4>
                                    <div className="space-y-4">
                                        {report.notes ? (
                                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <span className="text-xs font-black text-[#5fa5ba] uppercase tracking-widest">
                                                            {formatDate(report.reportDate)}
                                                        </span>
                                                        {report.caregiverName && (
                                                            <p className="text-sm font-bold text-stone-900 mt-1">
                                                                Caregiver: {report.caregiverName}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-stone-600 font-medium leading-relaxed">
                                                    {report.notes}
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="text-stone-400 text-center py-8">No notes available for this report.</p>
                                        )}
                                    </div>
                                </section>
                            </ScrollAnimation>

                            {/* Vital Signs Dashboard */}
                            <ScrollAnimation animation="fade-up" delay={0.2}>
                                <section className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-stone-100">
                                    <div className="flex items-center justify-between mb-8">
                                        <h4 className="text-xl font-bold flex items-center gap-3 text-stone-900">
                                            <span className="material-symbols-outlined text-[#5fa5ba] text-2xl fill-icon">monitoring</span>
                                            Vital Signs
                                        </h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                                            <div className="flex justify-between items-end mb-4">
                                                <div>
                                                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Blood Pressure</p>
                                                    <p className="text-2xl font-black text-stone-900">
                                                        {vitals.bp?.value || 'N/A'}
                                                        <span className="text-sm font-normal text-stone-400 ml-1">mmHg</span>
                                                    </p>
                                                </div>
                                                <div className={`px-3 py-1 rounded-lg text-xs font-bold border ${vitals.bp?.status === 'Optimal' || vitals.bp?.status === 'Normal'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                        : 'bg-amber-50 text-amber-700 border-amber-100'
                                                    }`}>
                                                    {vitals.bp?.status || 'Unknown'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                                            <div className="flex justify-between items-end mb-4">
                                                <div>
                                                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Heart Rate</p>
                                                    <p className="text-2xl font-black text-stone-900">
                                                        {vitals.hr?.value || 'N/A'}
                                                        <span className="text-sm font-normal text-stone-400 ml-1">BPM</span>
                                                    </p>
                                                </div>
                                                <div className={`px-3 py-1 rounded-lg text-xs font-bold border ${vitals.hr?.status === 'Stable' || vitals.hr?.status === 'Normal'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                        : 'bg-amber-50 text-amber-700 border-amber-100'
                                                    }`}>
                                                    {vitals.hr?.status || 'Unknown'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </ScrollAnimation>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="lg:col-span-4 flex flex-col gap-8">
                            {/* Overall Summary Card */}
                            <ScrollAnimation animation="fade-up">
                                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-stone-100">
                                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm uppercase tracking-widest mb-6 border ${currentStatus.badge}`}>
                                        <span className="material-symbols-outlined fill-icon text-lg">
                                            {statusColor === 'emerald' ? 'verified_user' : 'warning'}
                                        </span>
                                        {report.status} Status
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-stone-500">Health Score</span>
                                            <span className="font-bold text-2xl text-[#5fa5ba]">{report.healthScore || 0}%</span>
                                        </div>
                                        <div className="w-full bg-stone-100 rounded-full h-3">
                                            <div
                                                className="bg-[#5fa5ba] h-3 rounded-full transition-all duration-500"
                                                style={{ width: `${report.healthScore || 0}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-sm text-stone-500 mt-4">
                                            Report Type: <span className="font-bold text-stone-700">{report.reportType || 'Weekly'}</span>
                                        </p>
                                        <p className="text-sm text-stone-500">
                                            Period: <span className="font-bold text-stone-700">{report.period || 'N/A'}</span>
                                        </p>
                                    </div>
                                </div>
                            </ScrollAnimation>

                            {/* Caregiver Info */}
                            {report.caregiverName && (
                                <ScrollAnimation animation="fade-up" delay={0.3}>
                                    <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-stone-100">
                                        <h4 className="text-lg font-bold mb-6 flex items-center gap-3 text-stone-900">
                                            <span className="material-symbols-outlined text-[#5fa5ba] fill-icon">person</span>
                                            Attending Caregiver
                                        </h4>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-[#5fa5ba] flex items-center justify-center text-white font-bold">
                                                {report.caregiverName?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-stone-900">{report.caregiverName}</p>
                                                <p className="text-sm text-stone-500">Primary Caregiver</p>
                                            </div>
                                        </div>
                                    </section>
                                </ScrollAnimation>
                            )}

                            {/* Actions */}
                            <div className="flex flex-col gap-4 mt-auto pt-4">
                                <Link to="/family/reports" className="w-full py-4 px-8 rounded-2xl bg-white border-2 border-stone-100 font-extrabold text-stone-900 hover:bg-stone-50 hover:border-[#99C5D3] transition-colors flex items-center justify-center gap-3 text-md">
                                    <span className="material-symbols-outlined text-xl">arrow_back</span>
                                    Back to Reports
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HealthReportDetail;
