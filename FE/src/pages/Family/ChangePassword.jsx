import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/lib/api";

const ChangePassword = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [show, setShow] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmNewPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (formData.newPassword !== formData.confirmNewPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);

      // ⚠️ Bạn cần có authApi.changePassword trong "@/lib/api"
      await authApi.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      toast.success("Password changed successfully!");
      navigate("/family/profile");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to change password. Please check your current password.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#5fa5ba]/10 text-[#5fa5ba]">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-stone-900">Change Password</h1>
            <p className="text-xs font-bold text-stone-400 mt-0.5">
              Update your account password
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Current password */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={show.current ? "text" : "password"}
                className="h-11 pr-10"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShow((p) => ({ ...p, current: !p.current }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {show.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={show.next ? "text" : "password"}
                className="h-11 pr-10"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShow((p) => ({ ...p, next: !p.next }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {show.next ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm */}
          <div className="space-y-2">
            <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmNewPassword"
                type={show.confirm ? "text" : "password"}
                className="h-11 pr-10"
                value={formData.confirmNewPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmNewPassword: e.target.value })
                }
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShow((p) => ({ ...p, confirm: !p.confirm }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {show.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button className="w-full h-11 gap-2" type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Change Password"
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full h-11"
            onClick={() => navigate("/family/profile")}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;