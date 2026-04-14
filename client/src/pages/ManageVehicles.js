import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Edit2, Trash2, Plus, X, Upload, Check, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatusToggle from "../components/StatusToggle";

function ManageVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/vehicles/owner/myVehicles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVehicles(res.data);
    } catch (error) {
      toast.error("Failed to fetch your vehicles");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (vehicle) => {
    setEditingId(vehicle._id);
    setEditForm({
      title: vehicle.title,
      type: vehicle.type,
      pricePerDay: vehicle.pricePerDay,
      location: vehicle.location,
      status: vehicle.status,
      currentImage: vehicle.image,
    });
    setUploadedFiles([]);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setUploadedFiles([]);
  };

  const handleFileUpload = (files) => {
    const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      toast.error("Please upload a valid image file");
      return;
    }

    if (imageFiles.length > 1) {
      toast.error("You can only upload 1 image at a time");
      return;
    }

    const newFile = {
      file: imageFiles[0],
      preview: URL.createObjectURL(imageFiles[0]),
      name: imageFiles[0].name,
    };

    setUploadedFiles([newFile]);
  };

  const removeFile = (index) => {
    setUploadedFiles((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleUpdate = async (vehicleId) => {
    try {
      const formData = new FormData();
      formData.append("title", editForm.title);
      formData.append("type", editForm.type);
      formData.append("pricePerDay", editForm.pricePerDay);
      formData.append("location", editForm.location);
      formData.append("status", editForm.status);

      uploadedFiles.forEach((fileObj) => {
        formData.append("images", fileObj.file);
      });

      await axios.put(`http://localhost:5000/api/vehicles/${vehicleId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Vehicle updated successfully!");
      setEditingId(null);
      setUploadedFiles([]);
      fetchVehicles();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update vehicle");
    }
  };

  const handleDeleteImage = async (vehicleId, imageUrl) => {
    if (!window.confirm("Delete this image?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/vehicles/${vehicleId}/image`, {
        data: { imageUrl },
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Image deleted!");
      fetchVehicles();
    } catch (error) {
      toast.error("Failed to delete image");
    }
  };

  const handleStatusChange = async (vehicleId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/api/vehicles/${vehicleId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(`Status updated to ${newStatus}!`);
      fetchVehicles();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (vehicleId) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/vehicles/${vehicleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Vehicle deleted successfully!");
      fetchVehicles();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete vehicle");
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
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">My Vehicles</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your vehicle listings</p>
        </div>
        <button
          onClick={() => navigate("/add-vehicle")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition shadow-lg"
        >
          <Plus size={20} />
          Add Vehicle
        </button>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 border-dashed">
          <Plus size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">No vehicles yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Start earning by adding your first vehicle</p>
          <button
            onClick={() => navigate("/add-vehicle")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold inline-flex items-center gap-2"
          >
            <Plus size={18} />
            Add Your First Vehicle
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle._id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 overflow-hidden"
            >
              {editingId === vehicle._id ? (
                // Edit Mode
                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Edit Vehicle</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Vehicle Name
                      </label>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Type
                      </label>
                      <select
                        value={editForm.type}
                        onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                        className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                      >
                        <option value="Scooter">Scooter</option>
                        <option value="Bike">Bike</option>
                        <option value="Car">Car</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Price Per Day (Rs)
                      </label>
                      <input
                        type="number"
                        value={editForm.pricePerDay}
                        onChange={(e) => setEditForm({ ...editForm, pricePerDay: e.target.value })}
                        className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={editForm.location}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Availability
                      </label>
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            editForm.status === "available" ? "bg-green-500" : "bg-gray-400"
                          }`}
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {editForm.status === "available"
                            ? "Ready for bookings"
                            : "Not accepting bookings"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Use the toggle below to change availability after saving
                      </p>
                    </div>
                  </div>

                  {/* Image Management Section */}
                  <div className="md:col-span-2 border-t dark:border-gray-700 pt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Vehicle Image
                    </label>

                    {/* Current Image */}
                    {editForm.currentImage && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Current Image</p>
                        <div className="relative w-32 h-24 group">
                          <img
                            src={
                              editForm.currentImage.startsWith("http")
                                ? editForm.currentImage
                                : `http://localhost:5000${editForm.currentImage}`
                            }
                            alt="Current"
                            className="w-full h-full object-cover rounded-lg border dark:border-gray-600"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              handleDeleteImage(editingId, editForm.currentImage);
                              setEditForm({ ...editForm, currentImage: null });
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition"
                            title="Delete image"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Upload New Image */}
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                        id="edit-file-input"
                      />
                      <label htmlFor="edit-file-input" className="cursor-pointer">
                        <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {editForm.currentImage ? "Replace image" : "Upload image"}
                        </p>
                      </label>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Image</p>
                        <div className="relative w-32 h-24 group">
                          <img
                            src={uploadedFiles[0].preview}
                            alt="New"
                            className="w-full h-24 object-cover rounded-lg border dark:border-gray-600"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile(0)}
                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
                    <button
                      onClick={() => handleUpdate(vehicle._id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2"
                    >
                      <Check size={18} />
                      Save Changes
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex-1 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 py-2 rounded-lg font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/4 h-48 md:h-auto bg-gray-100 dark:bg-gray-700 relative">
                    {vehicle.image ? (
                      <img
                        src={
                          vehicle.image.startsWith("http")
                            ? vehicle.image
                            : `http://localhost:5000${vehicle.image}`
                        }
                        alt={vehicle.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ImageIcon size={40} />
                      </div>
                    )}
                    {/* Status Badge on Image */}
                    <div
                      className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold capitalize ${
                        vehicle.status === "available"
                          ? "bg-green-500 text-white"
                          : vehicle.status === "unavailable"
                          ? "bg-red-500 text-white"
                          : "bg-yellow-500 text-white"
                      }`}
                    >
                      {vehicle.status}
                    </div>
                  </div>

                  <div className="p-6 md:w-3/4 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{vehicle.title}</h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            {vehicle.type} • {vehicle.location}
                          </p>
                        </div>
                        <span className="text-2xl font-bold text-blue-600">Rs {vehicle.pricePerDay}/day</span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Images</p>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {vehicle.images?.length || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Status</p>
                          <p className="font-semibold capitalize text-gray-900 dark:text-gray-100">
                            {vehicle.status}
                          </p>
                        </div>
                      </div>

                      {/* Status Toggle Buttons */}
                      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <StatusToggle vehicle={vehicle} onStatusChange={handleStatusChange} />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
                      <button
                        onClick={() => startEdit(vehicle)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2"
                      >
                        <Edit2 size={18} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(vehicle._id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2"
                      >
                        <Trash2 size={18} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ManageVehicles;
