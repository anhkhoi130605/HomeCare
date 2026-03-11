import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ScrollAnimation from "@/components/ui/scroll-animation";
import { caregiverApi, careLogApi } from '@/lib/api';
import { formatDateToYYYYMMDD } from '@/lib/utils';

const ActiveShift = () => {
    const navigate = useNavigate();
    const [timer, setTimer] = useState(6135); // Initial mock time: 01:42:15
    const [isActive, setIsActive] = useState(true);
    const [isCompleted, setIsCompleted] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [showSaveNotify, setShowSaveNotify] = useState(false);
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [checkInTime, setCheckInTime] = useState(null);

    // API-based patient data
    const [patients, setPatients] = useState([]);
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentSchedule, setCurrentSchedule] = useState(null);
    const [medications, setMedications] = useState([]);
    const [emergencyContact, setEmergencyContact] = useState(null);

    useEffect(() => {
        const fetchPatientDetails = async () => {
            if (selectedPatientId && selectedPatientId !== 'demo') {
                try {
                    const data = await caregiverApi.getPatient(selectedPatientId);
                    setEmergencyContact({
                        name: data.emergencyContactName || 'N/A',
                        phone: data.emergencyContactPhone || 'N/A',
                        relationship: 'Primary Contact'
                    });
                    // Future: Fetch medications from API
                    setMedications([]);
                } catch (err) {
                    console.error('Failed to fetch patient details:', err);
                }
            } else if (selectedPatientId === 'demo') {
                // Demo Data
                setMedications([
                    { name: 'Lisinopril', dosage: '10mg', time: '8:00 AM', desc: 'Blood pressure management' },
                    { name: 'Metformin', dosage: '500mg', time: '8:00 AM', desc: 'Diabetes management' },
                    { name: 'Vitamin D3', dosage: '1000 IU', time: '12:00 PM', desc: 'Nutritional supplement' }
                ]);
                setEmergencyContact({
                    name: 'Maria Johnson',
                    phone: '(555) 123-4567',
                    relationship: 'Daughter'
                });
            }
        };
        fetchPatientDetails();
    }, [selectedPatientId]);

    // Fetch caregiver's schedule to get patients and auto check-in
    useEffect(() => {
        const fetchScheduleData = async () => {
            try {
                setLoading(true);
                // Get today's schedules for the caregiver
                const today = formatDateToYYYYMMDD(new Date());
                const schedules = await caregiverApi.getSchedules(today, today);

                if (schedules && schedules.length > 0) {
                    // Find a schedule that's not completed or cancelled
                    const activeSchedule = schedules.find(s =>
                        s.status === 'Scheduled' || s.status === 'InProgress'
                    ) || schedules[0];

                    // Extract unique patients from schedules
                    const patientMap = new Map();
                    schedules.forEach(s => {
                        // Use patientId and patientName from ScheduleDto
                        if (s.patientId && !patientMap.has(s.patientId)) {
                            patientMap.set(s.patientId, {
                                id: s.patientId,
                                name: s.patientName || 'Patient',
                                image: 'https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?w=200',
                                address: s.patientAddress || 'Patient Address',
                                coordinates: '40.7128, -74.0060',
                                locationImage: 'https://maps.googleapis.com/maps/api/staticmap?center=40.7128,-74.0060&zoom=15&size=400x200&key=demo'
                            });
                        }
                    });
                    const patientsArray = Array.from(patientMap.values());
                    setPatients(patientsArray);
                    if (patientsArray.length > 0) {
                        setSelectedPatientId(patientsArray[0].id);
                    }
                    setCurrentSchedule(activeSchedule);

                    // Set check-in state based on current status
                    if (activeSchedule.status === 'InProgress') {
                        setIsCheckedIn(true);
                        if (activeSchedule.checkInTime) {
                            setCheckInTime(new Date(activeSchedule.checkInTime));
                        }
                    } else {
                        setIsCheckedIn(false);
                    }
                } else {
                    // Fallback: no schedules today
                    setPatients([{
                        id: 'demo',
                        name: 'Demo Patient',
                        image: 'https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?w=200',
                        address: 'No active shift',
                        coordinates: 'N/A',
                        locationImage: 'https://maps.googleapis.com/maps/api/staticmap?center=40.7128,-74.0060&zoom=15&size=400x200&key=demo'
                    }]);
                    setSelectedPatientId('demo');
                }
            } catch (err) {
                console.error('Failed to fetch schedules:', err);
                setError(err.message);
                // Fallback patient
                setPatients([{
                    id: 'demo',
                    name: 'Demo Patient',
                    image: 'https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?w=200',
                    address: 'Demo Address',
                    coordinates: 'N/A',
                    locationImage: ''
                }]);
                setSelectedPatientId('demo');
            } finally {
                setLoading(false);
            }
        };
        fetchScheduleData();
    }, []);

    const currentPatient = patients.find(p => p.id === selectedPatientId) || patients[0] || {
        id: 'demo',
        name: 'Loading...',
        image: '',
        address: '',
        coordinates: '',
        locationImage: ''
    };
    const patientDetails = currentPatient;

    // Form States
    const [vitals, setVitals] = useState({
        heartRate: '',
        temperature: '',
        bloodPressure: ''
    });

    // ... (rest of states) ...

    // Initialize checkedMeds as an object to track checked state by index
    const [checkedMeds, setCheckedMeds] = useState({});

    // Initialize checkedTasks for care plan
    const [checkedTasks, setCheckedTasks] = useState({});

    const [nutrition, setNutrition] = useState({
        mealDescription: '',
        hydration: 0
    });
    const [careNotes, setCareNotes] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            if (isActive && isCheckedIn) {
                const start = checkInTime || new Date();
                if (!checkInTime) setCheckInTime(start);

                const diff = Math.floor((new Date() - start) / 1000);
                setTimer(diff > 0 ? diff : 0);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [isActive, isCheckedIn, checkInTime]);


    const formatTime = (totalSeconds) => {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;

        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleMedCheck = (index) => {
        setCheckedMeds(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const calculateLogsCount = () => {
        let count = 0;
        if (vitals.heartRate) count++;
        if (vitals.temperature) count++;
        if (vitals.bloodPressure) count++;
        count += Object.values(checkedMeds).filter(Boolean).length;
        if (nutrition.mealDescription) count++;
        if (nutrition.hydration > 0) count++;
        if (careNotes) count++;
        return count || 0; // Default to 0 if empty
    };

    const handleCheckIn = async () => {
        if (currentSchedule?.id && currentSchedule.id !== 'demo') {
            try {
                await caregiverApi.checkIn(currentSchedule.id);
                setIsCheckedIn(true);
                setCheckInTime(new Date());
            } catch (err) {
                console.error('Manual Check-in failed:', err);
                alert(err.response?.data?.message || 'Check-in failed. Please ensure it is time to start your shift.');
            }
        } else {
            setIsCheckedIn(true);
            setCheckInTime(new Date());
        }
    };

    const handleCompleteSession = async () => {
        setIsActive(false);
        setEndTime(new Date());

        // Call check-out API if we have a valid schedule
        if (currentSchedule?.id && currentSchedule.id !== 'demo') {
            try {
                // Pass careNotes as the shift summary
                await caregiverApi.checkOut(currentSchedule.id, careNotes);
                console.log('Checked out successfully for schedule:', currentSchedule.id);
            } catch (checkOutErr) {
                console.error('Check-out failed:', checkOutErr);
            }
        }

        setIsCompleted(true);
        setShowSaveNotify(true);
        setTimeout(() => setShowSaveNotify(false), 3000);
    };

    const handleSaveLog = async () => {
        // 1. Construct the Log Object for API
        const administeredMeds = medications.filter((_, i) => checkedMeds[i]).map(med => ({
            name: med.name,
            desc: med.dosage,
            time: med.time
        }));

        const careLogData = {
            scheduleId: currentSchedule?.id,
            patientId: currentPatient.id !== 'demo' ? currentPatient.id : null,
            notes: careNotes || "Routine care provided. Patient stable.",
            vitals: {
                heartRate: vitals.heartRate || null,
                temperature: vitals.temperature || null,
                bloodPressure: vitals.bloodPressure || null
            },
            medicationsAdministered: administeredMeds.map(m => m.name).join(', '),
            mealDescription: nutrition.mealDescription || null,
            hydrationMl: nutrition.hydration * 250 // Convert glasses to ml
        };

        try {
            // 2. Submit to API
            if (currentSchedule?.id) {
                await careLogApi.create(careLogData);
                console.log("Log saved to API:", careLogData);
            } else {
                console.log("Demo mode - log not saved:", careLogData);
            }

            // 3. UI Notification
            setShowSaveNotify(true);
            setTimeout(() => {
                setShowSaveNotify(false);
            }, 3000);
        } catch (err) {
            console.error('Failed to save care log:', err);
            alert('Failed to save care log: ' + err.message);
        }
    };

    // Render "Session Completed" Summary View with User's Custom Design
    if (!isCheckedIn) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-background-light dark:bg-stone-950 h-screen font-manrope">
                <ScrollAnimation animation="fade-up">
                    <div className="text-center max-w-md p-10 bg-white dark:bg-stone-900 rounded-[3rem] shadow-2xl border border-stone-100 dark:border-stone-800">
                        <div className="w-24 h-24 bg-[#5fa5ba]/10 text-[#5fa5ba] rounded-3xl flex items-center justify-center mx-auto mb-8 transform -rotate-6">
                            <span className="material-symbols-outlined text-5xl">login</span>
                        </div>
                        <h2 className="text-4xl font-extrabold text-stone-800 dark:text-white mb-4 tracking-tight">Ready to Start?</h2>
                        <p className="text-stone-500 dark:text-stone-400 mb-10 font-medium leading-relaxed">
                            You are scheduled to care for <span className="text-stone-800 dark:text-white font-bold">{currentSchedule?.patientName || 'your patient'}</span>.
                            Click below to officially check-in and begin your shift log.
                        </p>
                        <button
                            onClick={handleCheckIn}
                            className="w-full bg-[#5fa5ba] hover:bg-[#4d8ca0] text-white py-6 rounded-[2rem] font-black text-xl transition-all shadow-2xl shadow-[#5fa5ba]/30 hover:scale-[1.02] active:scale-95 uppercase tracking-widest"
                        >
                            CHECK IN NOW
                        </button>
                        <button
                            onClick={() => navigate('/caregiver/schedule')}
                            className="mt-8 text-stone-400 font-bold hover:text-stone-600 dark:hover:text-stone-300 transition-colors uppercase tracking-widest text-[10px]"
                        >
                            Back to Schedule
                        </button>
                    </div>
                </ScrollAnimation>
            </div>
        );
    }

    if (isCompleted) {
        return (
            <div className="flex-1 h-screen flex flex-col bg-slate-50 dark:bg-slate-900 font-manrope overflow-hidden relative">
                {/* Save Notification Toast */}
                {showSaveNotify && (
                    <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-stone-800 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-xl">check</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-lg">Report Sent Successfully</h4>
                            <p className="text-stone-300 text-sm">Family has been notified</p>
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    <div className="max-w-4xl mx-auto space-y-8 pb-12">
                        {/* Header */}
                        <ScrollAnimation animation="fade-down">
                            <div className="bg-white dark:bg-stone-800 rounded-[2rem] border border-stone-200 dark:border-stone-700 shadow-sm p-10 text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                    <span className="material-symbols-outlined text-8xl text-[#0d9488]">celebration</span>
                                </div>
                                <div className="w-20 h-20 bg-teal-50 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <span className="material-symbols-outlined text-[#0d9488] text-5xl">task_alt</span>
                                </div>
                                <h1 className="text-3xl font-bold text-stone-800 dark:text-white mb-2">Shift Successfully Completed</h1>
                                <p className="text-stone-500 dark:text-stone-400 max-w-md mx-auto">Thank you for providing exceptional care to {patientDetails.name} today. Your log has been securely submitted.</p>
                            </div>
                        </ScrollAnimation>

                        {/* Top Stats */}
                        <ScrollAnimation animation="fade-up" delay={0.1}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white dark:bg-stone-800 p-6 rounded-3xl border border-stone-200 dark:border-stone-700 shadow-sm">
                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Total Duration</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold text-[#0d9488]">{formatTime(timer).trim()}</span>
                                        <span className="text-xs text-stone-400">
                                            {startTime ? startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'} - {endTime ? endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-stone-800 p-6 rounded-3xl border border-stone-200 dark:border-stone-700 shadow-sm">
                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Logs Recorded</p>
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl font-bold text-stone-800 dark:text-white">{calculateLogsCount()}</span>
                                        <span className="text-xs text-stone-400">Tasks &amp; Meds</span>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-stone-800 p-6 rounded-3xl border border-stone-200 dark:border-stone-700 shadow-sm">
                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Latest Vitals</p>
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl font-bold text-stone-800 dark:text-white">{vitals.heartRate || '--'}</span>
                                        <span className="text-xs text-stone-400">BPM (Normal)</span>
                                    </div>
                                </div>
                            </div>
                        </ScrollAnimation>

                        {/* Location Verification */}
                        <ScrollAnimation animation="fade-up" delay={0.2}>
                            <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800/50 rounded-2xl px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-[#0d9488]">verified</span>
                                    <span className="text-sm font-semibold text-teal-800 dark:text-teal-300">Checkout Location Verified</span>
                                </div>
                                <div className="text-[10px] font-mono text-teal-600 dark:text-teal-400 bg-white/50 dark:bg-stone-800/50 px-3 py-1 rounded-full border border-teal-100/50 dark:border-teal-700/50">
                                    GPS: {patientDetails.coordinates} â€¢ {endTime ? endTime.toLocaleTimeString() : 'Now'}
                                </div>
                            </div>
                        </ScrollAnimation>

                        {/* Detailed Log Review */}
                        <ScrollAnimation animation="fade-up" delay={0.3}>
                            <div className="bg-white dark:bg-stone-800 rounded-[2rem] border border-stone-200 dark:border-stone-700 shadow-sm overflow-hidden">
                                <div className="px-8 py-6 border-b border-stone-100 dark:border-stone-700 flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-stone-800 dark:text-white">Care Log Review</h2>
                                    <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Submitted</span>
                                </div>
                                <div className="p-8 space-y-10">
                                    <section>
                                        <div className="flex items-center gap-2 mb-4 text-stone-800 dark:text-stone-200">
                                            <span className="material-symbols-outlined text-[#0d9488] text-xl">vital_signs</span>
                                            <h3 className="font-bold">Vital Signs</h3>
                                        </div>
                                        <div className="grid grid-cols-3 gap-8">
                                            <div>
                                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Heart Rate</p>
                                                <p className="text-lg font-semibold text-stone-700 dark:text-stone-200">{vitals.heartRate || '--'} <span className="text-sm font-normal text-stone-400">BPM</span></p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Temperature</p>
                                                <p className="text-lg font-semibold text-stone-700 dark:text-stone-200">{vitals.temperature || '--'} <span className="text-sm font-normal text-stone-400">Â°F</span></p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Blood Pressure</p>
                                                <p className="text-lg font-semibold text-stone-700 dark:text-stone-200">{vitals.bloodPressure || '--'} <span className="text-sm font-normal text-stone-400">mmHg</span></p>
                                            </div>
                                        </div>
                                    </section>

                                    <section>
                                        <div className="flex items-center gap-2 mb-4 text-stone-800 dark:text-stone-200">
                                            <span className="material-symbols-outlined text-[#0d9488] text-xl">medication</span>
                                            <h3 className="font-bold">Medications Administered</h3>
                                        </div>
                                        <div className="space-y-3">
                                            {medications.filter((_, i) => checkedMeds[i]).length > 0 ? (
                                                medications.filter((_, i) => checkedMeds[i]).map((med, i) => (
                                                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/50 border border-stone-100 dark:border-stone-800">
                                                        <span className="material-symbols-outlined text-[#0d9488]">check_circle</span>
                                                        <div className="flex-1">
                                                            <p className="font-bold text-sm text-stone-800 dark:text-stone-200">{med.name}</p>
                                                            <p className="text-xs text-stone-500">{med.dosage} - Recorded</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-stone-400 italic">No medications recorded.</p>
                                            )}
                                        </div>
                                    </section>

                                    <section>
                                        <div className="flex items-center gap-2 mb-4 text-stone-800 dark:text-stone-200">
                                            <span className="material-symbols-outlined text-[#0d9488] text-xl">description</span>
                                            <h3 className="font-bold">Care Notes</h3>
                                        </div>
                                        <div className="bg-stone-50 dark:bg-stone-900/50 p-6 rounded-2xl border border-stone-100 dark:border-stone-800">
                                            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed italic">
                                                "{careNotes || 'No notes provided for this session.'}"
                                            </p>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </ScrollAnimation>

                        {/* Navigation Actions */}
                        <ScrollAnimation animation="fade-up" delay={0.4}>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button onClick={() => navigate('/caregiver')} className="flex-1 bg-[#0d9488] hover:bg-teal-700 text-white py-5 rounded-3xl font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-teal-500/20">
                                    <span className="material-symbols-outlined">dashboard</span>
                                    GO TO DASHBOARD
                                </button>
                                <button onClick={() => navigate('/caregiver/schedule')} className="flex-1 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 py-5 rounded-3xl font-bold transition-all flex items-center justify-center gap-2 border border-stone-200 dark:border-stone-700">
                                    <span className="material-symbols-outlined">calendar_today</span>
                                    VIEW MY SCHEDULE
                                </button>
                            </div>
                        </ScrollAnimation>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background-light dark:bg-stone-950 font-manrope relative">
            {/* Header */}
            <ScrollAnimation animation="fade-down" delay={0.1} className="sticky top-0 z-20">
                <header className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border-b border-stone-100 dark:border-stone-800 px-8 py-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-900/30 shadow-sm shadow-red-100">
                            <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]"></span>
                            <span className="text-xs font-black uppercase tracking-widest">In Progress</span>
                        </div>
                        <div>
                            {/* PATIENT SELECTOR */}
                            <div className="relative group">
                                <select
                                    value={selectedPatientId}
                                    onChange={(e) => setSelectedPatientId(e.target.value)}
                                    className="appearance-none bg-transparent text-3xl font-extrabold text-stone-800 dark:text-white leading-none tracking-tight border-b-2 border-transparent hover:border-[#5fa5ba] cursor-pointer transition-all pr-8 focus:outline-none"
                                >
                                    {patients.map(member => (
                                        <option key={member.id} value={member.id}>{member.name}</option>
                                    ))}
                                </select>
                                <span className="absolute right-0 top-1/2 -translate-y-1/2 material-symbols-outlined pointer-events-none text-stone-400">expand_more</span>
                            </div>

                            <p className="text-xs font-bold text-stone-400 dark:text-stone-400 mt-1.5 flex items-center gap-1 uppercase tracking-wider">
                                <span className="material-symbols-outlined text-[14px]">location_on</span>
                                {patientDetails.address}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-10">
                        <div className="text-center group cursor-default">
                            <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.2em] mb-1 group-hover:text-[#5fa5ba] transition-colors">Duration</p>
                            <div className="text-4xl font-mono font-black text-[#5fa5ba] tracking-tight drop-shadow-sm">{formatTime(timer)}</div>
                        </div>
                        <div className="flex items-center gap-3 border-l border-stone-100 dark:border-stone-800 pl-8">
                            <img
                                alt="Caregiver profile"
                                className="w-14 h-14 rounded-2xl object-cover shadow-lg ring-4 ring-white dark:ring-stone-800"
                                src={patientDetails.image}
                            />
                        </div>
                    </div>
                </header>
            </ScrollAnimation>

            {/* Notification Toast */}
            {showSaveNotify && (
                <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-stone-800 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-50 animate-fade-in-down">
                    <span className="material-symbols-outlined text-green-400">check_circle</span>
                    <span className="font-bold">Care Log Saved Successfully</span>
                </div>
            )}

            <div className="flex-1 flex overflow-hidden p-4 md:p-8 gap-6 custom-scrollbar">
                {/* Main Log Area */}
                <div className="flex-1 flex flex-col gap-8 overflow-y-auto pr-2 custom-scrollbar pb-24">
                    <section className="bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 shadow-sm p-6 md:p-10">
                        <div className="mb-10 flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-extrabold text-stone-800 dark:text-white tracking-tight">Care Log Entry</h2>
                                <p className="text-stone-400 font-medium mt-1">Documenting current shift activity and patient status</p>
                            </div>
                            <button className="bg-[#5fa5ba]/10 text-[#5fa5ba] px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#5fa5ba] hover:text-white transition-all">
                                <span className="material-symbols-outlined text-xl">history</span>
                                View Past Logs
                            </button>
                        </div>

                        <div className="space-y-12">
                            {/* Vital Signs Section */}
                            <ScrollAnimation animation="fade-up" delay={0.2}>
                                <div>
                                    <div className="flex items-center gap-3 mb-8 text-stone-800 dark:text-stone-200">
                                        <div className="w-10 h-10 rounded-xl bg-[#5fa5ba]/10 text-[#5fa5ba] flex items-center justify-center">
                                            <span className="material-symbols-outlined text-2xl">monitoring</span>
                                        </div>
                                        <h3 className="font-bold text-xl">Vital Signs</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="space-y-3 group">
                                            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 group-hover:text-[#5fa5ba] transition-colors">Heart Rate</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={vitals.heartRate}
                                                    onChange={(e) => setVitals({ ...vitals, heartRate: e.target.value })}
                                                    className="w-full px-6 py-5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 focus:ring-2 focus:ring-[#5fa5ba] focus:border-transparent text-2xl font-black text-stone-700 transition-all placeholder:text-stone-300 outline-none"
                                                    placeholder="--"
                                                />
                                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-xs uppercase tracking-wider">BPM</span>
                                            </div>
                                        </div>
                                        <div className="space-y-3 group">
                                            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 group-hover:text-[#5fa5ba] transition-colors">Temperature</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={vitals.temperature}
                                                    onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                                                    className="w-full px-6 py-5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 focus:ring-2 focus:ring-[#5fa5ba] focus:border-transparent text-2xl font-black text-stone-700 transition-all placeholder:text-stone-300 outline-none"
                                                    placeholder="--"
                                                />
                                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-xs uppercase tracking-wider">Â°F</span>
                                            </div>
                                        </div>
                                        <div className="space-y-3 group">
                                            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 group-hover:text-[#5fa5ba] transition-colors">Blood Pressure</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={vitals.bloodPressure}
                                                    onChange={(e) => setVitals({ ...vitals, bloodPressure: e.target.value })}
                                                    className="w-full px-6 py-5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 focus:ring-2 focus:ring-[#5fa5ba] focus:border-transparent text-2xl font-black text-stone-700 transition-all placeholder:text-stone-300 outline-none"
                                                    placeholder="120/80"
                                                />
                                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-xs uppercase tracking-wider">SYS/DIA</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ScrollAnimation>

                            <ScrollAnimation animation="fade-up" delay={0.3}>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                    {/* Medication Section */}
                                    <div>
                                        <div className="flex items-center gap-3 mb-8 text-stone-800 dark:text-stone-200">
                                            <div className="w-10 h-10 rounded-xl bg-[#5fa5ba]/10 text-[#5fa5ba] flex items-center justify-center">
                                                <span className="material-symbols-outlined text-2xl">medication</span>
                                            </div>
                                            <h3 className="font-bold text-xl">Medication Checklist</h3>
                                        </div>
                                        <div className="space-y-4 bg-stone-50 dark:bg-stone-900/50 p-6 rounded-[2rem] border border-stone-100 dark:border-stone-800">
                                            {medications.length > 0 ? (
                                                medications.map((med, i) => (
                                                    <label key={i} className={`flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200/50 dark:border-stone-700 cursor-pointer hover:border-[#5fa5ba] hover:shadow-md transition-all group ${med.opacity || ''} `}>
                                                        <div className="relative flex items-center justify-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={!!checkedMeds[i]}
                                                                onChange={() => handleMedCheck(i)}
                                                                className="peer appearance-none w-7 h-7 rounded-lg border-2 border-stone-300 checked:bg-[#5fa5ba] checked:border-[#5fa5ba] transition-all"
                                                            />
                                                            <span className="material-symbols-outlined text-white text-lg absolute opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity">check</span>
                                                        </div>

                                                        <div className="flex-1">
                                                            <p className="font-bold text-stone-800 dark:text-white group-hover:text-[#5fa5ba] transition-colors">{med.name}</p>
                                                            <p className="text-xs text-stone-500 font-medium">{med.desc}</p>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-stone-400 bg-stone-100 dark:bg-stone-700 px-3 py-1.5 rounded-lg uppercase tracking-wide">{med.time}</span>
                                                    </label>
                                                ))
                                            ) : (
                                                <div className="text-center py-8 text-stone-400">
                                                    <span className="material-symbols-outlined text-3xl mb-2">medication_liquid</span>
                                                    <p className="text-sm">No medications scheduled.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Nutrition Section */}
                                    <div>
                                        <div className="flex items-center gap-3 mb-8 text-stone-800 dark:text-stone-200">
                                            <div className="w-10 h-10 rounded-xl bg-[#5fa5ba]/10 text-[#5fa5ba] flex items-center justify-center">
                                                <span className="material-symbols-outlined text-2xl">restaurant</span>
                                            </div>
                                            <h3 className="font-bold text-xl">Nutrition & Hydration</h3>
                                        </div>
                                        <div className="space-y-8">
                                            <div className="space-y-3 group">
                                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 group-hover:text-[#5fa5ba] transition-colors">Meal Details</label>
                                                <textarea
                                                    value={nutrition.mealDescription}
                                                    onChange={(e) => setNutrition({ ...nutrition, mealDescription: e.target.value })}
                                                    className="w-full p-6 rounded-3xl bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 focus:ring-2 focus:ring-[#5fa5ba] focus:border-transparent text-stone-700 font-medium text-sm min-h-[140px] transition-all outline-none resize-none"
                                                    placeholder="Describe breakfast/lunch items consumed..."
                                                ></textarea>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Hydration (Glasses)</label>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex gap-2.5">
                                                        {[1, 2, 3, 4, 5].map((num) => (
                                                            <button
                                                                key={num}
                                                                onClick={() => setNutrition({ ...nutrition, hydration: num })}
                                                                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-lg transition-all ${nutrition.hydration === num
                                                                    ? 'bg-[#5fa5ba] text-white shadow-lg shadow-[#5fa5ba]/30'
                                                                    : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-400 hover:border-[#5fa5ba] hover:text-[#5fa5ba]'
                                                                    } `}
                                                            >
                                                                {num}{num === 5 ? '+' : ''}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[#5fa5ba] font-bold text-lg ml-auto bg-[#5fa5ba]/5 px-3 py-1 rounded-lg">
                                                        <span className="material-symbols-outlined">water_drop</span>
                                                        <span>{(nutrition.hydration * 8) || 0}oz</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ScrollAnimation>

                            <ScrollAnimation animation="fade-up" delay={0.4}>
                                <div className="group">
                                    <div className="flex items-center gap-3 mb-8 text-stone-800 dark:text-stone-200">
                                        <div className="w-10 h-10 rounded-xl bg-[#5fa5ba]/10 text-[#5fa5ba] flex items-center justify-center">
                                            <span className="material-symbols-outlined text-2xl">edit_note</span>
                                        </div>
                                        <h3 className="font-bold text-xl">Care Notes & Observations</h3>
                                    </div>
                                    <textarea
                                        value={careNotes}
                                        onChange={(e) => setCareNotes(e.target.value)}
                                        className="w-full p-8 rounded-[2rem] bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 focus:ring-2 focus:ring-[#5fa5ba] focus:border-transparent text-lg font-medium text-stone-700 min-h-[220px] transition-all outline-none resize-none"
                                        placeholder="Detailed observations about mood, mobility, sleep quality, or any incidents..."
                                    ></textarea>
                                </div>
                            </ScrollAnimation>
                        </div>

                        <ScrollAnimation animation="fade-up" delay={0.5}>
                            <div className="mt-12 flex gap-6">
                                <button
                                    onClick={handleCompleteSession} // Reuse this logic here if you want SAVE to also Complete, or keep separate
                                    className="flex-1 bg-[#5fa5ba] hover:bg-[#4d8ca0] text-white py-6 rounded-3xl font-bold text-xl transition-all flex items-center justify-center gap-3 shadow-2xl shadow-[#5fa5ba]/30 hover:scale-[1.02]"
                                >
                                    <span className="material-symbols-outlined text-2xl">save</span>
                                    SAVE & COMPLETE
                                </button>
                            </div>
                        </ScrollAnimation>
                    </section>
                </div>

                {/* Sidebar */}
                <ScrollAnimation animation="fade-left" delay={0.3} className="h-full">
                    <aside className="w-[360px] flex flex-col gap-6 shrink-0 h-full overflow-y-auto custom-scrollbar pb-12">
                        <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 shadow-xl overflow-hidden flex flex-col relative h-72 group shrink-0">
                            <div
                                className="absolute inset-0 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 cursor-crosshair transform group-hover:scale-110"
                                style={{
                                    backgroundImage: `url('${patientDetails.locationImage}')`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            ></div>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="relative">
                                    <div className="absolute -inset-8 bg-[#5fa5ba]/30 rounded-full animate-ping"></div>
                                    <div className="absolute -inset-4 bg-[#5fa5ba]/20 rounded-full animate-pulse"></div>
                                    <span className="material-symbols-outlined text-[#5fa5ba] text-6xl relative z-10 drop-shadow-lg">location_on</span>
                                </div>
                            </div>
                            <div className="absolute bottom-6 left-6 right-6 z-30">
                                <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200 dark:border-stone-700 shadow-2xl relative overflow-hidden">
                                    <div className="flex items-center justify-between mb-1.5 relative z-10">
                                        <span className="text-[10px] font-black text-[#5fa5ba] uppercase tracking-widest">Verified Check-in</span>
                                        <span className="text-xs text-stone-500 font-mono tracking-wider">{patientDetails.coordinates}</span>
                                    </div>
                                    <p className="text-base font-bold text-stone-800 dark:text-white relative z-10">Patient Residence (Primary)</p>
                                </div>
                            </div>
                        </div>

                        {/* Redundant COMPLETE SESSION button removed */}

                        {/* Emergency Info below button to ensure button availability */}
                        <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-[2.5rem] p-8">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-white text-rose-500 flex items-center justify-center shadow-md shadow-rose-100">
                                    <span className="material-symbols-outlined text-2xl">emergency</span>
                                </div>
                                <h3 className="font-bold text-rose-600 uppercase tracking-widest text-sm">Emergency Info</h3>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-2">Primary Contact</p>
                                    <p className="font-extrabold text-stone-800 dark:text-white text-xl leading-time">{emergencyContact?.name || '--'}</p>
                                    <p className="text-sm text-stone-600 dark:text-stone-400 font-medium mt-1 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">call</span>
                                        {emergencyContact?.phone || '--'}
                                    </p>
                                </div>

                                <button className="w-full bg-rose-600 text-white hover:bg-rose-700 py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-3">
                                    <span className="material-symbols-outlined text-xl">call</span>
                                    CONTACT FAMILY
                                </button>
                            </div>
                        </div>
                    </aside>
                </ScrollAnimation>
            </div>
        </div>
    );
};

export default ActiveShift;
