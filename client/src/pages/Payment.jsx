import { useState } from "react";
import { useAuth } from "../context/UserAuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const RAZORPAY_KEY = import.meta.env.VITE_RAZOR_PAY_API_KEY;

const Payment = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const basePrice = 10;
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [referralName, setReferralName] = useState("");

  const selectedLocation = localStorage.getItem("selectedLocation"); // Or pass via props/state

  const handleApplyCoupon = () => {
    if (user.coupon === false && !couponApplied) {
      setCouponCode("FIRST100");
      setDiscount(1000);
      setCouponApplied(true);
    } else if (user.coupon === true && !couponApplied) {
      setCouponCode("SECOND100");
      setDiscount(500);
      setCouponApplied(true);
    }
  };

  const handlePayment = async () => {
    if (!selectedLocation) {
      toast.error("No location selected.");
      return;
    }
    try {
      const amountToPay = basePrice - discount;

      const response = await axios.post(`${API_URL}/api/payment/create-order`, {
        amount: amountToPay,
        currency: "INR",
      });

      const { orderId } = response.data;

      const options = {
        key: RAZORPAY_KEY,
        amount: amountToPay * 100,
        currency: "INR",
        name: "Brew Hop",
        description: "Café Passport Payment",
        order_id: orderId,
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#f0a500",
        },
        handler: async (response) => {
          await axios.post(`${API_URL}/api/payment/verify`, {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            userId: user._id,
            location: selectedLocation,
            couponCode,
            referralName,
          });
          await refreshUser();
          toast.success("Payment successful!");
          navigate("/cafes");
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error("Payment failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-10 bg-gray-100">
      <div className="w-full max-w-md rounded-3xl shadow-xl border border-[#f6e7c1] bg-gradient-to-br from-[#fffbe9] via-[#fff4d6] to-[#f6e7c1] p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-[#f0a500]/20 rounded-full p-3 mb-2 shadow">
            <span className="text-4xl">💳</span>
          </div>
          <h2 className="text-2xl font-bold text-[#a8741a] mb-1">Buy Café Passport</h2>
          <p className="text-gray-600 text-center">Get access to 10 beverages at partner cafés in <span className="font-semibold text-[#a8741a]">{selectedLocation || "..."}</span></p>
        </div>

        <div className="border border-[#f6e7c1] rounded-xl p-5 bg-white/80 mb-6 space-y-3 shadow">
          <div className="flex justify-between text-lg">
            <span className="font-medium">Café Passport</span>
            <span className="font-semibold">₹{basePrice}/-</span>
          </div>
          {couponCode && (
            <div className="flex justify-between text-green-600 font-medium">
              <span>Coupon ({couponCode})</span>
              <span>- ₹{discount}/-</span>
            </div>
          )}
          <hr className="my-2" />
          <div className="flex justify-between font-bold text-lg">
            <span>Sum Payable</span>
            <span>₹{basePrice - discount}/-</span>
          </div>
        </div>

        {/* Coupon section */}
        {user.coupon !== null && (
          <div className="flex justify-between items-center border border-[#f6e7c1] bg-[#fff7e1] p-3 rounded-lg mb-4">
            <span className="text-base font-semibold text-[#a8741a]">
              {user.coupon === false ? "FIRST100" : "SECOND100"}
            </span>
            <button
              onClick={handleApplyCoupon}
              disabled={couponApplied}
              className={`px-4 py-1 rounded-full font-semibold transition ${
                couponApplied
                  ? "bg-gray-300 cursor-not-allowed text-gray-500"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
            >
              {couponApplied ? "Coupon Applied" : "Apply Coupon"}
            </button>
          </div>
        )}

        {/* Referral Name input */}
        <input
          type="text"
          placeholder="Referral name (optional)"
          value={referralName}
          onChange={(e) => setReferralName(e.target.value)}
          className="w-full px-4 py-2 border border-[#f6e7c1] rounded-lg mb-4 bg-white/70 focus:ring-2 focus:ring-[#f0a500]"
        />

        <button
          onClick={handlePayment}
          className="w-full bg-[#f0a500] hover:bg-yellow-600 text-white font-semibold py-3 px-4 rounded-full shadow transition text-lg"
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  );
};

export default Payment;

