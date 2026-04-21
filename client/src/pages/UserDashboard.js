import { useEffect, useState } from "react";
import API from "../api";
import { toast } from "react-hot-toast";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
  CalendarDays, MapPin, IndianRupee, Clock, CheckCircle2, XCircle, Car, AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    completed: 0,
    pending: 0,
    cancelled: 0,
    totalSpent: 0,
    upcomingRentals: 0,
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchUserDashboardData();
    
    // Refetch data when page becomes visible (e.g., returning from payment page)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchUserDashboardData();
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const fetchUserDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Fetch all bookings
      const bookingsRes = await API.get("/api/bookings/my", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allBookings = bookingsRes.data || [];
      setBookings(allBookings);

      // Calculate statistics
      const completed = allBookings.filter(b => b.status === "completed").length;
      const pending = allBookings.filter(b => b.status === "pending" || b.status === "cancellation_requested").length;
      const cancelled = allBookings.filter(b => b.status === "cancelled").length;

      let totalSpent = 0;
      let upcomingRentals = 0;

      allBookings.forEach(booking => {
        if (booking.startDate && booking.endDate && booking.vehicle) {
          const start = new Date(booking.startDate);
          const end = new Date(booking.endDate);
          const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
          const bookingCost = days * booking.vehicle.pricePerDay;

          if (booking.status === "completed" || booking.status === "confirmed") {
            totalSpent += bookingCost;
          }

          if (start > new Date() && booking.status !== "cancelled") {
            upcomingRentals++;
          }
        }
      });

      setStats({ completed, pending, cancelled, totalSpent, upcomingRentals });

      // Calculate monthly booking data
      const monthlyBookings = {};
      allBookings.forEach(booking => {
        if (booking.startDate) {
          const date = new Date(booking.startDate);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          monthlyBookings[monthKey] = (monthlyBookings[monthKey] || 0) + 1;
        }
      });

      // Create last 6 months data
      const now = new Date();
      const last6Months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const monthName = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        last6Months.push({
          month: monthName,
          bookings: monthlyBookings[monthKey] || 0,
        });
      }
      setMonthlyData(last6Months);
    } catch (error) {
      toast.error("Failed to load dashboard data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Get upcoming bookings
  const upcomingBookings = bookings
    .filter(b => {
      const startDate = new Date(b.startDate);
      return startDate > new Date() && b.status !== "cancelled";
    })
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's your rental activity and booking summary
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Completed Bookings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-6 border dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:mb-3">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Completed Rentals</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.completed}</p>
            </div>
            <CheckCircle2 className="text-green-500 hidden sm:block" size={24} />
          </div>
          <CheckCircle2 className="text-green-500 sm:hidden" size={18} />
          <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Total trips completed</p>
        </div>

        {/* Upcoming Rentals */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-6 border dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:mb-3">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Upcoming Rentals</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.upcomingRentals}</p>
            </div>
            <Clock className="text-blue-500 hidden sm:block" size={24} />
          </div>
          <Clock className="text-blue-500 sm:hidden" size={18} />
          <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Scheduled trips</p>
        </div>

        {/* Pending Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-6 border dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:mb-3">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Pending</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.pending}</p>
            </div>
            <AlertCircle className="text-yellow-500 hidden sm:block" size={24} />
          </div>
          <AlertCircle className="text-yellow-500 sm:hidden" size={18} />
          <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Need your attention</p>
        </div>

        {/* Cancelled */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-6 border dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:mb-3">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Cancelled</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.cancelled}</p>
            </div>
            <XCircle className="text-red-500 hidden sm:block" size={24} />
          </div>
          <XCircle className="text-red-500 sm:hidden" size={18} />
          <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Cancelled bookings</p>
        </div>

        {/* Total Spent */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 rounded-lg sm:rounded-xl p-3 sm:p-6 border border-blue-200 dark:border-blue-800 col-span-2 sm:col-span-1">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:mb-3">
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">Total Spent</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                Rs {stats.totalSpent.toLocaleString()}
              </p>
            </div>
            <IndianRupee className="text-blue-600 dark:text-blue-400 hidden sm:block" size={24} />
          </div>
          <IndianRupee className="text-blue-600 dark:text-blue-400 sm:hidden" size={18} />
          <p className="text-xs text-blue-700 dark:text-blue-300 hidden sm:block">Across all bookings</p>
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
          My Bookings
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Monthly Bookings Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-6 border dark:border-gray-700">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Booking Activity (6 Months)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }} />
                  <Bar dataKey="bookings" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Booking Status Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-6 border dark:border-gray-700">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Booking Status</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Completed</span>
                    <span className="text-xs sm:text-sm font-bold text-green-600 dark:text-green-400">{stats.completed}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((stats.completed / Math.max(bookings.length, 1)) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Pending/Awaiting</span>
                    <span className="text-xs sm:text-sm font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((stats.pending / Math.max(bookings.length, 1)) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Cancelled</span>
                    <span className="text-xs sm:text-sm font-bold text-red-600 dark:text-red-400">{stats.cancelled}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((stats.cancelled / Math.max(bookings.length, 1)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Bookings */}
          {upcomingBookings.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Your Upcoming Rentals</h3>
              <div className="space-y-4">
                {upcomingBookings.map(booking => (
                  <div key={booking._id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex-shrink-0">
                      {booking.vehicle?.image ? (
                        <img
                          src={booking.vehicle.image.startsWith('http') ? booking.vehicle.image : `${API.defaults.baseURL}${booking.vehicle.image}`}
                          alt={booking.vehicle.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                          <Car size={20} className="text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 dark:text-white">{booking.vehicle?.title}</h4>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <CalendarDays size={14} />
                          {new Date(booking.startDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <IndianRupee size={14} />
                          Rs {booking.vehicle?.pricePerDay}/day
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                      {new Date(booking.startDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? "This week" : "Coming up"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === "bookings" && (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
              <CalendarDays size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No bookings yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Start exploring vehicles and create your first booking!</p>
              <button
                onClick={() => navigate("/")}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
              >
                Browse Vehicles
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings
                .filter(b => b.status !== 'cancelled')
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map(booking => {
                  const days = Math.ceil(
                    (new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24)
                  );
                  const total = days * booking.vehicle?.pricePerDay || 0;

                  return (
                    <div key={booking._id} className="bg-white dark:bg-gray-800 rounded-xl p-6 border dark:border-gray-700 hover:shadow-md transition">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          {booking.vehicle?.image ? (
                            <img
                              src={booking.vehicle.image.startsWith('http') ? booking.vehicle.image : `${API.defaults.baseURL}${booking.vehicle.image}`}
                              alt={booking.vehicle.title}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                              <Car size={24} className="text-gray-500" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-gray-900 dark:text-white">{booking.vehicle?.title}</h4>
                            <div className="flex flex-col gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-2">
                                <MapPin size={14} />
                                {typeof booking.vehicle?.location === 'string' ? booking.vehicle.location : booking.vehicle?.location?.address || 'N/A'}
                              </div>
                              <div className="flex items-center gap-2">
                                <CalendarDays size={14} />
                                {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()} ({days} days)
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">Rs {total.toLocaleString()}</p>
                          <p className={`text-sm font-medium mt-2 px-3 py-1 rounded-full ${
                            booking.status === "completed" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" :
                            booking.status === "confirmed" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" :
                            booking.status === "pending" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300" :
                            "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                          }`}>
                            {booking.status.replace('_', ' ').toUpperCase()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Owner: <span className="font-medium text-gray-900 dark:text-gray-100">{booking.vehicle?.owner?.name}</span>
                        </div>
                        {booking.status === "confirmed" && !booking.paymentId && (
                          <button
                            onClick={() => navigate(`/payment/${booking._id}`)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                          >
                            Pay Now
                          </button>
                        )}
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

export default UserDashboard;
