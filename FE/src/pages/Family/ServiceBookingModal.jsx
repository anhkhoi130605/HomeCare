import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { familyApi, careRequestApi } from '@/lib/api';
import { formatDateToYYYYMMDD } from '@/lib/utils';
import { toast } from 'sonner';

const ServiceBookingModal = ({ isOpen, onClose, service }) => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        patient_id: '',
        date: formatDateToYYYYMMDD(new Date()),
        start_time: '09:00',
        duration: 2,
        special_note: ''
    });

    useEffect(() => {
        if (isOpen) {
            const fetchPatients = async () => {
                try {
                    const data = await familyApi.getPatients();
                    setPatients(data || []);
                    if (data && data.length > 0) {
                        setFormData(prev => ({ ...prev, patient_id: data[0].id }));
                    }
                } catch (error) {
                    console.error("Failed to fetch patients:", error);
                }
            };
            fetchPatients();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const totalEstimatedCost = (service?.price || 0) * (formData.duration || 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.patient_id) {
            toast.error("Please select a patient");
            return;
        }

        try {
            setLoading(true);
            const requestData = {
                // CamelCase (Working in other pages)
                serviceId: service.id,
                patientId: parseInt(formData.patient_id),
                requestedDate: formData.date,
                startTime: `${formData.start_time}:00`, // Ensure HH:mm:ss format
                duration: Number(formData.duration),
                notes: formData.special_note,

                // Snake_case (Requested by user, keeping for compatibility)
                service_id: service.id,
                patient_id: parseInt(formData.patient_id),
                date: formData.date,
                start_time: `${formData.start_time}:00`,
                special_note: formData.special_note
            };

            const response = await careRequestApi.create(requestData);
            toast.success("Request created! Redirecting to payment...");

            // Step 4: BE returns id, navigate to payment/:id
            const requestId = response.id || response.request_id || 123;
            navigate(`/payment/${requestId}`);
        } catch (error) {
            console.error("Booking error:", error);
            toast.error(error.message || "Failed to create request");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4 animate-fade-in">
            {/* Modal Container */}
            <div className="bg-white rounded-[2.5rem] w-full max-w-5xl max-h-[95vh] shadow-2xl overflow-hidden flex flex-col lg:flex-row relative animate-scale-up font-['Public_Sans']">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-20 bg-white/80 hover:bg-white transition-all p-2 rounded-full shadow-lg border border-stone-100"
                >
                    <span className="material-symbols-outlined text-stone-600">close</span>
                </button>

                {/* Left Panel: Hero Image & Info */}
                <div className="lg:w-5/12 relative overflow-hidden bg-stone-100 hidden lg:block">
                    <div
                        className="h-full w-full bg-center bg-no-repeat bg-cover absolute inset-0 transition-transform duration-700 hover:scale-105"
                        style={{ backgroundImage: `url(${service?.image || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80'})` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/20 to-transparent"></div>
                    </div>

                    <div className="absolute bottom-8 left-8 right-8 text-white z-10">
                        <span className="bg-[#5fa5ba]/90 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4 inline-block shadow-sm backdrop-blur-md border border-white/20">
                            {service?.category || 'Daily Care'}
                        </span>
                        <h2 className="text-3xl font-extrabold mb-2 leading-tight">{service?.name || 'Service Booking'}</h2>
                        <div className="flex items-center gap-2 mt-4">
                            <span className="text-3xl font-black text-[#5fa5ba]">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(service?.price || 0)}</span>
                            <span className="text-white/80 text-sm font-medium">/ giờ</span>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Booking Form */}
                <div className="lg:w-7/12 p-8 lg:p-10 overflow-y-auto bg-white flex flex-col h-full">
                    <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
                        <div className="mb-6 bg-[#5fa5ba]/5 p-6 rounded-3xl border border-[#5fa5ba]/10">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="text-xl font-bold text-stone-900">{service?.name}</h4>
                                    <p className="text-xs font-bold text-[#5fa5ba] uppercase tracking-widest mt-1">Package Summary</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-stone-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(service?.price || 0)}</p>
                                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">/ Giờ</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#5fa5ba]/10">
                                <div>
                                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Skill Level</p>
                                    <p className="text-sm font-bold text-stone-700 opacity-60">{service?.skillLevel || 'Basic'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Duration Allowed</p>
                                    <p className="text-sm font-bold text-stone-700">{service?.durationAllowed || '2h / 4h'}</p>
                                </div>
                            </div>
                        </div>

                        <form className="space-y-6 flex-1" onSubmit={handleSubmit}>
                            {/* Patient Select */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-stone-600 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#5fa5ba] text-lg">person_heart</span>
                                    Select Patient
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full appearance-none bg-stone-50 border-none rounded-2xl py-4 pl-5 pr-12 focus:ring-2 focus:ring-[#5fa5ba]/50 text-stone-800 font-bold shadow-sm transition-all cursor-pointer hover:bg-stone-100"
                                        value={formData.patient_id}
                                        onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                                    >
                                        {patients.length > 0 ? (
                                            patients.map(p => (
                                                <option key={p.id} value={p.id}>{p.fullName || p.name}</option>
                                            ))
                                        ) : (
                                            <option disabled value="">No patients found. Add one in Patient list.</option>
                                        )}
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#5fa5ba] pointer-events-none">expand_more</span>
                                </div>
                            </div>

                            {/* Date & Time */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-stone-600 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#5fa5ba] text-lg">calendar_month</span>
                                        Date
                                    </label>
                                    <input
                                        className="w-full bg-stone-50 border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-[#5fa5ba]/50 text-sm font-bold text-stone-800 shadow-sm"
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-stone-600 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#5fa5ba] text-lg">schedule</span>
                                        Start Time
                                    </label>
                                    <input
                                        className="w-full bg-stone-50 border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-[#5fa5ba]/50 text-sm font-bold text-stone-800 shadow-sm"
                                        type="time"
                                        value={formData.start_time}
                                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Duration */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-stone-600 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#5fa5ba] text-lg">timer</span>
                                    Duration (Hours)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="1"
                                        max="24"
                                        className="w-full bg-stone-50 border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-[#5fa5ba]/50 text-sm font-bold text-stone-800 shadow-sm"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Special Instructions */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-stone-600 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#5fa5ba] text-lg">edit_note</span>
                                    Special Instructions
                                </label>
                                <textarea
                                    className="w-full bg-stone-50 border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-[#5fa5ba]/50 text-sm font-medium shadow-sm placeholder:text-stone-400 min-h-[100px] resize-none"
                                    placeholder="e.g. Please bring extra warm blankets..."
                                    value={formData.special_note}
                                    onChange={(e) => setFormData({ ...formData, special_note: e.target.value })}
                                />
                            </div>

                            {/* Cost Section */}
                            <div className="mt-8 pt-6 border-t border-stone-100 flex items-center justify-between mb-8">
                                <span className="text-sm font-bold text-stone-500">Tổng chi phí ước tính</span>
                                <span className="text-3xl font-black text-[#5fa5ba]">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalEstimatedCost)}</span>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#5fa5ba] hover:bg-[#4d8ca0] text-white font-bold py-4 rounded-full shadow-xl shadow-[#5fa5ba]/20 transform hover:-translate-y-1 transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <span>{loading ? 'Creating request...' : 'Confirm & Proceed to Payment'}</span>
                                {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceBookingModal;
