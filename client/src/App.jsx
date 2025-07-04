import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/HomePage.jsx";
import { UserAuthProvider } from "./context/UserAuthContext.jsx";
import CafeList from "./pages/CafeList.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import AuthForm from "./pages/AuthForm.jsx"; 
import VerifyEmail from "./pages/VerifyEmail.jsx";
import PageNotFound from './pages/PageNotFound.jsx'
import CafeQRPage from "./pages/CafeQRPage.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProfilePage from "./pages/ProfilePage.jsx";
import Payment from "./pages/Payment.jsx";

function App() {
  return (
    <>
     <ToastContainer position="top-center" autoClose={3000} />
      <UserAuthProvider>
        <Navbar />
        <Routes>
          <Route path="*" element={<PageNotFound />} /> 
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthForm />} />
          <Route path="/login" element={<AuthForm initialTab="login" />} />
          <Route path="/signup" element={<AuthForm initialTab="signup" />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route
            path="/cafes"
            element={
              <ProtectedRoute>
                <CafeList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
          path="/verify-qr"
          element={
            <ProtectedRoute>
              <CafeQRPage />
            </ProtectedRoute>
          }
        />
          <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />
        </Routes>
        <Footer />
      </UserAuthProvider>
    </>
  );
}

export default App;
