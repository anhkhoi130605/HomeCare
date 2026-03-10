import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { navItems } from '../../data/Family/layout';
import { authApi } from '../../lib/api';
import NotificationBell from '../shared/NotificationBell';

const FamilyLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    // Get user from localStorage
    const [user, setUser] = useState(() => authApi.getCurrentUser());
    const [profileImage, setProfileImage] = useState(
        user?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=5fa5ba&color=fff&size=128`
    );

    const handleLogout = () => {
        authApi.logout();
        navigate('/login');
    };

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="flex min-h-screen bg-background-light font-manrope">
            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full bg-cream-sidebar dark:bg-stone-950 border-r border-teal-50 dark:border-stone-800 z-50 flex flex-col transition-all duration-300 overflow-hidden ${sidebarOpen ? 'w-[280px]' : 'w-[80px]'
                    }`}
            >
                <div className={`p-6 ${!sidebarOpen && 'flex flex-col items-center'}`}>
                    <Link to="/family" className={`flex items-center gap-3 text-primary mb-12 hover:opacity-80 transition-opacity whitespace-nowrap ${!sidebarOpen && 'justify-center'}`}>
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-100 shrink-0">
                            <span className="material-symbols-outlined text-2xl">home_health</span>
                        </div>
                        <span className={`text-2xl font-extrabold tracking-tight transition-opacity duration-200 ${!sidebarOpen ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>HomeCare</span>
                    </Link>
                    <nav className="space-y-2 w-full">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center ${sidebarOpen ? 'gap-4 px-5' : 'justify-center px-2'} py-3.5 rounded-2xl transition-all duration-300 font-semibold whitespace-nowrap overflow-hidden ${isActive
                                        ? 'bg-primary text-white shadow-xl shadow-teal-200/50'
                                        : 'text-stone-500 hover:bg-teal-50 hover:text-primary'
                                    }`
                                }
                                end={item.path === '/family'}
                                title={!sidebarOpen ? item.label : ''}
                            >
                                <span className={`material-symbols-outlined text-[22px] shrink-0 ${location.pathname === item.path ? 'fill' : ''}`}>
                                    {item.icon}
                                </span>
                                <span className={`transition-all duration-200 ${!sidebarOpen ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>
                </div>
                <div className="mt-auto p-6">
                    <div className={`bg-white dark:bg-stone-900 rounded-3xl border border-teal-50 dark:border-stone-800 shadow-sm transition-all duration-300 ${sidebarOpen ? 'p-5' : 'p-3 flex justify-center'}`}>
                        <div className={`flex items-center ${sidebarOpen ? 'gap-4' : 'justify-center'}`}>
                            <div className="w-11 h-11 rounded-2xl bg-teal-50 flex items-center justify-center text-primary shrink-0">
                                <span className="material-symbols-outlined">support_agent</span>
                            </div>
                            {sidebarOpen && (
                                <div className="overflow-hidden">
                                    <p className="text-[11px] font-black text-stone-400 uppercase tracking-[2px] leading-tight mb-0.5 whitespace-nowrap">Support</p>
                                    <p className="text-sm font-bold whitespace-nowrap">Help Center</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-[280px]' : 'ml-[80px]'}`}>
                <nav className="sticky top-0 bg-background-light/90 dark:bg-stone-900/90 backdrop-blur-md z-40 px-8 py-2 flex items-center justify-between border-b border-teal-50/50 dark:border-stone-800">
                    <div className="flex items-center gap-4">
                        <button
                            className={`p-2.5 text-stone-400 hover:text-primary hover:bg-teal-50 rounded-xl transition-all ${!sidebarOpen && 'bg-teal-50 text-primary ring-2 ring-teal-100'}`}
                            onClick={toggleSidebar}
                        >
                            <span className="material-symbols-outlined text-2xl">menu_open</span>
                        </button>
                    </div>
                    <div className="flex items-center gap-6">
                        <NotificationBell />
                        <button
                            className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-primary bg-white dark:bg-stone-800 rounded-full shadow-sm border border-stone-100/50 transition-all"
                            onClick={() => document.documentElement.classList.toggle('dark')}
                        >
                            <span className="material-symbols-outlined">light_mode</span>
                        </button>
                        <Link to="/family/profile" className="flex items-center gap-3.5 ml-2 border-l pl-6 border-stone-100 dark:border-stone-800 hover:opacity-80 transition-opacity group">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-stone-900 leading-tight group-hover:text-[#5fa5ba] transition-colors">{user?.fullName || 'User'}</p>
                                <p className="text-xs text-primary font-black uppercase tracking-wider mt-0.5">Family Manager</p>
                            </div>
                            <div className="relative">
                                <img
                                    alt="Profile"
                                    className="w-10 h-10 rounded-2xl object-cover border-2 border-white shadow-md ring-1 ring-teal-100 group-hover:ring-[#5fa5ba] transition-all"
                                    src={profileImage}
                                />
                                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                            </div>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="ml-2 p-2.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Logout"
                        >
                            <span className="material-symbols-outlined text-xl">logout</span>
                        </button>
                    </div>
                </nav>
                <div className="px-6 py-4 md:px-12 md:py-6 w-full">
                    <Outlet context={[profileImage, setProfileImage]} />
                </div>
            </div>
        </div>
    );
};

export default FamilyLayout;