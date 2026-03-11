import { useState, useEffect } from "react";
import { formatTimeSpan } from "@/lib/utils";
import { AlertTriangle, Clock, Users, UserPlus, Check, ChevronLeft, ChevronRight, MoreVertical, AlertCircle, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import AdminHeader from "@/components/layout/AdminHeader";
import { adminApi, careRequestApi, scheduleApi, authApi } from "@/lib/api";
import { toast } from 'sonner';

const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case "pending":
    case "awaitingpayment":
      return "bg-amber-100 text-amber-700";
    case "paid":
    case "approved":
      return "bg-green-100 text-green-700";
    case "assigned":
    case "completed":
      return "bg-blue-100 text-blue-700";
    case "rejected":
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("paid");
  const [processing, setProcessing] = useState(null);
  const currentUserRole = authApi.getCurrentUser()?.role;
  const canManage = currentUserRole === "OperationAdmin" || currentUserRole === "Admin";

  // Assign modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedCaregiver, setSelectedCaregiver] = useState('');
  const [availableCaregivers, setAvailableCaregivers] = useState([]);
  const [checkingConflict, setCheckingConflict] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [requestsData, caregiversData] = await Promise.all([
        careRequestApi.getAll(),
        adminApi.getCaregivers()
      ]);
      setRequests(requestsData || []);
      setCaregivers(caregiversData?.filter(c => c.isAvailable) || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Note: Requests don't have a separate "Approve" step anymore - they go from Paid -> Assigned when a caregiver is assigned.


  const handleReject = async (requestId, isPaid) => {
    const actionName = isPaid ? "refund and reject" : "reject";
    if (!confirm(`Are you sure you want to ${actionName} this request?`)) return;
    try {
      setProcessing(requestId);
      let updated;
      if (isPaid) {
        updated = await careRequestApi.refund(requestId, { adminNotes: "Admin refunded and rejected the request." });
        toast.success("Request refunded successfully.");
      } else {
        updated = await careRequestApi.updateStatus(requestId, { status: 6 }); // 6 = Rejected
        toast.success("Request rejected successfully.");
      }
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: updated?.status || (isPaid ? 'Cancelled' : 'Rejected') } : r));
    } catch (error) {
      console.error(`Failed to ${actionName}:`, error);
      toast.error(`Failed to ${actionName} request: ` + (error?.response?.data || error.message));
    } finally {
      setProcessing(null);
    }
  };

  const handleAssign = async () => {
    if (!selectedRequest || !selectedCaregiver) return;
    try {
      setProcessing(selectedRequest.id);
      const updated = await careRequestApi.assignCaregiver(selectedRequest.id, parseInt(selectedCaregiver));
      toast.success('Đã gán caregiver thành công!');
      setRequests(prev => prev.map(r => r.id === selectedRequest.id ? {
        ...r,
        status: updated?.status || 'Assigned',
        assignedCaregiverName: caregivers.find(c => c.id === parseInt(selectedCaregiver))?.fullName
      } : r));
      setShowAssignModal(false);
      setSelectedRequest(null);
      setSelectedCaregiver('');
    } catch (error) {
      console.error("Failed to assign:", error);
      const msg = error?.data?.message || error?.message || 'Lỗi không xác định';
      toast.error('Không thể gán caregiver: ' + msg);
    } finally {
      setProcessing(null);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      setProcessing(requestId);
      const updated = await careRequestApi.updateStatus(requestId, { status: 1 }); // 1 = AwaitingPayment
      toast.success("Request approved! Awaiting family payment.");
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: updated?.status || 'AwaitingPayment' } : r));
    } catch (error) {
      console.error("Failed to approve:", error);
      toast.error("Failed to approve request: " + error?.response?.data || error.message);
    } finally {
      setProcessing(null);
    }
  };

  const openAssignModal = async (request) => {
    if (!canManage) return;
    setSelectedRequest(request);
    setSelectedCaregiver('');
    setAvailableCaregivers([]);
    setCheckingConflict(true);
    setShowAssignModal(true);

    // Check conflicts for all caregivers in parallel
    try {
      const results = await Promise.all(
        caregivers.map(async (cg) => {
          try {
            const result = await scheduleApi.checkRequestConflict(request.id, cg.id);
            return { ...cg, hasConflict: result.hasConflict };
          } catch {
            return { ...cg, hasConflict: false }; // If check fails, assume available
          }
        })
      );
      setAvailableCaregivers(results.filter(cg => !cg.hasConflict));
    } catch (error) {
      console.error("Failed to check conflicts:", error);
      setAvailableCaregivers(caregivers); // Fallback: show all
    } finally {
      setCheckingConflict(false);
    }
  };

  const filteredRequests = requests.filter(r => {
    if (activeTab === 'pending') return r.status === 'Pending' || r.status === 'AwaitingPayment';
    if (activeTab === 'paid') return r.status === 'Paid' || r.status === 'Approved';
    if (activeTab === 'assigned') return r.status === 'Assigned';
    if (activeTab === 'rejected') return r.status === 'Rejected' || r.status === 'Cancelled';
    return true;
  });

  const stats = {
    pending: requests.filter(r => r.status === 'Pending' || r.status === 'AwaitingPayment').length,
    paid: requests.filter(r => r.status === 'Paid' || r.status === 'Approved').length,
    assigned: requests.filter(r => r.status === 'Assigned').length,
    available: caregivers.length
  };

  const statsCards = [
    { label: "AWAITING PAYMENT", value: stats.pending.toString().padStart(2, '0'), icon: AlertTriangle, color: "bg-red-50", iconColor: "text-red-500" },
    { label: "PAID - READY TO ASSIGN", value: stats.paid.toString(), icon: CheckCircle, color: "bg-green-50", iconColor: "text-green-500" },
    { label: "AVAILABLE CAREGIVERS", value: `${stats.available} Available`, icon: Users, color: "bg-teal-50", iconColor: "text-teal-500" },
  ];

  return (
    <div>
      <AdminHeader
        breadcrumb="SERVICE REQUESTS"
        searchPlaceholder="Search requests by patient or service..."
      />

      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Service Request Approval Hub</h1>
            <p className="text-muted-foreground">Review and process new care requests from families.</p>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="pending" className="gap-1">
                Pending ({stats.pending})
              </TabsTrigger>
              <TabsTrigger value="paid" className="gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Paid/Approved ({stats.paid})
              </TabsTrigger>
              <TabsTrigger value="assigned">
                Assigned ({stats.assigned})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected
              </TabsTrigger>
              <TabsTrigger value="all">
                All
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

        {/* Requests Table */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-muted-foreground">Loading requests...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No requests found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-xs font-medium text-primary uppercase tracking-wider">Patient Details</th>
                    <th className="text-left p-4 text-xs font-medium text-primary uppercase tracking-wider">Family</th>
                    <th className="text-left p-4 text-xs font-medium text-primary uppercase tracking-wider">Service</th>
                    <th className="text-left p-4 text-xs font-medium text-primary uppercase tracking-wider">Schedule</th>
                    <th className="text-left p-4 text-xs font-medium text-primary uppercase tracking-wider">Status</th>
                    <th className="text-right p-4 text-xs font-medium text-primary uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{request.patientName?.[0] || 'P'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{request.patientName}</p>
                            <p className="text-sm text-muted-foreground">ID: #RQ-{request.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm">{request.familyName}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-medium">{request.serviceName}</p>
                        <p className="text-sm text-muted-foreground">{request.type}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-medium">{formatDate(request.requestedDate)}</p>
                        <p className="text-sm text-muted-foreground">{formatTimeSpan(request.startTime)} - {formatTimeSpan(request.endTime)}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <Badge className={getStatusClass(request.status)}>
                            {request.status}
                          </Badge>
                          {request.assignedCaregiverName && (
                            <span className="text-xs text-muted-foreground">
                              Assigned: {request.assignedCaregiverName}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          {canManage && (
                            <>
                              {(request.status === 'Paid' || request.status === 'Approved' || request.status === 'AwaitingPayment') && !request.assignedCaregiverName && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1 border-blue-200 hover:bg-blue-50 text-blue-700 disabled:opacity-50"
                                  onClick={() => openAssignModal(request)}
                                  disabled={request.status === 'AwaitingPayment' || processing === request.id}
                                >
                                  <UserPlus className="w-3 h-3" />
                                  Assign Caregiver
                                </Button>
                              )}

                              {request.status === 'Pending' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1 border-green-200 hover:bg-green-50 text-green-700"
                                  onClick={() => handleApprove(request.id)}
                                  disabled={processing === request.id}
                                >
                                  <Check className="w-3 h-3" />
                                  Approve
                                </Button>
                              )}

                              {(request.status === 'Pending' || request.status === 'AwaitingPayment' || request.status === 'Paid' || request.status === 'Approved') && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="gap-1"
                                  onClick={() => handleReject(request.id, request.status === 'Paid' || request.status === 'Approved')}
                                  disabled={processing === request.id}
                                >
                                  <X className="w-3 h-3" />
                                  {(request.status === 'Paid' || request.status === 'Approved') ? "Refund & Reject" : "Reject"}
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Pagination */}
            <div className="p-4 border-t border-border flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Showing {filteredRequests.length} of {requests.length} requests</p>
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

        {/* Bottom Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Available Caregivers */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Available Caregivers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {caregivers.slice(0, 5).map((caregiver) => (
                <div key={caregiver.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={caregiver.imageUrl} />
                      <AvatarFallback>{caregiver.fullName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{caregiver.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {caregiver.specialization} • {caregiver.rating?.toFixed(1) || '0.0'} ⭐
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-green-600 bg-green-50">
                    Available
                  </Badge>
                </div>
              ))}
              {caregivers.length === 0 && (
                <p className="text-muted-foreground text-sm">No available caregivers</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-800 to-slate-900 text-white">
            <CardHeader>
              <CardTitle className="text-lg text-white">Request Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-amber-500/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 mt-0.5 text-amber-400" />
                  <div>
                    <p className="font-medium">{stats.pending} Pending / Unpaid</p>
                    <p className="text-sm text-white/70">Awaiting family payment</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-green-500/20">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 mt-0.5 text-green-400" />
                  <div>
                    <p className="font-medium">{stats.paid} Paid / Approved</p>
                    <p className="text-sm text-white/70">Ready for scheduling</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Assign Caregiver Modal */}
      {canManage && (
        <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Gán Caregiver</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              {selectedRequest && (
                <div className="mb-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Yêu cầu cho:</p>
                  <p className="font-medium">{selectedRequest.patientName}</p>
                  <p className="text-sm">{selectedRequest.serviceName}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(selectedRequest.requestedDate)} • {formatTimeSpan(selectedRequest.startTime)} - {formatTimeSpan(selectedRequest.endTime)}
                  </p>
                </div>
              )}

              {checkingConflict ? (
                <div className="flex items-center gap-2 p-4 text-center justify-center">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-muted-foreground">Đang kiểm tra lịch trùng...</p>
                </div>
              ) : availableCaregivers.length === 0 ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Không có caregiver nào rảnh!</p>
                    <p className="text-xs mt-1">
                      {caregivers.length === 0 
                        ? "Hiện không có caregiver nào đang ở trạng thái sẵn sàng (Online)." 
                        : "Tất cả caregiver sẵn sàng đều đã có lịch trùng giờ với yêu cầu này."}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <label className="text-sm font-medium mb-2 block">Chọn Caregiver ({availableCaregivers.length} rảnh / {caregivers.length} tổng)</label>
                  <select
                    value={selectedCaregiver}
                    onChange={(e) => setSelectedCaregiver(e.target.value)}
                    className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Chọn caregiver...</option>
                    {availableCaregivers.map((cg) => (
                      <option key={cg.id} value={cg.id}>
                        {cg.fullName} - {cg.specialization} ({cg.rating?.toFixed(1) || '0.0'} ⭐)
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAssignModal(false)}>
                Hủy
              </Button>
              <Button
                onClick={handleAssign}
                disabled={!selectedCaregiver || processing || checkingConflict || availableCaregivers.length === 0}
                className="bg-primary"
              >
                {processing ? "Đang gán..." : "Gán Caregiver"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Requests;
