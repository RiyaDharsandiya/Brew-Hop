import { useEffect, useState } from "react";
import LoadingCup from "../components/LoadingCup";
import cafeBg from "../assets/bg.jpg";
import { useAuth } from "../context/UserAuthContext";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import ClaimButtonWithQR from "../components/ClaimButtonWithQR";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import socket from "../components/socket";

const API_URL = import.meta.env.VITE_API_URL;

const CafeList = () => {
  const [loading, setLoading] = useState(true);
  const { user, refreshUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", location: "", assignedTo: "" });
  const [cafes, setCafes] = useState([]);
  const [filteredCafes, setFilteredCafes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [editingCafe, setEditingCafe] = useState(null);
  const [cafeOwners, setCafeOwners] = useState([]);

  const navigate = useNavigate();

  const getClaimForCafe = (cafeId) => {
    for (const loc of user.paidLocations || []) {
      const claim = loc.claimedCafes?.find(
        (c) => c.cafe?.toString?.() === cafeId.toString()
      );
      if (claim) return claim;
    }
    return null;
  };  

  const isClaimed = (cafeId) => !!getClaimForCafe(cafeId);
  const isRedeemed = (cafeId) => getClaimForCafe(cafeId)?.redeemed;

  const getLocationPlan = (location) => {
    return user.paidLocations?.find((p) => p.location === location);
  };
  
  const plan = getLocationPlan(selectedLocation);

  const userHasActivePlanForLocation = (location) => {
    const plan = getLocationPlan(location);
    if (!plan || !plan.planPurchased) return false;
    return new Date(plan.planExpiryDate) > new Date();
  };
  const isClaimDisabled = (cafeId, cafeLocation) => {
  const plan = getLocationPlan(cafeLocation);
  return (
    !userHasActivePlanForLocation(cafeLocation) ||
    plan?.beveragesRemaining === 0 ||
    (isClaimed(cafeId) && isRedeemed(cafeId))
  );
};
  
const planIsExpired = (plan) => {
  if (!plan) return false; // No plan, so not expired (handled by not purchased)
  if (!plan.planExpiryDate) return false; // No expiry date, treat as not expired
  return new Date(plan.planExpiryDate) <= new Date();
};

const planIsNotPurchased = (plan) => {
  if (!plan) return true; // No plan at all for this location
  return !plan.planPurchased;
};

  
  const planIsActive = (plan) => {
    return plan && plan.planPurchased && new Date(plan.planExpiryDate) > new Date();
  };
  
  const allBeveragesClaimed = (plan) => {
    if (!plan) return false;
    return (
      (plan.beveragesRemaining === 0 || (plan.claimedCafes?.length ?? 0) >= 10) &&
      planIsActive(plan)
    );
  };  

  useEffect(() => {
    const fetchCafeOwners = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/auth?role=cafe`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setCafeOwners(res.data.users);
      } catch (err) {
        toast.error("Failed to fetch café owners");
      }
    };
    if (user?.role === "admin") fetchCafeOwners();
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const fetchCafes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/cafes`);
      setCafes(res.data);
      const uniqueLocations = [...new Set(res.data.map((c) => c.location))];
      setLocations(uniqueLocations);
    } catch (err) {
      toast.error("Error fetching cafes");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };

      if (editingCafe) {
        const res = await axios.put(
          `${API_URL}/api/cafes/${editingCafe._id}`,
          form,
          config
        );
        const updatedCafe = res.data.cafe;
        setCafes((prev) =>
          prev.map((c) => (c._id === updatedCafe._id ? updatedCafe : c))
        );
        setEditingCafe(null);
        toast.success("Cafe updated successfully!");
      } else {
        const res = await axios.post(`${API_URL}/api/cafes/add`, form, config);
        setCafes((prev) => [res.data.cafe, ...prev]);
        toast.success("Cafe added successfully!");
      }

      setShowModal(false);
      setForm({ name: "", address: "", location: "", assignedTo: "" });
    } catch (err) {
      toast.error("Failed to save cafe");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cafeId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this cafe?");
    if (!confirmDelete) return;
    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };

      await axios.delete(`${API_URL}/api/cafes/${cafeId}`, config);

      setCafes((prev) => {
        const updated = prev.filter((c) => c._id !== cafeId);
        const stillHasSelected = updated.some((c) => c.location === selectedLocation);
        if (!stillHasSelected) {
          setSelectedLocation("");
        }
        return updated;
      });
      toast.success("Cafe deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete cafe");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCafes();
    refreshUser();
  }, []);

  useEffect(() => {
    const uniqueLocations = [...new Set(cafes.map((c) => c.location))];
    setLocations(uniqueLocations);
    if (selectedLocation) {
      const filtered = cafes.filter((c) => c.location === selectedLocation);
      setFilteredCafes(filtered);
    } else {
      setFilteredCafes([]);
    }
  }, [selectedLocation, cafes]);

  useEffect(() => {
    if (!user?._id || !socket) return;
  
    const handleUpdate = () => fetchCafes();
    const handleClaim = ({ userId }) => {
      if (userId === user._id) {
        refreshUser();
        toast.info("A claim was redeemed successfully!");
      }
    };
  
    if (!socket.hasListeners) {
      socket.on("cafe-updated", handleUpdate);
      socket.on("claim-redeemed", handleClaim);
      socket.hasListeners = true;
    }
  
    return () => {
      socket.off("cafe-updated", handleUpdate);
      socket.off("claim-redeemed", handleClaim);
      socket.hasListeners = false;
    };
  }, [user._id]);  
  

  if (loading) return <LoadingCup />;

  return (
    <div className="relative min-h-screen flex flex-col bg-fixed">
     <div className="fixed inset-0 -z-10">
    <img src={cafeBg} alt="Café background" className="w-full h-full object-cover" />
    <div className="absolute inset-0 bg-black/30" />
    </div>

    <div className="z-10 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-white text-center sm:text-left">
            Explore Partner Gourmets ☕
          </h1>
          {user.role === "admin" ? (
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#f0a500] text-white font-bold px-6 py-3 rounded-xl hover:bg-yellow-600 transition text-lg sm:text-xl w-full md:w-auto"
        >
          + Add Cafe
        </button>
      ) : user.role === "user" && selectedLocation ? (
        <button
          onClick={() => {
          localStorage.setItem("selectedLocation", selectedLocation);
          navigate("/payment");
          }}
          disabled={userHasActivePlanForLocation(selectedLocation)}
          className={`bg-green-600 w-full md:w-auto text-lg sm:text-xl text-white px-8 py-4 rounded hover:bg-green-300 transition ${
          userHasActivePlanForLocation(selectedLocation)
          ? "opacity-50 cursor-not-allowed"
          : ""
          }`}
          >
          Proceed
          </button>
      ) : user.role === "cafe" ? (
        <button
          onClick={() => navigate("/verify-qr")}
          className="bg-[#f0a500] text-white font-bold px-6 py-3 rounded-xl hover:bg-yellow-600 transition text-lg sm:text-xl w-full md:w-auto"
        >
          Verify QR
        </button>
      ) : null}
        </div>

        <div className="mb-8 w-full max-w-xs mx-auto px-4 sm:px-0">
        <label
          htmlFor="location"
          className="block text-white font-semibold mb-2 text-base sm:text-lg"
        >
          Filter by Location
        </label>
        <select
          id="location"
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#f0a500] text-gray-700 text-base sm:text-lg"
        >
          <option value="">All Locations</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      {/* Plan expired or not purchased */}
      {selectedLocation && user.role === "user" && planIsNotPurchased(plan) && (
        <div className="mb-6 p-4 bg-green-200 text-green-700 rounded text-center font-semibold">
          You have not purchased a plan for <strong>{selectedLocation}</strong>. Please purchase to claim here.
        </div>
      )}

      {selectedLocation && user.role === "user" && !planIsNotPurchased(plan) && planIsExpired(plan) && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded text-center font-semibold">
          Your plan for <strong>{selectedLocation}</strong> has expired. Please renew to claim cafes here.
        </div>
      )}
        {/* All beverages claimed */}
        {selectedLocation && user.role === "user" && allBeveragesClaimed(plan) && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded text-center font-semibold">
            You've claimed all brews for <strong>{selectedLocation}</strong>. Please renew to get more.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredCafes.map((cafe) => (
            <div key={cafe._id} className="relative bg-white/95 rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 overflow-hidden">
              {user?.role === "user" && (
                <div className="absolute top-4 right-4 z-50 pointer-events-auto">
                  <ClaimButtonWithQR
                    cafeId={cafe._id}
                    user={user}
                    API_URL={API_URL}
                    claimed={isClaimed(cafe._id)}
                    redeemed={isRedeemed(cafe._id)}
                    disabled={isClaimDisabled(cafe._id, cafe.location)}
                  />
                </div>
              )}
              <div className="relative p-5">
                <h2 className="text-xl font-bold text-[#2f2f2f] mb-2">{cafe.name}</h2>
                <p className="text-sm text-gray-700 mb-1">
                  <i className="fas fa-map-marker-alt mr-1 text-[#f0a500]" />{cafe.address}
                </p>
                <p className="text-xs text-gray-500 italic mb-3">📍 {cafe.location}</p>

                {user?.role === "user" && isClaimed(cafe._id) && !isRedeemed(cafe._id) && (
                  <div className="flex justify-end mt-2">
                    <div className="bg-white p-2 rounded shadow">
                      <QRCodeCanvas value={`${API_URL}/qr/${getClaimForCafe(cafe._id)?.claimCode}`} size={100} />
                      <p className="text-xs mt-1 text-center">Show QR to verify</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-4">
                  {String(cafe.createdBy) === String(user?._id) && (
                    <>
                      <button onClick={() => {
                        setShowModal(true);
                        setEditingCafe(cafe);
                        setForm({
                          name: cafe.name,
                          address: cafe.address,
                          location: cafe.location,
                          assignedTo: cafe.assignedTo || "",
                        });
                      }} className="px-3 py-1 text-sm bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition">
                        <i className="fas fa-edit mr-1" /> Edit
                      </button>
                      <button onClick={() => handleDelete(cafe._id)} className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition">
                        <i className="fas fa-trash-alt mr-1" /> Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCafes.length === 0 && selectedLocation && (
          <p className="text-center text-white mt-8">No cafés found in {selectedLocation}</p>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-center">
              {editingCafe ? "Edit Cafe" : "Add New Cafe"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" name="name" placeholder="Cafe Name" value={form.name} onChange={handleChange} className="w-full border p-2 rounded" required />
              <input type="text" name="address" placeholder="Address" value={form.address} onChange={handleChange} className="w-full border p-2 rounded" required />
              <input type="text" name="location" placeholder="Location (e.g. Bandra)" value={form.location} onChange={handleChange} className="w-full border p-2 rounded" required />
              <select name="assignedTo" value={form.assignedTo} onChange={handleChange} required className="w-full border p-2 rounded">
                <option value="">Assign to Café Owner</option>
                {cafeOwners.map((owner) => (
                  <option key={owner._id} value={owner._id}>{owner.name} ({owner.email})</option>
                ))}
              </select>
              <div className="flex justify-between">
                <button type="button" onClick={() => {
                  setShowModal(false);
                  setEditingCafe(null);
                  setForm({ name: "", address: "", location: "", assignedTo: "" });
                }} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#f0a500] text-white rounded hover:bg-yellow-600">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
     <div className="relative z-10 max-w-4xl mx-auto mt-12 mb-8 p-3 bg-white bg-opacity-90 rounded-lg shadow-md text-gray-800">
    <h3 className="text-xl font-semibold mb-4">Terms and Conditions:</h3>
    <ol className="list-decimal list-inside space-y-2 text-sm sm:text-base">
      <li>Redeemable only on weekdays (Monday to Friday).</li>
      {/* <li>Redeemable only before 6pm on Weekdays.</li> */}
      <li>The purchaser of the visa should only redeem.</li>
      <li>Visa expires every 1 month from the date of purchase and time.</li>
      <li>Merchants reserve the right to final say.</li>
      <li>Cancellation refund not applicable.</li>
    </ol>
  </div>
</div>
  );
};

export default CafeList;
