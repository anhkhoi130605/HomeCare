
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, ArrowLeft, Loader2, Mail } from "lucide-react";
import { authApi } from "@/lib/api";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            // API call to request password reset
            await authApi.forgotPassword(email);
            setSuccess(true);
        } catch (err) {
            setError(err.message || "An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-background to-cyan-50 p-4">
                <div className="w-full max-w-md bg-background rounded-2xl shadow-xl p-8 text-center space-y-6 animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                        <Mail className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-primary">Check Your Email</h2>
                    <p className="text-muted-foreground">
                        We have sent a password reset link to <strong>{email}</strong>. Please check your inbox (and spam folder) to proceed.
                    </p>
                    <Button asChild className="w-full">
                        <Link to="/login">Back to Login</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-background to-cyan-50 p-4">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-teal-100/50 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-cyan-100/50 to-transparent rounded-full blur-3xl" />

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Heart className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <h1 className="text-xl font-bold text-primary">CAREPORTAL</h1>
                </div>

                {/* Card */}
                <div className="bg-background rounded-2xl shadow-xl overflow-hidden">
                    <div className="h-24 bg-gradient-to-r from-primary to-teal-600 relative flex items-center px-8">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Reset Password</h2>
                            <p className="text-white/80 text-sm">Enter your email to receive instructions</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="e.g. name@homecare.com"
                                className="h-11"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                        </div>

                        <Button className="w-full h-11 gap-2" type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Sending link...
                                </>
                            ) : (
                                "Send Reset Link"
                            )}
                        </Button>

                        <div className="text-center">
                            <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center justify-center gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                Back to Login
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
