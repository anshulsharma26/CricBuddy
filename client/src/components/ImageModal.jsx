import React from 'react';

const ImageModal = ({ isOpen, imageSrc, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div className="relative max-w-full max-h-full">
        <button 
          className="absolute -top-10 right-0 text-white text-3xl font-light hover:text-gray-300 focus:outline-none"
          onClick={onClose}
        >
          &times;
        </button>
        <img 
          src={imageSrc} 
          alt="Popup Preview" 
          className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

export default ImageModal;
