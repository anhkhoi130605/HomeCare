import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { ChevronLeft, CheckCircle, Send, AlertTriangle, Activity, Pill, UtensilsCrossed, PersonStanding, Clock, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { careLogApi, adminApi } from "@/lib/api";

const CareLogDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const [careLog, setCareLog] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  const isOperationAdmin = location.pathname.startsWith('/operation-admin');
  const basePath = isOperationAdmin ? '/operation-admin' : '/admin';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const logData = await careLogApi.getById(id);
        setCareLog(logData);

        // Fetch patient data if available
        if (logData?.patientId) {
          const patients = await adminApi.getPatients();
          const foundPatient = patients?.find(p => p.id === logData.patientId);
          setPatient(foundPatient);
        }
      } catch (error) {
        console.error("Failed to fetch care log:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!careLog) {
    return (
      <div className="p-6">
        <Link to={`${basePath}/reports`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4" />
          Back to Reports
        </Link>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Care log not found</p>
        </div>
      </div>
    );
  }

  // Parse vital signs from notes or use defaults
  const vitalSigns = [
    { label: "BLOOD PRESSURE", value: careLog.bloodPressure || "N/A", status: "RECORDED", statusColor: "bg-blue-100 text-blue-700", target: "Target: < 130/80 mmHg" },
    { label: "HEART RATE", value: careLog.heartRate || "N/A", unit: "BPM", status: "STABLE", statusColor: "bg-green-100 text-green-700", target: "Resting range: 60-100" },
    { label: "TEMPERATURE", value: careLog.temperature || "N/A", unit: "°C", status: "NORMAL", statusColor: "bg-green-100 text-green-700", target: "Normal: 36-37°C" },
  ];

  return (
    <div>
      {/* Breadcrumb Header */}
      <header className="h-14 bg-background border-b border-border flex items-center justify-between px-6">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to={basePath} className="hover:text-foreground">{isOperationAdmin ? 'Operations' : 'Admin'}</Link>
          <span>›</span>
          <Link to={`${basePath}/reports`} className="hover:text-foreground">Care Log Monitoring</Link>
          <span>›</span>
          <span className="text-foreground font-medium">{careLog.patientName?.toUpperCase() || 'CARE'} LOG</span>
        </nav>
      </header>

      <div className="p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Log Header */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">{careLog.patientName} - Care Log</h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>Caregiver: {careLog.caregiverName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Submitted: {formatDate(careLog.createdAt)}, {formatTime(careLog.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button className="gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Acknowledge Log
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Send className="w-4 h-4" />
                      Send Summary
                    </Button>
                    <Button variant="destructive" className="gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Escalate
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vital Signs */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Vital Signs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {vitalSigns.map((vital) => (
                    <Card key={vital.label} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-primary">
                            {vital.label}
                          </span>
                          <Badge className={vital.statusColor}>{vital.status}</Badge>
                        </div>
                        <p className="text-3xl font-bold">
                          {vital.value}
                          {vital.unit && <span className="text-lg font-normal text-muted-foreground ml-1">{vital.unit}</span>}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{vital.target}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Care Activities */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="w-5 h-5 text-primary" />
                  Care Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">ACTIVITIES PERFORMED</h4>
                    <p className="text-sm">{careLog.activitiesPerformed || 'No activities recorded'}</p>
                  </div>
                  {careLog.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">CAREGIVER NOTES</h4>
                      <p className="text-sm">{careLog.notes}</p>
                    </div>
                  )}
                  {careLog.medicationsGiven && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">MEDICATIONS GIVEN</h4>
                      <p className="text-sm">{careLog.medicationsGiven}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Nutrition & Mobility */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UtensilsCrossed className="w-5 h-5 text-primary" />
                    Nutrition & Hydration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Meals</span>
                    <span className="font-medium">{careLog.mealsProvided || 'Not recorded'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Appetite</span>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                      {careLog.appetiteLevel || 'Normal'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-primary font-medium">WATER INTAKE</span>
                    <span className="font-medium">{careLog.waterIntake || 'Not recorded'}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PersonStanding className="w-5 h-5 text-primary" />
                    Mobility & Exercise
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Activity Type</span>
                    <span className="font-medium">{careLog.mobilityAssistance || 'Assisted'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Mood</span>
                    <span className="font-medium">{careLog.moodObservation || 'Good'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Patient Sidebar */}
          <div className="space-y-6">
            {/* Patient Profile */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarFallback>{careLog.patientName?.[0] || 'P'}</AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-bold">{careLog.patientName}</h3>
                <p className="text-muted-foreground text-sm">Patient ID: {careLog.patientId}</p>

                {patient && (
                  <>
                    <div className="grid grid-cols-2 gap-4 mt-6 text-left">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground uppercase">Age</p>
                        <p className="font-semibold">{patient.age} Years</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground uppercase">Gender</p>
                        <p className="font-semibold">{patient.gender}</p>
                      </div>
                    </div>

                    {patient.currentCondition && (
                      <div className="mt-4 text-left">
                        <p className="text-xs text-primary font-medium uppercase mb-2">Current Condition</p>
                        <Badge variant="secondary">{patient.currentCondition}</Badge>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Schedule Info */}
            <Card className="border-0 shadow-sm bg-primary text-primary-foreground">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5" />
                  <span className="font-semibold">Schedule Info</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-primary-foreground/70">Schedule ID</span>
                    <span className="font-medium">{careLog.scheduleId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-primary-foreground/70">Log Date</span>
                    <span className="font-medium">{formatDate(careLog.logDate || careLog.createdAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Log History */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Log Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-xs text-muted-foreground">{formatDate(careLog.createdAt)} {formatTime(careLog.createdAt)}</p>
                  </div>
                </div>
                {careLog.updatedAt && careLog.updatedAt !== careLog.createdAt && (
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Last Updated</p>
                      <p className="text-xs text-muted-foreground">{formatDate(careLog.updatedAt)} {formatTime(careLog.updatedAt)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareLogDetail;
