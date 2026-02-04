import { Link, useLocation, useNavigate } from "react-router-dom";
import { Heart, LayoutDashboard, Users, UserCheck, FileText, Calendar, BarChart3, Settings, HelpCircle, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { menuItems, bottomItems } from "@/data/layout";
import { authApi } from "@/lib/api";

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  return (
    <aside className="w-56 bg-sidebar border-r border-sidebar-border h-screen fixed left-0 top-0 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <Link to="/admin" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
            <Heart className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <span className="text-lg font-bold block leading-tight">HomeCare</span>
            <span className="text-xs text-muted-foreground">Admin Workspace</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Items */}
      <div className="p-3 space-y-1 border-t border-sidebar-border">
        {bottomItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
