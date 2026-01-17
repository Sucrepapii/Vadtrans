import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/travelers/LandingPage";
import SignIn from "./pages/travelers/SignIn";
import SignUp from "./pages/travelers/SignUp";
import Services from "./pages/travelers/Services";
import SearchResults from "./pages/travelers/SearchResults";
import BookingDetails from "./pages/travelers/BookingDetails";
import PassengerInfo from "./pages/travelers/PassengerInfo";
import SeatSelection from "./pages/travelers/SeatSelection";
import PaymentMethod from "./pages/travelers/PaymentMethod";
import ReviewConfirm from "./pages/travelers/ReviewConfirm";
import Payment from "./pages/travelers/Payment";
import BookingConfirmation from "./pages/travelers/BookingConfirmation";
import Tracking from "./pages/travelers/Tracking";
import Notifications from "./pages/travelers/Notifications";
import UserProfile from "./pages/travelers/UserProfile";
import MyBookings from "./pages/travelers/MyBookings";
import HelpSupport from "./pages/travelers/HelpSupport";
import ContactUs from "./pages/travelers/ContactUs";
import FAQPage from "./pages/travelers/FAQPage";
import AboutUs from "./pages/travelers/AboutUs";

import CompanyLanding from "./pages/company/CompanyLanding";
import DocumentUpload from "./pages/company/DocumentUpload";
import TicketsManagement from "./pages/company/TicketsManagement";
import CompanyProfile from "./pages/company/CompanyProfile";
import DriverConsole from "./pages/company/DriverConsole";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ClientManagement from "./pages/admin/ClientManagement";
import CompanyManagement from "./pages/admin/CompanyManagement";
import FareManagement from "./pages/admin/FareManagement";
import TicketManagement from "./pages/admin/TicketManagement";
import BookingManagement from "./pages/admin/BookingManagement";
import FAQManagement from "./pages/admin/FAQManagement";

const App = () => {
  return (
    <div className="min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Travelers Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/services" element={<Services />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/booking/details" element={<BookingDetails />} />
        {/* New 4-step payment flow */}
        <Route path="/booking/passenger-info" element={<PassengerInfo />} />
        <Route path="/booking/seat-selection" element={<SeatSelection />} />
        <Route path="/booking/payment-method" element={<PaymentMethod />} />
        <Route path="/booking/review" element={<ReviewConfirm />} />
        {/* Old payment route (keep for backward compatibility) */}
        <Route path="/booking/payment" element={<Payment />} />
        <Route path="/booking/confirmation" element={<BookingConfirmation />} />
        <Route path="/tracking" element={<Tracking />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/help" element={<HelpSupport />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/faqs" element={<FAQPage />} />

        {/* Company Routes */}
        <Route path="/company" element={<CompanyLanding />} />
        <Route path="/company/register" element={<DocumentUpload />} />
        <Route path="/company/tickets" element={<TicketsManagement />} />
        <Route path="/company/profile" element={<CompanyProfile />} />
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
        <Route
          path="/admin/fares"
          element={
            <ProtectedRoute requireAdmin={true}>
              <FareManagement />
            </ProtectedRoute>
          }
        />
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
          path="/admin/faqs"
          element={
            <ProtectedRoute requireAdmin={true}>
              <FAQManagement />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
