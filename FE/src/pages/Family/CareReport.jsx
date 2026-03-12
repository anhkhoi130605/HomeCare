import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ScrollAnimation from "@/components/ui/scroll-animation";
import ApiErrorDisplay from "@/components/ui/ApiErrorDisplay";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { healthReportApi, familyApi } from '../../lib/api';

// Helper function to map API data to display format
const mapReportToDisplay = (report) => {
    const statusConfig = {
        'Stable': { emoji: '😊', color: 'emerald', curvePath: 'M0,30 C20,25 40,5 60,15 S80,25 100,10', curveColor: '#10b981' },
        'Improved': { emoji: '🎉', color: 'emerald', curvePath: 'M0,30 C20,25 40,5 60,15 S80,25 100,10', curveColor: '#10b981' },
        'Warning': { emoji: '😐', color: 'amber', curvePath: 'M0,10 C20,15 40,35 60,20 S80,10 100,25', curveColor: '#f59e0b' },
        'Incident': { emoji: '😟', color: 'rose', curvePath: 'M0,5 C30,15 70,45 100,35', curveColor: '#f43f5e' },
    };

    const config = statusConfig[report.status] || statusConfig['Stable'];

    return {
        id: report.id,
        patientId: report.patientId,
        name: report.patientName,
        type: report.reportType,
        image: `https://ui-avatars.com/api/?name=${encodeURIComponent(report.patientName)}&background=5fa5ba&color=fff&size=128`,
        period: report.period,
        status: report.status,
        statusEmoji: config.emoji,
        statusColor: config.color,
        score: report.healthScore,
        curvePath: config.curvePath,
        curveColor: config.curveColor,
        sidestripColor: `bg-${config.color}-300`
    };
};

const CareReport = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const patientIdFromUrl = searchParams.get('patientId');
    
    const [allReports, setAllReports] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPatientName, setSelectedPatientName] = useState('Everyone');

    const fetchReports = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [reportsData, patientsData] = await Promise.all([
                healthReportApi.getMy(),
                familyApi.getPatients()
            ]);
            
            const mappedData = reportsData.map(mapReportToDisplay);
            setAllReports(mappedData);
            setPatients(patientsData);
            
            // If patientId is in URL, find the patient name to set the filter
            if (patientIdFromUrl) {
                const targetPatient = patientsData.find(p => p.id === parseInt(patientIdFromUrl));
                if (targetPatient) {
                    setSelectedPatientName(targetPatient.fullName);
                } else {
                    // Fallback to check reports if patient not in family list (though unlikely)
                    const targetReport = mappedData.find(r => r.patientId === parseInt(patientIdFromUrl));
                    if (targetReport) setSelectedPatientName(targetReport.name);
                }
            }
        } catch (err) {
            console.error('Failed to fetch reports:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [patientIdFromUrl]);

    // Derived State: Unique patients for filter
    const patientOptions = useMemo(() => {
        const namesFromPatients = patients.map(p => p.fullName);
        const namesFromReports = allReports.map(r => r.name);
        const allNames = Array.from(new Set([...namesFromPatients, ...namesFromReports])).sort();
        return ['Everyone', ...allNames];
    }, [patients, allReports]);

    // Derived State: Filtered Reports
    const filteredReports = useMemo(() => {
        return allReports.filter(report => {
            const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                report.type.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesPatient = selectedPatientName === 'Everyone' || report.name === selectedPatientName;
            return matchesSearch && matchesPatient;
        });
    }, [allReports, searchQuery, selectedPatientName]);

    const currentDate = useMemo(() => {
        return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }, []);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    if (loading) {
        return <LoadingSpinner message="Đang tải báo cáo..." />;
    }

    if (error) {
        return <ApiErrorDisplay error={error} onRetry={fetchReports} />;
    }

    return (
        <div className="space-y-6 pb-12 font-manrope">
            {/* Header Section */}
            <ScrollAnimation animation="fade-in">
                <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-[#5fa5ba] dark:text-white tracking-tight">Family Health Reports</h1>
                        <p className="text-stone-500 font-medium">Keep track of your family's wellness journey.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex h-12 items-center gap-3 px-4 rounded-2xl bg-white dark:bg-stone-900 border border-[#5fa5ba]/20 shadow-sm">
                            <span className="material-symbols-outlined text-[#5fa5ba]">calendar_month</span>
                            <span className="text-sm font-bold text-stone-700 dark:text-stone-300">{currentDate}</span>
                        </div>
                    </div>
                </header>
            </ScrollAnimation>

            {/* Search and Filters */}
            <ScrollAnimation animation="fade-up" delay={0.1}>
                <section className="mb-10">
                    <div className="bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm p-3 rounded-[2rem] border border-[#5fa5ba]/20 flex flex-wrap items-center gap-4">
                        <div className="relative flex-1 min-w-[300px]">
                            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-[#5fa5ba]/40">search</span>
                            <input
                                className="w-full pl-14 pr-6 py-4 bg-white dark:bg-stone-900 border-none rounded-3xl focus:ring-4 focus:ring-[#5fa5ba]/10 text-sm font-medium placeholder:text-stone-400 shadow-sm outline-none"
                                placeholder="Search by name or report type..."
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3 px-2">
                            <select 
                                value={selectedPatientName}
                                onChange={(e) => setSelectedPatientName(e.target.value)}
                                className="bg-white dark:bg-stone-900 border-none rounded-3xl text-sm font-bold focus:ring-4 focus:ring-[#5fa5ba]/10 py-4 px-6 shadow-sm appearance-none cursor-pointer outline-none text-stone-700 dark:text-stone-300 min-w-[150px]"
                            >
                                {patientOptions.map(name => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                            <button className="flex items-center gap-2 px-6 py-4 bg-[#5fa5ba] text-white hover:bg-[#4d8ca0] rounded-3xl text-sm font-bold transition-all shadow-lg shadow-[#5fa5ba]/20">
                                <span className="material-symbols-outlined text-lg">tune</span>
                                <span className="hidden sm:inline">Apply Filters</span>
                            </button>
                        </div>
                    </div>
                </section>
            </ScrollAnimation>

            {/* Report Cards List */}
            <div className="space-y-6 mb-12">
                {filteredReports.length > 0 ? (
                    filteredReports.map((report, index) => (
                        <ScrollAnimation key={report.id} animation="fade-in" delay={0.1 * (index + 1)}>
                            <div className="group bg-white dark:bg-stone-900 p-8 rounded-[2rem] border border-[#5fa5ba]/10 hover:border-[#5fa5ba]/30 transition-all shadow-sm flex flex-col lg:flex-row lg:items-center gap-8 cursor-pointer relative overflow-hidden">
                                <div className={`absolute top-0 left-0 w-2 h-full ${report.sidestripColor}`}></div>

                                {/* User Info */}
                                <div className="flex items-center gap-5 min-w-[240px]">
                                    <div className="relative">
                                        <img
                                            alt={report.name}
                                            className="w-16 h-16 rounded-3xl object-cover ring-4 ring-[#5fa5ba]/10"
                                            src={report.image}
                                        />
                                        <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white dark:border-stone-900 ${report.statusColor === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                                            report.statusColor === 'amber' ? 'bg-amber-100 text-amber-600' :
                                                'bg-rose-100 text-rose-600'
                                            }`}>
                                            <span className="material-symbols-outlined text-sm font-bold">
                                                {report.statusColor === 'emerald' ? 'check' :
                                                    report.statusColor === 'amber' ? 'priority_high' : 'close'}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-extrabold text-stone-900 dark:text-white">{report.name}</h3>
                                        <p className="text-sm text-stone-400 font-medium">{report.type}</p>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-2">Period</p>
                                        <p className="text-sm font-bold text-stone-700 dark:text-stone-300 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[#5fa5ba] text-sm">calendar_today</span>
                                            {report.period}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-2">Status</p>
                                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm ${report.statusColor === 'emerald' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' :
                                            report.statusColor === 'amber' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' :
                                                'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'
                                            }`}>
                                            <span className="text-lg">{report.statusEmoji}</span>
                                            {report.status}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-1">Health Score</p>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-2 bg-[#5fa5ba]/10 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${report.statusColor === 'emerald' ? 'bg-emerald-400' :
                                                            report.statusColor === 'amber' ? 'bg-amber-400' : 'bg-rose-400'
                                                            }`}
                                                        style={{ width: `${report.score}%` }}
                                                    ></div>
                                                </div>
                                                <span className={`text-lg font-black ${report.statusColor === 'emerald' ? 'text-emerald-600' :
                                                    report.statusColor === 'amber' ? 'text-amber-600' : 'text-rose-600'
                                                    }`}>{report.score}%</span>
                                            </div>
                                        </div>
                                        <div className="w-20 h-10 hidden md:block opacity-60">
                                            <svg className="w-full h-full" viewBox="0 0 100 40">
                                                <path
                                                    d={report.curvePath}
                                                    fill="none"
                                                    stroke={report.curveColor}
                                                    strokeLinecap="round"
                                                    strokeWidth="4"
                                                ></path>
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end">
                                    <Link to={`/family/reports/detail/${report.id}`} className="w-12 h-12 rounded-2xl bg-[#5fa5ba]/10 text-[#5fa5ba] flex items-center justify-center group-hover:bg-[#5fa5ba] group-hover:text-white transition-all">
                                        <span className="material-symbols-outlined">arrow_forward</span>
                                    </Link>
                                </div>
                            </div>
                        </ScrollAnimation>
                    ))
                ) : (
                    <div className="bg-white dark:bg-stone-900 p-20 rounded-[3rem] text-center border border-dashed border-[#5fa5ba]/20 shadow-sm">
                        <div className="w-24 h-24 bg-[#5fa5ba]/5 text-[#5fa5ba] rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                            <span className="material-symbols-outlined text-5xl">folder_off</span>
                        </div>
                        <h3 className="text-2xl font-black text-stone-800 dark:text-white mb-3">No Health Reports Yet</h3>
                        <p className="text-stone-500 max-w-md mx-auto font-medium mb-10">Care summaries and health trends will appear here once your caregivers start logging shift details.</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            <ScrollAnimation animation="fade-up" delay={0.4}>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-16">
                    <div className="text-sm font-bold text-stone-400">
                        Showing <span className="text-[#5fa5ba] font-black">{filteredReports.length}</span> reports
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="w-12 h-12 rounded-2xl border border-[#5fa5ba]/20 flex items-center justify-center text-stone-400 hover:bg-[#5fa5ba]/5 hover:text-[#5fa5ba] transition-all bg-white dark:bg-stone-900">
                            <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        <button className="w-12 h-12 rounded-2xl bg-[#5fa5ba] text-white font-bold shadow-lg shadow-[#5fa5ba]/20">1</button>
                        <button className="w-12 h-12 rounded-2xl bg-white dark:bg-stone-900 border border-[#5fa5ba]/20 text-stone-900 dark:text-white font-bold hover:bg-[#5fa5ba]/5 transition-all">2</button>
                        <button className="w-12 h-12 rounded-2xl bg-white dark:bg-stone-900 border border-[#5fa5ba]/20 text-stone-900 dark:text-white font-bold hover:bg-[#5fa5ba]/5 transition-all">3</button>
                        <button className="w-12 h-12 rounded-2xl border border-[#5fa5ba]/20 flex items-center justify-center text-stone-400 hover:bg-[#5fa5ba]/5 hover:text-[#5fa5ba] transition-all bg-white dark:bg-stone-900">
                            <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                    </div>
                </div>
            </ScrollAnimation>

            {/* Bottom Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                <ScrollAnimation animation="fade-up" delay={0.5} className="h-full">
                    <div className="bg-[#5fa5ba]/5 p-8 rounded-[2rem] border border-[#5fa5ba]/20 flex flex-col gap-4 h-full">
                        <div className="w-12 h-12 bg-white dark:bg-stone-900 rounded-2xl flex items-center justify-center text-[#5fa5ba] shadow-sm">
                            <span className="material-symbols-outlined font-bold text-xl">trending_up</span>
                        </div>
                        <h4 className="text-lg font-bold text-stone-900 dark:text-white">Health Trend</h4>
                        <p className="text-sm text-stone-600 dark:text-stone-400 font-medium leading-relaxed">Family health scores rose <span className="text-emerald-600 font-black">+4%</span> this month. Keep up the activity levels!</p>
                    </div>
                </ScrollAnimation>

                <ScrollAnimation animation="fade-up" delay={0.6} className="h-full">
                    <div className="bg-amber-50/50 dark:bg-amber-900/10 p-8 rounded-[2rem] border border-amber-100 dark:border-amber-900/30 flex flex-col gap-4 h-full">
                        <div className="w-12 h-12 bg-white dark:bg-stone-900 rounded-2xl flex items-center justify-center text-amber-500 shadow-sm">
                            <span className="material-symbols-outlined font-bold text-xl">lightbulb</span>
                        </div>
                        <h4 className="text-lg font-bold text-stone-900 dark:text-white">Smart Alert</h4>
                        <p className="text-sm text-stone-600 dark:text-stone-400 font-medium leading-relaxed">Eleanor's recent reports show a slight BP spike. Consider checking her sodium intake.</p>
                    </div>
                </ScrollAnimation>

                <ScrollAnimation animation="fade-up" delay={0.7} className="h-full">
                    <div className="bg-[#5fa5ba]/5 p-8 rounded-[2rem] border border-[#5fa5ba]/20 flex flex-col gap-4 h-full">
                        <div className="w-12 h-12 bg-white dark:bg-stone-900 rounded-2xl flex items-center justify-center text-[#5fa5ba] shadow-sm">
                            <span className="material-symbols-outlined font-bold text-xl">verified</span>
                        </div>
                        <h4 className="text-lg font-bold text-stone-900 dark:text-white">Daily Compliance</h4>
                        <p className="text-sm text-stone-600 dark:text-stone-400 font-medium leading-relaxed">Excellent! <span className="text-[#5fa5ba] font-black">98%</span> of daily checks were logged. Your family care is on track.</p>
                    </div>
                </ScrollAnimation>
            </div>
        </div>
    );
};

export default CareReport;
