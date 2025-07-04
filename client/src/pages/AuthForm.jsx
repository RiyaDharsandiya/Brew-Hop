import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/UserAuthContext";
import authCafe from "../assets/cover.jpeg";
import { useSearchParams } from "react-router-dom";
import { auth, googleProvider } from "../firebase/firebase";
import { signInWithPopup } from "firebase/auth";
import LoadingCup from "../components/LoadingCup";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

const AuthForm = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({ name: "", email: "", password: "" ,phone:""});
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "login";
  const [isLogin, setIsLogin] = useState(tab === "login");

  const handleTabChange = (isLoginTab) => {
    setIsLogin(isLoginTab);
    setSearchParams({ tab: isLoginTab ? "login" : "signup" });
  };

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleSignupChange = (e) => {
    setSignupForm({ ...signupForm, [e.target.name]: e.target.value });
  };
  
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      toast.success("Login successful!"); 
      const res = await axios.post(`${API_URL}/api/auth/login`, loginForm);
      loginUser(res.data.user, res.data.token);
    } catch (err) {
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { name, email, password, phone } = signupForm;
      if (!name.trim() || !email.trim() || !password.trim() || !phone.trim()) {
        toast.error("All fields (Name, Email, Phone, Password) are required.");
        setLoading(false);
        return;
      }
      if (!/^\d{10}$/.test(phone)) {
        toast.error("Phone number must be exactly 10 digits.");
        setLoading(false);
        return;
      }
      const res = await axios.post(`${API_URL}/api/auth/signup`, signupForm);
      toast.success("Signup successful! Check your email for verification.");
      navigate('/verify-email', { 
        state: { 
          email: signupForm.email,
          name: signupForm.name
        } 
      });
    } catch (err) {
      toast.error(err.response?.data?.msg || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };
  

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();
      const res = await axios.post(`${API_URL}/api/auth/firebase`, {
        token: idToken,
        name: user.displayName,
        email: user.email
      });
      loginUser(res.data.user, res.data.token);
      toast.success("Google login successful!");
    } catch (err) {
      toast.error("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#f8f5f0] px-4">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-[#f8f5f0]/80 backdrop-blur-sm">
          <LoadingCup />
        </div>
      )}
      <div className="flex flex-col md:flex-row w-full max-w-5xl shadow-lg rounded-xl overflow-hidden bg-white mt-10 mb-10">
        {/* Left image section */}
        <div className="md:w-1/2 w-full h-64 md:h-auto">
          <img
            src={authCafe}
            alt="Coffee"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Right form section */}
        <div className="md:w-1/2 w-full p-8 bg-[#1f1f1f] text-white">
          {/* Logo & Tabs */}
          <div className="mb-6 text-center">
            <div className="text-2xl font-bold flex justify-center items-center gap-2">
              <span>☕</span> <span>Cafe <span className="text-[#f0a500]"></span></span>
            </div>
            <p className="text-sm mt-2">
              {isLogin ? "Welcome Back, Please login to your account" : "Create a new account to get started"}
            </p>
          </div>
          {/* Tab switcher */}
          <div className="flex mb-4">
            <button
              onClick={() => handleTabChange(true)}
              className={`flex-1 py-2 font-semibold rounded-l-lg ${
                isLogin ? "bg-[#f0a500] text-white" : "bg-gray-600 text-gray-400"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => handleTabChange(false)}
              className={`flex-1 py-2 font-semibold rounded-r-lg ${
                !isLogin ? "bg-[#f0a500] text-white" : "bg-gray-800 text-gray-400"
              }`}
            >
              Signup
            </button>
          </div>
          {/* Google Auth */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full sm:w-72 lg:ml-20 rounded-4xl flex items-center justify-center bg-white text-black px-4 py-2 mb-4 shadow hover:bg-gray-100 transition"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-5 h-5 mr-2"
            />
            Sign in with Google
          </button>

          {/* Form */}
          {isLogin ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <input
                type="email"
                name="email"
                value={loginForm.email}
                onChange={handleLoginChange}
                placeholder="Email address"
                className="w-full px-4 py-2 rounded bg-white text-black border border-gray-600 focus:outline-none"
              />
              <input
                type="password"
                name="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                placeholder="Password"
                className="w-full px-4 py-2 rounded bg-white text-black border border-gray-600 focus:outline-none"
              />
              <button
                type="submit"
                className="w-full bg-[#f0a500] text-white py-2 rounded hover:bg-yellow-600 transition"
              >
                Sign In
              </button>
              <p className="text-sm mt-2 text-center">
                Don’t have an account?{" "}
                <span
                  onClick={() => handleTabChange(false)}
                  className="text-[#f0a500] cursor-pointer"
                >
                  Sign up
                </span>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                value={signupForm.name}
                onChange={handleSignupChange}
                placeholder="Name"
                required
                className="w-full px-4 py-2 rounded bg-white text-black border border-gray-600 focus:outline-none"
              />
              <input
                type="email"
                name="email"
                value={signupForm.email}
                onChange={handleSignupChange}
                placeholder="Email"
                required
                className="w-full px-4 py-2  border-gray-6 rounded bg-white text-black border border-gray-600 focus:outline-none"
              />
              <input
                  type="password"
                  name="password"
                  value={signupForm.password}
                  onChange={handleSignupChange}
                  placeholder="Password"
                  required
                  className="w-full px-4 py-2 rounded bg-white text-black border border-gray-600 focus:outline-none"
                />
                <input
                type="tel"
                name="phone"
                value={signupForm.phone}
                onChange={handleSignupChange}
                placeholder="Phone Number"
                required
                className="w-full px-4 py-2 rounded bg-white text-black border border-gray-600 focus:outline-none"
              />
              <button
                type="submit"
                className="w-full bg-[#f0a500] text-white py-2 rounded hover:bg-yellow-600 transition"
              >
                Create Account
              </button>
              <p className="text-sm mt-2 text-center">
                Already have an account?{" "}
                <span
                  onClick={() => handleTabChange(true)}
                  className="text-[#f0a500] cursor-pointer"
                >
                  Login
                </span>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
