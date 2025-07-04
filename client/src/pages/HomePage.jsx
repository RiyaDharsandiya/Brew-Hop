import React from "react";
import cafeBanner from "../assets/cafe-banner.jpeg";
import { useAuth } from "../context/UserAuthContext";
import { useNavigate } from "react-router-dom";
import AutoScrollCafes from "../components/AutoScrollPartners";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGetPass = () => {
    if (isAuthenticated) {
      navigate("/cafes");
    } else {
      navigate("/login");
    }
  };
  return (
    <div className="bg-[#fff8f2] text-[#3e2c1c]">
      {/* Banner Section */}
      <div className="relative">
        <img
          src={cafeBanner}
          alt="Cafe"
          className="w-full h-[90vh] object-cover"
        />
        <div className="absolute inset-0 bg-[#00000080] flex flex-col justify-center items-start px-10 md:px-24 text-white">
          <h1 className="text-4xl md:text-5xl font-bold max-w-[600px] leading-tight mb-4">
          Your Passport to Best Cafes — Discover, Eat, Sip, Repeat
          </h1>
          <p className="text-lg max-w-[480px] mb-6">
            Get a Café Discovery Pass and enjoy a free item at every café in your area for a whole month. Perfect for café lovers and explorers alike.
          </p>
          <button
            onClick={handleGetPass}
            className="bg-[#f0a500] hover:bg-yellow-600 text-white font-semibold px-6 py-3 rounded-md"
          >
            Claim Your Free Brews
          </button>
        </div>
      </div>

      {/* How It Works Section */}
      <section className="py-16 px-6 md:px-24 text-center bg-[#fff0e0]">
        <h2 className="text-2xl font-bold mb-10">HOW IT WORKS</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-[#5a4633]">
          <div>
            <div className="text-3xl mb-4">📍</div>
            <h3 className="font-semibold text-lg mb-1">Choose your area</h3>
            <p className="text-sm">(e.g. Bandra, Juhu, Andheri)</p>
          </div>
          <div>
            <div className="text-3xl mb-4">🎫</div>
            <h3 className="font-semibold text-lg mb-1">Get a café discovery pass</h3>
            <p className="text-sm">with 10 free items</p>
          </div>
          <div>
            <div className="text-3xl mb-4">🧍‍♂️➡️☕</div>
            <h3 className="font-semibold text-lg mb-1">Hop from café to café</h3>
            <p className="text-sm">and enjoy!</p>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-12 px-6 md:px-24 text-center">
        <h2 className="text-2xl font-bold mb-10">WHY CHOOSE OUR PASS?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8  text-[#5a4633]">
          <div>
            <p className="font-semibold text-lg mb-1">☕ Sip, Save, and Support</p>
            <p className="text-sm">More Cafés, More Memories</p>
          </div>
          <div>
            <p className="font-semibold text-lg mb-1">🌍 Be a Regular Everywhere</p>
            <p className="text-sm">Taste the City, Not Just the Chain</p>
          </div>
          <div>
            <p className="font-semibold text-lg mb-1">💰 Try 10 Cafés for the Price of One</p>
            <p className="text-sm">More Choices, More memories, More Fun</p>
          </div> 
    
        </div>
      </section>

      <section className="py-8 px-6 bg-[#fff0e0]">
        <h2 className="text-xl font-bold mb-6 text-center">Our Café Partners</h2>
        <AutoScrollCafes />
      </section>

      {/* FAQ Section */}
      <section className="py-12 px-6 md:px-24 text-center">
        <h2 className="text-2xl font-bold mb-6 text-center">FAQs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-[#5a4633] text-sm">
          <p>What is the café pass?</p>
          <p>How long is it valid?</p>
          <p>How if I visit a café more than once?</p>
          <p>Will new cafés be added?</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
