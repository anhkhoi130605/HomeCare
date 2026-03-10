import { useState, useEffect, useCallback } from "react";
import { Filter, UserPlus, Star, ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import AdminHeader from "@/components/layout/AdminHeader";
import { adminApi } from "@/lib/api";
import AddCaregiverModal from "./AddCaregiverModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const Caregivers = () => {
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCaregiver, setEditingCaregiver] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [minRating, setMinRating] = useState("");
  const [specFilter, setSpecFilter] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);

  const fetchCaregivers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminApi.getCaregivers();
      setCaregivers(data || []);
    } catch (error) {
      console.error("Failed to fetch caregivers:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCaregivers();
  }, [fetchCaregivers]);

  const handleCreate = () => {
    setEditingCaregiver(null);
    setIsModalOpen(true);
  };

  const handleEdit = (caregiver) => {
    setEditingCaregiver(caregiver);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete (deactivate) this caregiver?")) return;
    try {
      await adminApi.deleteCaregiver(id);
      fetchCaregivers();
    } catch (error) {
      alert("Failed to delete caregiver: " + (error.message || "Unknown error"));
    }
  };

  const handleModalSuccess = () => {
    fetchCaregivers();
  };

  const filteredCaregivers = caregivers.filter(c => {
    const matchesSearch =
      c.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || c.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesRating =
      !minRating || (c.rating || 0) >= parseFloat(minRating);
    const matchesSpec =
      !specFilter || c.specialization?.toLowerCase().includes(specFilter.toLowerCase());
    const matchesAvailable =
      !availableOnly || c.status === "Online";
    return matchesSearch && matchesStatus && matchesRating && matchesSpec && matchesAvailable;
  });

  const stats = {
    online: caregivers.filter(c => c.status === 'Online').length,
    onDuty: caregivers.filter(c => c.status === 'On-Duty').length,
    avgRating: caregivers.length > 0
      ? (caregivers.reduce((sum, c) => sum + (c.rating || 0), 0) / caregivers.length).toFixed(2)
      : 0
  };

  const statsCards = [
    { label: "AVAILABLE ONLINE", value: stats.online.toString(), icon: "👥", color: "bg-emerald-50" },
    { label: "CURRENTLY ON-DUTY", value: stats.onDuty.toString(), icon: "📋", color: "bg-blue-50" },
    { label: "AVG. NETWORK RATING", value: stats.avgRating.toString(), icon: "⭐", color: "bg-orange-50", suffix: "★" },
  ];

  return (
    <div>
      <AdminHeader
        breadcrumb="Caregiver Directory"
        searchPlaceholder="Search caregivers by name, skill, or status..."
      />

      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Caregiver Directory</h1>
            <p className="text-muted-foreground">Manage, monitor, and recruit your professional care network.</p>
          </div>
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search caregivers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowFilters(true)}>
              <Filter className="w-4 h-4" />
              Filters
            </Button>
            <Button size="sm" className="gap-2" onClick={handleCreate}>
              <UserPlus className="w-4 h-4" />
              Recruit New Caregiver
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {statsCards.map((stat) => (
            <Card key={stat.label} className="border-0 shadow-sm">
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-2xl`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xs text-primary font-medium uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold">
                    {loading ? "..." : stat.value}
                    {stat.suffix && <span className="text-amber-500 ml-1">{stat.suffix}</span>}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Caregivers Table */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-muted-foreground">Loading caregivers...</p>
              </div>
            ) : filteredCaregivers.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No caregivers found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-xs font-medium text-primary uppercase tracking-wider">Caregiver</th>
                    <th className="text-left p-4 text-xs font-medium text-primary uppercase tracking-wider">Specialization</th>
                    <th className="text-left p-4 text-xs font-medium text-primary uppercase tracking-wider">Status</th>
                    <th className="text-left p-4 text-xs font-medium text-primary uppercase tracking-wider">Avg. Rating</th>
                    <th className="text-left p-4 text-xs font-medium text-primary uppercase tracking-wider">Experience</th>
                    <th className="text-right p-4 text-xs font-medium text-primary uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCaregivers.map((caregiver) => (
                    <tr key={caregiver.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar>
                              <AvatarImage src={caregiver.imageUrl} />
                              <AvatarFallback>{caregiver.fullName?.[0] || 'C'}</AvatarFallback>
                            </Avatar>
                            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${caregiver.status === "Online" ? "bg-emerald-500" :
                              caregiver.status === "On-Duty" ? "bg-blue-500" : "bg-gray-400"
                              }`} />
                          </div>
                          <div>
                            <p className="font-medium">{caregiver.fullName}</p>
                            <p className="text-sm text-primary">{caregiver.email} • ID: CG-{caregiver.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className="bg-blue-100 text-blue-700 font-semibold text-[10px]">
                          {caregiver.specialization || 'General Care'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${caregiver.status === "Online" ? "bg-emerald-100 text-emerald-700" :
                          caregiver.status === "On-Duty" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                          }`}>
                          <span className={`w-2 h-2 rounded-full ${caregiver.status === "Online" ? "bg-emerald-500" :
                            caregiver.status === "On-Duty" ? "bg-blue-500" : "bg-gray-400"
                            }`} />
                          {caregiver.status}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{caregiver.rating?.toFixed(1) || '0.0'}</span>
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span className="text-muted-foreground text-sm">({caregiver.reviewCount || 0})</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-medium">{caregiver.experienceYears} years</p>
                        <p className="text-xs text-muted-foreground">{caregiver.hourlyRate?.toLocaleString()} VND/hr</p>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(caregiver)} title="Edit">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(caregiver.id)} title="Delete">
                            <Trash2 className="w-4 h-4" />
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
              <p className="text-sm text-primary">Showing {filteredCaregivers.length} of {caregivers.length} caregivers</p>
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

        {/* Recruitment Banner - kept as per request to not remove existing UI components excessively */}
        <Card className="bg-gradient-to-r from-slate-800 to-slate-900 text-white border-0 shadow-lg">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Grow your care network</h3>
              <p className="text-white/70 mt-1">
                Access the recruitment portal to manage pending applications, conduct interviews, and onboard new qualified care professionals.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button className="bg-white text-slate-800 hover:bg-gray-100 gap-2 font-semibold">
                <UserPlus className="w-4 h-4" />
                Pending Applications
              </Button>
              <Button className="bg-cyan-500 hover:bg-cyan-600 text-white gap-2 font-semibold">
                Onboarding Guide
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <AddCaregiverModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        caregiverToEdit={editingCaregiver}
      />
      <Dialog open={showFilters} onOpenChange={setShowFilters}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Filters</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <p className="text-sm font-medium">Status</p>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="On-Duty">On-Duty</SelectItem>
                  <SelectItem value="Offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Minimum Rating</p>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                placeholder="e.g., 4.0"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Specialization contains</p>
              <Input
                value={specFilter}
                onChange={(e) => setSpecFilter(e.target.value)}
                placeholder="e.g., Physical Therapy"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="availableOnly" checked={availableOnly} onCheckedChange={setAvailableOnly} />
              <label htmlFor="availableOnly" className="text-sm">Available online only</label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { setStatusFilter("all"); setMinRating(""); setSpecFilter(""); setAvailableOnly(false); }}>
                Reset
              </Button>
              <Button onClick={() => setShowFilters(false)}>Apply</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Caregivers;
