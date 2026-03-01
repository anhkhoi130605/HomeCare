import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { familyApi, serviceApi, careRequestApi } from '@/lib/api';
import { toast } from 'sonner';

const CreateRequest = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const serviceIdParam = searchParams.get('service_id');

    const [patients, setPatients] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [requestType, setRequestType] = useState('One-time'); // 'One-time' or 'Recurring'
    const [requestedDate, setRequestedDate] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [duration, setDuration] = useState(2); // hours
    const [notes, setNotes] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const patientsData = await familyApi.getPatients();
                setPatients(patientsData || []);

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

                // Set default date to tomorrow
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                setRequestedDate(tomorrow.toISOString().split('T')[0]);

            } catch (error) {
                console.error("Failed to fetch data:", error);
                toast.error("Failed to load request data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [serviceIdParam]);

    const totalPrice = useMemo(() => {
        if (!selectedService) return 0;
        const price = selectedService.pricePerHour || selectedService.price || 0;
        return price * duration;
    }, [selectedService, duration]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPatientId) {
            toast.error('Please select a patient');
            return;
        }
        if (!selectedService) {
            toast.error('Please select a service');
            return;
        }

        try {
            setSubmitting(true);

            // Format start_time as HH:mm:00
            const formattedStartTime = startTime.includes(':') && startTime.split(':').length === 2
                ? `${startTime}:00`
                : startTime;

            // Calculate end time
            const [hours, minutes] = startTime.split(':').map(Number);
            const endHours = (hours + parseInt(duration)) % 24;
            const formattedEndTime = `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;

            const payload = {
                // Snake case
                service_id: parseInt(selectedService.id),
                patient_id: parseInt(selectedPatientId),
                date: requestedDate,
                start_time: formattedStartTime,
                end_time: formattedEndTime,
                duration: parseInt(duration),
                special_note: notes || null,
                type: requestType.toLowerCase() === 'one-time' ? 0 : 1, // Enum mapping if needed

                // Camel case
                serviceId: parseInt(selectedService.id),
                patientId: parseInt(selectedPatientId),
                requestedDate: requestedDate,
                startTime: formattedStartTime,
                endTime: formattedEndTime,
                notes: notes || null,
                requestType: requestType.toLowerCase() === 'one-time' ? 0 : 1
            };

            await careRequestApi.create(payload);
            toast.success("Care request created successfully!");
            navigate('/family/requests');
        } catch (error) {
            console.error("Failed to create request:", error);
            toast.error("Failed to submit request: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-12 h-12 border-4 border-[#5fa5ba] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-stone-500 font-medium">Loading request form...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-24 font-['Public_Sans']">

            {/* Header */}
            <div className="mb-12">
                <h1 className="text-4xl font-black text-stone-900 tracking-tight">Create New Care Request</h1>
                <p className="text-stone-500 font-medium mt-2">Set up the perfect care plan for your family member</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-12 animate-fade-in-up">

                {/* 1. Who is the care for? */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E0F2F1] text-[#00695C] flex items-center justify-center border border-[#B2EBF2]">
                            <span className="material-symbols-outlined">person</span>
                        </div>
                        <h2 className="text-xl font-bold text-stone-900">1. Who is the care for?</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {patients.length === 0 ? (
                            <div className="col-span-2 text-center py-8 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200">
                                <p className="text-stone-500">No patients found.</p>
                                <Link to="/family/patients" className="text-[#5fa5ba] font-bold mt-2 inline-block hover:underline">Add a patient first</Link>
                            </div>
                        ) : (
                            patients.map((patient) => (
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
                                        className="flex items-center gap-4 p-5 bg-white border-2 border-stone-100 rounded-[2rem] cursor-pointer hover:border-[#B2EBF2] transition-all peer-checked:border-[#5fa5ba] peer-checked:bg-[#E0F2F1]/30 hover:shadow-md h-full"
                                        htmlFor={`patient-${patient.id}`}
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-[#5fa5ba] flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-sm">
                                            {patient.fullName?.[0] || 'P'}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-stone-800 text-lg truncate">{patient.fullName}</p>
                                            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                                                {patient.relationship || 'Family Member'} • Age {patient.age || 'N/A'}
                                            </p>
                                        </div>
                                        <span className="material-symbols-outlined ml-auto text-[#5fa5ba] opacity-0 peer-checked:opacity-100 font-bold">check_circle</span>
                                    </label>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* 2. Selected Service (Summary) */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E0F2F1] text-[#00695C] flex items-center justify-center border border-[#B2EBF2]">
                            <span className="material-symbols-outlined">medical_services</span>
                        </div>
                        <h2 className="text-xl font-bold text-stone-900">2. Selected Service</h2>
                    </div>
                    {selectedService ? (
                        <div className="bg-white border-2 border-stone-100 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border-l-8 border-l-[#5fa5ba]">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-2xl bg-[#5fa5ba] flex items-center justify-center text-white shrink-0">
                                    <span className="material-symbols-outlined text-4xl">healing</span>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-stone-900">{selectedService.name}</h3>
                                    <p className="text-stone-500 font-medium text-sm mt-1">{selectedService.description}</p>
                                    <div className="flex items-center gap-2 mt-3">
                                        <span className="bg-[#E0F2F1] text-[#00695C] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                            ${selectedService.pricePerHour || selectedService.price}/hour
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <Link
                                to="/family/services"
                                className="px-6 py-3 border-2 border-stone-200 rounded-full text-sm font-bold text-stone-600 hover:bg-stone-50 hover:border-stone-300 transition-all flex items-center gap-2 whitespace-nowrap"
                            >
                                <span className="material-symbols-outlined text-sm">swap_horiz</span>
                                Change Service
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-center">
                            <p className="text-red-600 font-bold mb-3">No service selected</p>
                            <Link to="/family/services" className="bg-red-600 text-white px-6 py-2 rounded-full text-sm font-bold">Browse Services</Link>
                        </div>
                    )}
                </section>

                {/* 3. Request Type */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E0F2F1] text-[#00695C] flex items-center justify-center border border-[#B2EBF2]">
                            <span className="material-symbols-outlined">event_repeat</span>
                        </div>
                        <h2 className="text-xl font-bold text-stone-900">3. Request Type</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {['One-time', 'Recurring'].map((type) => (
                            <div key={type} className="relative">
                                <input
                                    checked={requestType === type}
                                    onChange={() => setRequestType(type)}
                                    className="hidden peer"
                                    id={`type-${type}`}
                                    name="requestType"
                                    type="radio"
                                />
                                <label
                                    className="flex items-center gap-4 p-5 bg-white border-2 border-stone-100 rounded-[2rem] cursor-pointer hover:border-[#B2EBF2] transition-all peer-checked:border-[#5fa5ba] peer-checked:bg-[#E0F2F1]/30 h-full"
                                    htmlFor={`type-${type}`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${requestType === type ? 'bg-[#5fa5ba] text-white' : 'bg-stone-50 text-stone-400'}`}>
                                        <span className="material-symbols-outlined">{type === 'One-time' ? 'calendar_today' : 'sync'}</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-stone-800">{type} Visit</p>
                                        <p className="text-[11px] text-stone-500 font-medium">{type === 'One-time' ? 'A single nursing/care session' : 'Regularly scheduled visits'}</p>
                                    </div>
                                    <span className="material-symbols-outlined ml-auto text-[#5fa5ba] opacity-0 peer-checked:opacity-100 font-bold">check_circle</span>
                                </label>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 4. Preferred Schedule */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E0F2F1] text-[#00695C] flex items-center justify-center border border-[#B2EBF2]">
                            <span className="material-symbols-outlined">calendar_month</span>
                        </div>
                        <h2 className="text-xl font-bold text-stone-900">4. Preferred Schedule</h2>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] border-2 border-stone-100 grid grid-cols-1 md:grid-cols-3 gap-8 shadow-sm">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[2px] text-stone-400 ml-2">Desired Date</label>
                            <input
                                value={requestedDate}
                                onChange={(e) => setRequestedDate(e.target.value)}
                                className="w-full bg-stone-50 rounded-2xl border-none py-4 px-6 text-sm font-bold text-stone-800 focus:ring-4 focus:ring-[#E0F2F1] transition-all outline-none"
                                type="date"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[2px] text-stone-400 ml-2">Start Time</label>
                            <input
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full bg-stone-50 rounded-2xl border-none py-4 px-6 text-sm font-bold text-stone-800 focus:ring-4 focus:ring-[#E0F2F1] transition-all outline-none"
                                type="time"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[2px] text-stone-400 ml-2">Duration (Hours)</label>
                            <select
                                value={duration}
                                onChange={(e) => setDuration(parseInt(e.target.value))}
                                className="w-full bg-stone-50 rounded-2xl border-none py-4 px-6 text-sm font-bold text-stone-800 focus:ring-4 focus:ring-[#E0F2F1] transition-all outline-none appearance-none"
                            >
                                {[1, 2, 3, 4, 6, 8, 12, 24].map(h => (
                                    <option key={h} value={h}>{h} {h === 1 ? 'hour' : 'hours'}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </section>

                {/* 5. Additional Notes */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E0F2F1] text-[#00695C] flex items-center justify-center border border-[#B2EBF2]">
                            <span className="material-symbols-outlined">description</span>
                        </div>
                        <h2 className="text-xl font-bold text-stone-900">5. Additional Notes</h2>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border-2 border-stone-100 shadow-sm focus-within:border-[#5fa5ba] transition-all">
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full border-none p-2 text-sm font-medium focus:ring-0 transition-all min-h-[120px] outline-none text-stone-700 placeholder:text-stone-400 bg-transparent"
                            placeholder="Tell us about specific needs, allergies, medical history, or instructions..."
                        ></textarea>
                    </div>
                </section>

                {/* 6. Price Summary */}
                <section className="bg-[#5fa5ba] rounded-[3rem] p-10 text-white shadow-2xl shadow-[#5fa5ba]/30 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <span className="material-symbols-outlined text-[120px]">payments</span>
                    </div>
                    <div className="relative z-10 w-full md:w-2/3">
                        <h2 className="text-xl font-bold opacity-80 mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined">receipt_long</span>
                            Price Summary
                        </h2>
                        <div className="flex justify-between items-end gap-12">
                            <div>
                                <p className="text-4xl font-black">{duration} hours × ${selectedService?.pricePerHour || selectedService?.price || 0}</p>
                                <p className="text-sm font-bold opacity-60 uppercase tracking-[2px] mt-2">Professional care rate</p>
                            </div>
                            <div className="text-right">
                                <p className="text-5xl font-black">${totalPrice}</p>
                                <p className="text-xs font-bold opacity-60 uppercase tracking-[2px] mt-2">Total Estimated</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 7. Footer Action */}
                <div className="flex flex-col items-center pt-8 gap-8">
                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                        <Link
                            to="/family/services"
                            className="px-10 py-5 text-sm font-black text-stone-400 hover:text-stone-600 transition-colors uppercase tracking-[3px] text-center"
                        >
                            Back to Services
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting || patients.length === 0}
                            className="px-20 py-5 bg-[#5fa5ba] text-white text-lg font-black rounded-full shadow-2xl shadow-[#5fa5ba]/30 hover:bg-[#4d8ca0] hover:-translate-y-1 active:scale-95 transition-all uppercase tracking-[4px] flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {submitting ? (
                                <>
                                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    Confirm Booking
                                    <span className="material-symbols-outlined font-bold group-hover:translate-x-2 transition-transform">arrow_forward</span>
                                </>
                            )}
                        </button>
                    </div>
                    <div className="flex items-center gap-3 text-stone-400">
                        <span className="material-symbols-outlined text-sm">security</span>
                        <p className="text-[11px] font-bold uppercase tracking-wider">Secure booking • No hidden fees • Verified Caregivers</p>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreateRequest;
