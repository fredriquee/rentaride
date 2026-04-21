import { useState } from "react";
import API from "../api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Save } from "lucide-react";
import toast from "react-hot-toast";

const Settings = () => {
  const { user, switchRole } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("account");
  const [loading, setLoading] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);

  // Account Settings
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");

  // Password Settings
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleSaveAccountSettings = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await API.put(
        "/api/auth/update-profile",
        { name, phone },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Save the new token and update user context
      localStorage.setItem("token", data.token);
      // Update the user state by decoding the new token
      const userData = JSON.parse(atob(data.token.split(".")[1]));
      if (user?.currentRole) {
        userData.currentRole = user.currentRole;
      }
      // Manually update by re-setting the user - this will be caught by AuthContext
      // For now, we'll reload to ensure consistency
      window.location.reload();
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await API.put(
        "/api/auth/change-password",
        {
          currentPassword,
          newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSwitch = async (newRole) => {
    if (user?.currentRole === newRole) {
      toast.info(`Already in ${newRole} mode`);
      return;
    }

    try {
      setSwitchingRole(true);
      await switchRole(newRole);
      toast.success(`Switched to ${newRole} mode successfully!`);
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to switch to ${newRole} mode`);
    } finally {
      setSwitchingRole(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your account preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("account")}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            activeTab === "account"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
          }`}
        >
          Account Settings
        </button>
        <button
          onClick={() => setActiveTab("roles")}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            activeTab === "roles"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
          }`}
        >
          Manage Roles
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            activeTab === "security"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
          }`}
        >
          Security
        </button>
      </div>

      {/* Account Settings Tab */}
      {activeTab === "account" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 max-w-2xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Account Information
          </h2>

          <form onSubmit={handleSaveAccountSettings} className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email Field (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700/50 text-gray-900 dark:text-gray-400 cursor-not-allowed opacity-60"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Email cannot be changed
              </p>
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                placeholder="+977 98XXXXXXXX"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This number will be visible to renters who book your vehicles
              </p>
            </div>

            {/* Role Info */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Account Type
              </label>
              <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm font-medium capitalize">
                  {user?.role === "owner" ? "Vehicle Owner" : user?.role === "admin" ? "Administrator" : "Renter"}
                </span>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Save size={18} />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      )}

      {/* Manage Roles Tab */}
      {activeTab === "roles" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 max-w-2xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Manage Your Roles
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Switch between Renter and Owner modes to perform different actions
          </p>

          <div className="space-y-4">
            {/* Current Role Display */}
            <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Mode</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white capitalize mt-2">
                {user?.currentRole === "owner" ? "Owner Mode" : "Renter Mode"}
              </p>
            </div>

            {/* Role Options */}
            <div className="space-y-3">
              {/* Renter Mode */}
              <button
                onClick={() => handleRoleSwitch("renter")}
                disabled={switchingRole || user?.currentRole === "renter"}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  user?.currentRole === "renter"
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-600"
                } ${switchingRole ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div className="text-left">
                    <h3 className="font-bold text-gray-900 dark:text-white">Renter Mode</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Book and rent vehicles from other owners
                    </p>
                  </div>
                  {user?.currentRole === "renter" && (
                    <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                      Active
                    </span>
                  )}
                </div>
              </button>

              {/* Owner Mode */}
              <button
                onClick={() => handleRoleSwitch("owner")}
                disabled={switchingRole || user?.currentRole === "owner"}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  user?.currentRole === "owner"
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-600"
                } ${switchingRole ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div className="text-left">
                    <h3 className="font-bold text-gray-900 dark:text-white">Owner Mode</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      List and manage your vehicles, view booking requests
                    </p>
                  </div>
                  {user?.currentRole === "owner" && (
                    <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                      Active
                    </span>
                  )}
                </div>
              </button>
            </div>

            {/* Info Box */}
            <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg p-4 mt-6">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                You can switch between roles at any time. Access different features based on your current mode.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 max-w-2xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Change Password
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Keep your account secure by using a strong password
          </p>

          <form onSubmit={handleChangePassword} className="space-y-6">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords((prev) => ({
                      ...prev,
                      current: !prev.current,
                    }))
                  }
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords((prev) => ({
                      ...prev,
                      new: !prev.new,
                    }))
                  }
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Must be at least 6 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords((prev) => ({
                      ...prev,
                      confirm: !prev.confirm,
                    }))
                  }
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Password Strength Info */}
            <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Use a mix of uppercase, lowercase, numbers, and special characters for a strong password.
              </p>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Save size={18} />
              {loading ? "Updating..." : "Change Password"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Settings;
