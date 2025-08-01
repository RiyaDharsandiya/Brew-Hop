import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/UserAuthContext";
import authCafe from "../assets/cover.jpeg";
import { useSearchParams } from "react-router-dom";
import { auth, googleProvider } from "../firebase/firebase";
import { signInWithPopup,setPersistence, browserLocalPersistence, browserSessionPersistence,  } from "firebase/auth";
import LoadingCup from "../components/LoadingCup";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaWhatsapp } from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

const AuthForm = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [loginForm, setLoginForm] = useState({ email: "", password: "" ,rememberMe: false});
  const [signupForm, setSignupForm] = useState({ name: "", email: "", password: "" ,phone:""});
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "login";
  const isLogin = tab === "login";
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);


  const handleTabChange = (isLoginTab) => {
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
      const res = await axios.post(`${API_URL}/api/auth/login`, { ...loginForm });
      // Store token in localStorage if rememberMe is checked, else in sessionStorage
      if (loginForm.rememberMe) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      } else {
        sessionStorage.setItem('token', res.data.token);
        sessionStorage.setItem('user', JSON.stringify(res.data.user));
      }
      loginUser(res.data.user, res.data.token, loginForm.rememberMe); 
      toast.success("Login successful!"); 
    } catch (err) {
      console.log("login",err.message);
      toast.error("Login failed. Please check your credentials or Sign Up if you haven't done yet");
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
      console.log("signuo",err.message);
      toast.error(err.response?.data?.msg || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };
  

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      // Step 1: Set Firebase auth persistence based on rememberMe
      await setPersistence(
        auth,
        loginForm.rememberMe
          ? browserLocalPersistence
          : browserSessionPersistence
      );
  
      // Step 2: Firebase popup
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();
  
      // Step 3: Send token to backend
      const res = await axios.post(`${API_URL}/api/auth/firebase`, {
        token: idToken,
        name: user.displayName,
        email: user.email,
        rememberMe: loginForm.rememberMe,
      });
  
      // Step 4: Save token + user to storage (based on rememberMe)
      if (loginForm.rememberMe) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      } else {
        sessionStorage.setItem("token", res.data.token);
        sessionStorage.setItem("user", JSON.stringify(res.data.user));
      }
  
      // Step 5: Call loginUser context function
      loginUser(res.data.user, res.data.token, loginForm.rememberMe);
  
      toast.success("Google login successful!");
    } catch (err) {
      console.error("Google Login Error:", err.message);
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
              <div className="relative">
            <input
              type={showSignupPassword ? "text" : "password"}
              name="password"
              value={signupForm.password}
              onChange={handleSignupChange}
              placeholder="Password"
              required
              className="w-full px-4 py-2 rounded bg-white text-black border border-gray-600 focus:outline-none pr-10"
            />
            <span
              onClick={() => setShowSignupPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600"
              title={showSignupPassword ? "Hide password" : "Show password"}
            >
              {showSignupPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={loginForm.rememberMe || false}
                  onChange={e => setLoginForm({ ...loginForm, rememberMe: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="rememberMe" className="text-sm">Remember Me</label>
              </div>
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
             <div className="relative">
              <input
                type={showSignupPassword ? "text" : "password"}
                name="password"
                value={signupForm.password}
                onChange={handleSignupChange}
                placeholder="Password"
                required
                className="w-full px-4 py-2 rounded bg-white text-black border border-gray-600 focus:outline-none pr-10"
              />
              <span
                onClick={() => setShowSignupPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600"
                title={showSignupPassword ? "Hide password" : "Show password"}
              >
                {showSignupPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
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
      <a
      href="https://wa.me/9752055379"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center bg-[#25D366] text-white px-4 py-3 rounded-full shadow-lg hover:bg-[#1ebe57] transition-all group"
      title="Chat with me on WhatsApp"
    >
       <FaWhatsapp size={30}/>
    </a>
    </div>
  );
};

export default AuthForm;
