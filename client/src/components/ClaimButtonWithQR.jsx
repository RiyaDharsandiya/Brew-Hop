import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/UserAuthContext";
import { toast } from "react-toastify";

const ClaimButtonWithQR = ({ cafeId, user, API_URL, claimed, redeemed, disabled }) => {
  const [loading, setLoading] = useState(false);
  const { refreshUser } = useAuth();

  const handleClaim = async () => {
    if (claimed || redeemed || disabled) return;
    const confirm = window.confirm("Are you sure you want to claim this cafe?");
    if (!confirm) return;
    toast.info("Claiming... This may take a few seconds. Please do not refresh the window.")
    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/auth/claim-cafe`,
        { cafeId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      await refreshUser();
      toast.success("Cafe claimed! Show this QR to the Cafe");
    } catch (err) {
      console.log(err.message);
      alert("Failed to claim cafe.");
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled = claimed || redeemed || disabled || loading;

  return (
    <button
      onClick={handleClaim}
      disabled={isButtonDisabled}
      className={`px-5 py-3 text-sm rounded-md transition ${
        isButtonDisabled
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-green-600 hover:bg-green-700 text-white"
      }`}
    >
      {claimed
        ? redeemed
          ? "Redeemed"
          : "Claimed"
        : loading
        ? "Claiming..."
        : "Claim"}
    </button>
  );
};

export default ClaimButtonWithQR;
