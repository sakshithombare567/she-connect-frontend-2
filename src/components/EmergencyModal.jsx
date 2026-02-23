import React, { useEffect, useState } from "react";

const EmergencyModal = ({ isOpen, onClose, contacts: propContacts }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    console.debug('EmergencyModal props:', { isOpen });
    if (!isOpen) setSelectedIndex(null);
  }, [isOpen]);

  // Default contacts (fallback)
  const contacts = propContacts || [
    { name: "Mother", phone: "8765432190" },
    { name: "Father", phone: "9876543210" },
  ];

  if (!isOpen) return null;

  const handleSelect = (i) => {
    setSelectedIndex(i);
  };

  const handleShare = () => {
    if (selectedIndex === null) return;
    const selected = contacts[selectedIndex];
    console.debug('EmergencyModal: sharing live location to', selected);

    if (navigator && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          console.debug('Current position:', pos.coords);
          // TODO: send coords to backend or via SMS/notification
          onClose();
        },
        (err) => {
          console.error('Geolocation error:', err);
          onClose();
        }
      );
    } else {
      console.debug('Geolocation not available');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative bg-white w-[400px] rounded-2xl p-6 shadow-2xl border border-pink-200">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
          aria-label="Close emergency modal"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-6">Emergency Contacts</h2>

        {contacts.map((c, i) => {
          const isSelected = selectedIndex === i;
          return (
            <div
              key={i}
              role="button"
              tabIndex={0}
              onClick={() => handleSelect(i)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelect(i)}
              className={`transition p-4 rounded-xl mb-4 cursor-pointer border ${isSelected ? 'border-pink-500 ring-2 ring-pink-200 bg-pink-50' : 'bg-gray-50 hover:bg-gray-100'}`}
              aria-pressed={isSelected}
            >
              <p className="font-semibold text-gray-800">{c.name}</p>
              <p className="text-gray-500">{c.phone}</p>
            </div>
          );
        })}

        <button
          onClick={handleShare}
          disabled={selectedIndex === null}
          className={`w-full ${selectedIndex === null ? 'bg-pink-300 cursor-not-allowed opacity-60' : 'bg-pink-600 hover:bg-pink-700'} transition text-white py-3 rounded-xl font-semibold`}
        >
          Share Live Location
        </button>

      </div>
    </div>
  );
};

export default EmergencyModal;
