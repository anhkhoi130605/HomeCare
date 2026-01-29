import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EditCareLog = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Mock initial state
    const [formData, setFormData] = useState({
        patientName: "Maria Rodriguez",
        date: "May 22, 2024",
        timeStart: "17:00",
        timeEnd: "21:00",
        notes: "Patient seemed agitated initially but calmed down after dinner.",
        mood: "Neutral"
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Logic to save draft or submit
        navigate('/caregiver/care-logs');
    };

    return (
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 custom-scrollbar p-8">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Draft Log</h1>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-4xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Header Info (Read only) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Patient</label>
                                <p className="font-bold text-slate-800 dark:text-white text-lg">{formData.patientName}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Date</label>
                                <p className="font-bold text-slate-800 dark:text-white text-lg">{formData.date}</p>
                            </div>
                        </div>

                        {/* Time Adjustments */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Start Time</label>
                                <input
                                    type="time"
                                    name="timeStart"
                                    value={formData.timeStart}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-teal-500 focus:border-teal-500 font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">End Time</label>
                                <input
                                    type="time"
                                    name="timeEnd"
                                    value={formData.timeEnd}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-teal-500 focus:border-teal-500 font-bold"
                                />
                            </div>
                        </div>

                        {/* Mood Selection */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Patient Mood</label>
                            <div className="flex gap-4">
                                {['Happy', 'Neutral', 'Sad', 'Agitated'].map(mood => (
                                    <button
                                        key={mood}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, mood }))}
                                        className={`px-6 py-3 rounded-xl font-bold text-sm border-2 transition-all ${formData.mood === mood
                                                ? 'border-teal-500 bg-teal-50 text-teal-700'
                                                : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-teal-200'
                                            }`}
                                    >
                                        {mood}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Care Notes & Observations</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows="6"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-teal-500 focus:border-teal-500 leading-relaxed"
                                placeholder="Enter details about the visit..."
                            ></textarea>
                        </div>

                        {/* Actions */}
                        <div className="pt-6 flex gap-4">
                            <button
                                type="submit"
                                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-2xl font-bold shadow-xl shadow-teal-600/20 transition-all active:scale-95"
                            >
                                Save & Submit Log
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/caregiver/care-logs')}
                                className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-all"
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
