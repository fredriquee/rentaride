import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Get user initials from name
  const getInitials = (name) => {
    if (!name) return "U"; // Default initial if name is undefined
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/login");
    toast.success("Logged out successfully");
  };

  const handleNavigation = (path, label) => {
    setIsOpen(false);
    if (path === "profile") {
      navigate("/profile");
    } else if (path === "settings") {
      navigate("/settings");
    } else {
      navigate(path);
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
        title="Profile"
      >
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white font-bold text-sm ring-2 ring-blue-200 dark:ring-blue-900/50 group-hover:ring-blue-300 dark:group-hover:ring-blue-800 transition-all">
          {getInitials(user.name)}
        </div>

        {/* User Name */}
        {user.name && (
          <span className="hidden sm:inline text-sm font-semibold text-gray-800 dark:text-gray-200 max-w-[120px] truncate">
            {user.name}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50 animate-in fade-in zoom-in-95 origin-top-right duration-200">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name || "User"}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{user.email || "user@example.com"}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 capitalize">
              <span className="inline-block px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-[10px] font-medium">
                {user.role || "renter"}
              </span>
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => handleNavigation("profile", "Profile")}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
            >
              <User size={18} className="text-blue-600 dark:text-blue-400" />
              <span>My Profile</span>
            </button>

            <button
              onClick={() => handleNavigation("settings", "Settings")}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
            >
              <Settings size={18} className="text-purple-600 dark:text-purple-400" />
              <span>Settings</span>
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 py-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
