import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { careLogApi } from '../../lib/api';

const CareLogDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [logData, setLogData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLog = async () => {
            try {
                setLoading(true);
                const data = await careLogApi.getById(id);
                setLogData(data);
            } catch (err) {
                console.error('Error fetching care log:', err);
                setError(err.message || 'Failed to load care log');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchLog();
    }, [id]);

    // Parse vital signs from JSON string or human-readable string
    const parseVitals = (vitalsString) => {
        if (!vitalsString) return null;
        try {
            return JSON.parse(vitalsString);
        } catch {
            // Fallback for string format like "HR: 75, Temp: 36.8, BP: 120/80"
            const result = {};
            const parts = vitalsString.split(',').map(p => p.trim());
            parts.forEach(part => {
                if (part.toUpperCase().startsWith('HR:')) result.heartRate = part.split(':')[1]?.trim();
                if (part.toUpperCase().startsWith('TEMP:')) result.temperature = part.split(':')[1]?.trim();
                if (part.toUpperCase().startsWith('BP:')) result.bloodPressure = part.split(':')[1]?.trim();
            });
            // Only return if we found something
            return Object.keys(result).length > 0 ? result : null;
        }
    };

    // Parse medications from string
    const parseMedications = (medsString) => {
        if (!medsString) return [];
        try {
            return JSON.parse(medsString);
        } catch {
            return medsString.split(',').map(m => ({ name: m.trim(), status: 'Administered' }));
        }
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-background-light dark:bg-stone-950">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#5fa5ba] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-stone-500 font-medium">Loading care log...</p>
                </div>
            </div>
        );
    }

    if (error || !logData) {
        return (
            <div className="flex-1 flex items-center justify-center bg-background-light dark:bg-stone-950">
                <div className="text-center">
                    <span className="material-symbols-outlined text-6xl text-red-400 mb-4">error</span>
                    <h2 className="text-2xl font-bold text-stone-800 dark:text-white mb-2">Log Not Found</h2>
                    <p className="text-stone-500 mb-4">{error}</p>
                    <Link to="/caregiver/care-logs" className="text-[#5fa5ba] font-bold">â† Back to Care Logs</Link>
                </div>
            </div>
        );
    }

    const vitals = parseVitals(logData.vitalSigns);
    const medications = parseMedications(logData.medicationsGiven);

    return (
        <div className="flex-1 overflow-y-auto bg-background-light dark:bg-stone-950 custom-scrollbar p-8 font-manrope animate-in slide-in-from-bottom-8 fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate(-1)} className="w-12 h-12 flex items-center justify-center bg-white hover:bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-full transition-all shadow-sm">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">Care Log Details</h1>
                        <p className="text-sm font-medium text-stone-500 mt-1">
                            <span className="font-bold text-[#5fa5ba]">{logData.patientName}</span> â€¢ {formatDateTime(logData.loggedAt)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-5">
                    <span className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${logData.status === 'Submitted'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                        {logData.status}
                    </span>
                    <div className="w-12 h-12 rounded-full bg-[#5fa5ba]/10 flex items-center justify-center text-[#5fa5ba] font-black shadow-sm">
                        {getInitials(logData.patientName)}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto space-y-10 pb-20">
                {/* Vital Signs */}
                {vitals && (
                    <section className="bg-white dark:bg-stone-900 p-10 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 shadow-sm">
                        <h2 className="text-xl font-bold text-stone-800 dark:text-white mb-8 flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl bg-[#5fa5ba]/10 text-[#5fa5ba] flex items-center justify-center">
                                <span className="material-symbols-outlined">monitor_heart</span>
                            </span>
                            Vital Signs
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {vitals.bloodPressure && (
                                <div className="bg-stone-50 dark:bg-stone-900/50 p-6 rounded-[2rem] border border-stone-100 dark:border-stone-800 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5">Blood Pressure</p>
                                        <p className="text-4xl font-extrabold text-stone-800 dark:text-white">{vitals.bloodPressure} <span className="text-sm text-stone-400 font-bold">mmHg</span></p>
                                    </div>
                                    <span className="material-symbols-outlined text-emerald-500 text-3xl">check_circle</span>
                                </div>
                            )}
                            {vitals.heartRate && (
                                <div className="bg-stone-50 dark:bg-stone-900/50 p-6 rounded-[2rem] border border-stone-100 dark:border-stone-800 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5">Heart Rate</p>
                                        <p className="text-4xl font-extrabold text-stone-800 dark:text-white">{vitals.heartRate} <span className="text-sm text-stone-400 font-bold">BPM</span></p>
                                    </div>
                                    <span className="material-symbols-outlined text-emerald-500 text-3xl">check_circle</span>
                                </div>
                            )}
                            {vitals.temperature && (
                                <div className="bg-stone-50 dark:bg-stone-900/50 p-6 rounded-[2rem] border border-stone-100 dark:border-stone-800 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5">Temperature</p>
                                        <p className="text-4xl font-extrabold text-stone-800 dark:text-white">{vitals.temperature} <span className="text-sm text-stone-400 font-bold">°C</span></p>
                                    </div>
                                    <span className="material-symbols-outlined text-emerald-500 text-3xl">check_circle</span>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Medication */}
                {medications.length > 0 && (
                    <section className="bg-white dark:bg-stone-900 p-10 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 shadow-sm">
                        <h2 className="text-xl font-bold text-stone-800 dark:text-white mb-8 flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl bg-[#5fa5ba]/10 text-[#5fa5ba] flex items-center justify-center">
                                <span className="material-symbols-outlined">medication</span>
                            </span>
                            Medication Administration
                        </h2>
                        <div className="bg-stone-50 dark:bg-stone-900/50 rounded-[2rem] border border-stone-200 dark:border-stone-700 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-white dark:bg-stone-800 border-b border-stone-100 dark:border-stone-700">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest">Medication</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                    {medications.map((med, i) => (
                                        <tr key={i}>
                                            <td className="px-8 py-5 font-bold text-stone-800 dark:text-white">{med.name || med}</td>
                                            <td className="px-8 py-5 text-right">
                                                <span className="inline-flex items-center gap-1.5 text-emerald-600 font-black text-[10px] uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-lg">
                                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                                    {med.status || 'Given'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {/* Activities & Meals */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Activities */}
                    {logData.activities && (
                        <section className="bg-white dark:bg-stone-900 p-10 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 shadow-sm">
                            <h2 className="text-xl font-bold text-stone-800 dark:text-white mb-6 flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-[#5fa5ba]/10 text-[#5fa5ba] flex items-center justify-center">
                                    <span className="material-symbols-outlined">task_alt</span>
                                </span>
                                Activities
                            </h2>
                            <div className="bg-stone-50 dark:bg-stone-900/50 p-6 rounded-[2rem] border border-stone-100 dark:border-stone-800">
                                <p className="text-stone-600 dark:text-stone-300 leading-relaxed font-medium">{logData.activities}</p>
                            </div>
                        </section>
                    )}

                    {/* Meals */}
                    {logData.mealsProvided && (
                        <section className="bg-white dark:bg-stone-900 p-10 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 shadow-sm">
                            <h2 className="text-xl font-bold text-stone-800 dark:text-white mb-6 flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-[#5fa5ba]/10 text-[#5fa5ba] flex items-center justify-center">
                                    <span className="material-symbols-outlined">restaurant</span>
                                </span>
                                Meals Provided
                            </h2>
                            <div className="bg-stone-50 dark:bg-stone-900/50 p-6 rounded-[2rem] border border-stone-100 dark:border-stone-800">
                                <p className="text-stone-600 dark:text-stone-300 leading-relaxed font-medium">{logData.mealsProvided}</p>
                            </div>
                        </section>
                    )}
                </div>

                {/* Patient Mood */}
                {logData.patientMood && (
                    <section className="bg-white dark:bg-stone-900 p-10 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 shadow-sm">
                        <h2 className="text-xl font-bold text-stone-800 dark:text-white mb-6 flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl bg-[#5fa5ba]/10 text-[#5fa5ba] flex items-center justify-center">
                                <span className="material-symbols-outlined">mood</span>
                            </span>
                            Patient Mood
                        </h2>
                        <div className="bg-stone-50 dark:bg-stone-900/50 p-6 rounded-[2rem] border border-stone-100 dark:border-stone-800">
                            <p className="text-stone-600 dark:text-stone-300 font-medium text-lg">{logData.patientMood}</p>
                        </div>
                    </section>
                )}

                {/* Notes / Observations */}
                {logData.notes && (
                    <section className="bg-white dark:bg-stone-900 p-10 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 shadow-sm">
                        <h2 className="text-xl font-bold text-stone-800 dark:text-white mb-6 flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl bg-[#5fa5ba]/10 text-[#5fa5ba] flex items-center justify-center">
                                <span className="material-symbols-outlined">visibility</span>
                            </span>
                            Observations
                        </h2>
                        <div className="bg-stone-50 dark:bg-stone-900/50 p-8 rounded-[2rem] border border-stone-100 dark:border-stone-800 min-h-[120px]">
                            <p className="text-stone-600 dark:text-stone-300 leading-relaxed font-medium text-lg">
                                {logData.notes}
                            </p>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default CareLogDetails;
