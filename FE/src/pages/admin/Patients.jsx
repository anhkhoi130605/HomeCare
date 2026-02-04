import { useState, useEffect } from "react";
import { Search, Filter, UserPlus, ChevronLeft, ChevronRight, Eye, MoreVertical, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import AdminHeader from "@/components/layout/AdminHeader";
import { adminApi } from "@/lib/api";

const getRiskColor = (condition) => {
  if (!condition) return 'bg-gray-100 text-gray-800';
  const lowerCondition = condition.toLowerCase();
  if (lowerCondition.includes('critical') || lowerCondition.includes('urgent') || lowerCondition.includes('emergency')) {
    return 'bg-red-100 text-red-800';
  }
  if (lowerCondition.includes('monitor') || lowerCondition.includes('care')) {
    return 'bg-yellow-100 text-yellow-800';
  }
  return 'bg-green-100 text-green-800';
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-800";
    case "on hold":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-blue-100 text-blue-700";
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return "No visits yet";
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const data = await adminApi.getPatients();
        setPatients(data || []);
      } catch (error) {
        console.error("Failed to fetch patients:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(p =>
    p.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.familyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: patients.length,
    active: patients.filter(p => p.status === 'Active').length,
    highRisk: patients.filter(p => p.currentCondition?.toLowerCase().includes('monitor')).length,
    newThisMonth: patients.length // Simplified - would need createdAt check
  };

  const statsCards = [
    { label: "TOTAL PATIENTS", value: stats.total.toString(), icon: "👥", color: "bg-blue-50" },
    { label: "ACTIVE CARE PLANS", value: stats.active.toString(), icon: "📋", color: "bg-green-50" },
    { label: "NEED MONITORING", value: stats.highRisk.toString(), icon: "⚠️", color: "bg-red-50" },
    { label: "NEW THIS MONTH", value: stats.newThisMonth.toString(), icon: "✨", color: "bg-amber-50" },
  ];

  return (
    <div>
      <AdminHeader
        breadcrumb="Patient Directory"
        searchPlaceholder="Search patients by name, ID, or condition..."
      />

      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Patient Directory</h1>
            <p className="text-muted-foreground">Manage patient records, care plans, and health monitoring.</p>
          </div>
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
            <Button size="sm" className="gap-2">
              <UserPlus className="w-4 h-4" />
              Add New Patient
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          {statsCards.map((stat) => (
            <Card key={stat.label} className="border-0 shadow-sm">
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-2xl`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xs text-primary font-medium uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold">{loading ? "..." : stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Patients Table */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-muted-foreground">Loading patients...</p>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No patients found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-xs font-medium text-primary uppercase tracking-wider">Patient</th>
                    <th className="text-left p-4 text-xs font-medium text-primary uppercase tracking-wider">Family</th>
                    <th className="text-left p-4 text-xs font-medium text-primary uppercase tracking-wider">Assigned Caregiver</th>
                    <th className="text-left p-4 text-xs font-medium text-primary uppercase tracking-wider">Condition</th>
                    <th className="text-left p-4 text-xs font-medium text-primary uppercase tracking-wider">Status</th>
                    <th className="text-left p-4 text-xs font-medium text-primary uppercase tracking-wider">Last Visit</th>
                    <th className="text-right p-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{patient.fullName?.[0] || 'P'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{patient.fullName}</p>
                            <p className="text-sm text-muted-foreground">
                              {patient.age} yrs • {patient.gender} • ID: PAT-{patient.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm">{patient.familyName}</td>
                      <td className="p-4 text-sm">{patient.caregiverName || 'Unassigned'}</td>
                      <td className="p-4">
                        <Badge className={`text-[10px] ${getRiskColor(patient.currentCondition)}`}>
                          {patient.currentCondition || 'Normal'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge className={`text-[10px] ${getStatusColor(patient.status)}`}>
                          {patient.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{formatDate(patient.lastVisit)}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" className="gap-1">
                            <Activity className="w-3 h-3" />
                            View Log
                          </Button>
                          <Button variant="ghost" size="icon" className="w-8 h-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Pagination */}
            <div className="p-4 border-t border-border flex items-center justify-between">
              <p className="text-sm text-primary">Showing {filteredPatients.length} of {patients.length} patients</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="w-8 h-8">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="w-8 h-8">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Patients;
