import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import MapLibreMap from "./MapLibre";
import { getCoordsFromLocation } from "../utils/getCoordsFromLocation";
import EmergencyModal from "../components/EmergencyModal";

const ConnectedAnonymous = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { partnerDetails } = location.state || {};

  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showEmergency, setShowEmergency] = useState(false);

  useEffect(() => {
    console.debug("ConnectedAnonymous: showEmergency ->", showEmergency);
  }, [showEmergency]);

  useEffect(() => {
    let ignore = false;

    async function fetchCoords() {
      if (!partnerDetails) return;

      const [start, end] = await Promise.all([
        getCoordsFromLocation(partnerDetails.start),
        getCoordsFromLocation(partnerDetails.end),
      ]);

      if (!ignore) {
        setStartCoords(start);
        setEndCoords(end);
        setLoading(false);
      }
    }

    fetchCoords();

    return () => {
      ignore = true;
    };
  }, [partnerDetails]);

  if (!partnerDetails) {
    return <div className="p-10 text-center">No Anonymous Data Found</div>;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 relative z-0">

        {/* Header */}
        <div className="bg-white p-4 shadow flex justify-between items-center relative z-10">
          <button onClick={() => navigate(-1)} className="flex items-center">
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>
        </div>

        <div className="max-w-3xl mx-auto p-6">

          {/* Anonymous Details */}
          <div className="bg-white p-6 rounded-xl shadow mb-6 relative z-10">
            <h2 className="text-xl font-bold mb-4">Connected Anonymous Partner</h2>
            <p><strong>Anonymous ID:</strong> #{partnerDetails.id}</p>
            <p><strong>From:</strong> {partnerDetails.start}</p>
            <p><strong>To:</strong> {partnerDetails.end}</p>
          </div>

          {/* Map */}
          <div className="bg-white p-6 rounded-xl shadow mb-6 relative z-0">
            {loading ? (
              <p>Loading Map...</p>
            ) : (
              <MapLibreMap startCoords={startCoords} endCoords={endCoords} />
            )}
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-4 relative z-[9999]">
            <button className="bg-pink-600 text-white py-3 rounded-lg">
              Start Trip
            </button>

            <button
              onClick={() => {
                console.debug('ConnectedAnonymous: Emergency button clicked');
                setShowEmergency(true);
              }}
              className="bg-pink-600 text-white py-3 rounded-lg flex justify-center items-center"
            >
              <AlertTriangle size={18} className="mr-2" />
              Emergency
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Modal */}
      <EmergencyModal
        isOpen={showEmergency}
        onClose={() => setShowEmergency(false)}
      />
    </>
  );
};

export default ConnectedAnonymous;
