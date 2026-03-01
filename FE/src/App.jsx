import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import ScrollToTop from "./components/ScrollToTop";

import { Suspense, lazy } from 'react';
import Loader from './components/ui/loader';

// Layouts
import PublicLayout from "./components/layout/PublicLayout";
import AdminLayout from "./components/layout/AdminLayout";
import CaregiverLayout from "./components/layout/CaregiverLayout";

// Public Pages
import Index from "./pages/Public/HomePublic";
import Services from "./pages/Public/Services";
import Pricing from "./pages/Public/Pricing";
import HowItWorks from "./pages/Public/HowItWorks";
import OurCaregivers from "./pages/Public/OurCaregivers";
import Contact from "./pages/Public/Contact";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import NotFound from "./pages/Public/NotFound";

// Caregiver Pages
import ActiveShift from './pages/Caregivers/ActiveShift';
import CareLogs from './pages/Caregivers/CareLogs';
import CareLogDetails from './pages/Caregivers/CareLogDetails';
import EditCareLog from './pages/Caregivers/EditCareLog';
import CaregiverDashboard from './pages/Caregivers/Dashboard';
import Incidents from './pages/Caregivers/Incidents';
import MySchedule from './pages/Caregivers/MySchedule';
import Profile from './pages/Caregivers/Profile';
import CaregiverReports from './pages/Caregivers/Reports';
const IncidentDetail = lazy(() => import("./pages/Caregivers/IncidentDetail"));

// Admin Pages (Lazy Loaded)
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const Users = lazy(() => import("./pages/Admin/Users"));
const Patients = lazy(() => import("./pages/admin/Patients"));
const Caregivers = lazy(() => import("./pages/admin/Caregivers"));
const Requests = lazy(() => import("./pages/admin/Requests"));
const Schedule = lazy(() => import("./pages/admin/Schedule"));
const Reports = lazy(() => import("./pages/admin/Reports"));
const CareLogDetail = lazy(() => import("./pages/admin/CareLogDetail"));
const Payments = lazy(() => import("./pages/admin/Payments"));
const AdminIncidents = lazy(() => import("./pages/Admin/Incidents"));
const AdminContracts = lazy(() => import("./pages/Admin/Contracts"));

// Family Pages (Lazy Loaded)
const FamilyLayout = lazy(() => import("./components/layout/FamilyLayout"));
const FamilyDashboard = lazy(() => import("./pages/Family/FamilyDashboard"));
const FamilyWelcome = lazy(() => import("./pages/Family/Welcome"));
const FamilyPatientList = lazy(() => import("./pages/Family/PatientList"));
const FamilySchedule = lazy(() => import("./pages/Family/CareSchedule"));
const FamilyBooking = lazy(() => import("./pages/Family/BookingService"));
const FamilyRequests = lazy(() => import("./pages/Family/Request"));
const FamilyContract = lazy(() => import("./pages/Family/FamilyContract"));
const FamilyPayment = lazy(() => import("./pages/Family/FamilyPayment"));
const FamilyReport = lazy(() => import("./pages/Family/CareReport"));
const FamilyPatientDetail = lazy(() => import("./pages/Family/PatientDetail"));
const FamilyShiftDetail = lazy(() => import("./pages/Family/ShiftDetail"));
const FamilyHealthReportDetail = lazy(() => import("./pages/Family/HealthReportDetail"));
const FamilyCreateRequest = lazy(() => import("./pages/Family/CreateRequest"));
const FamilyRequestDetail = lazy(() => import("./pages/Family/RequestDetail"));
const FamilyCreateContract = lazy(() => import("./pages/Family/CreateContract"));
const FamilyProfile = lazy(() => import("./pages/Family/FamilyProfile"));
const FamilyCareLogDetail = lazy(() => import("./pages/Family/CareLogDetail"));
const FamilyFeedback = lazy(() => import("./pages/Family/Feedback"));
const FamilyPaymentDetails = lazy(() => import("./pages/Family/PaymentDetails"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollToTop />
          <Suspense fallback={<Loader />}>
            <Routes>
              {/* Public Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/services" element={<Services />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/caregivers" element={<OurCaregivers />} />
              </Route>

              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="users" element={<Users />} />
                <Route path="patients" element={<Patients />} />
                <Route path="caregivers" element={<Caregivers />} />
                <Route path="requests" element={<Requests />} />
                <Route path="schedule" element={<Schedule />} />
                <Route path="reports" element={<Reports />} />
                <Route path="reports/care-log/:id" element={<CareLogDetail />} />
                <Route path="payments" element={<Payments />} />
                <Route path="incidents" element={<AdminIncidents />} />
                <Route path="contracts" element={<AdminContracts />} />
              </Route>

              {/* Family Routes */}
              <Route path="/family" element={<FamilyLayout />}>
                <Route index element={<FamilyWelcome />} />
                <Route path="dashboard" element={<FamilyDashboard />} />
                <Route path="patients" element={<FamilyPatientList />} />
                <Route path="schedule" element={<FamilySchedule />} />
                <Route path="services" element={<FamilyBooking />} />
                <Route path="requests" element={<FamilyRequests />} />
                <Route path="contracts" element={<FamilyContract />} />
                <Route path="payments" element={<FamilyPayment />} />
                <Route path="reports" element={<FamilyReport />} />
                <Route path="patients/detail/:id" element={<FamilyPatientDetail />} />
                <Route path="schedule/detail/:id" element={<FamilyShiftDetail />} />
                <Route path="reports/detail/:id" element={<FamilyHealthReportDetail />} />
                <Route path="care-logs/:id" element={<FamilyCareLogDetail />} />
                <Route path="requests/create" element={<FamilyCreateRequest />} />
                <Route path="requests/:id" element={<FamilyRequestDetail />} />
                <Route path="contracts/create" element={<FamilyCreateContract />} />
                <Route path="profile" element={<FamilyProfile />} />
                <Route path="feedback" element={<FamilyFeedback />} />
              </Route>

              {/* Caregiver Routes - FIXED: Added path and fixed nesting */}
              <Route path="/caregiver" element={<CaregiverLayout />}>
                <Route index element={<CaregiverDashboard />} />
                <Route path="dashboard" element={<CaregiverDashboard />} />
                <Route path="active-shift" element={<ActiveShift />} />
                <Route path="care-logs" element={<CareLogs />} />
                <Route path="care-logs/:id" element={<CareLogDetails />} />
                <Route path="care-logs/edit/:id" element={<EditCareLog />} />
                <Route path="my-schedule" element={<MySchedule />} />
                <Route path="incidents" element={<Incidents />} />
                <Route path="profile" element={<Profile />} />
                <Route path="reports" element={<CaregiverReports />} />
                <Route path="incidents/detail/:id" element={<IncidentDetail />} />
              </Route>

              {/* Redirect /CaregiverDashboard to /caregiver to fix 404 */}
              <Route path="/CaregiverDashboard" element={<Navigate to="/caregiver" replace />} />
              <Route path="/payment/contract/:id" element={<FamilyPaymentDetails type="contract" />} />
              <Route path="/payment/:id" element={<FamilyPaymentDetails />} />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;