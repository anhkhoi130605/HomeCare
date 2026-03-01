import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ScrollAnimation from "@/components/ui/scroll-animation";
import { familyApi, scheduleApi } from '@/lib/api';

const PatientDetail = () => {
    const { id } = useParams();
    const [patient, setPatient] = useState(null);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [patientsData, schedulesData] = await Promise.all([
                    familyApi.getPatients(),
                    scheduleApi.getByPatient(id).catch(() => [])
                ]);

                const foundPatient = patientsData?.find(p => p.id === parseInt(id));
                setPatient(foundPatient);

                // Filter schedules for this patient
                const patientSchedules = schedulesData?.filter(s => s.patientId === parseInt(id)) || [];
                setSchedules(patientSchedules.slice(0, 4)); // Show last 4
            } catch (err) {
                console.error('Error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

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

    if (error || !patient) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <span className="material-symbols-outlined text-6xl text-stone-300 mb-4">error</span>
                <p className="text-stone-500 mb-4">{error || "Không tìm thấy bệnh nhân"}</p>
                <Link to="/family/patients" className="text-[#5fa5ba] font-bold hover:underline">
                    ← Quay lại danh sách
                </Link>
            </div>
        );
    }

    // Parse medical conditions if stored as JSON
    const getMedicalConditions = () => {
        if (!patient.medicalConditions) return [];
        if (Array.isArray(patient.medicalConditions)) return patient.medicalConditions;
        try {
            return JSON.parse(patient.medicalConditions);
        } catch {
            return patient.medicalConditions.split(',').map(c => c.trim());
        }
    };

    const conditions = getMedicalConditions();

    return (
        <div className="space-y-10 animate-fade-in-up pb-12 font-['Public_Sans']">
            {/* Header / Breadcrumb */}
            <div className="flex items-center gap-2 text-sm font-bold text-stone-400">
                <Link to="/family/patients" className="hover:text-[#5fa5ba]">Bệnh nhân</Link>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <span className="text-stone-800">{patient.fullName}</span>
            </div>

            {/* Profile Header Card */}
            <ScrollAnimation animation="fade-in">
                <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl shadow-stone-200/50 border border-stone-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E0F2F1]/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none group-hover:bg-[#E0F2F1]/70 transition-colors duration-700"></div>

                    <div className="flex flex-col md:flex-row gap-10 relative z-10">
                        <div className="relative">
                            <div className="w-40 h-40 rounded-[2.5rem] bg-[#5fa5ba] flex items-center justify-center text-white text-5xl font-bold shadow-lg border-4 border-white">
                                {patient.fullName?.[0] || 'P'}
                            </div>
                        </div>

                        <div className="flex-1 space-y-6">
                            <div>
                                <h1 className="text-4xl font-bold text-stone-900 tracking-tight">{patient.fullName}</h1>
                                <p className="text-xl font-medium text-stone-500 mt-1">
                                    {patient.relationship || 'Người thân'} • {patient.age || 'N/A'} tuổi
                                </p>
                            </div>

                            {conditions.length > 0 && (
                                <div className="flex flex-wrap gap-3">
                                    {conditions.map((condition, i) => (
                                        <div key={i} className="px-5 py-2.5 bg-[#E0F2F1] rounded-2xl border border-[#B2EBF2] flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[#00695C]">medical_services</span>
                                            <span className="text-sm font-bold text-[#00695C]">{condition}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {patient.notes && (
                                <p className="text-stone-600 leading-relaxed font-medium max-w-2xl">
                                    {patient.notes}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </ScrollAnimation>

            {/* Split Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Patient Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <ScrollAnimation animation="fade-up" delay={0.1}>
                            <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-2xl">cake</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Ngày sinh</p>
                                    <p className="text-lg font-black text-stone-900">
                                        {patient.dateOfBirth
                                            ? new Date(patient.dateOfBirth).toLocaleDateString('vi-VN')
                                            : 'Chưa cập nhật'}
                                    </p>
                                </div>
                            </div>
                        </ScrollAnimation>
                        <ScrollAnimation animation="fade-up" delay={0.2}>
                            <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-2xl">wc</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Giới tính</p>
                                    <p className="text-lg font-black text-stone-900">
                                        {patient.gender === 'Male' ? 'Nam' : patient.gender === 'Female' ? 'Nữ' : patient.gender || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </ScrollAnimation>
                    </div>

                    {/* Recent Schedules */}
                    <ScrollAnimation animation="fade-up">
                        <div className="bg-white rounded-[2.5rem] p-8 border border-stone-200 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black text-stone-900">Lịch chăm sóc gần đây</h3>
                                <Link to="/family/schedule" className="text-stone-900 text-sm font-bold hover:underline bg-stone-100 px-4 py-2 rounded-full border border-stone-200">
                                    Xem tất cả
                                </Link>
                            </div>
                            <div className="space-y-4">
                                {schedules.length > 0 ? schedules.map((schedule, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border bg-white border-stone-100 hover:border-stone-300 hover:shadow-md transition-all">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#E0F2F1] text-[#00695C]">
                                            <span className="material-symbols-outlined">calendar_today</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-base text-stone-800">
                                                {new Date(schedule.scheduledDate).toLocaleDateString('vi-VN')}
                                            </p>
                                            <p className="text-xs font-bold text-stone-400">
                                                {schedule.startTime} - {schedule.endTime}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${schedule.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                            schedule.status === 'InProgress' ? 'bg-blue-100 text-blue-700' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                            {schedule.status}
                                        </span>
                                    </div>
                                )) : (
                                    <p className="text-center text-stone-400 py-8">Chưa có lịch chăm sóc</p>
                                )}
                            </div>
                        </div>
                    </ScrollAnimation>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <ScrollAnimation animation="fade-left">
                        <div className="bg-[#5fa5ba] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-[#5fa5ba]/20">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
                            <h3 className="text-lg font-bold mb-6 relative z-10">Thông tin liên hệ</h3>
                            <div className="space-y-4">
                                {patient.emergencyContact && (
                                    <div>
                                        <p className="text-xs opacity-70">Liên hệ khẩn cấp</p>
                                        <p className="font-bold">{patient.emergencyContact}</p>
                                    </div>
                                )}
                                {patient.emergencyPhone && (
                                    <div>
                                        <p className="text-xs opacity-70">Số điện thoại</p>
                                        <p className="font-bold">{patient.emergencyPhone}</p>
                                    </div>
                                )}
                            </div>
                            <Link to="/family/services" className="block w-full py-3 bg-white text-[#5fa5ba] rounded-xl font-bold text-sm mt-6 hover:bg-stone-50 transition-colors text-center">
                                Tạo yêu cầu chăm sóc
                            </Link>
                        </div>
                    </ScrollAnimation>

                    <ScrollAnimation animation="fade-left" delay={0.1}>
                        <div className="bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-sm">
                            <h3 className="text-lg font-bold text-stone-900 mb-6">Hành động nhanh</h3>
                            <div className="space-y-3">
                                <Link to="/family/reports" className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F8FAFC] transition-colors cursor-pointer group">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-xl">monitoring</span>
                                    </div>
                                    <span className="text-sm font-bold text-stone-600 group-hover:text-stone-900">Xem báo cáo sức khỏe</span>
                                </Link>
                                <Link to="/family/schedule" className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F8FAFC] transition-colors cursor-pointer group">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-xl">calendar_month</span>
                                    </div>
                                    <span className="text-sm font-bold text-stone-600 group-hover:text-stone-900">Lịch chăm sóc</span>
                                </Link>
                            </div>
                        </div>
                    </ScrollAnimation>
                </div>
            </div>
        </div>
    );
};

export default PatientDetail;
