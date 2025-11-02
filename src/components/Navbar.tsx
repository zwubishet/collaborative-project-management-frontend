import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import ProfileModal from "./EditProfileModel";
import ChangePasswordModal from "./ChangePasswordModel";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-slate-900">CollabHub</h1>
          </div>

          <div className="relative">
            {/* User info button */}
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            >
              <User className="w-5 h-5" />
              <span className="font-medium">{user?.name}</span>
            </button>

            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-slate-100"
                  onClick={() => {
                    setIsProfileOpen(true);
                    setIsDropdownOpen(false);
                  }}
                >
                  Update Profile
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-slate-100"
                  onClick={() => {
                    setIsPasswordOpen(true);
                    setIsDropdownOpen(false);
                  }}
                >
                  Change Password
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-slate-100 flex items-center gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {user && isProfileOpen && (
        <ProfileModal user={user} onClose={() => setIsProfileOpen(false)} />
      )}
      {isPasswordOpen && <ChangePasswordModal onClose={() => setIsPasswordOpen(false)} />}
    </nav>
  );
}
