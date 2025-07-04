import React, { useState, useEffect, useRef } from "react";
import cafe1 from '../assets/cafes/cafe1.jpg';
import cafe2 from '../assets/cafes/cafe2.jpeg';
import cafe3 from '../assets/cafes/cafe3.jpeg';
import cafe4 from '../assets/cafes/cafe4.jpeg';
import cafe5 from '../assets/cafes/cafe5.jpeg';
import cafe6 from '../assets/cafes/cafe6.jpeg';
import cafe7 from '../assets/cafes/cafe7.jpeg';
import cafe8 from '../assets/cafes/cafe8.jpeg';

const cafePartners = [
    { name: "Blue Tokai", image: cafe1 },
    { name: "Starbucks", image: cafe2 },
    { name: "Third Wave", image: cafe3 },
    { name: "Subko", image: cafe4 },
    { name: "Koinonia", image: cafe5 },
    { name: "Brewberrys", image: cafe6 },
    { name: "Café Coffee Day", image: cafe7 },
    { name: "Nook", image: cafe8 },
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
