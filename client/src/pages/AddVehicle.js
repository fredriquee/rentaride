import { useState } from "react";
import axios from "axios";
import API from "../api";
import { toast } from "react-hot-toast";
import { Car, Tag, IndianRupee, MapPin, Image as ImageIcon, PlusCircle, Upload, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

function AddVehicle() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [fuelType, setFuelType] = useState("petrol");
  const [pricePerDay, setPricePerDay] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileUpload = (files) => {
    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length === 0) {
      toast.error("Please upload valid image files");
      return;
    }

    if (uploadedFiles.length + imageFiles.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    const newFiles = imageFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileUpload(e.dataTransfer.files);
  };

  const handleFileInputChange = (e) => {
    handleFileUpload(e.target.files);
  };

  const removeFile = (index) => {
    setUploadedFiles((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("type", type);
      formData.append("fuelType", fuelType);
      formData.append("pricePerDay", pricePerDay);
      formData.append("location", location);
      formData.append("image", image);

      // Append all uploaded files
      uploadedFiles.forEach((fileObj) => {
        formData.append("images", fileObj.file);
      });

      await API.post("/api/vehicles", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Vehicle listed successfully!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add vehicle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border dark:border-gray-700">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
            <PlusCircle size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">List Your Vehicle</h2>
            <p className="text-gray-500 dark:text-gray-400">Fill in the details to start earning</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Vehicle Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Car size={18} />
              </div>
              <input
                type="text"
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="e.g. Honda Activa 6G"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Vehicle Type</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Tag size={18} />
              </div>
              <select
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition appearance-none"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="">Select Type</option>
                <option value="Scooter">Scooter</option>
                <option value="Bike">Bike</option>
                <option value="Car">Car</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Fuel Type</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Tag size={18} />
              </div>
              <select
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition appearance-none"
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
              >
                <option value="electric">Electric</option>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
              </select>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <IndianRupee size={18} />
              </div>
              <input
                type="number"
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="500"
                value={pricePerDay}
                onChange={(e) => setPricePerDay(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Location (Optional)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <MapPin size={18} />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="e.g. Kathmandu, Nepal"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Vehicle Images</label>

            {/* Drag & Drop Area */}
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
                dragActive
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
              }`}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <Upload size={32} className="text-gray-400" />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Drag images here or click to select
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Supports JPEG, PNG, GIF, WebP (max 5MB each, up to 5 images)
                  </p>
                </div>
              </label>
            </div>

            {/* Image Preview Grid */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Selected Images ({uploadedFiles.length}/5)
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {uploadedFiles.map((fileObj, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={fileObj.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border dark:border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                        title="Remove image"
                      >
                        <X size={16} />
                      </button>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                        {fileObj.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Fallback Image URL (Optional) */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Or Use Image URL (optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <ImageIcon size={18} />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border dark:border-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="https://example.com/image.jpg"
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              If provided, this URL will be used as the primary image. Uploaded images will be used if available.
            </p>
          </div>

          <div className="md:col-span-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <PlusCircle size={20} />
                  List Vehicle
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddVehicle;