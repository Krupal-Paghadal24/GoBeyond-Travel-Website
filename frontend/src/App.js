import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

/* ================= ADMIN IMPORTS ================= */
import AdminProtectedRoute from "./admin/AdminProtectedRoute";
import AdminDashboard from "./admin/AdminDashboard";
import AdminUsers from "./admin/AdminUsers";
import AdminBookings from "./admin/AdminBookings";
import AdminGuides from "./admin/AdminGuides";
import AdminPayments from "./admin/AdminPayments";
import AddTrip from "./admin/AddTrip";
import EditTrip from "./admin/EditTrip";   // ✅ UNCOMMENTED
import Trips from "./admin/Trips";
import AdminSmartTrips from "./admin/AdminSmartTrips";

/* ================= USER IMPORTS ================= */
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import HomePage from "./pages/HomePage";
import UserTrips from "./pages/Trips";
import SmartTrips from "./pages/SmartTrips";
import MyTrips from "./pages/MyTrips";
import Blog from "./pages/Blog";
import KnowUs from "./pages/KnowUs";
import TripDetails from "./pages/TripDetails";
import Payment from "./pages/Payment";
import Chatbot from "./components/Chatbot";

function App() {
  return (
    <Router>
      <Chatbot />
      <Routes>

        {/* ===== USER ROUTES ===== */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/trips" element={<UserTrips />} />
        <Route path="/trips/:id" element={<TripDetails />} />
        <Route path="/smart-trips" element={<SmartTrips />} />
        <Route path="/my-trips" element={<MyTrips />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/know-us" element={<KnowUs />} />
        <Route path="/payment" element={<Payment />} />

        {/* ===== ADMIN ROUTES (protected) ===== */}
        <Route path="/admin" element={
          <AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>
        } />

        <Route path="/admin/trips" element={
          <AdminProtectedRoute><Trips /></AdminProtectedRoute>
        } />

        <Route path="/admin/add-trip" element={
          <AdminProtectedRoute><AddTrip /></AdminProtectedRoute>
        } />

        <Route path="/admin/edit-trip/:id" element={   // ✅ UNCOMMENTED — was causing blank page
          <AdminProtectedRoute><EditTrip /></AdminProtectedRoute>
        } />

        <Route path="/admin/smart-trips" element={
          <AdminProtectedRoute><AdminSmartTrips /></AdminProtectedRoute>
        } />

        <Route path="/admin/users" element={
          <AdminProtectedRoute><AdminUsers /></AdminProtectedRoute>
        } />

        <Route path="/admin/bookings" element={
          <AdminProtectedRoute><AdminBookings /></AdminProtectedRoute>
        } />

        <Route path="/admin/payments" element={
          <AdminProtectedRoute><AdminPayments /></AdminProtectedRoute>
        } />

        <Route path="/admin/guides" element={
          <AdminProtectedRoute><AdminGuides /></AdminProtectedRoute>
        } />

      </Routes>
    </Router>
  );
}

export default App;
