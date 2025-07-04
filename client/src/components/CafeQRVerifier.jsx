import { useState } from "react";
import axios from "axios";
import QrScanner from "react-qr-scanner";
import { toast } from "react-toastify";
import LoadingCup from "../components/LoadingCup";
import { useAuth } from "../context/UserAuthContext";

const CafeQRVerifier = ({ API_URL, token }) => {
  const [claimCode, setClaimCode] = useState("");
  const [result, setResult] = useState(null);
  const [scanError, setScanError] = useState("");
  const [loading, setLoading] = useState(false);
  const { refreshUser } = useAuth();

  const handleVerify = async () => {
    if (!claimCode) {
      toast.error("Please enter or scan a claim code.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/auth/verify/${claimCode}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setResult({
        success: true,
        user: res.data.user,
        message: res.data.message,
      });
      setScanError("");
      toast.success("Verification successful!");
      await refreshUser();
    } catch (err) {
      setResult({
        success: false,
        message: err.response?.data?.msg || "Verification failed",
      });
      toast.error(err.response?.data?.msg || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleScan = (data) => {
    if (data?.text || data) {
      try {
        const url = new URL(data?.text || data);
        const code = url.pathname.split("/").pop();
        setClaimCode(code);
        setScanError("");
      } catch (e) {
        setScanError("Invalid QR format");
      }
    }
  };

  const handleError = (err) => {
    console.error(err);
    setScanError("Camera access denied or error in scanning.");
  };

  return (
    <div className="p-6 bg-white rounded shadow-md max-w-md mx-auto mt-10 relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 rounded">
          <LoadingCup size="small" />
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4 text-center">Verify QR Claim</h2>

      {/* Webcam QR Scanner */}
      <div className="mb-4">
        <QrScanner
          delay={300}
          onError={handleError}
          onScan={handleScan}
          style={{ width: "100%" }}
        />
        {scanError && <p className="text-sm text-red-500 mt-2">{scanError}</p>}
      </div>

      {/* Manual Input */}
      <input
        type="text"
        placeholder="Enter Claim Code (from QR)"
        value={claimCode}
        onChange={(e) => setClaimCode(e.target.value)}
        className="w-full border p-2 rounded mb-3"
        disabled={loading}
      />
      <button
        onClick={handleVerify}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
        disabled={loading}
      >
        Verify
      </button>

      {result && (
        <div className={`mt-4 p-4 rounded ${result.success ? "bg-green-100" : "bg-red-100"}`}>
          <p className="font-semibold">{result.message}</p>
          {result.success && (
            <div className="mt-2 text-sm text-gray-700">
              <p><strong>User:</strong> {result.user.name}</p>
              <p><strong>Email:</strong> {result.user.email}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CafeQRVerifier;
