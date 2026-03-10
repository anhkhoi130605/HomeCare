
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";
import { authApi } from "@/lib/api";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get("token");
    const email = searchParams.get("email");

    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);

        try {
            await authApi.resetPassword({
                email,
                token,
                newPassword: formData.password
            });
            setSuccess(true);
            // Auto redirect after 3 seconds
            setTimeout(() => navigate("/login"), 3000);
        } catch (err) {
            setError(err.message || "Failed to reset password. The link may have expired.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!token || !email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-red-500 mb-2">Invalid Link</h2>
                    <p className="text-gray-600 mb-4">This password reset link is invalid or incomplete.</p>
                    <Link to="/forgot-password" className="text-primary hover:underline">
                        Request a new link
                    </Link>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-background to-cyan-50 p-4">
                <div className="w-full max-w-md bg-background rounded-2xl shadow-xl p-8 text-center space-y-6 animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-primary">Password Reset!</h2>
                    <p className="text-muted-foreground">
                        Your password has been successfully updated. Redirecting to login...
                    </p>
                    <Button asChild className="w-full">
                        <Link to="/login">Login Now</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-background to-cyan-50 p-4">
            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Heart className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <h1 className="text-xl font-bold text-primary">CAREPORTAL</h1>
                </div>

                <div className="bg-background rounded-2xl shadow-xl overflow-hidden">
                    <div className="h-24 bg-gradient-to-r from-primary to-teal-600 relative flex items-center px-8">
                        <div>
                            <h2 className="text-2xl font-bold text-white">New Password</h2>
                            <p className="text-white/80 text-sm">Create a strong password for your account</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Min 6 characters"
                                        className="h-11 pr-10"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        disabled={isLoading}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Retype password"
                                    className="h-11"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                        </div>

                        <Button className="w-full h-11 gap-2" type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Reset Password"
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
