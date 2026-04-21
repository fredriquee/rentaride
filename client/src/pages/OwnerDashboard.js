import { useEffect, useState } from "react";
import API from "../api";
import { toast } from "react-hot-toast";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
  CheckCircle, XCircle, User, CalendarDays, Car, IndianRupee, AlertTriangle, Check, TrendingUp, Plus, Eye
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function OwnerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState({});
  const [vehicles, setVehicles] = useState([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    activeVehicles: 0,
    acceptanceRate: 0,
  });
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [vehicleStats, setVehicleStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Protect this page - only owners can access
  useEffect(() => {
    if (!user || user.currentRole !== "owner") {
      toast.error("You must be in Owner mode to access this page");
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchOwnerDashboardData();
    
    // Refetch data when page becomes visible (e.g., returning from payment page)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchOwnerDashboardData();
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const fetchOwnerDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Fetch bookings
      const bookingsRes = await API.get("/api/bookings/owner", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allBookings = bookingsRes.data || [];
      setBookings(allBookings);

      // Fetch vehicles
      const vehiclesRes = await API.get("/api/vehicles/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allVehicles = vehiclesRes.data || [];
      setVehicles(allVehicles);

      // Calculate statistics
      const pending = allBookings.filter(b => b.status === 'pending' || b.status === 'cancellation_requested').length;
      const completed = allBookings.filter(b => b.status === 'completed').length;
      const confirmed = allBookings.filter(b => b.status === 'confirmed').length;
      const active = allVehicles.filter(v => v.status === 'available').length;

      let totalEarnings = 0;
      allBookings.forEach(booking => {
        if (booking.status === 'completed' && booking.startDate && booking.endDate && booking.vehicle) {
          const start = new Date(booking.startDate);
          const end = new Date(booking.endDate);
          const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
          totalEarnings += days * booking.vehicle.pricePerDay;
        }
      });

      const acceptanceRate = allBookings.length > 0 
        ? Math.round(((completed + confirmed) / allBookings.length) * 100) 
        : 0;

      setStats({
        totalEarnings,
        pendingBookings: pending,
        completedBookings: completed,
        activeVehicles: active,
        acceptanceRate,
      });

      // Calculate monthly revenue
      const monthlyBookings = {};
      allBookings.forEach(booking => {
        if (booking.status === 'completed' && booking.startDate) {
          const date = new Date(booking.startDate);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          const start = new Date(booking.startDate);
          const end = new Date(booking.endDate);
          const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
          const revenue = days * booking.vehicle.pricePerDay;
          
          monthlyBookings[monthKey] = (monthlyBookings[monthKey] || 0) + revenue;
        }
      });

      const now = new Date();
      const last6Months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const monthName = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        last6Months.push({
          month: monthName,
          revenue: monthlyBookings[monthKey] || 0,
        });
      }
      setMonthlyRevenue(last6Months);

      // Calculate vehicle stats
      const vehiclePerformance = allVehicles.map(vehicle => {
        const vehicleBookings = allBookings.filter(b => b.vehicle?._id === vehicle._id && b.status === 'completed');
        let vehicleEarnings = 0;
        vehicleBookings.forEach(booking => {
          if (booking.startDate && booking.endDate) {
            const start = new Date(booking.startDate);
            const end = new Date(booking.endDate);
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            vehicleEarnings += days * vehicle.pricePerDay;
          }
        });
        return {
          id: vehicle._id,
          title: vehicle.title,
          bookings: vehicleBookings.length,
          earnings: vehicleEarnings,
          status: vehicle.status,
        };
      });
      setVehicleStats(vehiclePerformance);

      // Fetch payment details for all bookings
      const paymentsMap = {};
      for (const booking of allBookings) {
        if (booking.paymentId) {
          try {
            const paymentRes = await API.get(`/api/payments/booking/${booking._id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            paymentsMap[booking._id] = paymentRes.data.payment;
            console.log(`✓ Payment fetched for owner booking ${booking._id}:`, paymentRes.data.payment.status);
          } catch (err) {
            console.error(`✗ Failed to fetch payment for owner booking ${booking._id}:`, err.response?.status, err.response?.data?.message);
          }
        }
      }
      setPayments(paymentsMap);
    } catch (error) {
      toast.error("Failed to load dashboard data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(
        `/api/bookings/${id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // If cancelled, remove from list immediately
      if (status === 'cancelled') {
        setBookings(bookings.filter(b => b._id !== id));
        toast.success("Booking cancelled successfully!");
      } else {
        toast.success(`Booking ${status} successfully!`);
        fetchOwnerDashboardData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const pendingBookings = bookings.filter(b => b.status === 'pending' || b.status === 'cancellation_requested');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Owner Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your vehicles and bookings</p>
        </div>
        <Link
          to="/add-vehicle"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
        >
          <Plus size={20} />
          Add Vehicle
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Earnings */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 rounded-lg sm:rounded-xl p-3 sm:p-6 border border-green-200 dark:border-green-800">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:mb-3">
            <div>
              <p className="text-green-700 dark:text-green-300 text-xs sm:text-sm font-medium">Total Earnings</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-900 dark:text-green-100 mt-1">
                Rs {stats.totalEarnings.toLocaleString()}
              </p>
            </div>
            <IndianRupee className="text-green-600 dark:text-green-400 hidden sm:block" size={24} />
          </div>
          <IndianRupee className="text-green-600 dark:text-green-400 sm:hidden" size={18} />
          <p className="text-xs text-green-700 dark:text-green-300 hidden sm:block">From completed bookings</p>
        </div>

        {/* Pending Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-6 border dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:mb-3">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium">Pending Actions</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.pendingBookings}</p>
            </div>
            <AlertTriangle className="text-yellow-500 hidden sm:block" size={24} />
          </div>
          <AlertTriangle className="text-yellow-500 sm:hidden" size={18} />
          <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Require your attention</p>
        </div>

        {/* Completed Bookings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-6 border dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:mb-3">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium">Completed Bookings</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.completedBookings}</p>
            </div>
            <CheckCircle className="text-green-500 hidden sm:block" size={24} />
          </div>
          <CheckCircle className="text-green-500 sm:hidden" size={18} />
          <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Total rentals completed</p>
        </div>

        {/* Active Vehicles */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-6 border dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:mb-3">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium">Active Vehicles</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.activeVehicles}/{vehicles.length}</p>
            </div>
            <Car className="text-blue-500 hidden sm:block" size={24} />
          </div>
          <Car className="text-blue-500 sm:hidden" size={18} />
          <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Vehicles for rent</p>
        </div>

        {/* Acceptance Rate */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-6 border dark:border-gray-700 col-span-2 sm:col-span-1">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:mb-3">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium">Acceptance Rate</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.acceptanceRate}%</p>
            </div>
            <TrendingUp className="text-blue-500 hidden sm:block" size={24} />
          </div>
          <TrendingUp className="text-blue-500 sm:hidden" size={18} />
          <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Bookings confirmed/completed</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 sm:gap-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-3 sm:px-6 py-2 sm:py-3 font-medium text-sm sm:text-base whitespace-nowrap border-b-2 transition ${
            activeTab === "overview"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("bookings")}
          className={`px-3 sm:px-6 py-2 sm:py-3 font-medium text-sm sm:text-base whitespace-nowrap border-b-2 transition ${
            activeTab === "bookings"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          Bookings
        </button>
        <button
          onClick={() => setActiveTab("vehicles")}
          className={`px-3 sm:px-6 py-2 sm:py-3 font-medium text-sm sm:text-base whitespace-nowrap border-b-2 transition ${
            activeTab === "vehicles"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          My Vehicles
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6 sm:space-y-8">
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Revenue Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-6 border dark:border-gray-700">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Revenue Trend (6 Months)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }} />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Vehicle Performance */}
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-6 border dark:border-gray-700">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Vehicle Earnings</h3>
              <div className="space-y-3 max-h-64 sm:max-h-80 overflow-y-auto">
                {vehicleStats.length > 0 ? (
                  vehicleStats
                    .sort((a, b) => b.earnings - a.earnings)
                    .map(vehicle => (
                      <div key={vehicle.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white truncate">{vehicle.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{vehicle.bookings} completed bookings</p>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white whitespace-nowrap ml-4">
                          Rs {vehicle.earnings.toLocaleString()}
                        </span>
                      </div>
                    ))
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">No vehicles yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4">Booking Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">Confirmed</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {bookings.filter(b => b.status === 'confirmed').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">Pending</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {bookings.filter(b => b.status === 'pending').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">Completed</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {bookings.filter(b => b.status === 'completed').length}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4">Vehicle Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">Available</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {vehicles.filter(v => v.status === 'available').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">Unavailable</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {vehicles.filter(v => v.status === 'unavailable').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">Total</span>
                  <span className="font-bold text-gray-900 dark:text-white">{vehicles.length}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4">This Month</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-700 dark:text-gray-300 text-sm">Revenue</span>
                  <p className="font-bold text-gray-900 dark:text-white text-lg">
                    Rs {monthlyRevenue[monthlyRevenue.length - 1]?.revenue.toLocaleString() || 0}
                  </p>
                </div>
                <div>
                  <span className="text-gray-700 dark:text-gray-300 text-sm">New Bookings</span>
                  <p className="font-bold text-gray-900 dark:text-white text-lg">
                    {bookings.filter(b => {
                      const now = new Date();
                      const booking = new Date(b.createdAt || b.startDate);
                      return booking.getMonth() === now.getMonth() && booking.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === "bookings" && (
        <div className="space-y-6">
          {pendingBookings.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="text-yellow-600 dark:text-yellow-400" size={20} />
                <h3 className="font-bold text-yellow-900 dark:text-yellow-100">
                  {pendingBookings.length} Pending Action{pendingBookings.length !== 1 ? 's' : ''}
                </h3>
              </div>
              <p className="text-sm text-yellow-800 dark:text-yellow-300">Review and respond to booking requests below</p>
            </div>
          )}

          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
                <CalendarDays size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No bookings yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">When users book your vehicles, they'll appear here</p>
              </div>
            ) : (
              bookings
                .filter(b => b.status !== 'cancelled')
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map(b => {
                  const days = Math.ceil(
                    (new Date(b.endDate) - new Date(b.startDate)) / (1000 * 60 * 60 * 24)
                  );
                  const total = days * b.vehicle?.pricePerDay || 0;

                  return (
                    <div key={b._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden flex flex-col md:flex-row">
                      <div className="md:w-1/4 h-48 md:h-auto bg-gray-100 dark:bg-gray-800">
                        {b.vehicle?.image ? (
                          <img
                            src={b.vehicle.image.startsWith('http') ? b.vehicle.image : `${API.defaults.baseURL}${b.vehicle.image}`}
                            alt={b.vehicle.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Car size={40} />
                          </div>
                        )}
                      </div>

                      <div className="p-6 md:w-3/4 flex flex-col justify-between">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">{b.vehicle?.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <User size={14} />
                                <span>{b.user?.name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <IndianRupee size={14} />
                                <span>Rs {total.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className={`px-3 py-1 rounded-full text-xs font-bold border dark:border-gray-700 flex items-center gap-1.5 ${
                            b.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            b.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-100' :
                            b.status === 'cancellation_requested' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                            b.status === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                            'bg-red-50 text-red-700 border-red-100'
                          }`}>
                            <span className="capitalize">{b.status.replace('_', ' ')}</span>
                          </div>
                        </div>

                        {b.status === 'cancellation_requested' && (
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 border dark:border-yellow-800 border-yellow-200 p-3 rounded-lg mb-4 flex items-start gap-3">
                            <AlertTriangle className="text-yellow-600 dark:text-yellow-500 mt-0.5" size={18} />
                            <div>
                              <p className="font-bold text-yellow-900 dark:text-yellow-200">Cancellation Request</p>
                              <p className="text-sm text-yellow-800 dark:text-yellow-300">{b.cancellationReason}</p>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b mb-6 border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <CalendarDays size={20} className="text-blue-500" />
                            <div className="text-sm">
                              <p className="text-gray-500 dark:text-gray-400 font-medium">Rental Period</p>
                              <p className="font-bold text-gray-900 dark:text-white">{new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            <p className="font-medium">Renter Email</p>
                            <p className="font-bold text-gray-900 dark:text-white">{b.user?.email}</p>
                          </div>
                          {b.paymentId && (
                            <div className="flex items-center gap-3">
                              <CheckCircle size={20} className={(payments[b._id]?.status === "paid" || payments[b._id]?.status === "completed") ? "text-green-500" : "text-yellow-500"} />
                              <div className="text-sm">
                                <p className="text-gray-500 dark:text-gray-400 font-medium">Payment Status</p>
                                <p className={`font-bold ${(payments[b._id]?.status === "paid" || payments[b._id]?.status === "completed") ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"}`}>
                                  {(payments[b._id]?.status === "paid" || payments[b._id]?.status === "completed") ? "✓ Paid" : "Pending"}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {b.status === "pending" && (
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => updateStatus(b._id, "confirmed")}
                              className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-bold hover:bg-green-700 transition flex items-center justify-center gap-2"
                            >
                              <CheckCircle size={18} />
                              Confirm Booking
                            </button>
                            <button
                              onClick={() => updateStatus(b._id, "cancelled")}
                              className="flex-1 bg-white dark:bg-gray-900 text-red-600 border border-red-200 dark:border-red-800 py-2.5 rounded-lg font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center justify-center gap-2"
                            >
                              <XCircle size={18} />
                              Reject
                            </button>
                          </div>
                        )}

                        {b.status === "cancellation_requested" && (
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => updateStatus(b._id, "cancelled")}
                              className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-bold hover:bg-red-700 transition flex items-center justify-center gap-2"
                            >
                              <XCircle size={18} />
                              Approve Cancellation
                            </button>
                            <button
                              onClick={() => updateStatus(b._id, "confirmed")}
                              className="flex-1 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 py-2.5 rounded-lg font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center justify-center gap-2"
                            >
                              <Check size={18} />
                              Reject Cancellation
                            </button>
                          </div>
                        )}

                        {b.status === "confirmed" && (
                          <button
                            onClick={() => updateStatus(b._id, "completed")}
                            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                          >
                            <CheckCircle size={18} />
                            Mark as Completed
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* Vehicles Tab */}
      {activeTab === "vehicles" && (
        <div className="space-y-6">
          {vehicles.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
              <Car size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No vehicles yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Add your first vehicle to start renting</p>
              <Link
                to="/add-vehicle"
                className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
              >
                Add Vehicle
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map(vehicle => {
                const vehicleData = vehicleStats.find(v => v.id === vehicle._id) || {};
                return (
                  <div key={vehicle._id} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border dark:border-gray-700 hover:shadow-lg transition">
                    <div className="h-48 bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                      {vehicle.image ? (
                        <img
                          src={vehicle.image.startsWith('http') ? vehicle.image : `${API.defaults.baseURL}${vehicle.image}`}
                          alt={vehicle.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Car size={40} />
                        </div>
                      )}
                      <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${
                        vehicle.status === 'active'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        {vehicle.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="p-6">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3">{vehicle.title}</h3>

                      <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{vehicle.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Price:</span>
                          <span className="font-medium text-gray-900 dark:text-white">Rs {vehicle.pricePerDay}/day</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Bookings:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{vehicleData.bookings || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Earnings:</span>
                          <span className="font-medium text-green-600 dark:text-green-400">Rs {(vehicleData.earnings || 0).toLocaleString()}</span>
                        </div>
                      </div>

                      <Link
                        to={`/my-vehicles`}
                        className="w-full flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 py-2 rounded-lg font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
                      >
                        <Eye size={16} />
                        Manage
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default OwnerDashboard;