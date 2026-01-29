import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const CareLogDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Mock data - in a real app, fetch based on ID
    const logData = {
        patientName: "Eleanor Thompson",
        date: "May 24, 2024",
        time: "09:00 AM - 01:00 PM (4h)",
        status: "Submitted",
        vitals: {
            bp: "122/80",
            heartRate: "72",
            temp: "98.6"
        },
        medications: [
            { name: "Lisinopril", dosage: "10mg Tablet", time: "09:30 AM", status: "Administered" },
            { name: "Metformin", dosage: "500mg Tablet", time: "09:30 AM", status: "Administered" },
            { name: "Multivitamin", dosage: "1 Capsule", time: "12:30 PM", status: "Administered" }
        ],
        nutrition: {
            breakfast: "Oatmeal with blueberries and 1 slice of whole wheat toast. Patient ate 100% of the meal.",
            lunch: "Chicken salad sandwich and a small apple. Patient ate approximately 75% of the meal.",
            fluid: "850"
        },
        observations: "Patient was in good spirits today. Slightly complained about knee pain during morning exercises but managed to complete the routine."
    };

    return (
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 custom-scrollbar p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Care Log Details</h1>
                        <p className="text-sm text-slate-500">
                            <span className="font-bold text-teal-600">{logData.patientName}</span> • {logData.date} • {logData.time}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                        {logData.status}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">ET</div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto space-y-8">
                {/* Vital Signs */}
                <section>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-teal-600">monitor_heart</span>
                        Vital Signs
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Blood Pressure</p>
                                <p className="text-3xl font-bold text-slate-800 dark:text-white">{logData.vitals.bp} <span className="text-sm text-slate-400 font-normal">mmHg</span></p>
                            </div>
                            <span className="material-symbols-outlined text-green-500 text-3xl">check_circle</span>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Heart Rate</p>
                                <p className="text-3xl font-bold text-slate-800 dark:text-white">{logData.vitals.heartRate} <span className="text-sm text-slate-400 font-normal">BPM</span></p>
                            </div>
                            <span className="material-symbols-outlined text-green-500 text-3xl">check_circle</span>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Temperature</p>
                                <p className="text-3xl font-bold text-slate-800 dark:text-white">{logData.vitals.temp} <span className="text-sm text-slate-400 font-normal">°F</span></p>
                            </div>
                            <span className="material-symbols-outlined text-green-500 text-3xl">check_circle</span>
                        </div>
                    </div>
                </section>

                {/* Medication */}
                <section>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-teal-600">medication</span>
                        Medication Administration
                    </h2>
                    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Medication Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Dosage</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Time</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {logData.medications.map((med, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">{med.name}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{med.dosage}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{med.time}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="inline-flex items-center gap-1 text-green-600 font-bold text-xs uppercase tracking-wider">
                                                <span className="material-symbols-outlined text-base">check_circle</span>
                                                {med.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Nutrition */}
                <section>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-teal-600">restaurant</span>
                        Nutrition & Hydration
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Meal Intake</h3>
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl">
                                <p className="text-xs font-bold text-teal-600 mb-1">Breakfast (09:15 AM)</p>
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{logData.nutrition.breakfast}</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl">
                                <p className="text-xs font-bold text-teal-600 mb-1">Lunch (12:45 PM)</p>
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{logData.nutrition.lunch}</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 w-full text-left">Fluid Intake</h3>
                            <span className="material-symbols-outlined text-6xl text-blue-500 mb-4">water_drop</span>
                            <p className="text-4xl font-bold text-slate-800 dark:text-white mb-1">{logData.nutrition.fluid} <span className="text-lg text-slate-400">ml</span></p>
                            <p className="text-xs text-slate-400 italic">Total water and juice consumed during shift</p>
                        </div>
                    </div>
                </section>

                {/* Observations */}
                <section>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-teal-600">visibility</span>
                        Observations
                    </h2>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            {logData.observations}
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default CareLogDetails;
