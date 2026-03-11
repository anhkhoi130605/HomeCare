import { useState, useEffect } from "react";
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, MoreVertical, Eye, Calendar, X } from "lucide-react";
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
import { contractApi, scheduleApi, authApi } from "@/lib/api";

const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
        case "pending":
            return "bg-amber-50 text-amber-600 border-amber-200";
        case "active":
        case "approved":
            return "bg-green-50 text-green-600 border-green-200";
        case "rejected":
        case "cancelled":
            return "bg-red-50 text-red-600 border-red-200";
        case "completed":
            return "bg-blue-50 text-blue-600 border-blue-200";
        default:
            return "bg-gray-50 text-gray-600 border-gray-200";
    }
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const Contracts = () => {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");
    const [selectedContract, setSelectedContract] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);
    const [generationResult, setGenerationResult] = useState(null);
    const canManage = authApi.getCurrentUser()?.role === "OperationAdmin";

    useEffect(() => {
        fetchContracts();
    }, []);

    const fetchContracts = async () => {
        try {
            setLoading(true);
            const data = await contractApi.getAll();
            setContracts(data || []);
        } catch (error) {
            console.error("Failed to fetch contracts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (contractId, newStatus) => {
        try {
            setUpdating(true);
            await contractApi.updateStatus(contractId, newStatus);
            await fetchContracts();
            setShowDetailModal(false);
            setSelectedContract(null);
        } catch (error) {
            console.error("Failed to update contract:", error);
            alert("Failed to update: " + error.message);
        } finally {
            setUpdating(false);
        }
    };

    const handleGenerateSchedule = async (contractId) => {
        if (!confirm("Are you sure you want to generate schedules for this contract? This may create duplicate shifts if run multiple times.")) return;
        try {
            setUpdating(true);
            const result = await scheduleApi.generateFromContract(contractId);
            setGenerationResult(result);
            setShowResultModal(true);
            setShowDetailModal(false);
        } catch (error) {
            console.error("Failed to generate schedule:", error);
            alert("Failed to generate schedule: " + (error.message || error));
        } finally {
            setUpdating(false);
        }
    };

    const filteredContracts = contracts.filter(c => {
        const status = c.status?.toLowerCase();
        if (activeTab === 'pending') return status === 'pending';
        if (activeTab === 'active') return status === 'active' || status === 'approved';
        if (activeTab === 'completed') return status === 'completed' || status === 'rejected' || status === 'cancelled';
        return true;
    });

    const stats = {
        pending: contracts.filter(c => c.status?.toLowerCase() === 'pending').length,
        active: contracts.filter(c => ['active', 'approved'].includes(c.status?.toLowerCase())).length,
        total: contracts.length
    };

    const statsCards = [
        { label: "PENDING APPROVAL", value: stats.pending, icon: Clock, color: "bg-amber-50", iconColor: "text-amber-500" },
        { label: "ACTIVE CONTRACTS", value: stats.active, icon: CheckCircle, color: "bg-green-50", iconColor: "text-green-500" },
        { label: "TOTAL CONTRACTS", value: stats.total, icon: FileText, color: "bg-blue-50", iconColor: "text-blue-500" },
    ];

    return (
        <div>
            <AdminHeader
                breadcrumb="CONTRACTS MANAGEMENT"
                searchPlaceholder="Search contracts..."
            />

            <div className="p-6 space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Contract Management</h1>
                        <p className="text-muted-foreground">Review and manage family care contracts.</p>
                    </div>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList>
                            <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                            <TabsTrigger value="pending" className="gap-1">
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                Pending ({stats.pending})
                            </TabsTrigger>
                            <TabsTrigger value="active">Active</TabsTrigger>
                            <TabsTrigger value="completed">Completed</TabsTrigger>
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

                {/* Contracts Table */}
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                <p className="text-muted-foreground">Loading contracts...</p>
                            </div>
                        ) : filteredContracts.length === 0 ? (
                            <div className="p-8 text-center">
                                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                                <p className="text-muted-foreground">No contracts found</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left p-4 text-xs font-medium text-primary uppercase tracking-wider">Contract</th>
                                        <th className="text-left p-4 text-xs font-medium text-primary uppercase tracking-wider">Family</th>
                                        <th className="text-left p-4 text-xs font-medium text-primary uppercase tracking-wider">Patient</th>
                                        <th className="text-left p-4 text-xs font-medium text-primary uppercase tracking-wider">Duration</th>
                                        <th className="text-left p-4 text-xs font-medium text-primary uppercase tracking-wider">Status</th>
                                        <th className="text-right p-4 text-xs font-medium text-primary uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredContracts.map((contract) => (
                                        <tr key={contract.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-medium">Contract #{contract.id}</p>
                                                    <p className="text-sm text-muted-foreground">{contract.serviceName || 'Care Service'}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="w-8 h-8">
                                                        <AvatarFallback>{contract.familyName?.[0] || 'F'}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm">{contract.familyName || 'Family'}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm">{contract.patientName || 'Patient'}</span>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm">
                                                    <p>{formatDate(contract.startDate)}</p>
                                                    <p className="text-muted-foreground">to {formatDate(contract.endDate)}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <Badge className={`${getStatusClass(contract.status)} border`}>
                                                    {contract.status}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedContract(contract);
                                                            setShowDetailModal(true);
                                                        }}
                                                    >
                                                        <Eye className="w-4 h-4 mr-1" />
                                                        View
                                                    </Button>
                                                    {canManage && contract.status?.toLowerCase() === 'pending' && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                className="bg-green-500 hover:bg-green-600"
                                                                onClick={() => handleUpdateStatus(contract.id, 1)} // Active
                                                            >
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => handleUpdateStatus(contract.id, 3)} // Rejected
                                                            >
                                                                Reject
                                                            </Button>
                                                        </>
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

            {/* Contract Detail Modal */}
            <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Contract Details</DialogTitle>
                    </DialogHeader>
                    {selectedContract && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Contract ID</p>
                                    <p className="font-medium">#{selectedContract.id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <Badge className={getStatusClass(selectedContract.status)}>
                                        {selectedContract.status}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Family</p>
                                    <p className="font-medium">{selectedContract.familyName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Patient</p>
                                    <p className="font-medium">{selectedContract.patientName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Service</p>
                                    <p className="font-medium">{selectedContract.serviceName || 'Care Service'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Caregiver</p>
                                    <p className="font-medium">{selectedContract.caregiverName || 'To be assigned'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Start Date</p>
                                    <p className="font-medium">{formatDate(selectedContract.startDate)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">End Date</p>
                                    <p className="font-medium">{formatDate(selectedContract.endDate)}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-muted-foreground">Total Value</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {formatCurrency(selectedContract.totalAmount)}
                                    </p>
                                </div>
                            </div>
                            {selectedContract.notes && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Notes</p>
                                    <p className="text-sm mt-1 p-3 bg-muted rounded-lg">
                                        {selectedContract.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                            Close
                        </Button>
                        {canManage && selectedContract?.status?.toLowerCase() === 'pending' && (
                            <>
                                <Button
                                    className="bg-green-500 hover:bg-green-600"
                                    disabled={updating}
                                    onClick={() => handleUpdateStatus(selectedContract.id, 1)}
                                >
                                    {updating ? "Updating..." : "Approve"}
                                </Button>
                                <Button
                                    variant="destructive"
                                    disabled={updating}
                                    onClick={() => handleUpdateStatus(selectedContract.id, 3)}
                                >
                                    {updating ? "Updating..." : "Reject"}
                                </Button>
                            </>
                        )}
                        {canManage && ['active', 'approved'].includes(selectedContract?.status?.toLowerCase()) && (
                            <Button
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                disabled={updating}
                                onClick={() => handleGenerateSchedule(selectedContract.id)}
                            >
                                <Calendar className="w-4 h-4 mr-2" />
                                Generate Schedule
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Schedule Generation Result Modal */}
            <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            Schedule Generation Result
                        </DialogTitle>
                    </DialogHeader>

                    {generationResult && (
                        <div className="space-y-6 py-4">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <Card className="bg-green-50 border-green-100">
                                    <CardContent className="p-4 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                                            <CheckCircle className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-green-700">Created Shifts</p>
                                            <p className="text-2xl font-bold text-green-800">{generationResult.generatedSchedules?.length || 0}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-amber-50 border-amber-100">
                                    <CardContent className="p-4 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white">
                                            <AlertCircle className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-amber-700">Skipped (Conflicts)</p>
                                            <p className="text-2xl font-bold text-amber-800">{generationResult.conflicts?.length || 0}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Tables Container */}
                            <div className="space-y-4">
                                {/* Success Table */}
                                {generationResult.generatedSchedules?.length > 0 && (
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-sm flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            Newly Created Shifts
                                        </h3>
                                        <div className="border rounded-lg overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead className="bg-muted text-muted-foreground uppercase text-[10px] font-bold">
                                                    <tr>
                                                        <th className="p-2 text-left">Date</th>
                                                        <th className="p-2 text-left">Time Slot</th>
                                                        <th className="p-2 text-left">Patient</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    {generationResult.generatedSchedules.slice(0, 10).map((s, idx) => (
                                                        <tr key={idx}>
                                                            <td className="p-2">{formatDate(s.date)}</td>
                                                            <td className="p-2">{s.startTime} - {s.endTime}</td>
                                                            <td className="p-2">{s.patientName}</td>
                                                        </tr>
                                                    ))}
                                                    {generationResult.generatedSchedules.length > 10 && (
                                                        <tr className="bg-muted/30">
                                                            <td colSpan="3" className="p-2 text-center text-xs text-muted-foreground">
                                                                And {generationResult.generatedSchedules.length - 10} more shifts...
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Conflict Table */}
                                {generationResult.conflicts?.length > 0 && (
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-sm flex items-center gap-2 text-amber-600">
                                            <AlertCircle className="w-4 h-4" />
                                            Skipped Slots (Conflicts)
                                        </h3>
                                        <div className="border border-amber-100 rounded-lg overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead className="bg-amber-50 text-amber-700 uppercase text-[10px] font-bold">
                                                    <tr>
                                                        <th className="p-2 text-left">Date</th>
                                                        <th className="p-2 text-left">Time Slot</th>
                                                        <th className="p-2 text-left">Reason</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-amber-100">
                                                    {generationResult.conflicts.map((c, idx) => (
                                                        <tr key={idx} className="bg-amber-50/20">
                                                            <td className="p-2 text-amber-800 font-medium">{formatDate(c.date)}</td>
                                                            <td className="p-2 text-amber-800">{c.startTime} - {c.endTime}</td>
                                                            <td className="p-2 text-amber-700 italic">{c.reason}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button className="w-full sm:w-auto" onClick={() => setShowResultModal(false)}>
                            Got it, thanks!
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Contracts;
