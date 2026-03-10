import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { careLogApi } from '../../lib/api';

const EditCareLog = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        activities: '',
        medicationsGiven: '',
        mealsProvided: '',
        vitalSigns: '',
        patientMood: 'Neutral',
        notes: '',
        patientName: '',
        loggedAt: ''
    });

    useEffect(() => {
        const fetchLog = async () => {
            try {
                setLoading(true);
                const data = await careLogApi.getById(id);
                setFormData({
                    activities: data.activities || '',
                    medicationsGiven: data.medicationsGiven || '',
                    mealsProvided: data.mealsProvided || '',
                    vitalSigns: data.vitalSigns || '',
                    patientMood: data.patientMood || 'Neutral',
                    notes: data.notes || '',
                    patientName: data.patientName || '',
                    loggedAt: data.loggedAt || ''
                });
            } catch (err) {
                console.error('Error fetching log:', err);
                setError(err.message || 'Failed to load care log');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchLog();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e, asDraft = false) => {
        e.preventDefault();
        try {
            setSaving(true);
            await careLogApi.update(id, {
                activities: formData.activities,
                medicationsGiven: formData.medicationsGiven,
                mealsProvided: formData.mealsProvided,
                vitalSigns: formData.vitalSigns,
                patientMood: formData.patientMood,
                notes: formData.notes,
                isDraft: asDraft
            });
            navigate('/caregiver/care-logs');
        } catch (err) {
            console.error('Error saving log:', err);
            setError(err.message || 'Failed to save care log');
        } finally {
            setSaving(false);
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
            <div className="flex-1 flex items-center justify-center bg-background-light dark:bg-stone-950">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#5fa5ba] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-stone-500 font-medium">Loading care log...</p>
                </div>
            </div>
        );
    }

    if (error && !formData.patientName) {
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

    return (
        <div className="flex-1 overflow-y-auto bg-background-light dark:bg-stone-950 custom-scrollbar p-8 font-manrope animate-in slide-in-from-bottom-8 fade-in duration-700">
            <div className="max-w-4xl mx-auto pb-20">
                <div className="flex items-center gap-6 mb-10">
                    <button onClick={() => navigate(-1)} className="w-12 h-12 flex items-center justify-center bg-white hover:bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-full transition-all shadow-sm">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">Edit Care Log</h1>
                        <p className="text-sm font-medium text-stone-500 mt-1">Make changes and finalize your report</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 text-red-700 px-6 py-4 rounded-2xl border border-red-100">
                        {error}
                    </div>
                )}

                <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] shadow-sm border border-stone-100 dark:border-stone-800 p-10">
                    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-10">

                        {/* Header Info (Read only) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-stone-50 dark:bg-stone-900/50 rounded-[2rem] border border-stone-100 dark:border-stone-800">
                            <div>
                                <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Patient</label>
                                <p className="font-extrabold text-stone-800 dark:text-white text-xl">{formData.patientName}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Logged At</label>
                                <p className="font-extrabold text-stone-800 dark:text-white text-xl">{formatDate(formData.loggedAt)}</p>
                            </div>
                        </div>

                        {/* Activities */}
                        <div>
                            <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-3 ml-1">Activities Performed</label>
                            <textarea
                                name="activities"
                                value={formData.activities}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-6 py-5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl focus:ring-2 focus:ring-[#5fa5ba] focus:border-transparent leading-relaxed text-stone-700 font-medium outline-none transition-all resize-none"
                                placeholder="Describe activities performed..."
                            ></textarea>
                        </div>

                        {/* Medications */}
                        <div>
                            <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-3 ml-1">Medications Given</label>
                            <textarea
                                name="medicationsGiven"
                                value={formData.medicationsGiven}
                                onChange={handleChange}
                                rows="2"
                                className="w-full px-6 py-5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl focus:ring-2 focus:ring-[#5fa5ba] focus:border-transparent leading-relaxed text-stone-700 font-medium outline-none transition-all resize-none"
                                placeholder="List medications administered..."
                            ></textarea>
                        </div>

                        {/* Meals */}
                        <div>
                            <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-3 ml-1">Meals Provided</label>
                            <textarea
                                name="mealsProvided"
                                value={formData.mealsProvided}
                                onChange={handleChange}
                                rows="2"
                                className="w-full px-6 py-5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl focus:ring-2 focus:ring-[#5fa5ba] focus:border-transparent leading-relaxed text-stone-700 font-medium outline-none transition-all resize-none"
                                placeholder="Describe meals provided..."
                            ></textarea>
                        </div>

                        {/* Mood Selection */}
                        <div>
                            <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-4 ml-1">Patient Mood</label>
                            <div className="flex flex-wrap gap-4">
                                {['Happy', 'Neutral', 'Sad', 'Agitated', 'Calm'].map(mood => (
                                    <button
                                        key={mood}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, patientMood: mood }))}
                                        className={`px-8 py-4 rounded-xl font-bold text-sm border transition-all ${formData.patientMood === mood
                                            ? 'border-[#5fa5ba] bg-[#5fa5ba]/10 text-[#5fa5ba] shadow-lg shadow-[#5fa5ba]/10'
                                            : 'border-stone-200 dark:border-stone-700 text-stone-500 bg-white dark:bg-stone-800 hover:border-[#5fa5ba]/50 hover:bg-stone-50'
                                            }`}
                                    >
                                        {mood}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-3 ml-1">Additional Notes & Observations</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows="4"
                                className="w-full px-6 py-5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-[2rem] focus:ring-2 focus:ring-[#5fa5ba] focus:border-transparent leading-relaxed text-stone-700 font-medium outline-none transition-all resize-none"
                                placeholder="Enter any observations or notes..."
                            ></textarea>
                        </div>

                        {/* Actions */}
                        <div className="pt-8 flex gap-6">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 bg-[#5fa5ba] hover:bg-[#4d8ca0] text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-[#5fa5ba]/20 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Submit Log'}
                            </button>
                            <button
                                type="button"
                                disabled={saving}
                                onClick={(e) => handleSubmit(e, true)}
                                className="px-8 py-5 bg-amber-100 hover:bg-amber-200 text-amber-700 font-bold text-lg rounded-2xl transition-all disabled:opacity-50"
                            >
                                Save Draft
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/caregiver/care-logs')}
                                className="px-10 py-5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 font-bold text-lg rounded-2xl transition-all"
                            >
                                Cancel
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditCareLog;
