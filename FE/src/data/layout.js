//admin sidebar--------------------------------------------
import { Heart, LayoutDashboard, Users, UserCheck, FileText, Calendar, BarChart3, Settings, HelpCircle, AlertTriangle, ClipboardList, UserCog, Activity } from "lucide-react";

export const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin", roles: ["Admin"] },
  { icon: Activity, label: "Dashboard", path: "/operation-admin", roles: ["OperationAdmin"] },
  { icon: UserCog, label: "Users", path: "/admin/users", roles: ["Admin"] },
  { icon: Users, label: "Patients", path: "/admin/patients", roles: ["Admin"] },
  { icon: UserCheck, label: "Caregivers", path: "/admin/caregivers", roles: ["Admin"] },
  { icon: FileText, label: "Requests", path: "/admin/requests", roles: ["Admin"] },
  { icon: Calendar, label: "Schedule", path: "/admin/schedule", roles: ["Admin"] },
  { icon: AlertTriangle, label: "Incidents", path: "/admin/incidents", roles: ["Admin"] },
  { icon: ClipboardList, label: "Contracts", path: "/admin/contracts", roles: ["Admin"] },
  { icon: BarChart3, label: "Reports", path: "/admin/reports", roles: ["Admin"] },
];

export const bottomItems = [
  { icon: Settings, label: "Settings", path: "/admin/settings", roles: ["Admin"] },
  { icon: HelpCircle, label: "Help Center", path: "/admin/help", roles: ["Admin", "OperationAdmin"] },
];
