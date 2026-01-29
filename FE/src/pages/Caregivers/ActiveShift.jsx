import React, { useState, useEffect } from 'react';
// Import dữ liệu từ file data.js
import { PATIENT_DATA, MEDICATION_LIST, EMERGENCY_CONTACT } from '../../data/Caregiver/ActiveShift';

const ActiveShift = () => {
    const [seconds, setSeconds] = useState(6135); // Initial mock time: 01:42:15

    useEffect(() => {
        const timer = setInterval(() => {
            setSeconds(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (totalSeconds) => {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-900">
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-900/30">
                        <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]"></span>
                        <span className="text-xs font-bold uppercase tracking-widest">Live Shift</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white leading-none">{PATIENT_DATA.name}</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">location_on</span>
                            {PATIENT_DATA.address}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-12">
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-0.5">Shift Duration</p>
                        <div className="text-4xl font-mono font-bold text-primary-600 tracking-tight">{formatTime(seconds)}</div>
                    </div>
                    <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-8">
                        <img
                            alt="Caregiver profile"
                            className="w-12 h-12 rounded-full object-cover shadow-md border-2 border-primary-600"
                            src={PATIENT_DATA.profileImage}
                        />
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden p-8 gap-8">
                <div className="flex-1 flex flex-col gap-8 overflow-y-auto pr-2 custom-scrollbar">
                    <section className="bg-white dark:bg-slate-800 rounded-4xl border border-slate-200 dark:border-slate-800 shadow-xl p-10">
                        <div className="mb-10 flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Care Log Entry</h2>
                                <p className="text-slate-500 mt-1">Documenting current shift activity and patient status</p>
                            </div>
                            <button className="bg-primary-50 dark:bg-primary-900/30 text-primary-600 px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-primary-100 transition-all">
                                <span className="material-symbols-outlined text-lg">history</span>
                                View Past Logs
                            </button>
                        </div>

                        <div className="space-y-12">
                            {/* Vital Signs Section */}
                            <div>
                                <div className="flex items-center gap-3 mb-8 text-slate-800 dark:text-slate-200">
                                    <span className="material-symbols-outlined text-primary-600 text-2xl">monitoring</span>
                                    <h3 className="font-bold text-xl">Vital Signs</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {['Heart Rate', 'Temperature', 'Blood Pressure'].map((label) => (
                                        <div key={label} className="space-y-3">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    className="w-full px-6 py-5 rounded-3xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:ring-primary-600 focus:border-primary-600 text-2xl font-bold transition-all placeholder:text-slate-300"
                                                    placeholder={label === 'Blood Pressure' ? '120/80' : '--'}
                                                />
                                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                                                    {label === 'Heart Rate' ? 'BPM' : label === 'Temperature' ? '°F' : 'SYS/DIA'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                {/* Medication Section */}
                                <div>
                                    <div className="flex items-center gap-3 mb-8 text-slate-800 dark:text-slate-200">
                                        <span className="material-symbols-outlined text-primary-600 text-2xl">medication</span>
                                        <h3 className="font-bold text-xl">Medication Checklist</h3>
                                    </div>
                                    <div className="space-y-4 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-4xl border border-slate-100 dark:border-slate-800">
                                        {MEDICATION_LIST.map((med, i) => (
                                            <label key={i} className={`flex items-center gap-4 p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-primary-600 transition-all ${med.opacity || ''}`}>
                                                <input type="checkbox" className="w-7 h-7 rounded-xl border-slate-300 text-primary-600 focus:ring-primary-600 transition-all" />
                                                <div className="flex-1">
                                                    <p className="font-bold text-slate-800 dark:text-white">{med.name}</p>
                                                    <p className="text-xs text-slate-500">{med.desc}</p>
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-700 px-3 py-1.5 rounded-full">{med.time}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Nutrition Section */}
                                <div>
                                    <div className="flex items-center gap-3 mb-8 text-slate-800 dark:text-slate-200">
                                        <span className="material-symbols-outlined text-primary-600 text-2xl">restaurant</span>
                                        <h3 className="font-bold text-xl">Nutrition & Hydration</h3>
                                    </div>
                                    <div className="space-y-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Meal Details</label>
                                            <textarea
                                                className="w-full p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:ring-primary-600 focus:border-primary-600 text-sm min-h-[140px] transition-all"
                                                placeholder="Describe breakfast/lunch items consumed..."
                                            ></textarea>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Hydration (Glasses)</label>
                                            <div className="flex items-center gap-4">
                                                <div className="flex gap-2.5">
                                                    {[1, 2, 3, 4, '5+'].map((num) => (
                                                        <button
                                                            key={num}
                                                            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg transition-all ${num === 2 ? 'bg-primary-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-400 hover:border-primary-600'}`}
                                                        >
                                                            {num}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-primary-600 font-bold text-lg ml-auto">
                                                    <span className="material-symbols-outlined">water_drop</span>
                                                    <span>16oz</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center gap-3 mb-8 text-slate-800 dark:text-slate-200">
                                    <span className="material-symbols-outlined text-primary-600 text-2xl">edit_note</span>
                                    <h3 className="font-bold text-xl">Care Notes & Observations</h3>
                                </div>
                                <textarea
                                    className="w-full p-8 rounded-4xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:ring-primary-600 focus:border-primary-600 text-lg min-h-[220px] transition-all"
                                    placeholder="Detailed observations about mood, mobility, sleep quality, or any incidents..."
                                ></textarea>
                            </div>
                        </div>

                        <div className="mt-12 flex gap-6">
                            <button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-6 rounded-3xl font-bold text-xl transition-all flex items-center justify-center gap-3 shadow-2xl shadow-primary-600/30">
                                <span className="material-symbols-outlined text-2xl">save</span>
                                SAVE CARE LOG
                            </button>
                            <button className="px-10 py-6 rounded-3xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-lg hover:bg-slate-300 transition-all">
                                DRAFT
                            </button>
                        </div>
                    </section>
                </div>

                <aside className="w-96 flex flex-col gap-8 shrink-0">
                    <div className="bg-white dark:bg-slate-800 rounded-4xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col relative h-64">
                        <div
                            className="absolute inset-0 grayscale opacity-40 hover:grayscale-0 transition-all duration-500 cursor-crosshair"
                            style={{
                                backgroundImage: `url('${PATIENT_DATA.locationImage}')`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                        ></div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="relative">
                                <div className="absolute -inset-8 bg-primary-600/30 rounded-full animate-ping"></div>
                                <div className="absolute -inset-4 bg-primary-600/20 rounded-full animate-pulse"></div>
                                <span className="material-symbols-outlined text-primary-600 text-6xl relative z-10 drop-shadow-lg">location_on</span>
                            </div>
                        </div>
                        <div className="absolute bottom-6 left-6 right-6 z-20">
                            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">Verified Check-in</span>
                                    <span className="text-xs text-slate-500 font-mono">{PATIENT_DATA.coordinates}</span>
                                </div>
                                <p className="text-sm font-bold text-slate-800 dark:text-white">Patient Residence (Primary)</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-4xl p-8 flex-1">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-600">
                                <span className="material-symbols-outlined text-2xl">emergency</span>
                            </div>
                            <h3 className="font-bold text-red-600 uppercase tracking-widest text-sm">Emergency Info</h3>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-2">Primary Contact</p>
                                <p className="font-bold text-slate-800 dark:text-white text-lg leading-tight">{EMERGENCY_CONTACT.name}</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">{EMERGENCY_CONTACT.phone}</p>
                            </div>

                            <div className="p-5 bg-red-100/50 dark:bg-red-900/30 rounded-3xl border border-red-200/50 dark:border-red-800/50 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                                    <span className="material-symbols-outlined text-4xl text-red-600">medical_services</span>
                                </div>
                                <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-2">Critical Allergies</p>
                                <p className="font-bold text-red-700 dark:text-red-400 text-lg">{EMERGENCY_CONTACT.allergies}</p>
                            </div>

                            <button className="w-full bg-red-600 text-white hover:bg-red-700 py-5 rounded-3xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-xl shadow-red-500/20 active:scale-95">
                                <span className="material-symbols-outlined text-2xl">call</span>
                                CONTACT FAMILY
                            </button>
                        </div>
                    </div>

                    <button className="w-full bg-slate-900 dark:bg-teal-700 hover:bg-black dark:hover:bg-teal-600 text-white py-10 rounded-4xl font-bold text-3xl shadow-2xl transition-all flex flex-col items-center justify-center gap-2 group border-4 border-transparent hover:border-primary-400">
                        <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-4xl group-hover:translate-x-2 transition-transform">logout</span>
                            COMPLETE SESSION
                        </div>
                        <span className="text-xs uppercase tracking-[0.3em] opacity-60">Shift Check-out</span>
                    </button>
                </aside>
            </div>
        </div>
    );
};

export default ActiveShift;