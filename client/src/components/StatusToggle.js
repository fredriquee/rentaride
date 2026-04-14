import { useState } from "react";

function StatusToggle({ vehicle, onStatusChange, isLoading = false }) {
  const handleToggle = () => {
    const newStatus = vehicle.status === "available" ? "unavailable" : "available";
    onStatusChange(vehicle._id, newStatus);
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Availability
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {vehicle.status === "available" ? "Ready for bookings" : "Not accepting bookings"}
        </p>
      </div>

      {/* Apple-style Toggle */}
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`relative inline-flex items-center h-7 w-16 rounded-full transition-colors duration-300 ${
          vehicle.status === "available" ? "bg-green-500" : "bg-gray-400"
        } disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        title={`Click to turn ${vehicle.status === "available" ? "off" : "on"}`}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
            vehicle.status === "available" ? "translate-x-9" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export default StatusToggle;

