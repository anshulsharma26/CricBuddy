import React from 'react';

const OfflinePage = ({ onRetry }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-dark flex items-center justify-center p-4 text-center overflow-hidden">
      {/* Background Gradient Blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cricket/10 rounded-full blur-[80px] animate-pulse"></div>
      
      <div className="relative z-10 max-w-sm w-full animate-in fade-in zoom-in-95 duration-500">
        <div className="text-6xl mb-4 animate-bounce">
          <span role="img" aria-label="offline">😵‍💫</span>
        </div>
        
        <h1 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight">
          You're Offline
        </h1>
        
        <p className="text-gray-400 text-sm mb-6 leading-relaxed font-medium">
          Looks like your internet took a break. 🍵 <br/>
          Check your connection and try again.
        </p>
        
        <div className="space-y-3">
          <button 
            onClick={onRetry}
            className="w-full py-2.5 rounded-md bg-white text-dark hover:bg-gray-100 text-sm font-bold shadow-md active:scale-95 transition-transform"
          >
            Retry Connection 📡
          </button>
          
          <div className="flex items-center justify-center gap-1.5 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
            Waiting for Signal
          </div>
        </div>
      </div>

      {/* Sporty Accents */}
      <div className="absolute bottom-6 left-6 text-white/5 font-black text-6xl select-none rotate-12">
        CRIC
      </div>
      <div className="absolute top-6 right-6 text-white/5 font-black text-6xl select-none -rotate-12">
        BUDDY
      </div>
    </div>
  );
};

export default OfflinePage;
