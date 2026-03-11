import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { authApi } from '../../lib/api';

const CaregiverLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const navItems = [
        { name: 'Dashboard', path: '/caregiver', icon: 'dashboard', end: true },
        { name: 'My Schedule', path: '/caregiver/my-schedule', icon: 'calendar_month' },
        { name: 'Care Logs', path: '/caregiver/care-logs', icon: 'history_edu' },
        { name: 'Incidents', path: '/caregiver/incidents', icon: 'warning' },
        { name: 'Reports', path: '/caregiver/reports', icon: 'analytics' },
        { name: 'Profile', path: '/caregiver/profile', icon: 'person' },
    ];

    const handleLogout = () => {
        authApi.logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-background-light dark:bg-stone-950 font-manrope overflow-hidden text-stone-800">
            {/* Sidebar */}
            <aside
                className={`${isSidebarOpen ? 'w-[280px]' : 'w-[80px]'
                    } bg-white dark:bg-stone-900 border-r border-stone-100 dark:border-stone-800 transition-all duration-300 flex flex-col z-20 shadow-xl shadow-stone-200/50`}
            >
                <div className={`h-20 flex items-center ${isSidebarOpen ? 'justify-between px-8' : 'justify-center'} border-b border-stone-100 dark:border-stone-800`}>
                    {isSidebarOpen && (
                        <span className="text-xl font-extrabold text-[#5fa5ba] tracking-tight flex items-center gap-2">
                            <span className="material-symbols-outlined text-2xl">health_and_safety</span>
                            HomeCare
                        </span>
                    )}
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-xl hover:bg-stone-50 text-stone-400 hover:text-[#5fa5ba] transition-all"
                    >
                        <span className="material-symbols-outlined text-xl">{isSidebarOpen ? 'menu_open' : 'menu'}</span>
                    </button>
                </div>

                <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-semibold whitespace-nowrap overflow-hidden group border border-transparent ${isActive
                                    ? 'bg-[#5fa5ba] text-white shadow-lg shadow-[#5fa5ba]/25'
                                    : 'text-stone-500 hover:bg-[#5fa5ba]/5 hover:text-[#5fa5ba] hover:border-[#5fa5ba]/10'
                                }`
                            }
                        >
                            <span className={`material-symbols-outlined text-[22px] shrink-0 ${isSidebarOpen ? '' : 'mx-auto'}`}>{item.icon}</span>
                            <span className={`transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-background-light">
                <Outlet />
            </main>
        </div>
    );
};

export default CaregiverLayout;
