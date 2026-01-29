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

// Admin Pages (Lazy Loaded)
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const Patients = lazy(() => import("./pages/admin/Patients"));
const Caregivers = lazy(() => import("./pages/admin/Caregivers"));
const Requests = lazy(() => import("./pages/admin/Requests"));
const Schedule = lazy(() => import("./pages/admin/Schedule"));
const Reports = lazy(() => import("./pages/admin/Reports"));
const CareLogDetail = lazy(() => import("./pages/admin/CareLogDetail"));
const Payments = lazy(() => import("./pages/admin/Payments"));

// Family Pages (Lazy Loaded)
const FamilyLayout = lazy(() => import("./components/layout/FamilyLayout"));
const FamilyWelcome = lazy(() => import("./pages/Family/Welcome"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="patients" element={<Patients />} />
                <Route path="caregivers" element={<Caregivers />} />
                <Route path="requests" element={<Requests />} />
                <Route path="schedule" element={<Schedule />} />
                <Route path="reports" element={<Reports />} />
                <Route path="reports/care-log/:id" element={<CareLogDetail />} />
                <Route path="payments" element={<Payments />} />
              </Route>

              {/* Family Routes */}
              <Route path="/family" element={<FamilyLayout />}>
                <Route index element={<FamilyWelcome />} />
              </Route>

              {/* Caregiver Routes - FIXED: Added path and fixed nesting */}
              <Route path="/caregiver" element={<CaregiverLayout />}>
                <Route index element={<CaregiverDashboard />} />
                <Route path="active-shift" element={<ActiveShift />} />
                <Route path="care-logs" element={<CareLogs />} />
                <Route path="care-logs/:id" element={<CareLogDetails />} />
                <Route path="care-logs/edit/:id" element={<EditCareLog />} />
                <Route path="my-schedule" element={<MySchedule />} />
                <Route path="incidents" element={<Incidents />} />
                <Route path="profile" element={<Profile />} />
                <Route path="reports" element={<CaregiverReports />} />
              </Route>

              {/* Redirect /CaregiverDashboard to /caregiver to fix 404 */}
              <Route path="/CaregiverDashboard" element={<Navigate to="/caregiver" replace />} />

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