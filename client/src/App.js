import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Car, LayoutDashboard, PlusCircle, ShieldAlert, CalendarDays } from "lucide-react";
import MyBookings from "./pages/MyBookings";
import VehicleList from "./pages/VehicleList";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OwnerDashboard from "./pages/OwnerDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import AddVehicle from "./pages/AddVehicle";
import ManageVehicles from "./pages/ManageVehicles";
import BookingPage from "./pages/BookingPage";
import UserProfile from "./pages/UserProfile";
import Settings from "./pages/Settings";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { useEffect, useState } from "react";
import axios from "axios";
import ThemeToggle from "./components/ThemeToggle";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import ProfileDropdown from "./components/ProfileDropdown";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [ownerNotificationCount, setOwnerNotificationCount] = useState(0);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchNotifications = async () => {
      if (user && user.role === "owner") {
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get("http://localhost:5000/api/bookings/owner/notifications", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setOwnerNotificationCount(res.data.count);
        } catch (error) {
          console.error("Failed to fetch owner notifications:", error);
        }
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Refresh every 60 seconds
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-blue-600 dark:text-blue-400 group">
            <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <Car size={28} />
            </div>
            <span className="hidden sm:inline">RentaRide</span>
          </Link>

          {/* Nav Links & Actions */}
          <div className="flex items-center gap-2 sm:gap-6">
            {/* General Links Group */}
            <div className="hidden md:flex items-center gap-6 pr-6 border-r border-gray-200 dark:border-gray-800">
              <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Home</Link>
              {user && (
                <Link to="/my-bookings" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors flex items-center gap-1.5">
                  <LayoutDashboard size={18} />
                  My Bookings
                </Link>
              )}
              {user?.role === "owner" && (
                <Link to="/my-vehicles" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors flex items-center gap-1.5">
                  <Car size={18} />
                  My Vehicles
                </Link>
              )}
            </div>

            {/* Action Buttons & Profile Group */}
            <div className="flex items-center gap-2 sm:gap-4">
              {user ? (
                <>
                  {user.role === "owner" && (
                    <div className="flex items-center gap-2 sm:gap-4 mr-2">
                      <Link to="/owner-dashboard" className="relative p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all group" title="Manage Bookings">
                        <CalendarDays size={20} />
                        {ownerNotificationCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border-2 border-white dark:border-gray-900">
                            {ownerNotificationCount}
                          </span>
                        )}
                      </Link>
                      <Link to="/add-vehicle" className="bg-blue-600 hover:bg-blue-700 text-white p-2 sm:px-4 sm:py-2 rounded-lg flex items-center gap-2 transition shadow-lg shadow-blue-500/20 group">
                        <PlusCircle size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                        <span className="hidden lg:inline text-sm font-bold tracking-wide">Add Vehicle</span>
                      </Link>
                    </div>
                  )}

                  {user.role === "admin" && (
                    <Link to="/superadmin" className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition group" title="Super Admin">
                      <ShieldAlert size={20} className="group-hover:scale-110 transition-transform" />
                    </Link>
                  )}

                  {/* Theme Toggle in User Group */}
                  <ThemeToggle />

                  {/* Profile Dropdown */}
                  <div className="border-l border-gray-200 dark:border-gray-800 ml-2 pl-2 sm:pl-4">
                    <ProfileDropdown />
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 sm:gap-4">
                  <ThemeToggle />
                  <Link to="/login" className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Login</Link>
                  <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-bold transition shadow-lg shadow-blue-500/20 active:scale-95">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
              <Toaster position="top-right" />
              <Navbar />
              <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <Routes>
                  <Route path="/" element={<VehicleList />} />
                  <Route path="/my-bookings" element={<ProtectedRoute component={MyBookings} />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/owner-dashboard" element={<ProtectedRoute component={OwnerDashboard} requiredRole="owner" />} />
                  <Route path="/my-vehicles" element={<ProtectedRoute component={ManageVehicles} requiredRole="owner" />} />
                  <Route path="/superadmin" element={<ProtectedRoute component={SuperAdminDashboard} requiredRole="admin" />} />
                  <Route path="/add-vehicle" element={<ProtectedRoute component={AddVehicle} requiredRole="owner" />} />
                  <Route path="/book/:id" element={<ProtectedRoute component={BookingPage} />} />
                  <Route path="/profile" element={<ProtectedRoute component={UserProfile} />} />
                  <Route path="/settings" element={<ProtectedRoute component={Settings} />} />
                </Routes>
              </main>
            </div>
          </Router>
        </ErrorBoundary>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;