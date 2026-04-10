import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/travelers/LandingPage";
import SignIn from "./pages/travelers/SignIn";
import SignUp from "./pages/travelers/SignUp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import VerifyEmail from "./pages/auth/VerifyEmail";
import Services from "./pages/travelers/Services";
import SearchResults from "./pages/travelers/SearchResults";
import PassengerInfo from "./pages/travelers/PassengerInfo";
import FreightInfo from "./pages/travelers/FreightInfo";
import FreightCheckout from "./pages/travelers/FreightCheckout";
import FreightConfirmation from "./pages/travelers/FreightConfirmation";
import SeatSelection from "./pages/travelers/SeatSelection";
import ReviewConfirm from "./pages/travelers/ReviewConfirm";
import BookingConfirmation from "./pages/travelers/BookingConfirmation";
import Tracking from "./pages/travelers/Tracking";
import Notifications from "./pages/travelers/Notifications";
import UserProfile from "./pages/travelers/UserProfile";
import MyBookings from "./pages/travelers/MyBookings";
import HelpSupport from "./pages/travelers/HelpSupport";
import ContactUs from "./pages/travelers/ContactUs";
import FAQPage from "./pages/travelers/FAQPage";
import AboutUs from "./pages/travelers/AboutUs";
import TermsOfService from "./pages/travelers/TermsOfService";
import PrivacyPolicy from "./pages/travelers/PrivacyPolicy";
import RefundPolicy from "./pages/travelers/RefundPolicy";

import CompanyLanding from "./pages/company/CompanyLanding";
import DocumentUpload from "./pages/company/DocumentUpload";
import TicketsManagement from "./pages/company/TicketsManagement";
import CompanyProfile from "./pages/company/CompanyProfile";
import DriverConsole from "./pages/company/DriverConsole";
import DriverConsoleList from "./pages/company/DriverConsoleList";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ClientManagement from "./pages/admin/ClientManagement";
import CompanyManagement from "./pages/admin/CompanyManagement";
import FareManagement from "./pages/admin/FareManagement";
import TicketManagement from "./pages/admin/TicketManagement";
import BookingManagement from "./pages/admin/BookingManagement";
import ShipmentManagement from "./pages/admin/ShipmentManagement";
import FAQManagement from "./pages/admin/FAQManagement";
import StaffManagement from "./pages/admin/StaffManagement";

const App = () => {
  return (
    <div className="min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Travelers Routes */}
        <Route path="/" element={<LandingPage />} />

        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/services" element={<Services />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/search" element={<SearchResults />} />
        {/* New 3-step payment flow - requires auth */}
        <Route
          path="/booking/passenger-info"
          element={
            <ProtectedRoute>
              <PassengerInfo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/seat-selection"
          element={
            <ProtectedRoute>
              <SeatSelection />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/freight-info"
          element={
            <ProtectedRoute>
              <FreightInfo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/freight-checkout"
          element={
            <ProtectedRoute>
              <FreightCheckout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/review"
          element={
            <ProtectedRoute>
              <ReviewConfirm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/confirmation"
          element={
            <ProtectedRoute>
              <BookingConfirmation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/freight-confirmation"
          element={
            <ProtectedRoute>
              <FreightConfirmation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tracking"
          element={
            <ProtectedRoute>
              <Tracking />
            </ProtectedRoute>
          }
        />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/help" element={<HelpSupport />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/faqs" element={<FAQPage />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />

        {/* Company Routes */}
        <Route path="/company" element={<CompanyLanding />} />
        <Route path="/company/register" element={<DocumentUpload />} />
        <Route path="/company/tickets" element={<TicketsManagement />} />
        <Route path="/company/profile" element={<CompanyProfile />} />
        <Route
          path="/company/driver-console"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <DriverConsoleList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/driver-console/:id"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <DriverConsole />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes - Protected */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/clients"
          element={
            <ProtectedRoute requireAdmin={true}>
              <ClientManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/companies"
          element={
            <ProtectedRoute requireAdmin={true}>
              <CompanyManagement />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/admin/fares"
          element={
            <ProtectedRoute requireAdmin={true}>
              <FareManagement />
            </ProtectedRoute>
          }
        /> */}
        <Route
          path="/admin/tickets"
          element={
            <ProtectedRoute requireAdmin={true}>
              <TicketManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute requireAdmin={true}>
              <BookingManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/shipments"
          element={
            <ProtectedRoute requireAdmin={true}>
              <ShipmentManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/faqs"
          element={
            <ProtectedRoute requireAdmin={true}>
              <FAQManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/staff"
          element={
            <ProtectedRoute requireAdmin={true}>
              <StaffManagement />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
