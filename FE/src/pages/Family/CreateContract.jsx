import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { familyApi, serviceApi, caregiverApi, contractApi } from '@/lib/api';
import { toast } from 'sonner';

const CreateContract = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const serviceIdParam = searchParams.get('service_id');

    const [patients, setPatients] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [caregivers, setCaregivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Selections
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [selectedCaregiverId, setSelectedCaregiverId] = useState('');
    const [durationMonths, setDurationMonths] = useState(3);
    const [selectedDays, setSelectedDays] = useState(['MON', 'WED', 'FRI']);
    const [startTime, setStartTime] = useState('09:00');
    const [dailyHours, setDailyHours] = useState(4);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [patientsData, caregiversData] = await Promise.all([
                    familyApi.getPatients(),
                    caregiverApi.getAll(true)
                ]);

                setPatients(patientsData || []);
                setCaregivers(caregiversData || []);

                if (patientsData?.length > 0) {
                    setSelectedPatientId(patientsData[0].id.toString());
                }

                if (serviceIdParam) {
                    const services = await serviceApi.getAll();
                    const service = services.find(s => s.id.toString() === serviceIdParam);
                    if (service) {
                        setSelectedService(service);
                    } else {
                        toast.error("Service not found");
                    }
                }

            } catch (error) {
                console.error("Failed to fetch data:", error);
                toast.error("Failed to load contract details");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [serviceIdParam]);

    // Cost Calculations
    const calculations = useMemo(() => {
        if (!selectedService) return { hourly: 0, monthly: 0, total: 0 };

        const hourlyRate = selectedService.pricePerHour || selectedService.price || 15;
        const hoursPerWeek = selectedDays.length * dailyHours;
        const estimatedHoursPerMonth = hoursPerWeek * 4.33; // Average weeks per month
        const monthlyCost = estimatedHoursPerMonth * hourlyRate;
        const totalCommitment = monthlyCost * durationMonths;

        return {
            hourly: hourlyRate,
            weekly: hoursPerWeek,
            monthly: Math.round(monthlyCost),
            total: Math.round(totalCommitment)
        };
    }, [selectedService, selectedDays, dailyHours, durationMonths]);

    const handleDayToggle = (day) => {
        setSelectedDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPatientId) return toast.error("Please select a patient");
        if (!selectedService) return toast.error("Please select a service");
        if (selectedDays.length === 0) return toast.error("Please select at least one day");

        try {
            setSubmitting(true);

            const startDate = new Date();
            startDate.setDate(startDate.getDate() + 7); // Starts in 1 week by default

            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + durationMonths);

            const payload = {
                // Camel case matching Backend DTO
                patientId: parseInt(selectedPatientId),
                serviceId: parseInt(selectedService.id),
                assignedCaregiverId: selectedCaregiverId ? parseInt(selectedCaregiverId) : null,
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                weeklySchedule: JSON.stringify({
                    days: selectedDays,
                    startTime: startTime,
                    dailyHours: dailyHours
                }),
                // Optional extras our service might use
                totalAmount: calculations.total,
                status: 'Pending'
            };

            await contractApi.create(payload);
            toast.success("Long-term care contract submitted for review!");
            navigate('/family/contracts');
        } catch (error) {
            console.error("Failed to create contract:", error);
            toast.error("Submission failed: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-12 h-12 border-4 border-[#5fa5ba] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-stone-500 font-medium tracking-wide uppercase text-xs">Preparing Contract Configuration...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-24 font-['Public_Sans'] px-4">

            {/* Header */}
            <div className="mb-16 text-center">
                <h1 className="text-4xl md:text-5xl font-black text-stone-900 tracking-tight mb-4">Start Long-Term Care Plan</h1>
                <p className="text-stone-500 font-medium text-lg max-w-2xl mx-auto">
                    Commit to a consistent, professional care schedule. Long-term plans offer priority staffing and personalized care coordination.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-16 animate-fade-in-up">

                {/* 1. Who is the care for? */}
                <section className="space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#E0F2F1] text-[#00695C] flex items-center justify-center border border-[#B2EBF2] shadow-sm">
                            <span className="material-symbols-outlined text-2xl">person</span>
                        </div>
                        <h2 className="text-2xl font-black text-stone-900 tracking-tight">1. Beneficiary</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {patients.map((patient) => (
                            <div key={patient.id} className="relative group">
                                <input
                                    checked={selectedPatientId === patient.id.toString()}
                                    onChange={() => setSelectedPatientId(patient.id.toString())}
                                    className="hidden peer"
                                    id={`patient-${patient.id}`}
                                    name="patient"
                                    type="radio"
                                />
                                <label
                                    className="flex items-center gap-4 p-6 bg-white border-2 border-stone-100 rounded-[2rem] cursor-pointer hover:border-[#B2EBF2] transition-all peer-checked:border-[#5fa5ba] peer-checked:bg-[#E0F2F1]/50 hover:shadow-md h-full"
                                    htmlFor={`patient-${patient.id}`}
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-[#5fa5ba] flex items-center justify-center text-white text-xl font-black shadow-lg">
                                        {patient.fullName?.[0] || 'P'}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-stone-800 text-lg truncate leading-tight">{patient.fullName}</p>
                                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mt-1">
                                            {patient.relationship || 'Member'} • Age {patient.age || '--'}
                                        </p>
                                    </div>
                                </label>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 2. Selected Service Package */}
                <section className="space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#E0F2F1] text-[#00695C] flex items-center justify-center border border-[#B2EBF2] shadow-sm">
                            <span className="material-symbols-outlined text-2xl">verified</span>
                        </div>
                        <h2 className="text-2xl font-black text-stone-900 tracking-tight">2. Selected Care Template</h2>
                    </div>
                    {selectedService ? (
                        <div className="bg-white border-2 border-stone-100 rounded-[3rem] p-10 flex flex-col lg:flex-row items-center justify-between gap-10 shadow-sm border-l-[12px] border-l-[#5fa5ba] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <span className="material-symbols-outlined text-[120px]">handshake</span>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-8 relative z-10 text-center sm:text-left">
                                <div className="w-24 h-24 rounded-3xl bg-[#5fa5ba] flex items-center justify-center text-white shadow-xl shadow-[#5fa5ba]/20 shrink-0">
                                    <span className="material-symbols-outlined text-5xl">health_metrics</span>
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-stone-900">{selectedService.name}</h3>
                                    <p className="text-stone-500 font-medium max-w-md mt-2 leading-relaxed">{selectedService.description}</p>
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
                                        <span className="bg-[#E0F2F1] text-[#00695C] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-[#B2EBF2]">
                                            ${calculations.hourly}/hour
                                        </span>
                                        <span className="bg-stone-100 text-stone-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                                            Priority Staffing
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <Link
                                to="/family/services"
                                className="px-8 py-4 border-2 border-stone-200 rounded-2xl text-xs font-black text-stone-400 hover:text-stone-900 hover:border-stone-900 transition-all uppercase tracking-widest flex items-center gap-3 bg-stone-50"
                            >
                                <span className="material-symbols-outlined text-lg">sync_alt</span>
                                Change Service
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-red-50 p-10 rounded-[2.5rem] border-2 border-dashed border-red-200 text-center">
                            <p className="text-red-600 font-black mb-4 uppercase tracking-widest">No service selected</p>
                            <Link to="/family/services" className="bg-red-600 text-white px-10 py-4 rounded-full text-sm font-black uppercase tracking-widest shadow-lg shadow-red-200">Browse Marketplace</Link>
                        </div>
                    )}
                </section>

                {/* 3. Plan Duration */}
                <section className="space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#E0F2F1] text-[#00695C] flex items-center justify-center border border-[#B2EBF2] shadow-sm">
                            <span className="material-symbols-outlined text-2xl">event_available</span>
                        </div>
                        <h2 className="text-2xl font-black text-stone-900 tracking-tight">3. Plan Duration</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {[3, 6, 12].map(months => (
                            <button
                                key={months}
                                type="button"
                                onClick={() => setDurationMonths(months)}
                                className={`p-8 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-3 ${durationMonths === months ? 'border-[#5fa5ba] bg-[#E0F2F1]/50 shadow-lg' : 'border-stone-100 bg-white hover:border-[#B2EBF2]'}`}
                            >
                                <span className="text-4xl font-black text-stone-900">{months}</span>
                                <span className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em]">Months</span>
                                {months === 12 && (
                                    <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase mt-1">Best Value</span>
                                )}
                            </button>
                        ))}
                    </div>
                </section>

                {/* 4. Recurring Schedule */}
                <section className="space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#E0F2F1] text-[#00695C] flex items-center justify-center border border-[#B2EBF2] shadow-sm">
                            <span className="material-symbols-outlined text-2xl">update</span>
                        </div>
                        <h2 className="text-2xl font-black text-stone-900 tracking-tight">4. Weekly Activity</h2>
                    </div>
                    <div className="bg-white p-10 md:p-14 rounded-[3rem] border-2 border-stone-100 shadow-sm space-y-12">
                        <div>
                            <p className="text-xs font-black text-stone-400 uppercase tracking-widest mb-6 ml-2">Active Service Days</p>
                            <div className="flex flex-wrap gap-4">
                                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => handleDayToggle(day)}
                                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl font-black text-sm transition-all border-2 ${selectedDays.includes(day) ? 'bg-[#5fa5ba] text-white border-[#5fa5ba] shadow-lg shadow-[#5fa5ba]/20' : 'bg-white text-stone-300 border-stone-100 hover:border-[#99C5D3]'}`}
                                    >
                                        {day.slice(0, 3)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-3">
                                <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-2">Preferred Entry Time</label>
                                <input
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full bg-stone-50 rounded-2xl border-none py-5 px-8 text-2xl font-black text-stone-800 focus:ring-4 focus:ring-[#E0F2F1] transition-all outline-none"
                                    type="time"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-2">Daily Session Length (Hours)</label>
                                <select
                                    value={dailyHours}
                                    onChange={(e) => setDailyHours(parseInt(e.target.value))}
                                    className="w-full bg-stone-50 rounded-2xl border-none py-5 px-8 text-2xl font-black text-stone-800 focus:ring-4 focus:ring-[#E0F2F1] transition-all outline-none appearance-none"
                                >
                                    {[2, 4, 6, 8, 10, 12, 24].map(h => (
                                        <option key={h} value={h}>{h} Hours/Day</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. Caregiver Assignment */}
                <section className="space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#E0F2F1] text-[#00695C] flex items-center justify-center border border-[#B2EBF2] shadow-sm">
                            <span className="material-symbols-outlined text-2xl">supervisor_account</span>
                        </div>
                        <h2 className="text-2xl font-black text-stone-900 tracking-tight">5. Specific Assignment (Optional)</h2>
                    </div>
                    <div className="relative group max-w-2xl">
                        <select
                            className="appearance-none w-full bg-white border-2 border-stone-100 hover:border-[#99C5D3] rounded-[2rem] px-10 py-8 text-xl font-bold focus:ring-4 focus:ring-[#99C5D3]/20 focus:border-[#5fa5ba] outline-none transition-all cursor-pointer shadow-sm text-stone-700"
                            value={selectedCaregiverId}
                            onChange={(e) => setSelectedCaregiverId(e.target.value)}
                        >
                            <option value="">Auto-matching (Smart Selection)</option>
                            {caregivers.map(cg => (
                                <option key={cg.id} value={cg.id}>{cg.fullName} ({cg.specialization || 'Professional'})</option>
                            ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none text-[#5fa5ba] text-4xl font-bold">expand_more</span>
                    </div>
                </section>

                {/* 6. Professional Notes */}
                <section className="space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#E0F2F1] text-[#00695C] flex items-center justify-center border border-[#B2EBF2] shadow-sm">
                            <span className="material-symbols-outlined text-2xl">rate_review</span>
                        </div>
                        <h2 className="text-2xl font-black text-stone-900 tracking-tight">6. Care Requirements & Notes</h2>
                    </div>
                    <div className="bg-white p-8 rounded-[3rem] border-2 border-stone-100 shadow-sm focus-within:border-[#5fa5ba] transition-all">
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full border-none p-4 text-sm font-bold focus:ring-0 transition-all min-h-[160px] outline-none text-stone-700 placeholder:text-stone-300 bg-transparent leading-relaxed"
                            placeholder="Specify medical histories, dietary restrictions, emergency protocols, or specific personality matches..."
                        ></textarea>
                    </div>
                </section>

                {/* 7. Cost Summary & Commitment */}
                <section className="bg-stone-900 rounded-[4rem] p-12 md:p-16 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                        <span className="material-symbols-outlined text-[150px]">verified_user</span>
                    </div>

                    <div className="relative z-10">
                        <h2 className="text-xl font-black text-[#5fa5ba] uppercase tracking-[0.4em] mb-12 flex items-center gap-3">
                            <span className="material-symbols-outlined">analytics</span>
                            Plan Commitment Summary
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                            {/* Left: Detailed stats */}
                            <div className="space-y-6">
                                <div className="flex justify-between items-center bg-white/5 p-6 rounded-3xl backdrop-blur-sm border border-white/10">
                                    <span className="text-stone-400 font-bold text-xs uppercase tracking-widest">Monthly Rate</span>
                                    <span className="text-3xl font-black text-white">${calculations.monthly}</span>
                                </div>
                                <div className="space-y-4 px-2">
                                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                        <span className="text-stone-500 font-bold text-[10px] uppercase tracking-widest">Plan Duration</span>
                                        <span className="text-lg font-black text-white">{durationMonths} Months</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                        <span className="text-stone-500 font-bold text-[10px] uppercase tracking-widest">Active Days</span>
                                        <span className="text-lg font-black text-white">{selectedDays.length} Days / Week</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                        <span className="text-stone-500 font-bold text-[10px] uppercase tracking-widest">Hours / Session</span>
                                        <span className="text-lg font-black text-white">{dailyHours} Hours</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Grand Total & Action */}
                            <div className="flex flex-col justify-center lg:items-end text-center lg:text-right">
                                <p className="text-xs font-black text-[#5fa5ba] uppercase tracking-widest mb-2">Total Estimated Commitment</p>
                                <p className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6">${calculations.total.toLocaleString()}</p>

                                <p className="text-stone-500 text-[10px] font-bold mb-10 max-w-xs lg:ml-auto leading-relaxed italic">
                                    * Final amount subject to medical board review. Approval typically takes 4-8 business hours.
                                </p>

                                <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
                                    <Link
                                        to="/family/services"
                                        className="text-[10px] font-black text-stone-500 hover:text-white transition-colors uppercase tracking-[3px] py-2"
                                    >
                                        Discard
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={submitting || patients.length === 0}
                                        className="w-full sm:w-auto px-12 py-5 bg-[#5fa5ba] text-white text-lg font-black rounded-3xl shadow-2xl shadow-[#5fa5ba]/10 hover:bg-[#4d8ca0] hover:-translate-y-1 active:scale-95 transition-all uppercase tracking-[4px] flex items-center justify-center gap-4 group disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? (
                                            <>
                                                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                Submit Review
                                                <span className="material-symbols-outlined font-black text-xl group-hover:translate-x-2 transition-transform">send</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="flex items-center justify-center gap-4 text-stone-500">
                    <span className="material-symbols-outlined text-sm">verified</span>
                    <p className="text-[10px] font-bold uppercase tracking-widest">Clinical Team Review Mandatory • Secure Infrastructure • No charges until approval</p>
                </div>
            </form>
        </div>
    );
};

export default CreateContract;
