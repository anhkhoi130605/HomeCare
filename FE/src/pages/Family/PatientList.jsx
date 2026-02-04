import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { familyApi } from '@/lib/api';
import AddMemberModal from './AddMemberModal';
import ScrollAnimation from "@/components/ui/scroll-animation";

const PatientList = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const data = await familyApi.getPatients();
            setPatients(data || []);
        } catch (error) {
            console.error("Failed to fetch patients:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const handlePatientAdded = () => {
        fetchPatients();
        setIsAddModalOpen(false);
    };

    const getAge = (dateOfBirth) => {
        if (!dateOfBirth) return 'N/A';
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <div className="font-['Public_Sans'] space-y-8 pb-20 bg-stone-50/30 min-h-screen">

            {/* 1. Header - Blue Gradient Luxury Style */}
            <ScrollAnimation animation="fade-in">
                <div className="bg-[#99C5D3] rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-xl shadow-[#99C5D3]/20">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                                    <span className="material-symbols-outlined text-sm">health_and_safety</span>
                                </span>
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/90">Medical Records</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-2">Patient Directory</h1>
                            <p className="text-white/80 max-w-lg text-sm md:text-base font-medium leading-relaxed">
                                Manage care plans, medical logs, and daily schedules for your loved ones with ease and precision.
                            </p>
                        </div>
                        <button onClick={() => setIsAddModalOpen(true)} className="bg-white text-[#5fa5ba] hover:bg-stone-50 transition-all px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg shadow-black/5 hover:-translate-y-0.5 active:translate-y-0 leading-none">
                            <span className="material-symbols-outlined text-lg">add</span>
                            Add New Patient
                        </button>
                    </div>
                </div>
            </ScrollAnimation>

            {/* 2. Patient List */}
            <div className="space-y-5">
                {loading ? (
                    <div className="text-center py-12 text-stone-400">
                        <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
                        <p className="mt-2">Loading patients...</p>
                    </div>
                ) : patients.length === 0 ? (
                    <ScrollAnimation animation="fade-up">
                        <div className="bg-white rounded-[2rem] p-12 text-center shadow-sm border border-stone-100">
                            <div className="w-20 h-20 rounded-2xl bg-[#E0F2F1] text-[#00695C] flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-4xl">person_add</span>
                            </div>
                            <h3 className="text-xl font-bold text-stone-900 mb-2">No Patients Yet</h3>
                            <p className="text-stone-500 mb-6 max-w-md mx-auto">
                                Start by adding your first patient to manage their care plan and schedule appointments.
                            </p>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-[#5fa5ba] text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-[#4d8ca0] transition-all"
                            >
                                Add Your First Patient
                            </button>
                        </div>
                    </ScrollAnimation>
                ) : (
                    patients.map((patient, idx) => (
                        <ScrollAnimation key={patient.id} animation="fade-up" delay={idx * 0.1}>
                            <div className="group bg-white rounded-[2rem] p-1 shadow-sm border border-stone-100 hover:shadow-xl hover:shadow-[#99C5D3]/10 transition-all duration-300">
                                <div className="flex flex-col lg:flex-row">

                                    {/* Left: Identity */}
                                    <div className="p-6 flex items-center gap-6 lg:w-[35%] lg:border-r border-stone-50 relative overflow-hidden">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#99C5D3] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                        <div className="relative shrink-0">
                                            <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden shadow-sm bg-[#5fa5ba] flex items-center justify-center text-white text-2xl font-bold">
                                                {patient.fullName?.charAt(0) || 'P'}
                                            </div>
                                            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-[3px] border-white flex items-center justify-center bg-emerald-400`}>
                                                <span className="material-symbols-outlined text-[10px] text-white font-bold">home</span>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-bold text-stone-900 group-hover:text-[#5fa5ba] transition-colors">{patient.fullName}</h3>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="bg-stone-50 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-stone-500 border border-stone-100">
                                                    {patient.relation || 'Patient'}
                                                </span>
                                                <span className="text-xs text-stone-400 font-medium">{getAge(patient.dateOfBirth)} yrs</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Middle: Medical Context */}
                                    <div className="p-6 flex-1 flex flex-col md:flex-row gap-8 items-center justify-between">
                                        <div className="flex flex-col gap-1.5 w-full md:w-auto">
                                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 bg-[#99C5D3] rounded-full"></span>
                                                Health Notes
                                            </span>
                                            <p className="text-sm font-bold text-stone-700 flex items-center gap-2">
                                                {patient.healthNotes || 'No notes added'}
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-1.5 w-full md:w-auto">
                                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Status</span>
                                            <span className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                                                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                                                Active
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right: Actions */}
                                    <div className="p-4 flex items-center justify-end gap-2 lg:w-[25%]">
                                        <button className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 hover:bg-[#99C5D3] hover:text-white transition-all shadow-sm">
                                            <span className="material-symbols-outlined text-lg">edit</span>
                                        </button>
                                        <Link to={`/family/patients/detail/${patient.id}`} className="ml-2 pl-4 pr-1.5 py-1.5 rounded-full border border-stone-100 hover:border-[#99C5D3] bg-white group-hover:bg-[#99C5D3]/10 transition-all flex items-center gap-3">
                                            <span className="text-xs font-bold text-stone-600 group-hover:text-[#5fa5ba]">View Details</span>
                                            <span className="w-7 h-7 rounded-full bg-stone-100 group-hover:bg-[#5fa5ba] group-hover:text-white text-stone-500 flex items-center justify-center transition-all">
                                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                            </span>
                                        </Link>
                                    </div>

                                </div>
                            </div>
                        </ScrollAnimation>
                    ))
                )}
            </div>

            {/* 3. Bottom: Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
                <ScrollAnimation animation="slide-right" className="lg:col-span-2">
                    <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm p-8 h-full">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-stone-900">Quick Tips</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex gap-4 group p-4 rounded-xl bg-stone-50 hover:bg-[#E0F2F1] transition-colors">
                                <div className="w-10 h-10 rounded-full bg-[#99C5D3] text-white flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined">lightbulb</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-stone-800 text-sm">Add Complete Information</h4>
                                    <p className="text-xs text-stone-500 mt-1">Include health notes and allergies for better care planning.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 group p-4 rounded-xl bg-stone-50 hover:bg-[#E0F2F1] transition-colors">
                                <div className="w-10 h-10 rounded-full bg-[#99C5D3] text-white flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined">calendar_month</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-stone-800 text-sm">Schedule Regular Check-ups</h4>
                                    <p className="text-xs text-stone-500 mt-1">Book appointments to ensure continuous care for your patients.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollAnimation>

                <ScrollAnimation animation="slide-left" delay={0.2} className="lg:col-span-1">
                    <div className="bg-[#5fa5ba] rounded-[2.5rem] p-8 text-white h-full relative overflow-hidden flex flex-col justify-center shadow-lg shadow-[#5fa5ba]/20">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl"></div>
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md mb-4 shadow-inner">
                                <span className="material-symbols-outlined text-3xl">medical_services</span>
                            </div>
                            <h3 className="text-lg font-bold mb-2">Need Assistance?</h3>
                            <p className="text-white/90 text-sm mb-6 leading-relaxed">Our medical team is available 24/7 for consultations.</p>
                            <button className="w-full py-3.5 bg-white text-[#5fa5ba] rounded-xl font-bold text-sm shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-2">
                                Contact Support
                            </button>
                        </div>
                    </div>
                </ScrollAnimation>
            </div>

            <AddMemberModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onPatientAdded={handlePatientAdded}
            />
        </div>
    );
};

export default PatientList;
