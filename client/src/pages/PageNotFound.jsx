import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f5f0] p-4">
      <h1 className="text-2xl sm:text-4xl font-bold mb-4 text-[#1f1f1f]">404 - Page Not Found</h1>
      <p className="mb-6 text-center text-gray-700">
        The page you are looking for does not exist or you are not authorized to access it.
      </p>
      <button
        onClick={() => navigate("/")}
        className="bg-[#f0a500] text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
      >
        Go to Home
      </button>
    </div>
  );
};

export default NotFound;
