import React, { useState, useEffect, useRef } from "react";
import cafe1 from '../assets/cafes/whats your bahana.jpeg';
import cafe2 from '../assets/cafes/Berlin brew The Beer Library.jpeg';
import cafe3 from '../assets/cafes/Berlin Brew.jpeg';
import cafe4 from '../assets/cafes/Boho.jpeg';
import cafe5 from '../assets/cafes/Bombay Cocktail Bar.jpeg';
import cafe6 from '../assets/cafes/Ebony Casual Diner.jpeg';
import cafe7 from '../assets/cafes/one o one.jpg'


const cafePartners = [
    { name: "What's your bahana?", image: cafe1 },
    { name: "Berlin brew The Beer Library", image: cafe2 },
    { name: "Berlin Brew", image: cafe3 },
    { name: "Boho", image: cafe4 },
    { name: "Bombay Cocktail Bar", image: cafe5 },
    { name: "Ebony Casual Diner", image: cafe6 },
    { name: "One 'o' one", image: cafe7 },
  ];
  

const AutoScrollCafes = () => {
  const [offset, setOffset] = useState(0);
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    let animationId;
    const speed = 0.5; // pixels per frame

    const animate = () => {
      setOffset((prev) => {
        if (prev <= -contentRef.current.offsetWidth / 2) return 0;
        return prev - speed;
      });
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="overflow-hidden" ref={containerRef}>
      <div
        ref={contentRef}
        className="flex items-center gap-8 py-4"
        style={{ transform: `translateX(${offset}px)` }}
      >
        {cafePartners.map((cafe, i) => (
          <div key={i} className="flex-shrink-0 flex flex-col items-center justify-center bg-white shadow-sm rounded-lg p-4 w-32 h-32">
            <img src={cafe.image} alt={cafe.name} className="w-16 h-16 object-contain mb-2" />
            <span className="font-medium text-[#5a4633] text-sm text-center">{cafe.name}</span>
          </div>
        ))}
        {/* Duplicate for seamless loop */}
        {cafePartners.map((cafe, i) => (
          <div key={`dup-${i}`} className="flex-shrink-0 flex flex-col items-center justify-center bg-white shadow-sm rounded-lg p-4 w-32 h-32">
            <img src={cafe.image} alt={cafe.name} className="w-16 h-16 object-contain mb-2" />
            <span className="font-medium text-[#5a4633] text-sm text-center">{cafe.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AutoScrollCafes;
