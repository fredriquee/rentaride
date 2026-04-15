import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { CalendarDays, MapPin, Tag, Clock, CheckCircle2, XCircle, Car, Info, MessageSquareText } from "lucide-react";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [submittingCancellation, setSubmittingCancellation] = useState(false);

  const fetchBookings = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/bookings/my", {
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

  const calculateTotalPrice = (booking) => {
    if (!booking.startDate || !booking.endDate || !booking.vehicle) return 0;
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays * booking.vehicle.pricePerDay;
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return <Clock className="text-amber-500" size={18} />;
      case "confirmed": return <CheckCircle2 className="text-green-500" size={18} />;
      case "cancelled": return <XCircle className="text-red-500" size={18} />;
      case "cancellation_requested": return <AlertCircle className="text-yellow-500" size={18} />;
      case "completed": return <CheckCircle2 className="text-blue-500" size={18} />;
      default: return <AlertCircle className="text-gray-500 dark:text-gray-400" size={18} />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "pending": return "bg-amber-50 text-amber-700 border-amber-100";
      case "confirmed": return "bg-green-50 text-green-700 border-green-100";
      case "cancelled": return "bg-red-50 text-red-700 border-red-100";
      case "cancellation_requested": return "bg-yellow-50 text-yellow-700 border-yellow-100";
      case "completed": return "bg-blue-50 text-blue-700 border-blue-100";
      default: return "bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-100 dark:border-gray-700";
    }
  };

  const handleRequestCancellation = (bookingId) => {
    setSelectedBookingId(bookingId);
    setShowCancelModal(true);
  };

  const submitCancellationRequest = async () => {
    if (!cancellationReason.trim()) {
      toast.error("Please provide a reason for cancellation.");
      return;
    }
    setSubmittingCancellation(true);
    try {
      await axios.put(
        `http://localhost:5000/api/bookings/${selectedBookingId}/request-cancellation`,
        { cancellationReason },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Cancellation request sent to owner!");
      setShowCancelModal(false);
      setCancellationReason("");
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send cancellation request");
    } finally {
      setSubmittingCancellation(false);
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
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">My Bookings</h2>
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
          {bookings.length} Total
        </span>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 border-dashed">
          <CalendarDays size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">No bookings yet</h3>
          <p className="text-gray-500 dark:text-gray-400">You haven't booked any vehicles yet. Start exploring!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 overflow-hidden flex flex-col md:flex-row">
              <div className="md:w-1/3 h-48 md:h-auto bg-gray-100 dark:bg-gray-800 relative">
                {booking.vehicle?.image ? (
                  <img src={booking.vehicle.image} alt={booking.vehicle.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Car size={48} />
                  </div>
                )}
                <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold border dark:border-gray-700 flex items-center gap-1.5 backdrop-blur-md ${getStatusClass(booking.status)}`}>
                  {getStatusIcon(booking.status)}
                  <span className="capitalize">{booking.status.replace('_', ' ')}</span>
                </div>
              </div>

              <div className="p-6 md:w-2/3 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {booking.vehicle?.title || "Vehicle Unavailable"}
                    </h3>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Price</p>
                      <p className="text-lg font-bold text-blue-600">Rs {calculateTotalPrice(booking)}</p>
                    </div>
                  </div>

                  {booking.status === 'cancellation_requested' && booking.cancellationReason && (
                    <div className="bg-yellow-50 border dark:border-gray-700 border-yellow-200 p-3 rounded-lg mb-4 flex items-start gap-3">
                      <Info className="text-yellow-600 mt-0.5" size={18} />
                      <div>
                        <p className="font-bold text-yellow-800">Cancellation Reason:</p>
                        <p className="text-sm text-yellow-700">{booking.cancellationReason}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <CalendarDays size={16} className="text-blue-500" />
                      <div className="text-xs">
                        <p className="font-medium">From</p>
                        <p>{new Date(booking.startDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <CalendarDays size={16} className="text-blue-500" />
                      <div className="text-xs">
                        <p className="font-medium">To</p>
                        <p>{new Date(booking.endDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Tag size={14} />
                      <span>{booking.vehicle?.type}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      <span>{booking.vehicle?.location}</span>
                    </div>
                  </div>
                  
                  {(booking.status === "pending" || booking.status === "confirmed") && (
                    <button
                      onClick={() => handleRequestCancellation(booking._id)}
                      className="text-red-500 hover:text-red-700 text-sm font-bold transition flex items-center gap-1"
                    >
                      <XCircle size={18} />
                      Request Cancellation
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
          <div className="relative p-8 bg-white dark:bg-gray-800 w-96 mx-auto rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Request Cancellation</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Please provide a reason for cancelling your booking.</p>
            <div className="relative mb-6">
              <MessageSquareText className="absolute left-3 top-3 text-gray-400" size={18} />
              <textarea
                className="w-full pl-10 pr-4 py-2 border dark:border-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="4"
                placeholder="e.g., Change of plans, vehicle no longer needed..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                disabled={submittingCancellation}
              ></textarea>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 transition"
                disabled={submittingCancellation}
              >
                Cancel
              </button>
              <button
                onClick={submitCancellationRequest}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                disabled={submittingCancellation}
              >
                {submittingCancellation && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyBookings;