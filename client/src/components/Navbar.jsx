import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/UserAuthContext";
import logo from "../assets/logo.jpeg"

const Navbar = () => {
  const { isAuthenticated, logoutUser, user } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isCafePage = location.pathname === "/cafes";

  return (
    <nav className="sticky top-0 z-50 bg-[#3e2c1c] text-white flex justify-between items-center p-4 shadow-md">
      {/* Logo */}
      <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate("/")}>
      <img src={logo} alt="logo" className="w-14 h-14 object-cover rounded-full shadow" />
        <span className="text-xl font-bold">Brew Hop</span>
      </div>

      {/* Welcome message for mobile */}
      {isAuthenticated && user?.name && (
        <div className="block md:hidden text-white font-semibold ml-2 text-right leading-tight">
          <span className="block">Welcome,</span>
          <span className="block">{user.name}</span>
        </div>
      )}

      {/* Desktop nav (visible on md and larger screens) */}
      <div className="hidden md:flex items-center space-x-4">
        {!isCafePage && (
          <Link to="/cafes" className="hover:text-[#f0a500] whitespace-nowrap">
            Explore partners
          </Link>
        )}

        {isAuthenticated && user?.name && (
          <span className="mx-2 text-white font-semibold whitespace-nowrap">
            Welcome, {user.name}
          </span>
        )}

        {isAuthenticated ? (
          <button
            onClick={logoutUser}
            className="bg-[#f0a500] text-white px-4 py-2 rounded hover:bg-yellow-600 whitespace-nowrap"
          >
            Logout
          </button>
        ) : (
          <>
            <Link to="/auth?tab=login" className="hover:text-[#f0a500] whitespace-nowrap">Login</Link>
            <Link to="/auth?tab=signup" className="hover:text-[#f0a500] whitespace-nowrap">Signup</Link>
          </>
        )}

      {isAuthenticated && user?.role === "user" && (
        <Link
          to="/profile"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 whitespace-nowrap"
        >
          Profile
        </Link>
      )}
      </div>

      {/* Mobile hamburger button (visible on smaller screens) */}
      <button
        className="md:hidden text-white"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {/* Hamburger icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Mobile menu (shown when isMenuOpen is true) */}
      {isMenuOpen && (
  <div className="absolute top-20 right-0 w-full bg-[#3e2c1c] shadow-lg md:hidden flex flex-col items-end p-4 space-y-3">
    {!isCafePage && (
      <Link
        to="/cafes"
        className="hover:text-[#f0a500] whitespace-nowrap"
        onClick={() => setIsMenuOpen(false)}
      >
        Explore Cafes
      </Link>
    )}

    {/* Profile button for mobile, only for authenticated users with role "user" */}
    {isAuthenticated && user?.role === "user" && (
      <Link
        to="/profile"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 whitespace-nowrap"
        onClick={() => setIsMenuOpen(false)}
      >
        Profile
      </Link>
    )}

    {isAuthenticated ? (
      <button
        onClick={() => { logoutUser(); setIsMenuOpen(false); }}
        className="bg-[#f0a500] text-white px-4 py-2 rounded hover:bg-yellow-600 whitespace-nowrap"
      >
        Logout
      </button>
    ) : (
      <>
        <Link
          to="/auth?tab=login"
          className="hover:text-[#f0a500] whitespace-nowrap"
          onClick={() => setIsMenuOpen(false)}
        >
          Login
        </Link>
        <Link
          to="/auth?tab=signup"
          className="hover:text-[#f0a500] whitespace-nowrap"
          onClick={() => setIsMenuOpen(false)}
        >
          Signup
        </Link>
      </>
    )}
  </div>
)}

    </nav>
  );
};

export default Navbar;
