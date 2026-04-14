import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { CheckCircle, XCircle, Clock, User, CalendarDays, Car, IndianRupee, AlertTriangle, Check } from "lucide-react";

function OwnerDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/bookings/owner", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setBookings(res.data);
    } catch (error) {
      toast.error("Failed to fetch bookings");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `http://localhost:5000/api/bookings/${id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success(`Booking ${status} successfully!`);
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
      console.error(error);
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
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Booking Management</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage requests for your listed vehicles</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
          <Clock size={18} />
          <span>{bookings.filter(b => b.status === 'pending' || b.status === 'cancellation_requested').length} Pending Actions</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {bookings.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 border-dashed">
          <CalendarDays size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">No booking requests</h3>
            <p className="text-gray-500 dark:text-gray-400">You'll see requests here when users book your vehicles.</p>
          </div>
        ) : (
          bookings.map((b) => (
            <div key={b._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 overflow-hidden flex flex-col md:flex-row">
              <div className="md:w-1/4 h-48 md:h-auto bg-gray-100 dark:bg-gray-800">
                {b.vehicle?.image ? (
                  <img
                    src={b.vehicle.image.startsWith('http') ? b.vehicle.image : `http://localhost:5000${b.vehicle.image}`}
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
                        <span>Booked by <span className="font-semibold text-gray-700 dark:text-gray-300">{b.user?.name}</span></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <IndianRupee size={14} />
                        <span>Total: Rs {b.vehicle?.pricePerDay * 2}</span>
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
                  <div className="bg-yellow-50 border dark:border-gray-700 border-yellow-200 p-3 rounded-lg mb-4 flex items-start gap-3">
                    <AlertTriangle className="text-yellow-600 mt-0.5" size={18} />
                    <div>
                      <p className="font-bold text-yellow-800">Cancellation Request</p>
                      <p className="text-sm text-yellow-700">{b.cancellationReason}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b mb-6">
                  <div className="flex items-center gap-3">
                    <CalendarDays size={20} className="text-blue-500" />
                    <div className="text-sm">
                      <p className="text-gray-500 dark:text-gray-400 font-medium">Rental Period</p>
                      <p className="font-bold">{new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium">{b.user?.email}</span>
                  </div>
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
                      className="flex-1 bg-white dark:bg-gray-800 text-red-600 border dark:border-gray-700 border-red-200 py-2.5 rounded-lg font-bold hover:bg-red-50 transition flex items-center justify-center gap-2"
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
                      className="flex-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border dark:border-gray-700 border-gray-300 dark:border-gray-600 py-2.5 rounded-lg font-bold hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900 transition flex items-center justify-center gap-2"
                    >
                      <Check size={18} />
                      Reject Cancellation
                    </button>
                  </div>
                )}

                {b.status === "confirmed" && new Date(b.endDate) < new Date() && (
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
          ))
        )}
      </div>
    </div>
  );
}

export default OwnerDashboard;