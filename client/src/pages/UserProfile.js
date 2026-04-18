import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { Car, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

const UserProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { userId } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const displayUserId = userId || user?._id;

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        // Fetch user profile info
        const userResponse = await axios.get(
          `http://localhost:5000/api/vehicles/user/${displayUserId}`
        );

        // Get user name from the first vehicle's owner data, or set a default
        if (userResponse.data.length > 0) {
          setProfileUser(userResponse.data[0].owner);
        }

        // Fetch vehicles for this user
        setVehicles(userResponse.data || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (displayUserId) {
      fetchUserProfile();
    }
  }, [displayUserId]);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {profileUser?.name || "Profile"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{profileUser?.email}</p>
          </div>
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 dark:bg-blue-500 text-white font-bold text-xl">
            {profileUser?.name
              ?.split(" ")
              .map((word) => word[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </div>
        </div>
      </div>

      {/* Vehicles Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Car size={24} className="text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Uploaded Vehicles
          </h2>
          {!loading && (
            <span className="ml-auto px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
              {vehicles.length}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h3 className="font-semibold text-red-900 dark:text-red-300">Error</h3>
            <p className="text-sm text-red-800 dark:text-red-400 mt-2">{error}</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg py-12 text-center">
            <Car size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-3" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              No vehicles uploaded yet
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Start by adding your first vehicle
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle._id}
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
                onClick={() => navigate(`/book/${vehicle._id}`)}
              >
                {/* Vehicle Image */}
                <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  {vehicle.image ? (
                    <img
                      src={vehicle.image.startsWith('http') ? vehicle.image : `http://localhost:5000${vehicle.image}`}
                      alt={vehicle.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car size={48} className="text-gray-400 dark:text-gray-600" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Rs {vehicle.pricePerDay}/day
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {vehicle.title}
                  </h3>

                  <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">Type</p>
                      <p className="text-gray-900 dark:text-white font-semibold">
                        {vehicle.type}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">Location</p>
                      <p className="text-gray-900 dark:text-white font-semibold">
                        {typeof vehicle.location === 'string' ? vehicle.location : vehicle.location?.address || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3 text-sm">
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Status</p>
                    <p className="text-gray-900 dark:text-white font-semibold capitalize px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded inline-block">
                      {vehicle.status || "available"}
                    </p>
                  </div>

                  <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
