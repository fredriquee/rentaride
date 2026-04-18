import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Users, Car, CalendarDays, Trash2, ShieldCheck } from "lucide-react";

function SuperAdminDashboard() {
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      
      const [usersRes, vehiclesRes, bookingsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/users", { headers }),
        axios.get("http://localhost:5000/api/admin/vehicles", { headers }),
        axios.get("http://localhost:5000/api/admin/bookings", { headers })
      ]);

      setUsers(usersRes.data);
      setVehicles(vehiclesRes.data);
      setBookings(bookingsRes.data);
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

  const deleteItem = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/${type}s/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      toast.success(`${type} deleted successfully`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to delete ${type}`);
    }
  };

  const updateUserRole = async (id, role) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${id}`, { role }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      toast.success("User role updated");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user role");
    }
  };

  const updateVehicleStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/vehicles/${id}`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      toast.success("Vehicle status updated");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update vehicle status");
    }
  };

  const updateBooking = async (id, field, value) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/bookings/${id}`, { [field]: value }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      toast.success(`Booking ${field} updated`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to update booking ${field}`);
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 sm:mb-8">
        <div className="bg-red-100 p-2 sm:p-3 rounded-xl text-red-600">
          <ShieldCheck size={24} className="sm:block hidden" />
          <ShieldCheck size={20} className="sm:hidden block" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200">Superadmin Dashboard</h2>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Manage all platform data</p>
        </div>
      </div>

      {/* Tabs - Scrollable on mobile */}
      <div className="flex gap-2 sm:gap-4 border-b mb-4 sm:mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-3 sm:px-6 py-2 sm:py-3 font-medium text-sm sm:text-base whitespace-nowrap transition ${
            activeTab === "users" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300"
          }`}
        >
          <Users size={18} /> Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("vehicles")}
          className={`flex items-center gap-2 px-3 sm:px-6 py-2 sm:py-3 font-medium text-sm sm:text-base whitespace-nowrap transition ${
            activeTab === "vehicles" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300"
          }`}
        >
          <Car size={18} /> Vehicles ({vehicles.length})
        </button>
        <button
          onClick={() => setActiveTab("bookings")}
          className={`flex items-center gap-2 px-3 sm:px-6 py-2 sm:py-3 font-medium text-sm sm:text-base whitespace-nowrap transition ${
            activeTab === "bookings" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300"
          }`}
        >
          <CalendarDays size={18} /> Bookings ({bookings.length})
        </button>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-x-auto">
        {activeTab === "users" && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b">
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-400">Name</th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-400">Email</th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-400">Role</th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900">
                  <td className="p-4 font-medium">{u.name}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{u.email}</td>
                  <td className="p-4">
                    <select
                      value={u.role}
                      onChange={(e) => updateUserRole(u._id, e.target.value)}
                      className={`px-2 py-1 rounded text-xs font-bold border dark:border-gray-700 ${
                        u.role === 'admin' ? 'bg-red-100 text-red-700 border-red-200' : 
                        u.role === 'owner' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                      }`}
                      disabled={u.role === 'admin'} // Prevent changing superadmin role
                    >
                      <option value="renter">Renter</option>
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    {u.role !== 'admin' && (
                      <button onClick={() => deleteItem('user', u._id)} className="text-red-500 hover:bg-red-50 p-2 rounded transition">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === "vehicles" && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b">
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-400">Vehicle</th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-400">Owner</th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(v => (
                <tr key={v._id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900">
                  <td className="p-4 font-medium">{v.title}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{v.owner?.email}</td>
                  <td className="p-4">
                    <select
                      value={v.status}
                      onChange={(e) => updateVehicleStatus(v._id, e.target.value)}
                      className={`px-2 py-1 rounded text-xs font-bold border dark:border-gray-700 ${
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
                    <button onClick={() => deleteItem('vehicle', v._id)} className="text-red-500 hover:bg-red-50 p-2 rounded transition">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === "bookings" && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b">
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-400">Vehicle</th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-400">User</th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b._id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900">
                  <td className="p-4 font-medium">{b.vehicle?.title || "Deleted"}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{b.user?.email || "Deleted"}</td>
                  <td className="p-4">
                    <select
                      value={b.status}
                      onChange={(e) => updateBooking(b._id, 'status', e.target.value)}
                      className={`px-2 py-1 rounded text-xs font-bold border dark:border-gray-700 ${
                        b.status === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                        b.status === 'confirmed' ? 'bg-green-100 text-green-700 border-green-200' :
                        'bg-red-100 text-red-700 border-red-200'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => deleteItem('booking', b._id)} className="text-red-500 hover:bg-red-50 p-2 rounded transition">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default SuperAdminDashboard;
