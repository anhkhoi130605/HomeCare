import { useState, useEffect } from "react";
import { AlertTriangle, Clock, CheckCircle, Search, Filter, MoreVertical, Eye, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import AdminHeader from "@/components/layout/AdminHeader";
import { incidentApi } from "@/lib/api";

const getSeverityClass = (severity) => {
    switch (severity?.toLowerCase()) {
        case "critical":
            return "bg-red-100 text-red-700 border-red-200";
        case "high":
            return "bg-orange-100 text-orange-700 border-orange-200";
        case "medium":
            return "bg-amber-100 text-amber-700 border-amber-200";
        default:
            return "bg-gray-100 text-gray-700 border-gray-200";
    }
};

const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
        case "open":
            return "bg-red-50 text-red-600 border-red-200";
        case "inprogress":
            return "bg-blue-50 text-blue-600 border-blue-200";
        case "resolved":
            return "bg-green-50 text-green-600 border-green-200";
        default:
            return "bg-gray-50 text-gray-600 border-gray-200";
    }
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const Incidents = () => {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [showResolveModal, setShowResolveModal] = useState(false);
    const [resolution, setResolution] = useState("");
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchIncidents();
    }, []);

    const fetchIncidents = async () => {
        try {
            setLoading(true);
            const data = await incidentApi.getAll();
            setIncidents(data || []);
        } catch (error) {
            console.error("Failed to fetch incidents:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async () => {
        if (!selectedIncident) return;
        try {
            setUpdating(true);
            await incidentApi.updateStatus(selectedIncident.id, {
                status: 2, // Resolved
                resolution: resolution
            });
            await fetchIncidents();
            setShowResolveModal(false);
            setSelectedIncident(null);
            setResolution("");
        } catch (error) {
            console.error("Failed to resolve incident:", error);
            alert("Failed to resolve incident: " + error.message);
        } finally {
            setUpdating(false);
        }
    };

    const handleMarkInProgress = async (incident) => {
        try {
            await incidentApi.updateStatus(incident.id, {
                status: 1 // InProgress
            });
            await fetchIncidents();
        } catch (error) {
            console.error("Failed to update incident:", error);
        }
    };

    const filteredIncidents = incidents.filter(i => {
        if (activeTab === 'open') return i.status === 'Open';
        if (activeTab === 'inprogress') return i.status === 'InProgress';
        if (activeTab === 'resolved') return i.status === 'Resolved';
        return true;
    });

    const stats = {
        open: incidents.filter(i => i.status === 'Open').length,
        critical: incidents.filter(i => i.severity === 'Critical' && i.status !== 'Resolved').length,
        resolvedToday: incidents.filter(i => {
            if (i.status !== 'Resolved' || !i.resolvedAt) return false;
            const resolved = new Date(i.resolvedAt);
            const today = new Date();
            return resolved.toDateString() === today.toDateString();
        }).length
    };

    const statsCards = [
        { label: "OPEN INCIDENTS", value: stats.open, icon: AlertTriangle, color: "bg-red-50", iconColor: "text-red-500" },
        { label: "CRITICAL PRIORITY", value: stats.critical, icon: XCircle, color: "bg-orange-50", iconColor: "text-orange-500" },
        { label: "RESOLVED TODAY", value: stats.resolvedToday, icon: CheckCircle, color: "bg-green-50", iconColor: "text-green-500" },
    ];

    return (
        <div>
            <AdminHeader
                breadcrumb="INCIDENT MANAGEMENT"
                searchPlaceholder="Search incidents..."
            />

            <div className="p-6 space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Incident Reports</h1>
                        <p className="text-muted-foreground">Review and manage incident reports from caregivers.</p>
                    </div>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList>
                            <TabsTrigger value="all">
                                All ({incidents.length})
                            </TabsTrigger>
                            <TabsTrigger value="open" className="gap-1">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                Open ({stats.open})
                            </TabsTrigger>
                            <TabsTrigger value="inprogress">
                                In Progress
                            </TabsTrigger>
                            <TabsTrigger value="resolved">
                                Resolved
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Stats Cards */}
                <div className="grid md:grid-cols-3 gap-4">
                    {statsCards.map((stat) => (
                        <Card key={stat.label} className="border-0 shadow-sm">
                            <CardContent className="flex items-center gap-4 p-6">
                                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                                </div>
                                <div>
                                    <p className="text-xs text-primary font-medium uppercase tracking-wider">{stat.label}</p>
                                    <p className="text-2xl font-bold">{loading ? "..." : stat.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Incidents Table */}
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                <p className="text-muted-foreground">Loading incidents...</p>
                            </div>
                        ) : filteredIncidents.length === 0 ? (
                            <div className="p-8 text-center">
                                <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                                <p className="text-muted-foreground">No incidents found</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left p-4 text-xs font-medium text-primary uppercase tracking-wider">Incident</th>
                                        <th className="text-left p-4 text-xs font-medium text-primary uppercase tracking-wider">Reporter</th>
                                        <th className="text-left p-4 text-xs font-medium text-primary uppercase tracking-wider">Patient</th>
                                        <th className="text-left p-4 text-xs font-medium text-primary uppercase tracking-wider">Severity</th>
                                        <th className="text-left p-4 text-xs font-medium text-primary uppercase tracking-wider">Status</th>
                                        <th className="text-left p-4 text-xs font-medium text-primary uppercase tracking-wider">Reported</th>
                                        <th className="text-right p-4 text-xs font-medium text-primary uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredIncidents.map((incident) => (
                                        <tr key={incident.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-medium">{incident.title}</p>
                                                    <p className="text-sm text-muted-foreground line-clamp-1">{incident.description}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="w-8 h-8">
                                                        <AvatarFallback>{incident.caregiverName?.[0] || 'C'}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm">{incident.caregiverName}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm">{incident.patientName}</span>
                                            </td>
                                            <td className="p-4">
                                                <Badge className={`${getSeverityClass(incident.severity)} border`}>
                                                    {incident.severity}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <Badge className={`${getStatusClass(incident.status)} border`}>
                                                    {incident.status}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm text-muted-foreground">{formatDate(incident.reportedAt)}</span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    {incident.status === 'Open' && (
                                                        <>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleMarkInProgress(incident)}
                                                            >
                                                                Mark In Progress
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedIncident(incident);
                                                                    setShowResolveModal(true);
                                                                }}
                                                            >
                                                                Resolve
                                                            </Button>
                                                        </>
                                                    )}
                                                    {incident.status === 'InProgress' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedIncident(incident);
                                                                setShowResolveModal(true);
                                                            }}
                                                        >
                                                            Resolve
                                                        </Button>
                                                    )}
                                                    {incident.status === 'Resolved' && (
                                                        <span className="text-sm text-green-600 flex items-center gap-1">
                                                            <CheckCircle className="w-4 h-4" />
                                                            Resolved
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Resolve Modal */}
            <Dialog open={showResolveModal} onOpenChange={setShowResolveModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Resolve Incident</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {selectedIncident && (
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="font-medium">{selectedIncident.title}</p>
                                <p className="text-sm text-muted-foreground mt-1">{selectedIncident.description}</p>
                                <div className="flex gap-2 mt-2">
                                    <Badge className={getSeverityClass(selectedIncident.severity)}>
                                        {selectedIncident.severity}
                                    </Badge>
                                </div>
                            </div>
                        )}
                        <div>
                            <label className="text-sm font-medium mb-2 block">Resolution Notes</label>
                            <textarea
                                value={resolution}
                                onChange={(e) => setResolution(e.target.value)}
                                className="w-full p-3 border rounded-lg min-h-[100px] resize-none"
                                placeholder="Describe how the incident was resolved..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowResolveModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleResolve} disabled={updating}>
                            {updating ? "Resolving..." : "Mark as Resolved"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Incidents;
