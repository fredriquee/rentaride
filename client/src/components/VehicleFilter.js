import { useState } from "react";
import { Search, X } from "lucide-react";

function VehicleFilter({ onFiltersChange, onClear }) {
  const [filters, setFilters] = useState({
    location: "",
    type: "",
    fuelType: "",
    minPrice: "",
    maxPrice: "",
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const handleClear = () => {
    const emptyFilters = {
      location: "",
      type: "",
      fuelType: "",
      minPrice: "",
      maxPrice: "",
    };
    setFilters(emptyFilters);
    onClear();
  };

  const hasActiveFilters =
    filters.location || filters.type || filters.fuelType || filters.minPrice || filters.maxPrice;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Search size={20} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Find Your Vehicle</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
          >
            <X size={16} />
            Clear Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Location Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Location
          </label>
          <input
            type="text"
            name="location"
            placeholder="e.g. Kathmandu"
            value={filters.location}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border dark:border-gray-600 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition"
          />
        </div>

        {/* Vehicle Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Vehicle Type
          </label>
          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border dark:border-gray-600 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 appearance-none transition"
          >
            <option value="">All Types</option>
            <option value="Scooter">Scooter</option>
            <option value="Bike">Bike</option>
            <option value="Car">Car</option>
          </select>
        </div>

        {/* Fuel Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Fuel Type
          </label>
          <select
            name="fuelType"
            value={filters.fuelType}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border dark:border-gray-600 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 appearance-none transition"
          >
            <option value="">All Fuels</option>
            <option value="electric">Electric</option>
            <option value="petrol">Petrol</option>
            <option value="diesel">Diesel</option>
          </select>
        </div>

        {/* Min Price Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Min Price (Rs)
          </label>
          <input
            type="number"
            name="minPrice"
            placeholder="Min"
            value={filters.minPrice}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border dark:border-gray-600 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition"
          />
        </div>

        {/* Max Price Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Max Price (Rs)
          </label>
          <input
            type="number"
            name="maxPrice"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border dark:border-gray-600 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Showing filtered results. Adjust filters above to see more vehicles.
          </p>
        </div>
      )}
    </div>
  );
}

export default VehicleFilter;
