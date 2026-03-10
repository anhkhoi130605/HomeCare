import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, UserCheck, FileText, Activity, TrendingUp, Calendar, DollarSign, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AdminHeader from "@/components/layout/AdminHeader";
import { adminApi } from "@/lib/api";
import { authApi } from "@/lib/api";

const mockStats = {
  totalPatients: 0,
  totalCaregivers: 0,
  totalFamilies: 0,
  activeContracts: 0,
  todaySchedules: 0,
  completedToday: 0,
  monthlyRevenue: 0,
  pendingPayments: 0
};

const Dashboard = () => {
  const [stats, setStats] = useState(mockStats);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = authApi.getCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, activitiesData] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getRecentActivities(5)
        ]);
        setStats(statsData);
        setActivities(activitiesData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const statsCards = [
    { label: "Total Patients", value: stats.totalPatients.toLocaleString(), icon: Users, change: "+12%", color: "bg-blue-50", iconColor: "text-blue-500" },
    { label: "Active Caregivers", value: stats.totalCaregivers.toLocaleString(), icon: UserCheck, change: "+8%", color: "bg-teal-50", iconColor: "text-teal-500" },
    { label: "Active Contracts", value: stats.activeContracts.toLocaleString(), icon: FileText, change: "+5%", color: "bg-amber-50", iconColor: "text-amber-500" },
    { label: "Today's Schedules", value: stats.todaySchedules.toLocaleString(), icon: Calendar, change: stats.completedToday.toString(), color: "bg-green-50", iconColor: "text-green-500" },
  ];

  const revenueCards = [
    { label: "Monthly Revenue", value: `${(stats.monthlyRevenue / 1000000).toFixed(1)}M VND`, icon: DollarSign, change: "+15%", color: "bg-emerald-50", iconColor: "text-emerald-500" },
    { label: "Pending Payments", value: stats.pendingPayments.toLocaleString(), icon: ClipboardList, change: "Awaiting", color: "bg-orange-50", iconColor: "text-orange-500" },
  ];

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHrs < 1) return "Just now";
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${Math.floor(diffHrs / 24)}d ago`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-500';
      case 'pending': return 'bg-amber-500';
      case 'inprogress': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div>
      <AdminHeader
        breadcrumb="Dashboard"
        searchPlaceholder="Search..."
      />

      <div className="p-6 space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.email?.split('@')[0] || 'Admin'}!</h1>
            <p className="text-muted-foreground">Here's what's happening with your care network today.</p>
          </div>
          <Button className="gap-2" onClick={() => navigate('/admin/schedule')}>
            <Calendar className="w-4 h-4" />
            View Schedule
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          {statsCards.map((stat) => (
            <Card key={stat.label} className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
              if (stat.label === "Total Patients") navigate('/admin/patients');
              if (stat.label === "Active Caregivers") navigate('/admin/caregivers');
              if (stat.label === "Active Contracts") navigate('/admin/contracts');
              if (stat.label === "Today's Schedules") navigate('/admin/schedule');
            }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${stat.change.startsWith('+') ? 'text-green-500' : 'text-muted-foreground'
                    }`}>
                    <TrendingUp className="w-4 h-4" />
                    {stat.change}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold">{loading ? "..." : stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Revenue Stats */}
        <div className="grid md:grid-cols-2 gap-4">
          {revenueCards.map((stat) => (
            <Card key={stat.label} className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
              if (stat.label === "Pending Payments") navigate('/admin/payments');
            }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                  <div className="flex items-center gap-1 text-sm text-green-500">
                    <TrendingUp className="w-4 h-4" />
                    {stat.change}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold">{loading ? "..." : stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions + Recent Activities */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/admin/patients')}>
                <Users className="w-6 h-6 text-primary" />
                <span>Add Patient</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/admin/caregivers')}>
                <UserCheck className="w-6 h-6 text-primary" />
                <span>Add Caregiver</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/admin/contracts')}>
                <FileText className="w-6 h-6 text-primary" />
                <span>New Contract</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/admin/reports')}>
                <Activity className="w-6 h-6 text-primary" />
                <span>View Reports</span>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activities.length > 0 ? (
                activities.map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(activity.status)}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.type}</p>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatTimeAgo(activity.timestamp)}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">System Ready</p>
                      <p className="text-xs text-muted-foreground">Backend connected successfully</p>
                    </div>
                    <span className="text-xs text-muted-foreground">Just now</span>
                  </div>
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Welcome</p>
                      <p className="text-xs text-muted-foreground">Start adding patients and caregivers</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
