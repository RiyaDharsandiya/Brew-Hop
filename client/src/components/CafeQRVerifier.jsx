import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Html5QrcodeScanner } from "html5-qrcode";
import { toast } from "react-toastify";
import LoadingCup from "../components/LoadingCup";
import { useAuth } from "../context/UserAuthContext";

const CafeQRVerifier = ({ API_URL, token }) => {
  const [claimCode, setClaimCode] = useState("");
  const [result, setResult] = useState(null);
  const [scanError, setScanError] = useState("");
  const [loading, setLoading] = useState(false);
  const qrRef = useRef(null);
  const { refreshUser } = useAuth();
  const [amount, setAmount] = useState("");

  const scannerRef = useRef(null);

useEffect(() => {
  if (!scannerRef.current) {
    const scanner = new Html5QrcodeScanner("qr-reader", {
      fps: 10,
      qrbox: 250,
    });

    scanner.render(
      (decodedText) => {
        try {
          const url = new URL(decodedText);
          const code = url.pathname.split("/").pop();
          setClaimCode(code);
          setScanError("");
        } catch (e) {
          setScanError("Invalid QR format. Please scan a valid code.");
        }
      },
      (errorMessage) => {
        if (errorMessage.includes("No barcode or QR code detected")) {
          setScanError("No QR code detected. Hold the code steady in the frame.");
        } else if (errorMessage.includes("parse")) {
          setScanError("Unable to read QR code. Try again.");
        } else {
          setScanError("Scan error. Try repositioning the camera.");
        }
      }
    );

    scannerRef.current = scanner;
  }

  return () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
      scannerRef.current = null;
    }
  };
}, []);

const handleVerify = async () => {
  if (!claimCode || !amount) {
    toast.error("Both claim code and amount are required.");
    return;
  }
  setLoading(true);
  try {
    const res = await axios.post(`${API_URL}/api/auth/verify-claim`, {
      claimCode,
      amount: Number(amount),
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setResult({
      success: true,
      user: res.data.user,
      message: res.data.message,
    });
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

  return (
    <div className="p-6 bg-white rounded shadow-md max-w-md mx-auto mt-10 relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 rounded">
          <LoadingCup size="small" />
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4 text-center">Verify QR Claim</h2>

      {/* QR Scanner */}
      <div id="qr-reader" ref={qrRef} className="mb-4" />

      {scanError && <p className="text-sm text-red-500 mt-2">{scanError}</p>}

      {/* Manual Input */}
      <input
        type="text"
        placeholder="Enter Claim Code (from QR)"
        value={claimCode}
        onChange={(e) => setClaimCode(e.target.value)}
        className="w-full border p-2 rounded mb-3"
        disabled={loading}
      />
      <input
        type="number"
        placeholder="Enter Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
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
