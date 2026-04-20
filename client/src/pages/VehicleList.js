import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { MapPin, Tag, Car, Fuel, Phone, Mail } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import VehicleFilter from "../components/VehicleFilter";

function VehicleList() {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: "",
    type: "",
    fuelType: "",
    minPrice: "",
    maxPrice: "",
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/vehicles");
        setVehicles(res.data);
        setFilteredVehicles(res.data);
      } catch (error) {
        toast.error("Failed to fetch vehicles");
        console.error("Error fetching vehicles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    const filtered = vehicles.filter((vehicle) => {
      const locationMatch =
        !newFilters.location ||
        vehicle.location?.toLowerCase().includes(newFilters.location.toLowerCase());

      const typeMatch = !newFilters.type || vehicle.type === newFilters.type;

      const fuelTypeMatch = !newFilters.fuelType || vehicle.fuelType === newFilters.fuelType;

      const minPriceMatch =
        !newFilters.minPrice || vehicle.pricePerDay >= parseFloat(newFilters.minPrice);

      const maxPriceMatch =
        !newFilters.maxPrice || vehicle.pricePerDay <= parseFloat(newFilters.maxPrice);

      return locationMatch && typeMatch && fuelTypeMatch && minPriceMatch && maxPriceMatch;
    });

    setFilteredVehicles(filtered);
  };

  const clearFilters = () => {
    setFilters({
      location: "",
      type: "",
      fuelType: "",
      minPrice: "",
      maxPrice: "",
    });
    setFilteredVehicles(vehicles);
  };

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
    <div className="px-3 sm:px-4 md:px-0">
      {/* Filter Component */}
      <VehicleFilter onFiltersChange={applyFilters} onClear={clearFilters} />

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200">Available Vehicles</h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">{filteredVehicles.length} vehicles found</p>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {filteredVehicles.map((v) => (
          <div key={v._id} className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden hover:shadow-md transition group">
            <div className="h-48 sm:h-60 md:h-72 bg-gray-200 relative overflow-hidden">
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
                  <Car size={40} className="sm:block" />
                </div>
              )}
              <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-white dark:bg-gray-800/90 backdrop-blur px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold text-blue-600 shadow-sm">
                Rs {v.pricePerDay}/day
              </div>
              {v.status !== "available" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-lg sm:rounded-xl">
                  <span className="px-3 sm:px-4 py-1 sm:py-2 bg-red-500 text-white font-bold text-sm sm:text-base rounded-lg capitalize">
                    {v.status}
                  </span>
                </div>
              )}
            </div>

            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">{v.title}</h3>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs sm:text-sm flex-wrap">
                    <span className="flex items-center gap-1">
                      <Tag size={14} />
                      {v.type}
                    </span>
                    {v.fuelType && (
                      <span className="flex items-center gap-1">
                        <Fuel size={14} />
                        {v.fuelType.charAt(0).toUpperCase() + v.fuelType.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                <MapPin size={14} className="sm:block text-blue-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium line-clamp-1">
                  {typeof v.location === 'string' ? v.location : v.location?.address}
                </span>
              </div>

              {/* Owner Contact Information */}
              {v.owner && (
                <div className="mb-4 sm:mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-2 uppercase tracking-wider">Contact Owner</p>
                  <div className="space-y-2">
                    {v.owner.phone && (
                      <a
                        href={`tel:${v.owner.phone}`}
                        className="flex items-center gap-2 text-xs sm:text-sm text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 transition"
                      >
                        <Phone size={14} className="flex-shrink-0" />
                        <span className="font-medium">{v.owner.phone}</span>
                      </a>
                    )}
                    {v.owner.email && (
                      <a
                        href={`mailto:${v.owner.email}`}
                        className="flex items-center gap-2 text-xs sm:text-sm text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 transition truncate"
                      >
                        <Mail size={14} className="flex-shrink-0" />
                        <span className="font-medium truncate">{v.owner.email}</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between pt-4 border-t border-gray-200 dark:border-gray-700 gap-3 sm:gap-0">
                <div className="text-xs text-gray-400">
                  Listed by{" "}
                  <Link
                    to={`/profile/${v.owner?._id}`}
                    className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    {v.owner?.name}
                  </Link>
                </div>
                <button
                  onClick={() => handleBookingClick(v)}
                  disabled={user?._id === v.owner?._id || v.status !== "available"}
                  className={`w-full sm:w-auto px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-bold transition ${
                    user?._id === v.owner?._id
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                      : v.status !== "available"
                      ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm active:scale-95"
                  }`}
                >
                  {user?._id === v.owner?._id ? "Your Vehicle" : v.status !== "available" ? `${v.status}` : "Book Now"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVehicles.length === 0 && (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 border-dashed">
          <Car size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">No vehicles found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters to find more vehicles.</p>
        </div>
      )}
    </div>
  );
}

export default VehicleList;