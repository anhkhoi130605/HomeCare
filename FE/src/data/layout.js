//admin sidebar--------------------------------------------
import { Heart, LayoutDashboard, Users, UserCheck, FileText, Calendar, BarChart3, AlertTriangle, ClipboardList, UserCog, Activity } from "lucide-react";

export const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin", roles: ["Admin"] },
  { icon: Activity, label: "Dashboard", path: "/operation-admin", roles: ["OperationAdmin"] },
  { icon: UserCog, label: "Users", path: "/admin/users", roles: ["Admin"] },
  { icon: Users, label: "Patients", path: "/admin/patients", roles: ["Admin"] },
  { icon: Users, label: "Patients", path: "/operation-admin/patients", roles: ["OperationAdmin"] },
  { icon: UserCheck, label: "Caregivers", path: "/admin/caregivers", roles: ["Admin"] },
  { icon: UserCheck, label: "Caregivers", path: "/operation-admin/caregivers", roles: ["OperationAdmin"] },
  { icon: FileText, label: "Requests", path: "/admin/requests", roles: ["Admin"] },
  { icon: FileText, label: "Requests", path: "/operation-admin/requests", roles: ["OperationAdmin"] },
  { icon: Calendar, label: "Schedule", path: "/admin/schedule", roles: ["Admin"] },
  { icon: Calendar, label: "Schedule", path: "/operation-admin/schedule", roles: ["OperationAdmin"] },
  { icon: AlertTriangle, label: "Incidents", path: "/admin/incidents", roles: ["Admin"] },
  { icon: AlertTriangle, label: "Incidents", path: "/operation-admin/incidents", roles: ["OperationAdmin"] },
  { icon: ClipboardList, label: "Contracts", path: "/admin/contracts", roles: ["Admin"] },
  { icon: ClipboardList, label: "Contracts", path: "/operation-admin/contracts", roles: ["OperationAdmin"] },
  { icon: BarChart3, label: "Reports", path: "/admin/reports", roles: ["Admin"] },
  { icon: BarChart3, label: "Reports", path: "/operation-admin/reports", roles: ["OperationAdmin"] },
];

export const bottomItems = [
  // removed
];
