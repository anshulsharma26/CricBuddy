import React, { useState, useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import loader from "../assets/loader.json"

const Loader = ({ text = "Setting the pitch..." }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Add a 300ms delay to avoid flickering for very fast requests
    const timer = setTimeout(() => {
      setShow(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-60 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
      <div className="w-32 h-32 md:w-40 md:h-40">
        <DotLottieReact
          animationData={loader} 
          loop
          autoplay
        />
      </div>
      <p className="mt-2 text-cricket font-bold text-sm animate-pulse tracking-wide italic">
        {text}
      </p>
  ...
      {/* Fallback if Lottie fails (hidden if Lottie works) */}
      <noscript>
        <div className="w-12 h-12 border-4 border-cricket border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium">Loading...</p>
      </noscript>
    </div>
  );
};

export default Loader;
