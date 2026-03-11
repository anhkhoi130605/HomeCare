import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { ChevronLeft, Clock, Eye, Calendar, User, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import AdminHeader from "@/components/layout/AdminHeader";
import { careLogApi, adminApi } from "@/lib/api";

const PatientLogs = () => {
  const { id } = useParams();
  const location = useLocation();
  const [logs, setLogs] = useState([]);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  const isOperationAdmin = location.pathname.startsWith('/operation-admin');
  const basePath = isOperationAdmin ? '/operation-admin' : '/admin';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [logsData, patientsData] = await Promise.all([
          careLogApi.getByPatient(id),
          adminApi.getPatients()
        ]);
        setLogs(logsData || []);
        const foundPatient = patientsData?.find(p => p.id === parseInt(id));
        setPatient(foundPatient);
      } catch (error) {
        console.error("Failed to fetch patient logs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <AdminHeader breadcrumb={`${isOperationAdmin ? 'Operations' : 'Admin'} / Patients / ${patient?.fullName || id} / Logs`} />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to={`${basePath}/patients`}>
                <ChevronLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Care Logs History</h1>
              <p className="text-muted-foreground">Detailed daily care records for {patient?.fullName || 'Patient'}</p>
            </div>
          </div>
        </div>

        {patient && (
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6 flex items-center gap-6">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="text-xl bg-primary/10 text-primary">
                  {patient.fullName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Patient Name</p>
                  <p className="font-bold text-gray-900">{patient.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Age / Gender</p>
                  <p className="font-medium text-gray-700">{patient.age} yrs • {patient.gender}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Assigned Caregiver</p>
                  <p className="font-medium text-gray-700">{patient.caregiverName || 'Unassigned'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Status</p>
                  <Badge className={patient.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                    {patient.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader className="bg-white border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              All Submissions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 bg-white">
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground font-medium">Loading logs...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">No care logs found for this patient.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/50 border-b">
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Caregiver</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Mood</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-right px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 font-medium text-gray-900">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {formatDate(log.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            {formatTime(log.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-muted-foreground" />
                            {log.caregiverName}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                            {log.moodObservation || 'Good'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                            SUBMITTED
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="outline" size="sm" className="gap-2" asChild>
                            <Link to={`${basePath}/reports/care-log/${log.id}`}>
                              <Eye className="w-4 h-4" />
                              Details
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientLogs;
