import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Users, Car, CalendarDays, Trash2, ShieldCheck, Search, X, ChevronDown, DollarSign, AlertCircle, Mail } from "lucide-react";

function SuperAdminDashboard() {
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Search states
  const [searchUsers, setSearchUsers] = useState("");
  const [searchVehicles, setSearchVehicles] = useState("");
  const [searchBookings, setSearchBookings] = useState("");
  const [searchPayments, setSearchPayments] = useState("");
  
  // Detailed views
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingPayment, setBookingPayment] = useState(null);
  const [contactMessage, setContactMessage] = useState("");

  const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

  const fetchData = async () => {
    try {
      const [usersRes, vehiclesRes, bookingsRes, paymentsRes, statsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/users", { headers }),
        axios.get("http://localhost:5000/api/admin/vehicles", { headers }),
        axios.get("http://localhost:5000/api/admin/bookings", { headers }),
        axios.get("http://localhost:5000/api/admin/payments", { headers }),
        axios.get("http://localhost:5000/api/admin/statistics", { headers })
      ]);

      setUsers(usersRes.data);
      setVehicles(vehiclesRes.data);
      setBookings(bookingsRes.data);
      setPayments(paymentsRes.data);
      setStatistics(statsRes.data);
    } catch (error) {
      toast.error("Failed to fetch admin data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter functions
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchUsers.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUsers.toLowerCase())
  );

  const filteredVehicles = vehicles.filter(v =>
    v.title.toLowerCase().includes(searchVehicles.toLowerCase()) ||
    v.owner?.email.toLowerCase().includes(searchVehicles.toLowerCase())
  );

  const filteredBookings = bookings.filter(b =>
    (b.vehicle?.title || "").toLowerCase().includes(searchBookings.toLowerCase()) ||
    (b.user?.email || "").toLowerCase().includes(searchBookings.toLowerCase())
  );

  const filteredPayments = payments.filter(p =>
    (p.user?.email || "").toLowerCase().includes(searchPayments.toLowerCase()) ||
    (p.transaction_id || "").toLowerCase().includes(searchPayments.toLowerCase())
  );

  // Actions
  const deleteItem = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/${type}s/${id}`, { headers });
      toast.success(`${type} deleted successfully`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to delete ${type}`);
    }
  };

  const updateUserRole = async (id, role) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${id}`, { role }, { headers });
      toast.success("User role updated");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user role");
    }
  };

  const updateVehicleStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/vehicles/${id}`, { status }, { headers });
      toast.success("Vehicle status updated");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update vehicle status");
    }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/bookings/${id}`, { status }, { headers });
      toast.success("Booking status updated");
      fetchData();
      setSelectedBooking(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update booking");
    }
  };

  const handleRefund = async (paymentId) => {
    if (!window.confirm("Process refund for this payment?")) return;

    try {
      await axios.put(`http://localhost:5000/api/admin/payments/${paymentId}`, { status: "refunded" }, { headers });
      toast.success("Refund processed successfully");
      fetchData();
      setSelectedBooking(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to process refund");
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Cancel this booking? A refund will be issued.")) return;

    try {
      await axios.put(`http://localhost:5000/api/admin/bookings/${bookingId}`, { status: "cancelled" }, { headers });
      
      // Find and refund associated payment
      const booking = bookings.find(b => b._id === bookingId);
      if (booking) {
        const payment = payments.find(p => p.booking === bookingId && p.status === "completed");
        if (payment) {
          await axios.put(`http://localhost:5000/api/admin/payments/${payment._id}`, { status: "refunded" }, { headers });
        }
      }
      
      toast.success("Booking cancelled and refund processed");
      fetchData();
      setSelectedBooking(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    }
  };

  const sendContactMessage = async (userId) => {
    if (!contactMessage.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    try {
      // In a real system, this would send an email or notification
      // For now, we'll just show a success message
      toast.success("Message sent to user");
      setContactMessage("");
      setSelectedBooking(null);
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 sm:mb-8">
        <div className="bg-red-100 p-2 sm:p-3 rounded-xl text-red-600">
          <ShieldCheck size={24} className="sm:block hidden" />
          <ShieldCheck size={20} className="sm:hidden block" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200">Superadmin Dashboard</h2>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Full platform control and management</p>
        </div>
      </div>

      {/* Statistics Cards */}
      {activeTab === "dashboard" && statistics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{statistics.totalUsers}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Active platform users</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
                  <Users size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Vehicles</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{statistics.totalVehicles}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Listed on platform</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                  <Car size={24} className="text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Bookings</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{statistics.totalBookings}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">{statistics.confirmedBookings} confirmed</p>
                </div>
                <div className="bg-amber-100 dark:bg-amber-900/20 p-3 rounded-lg">
                  <CalendarDays size={24} className="text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Platform Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400 text-sm">Active Users</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{users.filter(u => u.role !== 'admin').length}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400 text-sm">Vehicle Owners</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{users.filter(u => u.role === 'owner').length}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400 text-sm">Available Vehicles</span>
                <span className="font-semibold text-green-600 dark:text-green-400">{vehicles.filter(v => v.status === 'available').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400 text-sm">Pending Bookings</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">{bookings.filter(b => b.status === 'pending').length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="sticky top-0 z-40 bg-gradient-to-b from-white dark:from-gray-900 to-white/95 dark:to-gray-900/95 flex gap-2 sm:gap-4 border-b border-gray-200 dark:border-gray-700 mb-4 sm:mb-6 overflow-x-auto shadow-sm">
        {[
          { id: "dashboard", label: "Overview", icon: ShieldCheck },
          { id: "users", label: `Users (${users.length})`, icon: Users },
          { id: "vehicles", label: `Vehicles (${vehicles.length})`, icon: Car },
          { id: "bookings", label: `Bookings (${bookings.length})`, icon: CalendarDays },
          { id: "payments", label: `Payments (${payments.length})`, icon: DollarSign }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 sm:px-6 py-3 sm:py-4 font-medium text-sm sm:text-base whitespace-nowrap transition border-b-2 ${
              activeTab === tab.id 
                ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400" 
                : "border-b-2 border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
        
        {/* Users Tab */}
        {activeTab === "users" && (
          <div>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchUsers}
                  onChange={(e) => setSearchUsers(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b">
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Name</th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Email</th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Role</th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u._id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="p-4 font-medium text-sm">{u.name}</td>
                      <td className="p-4 text-gray-600 dark:text-gray-400 text-sm">{u.email}</td>
                      <td className="p-4">
                        <select
                          value={u.role}
                          onChange={(e) => updateUserRole(u._id, e.target.value)}
                          className={`px-2 py-1 rounded text-xs font-bold border dark:border-gray-600 ${
                            u.role === 'admin' ? 'bg-red-100 text-red-700 border-red-200' : 
                            u.role === 'owner' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                          disabled={u.role === 'admin'}
                        >
                          <option value="renter">Renter</option>
                          <option value="owner">Owner</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        {u.role !== 'admin' && (
                          <button onClick={() => deleteItem('user', u._id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded transition">
                            <Trash2 size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Vehicles Tab */}
        {activeTab === "vehicles" && (
          <div>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by vehicle or owner..."
                  value={searchVehicles}
                  onChange={(e) => setSearchVehicles(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b">
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Vehicle</th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Owner</th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Price/Day</th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Status</th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.map(v => (
                    <tr key={v._id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="p-4 font-medium text-sm">{v.title}</td>
                      <td className="p-4 text-gray-600 dark:text-gray-400 text-sm">{v.owner?.email}</td>
                      <td className="p-4 text-sm">Rs {v.pricePerDay}</td>
                      <td className="p-4">
                        <select
                          value={v.status}
                          onChange={(e) => updateVehicleStatus(v._id, e.target.value)}
                          className={`px-2 py-1 rounded text-xs font-bold border dark:border-gray-600 ${
                            v.status === 'available' ? 'bg-green-100 text-green-700 border-green-200' : 
                            v.status === 'unavailable' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                          }`}
                        >
                          <option value="available">Available</option>
                          <option value="unavailable">Unavailable</option>
                          <option value="maintenance">Maintenance</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => deleteItem('vehicle', v._id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded transition">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by vehicle or user..."
                  value={searchBookings}
                  onChange={(e) => setSearchBookings(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b">
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Vehicle</th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">User</th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Dates</th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Status</th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map(b => (
                    <tr key={b._id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="p-4 font-medium text-sm">{b.vehicle?.title || "Deleted"}</td>
                      <td className="p-4 text-gray-600 dark:text-gray-400 text-sm">{b.user?.email || "Deleted"}</td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          b.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          b.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => {
                            setSelectedBooking(b);
                            const payment = payments.find(p => p.booking === b._id);
                            setBookingPayment(payment);
                          }}
                          className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded transition"
                        >
                          <ChevronDown size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === "payments" && (
          <div>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by user or transaction ID..."
                  value={searchPayments}
                  onChange={(e) => setSearchPayments(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b">
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">User</th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Amount</th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Gateway</th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Status</th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Transaction ID</th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map(p => (
                    <tr key={p._id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="p-4 font-medium text-sm">{p.user?.email}</td>
                      <td className="p-4 font-semibold text-sm">Rs {(p.amount / 100).toFixed(2)}</td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{p.gateway}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          p.status === 'completed' ? 'bg-green-100 text-green-700' :
                          p.status === 'refunded' ? 'bg-blue-100 text-blue-700' :
                          p.status === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400 font-mono">{p.transaction_id || "-"}</td>
                      <td className="p-4 text-right">
                        {p.status === 'completed' && (
                          <button 
                            onClick={() => handleRefund(p._id)}
                            className="text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 p-2 rounded transition text-xs font-medium"
                          >
                            Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Booking Details</h3>
              <button onClick={() => setSelectedBooking(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Booking Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Vehicle</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedBooking.vehicle?.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Vehicle Owner</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{selectedBooking.vehicle?.owner?.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Renter</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedBooking.user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Renter Name</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{selectedBooking.user?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Check-in</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{new Date(selectedBooking.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Check-out</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{new Date(selectedBooking.endDate).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Payment Info */}
              {bookingPayment && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Payment Information</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Amount</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">Rs {(bookingPayment.amount / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Status</span>
                      <span className={`font-semibold ${bookingPayment.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {bookingPayment.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Gateway</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{bookingPayment.gateway}</span>
                    </div>
                    {bookingPayment.transaction_id && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Transaction ID</span>
                        <span className="font-mono text-xs text-gray-900 dark:text-gray-100">{bookingPayment.transaction_id}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Status Update */}
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Update Booking Status</p>
                <div className="flex gap-2 flex-wrap">
                  {['pending', 'confirmed', 'completed', 'cancelled'].map(status => (
                    <button
                      key={status}
                      onClick={() => updateBookingStatus(selectedBooking._id, status)}
                      className={`flex-1 min-w-max px-4 py-2 rounded-lg font-medium text-sm transition ${
                        selectedBooking.status === status
                          ? status === 'pending' ? 'bg-amber-500 text-white' :
                            status === 'confirmed' ? 'bg-green-500 text-white' :
                            status === 'completed' ? 'bg-blue-500 text-white' :
                            'bg-red-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact User */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Send Message to User</label>
                <textarea
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100 text-sm"
                  rows="3"
                />
                <button
                  onClick={() => sendContactMessage(selectedBooking.user?._id)}
                  className="mt-2 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                >
                  <Mail size={16} /> Send Message
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                {selectedBooking.status === "confirmed" && (
                  <button
                    onClick={() => handleCancelBooking(selectedBooking._id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 transition font-medium"
                  >
                    <AlertCircle size={16} /> Cancel Booking & Refund
                  </button>
                )}
                {bookingPayment && bookingPayment.status === "completed" && bookingPayment.status !== "refunded" && (
                  <button
                    onClick={() => handleRefund(bookingPayment._id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/20 text-orange-600 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/40 transition font-medium"
                  >
                    <DollarSign size={16} /> Process Refund
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuperAdminDashboard;
