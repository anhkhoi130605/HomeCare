import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ScrollAnimation from "@/components/ui/scroll-animation";
import { incidentApi, caregiverApi, scheduleApi, authApi } from '../../lib/api';

const ReportIncidentModal = ({ isOpen, onClose, patients, onSubmit }) => {
    const [formData, setFormData] = useState({
        patientId: '',
        occurredAt: '',
        type: '',
        title: '',
        description: '',
        actionTaken: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await onSubmit({
                ...formData,
                patientId: parseInt(formData.patientId),
                severity: formData.type === 'Injury' || formData.type === 'Medication' ? 'High' : 'Low',
                occurredAt: new Date(formData.occurredAt).toISOString()
            });
            onClose();
            // Reset form
            setFormData({
                patientId: '',
                occurredAt: '',
                type: '',
                title: '',
                description: '',
                actionTaken: ''
            });
        } catch (err) {
            console.error('Error submitting incident:', err);
            // alert('Failed to submit incident'); // Handled by parent
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-stone-900 w-full max-w-2xl rounded-[2rem] shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900">
                    <div>
                        <h2 className="text-2xl font-extrabold text-stone-800 dark:text-white">Report New Incident</h2>
                        <p className="text-sm font-medium text-stone-400 mt-1">File a safety report for an active patient</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-stone-400">close</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <form id="incident-form" onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">Patient Name</label>
                                <select
                                    className="w-full px-5 py-4 rounded-2xl bg-stone-50 dark:bg-stone-800 border-none ring-1 ring-stone-200 dark:ring-stone-700 focus:ring-2 focus:ring-[#5fa5ba] text-stone-700 dark:text-stone-200 font-bold outline-none"
                                    value={formData.patientId}
                                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Patient...</option>
                                    {patients.map(patient => (
                                        <option key={patient.id} value={patient.id}>{patient.fullName}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">Date & Time</label>
                                <input
                                    type="datetime-local"
                                    className="w-full px-5 py-4 rounded-2xl bg-stone-50 dark:bg-stone-800 border-none ring-1 ring-stone-200 dark:ring-stone-700 focus:ring-2 focus:ring-[#5fa5ba] text-stone-700 dark:text-stone-200 font-bold outline-none"
                                    value={formData.occurredAt}
                                    onChange={(e) => setFormData({ ...formData, occurredAt: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">Incident Type</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {['Fall', 'Medication', 'Injury', 'Behavioral'].map((type) => (
                                    <label key={type} className="cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="incident-type"
                                            className="peer hidden"
                                            checked={formData.type === type}
                                            onChange={() => setFormData({ ...formData, type, title: `${type} Incident` })}
                                        />
                                        <div className="px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 peer-checked:bg-[#5fa5ba] peer-checked:text-white peer-checked:border-[#5fa5ba] text-stone-600 dark:text-stone-400 font-bold text-center transition-all">
                                            {type}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">Description of Incident</label>
                            <textarea
                                className="w-full px-6 py-5 rounded-2xl bg-stone-50 dark:bg-stone-800 border-none ring-1 ring-stone-200 dark:ring-stone-700 focus:ring-2 focus:ring-[#5fa5ba] text-stone-700 dark:text-stone-200 font-medium outline-none min-h-[120px] resize-none placeholder:text-stone-400"
                                placeholder="Describe exactly what happened, including location and context..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            ></textarea>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">Corrective Actions Taken</label>
                            <textarea
                                className="w-full px-6 py-5 rounded-2xl bg-stone-50 dark:bg-stone-800 border-none ring-1 ring-stone-200 dark:ring-stone-700 focus:ring-2 focus:ring-[#5fa5ba] text-stone-700 dark:text-stone-200 font-medium outline-none min-h-[100px] resize-none placeholder:text-stone-400"
                                placeholder="What did you do immediately after the incident?"
                                value={formData.actionTaken}
                                onChange={(e) => setFormData({ ...formData, actionTaken: e.target.value })}
                            ></textarea>
                        </div>

                        <div className="flex items-center gap-4 bg-amber-50 dark:bg-amber-900/20 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30 text-amber-800 dark:text-amber-200 text-sm font-medium">
                            <span className="material-symbols-outlined text-amber-600">warning</span>
                            <p>By submitting this report, you certify that the information provided is accurate and complete to the best of your knowledge.</p>
                        </div>
                    </form>
                </div>

                <div className="p-8 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="px-8 py-4 rounded-2xl font-bold text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all">
                        Cancel
                    </button>
                    <button form="incident-form" type="submit" className="bg-[#5fa5ba] hover:bg-[#4d8ca0] text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-[#5fa5ba]/20 transition-all active:scale-95">
                        SUBMIT REPORT
                    </button>
                </div>
            </div>
        </div>
    );
};

const Incidents = () => {
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [incidents, setIncidents] = useState([]);
    const [profile, setProfile] = useState(null);
    const [patients, setPatients] = useState([]); // List of patients for dropdown
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleLogout = () => {
        authApi.logout();
        navigate('/login');
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch Profile and Incidents in parallel
                const [profileRes, incidentsRes] = await Promise.all([
                    caregiverApi.getProfile(),
                    incidentApi.getMy()
                ]);
                setProfile(profileRes);
                setIncidents(incidentsRes || []);

                // Fetch Schedules using Profile ID to get Patients
                if (profileRes?.id) {
                    // We need to fetch ALL relevant schedules or just active ones to find patients.
                    // For now, let's fetch without date range to get all (backend default might limit? Admin GetAll defaults to all, GetByCaregiver defaults to all if no dates)
                    const schedulesRes = await scheduleApi.getByCaregiver(profileRes.id);

                    // Extract unique patients from schedules
                    const uniquePatients = [];
                    const patientIds = new Set();
                    schedulesRes?.forEach(sch => {
                        if (sch.patientId && !patientIds.has(sch.patientId)) {
                            patientIds.add(sch.patientId);
                            uniquePatients.push({ id: sch.patientId, fullName: sch.patientName });
                        }
                    });
                    setPatients(uniquePatients);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCreateIncident = async (data) => {
        try {
            const newIncident = await incidentApi.create(data);
            setIncidents([newIncident, ...incidents]);
            // alert('Incident submitted successfully');
        } catch (err) {
            console.error('Failed to create incident:', err);
            alert('Failed to submit incident');
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('vi-VN');
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Resolved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'InProgress': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            default: return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        }
    };

    const filteredIncidents = incidents.filter(inc =>
        inc.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-background-light dark:bg-stone-950">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#5fa5ba] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-stone-500 font-medium">Loading incidents...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto bg-background-light dark:bg-stone-950 custom-scrollbar font-manrope">
            <ReportIncidentModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                patients={patients}
                onSubmit={handleCreateIncident}
            />

            <ScrollAnimation animation="fade-down" delay={0.1}>
                {/* Header ... same as before */}
                <header className="sticky top-0 z-20 bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border-b border-stone-100 dark:border-stone-800 px-8 py-5 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold text-stone-800 dark:text-white tracking-tight">Incident Reports</h1>
                        <p className="text-sm font-medium text-stone-400 mt-1">Manage and track safety records</p>
                    </div>
                    <div className="flex items-center gap-5">
                        {/* Notifications and Profile */}
                        <button className="w-11 h-11 flex items-center justify-center text-stone-400 hover:text-[#5fa5ba] hover:bg-[#5fa5ba]/10 rounded-full transition-all relative">
                            <span className="material-symbols-outlined text-2xl">notifications</span>
                            <span className="absolute top-2.5 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-stone-900"></span>
                        </button>
                        <div className="flex items-center gap-4 pl-6 border-l border-stone-100 dark:border-stone-800 group">
                            <Link to="/caregiver/profile">
                                <img
                                    alt="Caregiver profile"
                                    className="w-12 h-12 rounded-2xl object-cover shadow-sm ring-2 ring-white dark:ring-stone-800 group-hover:ring-[#5fa5ba] transition-all cursor-pointer"
                                    src={profile?.imageUrl || 'https://via.placeholder.com/48'}
                                />
                            </Link>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all ml-2"
                            title="Sign Out"
                        >
                            <span className="material-symbols-outlined text-2xl">logout</span>
                        </button>
                    </div>
                </header>
            </ScrollAnimation>

            <div className="p-8 max-w-[1700px] mx-auto space-y-8">
                <ScrollAnimation animation="fade-down" delay={0.2}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="relative flex-1 max-w-lg group">
                            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 group-hover:text-[#5fa5ba] transition-colors">search</span>
                            <input
                                type="text"
                                className="w-full pl-14 pr-6 py-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl focus:ring-2 focus:ring-[#5fa5ba] focus:border-transparent text-sm font-bold text-stone-700 transition-all shadow-sm outline-none"
                                placeholder="Search by patient or incident..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => setIsReportModalOpen(true)}
                            className="flex items-center justify-center gap-2 bg-[#5fa5ba] hover:bg-[#4d8ca0] text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-[#5fa5ba]/20 transition-all active:scale-95 group hover:-translate-y-0.5"
                        >
                            <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">add_circle</span>
                            REPORT NEW INCIDENT
                        </button>
                    </div>
                </ScrollAnimation>

                <ScrollAnimation animation="fade-up" delay={0.3}>
                    <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-stone-50 dark:bg-stone-900/50 border-b border-stone-100 dark:border-stone-800">
                                    <tr>
                                        <th className="px-8 py-6 text-[10px] font-black text-stone-400 uppercase tracking-widest">Date & Time</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-stone-400 uppercase tracking-widest">Patient</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-stone-400 uppercase tracking-widest">Incident Summary</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-stone-400 uppercase tracking-widest">Status</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-stone-400 uppercase tracking-widest">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                    {filteredIncidents.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-12 text-center text-stone-400">
                                                No incidents found
                                            </td>
                                        </tr>
                                    ) : filteredIncidents.map((incident) => (
                                        <tr key={incident.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/20 transition-all group">
                                            <td className="px-8 py-7 whitespace-nowrap">
                                                <div className="text-sm font-bold text-stone-900 dark:text-white">{formatDate(incident.occurredAt)}</div>
                                                <div className="text-xs text-stone-500 font-bold mt-1">{formatTime(incident.occurredAt)}</div>
                                            </td>
                                            <td className="px-8 py-7 whitespace-nowrap">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-2xl bg-[#5fa5ba]/10 flex items-center justify-center text-[#5fa5ba] font-black text-xs">
                                                        {getInitials(incident.patientName)}
                                                    </div>
                                                    <span className="text-sm font-bold text-stone-700 dark:text-stone-200">{incident.patientName}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-7">
                                                <div className="max-w-md">
                                                    <p className="text-sm font-bold text-stone-700 dark:text-stone-300">{incident.title}</p>
                                                    <p className="text-sm text-stone-500 line-clamp-1 mt-1">{incident.description}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-7 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${getStatusColor(incident.status)}`}>
                                                    {incident.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-7 whitespace-nowrap">
                                                {/* Details link */}
                                                <Link
                                                    to={`/caregiver/incidents/detail/${incident.id}`}
                                                    className="text-[#5fa5ba] hover:text-[#4d8ca0] font-bold text-sm transition-all hover:translate-x-1 flex items-center gap-2 group-hover:opacity-100 opacity-70"
                                                >
                                                    View Details
                                                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="px-8 py-6 bg-stone-50 dark:bg-stone-900/50 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Showing {filteredIncidents.length} incidents</p>
                        </div>
                    </div>
                </ScrollAnimation>
                {/* Guidelines section same as before */}
                <ScrollAnimation animation="fade-up" delay={0.4}>
                    <section className="bg-[#5fa5ba]/5 dark:bg-[#5fa5ba]/10 border border-[#5fa5ba]/10 rounded-[2.5rem] p-10 flex items-start gap-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                            <span className="material-symbols-outlined text-9xl text-[#5fa5ba]">info</span>
                        </div>
                        <div className="w-16 h-16 bg-[#5fa5ba] text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl shadow-[#5fa5ba]/20">
                            <span className="material-symbols-outlined text-3xl">info</span>
                        </div>
                        <div className="relative z-10">
                            <h3 className="font-bold text-xl text-stone-800 dark:text-white mb-2">Reporting Guidelines</h3>
                            <p className="text-sm font-medium text-stone-600 dark:text-stone-400 leading-relaxed max-w-4xl">
                                All incidents must be reported within 2 hours of occurrence or discovery. Ensure all descriptions are factual and objective. In case of medical emergencies, always call 911 first before filing an incident report.
                            </p>
                        </div>
                    </section>
                </ScrollAnimation>
            </div>

            <footer className="p-8 text-center text-stone-400 text-xs font-bold mt-auto mb-4">
                Â© 2024 HomeCare Systems Inc. All Rights Reserved.
            </footer>
        </div>
    );
};

export default Incidents;
