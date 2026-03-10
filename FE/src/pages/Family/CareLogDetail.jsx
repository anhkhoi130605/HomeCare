import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { careLogApi } from '../../lib/api';

const FamilyCareLogDetail = () => {
    const { id } = useParams();
    const [log, setLog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLog = async () => {
            try {
                setLoading(true);
                const data = await careLogApi.getById(id);
                setLog(data);
            } catch (err) {
                console.error('Error fetching log:', err);
                setError(err.message || 'Failed to load care log');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchLog();
    }, [id]);

    // Parse vital signs from JSON string
    const parseVitals = (vitalsString) => {
        if (!vitalsString) return null;
        try {
            return JSON.parse(vitalsString);
        } catch {
            return null;
        }
    };

    // Parse medications from string
    const parseMedications = (medsString) => {
        if (!medsString) return [];
        try {
            return JSON.parse(medsString);
        } catch {
            return medsString.split(',').map(m => ({ name: m.trim() }));
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#5fa5ba] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-stone-500 font-medium">Đang tải...</p>
                </div>
            </div>
        );
    }

    if (error || !log) {
        return (
            <div className="flex h-screen items-center justify-center font-manrope">
                <div className="text-center">
                    <span className="material-symbols-outlined text-6xl text-stone-300 mb-4">error</span>
                    <h2 className="text-2xl font-bold text-stone-800 mb-2">Không tìm thấy nhật ký</h2>
                    <p className="text-stone-500 mb-4">{error}</p>
                    <Link to="/family/reports" className="text-[#5fa5ba] font-bold">← Quay lại</Link>
                </div>
            </div>
        );
    }

    const vitals = parseVitals(log.vitalSigns);
    const medications = parseMedications(log.medicationsGiven);

    return (
        <div className="flex h-full min-h-screen font-manrope bg-slate-50 text-stone-900 animate-fade-in-up pb-12">
            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto space-y-8">
                {/* Header Banner */}
                <div className="bg-[#99C5D3] rounded-b-[2.5rem] p-8 md:p-10 text-white shadow-xl shadow-[#99C5D3]/20 relative overflow-hidden -mx-4 md:mx-0 md:rounded-[2.5rem] mb-8">
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to="/family/reports" className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-white hover:text-[#5fa5ba] transition-all">
                                <span className="material-symbols-outlined">arrow_back</span>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-white">Chi tiết nhật ký chăm sóc</h1>
                                <p className="text-white/80 font-medium text-sm">Mã: LOG-{id}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto w-full px-4 md:px-0">
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-stone-100 overflow-hidden">
                        {/* Summary Header */}
                        <div className="p-8 border-b border-stone-50 bg-stone-50/50">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-[#5fa5ba] flex items-center justify-center text-white text-2xl font-bold shadow-md border-2 border-white">
                                        {log.caregiverName?.[0] || 'C'}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Người chăm sóc</p>
                                        <h3 className="text-lg font-bold text-stone-800">{log.caregiverName}</h3>
                                        <p className="text-sm text-stone-500">Bệnh nhân: {log.patientName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div>
                                        <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Thời gian</p>
                                        <p className="font-bold text-stone-800">{formatDate(log.loggedAt)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Trạng thái</p>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${log.status === 'Submitted' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {log.status === 'Submitted' ? 'Đã gửi' : 'Bản nháp'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 space-y-10">
                            {/* Vitals */}
                            {vitals && (
                                <section>
                                    <div className="flex items-center gap-2 mb-6">
                                        <span className="w-8 h-8 rounded-lg bg-[#5fa5ba]/10 text-[#5fa5ba] flex items-center justify-center">
                                            <span className="material-symbols-outlined text-lg">monitoring</span>
                                        </span>
                                        <h3 className="font-bold text-stone-800 text-lg">Chỉ số sinh tồn</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                        {vitals.heartRate && (
                                            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
                                                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Nhịp tim</p>
                                                <p className="text-xl font-black text-stone-700">{vitals.heartRate} <span className="text-sm font-normal text-stone-400">BPM</span></p>
                                            </div>
                                        )}
                                        {vitals.temperature && (
                                            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
                                                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Nhiệt độ</p>
                                                <p className="text-xl font-black text-stone-700">{vitals.temperature} <span className="text-sm font-normal text-stone-400">°C</span></p>
                                            </div>
                                        )}
                                        {vitals.bloodPressure && (
                                            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
                                                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Huyết áp</p>
                                                <p className="text-xl font-black text-stone-700">{vitals.bloodPressure} <span className="text-sm font-normal text-stone-400">mmHg</span></p>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Activities */}
                                <section>
                                    <div className="flex items-center gap-2 mb-6">
                                        <span className="w-8 h-8 rounded-lg bg-[#5fa5ba]/10 text-[#5fa5ba] flex items-center justify-center">
                                            <span className="material-symbols-outlined text-lg">task_alt</span>
                                        </span>
                                        <h3 className="font-bold text-stone-800 text-lg">Hoạt động</h3>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-stone-50 border border-stone-100">
                                        <p className="text-sm text-stone-700 font-medium leading-relaxed">
                                            {log.activities || 'Không có dữ liệu'}
                                        </p>
                                    </div>
                                </section>

                                {/* Medications */}
                                {medications.length > 0 && (
                                    <section>
                                        <div className="flex items-center gap-2 mb-6">
                                            <span className="w-8 h-8 rounded-lg bg-[#5fa5ba]/10 text-[#5fa5ba] flex items-center justify-center">
                                                <span className="material-symbols-outlined text-lg">medication</span>
                                            </span>
                                            <h3 className="font-bold text-stone-800 text-lg">Thuốc đã cho</h3>
                                        </div>
                                        <div className="space-y-3">
                                            {medications.map((med, i) => (
                                                <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-stone-100 shadow-sm">
                                                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                                                    <div className="flex-1">
                                                        <p className="font-bold text-sm text-stone-800">{med.name || med}</p>
                                                        {med.dose && <p className="text-xs text-stone-500">{med.dose}</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </div>

                            {/* Meals */}
                            {log.mealsProvided && (
                                <section>
                                    <div className="flex items-center gap-2 mb-6">
                                        <span className="w-8 h-8 rounded-lg bg-[#5fa5ba]/10 text-[#5fa5ba] flex items-center justify-center">
                                            <span className="material-symbols-outlined text-lg">restaurant</span>
                                        </span>
                                        <h3 className="font-bold text-stone-800 text-lg">Bữa ăn</h3>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-stone-50 border border-stone-100">
                                        <p className="text-sm text-stone-700 font-medium leading-relaxed">{log.mealsProvided}</p>
                                    </div>
                                </section>
                            )}

                            {/* Patient Mood */}
                            {log.patientMood && (
                                <section>
                                    <div className="flex items-center gap-2 mb-6">
                                        <span className="w-8 h-8 rounded-lg bg-[#5fa5ba]/10 text-[#5fa5ba] flex items-center justify-center">
                                            <span className="material-symbols-outlined text-lg">mood</span>
                                        </span>
                                        <h3 className="font-bold text-stone-800 text-lg">Tâm trạng bệnh nhân</h3>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-stone-50 border border-stone-100">
                                        <p className="text-sm text-stone-700 font-medium">{log.patientMood}</p>
                                    </div>
                                </section>
                            )}

                            {/* Care Notes */}
                            {log.notes && (
                                <section>
                                    <div className="flex items-center gap-2 mb-6">
                                        <span className="w-8 h-8 rounded-lg bg-[#5fa5ba]/10 text-[#5fa5ba] flex items-center justify-center">
                                            <span className="material-symbols-outlined text-lg">description</span>
                                        </span>
                                        <h3 className="font-bold text-stone-800 text-lg">Ghi chú</h3>
                                    </div>
                                    <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-5">
                                            <span className="material-symbols-outlined text-6xl">format_quote</span>
                                        </div>
                                        <p className="text-stone-700 leading-loose italic font-medium relative z-10">"{log.notes}"</p>
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FamilyCareLogDetail;
