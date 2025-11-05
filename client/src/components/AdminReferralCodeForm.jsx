// AdminReferralCodeForm.js
import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const AdminReferralCodeForm = ({ onClose }) => {
  const [code, setCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [maxUsage, setMaxUsage] = useState(1);
  const [message, setMessage] = useState("");

  const handleAddReferralCode = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/referal/admin/referral-codes`, {
        code,
        discountAmount,
        maxUsage,
      });
      setMessage(response.data.message);
      setCode("");
      setDiscountAmount(0);
      setMaxUsage(1);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error adding code");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 mx-4">
        <h3 className="text-xl font-semibold mb-4">Add Referral Code</h3>
        Code:
        <input
          type="text"
          placeholder="Referral Code"
          className="w-full p-2 border rounded mb-3"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        Discount Amount
        <input
          type="number"
          placeholder="Discount Amount"
          className="w-full p-2 border rounded mb-3"
          value={discountAmount}
          onChange={(e) => setDiscountAmount(Number(e.target.value))}
          min={0}
        />
        Max Usage
        <input
          type="number"
          placeholder="Max Usage"
          className="w-full p-2 border rounded mb-4"
          value={maxUsage}
          onChange={(e) => setMaxUsage(Number(e.target.value))}
          min={1}
        />

        {message && <p className="mb-3 text-center text-gray-600">{message}</p>}

        <div className="flex justify-between">
          <button
            onClick={handleAddReferralCode}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Add
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminReferralCodeForm;
