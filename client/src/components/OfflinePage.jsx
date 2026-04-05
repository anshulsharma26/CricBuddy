import React from 'react';

const OfflinePage = ({ onRetry }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-dark flex items-center justify-center p-6 text-center overflow-hidden">
      {/* Background Gradient Blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cricket/20 rounded-full blur-[120px] animate-pulse"></div>
      
      <div className="relative z-10 max-w-md w-full animate-in fade-in zoom-in-95 duration-500">
        <div className="text-8xl mb-8 animate-bounce">
          <span role="img" aria-label="offline">😵‍💫</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
          You're Offline
        </h1>
        
        <p className="text-gray-400 text-lg mb-10 leading-relaxed font-medium">
          Looks like your internet took a break. 🍵 <br/>
          Check your connection and try again.
        </p>
        
        <div className="space-y-4">
          <button 
            onClick={onRetry}
            className="w-full btn-primary bg-white text-dark hover:bg-gray-100 border-none py-4 text-lg font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95 transition-transform"
          >
            Retry Connection 📡
          </button>
          
          <div className="flex items-center justify-center gap-2 text-gray-500 text-sm font-bold uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            Waiting for Signal
          </div>
        </div>
      </div>

      {/* Sporty Accents */}
      <div className="absolute bottom-10 left-10 text-white/5 font-black text-9xl select-none rotate-12">
        CRIC
      </div>
      <div className="absolute top-10 right-10 text-white/5 font-black text-9xl select-none -rotate-12">
        BUDDY
      </div>
    </div>
  );
};

export default OfflinePage;
