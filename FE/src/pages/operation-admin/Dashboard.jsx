import { useState, useEffect } from "react";
import { Activity, Users, Calendar, ClipboardList, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AdminHeader from "@/components/layout/AdminHeader";
import { adminApi } from "@/lib/api";

const OperationDashboard = () => {
  const [stats, setStats] = useState({
    activeStaff: 0,
    pendingRequests: 0,
    todayVisits: 0,
    openIncidents: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const dashboardStats = await adminApi.getDashboardStats();
        setStats({
          activeStaff: dashboardStats.totalCaregivers || 0,
          pendingRequests: dashboardStats.pendingPayments || 0, // Using pendingPayments as placeholder for requests
          todayVisits: dashboardStats.todaySchedules || 0,
          openIncidents: dashboardStats.openIncidents || 0
        });
      } catch (error) {
        console.error("Failed to fetch operation stats:", error);
      }
    };
    fetchStats();
  }, []);

  const operationStats = [
    { label: "Active Staff", value: stats.activeStaff, icon: Users, color: "bg-blue-50", iconColor: "text-blue-500" },
    { label: "Pending Requests", value: stats.pendingRequests, icon: ClipboardList, color: "bg-amber-50", iconColor: "text-amber-500" },
    { label: "Today's Visits", value: stats.todayVisits, icon: Calendar, color: "bg-green-50", iconColor: "text-green-500" },
    { label: "Open Incidents", value: stats.openIncidents, icon: AlertTriangle, color: "bg-red-50", iconColor: "text-red-500" },
  ];

  return (
    <div className="space-y-6">
      <AdminHeader breadcrumb="Operations Dashboard" />
      
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Operations Control Center</h1>
            <p className="text-stone-500">Real-time overview of care delivery and field operations.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Export Report</Button>
            <Button>Assign Staff</Button>
          </div>
        </div>

        {/* Operation Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          {operationStats.map((stat) => (
            <Card key={stat.label} className="border-0 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-500 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold text-stone-800">{stat.value.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Live Service Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Placeholder for live status list */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg bg-stone-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <div>
                        <p className="text-sm font-medium">Service #{1000 + i}</p>
                        <p className="text-xs text-stone-500">Staff assigned: John Doe</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">In Progress</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Operational Efficiency
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[200px] flex items-center justify-center text-stone-400">
              {/* Chart placeholder */}
              <p className="text-sm">Efficiency metrics will be displayed here</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OperationDashboard;
