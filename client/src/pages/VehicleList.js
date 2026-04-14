import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { MapPin, Tag, Calendar, Car } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function VehicleList() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/vehicles");
        setVehicles(res.data);
      } catch (error) {
        toast.error("Failed to fetch vehicles");
        console.error("Error fetching vehicles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const handleBookingClick = (vehicle) => {
    if (!user) {
      toast.error("Please login to book a vehicle");
      navigate("/login");
      return;
    }

    if (vehicle.status !== "available") {
      toast.error(`This vehicle is currently ${vehicle.status}`);
      return;
    }

    navigate(`/book/${vehicle._id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Available Vehicles</h2>
        <p className="text-gray-500 dark:text-gray-400">{vehicles.length} vehicles found</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {vehicles.map((v) => (
          <div key={v._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden hover:shadow-md transition group">
            <div className="h-48 bg-gray-200 relative overflow-hidden">
              {v.image ? (
                <img
                  src={v.image.startsWith('http') ? v.image : `http://localhost:5000${v.image}`}
                  alt={v.title}
                  className={`w-full h-full object-cover group-hover:scale-105 transition duration-300 ${
                    v.status !== "available" ? "opacity-50" : ""
                  }`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Car size={48} />
                </div>
              )}
              <div className="absolute top-4 right-4 bg-white dark:bg-gray-800/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-blue-600 shadow-sm">
                Rs {v.pricePerDay}/day
              </div>
              {v.status !== "available" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-xl">
                  <span className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg capitalize">
                    {v.status}
                  </span>
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">{v.title}</h3>
                  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
                    <Tag size={14} />
                    <span>{v.type}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-6">
                <MapPin size={16} className="text-blue-500" />
                <span className="text-sm font-medium">{v.location}</span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-xs text-gray-400">
                  Listed by <span className="font-medium text-gray-600 dark:text-gray-400">{v.owner?.name}</span>
                </div>
                <button
                  onClick={() => handleBookingClick(v)}
                  disabled={user?._id === v.owner?._id || v.status !== "available"}
                  className={`px-6 py-2 rounded-lg font-bold transition ${
                    user?._id === v.owner?._id
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                      : v.status !== "available"
                      ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                  }`}
                >
                  {user?._id === v.owner?._id ? "Your Vehicle" : v.status !== "available" ? `${v.status}` : "Book Now"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {vehicles.length === 0 && (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 border-dashed">
          <Car size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">No vehicles available</h3>
          <p className="text-gray-500 dark:text-gray-400">Check back later for new listings.</p>
        </div>
      )}
    </div>
  );
}

export default VehicleList;