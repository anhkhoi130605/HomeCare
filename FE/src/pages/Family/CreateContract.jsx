import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import ScrollAnimation from "@/components/ui/scroll-animation";
import { familyApi, serviceApi, caregiverApi, contractApi, paymentApi } from '@/lib/api';
import AddMemberModal from './AddMemberModal';
import { toast } from 'sonner';

const CreateContract = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Data
    const [patients, setPatients] = useState([]);
    const [packages, setPackages] = useState([]);
    const [caregivers, setCaregivers] = useState([]);

    // Selections
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [selectedPackageId, setSelectedPackageId] = useState('');
    const [selectedCaregiverId, setSelectedCaregiverId] = useState('');

    // Schedule Configuration
    const [days, setDays] = useState(['MON', 'TUE', 'WED', 'THU', 'FRI']);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]);

    // Modal
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [patientsData, packagesData, caregiversData] = await Promise.all([
                    familyApi.getPatients(),
                    serviceApi.getAll(true),
                    caregiverApi.getAll(true) // Fetch available caregivers
                ]);

                setPatients(patientsData || []);
                setPackages(packagesData || []);
                setCaregivers(caregiversData || []);

                // Pre-select if available
                if (patientsData?.length > 0) setSelectedPatientId(patientsData[0].id);

                const urlPackageId = searchParams.get('packageId');
                if (urlPackageId) {
                    setSelectedPackageId(urlPackageId);
                } else if (packagesData?.length > 0) {
                    setSelectedPackageId(packagesData[0].id);
                }

            } catch (error) {
                console.error("Failed to load data:", error);
                toast.error("Failed to load preliminary data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [searchParams]);

    // Derived values
    const selectedPackage = packages.find(p => p.id === parseInt(selectedPackageId));
    const selectedCaregiver = caregivers.find(c => c.id === parseInt(selectedCaregiverId));

    // Cost Calculation
    const calculateTotal = () => {
        if (!selectedPackage) return 0;

        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);
        let hoursPerDay = (end - start) / (1000 * 60 * 60);
        if (hoursPerDay <= 0) hoursPerDay = 8; // Default fallback

        const startD = new Date(startDate);
        const endD = new Date(endDate);
        const dayCount = days.length;
        const totalDays = (endD - startD) / (1000 * 60 * 60 * 24);
        const weeks = Math.ceil(totalDays / 7);

        // Simple approximation
        const totalHours = hoursPerDay * dayCount * weeks;
        const price = selectedPackage.pricePerHour ?? selectedPackage.PricePerHour ?? 0;
        return (totalHours * price).toFixed(2);
    };

    const handleDayToggle = (day) => {
        const newDays = days.includes(day)
            ? days.filter(d => d !== day)
            : [...days, day];
        setDays(newDays);
    };

    const handlePatientChange = (e) => {
        if (e.target.value === 'add-new') {
            setIsAddMemberModalOpen(true);
        } else {
            setSelectedPatientId(e.target.value);
        }
    };

    const handleProceed = async () => {
        if (!selectedPatientId || !selectedPackageId || !startDate || !endDate || days.length === 0) {
            toast.error("Please fill in all required fields (Patient, Package, Schedule)");
            return;
        }

        try {
            setSubmitting(true);

            // 1. Create Contract
            const scheduleData = {
                Days: days,
                StartTime: startTime,
                EndTime: endTime
            };

            const contractData = {
                PatientId: parseInt(selectedPatientId),
                ServiceId: parseInt(selectedPackageId),
                AssignedCaregiverId: selectedCaregiverId ? parseInt(selectedCaregiverId) : null,
                StartDate: startDate,
                EndDate: endDate,
                WeeklySchedule: JSON.stringify(scheduleData)
            };

            const contract = await contractApi.create(contractData);

            // 2. Create Payment Logic (Create Payment Record -> Get VNPay URL)
            const paymentData = {
                ContractId: contract.id,
                Amount: contract.totalAmount, // Use amount from backend response
                PaymentMethod: 'VNPay',
                OrderInfo: `Payment for Contract #${contract.id}`
            };

            const payment = await paymentApi.create(paymentData);

            if (payment && payment.paymentId) {
                // Get VNPay URL
                const { paymentUrl } = await paymentApi.getVnPayUrl(payment.paymentId);
                if (paymentUrl) {
                    window.location.href = paymentUrl;
                } else {
                    toast.error("Failed to generate payment URL");
                }
            } else {
                toast.error("Failed to create payment record");
            }

        } catch (error) {
            console.error("Submission failed:", error);
            toast.error(error.message || "Failed to submit contract");
        } finally {
            setSubmitting(false);
        }
    };

    const getPackageImage = (name) => {
        if (name.includes('Basic')) return "https://lh3.googleusercontent.com/aida-public/AB6AXuChghb6TOUbuaLclIMauhzBL0IIm9vBg8J-Y64vaYiogF-pNPuA--5uQH5whw1tLgb7Gb1geLsywbrLPV314vs11Ucmy_zQptjR8VQqR7E41jusmHuuug8Er01BAJh3_7MazDnKlU-eQjEIZDj5-sXPj-opm2Cm1nTIm9fpqTDYdCqAsIG6x31Y4m-qAHuXiMKTuQ9Rv7QNE65lMQSY0X82S4Tjw_CNFMNKc-arQufSxBXdEtcYSkJkHop4clnzkqwiwNY9ho0cuJWL";
        if (name.includes('Intensive')) return "https://lh3.googleusercontent.com/aida-public/AB6AXuAc6Jb1JhErh_9a6p8vNbSjwiLl3104mBulsi1Z0wqeApesz111etbxrVLD-r9lbdKtRrGM2W7mHJEQN06nbDG_9KOQNhakeCCFti-fzkkQsISxPTXSkJiXEkw-n9KqcSKgvqXMshADZbVz-qMskuy1fV7QVyCyTeTfgnrp2482IX69JULHr7g0Fg02DtcETbmPxM8BkAg7babDrLa6pz8viaxkxBHuLyITHOPu3jE348wsZaMpS6wmvSFRxNxpjlBkSTkToOIrPt6U";
        return "https://lh3.googleusercontent.com/aida-public/AB6AXuBgNQtZblyIzvW3oq7RphakqOQlaCAY0p8-r_uhSJACQrU6LpEwZ0kUkuU6i21NtAbUYuhfl4H7ieadwL_9qiKskLMRg8X0uG0Rx1L6CN6XAcp850dIwWMlsFr1H05pVK15q-qgpOoIqt6dLZyqoMyH6xLyLf75F3TYMOjd2w2CjgcfG4NQaZXE4C83AccCfxOVay7SnfTPVxDnzTHAZbpVZVx7iVdhK-dGabRhVKGwGwyP3xj67-C-yyW6mcWs7Q05DiCqEF1wK5Y1";
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><span className="material-symbols-outlined animate-spin text-4xl text-[#5fa5ba]">progress_activity</span></div>;

    return (
        <div className="max-w-[1200px] mx-auto w-full pb-12 animate-fade-in-up font-['Public_Sans']">
            {/* Steps Indicator */}
            <ScrollAnimation animation="fade-in" className="mb-16 mt-8">
                <div className="flex items-center justify-center gap-6 md:gap-24 relative max-w-4xl mx-auto px-4">
                    <div className="absolute top-6 left-[10%] right-[10%] h-[3px] bg-stone-100 -z-0 rounded-full"></div>
                    <div className="relative z-10 flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full border-4 border-[#5fa5ba] bg-white flex items-center justify-center text-[#5fa5ba] font-black shadow-lg shadow-[#5fa5ba]/20 scale-110">1</div>
                        <span className="text-xs font-bold text-stone-800 uppercase tracking-widest text-center mt-1">Configuration</span>
                    </div>
                    <div className="relative z-10 flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full border-4 border-stone-200 bg-white flex items-center justify-center text-stone-300 font-bold">2</div>
                        <span className="text-xs font-bold text-stone-300 uppercase tracking-widest text-center mt-1">Payment</span>
                    </div>
                    <div className="relative z-10 flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full border-4 border-stone-200 bg-white flex items-center justify-center text-stone-300 font-bold">3</div>
                        <span className="text-xs font-bold text-stone-300 uppercase tracking-widest text-center mt-1">Review</span>
                    </div>
                </div>
            </ScrollAnimation>

            <div className="mb-12 text-center px-4">
                <ScrollAnimation animation="fade-up">
                    <h1 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4 tracking-tight">Create New Contract</h1>
                    <p className="text-stone-500 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
                        Configure your care plan. Once submitted and approved by our medical board, your schedule is locked and prioritized.
                    </p>
                </ScrollAnimation>
            </div>

            <div className="space-y-24 px-4 md:px-0">
                {/* Section 1: Family Member */}
                <section>
                    <ScrollAnimation animation="fade-right">
                        <div className="mb-8 flex items-center gap-5">
                            <div className="w-14 h-14 rounded-[1.5rem] bg-[#5fa5ba] text-white flex items-center justify-center shadow-lg shadow-[#5fa5ba]/30">
                                <span className="material-symbols-outlined font-bold text-3xl">person_add</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-stone-900">Who is receiving care?</h2>
                                <p className="text-stone-500 font-medium">Select a family member for this contract</p>
                            </div>
                        </div>
                    </ScrollAnimation>
                    <ScrollAnimation animation="fade-up">
                        <div className="relative max-w-3xl">
                            <select
                                className="appearance-none w-full bg-white border-2 border-stone-100 hover:border-[#99C5D3] rounded-[2rem] px-10 py-8 text-xl font-bold focus:ring-4 focus:ring-[#99C5D3]/20 focus:border-[#5fa5ba] outline-none transition-all cursor-pointer shadow-sm text-stone-700"
                                value={selectedPatientId}
                                onChange={handlePatientChange}
                            >
                                <option value="" disabled>Select a patient</option>
                                {patients.map(p => (
                                    <option key={p.id} value={p.id}>{p.fullName} ({p.relation})</option>
                                ))}
                                <option value="add-new">+ Add New Family Member</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none text-[#5fa5ba] text-4xl font-bold">expand_more</span>
                        </div>
                    </ScrollAnimation>
                </section>

                {/* Section 2: Service Package */}
                <section>
                    <ScrollAnimation animation="fade-right">
                        <div className="mb-10 flex items-center gap-5">
                            <div className="w-14 h-14 rounded-[1.5rem] bg-[#5fa5ba] text-white flex items-center justify-center shadow-lg shadow-[#5fa5ba]/30">
                                <span className="material-symbols-outlined font-bold text-3xl">medical_services</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-stone-900">Choose a Service Package</h2>
                                <p className="text-stone-500 font-medium">Find the right level of support for your needs</p>
                            </div>
                        </div>
                    </ScrollAnimation>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {packages.map((pkg, idx) => (
                            <ScrollAnimation key={pkg.id} animation="fade-up" delay={idx * 0.1} className="h-full">
                                <label className="relative cursor-pointer group h-full block">
                                    <input
                                        className="peer sr-only"
                                        name="package"
                                        type="radio"
                                        value={pkg.id}
                                        checked={selectedPackageId == pkg.id}
                                        onChange={() => setSelectedPackageId(pkg.id)}
                                    />
                                    <div className="h-full bg-white border-2 border-transparent rounded-[2.5rem] p-8 transition-all duration-300 shadow-sm hover:shadow-xl peer-checked:border-[#5fa5ba] peer-checked:bg-[#E0F2F1]/30 peer-checked:shadow-lg flex flex-col gap-6 ring-1 ring-stone-100 peer-checked:ring-0">
                                        <div className="aspect-[4/3] rounded-[2rem] bg-cover bg-center grayscale-[20%] group-hover:grayscale-0 transition-all shadow-md" style={{ backgroundImage: `url("${getPackageImage(pkg.name)}")` }}></div>
                                        <div className="space-y-2">
                                            <h3 className="font-bold text-2xl text-stone-900 group-peer-checked:text-[#00695C]">{pkg.name}</h3>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-4xl font-black text-[#5fa5ba]">${pkg.pricePerHour ?? pkg.PricePerHour ?? 0}</span>
                                                <span className="text-stone-400 font-bold text-sm">/hr</span>
                                            </div>
                                            <p className="text-stone-500 text-sm mt-2">{pkg.description}</p>
                                        </div>
                                    </div>
                                </label>
                            </ScrollAnimation>
                        ))}
                    </div>
                </section>

                {/* Section 3: Caregiver */}
                <section>
                    <ScrollAnimation animation="fade-right">
                        <div className="mb-10 flex items-center gap-5">
                            <div className="w-14 h-14 rounded-[1.5rem] bg-[#5fa5ba] text-white flex items-center justify-center shadow-lg shadow-[#5fa5ba]/30">
                                <span className="material-symbols-outlined font-bold text-3xl">groups</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-stone-900">Select Fixed Caregiver (Optional)</h2>
                                <p className="text-stone-500 font-medium">Choose your dedicated professional for consistent care</p>
                            </div>
                        </div>
                    </ScrollAnimation>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {caregivers.slice(0, 4).map((cg, idx) => (
                            <ScrollAnimation key={cg.id} animation="fade-up" delay={idx * 0.1}>
                                <div className={`bg-white p-8 rounded-[2.5rem] border ${selectedCaregiverId == cg.id ? 'border-[#5fa5ba] ring-4 ring-[#E0F2F1]' : 'border-stone-100'} flex items-center gap-6 group hover:border-[#5fa5ba] transition-all shadow-sm hover:shadow-lg cursor-pointer`} onClick={() => setSelectedCaregiverId(cg.id)}>
                                    <div className="w-28 h-28 rounded-[2rem] bg-cover bg-center flex-shrink-0 shadow-md" style={{ backgroundImage: `url("${cg.image || 'https://via.placeholder.com/150'}")` }}></div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-xl text-stone-900">{cg.fullName}</h4>
                                                <p className="text-xs font-bold text-[#5fa5ba] mt-0.5 uppercase tracking-wide">{cg.specialization || 'General Care'}</p>
                                            </div>
                                            <div className="flex items-center gap-1 bg-[#E0F2F1] px-2 py-1 rounded-lg">
                                                <span className="material-symbols-outlined text-[#00695C] text-xs font-bold">star</span>
                                                <span className="text-xs font-black text-[#00695C]">4.9</span>
                                            </div>
                                        </div>
                                        <div className="mt-6 flex items-center justify-between gap-4">
                                            <button className={`flex-1 px-6 py-3 rounded-full font-bold text-xs transition-all uppercase tracking-wider ${selectedCaregiverId == cg.id ? 'bg-[#5fa5ba] text-white shadow-lg' : 'border border-[#5fa5ba] text-[#5fa5ba] hover:bg-[#E0F2F1]'}`}>
                                                {selectedCaregiverId == cg.id ? 'Selected' : 'Select'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </ScrollAnimation>
                        ))}
                    </div>
                </section>

                {/* Section 4: Schedule */}
                <section>
                    <ScrollAnimation animation="fade-right">
                        <div className="mb-10 flex items-center gap-5">
                            <div className="w-14 h-14 rounded-[1.5rem] bg-[#5fa5ba] text-white flex items-center justify-center shadow-lg shadow-[#5fa5ba]/30">
                                <span className="material-symbols-outlined font-bold text-3xl">calendar_month</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-stone-900">Build Schedule</h2>
                                <p className="text-stone-500 font-medium">Select recurring days and daily service hours</p>
                            </div>
                        </div>
                    </ScrollAnimation>
                    <ScrollAnimation animation="fade-up">
                        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-stone-100 shadow-sm relative overflow-hidden">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10 pb-10 border-b border-stone-100">
                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-[#5fa5ba] uppercase tracking-widest">Start Date</label>
                                    <input
                                        className="w-full bg-[#E0F2F1]/50 border-none hover:bg-[#E0F2F1] rounded-[1.5rem] px-8 py-6 text-xl font-bold text-[#00695C] focus:ring-0 transition-all cursor-pointer outline-none"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-[#5fa5ba] uppercase tracking-widest">End Date</label>
                                    <input
                                        className="w-full bg-[#E0F2F1]/50 border-none hover:bg-[#E0F2F1] rounded-[1.5rem] px-8 py-6 text-xl font-bold text-[#00695C] focus:ring-0 transition-all cursor-pointer outline-none"
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        min={startDate}
                                    />
                                </div>
                            </div>

                            <p className="text-lg font-bold text-stone-900 mb-8">Preferred Days</p>
                            <div className="flex flex-wrap gap-4 mb-14">
                                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
                                    <label key={day} className="cursor-pointer group flex-1 min-w-[80px]">
                                        <input
                                            checked={days.includes(day)}
                                            onChange={() => handleDayToggle(day)}
                                            className="peer sr-only"
                                            type="checkbox"
                                        />
                                        <div className={`w-full py-4 rounded-2xl border-2 border-stone-100 peer-checked:bg-[#5fa5ba] peer-checked:text-white peer-checked:border-[#5fa5ba] transition-all font-bold text-sm text-center text-stone-400 hover:border-[#99C5D3]`}>{day}</div>
                                    </label>
                                ))}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 border-t border-stone-100 pt-10">
                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-[#5fa5ba] uppercase tracking-widest flex items-center gap-2">
                                        <span className="material-symbols-outlined text-xl">schedule</span> Start Time
                                    </label>
                                    <input
                                        className="w-full bg-[#E0F2F1]/50 border-none hover:bg-[#E0F2F1] rounded-[1.5rem] px-8 py-6 text-3xl font-black text-[#00695C] focus:ring-0 transition-all cursor-pointer outline-none"
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-[#5fa5ba] uppercase tracking-widest flex items-center gap-2">
                                        <span className="material-symbols-outlined text-xl">hourglass_bottom</span> End Time
                                    </label>
                                    <input
                                        className="w-full bg-[#E0F2F1]/50 border-none hover:bg-[#E0F2F1] rounded-[1.5rem] px-8 py-6 text-3xl font-black text-[#00695C] focus:ring-0 transition-all cursor-pointer outline-none"
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </ScrollAnimation>
                </section>

                {/* Section 5: Cost Summary */}
                <section className="pb-8">
                    <ScrollAnimation animation="fade-right">
                        <div className="mb-10 flex items-center gap-5">
                            <div className="w-14 h-14 rounded-[1.5rem] bg-[#5fa5ba] text-white flex items-center justify-center shadow-lg shadow-[#5fa5ba]/30">
                                <span className="material-symbols-outlined font-bold text-3xl">receipt_long</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-stone-900">Cost Summary</h2>
                                <p className="text-stone-500 font-medium">Review and finalize your care commitment</p>
                            </div>
                        </div>
                    </ScrollAnimation>
                    <ScrollAnimation animation="scale-up">
                        <div className="bg-[#5fa5ba] p-10 md:p-14 rounded-[3rem] shadow-2xl shadow-[#5fa5ba]/30 relative overflow-hidden text-white">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-bl-[10rem] pointer-events-none"></div>
                            <div className="space-y-8 relative z-10 text-white">
                                <div className="flex justify-between items-center pb-8 border-b border-white/20">
                                    <span className="text-white/80 font-bold text-lg md:text-xl">Selected Package</span>
                                    <span className="font-bold text-2xl md:text-3xl tracking-tight">{selectedPackage ? selectedPackage.name : 'None Selected'}</span>
                                </div>
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-white/80 font-bold text-lg">Hourly Rate</span>
                                    <span className="font-bold text-xl">${selectedPackage ? (selectedPackage.pricePerHour ?? selectedPackage.PricePerHour) : 0}</span>
                                </div>
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-white/80 font-bold text-lg">Schedule</span>
                                    <span className="font-bold text-xl">{days.length} Days/Week ({startTime} - {endTime})</span>
                                </div>

                                <div className="pt-10 mt-6 border-t border-white/10 flex flex-col lg:flex-row justify-between items-center gap-10">
                                    <div className="text-center lg:text-left">
                                        <p className="text-white/70 font-bold uppercase tracking-[0.2em] text-xs mb-2">Estimated Total</p>
                                        <p className="text-6xl md:text-7xl font-bold tracking-tight">${calculateTotal()}</p>
                                    </div>
                                    <div className="w-full lg:w-auto">
                                        <button
                                            onClick={handleProceed}
                                            disabled={submitting}
                                            className="w-full px-12 py-6 rounded-full bg-white text-[#5fa5ba] font-bold text-xl hover:scale-105 active:scale-95 shadow-xl transition-all flex items-center justify-center gap-4 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {submitting ? 'Processing...' : 'Proceed to Payment'}
                                            {!submitting && <span className="material-symbols-outlined font-black text-2xl">arrow_forward</span>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollAnimation>
                </section>
            </div>

            <AddMemberModal
                isOpen={isAddMemberModalOpen}
                onClose={() => setIsAddMemberModalOpen(false)}
                onPatientAdded={async () => {
                    const data = await familyApi.getPatients();
                    setPatients(data);
                    if (data.length > 0) setSelectedPatientId(data[data.length - 1].id);
                    setIsAddMemberModalOpen(false);
                }}
            />
        </div>
    );
};

export default CreateContract;
