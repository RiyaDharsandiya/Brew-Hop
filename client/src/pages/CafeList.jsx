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
import AdminReferralCodeForm from "../components/AdminReferralCodeForm";


const API_URL = import.meta.env.VITE_API_URL;


const CafeList = () => {
  const [loading, setLoading] = useState(true);
  const { user, refreshUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", location: "", assignedTo: "", timeFrom: "", timeTo: "", menuLink: "", comments: "" ,bgImage: "",});
  const [cafes, setCafes] = useState([]);
  const [filteredCafes, setFilteredCafes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [editingCafe, setEditingCafe] = useState(null);
  const [cafeOwners, setCafeOwners] = useState([]);

  const [modalOpen, setmodalOpen] = useState(false);

  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [menuModalUrl, setMenuModalUrl] = useState("");
  const [menuFile, setMenuFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [bgImageFile, setBgImageFile] = useState(null);

  const handleMenuFileChange = (e) => {
    setMenuFile(e.target.files[0]);
  };
  const handleBgImageFileChange = (e) => {
    setBgImageFile(e.target.files[0]);
  };
  
  const uploadMenuFile = async () => {
    if (!menuFile) return null;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', menuFile);
    formData.append('upload_preset', 'unsigned_preset'); // replace with your upload preset name
  
    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/dzttasmo8/upload`, // replace with your cloud name
        formData
      );
      setUploading(false);
      return response.data.secure_url; // this is your uploaded menu URL
    } catch (error) {
      setUploading(false);
      toast.error('Failed to upload menu file');
      return null;
    }
  };

  const uploadBgImage = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "unsigned_preset"); // your Cloudinary preset
  
    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dzttasmo8/upload",
        formData
      );
      setUploading(false);
      return response.data.secure_url;  // return URL so caller can set it
    } catch (error) {
      setUploading(false);
      toast.error("Failed to upload background image");
      return "";
    }
  };  
  
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
      // Upload menu file if selected, otherwise use existing menuLink
      let menuUrl = form.menuLink; 
      if (menuFile) {
        menuUrl = await uploadMenuFile();
      }
      let bgImageUrl = form.bgImage || "";
      if (bgImageFile) {
        bgImageUrl = await uploadBgImage(bgImageFile); 
      }
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };
  
      // Destructure all fields including comments from form state
      const { name, address, location, assignedTo, timeFrom, timeTo, comments } = form;
  
      // Prepare data to send including menuUrl and comments
      const dataToSend = {
        name,
        address,
        location,
        assignedTo,
        timeFrom,
        timeTo,
        menuLink: menuUrl,
        comments,
        bgImage :bgImageUrl,
      };
      if (editingCafe) {
        // Update existing cafe with PUT request
        const res = await axios.put(
          `${API_URL}/api/cafes/${editingCafe._id}`,
          dataToSend,
          config
        );
        const updatedCafe = res.data.cafe;
        setCafes((prev) =>
          prev.map((c) => (c._id === updatedCafe._id ? updatedCafe : c))
        );
        setEditingCafe(null);
        toast.success("Cafe updated successfully!");
      } else {
        // Add new cafe with POST request
        const res = await axios.post(`${API_URL}/api/cafes/add`, dataToSend, config);
        setCafes((prev) => [res.data.cafe, ...prev]);
        toast.success("Cafe added successfully!");
      }
  
      // Reset form and close modal
      setShowModal(false);
      setMenuFile(null);
      setForm({
        name: "",
        address: "",
        location: "",
        assignedTo: "",
        timeFrom: "",
        timeTo: "",
        menuLink: "",
        comments: "",
        bgImage: "", 
      });
    } catch (err) {
      console.error("Failed to save cafe:", err.response?.data || err.message || err);
      toast.error("Failed to save cafe: " + (err.response?.data?.msg || err.message || 'Unknown error'));    
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
            Explore Partner Outlets ☕
          </h1>
          
          {user.role === "admin" ? (
          <div className="flex flex-col gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#f0a500] text-white font-bold px-6 py-3 rounded-xl hover:bg-yellow-600 transition text-lg sm:text-xl w-full md:w-auto"
            >
              + Add Cafe
            </button>

            <button
              onClick={() => setmodalOpen(true)}
              className="bg-[#f0a500] text-white font-bold px-6 py-3 rounded-xl hover:bg-yellow-600 transition text-lg sm:text-xl w-full md:w-auto"
            >
              + Add Referral
            </button>
          </div>
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
    <div
      key={cafe._id}
      className={
        "relative rounded-2xl shadow-lg p-0 hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 overflow-hidden " +
        (!cafe.bgImage ? "bg-white/95" : "")
      }
      style={
        cafe.bgImage
          ? {
              backgroundImage: `linear-gradient(rgba(0,0,0,0.35),rgba(0,0,0,0.30)), url(${cafe.bgImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      <div className={`relative p-5 ${cafe.bgImage ? "" : ""}`}>
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

        {/* Pick different text color for visibility */}
        <h2 className={`text-xl font-bold mb-2 ${cafe.bgImage ? "text-white drop-shadow-md" : "text-[#2f2f2f]"}`}>{cafe.name}</h2>
        <p className={`text-sm mb-1 ${cafe.bgImage ? "text-white drop-shadow" : "text-gray-700"}`}>
          <i className="fas fa-map-marker-alt mr-1 text-[#f0a500]" />
          {cafe.address}
        </p>
        <p className={`text-xs italic mb-3 ${cafe.bgImage ? "text-gray-200" : "text-gray-500"}`}>
          📍 {cafe.location}
        </p>
        {cafe.timeFrom && cafe.timeTo && (
          <div className={`flex items-center gap-1 mb-3 ${cafe.bgImage ? "text-white" : "text-gray-700"}`}>
            <i className="far fa-clock" title="Opening Hours" />
            <span>{cafe.timeFrom} - {cafe.timeTo}</span>
          </div>
        )}
        {cafe.menuLink && (
          <button
            onClick={() => {
              setMenuModalUrl(cafe.menuLink);
              setMenuModalOpen(true);
            }}
            className={cafe.bgImage
              ? "text-blue-200 hover:underline flex items-center gap-1"
              : "text-blue-600 hover:underline flex items-center gap-1"}
          >
            <i className="fas fa-utensils" /> Menu
          </button>
        )}
        {cafe.comments && cafe.comments.trim().length > 0 && (
          <p className={`mt-2 text-xs italic ${cafe.bgImage ? "text-white/85" : "text-gray-600"}`}>
            Additional: {cafe.comments}
          </p>
        )}

        {user?.role === "user" && isClaimed(cafe._id) && !isRedeemed(cafe._id) && (
          <div className="flex justify-end mt-2">
            <div className="bg-white/90 p-2 rounded shadow">
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
                  timeFrom: cafe.timeFrom || "",
                  timeTo: cafe.timeTo || "",
                  menuLink: cafe.menuLink || "",
                  comments: cafe.comments || "",
                  bgImage: cafe.bgImage || ""
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


      {menuModalOpen && (
      <div 
        className="fixed inset-0 z-50 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={() => setMenuModalOpen(false)} // close when clicking outside
      >
        <div 
          className="relative flex justify-center items-center"
          onClick={(e) => e.stopPropagation()} // prevent closing when clicking on image or button
        >
          <button
            onClick={() => setMenuModalOpen(false)}
            className="absolute top-2 right-2 text-white text-2xl font-bold bg-black bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-75 transition"
            aria-label="Close menu preview"
          >
            &times;
          </button>
          <img
          src={menuModalUrl}
          alt="Menu"
          className="max-w-screen max-h-screen object-contain"
          style={{ backgroundColor: 'transparent' }}
        />
        </div>
      </div>
    )}

{showModal && (
  <div className="fixed inset-0 z-20 mt-20 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 overflow-auto">
    <div className="bg-white rounded-lg w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl p-6 shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-center">
        {editingCafe ? "Edit Cafe" : "Add New Cafe"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto">
        <input
          type="text"
          name="name"
          placeholder="Cafe Name"
          value={form.name}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="text"
          name="location"
          placeholder="Location (e.g. Bandra)"
          value={form.location}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <select
          name="assignedTo"
          value={form.assignedTo}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        >
          <option value="">Assign to Café Owner</option>
          {cafeOwners.map((owner) => (
            <option key={owner._id} value={owner._id}>
              {owner.name} ({owner.email})
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Opening Time</label>
            <input
              type="time"
              name="timeFrom"
              value={form.timeFrom}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Closing Time</label>
            <input
              type="time"
              name="timeTo"
              value={form.timeTo}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>
        <label className="block mb-1">Menu File (pdf/image)</label>
        <input
          type="file"
          accept=".pdf,image/*"
          onChange={handleMenuFileChange}
          className="w-full border p-2 rounded"
        />
        <label className="block mb-1 mt-4">Background Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleBgImageFileChange}
          className="w-full border p-2 rounded"
        />
        {uploading && <p>Uploading bg img...</p>}
        <textarea
          name="comments"
          placeholder="Comments"
          value={form.comments || ""}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          rows={3}
        />
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => {
              setShowModal(false);
              setEditingCafe(null);
              setForm({
                name: "",
                address: "",
                location: "",
                assignedTo: "",
                timeFrom: "",
                timeTo: "",
                menuLink: "",
                comments: "",
                bgImage: "",
              });
            }}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#f0a500] text-white rounded hover:bg-yellow-600"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  </div>
)}

     <div className="relative z-10 max-w-2xl mx-auto mt-12 mb-8 p-3 bg-white bg-opacity-90 rounded-lg shadow-md text-gray-800">
    <h3 className="text-xl font-semibold mb-4">Terms and Conditions:</h3>
    <ol className="list-decimal list-inside space-y-2 text-sm sm:text-base">
    <li>A table of guests can avail only 2 freebie offer in 24 hours. The restaurant holds the right to deny any extra offers to the same table</li>
    <li>The choice of brand provided as part of this promotion is solely at the discretion of the restaurant</li>
    <li>You should be above the legal drinking age for complimentary drink(s)</li>
    <li>You will be eligible for complimentary item(s) equivalent to either the actual guests at the table or lower of the seats booked</li>
    <li>You can only avail 1 offer per table.</li>
    <li>The restaurant partner can deny you the offer in case you fail to carry a valid ID card</li>
    <li>This offer may not apply to bottled drinks, buffets, pre-discounted platters/combos/thalis, select seasonal or seafood items, tobacco products, or special menus at the restaurant's discretion</li>
    <li>Brewhop has no role to play on taxes and charges levied by the Government and restaurants</li>
    <li>Additional service charge on the bill is up to restaurant's discretion</li>
    <li>Other T&Cs may apply</li>
</ol>
  </div>
  {modalOpen && <AdminReferralCodeForm onClose={() => setmodalOpen(false)} />}
</div>
  );
};


export default CafeList;

