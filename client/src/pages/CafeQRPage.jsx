import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/UserAuthContext";
import CafeQRVerifier from '../components/CafeQRVerifier'

const CafeQRPage = () => {
  const { user } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== "cafe") {
      setTimeout(() => navigate("/"), 2000); 
    }
  }, [user, navigate]);

  if (!user || user.role !== "cafe") {
    return <div className="p-6 text-center">Access Denied</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <CafeQRVerifier API_URL={API_URL} token={user?.token} />
    </div>
  );
};

export default CafeQRPage;