import { Link, useLocation } from "react-router-dom";
import { Heart, LayoutDashboard, Users, UserCheck, FileText, Calendar, BarChart3, Settings, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { menuItems, bottomItems } from "@/data/layout";
import { authApi } from "@/lib/api";

const AdminSidebar = ({ sidebarOpen = true }) => {
  const location = useLocation();
  const user = authApi.getCurrentUser();
  const userRole = user?.role; // Backend role e.g. "Admin", "OperationAdmin"

  const filteredMenuItems = menuItems.filter(item => 
    !item.roles || item.roles.includes(userRole)
  );

  const filteredBottomItems = bottomItems.filter(item => 
    !item.roles || item.roles.includes(userRole)
  );

  return (
    <aside className={`${sidebarOpen ? 'w-[280px]' : 'w-[80px]'} bg-cream-sidebar border-r border-teal-50 h-screen fixed left-0 top-0 flex flex-col transition-all duration-300`}>
      <div className={`p-4 border-b border-teal-50 ${!sidebarOpen && 'flex justify-center'}`}>
        <Link to={userRole === "OperationAdmin" ? "/operation-admin" : "/admin"} className={`flex items-center gap-2 ${!sidebarOpen && 'justify-center'}`}>
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
            <Heart className="w-5 h-5 text-primary-foreground" />
          </div>
          {sidebarOpen && (
            <div>
              <span className="text-lg font-bold block leading-tight">HomeCare</span>
              <span className="text-xs text-muted-foreground">{userRole === "OperationAdmin" ? "Operations" : "Admin Workspace"}</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-2">
        {filteredMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                `flex items-center ${sidebarOpen ? 'gap-4 px-5' : 'justify-center px-2'} py-3.5 rounded-2xl transition-all font-semibold whitespace-nowrap overflow-hidden`,
                isActive
                  ? "bg-primary text-primary-foreground shadow-xl shadow-teal-200/50"
                  : "text-stone-500 hover:bg-teal-50 hover:text-primary"
              )}
            >
              <item.icon className="w-5 h-5" />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Items */}
      <div className="p-3 space-y-2 border-t border-teal-50">
        {filteredBottomItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                `flex items-center ${sidebarOpen ? 'gap-4 px-5' : 'justify-center px-2'} py-3.5 rounded-2xl transition-all font-semibold whitespace-nowrap overflow-hidden`,
                isActive
                  ? "bg-primary text-primary-foreground shadow-xl shadow-teal-200/50"
                  : "text-stone-500 hover:bg-teal-50 hover:text-primary"
              )}
            >
              <item.icon className="w-5 h-5" />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          );
        })}
      </div>
    </aside>
  );
};

export default AdminSidebar;
