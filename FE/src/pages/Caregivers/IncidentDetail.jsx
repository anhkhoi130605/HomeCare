import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { incidentApi } from '@/lib/api';

const IncidentDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [incident, setIncident] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchIncident = async () => {
            try {
                setLoading(true);
                const data = await incidentApi.getById(id);
                // Map API response to component format
                setIncident({
                    id: data.id,
                    name: data.patientName || data.patient?.name || 'Patient',
                    initials: (data.patientName || data.patient?.name || 'P').slice(0, 2).toUpperCase(),
                    date: data.incidentDate ? new Date(data.incidentDate).toLocaleDateString() : new Date(data.createdAt).toLocaleDateString(),
                    time: data.incidentTime || new Date(data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    status: data.status || 'Under Review',
                    color: data.status === 'Resolved' ? 'text-green-600' : data.status === 'Pending' ? 'text-amber-600' : 'text-blue-600',
                    location: data.location || 'Patient Residence',
                    witnesses: data.witnesses || 'N/A',
                    description: data.description || 'No description provided.',
                    actions: data.actionsTaken ? data.actionsTaken.split('\n').filter(Boolean) : []
                });
            } catch (err) {
                console.error('Failed to fetch incident:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchIncident();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-900 font-inter animate-pulse p-8">
                <div className="bg-slate-200 h-16 rounded-xl mb-8"></div>
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-slate-200 rounded-[20px] h-64"></div>
                        <div className="bg-slate-200 rounded-[20px] h-48"></div>
                    </div>
                    <div className="bg-slate-200 rounded-[20px] h-96"></div>
                </div>
            </div>
        );
    }

    if (error || !incident) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center h-64 text-center bg-slate-50 dark:bg-slate-900">
                <span className="material-symbols-outlined text-4xl text-red-400 mb-4">error</span>
                <p className="text-red-600 font-medium">{error || 'Incident not found'}</p>
                <Link to="/caregiver/incidents" className="mt-4 text-[#0d9488] hover:underline">Back to Incidents</Link>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-900 font-inter animate-in slide-in-from-bottom-8 fade-in duration-700">
            <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 px-8 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/caregiver/incidents" className="p-2 text-slate-400 hover:text-[#0d9488] transition-colors">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl font-bold text-slate-800 dark:text-white">Incident Detail</h1>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${incident.color.replace('text-', 'bg-opacity-20 ')}`}>
                                    {incident.status}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Reference: INC-2024-00{id}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={handlePrint} className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-[#0d9488] text-sm font-medium">
                            <span className="material-symbols-outlined text-lg">print</span>
                            Print Report
                        </button>
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                        <img alt="Caregiver profile" className="w-10 h-10 rounded-full object-cover shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBe28WHyO9uNC9249sIJlRbtn1rchJfUUnwMnpRtlUgwsHzON8cBlhXLilmMIGRpf1xDnX980DVub-GLz0qbY0seLRO0FCXshaR7WOK6qJqF2hOT4U35GubxklqawPlAB5kLq6SoFLkmsqzg1ogdLfu1AqZGXer2brhExgBXOlZc0MfwtvV-ctd8KxUbhDmo-vlV0OVDaPPwvv7fNxcDxV6GOjmqxl_pzAULoENZFqE-W8JeXhaIg_m2O4qIb0J4jcVGydA9uRwpR8a" />
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-white dark:bg-slate-800 rounded-[20px] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden p-6">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#0d9488]">description</span>
                                Incident Summary
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date & Time of Occurrence</label>
                                        <p className="text-slate-900 dark:text-slate-100 font-medium mt-1">{incident.date} — {incident.time}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Location</label>
                                        <p className="text-slate-900 dark:text-slate-100 font-medium mt-1">{incident.location}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Witnesses</label>
                                        <div className="mt-1 flex flex-wrap gap-2">
                                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-sm text-slate-700 dark:text-slate-300">{incident.witnesses}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Detailed Description</label>
                                <div className="mt-2 text-slate-700 dark:text-slate-300 leading-relaxed text-sm bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                    {incident.description}
                                </div>
                            </div>
                            <div className="mt-6">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Immediate Actions Taken</label>
                                <div className="mt-2 space-y-2">
                                    {incident.actions && incident.actions.map((action, i) => (
                                        <div key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                                            <span className="material-symbols-outlined text-[#0d9488] text-lg flex-shrink-0">check_circle</span>
                                            <span>{action}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                        <section className="bg-white dark:bg-slate-800 rounded-[20px] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden p-6">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#0d9488]">attachment</span>
                                Evidence &amp; Supporting Documents
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                <div className="aspect-square bg-slate-100 dark:bg-slate-700 rounded-xl relative group cursor-pointer overflow-hidden border border-slate-200 dark:border-slate-600">
                                    <img alt="Evidence 1" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaXOhrMHhwkRIZyyIA4fMZ1rQ0WdE0U8ICf8_i_MPn-85U1w-ChLP6QWPjEPKQvLBkBA7qT2DhcTN6o0I86yGhGvRw1r-txkvkDtUhMoffc6C3f1n_U1My2izElYpiX2CGVbDBit0OAjE2haTAG6hlodu_76iYJvXidKGk0YOKQV9xf9AoZxiT3kxszLGm_RYpUhVztXfxWMoeKM6PNxjMD3_n6yoAWHUowVFsdrv2Ddb2rMN43o9P5aSWv0P_jXRWuUkqgvC-KDAS" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="material-symbols-outlined text-white">zoom_in</span>
                                    </div>
                                </div>
                                <div className="aspect-square bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    <span className="material-symbols-outlined text-slate-400 mb-2">picture_as_pdf</span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Assessment_Log.pdf</span>
                                </div>
                            </div>
                        </section>
                    </div>
                    <div className="space-y-8">
                        <section className="bg-white dark:bg-slate-800 rounded-[20px] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden p-6">
                            <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6">Involved Parties</h2>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold">{incident.initials}</div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-tighter">Patient</p>
                                        <p className="font-bold text-slate-800 dark:text-white">{incident.name}</p>
                                        <p className="text-xs text-slate-500 italic">Care Plan #7721-A</p>
                                    </div>
                                </div>
                                <div className="border-t border-slate-100 dark:border-slate-700 pt-6">
                                    <div className="flex items-center gap-4">
                                        <img alt="Caregiver profile" className="w-12 h-12 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBe28WHyO9uNC9249sIJlRbtn1rchJfUUnwMnpRtlUgwsHzON8cBlhXLilmMIGRpf1xDnX980DVub-GLz0qbY0seLRO0FCXshaR7WOK6qJqF2hOT4U35GubxklqawPlAB5kLq6SoFLkmsqzg1ogdLfu1AqZGXer2brhExgBXOlZc0MfwtvV-ctd8KxUbhDmo-vlV0OVDaPPwvv7fNxcDxV6GOjmqxl_pzAULoENZFqE-W8JeXhaIg_m2O4qIb0J4jcVGydA9uRwpR8a" />
                                        <div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-tighter">Reporting Caregiver</p>
                                            <p className="font-bold text-slate-800 dark:text-white">Sarah Jenkins, CNA</p>
                                            <p className="text-xs text-slate-500 italic">Emp ID: CF-992</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <section className="bg-slate-50 dark:bg-slate-800/50 border border-[#0d9488]/20 dark:border-[#0d9488]/20 rounded-[20px] p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-bold text-[#0d9488] uppercase tracking-widest flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                                    Admin Feedback
                                </h2>
                            </div>
                            <div className="p-4 bg-white/60 dark:bg-slate-900/40 rounded-xl border border-[#0d9488]/10">
                                <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400 mb-2">
                                    <span className="material-symbols-outlined text-sm">schedule</span>
                                    <span className="text-xs font-bold uppercase">{incident.status}</span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                                    This report has been flagged for administrative review. Feedback and follow-up actions will be posted here once the clinical manager has completed the investigation.
                                </p>
                            </div>
                        </section>
                        <div className="p-6 bg-[#0d9488]/5 rounded-[20px] border border-[#0d9488]/10">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm mb-2">
                                <span className="material-symbols-outlined text-[#0d9488]">contact_support</span>
                                Need Clarification?
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                If you need to add more information to this report, please contact your clinical supervisor directly. Submitted reports cannot be edited by the reporter.
                            </p>
                        </div>
                    </div>
                </div>
                <footer className="p-8 text-center text-slate-400 text-xs mt-auto">
                    © 2024 CareFlow Systems Inc. All Rights Reserved. • <a className="hover:text-[#0d9488] underline" href="#">Privacy Policy</a>
                </footer>
            </div>
        </div>
    );
};

export default IncidentDetail;
