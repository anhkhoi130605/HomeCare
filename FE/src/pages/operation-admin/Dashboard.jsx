import { useState, useEffect } from "react";
import { Activity, Users, Calendar, ClipboardList, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AdminHeader from "@/components/layout/AdminHeader";
import { adminApi, incidentApi, scheduleApi } from "@/lib/api";

const OperationDashboard = () => {
  const [stats, setStats] = useState({
    activeStaff: 0,
    pendingRequests: 0,
    todayVisits: 0,
    openIncidents: 0
  });
  const [todaySchedules, setTodaySchedules] = useState([]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [assignForm, setAssignForm] = useState({ requestId: "", caregiverId: "" });
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dashboardStats, incidents] = await Promise.all([
          adminApi.getDashboardStats(),
          incidentApi.getAll().catch(() => [])
        ]);
        const openCount = Array.isArray(incidents)
          ? incidents.filter(i => (i.status || '').toLowerCase() === 'open' || (i.status || '').toLowerCase() === 'inprogress').length
          : 0;
        setStats({
          activeStaff: dashboardStats.totalCaregivers || 0,
          pendingRequests: dashboardStats.pendingPayments || 0,
          todayVisits: dashboardStats.todaySchedules || 0,
          openIncidents: openCount
        });

        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        const schedules = await adminApi.getSchedules(dateStr, dateStr);
        setTodaySchedules(Array.isArray(schedules) ? schedules : []);
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

  const exportReport = () => {
    const rows = [
      ["Schedule Id", "Patient", "Caregiver", "Date", "Start", "End", "Status"],
      ...todaySchedules.map(s => [
        s.id,
        s.patientName || "",
        s.caregiverName || "",
        (s.date || "").toString().slice(0, 10),
        s.startTime || "",
        s.endTime || "",
        s.status || ""
      ])
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `operation_report_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const openAssign = async () => {
    try {
      setAssignError("");
      setAssignForm({ requestId: "", caregiverId: "" });
      const [reqs, cgs] = await Promise.all([adminApi.getPendingRequests(), adminApi.getCaregivers()]);
      setPendingRequests(Array.isArray(reqs) ? reqs : []);
      setCaregivers(Array.isArray(cgs) ? cgs : []);
      setAssignOpen(true);
    } catch (e) {
      console.error("Failed to load assign data:", e);
      setAssignError(e?.message || "Không tải được dữ liệu.");
      setAssignOpen(true);
    }
  };

  const submitAssign = async () => {
    if (!assignForm.requestId || !assignForm.caregiverId) {
      setAssignError("Vui lòng chọn Request và Caregiver.");
      return;
    }
    try {
      setAssigning(true);
      setAssignError("");
      await scheduleApi.assignFromRequest(
        parseInt(assignForm.requestId, 10),
        parseInt(assignForm.caregiverId, 10)
      );
      // refresh today's list
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const schedules = await adminApi.getSchedules(dateStr, dateStr);
      setTodaySchedules(Array.isArray(schedules) ? schedules : []);
      setAssignOpen(false);
    } catch (e) {
      console.error("Assign failed:", e);
      setAssignError(e?.message || "Không thể phân ca.");
    } finally {
      setAssigning(false);
    }
  };

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
            <Button variant="outline" onClick={exportReport}>Export Report</Button>
            <Button onClick={openAssign}>Assign Staff</Button>
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
              <div className="space-y-3">
                {todaySchedules.length === 0 ? (
                  <p className="text-sm text-stone-500">Không có lịch hôm nay.</p>
                ) : (
                  todaySchedules.slice(0, 8).map((s) => {
                    const status = (s.status || '').toLowerCase();
                    const pulseColor =
                      status === 'inprogress' ? 'bg-green-500' :
                      status === 'scheduled' ? 'bg-amber-500' :
                      status === 'completed' ? 'bg-blue-500' : 'bg-red-500';
                    const badgeClass =
                      status === 'inprogress' ? 'bg-green-100 text-green-700' :
                      status === 'scheduled' ? 'bg-amber-100 text-amber-700' :
                      status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700';
                    return (
                      <div key={s.id} className="flex items-center justify-between p-3 border rounded-lg bg-stone-50/50">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${pulseColor} ${status === 'inprogress' ? 'animate-pulse' : ''}`} />
                          <div>
                            <p className="text-sm font-medium">{s.patientName}</p>
                            <p className="text-xs text-stone-500">Staff: {s.caregiverName || 'Unassigned'}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badgeClass}`}>{s.status}</span>
                      </div>
                    );
                  })
                )}
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
      
      {assignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Assign Staff to Request</h2>
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium">Pending Request</label>
                <select
                  className="mt-1 w-full border rounded-md h-9 px-2"
                  value={assignForm.requestId}
                  onChange={(e) => setAssignForm({ ...assignForm, requestId: e.target.value })}
                >
                  <option value="">Chọn request</option>
                  {pendingRequests.map(r => (
                    <option key={r.id} value={r.id}>
                      #{r.id} • {r.patientName} • {new Date(r.StartDate || r.requestedDate).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Caregiver</label>
                <select
                  className="mt-1 w-full border rounded-md h-9 px-2"
                  value={assignForm.caregiverId}
                  onChange={(e) => setAssignForm({ ...assignForm, caregiverId: e.target.value })}
                >
                  <option value="">Chọn caregiver</option>
                  {caregivers.map(c => (
                    <option key={c.id} value={c.id}>{c.fullName}</option>
                  ))}
                </select>
              </div>
              {assignError ? <p className="text-sm text-red-600">{assignError}</p> : null}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setAssignOpen(false)}>Hủy</Button>
                <Button onClick={submitAssign} disabled={assigning}>{assigning ? "Đang phân..." : "Phân ca"}</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperationDashboard;
