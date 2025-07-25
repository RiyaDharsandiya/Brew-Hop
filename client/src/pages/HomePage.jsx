import React, { useState } from "react";
import cafeBanner from "../assets/cafe-banner.jpeg";
import { useAuth } from "../context/UserAuthContext";
import { useNavigate } from "react-router-dom";
import AutoScrollCafes from "../components/AutoScrollPartners";
import { FaWhatsapp } from "react-icons/fa";

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
  const faqs = [
    {
      question: "What is the Gourmets visa?",
      answer: "BrewHop is a curated Gourmets visa that lets you explore 10 Gourmets in your area — with 1 a free dish or drink at each.The Gourmets visa is your ticket to enjoy a free item at every partner Gourmets in your selected area for a month. Just show your QR code at the Gourmets and redeem your free item!"
    },
    {
      question: "How long is it valid?",
      answer: "Your Gourmets visa is valid for 1 month from the date and time of purchase."
    },
    {
      question: "What if I visit a Gourmet more than once?",
      answer: "Each Gourmet can be claimed only once per visa. To enjoy more, you can renew your pass after it expires 30 days from the date of your purchase."
    },
    {
      question: "Will new Gourmets be added?",
      answer: "Yes! We regularly onboard new Gourmets to keep the experience fresh. Each zone may get updated lineups in future BrewHop editions."
    }
  ];
  
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (idx) => {
      setOpenFaq(openFaq === idx ? null : idx);
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
          Your Visa to — Discover, Eat, Sip, Repeat
          </h1>
          <p className="text-lg max-w-[480px] mb-6">
            Get a Gourmets Discovery Visa and enjoy a free item at every cafes in your area for a whole month. Perfect for food lovers and explorers alike.
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
            <h3 className="font-semibold text-lg mb-1">Get a food discovery visa</h3>
            <p className="text-sm">with 10 free items</p>
          </div>
          <div>
            <div className="text-3xl mb-4">🧍‍♂️➡️☕</div>
            <h3 className="font-semibold text-lg mb-1">Hop from best to best</h3>
            <p className="text-sm">and enjoy!</p>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-12 px-6 md:px-24 text-center">
        <h2 className="text-2xl font-bold mb-10">WHY CHOOSE OUR Visa?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8  text-[#5a4633]">
          <div>
            <p className="font-semibold text-lg mb-1">☕ Sip, Save, and Support</p>
            <p className="text-sm">More Pictures, More Memories</p>
          </div>
          <div>
            <p className="font-semibold text-lg mb-1">🌍 Be a Regular Everywhere</p>
            <p className="text-sm">Taste the City, Not Just the Chain</p>
          </div>
          <div>
            <p className="font-semibold text-lg mb-1">💰 Try 10 Gourmets for the Price of One</p>
            <p className="text-sm">More Choices, More memories, More Fun</p>
          </div> 
    
        </div>
      </section>

      <section className="py-8 px-6 bg-[#fff0e0]">
        <h2 className="text-xl font-bold mb-6 text-center">Our Gourmets Partners</h2>
        <AutoScrollCafes />
      </section>

      {/* FAQ Section */}
      <section className="py-12 px-6 md:px-24 text-center">
      <h2 className="text-2xl font-bold mb-6 text-center">FAQs</h2>
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        {faqs.map((faq, idx) => (
          <div key={idx} className="border-b pb-3">
            <button
              className="w-full text-left font-semibold flex justify-between items-center py-2 focus:outline-none"
              onClick={() => toggleFaq(idx)}
            >
              <span>{faq.question}</span>
              <span className="ml-2">{openFaq === idx ? "▲" : "▼"}</span>
            </button>
            {openFaq === idx && (
              <div className="text-[#5a4633] text-sm mt-2 animate-fadeIn">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
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

export default Home;
