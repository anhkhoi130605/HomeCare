import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

const CaregiverLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const navItems = [
        { name: 'Dashboard', path: '/caregiver', icon: 'dashboard', end: true },
        { name: 'Active Shift', path: '/caregiver/active-shift', icon: 'health_and_safety' },
        { name: 'Care Logs', path: '/caregiver/care-logs', icon: 'history_edu' },
        { name: 'My Schedule', path: '/caregiver/my-schedule', icon: 'calendar_month' },
        { name: 'Incidents', path: '/caregiver/incidents', icon: 'warning' },
        { name: 'Reports', path: '/caregiver/reports', icon: 'analytics' },
        { name: 'Profile', path: '/caregiver/profile', icon: 'person' },
    ];

    const handleLogout = () => {
        // Add logout logic here (clear tokens, etc.)
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
            {/* Sidebar */}
            <aside
                className={`${isSidebarOpen ? 'w-64' : 'w-20'
                    } bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col z-20 shadow-xl`}
            >
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-700">
                    {isSidebarOpen && (
                        <span className="text-xl font-bold text-teal-600 tracking-tight flex items-center gap-2">
                            <span className="material-symbols-outlined text-2xl">medical_services</span>
                            CareFlow
                        </span>
                    )}
                    <button
                        onClick={toggleSidebar}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors mx-auto"
                    >
                        <span className="material-symbols-outlined">{isSidebarOpen ? 'menu_open' : 'menu'}</span>
                    </button>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-medium group ${isActive
                                    ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-200'
                                }`
                            }
                        >
                            <span className={`material-symbols-outlined text-2xl ${isSidebarOpen ? '' : 'mx-auto'}`}>{item.icon}</span>
                            {isSidebarOpen && <span className="text-sm">{item.name}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100 dark:border-slate-700">
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all font-medium ${isSidebarOpen ? '' : 'justify-center'}`}
                    >
                        <span className="material-symbols-outlined text-2xl">logout</span>
                        {isSidebarOpen && <span className="text-sm">Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <Outlet />
            </main>
        </div>
    );
};

export default CaregiverLayout;
