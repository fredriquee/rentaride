import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { CalendarDays, MapPin, Car, IndianRupee, Clock, Info, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/vehicles`);
        const found = res.data.find(v => v._id === id);
        if (found) {
          setVehicle(found);
          setPickupLocation(found.location);
        } else {
          toast.error("Vehicle not found");
          navigate("/");
        }
      } catch (error) {
        toast.error("Failed to fetch vehicle details");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [id, navigate]);

  const calculateTotalPrice = () => {
    if (!startDate || !endDate || !vehicle) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    return diffDays * vehicle.pricePerDay;
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to book");
      navigate("/login");
      return;
    }

    if (user.currentRole === "owner") {
      toast.error("Switch to Renter mode to book vehicles");
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      toast.error("End date must be after start date");
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        "http://localhost:5000/api/bookings",
        {
          vehicle: id,
          startDate,
          endDate,
          pickupLocation // Note: backend doesn't save this yet, but we'll include it in req
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast.success("Booking request sent successfully!");
      navigate("/my-bookings");
    } catch (error) {
      toast.error(error.response?.data?.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20 animate-pulse">Loading vehicle...</div>;
  if (!vehicle) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border dark:border-gray-700 border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Vehicle Info */}
        <div className="md:w-1/2 bg-gray-50 dark:bg-gray-900 p-8 border-r border-gray-100 dark:border-gray-700">
          <div className="relative rounded-2xl overflow-hidden mb-6 aspect-video bg-gray-200 shadow-inner">
            {vehicle.image ? (
              <img
                src={vehicle.image.startsWith('http') ? vehicle.image : `http://localhost:5000${vehicle.image}`}
                alt={vehicle.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Car size={64} />
              </div>
            )}
            <div className="absolute top-4 right-4 bg-white dark:bg-gray-800/90 backdrop-blur px-4 py-2 rounded-2xl shadow-lg font-bold text-blue-600 border dark:border-gray-700 border-white/50">
              Rs {vehicle.pricePerDay}/day
            </div>
          </div>

          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">{vehicle.title}</h2>
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-6">
            <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full border dark:border-gray-700 border-gray-200 dark:border-gray-700 text-xs font-semibold uppercase tracking-wider">{vehicle.type}</span>
            <div className="flex items-center gap-1 text-sm">
              <MapPin size={16} className="text-blue-500" />
              <span>{vehicle.location}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 border dark:border-gray-700 border-blue-100 p-4 rounded-2xl flex items-start gap-3">
              <Info className="text-blue-500 mt-1 shrink-0" size={20} />
              <p className="text-sm text-blue-700 leading-relaxed">
                Bookings are subject to owner approval. You will be notified once the owner confirms your request.
              </p>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-xl text-gray-600 dark:text-gray-400">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Pickup Time</p>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">10:00 AM onwards</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Booking Form */}
        <div className="md:w-1/2 p-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">Reserve Vehicle</h3>
          
          <form onSubmit={handleBooking} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-transparent rounded-2xl focus:bg-white dark:focus:bg-gray-800 dark:bg-gray-800 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-gray-700 dark:text-gray-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">End Date</label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="date"
                    required
                    min={startDate || new Date().toISOString().split("T")[0]}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-transparent rounded-2xl focus:bg-white dark:focus:bg-gray-800 dark:bg-gray-800 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-gray-700 dark:text-gray-300"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Pickup Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-transparent rounded-2xl focus:bg-white dark:focus:bg-gray-800 dark:bg-gray-800 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-gray-700 dark:text-gray-300"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-gray-700 space-y-4">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                <span>Base Price</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">Rs {vehicle.pricePerDay} x day</span>
              </div>
              <div className="flex items-center justify-between text-xl font-extrabold text-gray-900 dark:text-gray-100">
                <span>Total Amount</span>
                <div className="flex items-center text-blue-600">
                  <IndianRupee size={24} />
                  <span>{calculateTotalPrice()}</span>
                </div>
              </div>

              {user?.currentRole === "owner" && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="text-amber-600 dark:text-amber-400 mt-1 shrink-0" size={18} />
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Switch to <strong>Renter Mode</strong> in Settings to book vehicles.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || user?.currentRole === "owner"}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : user?.currentRole === "owner" ? (
                  <>
                    Switch to Renter Mode
                  </>
                ) : (
                  <>
                    Confirm Booking
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BookingPage;
