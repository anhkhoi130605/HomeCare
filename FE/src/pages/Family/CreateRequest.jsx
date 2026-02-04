import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { familyApi, serviceApi, careRequestApi } from '@/lib/api';

const CreateRequest = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [selectedPatient, setSelectedPatient] = useState('');
    const [selectedService, setSelectedService] = useState('');
    const [requestType, setRequestType] = useState(0); // 0 = OneTime, 1 = Recurring
    const [requestedDate, setRequestedDate] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [patientsData, servicesData] = await Promise.all([
                    familyApi.getPatients(),
                    serviceApi.getAll()
                ]);
                setPatients(patientsData || []);
                setServices(servicesData || []);

                // Set default date to tomorrow
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                setRequestedDate(tomorrow.toISOString().split('T')[0]);

                // Auto-select first patient and service if available
                if (patientsData?.length > 0) {
                    setSelectedPatient(patientsData[0].id.toString());
                }
                if (servicesData?.length > 0) {
                    setSelectedService(servicesData[0].id.toString());
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPatient || !selectedService) {
            alert('Please select a patient and service');
            return;
        }

        try {
            setSubmitting(true);
            await careRequestApi.create({
                patientId: parseInt(selectedPatient),
                serviceId: parseInt(selectedService),
                type: requestType,
                requestedDate: requestedDate,
                startTime: startTime,
                endTime: endTime,
                notes: notes || null
            });
            navigate('/family/requests', { state: { success: true } });
        } catch (error) {
            console.error("Failed to create request:", error);
            alert("Failed to submit request: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-[#5fa5ba] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-24 font-['Public_Sans']">

            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tight">Create New Care Request</h1>
                    <p className="text-xs font-bold text-[#5fa5ba] uppercase tracking-widest mt-1">Let's set up the best care plan for your loved one</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10 animate-fade-in-up">

                {/* Section 1: Who is the care for? */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E0F2F1] text-[#00695C] flex items-center justify-center border border-[#B2EBF2]">
                            <span className="material-symbols-outlined">person</span>
                        </div>
                        <h2 className="text-xl font-bold text-stone-900">1. Who is the care for?</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {patients.length === 0 ? (
                            <div className="col-span-2 text-center py-8 bg-stone-50 rounded-2xl">
                                <p className="text-stone-500">No patients found.</p>
                                <Link to="/family/patients" className="text-[#5fa5ba] font-bold mt-2 inline-block">Add a patient first</Link>
                            </div>
                        ) : (
                            patients.map((patient) => (
                                <div key={patient.id} className="relative">
                                    <input
                                        checked={selectedPatient === patient.id.toString()}
                                        onChange={() => setSelectedPatient(patient.id.toString())}
                                        className="hidden peer"
                                        id={`patient-${patient.id}`}
                                        name="patient"
                                        type="radio"
                                    />
                                    <label
                                        className="flex items-center gap-4 p-5 bg-white border-2 border-stone-100 rounded-[2rem] cursor-pointer hover:border-[#B2EBF2] transition-all peer-checked:border-[#5fa5ba] peer-checked:bg-[#E0F2F1]/30 hover:shadow-md"
                                        htmlFor={`patient-${patient.id}`}
                                    >
                                        <div className="w-16 h-16 rounded-2xl bg-[#5fa5ba] flex items-center justify-center text-white text-2xl font-bold">
                                            {patient.fullName?.[0] || 'P'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-stone-900 text-lg">{patient.fullName}</p>
                                            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                                                {patient.relationship || 'Family Member'} • Age {patient.age || 'N/A'}
                                            </p>
                                        </div>
                                        <span className="material-symbols-outlined ml-auto text-[#5fa5ba] opacity-0 peer-checked:opacity-100 font-bold scale-110">check_circle</span>
                                    </label>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Section 2: Select Service */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E0F2F1] text-[#00695C] flex items-center justify-center border border-[#B2EBF2]">
                            <span className="material-symbols-outlined">monitor_heart</span>
                        </div>
                        <h2 className="text-xl font-bold text-stone-900">2. Level of Care Required</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {services.map((service) => (
                            <div key={service.id} className="relative h-full">
                                <input
                                    checked={selectedService === service.id.toString()}
                                    onChange={() => setSelectedService(service.id.toString())}
                                    className="hidden peer"
                                    id={`service-${service.id}`}
                                    name="service"
                                    type="radio"
                                />
                                <label
                                    className="flex flex-col p-8 bg-white border-2 border-stone-100 rounded-[2.5rem] cursor-pointer hover:border-[#B2EBF2] transition-all peer-checked:border-[#5fa5ba] peer-checked:bg-[#E0F2F1]/30 h-full hover:shadow-lg hover:-translate-y-1"
                                    htmlFor={`service-${service.id}`}
                                >
                                    <span className="material-symbols-outlined text-4xl text-[#5fa5ba] mb-6">healing</span>
                                    <p className="font-bold text-stone-900 text-lg">{service.name}</p>
                                    <p className="text-xs text-stone-500 mt-3 leading-relaxed font-medium">{service.description}</p>
                                    {service.pricePerHour > 0 && (
                                        <p className="text-[#5fa5ba] font-bold mt-4">${service.pricePerHour}/hour</p>
                                    )}
                                </label>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section 3: Request Type */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E0F2F1] text-[#00695C] flex items-center justify-center border border-[#B2EBF2]">
                            <span className="material-symbols-outlined">event_repeat</span>
                        </div>
                        <h2 className="text-xl font-bold text-stone-900">3. Request Type</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative">
                            <input
                                checked={requestType === 0}
                                onChange={() => setRequestType(0)}
                                className="hidden peer"
                                id="type-onetime"
                                name="requestType"
                                type="radio"
                            />
                            <label
                                className="flex items-center gap-4 p-5 bg-white border-2 border-stone-100 rounded-[2rem] cursor-pointer hover:border-[#B2EBF2] transition-all peer-checked:border-[#5fa5ba] peer-checked:bg-[#E0F2F1]/30"
                                htmlFor="type-onetime"
                            >
                                <span className="material-symbols-outlined text-3xl text-[#5fa5ba]">event</span>
                                <div>
                                    <p className="font-bold text-stone-900">One-Time Visit</p>
                                    <p className="text-xs text-stone-500">Single care session</p>
                                </div>
                            </label>
                        </div>
                        <div className="relative">
                            <input
                                checked={requestType === 1}
                                onChange={() => setRequestType(1)}
                                className="hidden peer"
                                id="type-recurring"
                                name="requestType"
                                type="radio"
                            />
                            <label
                                className="flex items-center gap-4 p-5 bg-white border-2 border-stone-100 rounded-[2rem] cursor-pointer hover:border-[#B2EBF2] transition-all peer-checked:border-[#5fa5ba] peer-checked:bg-[#E0F2F1]/30"
                                htmlFor="type-recurring"
                            >
                                <span className="material-symbols-outlined text-3xl text-[#5fa5ba]">event_repeat</span>
                                <div>
                                    <p className="font-bold text-stone-900">Recurring Care</p>
                                    <p className="text-xs text-stone-500">Regular scheduled visits</p>
                                </div>
                            </label>
                        </div>
                    </div>
                </section>

                {/* Section 4: Preferred Schedule */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E0F2F1] text-[#00695C] flex items-center justify-center border border-[#B2EBF2]">
                            <span className="material-symbols-outlined">calendar_month</span>
                        </div>
                        <h2 className="text-xl font-bold text-stone-900">4. Preferred Schedule</h2>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 grid grid-cols-1 md:grid-cols-3 gap-8 shadow-sm">
                        <div className="space-y-4">
                            <label className="text-[11px] font-black uppercase tracking-widest text-stone-400 ml-2">Desired Start Date</label>
                            <input
                                value={requestedDate}
                                onChange={(e) => setRequestedDate(e.target.value)}
                                className="w-full rounded-[1.5rem] border-stone-200 py-4 px-6 text-sm font-bold text-stone-800 focus:ring-4 focus:ring-[#E0F2F1] focus:border-[#5fa5ba] transition-all outline-none"
                                type="date"
                                required
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[11px] font-black uppercase tracking-widest text-stone-400 ml-2">Start Time</label>
                            <input
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full rounded-[1.5rem] border-stone-200 py-4 px-6 text-sm font-bold text-stone-800 focus:ring-4 focus:ring-[#E0F2F1] focus:border-[#5fa5ba] transition-all outline-none"
                                type="time"
                                required
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[11px] font-black uppercase tracking-widest text-stone-400 ml-2">End Time</label>
                            <input
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full rounded-[1.5rem] border-stone-200 py-4 px-6 text-sm font-bold text-stone-800 focus:ring-4 focus:ring-[#E0F2F1] focus:border-[#5fa5ba] transition-all outline-none"
                                type="time"
                                required
                            />
                        </div>
                    </div>
                </section>

                {/* Section 5: Additional Notes */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E0F2F1] text-[#00695C] flex items-center justify-center border border-[#B2EBF2]">
                            <span className="material-symbols-outlined">description</span>
                        </div>
                        <h2 className="text-xl font-bold text-stone-900">5. Additional Notes</h2>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm">
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full rounded-[1.5rem] border-stone-200 p-6 text-sm font-medium focus:ring-4 focus:ring-[#E0F2F1] focus:border-[#5fa5ba] transition-all min-h-[120px] outline-none text-stone-700 placeholder:text-stone-400"
                            placeholder="Please share any specific care requirements, medical conditions, or preferences..."
                        ></textarea>
                    </div>
                </section>

                {/* Footer Buttons */}
                <div className="flex flex-col items-center pt-8 space-y-8">
                    <p className="text-sm text-stone-400 max-w-md text-center font-medium leading-relaxed">
                        By submitting this request, our care coordination team will review and reach out to you within 2-4 hours.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
                        <Link to="/family/requests" className="px-10 py-4 text-sm font-black text-stone-400 hover:text-stone-600 transition-colors uppercase tracking-widest text-center">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting || patients.length === 0}
                            className="px-16 py-5 bg-[#5fa5ba] text-white text-base font-black rounded-full shadow-xl shadow-[#5fa5ba]/20 hover:bg-[#4d8ca0] hover:-translate-y-1 transition-all uppercase tracking-widest active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    Submit Request
                                    <span className="material-symbols-outlined font-bold">send</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreateRequest;
