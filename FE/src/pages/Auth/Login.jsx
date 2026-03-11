import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, Eye, EyeOff, Lock, LogIn, Loader2 } from "lucide-react";
import { authApi } from "@/lib/api";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, facebookProvider } from "../../firebase/firebase";
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2" />
  </svg>
);

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await authApi.login({
        email: formData.email,
        password: formData.password
      });

      if (result.success) {
        // Save auth data
        authApi.saveAuthData(result);

        // Redirect based on role
        const role = result.user?.role?.toLowerCase();
        if (role === "admin") {
          navigate("/admin");
        } else if (role === "operationadmin") {
          navigate("/operation-admin");
        } else if (role === "caregiver") {
          navigate("/caregiver");
        } else {
          navigate("/family/dashboard");
        }
      } else {
        setError(result.message || "Login failed");
      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  // --- Thêm vào từ dòng 95 ---
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      // 1. Mở cửa sổ đăng nhập của Google
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // 2. Lấy mã Token để gửi cho Backend .NET sau này
      const token = await user.getIdToken();
      console.log("Đăng nhập Google thành công:", user.email);
      console.log("Token:", token);

      // 3. Tạm thời điều hướng để kiểm tra tính năng
      navigate("/family/dashboard");
    } catch (err) {
      console.error("Lỗi Google Auth:", err);
      setError("Không thể đăng nhập bằng Google. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleFacebookLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result.user;
      const token = await user.getIdToken();
      
      console.log("Đăng nhập Facebook thành công:", user.displayName);
      console.log("Token FB:", token);
      
      navigate("/family/dashboard");
    } catch (err) {
      console.error("Lỗi Facebook Auth:", err);
      // Lỗi phổ biến của FB: Trùng email với Google
      if (err.code === 'auth/account-exists-with-different-credential') {
        setError("Email này đã được đăng nhập bằng Google. Vui lòng dùng Google.");
      } else {
        setError("Không thể đăng nhập bằng Facebook. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
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

        {/* Login Card */}
        <div className="bg-background rounded-2xl shadow-xl overflow-hidden">
          {/* Header Image */}
          <div className="h-32 bg-gradient-to-r from-primary to-teal-600 relative">
            <img
              src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=500&h=200&fit=crop"
              alt="Healthcare"
              className="w-full h-full object-cover mix-blend-overlay opacity-50"
            />
            <div className="absolute inset-0 flex flex-col justify-center px-8">
              <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
              <p className="text-white/80 text-sm">Secure access to your care dashboard</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )
            
            }
            <div className="space-y-2">
              <Label htmlFor="email">Email or Phone Number</Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g. name@homecare.com"
                className="h-11"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-11 pr-10"
                  value={formData.password}
                  onChange={handleInputChange}
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

            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={formData.rememberMe}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, rememberMe: checked }))}
              />
              <Label htmlFor="remember" className="text-sm font-normal">
                Keep me logged in
              </Label>
            </div>

            <Button className="w-full h-11 gap-2" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <LogIn className="w-4 h-4" />
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
    type="button"
    variant="outline"
    className="h-11 gap-2 border-2 hover:bg-blue-50"
    onClick={handleGoogleLogin} // <-- Đã sửa thành gọi hàm đăng nhập
    disabled={isLoading}        // <-- Đã thêm để khóa nút khi đang xoay
  >
    <GoogleIcon />
    <span className="hidden sm:inline">Google</span>
</Button>
              <Button
       type="button"
       variant="outline"
      className="h-11 gap-2 border-2 hover:bg-blue-50"
      onClick={handleFacebookLogin} // <-- Sửa dòng này
      disabled={isLoading}          // <-- Thêm dòng này
  >
    <FacebookIcon />
    <span className="hidden sm:inline">Facebook</span>
  </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Sign Up
              </Link>
            </p>
          </form>
        </div>

        {/* Security Badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Lock className="w-4 h-4" />
          <span>256-BIT AES ENCRYPTION</span>
        </div>

        {/* Footer Links */}
        <div className="mt-4 flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <Link to="/privacy" className="hover:text-primary">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-primary">Terms of Service</Link>
          <Link to="/help" className="hover:text-primary">Help Center</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
