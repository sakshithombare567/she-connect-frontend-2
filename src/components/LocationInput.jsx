/*import React, { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

const LocationInput = ({ label, value, onChange, placeholder }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (value.length < 3) {
                setSuggestions([]);
                return;
            }

            setLoading(true);
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&addressdetails=1&limit=5`
                );
                const data = await response.json();
                setSuggestions(data);
                setShowSuggestions(true);
            } catch (error) {
                console.error("Error fetching location suggestions:", error);
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            if (value && showSuggestions) { // Only fetch if user is typing and wants suggestions
                // Ideally we'd have a separate state for 'inputValue' vs 'selectedValue' to prevent 
                // re-fetching when clicking a suggestion, but for now we'll just check if 
                // the input matches exactly one of the known suggestions to avoid loop, 
            }
            // For a simple implementation, we'll fetch when value changes
            // Optimization: Don't fetch if the value was just set by clicking a suggestion
            // We can handle this by passing a flag or just checking length
            fetchSuggestions();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [value]);


    const handleSelect = (suggestion) => {
        onChange(suggestion.display_name); // Or suggestion.name based on preference
        setShowSuggestions(false);
        setSuggestions([]);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        // Force show suggestions when typing
                        if (e.target.value.length >= 3) setShowSuggestions(true);
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
                    placeholder={placeholder}
                    autoComplete="off"
                />
                <MapPin className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>

            {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white mt-1 border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((item) => (
                        <li
                            key={item.place_id}
                            onClick={() => handleSelect(item)}
                            className="px-4 py-2 hover:bg-pink-50 cursor-pointer text-sm text-gray-700 border-b border-gray-100 last:border-b-0"
                        >
                            {item.display_name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default LocationInput; */
import React from "react";
import { MapPin } from "lucide-react";

const LocationInput = ({ label, value, onChange, placeholder }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
        />
        <MapPin
          className="absolute left-3 top-2.5 text-gray-400"
          size={18}
        />
      </div>
    </div>
  );
};

export default LocationInput;
