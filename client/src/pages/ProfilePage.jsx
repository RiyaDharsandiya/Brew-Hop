import { useEffect } from "react";
import { useAuth } from "../context/UserAuthContext";
import { useNavigate } from "react-router-dom";

const StatusBadge = ({ active }) => (
  <span
    className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
      active
        ? "bg-green-100 text-green-700 border border-green-300"
        : "bg-red-100 text-red-700 border border-red-300"
    }`}
  >
    {active ? "Active" : "Inactive"}
  </span>
);

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    refreshUser();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-white to-yellow-200">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <p className="mb-4 text-lg text-gray-700">You must be logged in to view your profile.</p>
          <button
            className="bg-[#f0a500] text-white px-6 py-2 rounded-full shadow hover:bg-yellow-600 transition"
            onClick={() => navigate("/auth?tab=login")}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-10 bg-gray-100">
  <div className="w-full max-w-2xl rounded-3xl shadow-xl border border-[#f6e7c1] bg-gradient-to-br from-[#fffbe9] via-[#fff4d6] to-[#f6e7c1] p-10">
    <div className="flex flex-col items-center mb-8">
      <div className="bg-[#f0a500]/20 rounded-full p-4 mb-2 shadow">
        <span className="text-5xl">👤</span>
      </div>
      <h2 className="text-3xl font-extrabold mb-1 text-[#a8741a]">Your Profile</h2>
      <p className="text-gray-500">
        Welcome, <span className="font-semibold text-[#a8741a]">{user.name}</span>!
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="bg-[#fff7e1] rounded-xl p-5 shadow flex flex-col gap-2 border border-[#f0a500]/30">
        <span className="font-semibold text-gray-700">👤 Name:</span>
        <span className="ml-2 text-md">{user.name}</span>
      </div>
      <div className="bg-[#fff7e1] rounded-xl p-5 shadow flex flex-col gap-2 border border-[#f0a500]/30">
        <span className="font-semibold text-gray-700">✉️ Email:</span>
        <span className="ml-2 text-md">{user.email}</span>
      </div>
    </div>
    <div>
      <h3 className="text-xl font-bold text-[#a8741a] mb-4 text-center">Your Plans by Location</h3>
      {user.paidLocations?.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {user.paidLocations.map((location, idx) => {
            const isActive =
              location.planPurchased &&
              location.planExpiryDate &&
              new Date(location.planExpiryDate) > new Date();
            return (
              <div
                key={idx}
                className={`rounded-2xl p-6 border-2 shadow transition-all ${
                  isActive
                    ? "border-[#d6e7c1] bg-[#f7fbe9]"
                    : "border-[#f8dada] bg-[#fdf4f4]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📍</span>
                    <span className="font-bold text-lg text-[#a8741a]">{location.location}</span>
                  </div>
                  <StatusBadge active={isActive} />
                </div>
                <div className="flex flex-wrap gap-4 mt-2">
                  <div>
                    <span className="font-semibold text-gray-700">Brews Remaining:</span>
                    <span className="ml-1">{location.beveragesRemaining ?? 0} / 10</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Plan Start:</span>
                    <span className="ml-1">
                      {location.planStartDate
                        ? new Date(location.planStartDate).toLocaleDateString()
                        : <span className="text-gray-400">-</span>}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Plan Expiry:</span>
                    <span className="ml-1">
                      {location.planExpiryDate
                        ? new Date(location.planExpiryDate).toLocaleDateString()
                        : <span className="text-gray-400">-</span>}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-6">No plans purchased yet.</p>
      )}
    </div>
  </div>
</div>

  );
};

export default ProfilePage;
