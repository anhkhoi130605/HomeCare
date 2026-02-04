//admin sidebar--------------------------------------------
import { Heart, LayoutDashboard, Users, UserCheck, FileText, Calendar, BarChart3, Settings, HelpCircle, AlertTriangle, ClipboardList, UserCog } from "lucide-react";

export const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: UserCog, label: "Users", path: "/admin/users" },
  { icon: Users, label: "Patients", path: "/admin/patients" },
  { icon: UserCheck, label: "Caregivers", path: "/admin/caregivers" },
  { icon: FileText, label: "Requests", path: "/admin/requests" },
  { icon: Calendar, label: "Schedule", path: "/admin/schedule" },
  { icon: AlertTriangle, label: "Incidents", path: "/admin/incidents" },
  { icon: ClipboardList, label: "Contracts", path: "/admin/contracts" },
  { icon: BarChart3, label: "Reports", path: "/admin/reports" },
];

export const bottomItems = [
  { icon: Settings, label: "Settings", path: "/admin/settings" },
  { icon: HelpCircle, label: "Help Center", path: "/admin/help" },
];
