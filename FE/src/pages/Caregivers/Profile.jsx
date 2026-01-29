import React from 'react';
import { Link } from 'react-router-dom';
import { PROFILE_DATA } from '../../data/Caregiver/Profile';
import { CAREGIVER_INFO } from '../../data/Caregiver/CareLogs';

const Profile = () => {
    return (
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 custom-scrollbar">
            <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Personal Profile</h1>
                    <p className="text-sm text-slate-500">Manage your credentials and preferences</p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full relative">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
                        <Link to="/caregiver/profile">
                            <img alt="Caregiver profile" className="w-10 h-10 rounded-full object-cover shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-80 transition-opacity" src={CAREGIVER_INFO.profileImage} />
                        </Link>
                    </div>
                </div>
            </header>

            <div className="p-8 max-w-5xl mx-auto space-y-8 pb-20">
                {/* Personal Information Section */}
                <section className="bg-white dark:bg-slate-800 rounded-4xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden group">
                    <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                        <h2 className="font-bold text-xl flex items-center gap-2 text-slate-800 dark:text-white">
                            <span className="material-symbols-outlined text-primary-600">person</span>
                            Personal Information
                        </h2>
                        <button className="flex items-center gap-2 text-sm font-bold text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 px-4 py-2 rounded-xl transition-all border border-transparent hover:border-primary-200">
                            <span className="material-symbols-outlined text-lg">edit</span>
                            Edit
                        </button>
                    </div>
                    <div className="p-10 flex flex-col md:flex-row gap-12 items-start">
                        <div className="relative group/avatar">
                            <div className="absolute -inset-2 bg-gradient-to-tr from-primary-600 to-teal-400 rounded-4xl opacity-0 group-hover/avatar:opacity-20 transition-all duration-500"></div>
                            <img alt="Caregiver large" className="w-40 h-40 rounded-3xl object-cover shadow-2xl relative z-10 border-4 border-white dark:border-slate-700" src={CAREGIVER_INFO.profileImage} />
                            <button className="absolute -bottom-3 -right-3 bg-white dark:bg-slate-700 p-3 rounded-full shadow-2xl border-2 border-slate-200 dark:border-slate-600 text-primary-600 hover:scale-110 transition-transform active:scale-95 z-20">
                                <span className="material-symbols-outlined text-xl">photo_camera</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8 flex-1">
                            {PROFILE_DATA.personalInfo.map((info, i) => (
                                <div key={i} className="space-y-1.5 border-b border-slate-50 dark:border-slate-700 pb-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{info.label}</p>
                                    <p className="font-bold text-slate-900 dark:text-slate-100 text-lg leading-tight">{info.val}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Professional Certifications Section */}
                <section className="bg-white dark:bg-slate-800 rounded-4xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                        <h2 className="font-bold text-xl flex items-center gap-2 text-slate-800 dark:text-white">
                            <span className="material-symbols-outlined text-primary-600">verified</span>
                            Professional Certifications
                        </h2>
                        <button className="flex items-center gap-2 text-sm font-bold text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 px-4 py-2 rounded-xl transition-all border border-transparent hover:border-primary-200">
                            <span className="material-symbols-outlined text-lg">add</span>
                            Add New
                        </button>
                    </div>
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {PROFILE_DATA.certifications.map((cert, i) => (
                                <div key={i} className="p-6 border-2 border-slate-50 dark:border-slate-700 rounded-3xl bg-slate-50 dark:bg-slate-900/30 flex justify-between items-start transition-all hover:border-primary-600/30 group">
                                    <div className="flex gap-5">
                                        <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined text-3xl">{cert.icon}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg text-slate-800 dark:text-white leading-tight">{cert.title}</h4>
                                            <p className="text-sm text-slate-500 font-medium mt-1">{cert.id}</p>
                                            <p className={`text-xs font-bold mt-2 uppercase tracking-widest ${cert.color === 'emerald' ? 'text-emerald-600' : 'text-amber-600'}`}>{cert.exp}</p>
                                        </div>
                                    </div>
                                    <button className="text-slate-300 hover:text-primary-600 transition-colors">
                                        <span className="material-symbols-outlined">edit</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Work Preferences Section */}
                <section className="bg-white dark:bg-slate-800 rounded-4xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                        <h2 className="font-bold text-xl flex items-center gap-2 text-slate-800 dark:text-white">
                            <span className="material-symbols-outlined text-primary-600">calendar_month</span>
                            Work Preferences
                        </h2>
                        <button className="flex items-center gap-2 text-sm font-bold text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 px-4 py-2 rounded-xl transition-all border border-transparent hover:border-primary-200">
                            <span className="material-symbols-outlined text-lg">settings</span>
                            Manage
                        </button>
                    </div>
                    <div className="p-8 space-y-10">
                        <div>
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 ml-1">General Availability</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                                {PROFILE_DATA.availability.map(item => (
                                    <div key={item.day} className={`p-4 rounded-3xl text-center transition-all ${item.status === 'work'
                                        ? 'bg-primary-600 text-white shadow-xl shadow-primary-600/20 hover:-translate-y-1'
                                        : 'bg-slate-100 dark:bg-slate-900 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700'
                                        }`}>
                                        <span className={`block text-[10px] font-bold uppercase tracking-widest mb-1 ${item.status === 'work' ? 'opacity-80' : ''}`}>{item.day}</span>
                                        <span className={`text-xs font-bold ${item.status === 'off' ? 'italic' : ''}`}>{item.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-10 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Service Types</h4>
                                <div className="flex flex-wrap gap-2.5">
                                    {PROFILE_DATA.serviceTypes.map(tag => (
                                        <span key={tag} className="px-4 py-2 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-sm">{tag}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Max Travel Distance</h4>
                                <div className="flex items-center gap-6">
                                    <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-900 rounded-full relative overflow-hidden shadow-inner">
                                        <div
                                            className="absolute inset-y-0 left-0 bg-primary-600 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.6)]"
                                            style={{ width: `${(PROFILE_DATA.travelDistance / 20) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="font-bold text-xl text-slate-800 dark:text-white tabular-nums">{PROFILE_DATA.travelDistance} miles</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="pt-8 flex justify-center">
                    <button className="flex items-center gap-3 px-10 py-5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-3xl transition-all font-bold text-lg border-2 border-transparent hover:border-red-200 active:scale-95">
                        <span className="material-symbols-outlined text-2xl">logout</span>
                        Sign Out
                    </button>
                </div>
            </div>
            <footer className="p-8 text-center text-slate-400 text-xs mt-auto">
                © 2024 CareFlow Systems Inc. All Rights Reserved. • <a href="#" className="hover:text-primary-600 underline">Privacy Policy</a>
            </footer>
        </div>
    );
};

export default Profile;