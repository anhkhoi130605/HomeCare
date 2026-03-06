import { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import NotificationBell from "../shared/NotificationBell";
import { authApi } from "@/lib/api";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const user = authApi.getCurrentUser();
  const profileImage = user?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'Admin')}&background=5fa5ba&color=fff&size=128`;
  const homePath = (user?.role === "OperationAdmin") ? "/operation-admin" : "/admin";

  const handleLogout = () => {
    authApi.logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-background-light font-manrope">
      <AdminSidebar sidebarOpen={sidebarOpen} />
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-[280px]' : 'ml-[80px]'}`}>
        <nav className="sticky top-0 bg-background-light/90 backdrop-blur-md z-40 px-8 py-2 flex items-center justify-between border-b border-teal-50/50">
          <div className="flex items-center gap-4">
            <button
              className={`p-2.5 text-stone-400 hover:text-primary hover:bg-teal-50 rounded-xl transition-all ${!sidebarOpen && 'bg-teal-50 text-primary ring-2 ring-teal-100'}`}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span className="material-symbols-outlined text-2xl">menu_open</span>
            </button>
          </div>
          <div className="flex items-center gap-6">
            <NotificationBell />
            <button
              className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-primary bg-white rounded-full shadow-sm border border-stone-100/50 transition-all"
              onClick={() => document.documentElement.classList.toggle('dark')}
            >
              <span className="material-symbols-outlined">light_mode</span>
            </button>
            <Link to={homePath} className="flex items-center gap-3.5 ml-2 border-l pl-6 border-stone-100 hover:opacity-80 transition-opacity group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-stone-900 leading-tight group-hover:text-[#5fa5ba] transition-colors">{user?.fullName || user?.email?.split('@')[0] || 'Admin'}</p>
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
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
