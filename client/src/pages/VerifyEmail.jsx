import { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/UserAuthContext";
import authCafe from "../assets/cover.jpeg";
import LoadingCup from "../components/LoadingCup";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  
  // Get user data from navigation state
  const { email } = location.state || {};

  const handleCodeChange = (index, value) => {
    if (/^\d$/.test(value) || value === "") {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      // Auto-focus next input
      if (value && index < 5) {
        document.getElementById(`code-${index + 1}`).focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`).focus();
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      const verificationCode = code.join("");
      const res = await axios.post(`${API_URL}/api/auth/verify-email`, {
        email,
        code: verificationCode
      });
      toast.success("Email verified successfully! Redirecting...");
      loginUser(res.data.user, res.data.token);
      navigate("/cafes");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    navigate("/auth?tab=signup");
    return null;
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#f8f5f0] px-2 sm:px-4">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-[#f8f5f0]/80 backdrop-blur-sm">
          <LoadingCup />
        </div>
      )}
      
      <div className="flex flex-col md:flex-row w-full max-w-5xl shadow-lg rounded-xl overflow-hidden bg-white mt-4 sm:mt-10 mb-4 sm:mb-10">
        {/* Left image section */}
        <div className="md:w-1/2 w-full h-40 sm:h-64 md:h-auto">
          <img
            src={authCafe}
            alt="Coffee"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right form section */}
        <div className="md:w-1/2 w-full p-4 sm:p-8 bg-[#1f1f1f] text-white">
          <div className="mb-4 sm:mb-6 text-center">
            <div className="text-xl sm:text-2xl font-bold flex justify-center items-center gap-2">
              <span>☕</span> <span>Cafe <span className="text-[#f0a500]"></span></span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold mt-2 sm:mt-4">Verify Your Email</h1>
            <p className="text-xs sm:text-sm mt-1 sm:mt-2">
              We've sent a 6-digit code to <span className="font-semibold text-[#f0a500]">{email}</span>
            </p>
          </div>

          {/* Code input */}
          <div className="flex justify-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-8 sm:w-12 h-12 text-center text-lg sm:text-xl bg-[#2d2d2d] border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-[#f0a500]"
              />
            ))}
          </div>

          <button
            onClick={handleVerify}
            disabled={loading || code.some(d => d === "")}
            className="w-full bg-[#f0a500] text-white py-2 rounded hover:bg-yellow-600 transition disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>

          <div className="mt-2 sm:mt-4 text-center">
            <button
              onClick={() => navigate("/auth?tab=signup")}
              className="text-[#f0a500] hover:underline text-xs sm:text-sm"
            >
              Change Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
