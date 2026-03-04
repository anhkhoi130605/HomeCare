import { useState } from "react";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const AddPatientModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    medicalHistory: ""
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.dateOfBirth) {
      toast.error("Please fill in required fields");
      return;
    }
    try {
      setLoading(true);
      await adminApi.createPatient({
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender || undefined,
        address: formData.address || undefined,
        emergencyContact: formData.emergencyContact || undefined,
        emergencyPhone: formData.emergencyPhone || undefined,
        medicalHistory: formData.medicalHistory || undefined
      });
      toast.success("Patient created");
      onClose();
      onSuccess && onSuccess();
    } catch (error) {
      toast.error(error.message || "Failed to create patient");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-background flex items-center justify-between p-6 border-b z-10">
          <div>
            <h2 className="text-lg font-bold">Add New Patient</h2>
            <p className="text-sm text-muted-foreground">Create a new patient record</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form className="p-6 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                className="w-full px-3 py-2 border rounded-lg bg-background"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                className="w-full px-3 py-2 border rounded-lg bg-background"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                name="gender"
                className="w-full px-3 py-2 border rounded-lg bg-background"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <input
                id="address"
                name="address"
                type="text"
                className="w-full px-3 py-2 border rounded-lg bg-background"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <input
                id="emergencyContact"
                name="emergencyContact"
                type="text"
                className="w-full px-3 py-2 border rounded-lg bg-background"
                value={formData.emergencyContact}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Emergency Phone</Label>
              <input
                id="emergencyPhone"
                name="emergencyPhone"
                type="tel"
                className="w-full px-3 py-2 border rounded-lg bg-background"
                value={formData.emergencyPhone}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="medicalHistory">Medical Summary</Label>
            <textarea
              id="medicalHistory"
              name="medicalHistory"
              rows={4}
              className="w-full px-3 py-2 border rounded-lg bg-background resize-none"
              value={formData.medicalHistory}
              onChange={handleChange}
            />
          </div>
          <div className="flex gap-3 pt-2 border-t">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Saving..." : "Create Patient"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatientModal;
