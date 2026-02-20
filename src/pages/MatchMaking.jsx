import React, { useState } from 'react';
import { User, MapPin, Check, X, Send, ArrowLeft, Shield, UserPlus } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const MatchMaking = () => {
    const location = useLocation();
    const navigate = useNavigate();
    // The trip details passed from the StartTrip page
    const tripDetails = location.state || { start: "Unknown", end: "Unknown" };
    const [activeTab, setActiveTab] = useState('send');

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(""); // send or receive
    const [selectedUser, setSelectedUser] = useState(null);
    const [connectionType, setConnectionType] = useState('');

    // Potential Matches
    const [potentialMatches, setPotentialMatches] = useState([
        { id: 1, name: "Priya Sharma", start: "Delhi", end: "Jaipur", mode: "Car", status: "Connect" },
        { id: 2, name: "Anjali Gupta", start: "Noida", end: "Agra", mode: "Train", status: "Connect" },
        { id: 3, name: "Riya Singh", start: "Gurgaon", end: "Chandigarh", mode: "Bus", status: "Connect" }
    ]);

    // Received Requests (now includes connectionType)
    const [receivedRequests, setReceivedRequests] = useState([
        { id: 101, name: "Sneha Patel", start: "Mumbai", end: "Pune", mode: "Car", connectionType: "anonymous" },
        { id: 102, name: "Kavita Reddy", start: "Hyderabad", end: "Bangalore", mode: "Flight", connectionType: "details" }
    ]);

    // Open Modal
    const openModal = (user, type) => {
        setSelectedUser(user);
        setModalType(type);
        setConnectionType('');
        setShowModal(true);
    };

    // Confirm Action
    const handleConfirm = () => {
        // In a real app, this would be an async function making an API call.
        // e.g., await api.sendConnectionRequest(selectedUser.id, { type: connectionType });
        if (!connectionType || !selectedUser) return;

        if (modalType === "send") {
            setPotentialMatches(prev =>
                prev.map(user =>
                    user.id === selectedUser.id
                        ? { ...user, status: "Requested", connectionType }
                        : user
                )
            );
            alert("Request Sent!");
        }

        if (modalType === "receive") {
            // If user selected "Share Personal Details", navigate to ConnectedPersonal page
            if (connectionType === "details") {
                const userConfirmed = window.confirm(
                    `You accepted ${selectedUser.name} by sharing your details. Click OK to view your connected partner.`
                );
                if (userConfirmed) {
                    /*navigate('/connected-personal', {
                        state: {
                            partnerDetails: {
                                name: selectedUser.name,
                                college: "Delhi University",
                                transportMode: selectedUser.mode,
                                phone: "+91 98765 43210",
                                location: [28.7041, 77.1025]
                            },
                            userLocation: [28.6139, 77.2090]
                        }
                    });*/
                    navigate("/connected-personal", {
                       state: {
                          partnerDetails: {
                            name: selectedUser.name,
                            start: selectedUser.start,
                            end: selectedUser.end,
                            phone: "+91 98765 43210",
                            mode: selectedUser.mode

                         },
                        },
                       });

                }
            } else {
                alert(
                    `You accepted ${selectedUser.name} anonymously`
                );
            }
            setReceivedRequests(prev =>
                prev.filter(user => user.id !== selectedUser.id)
            );
        }

        setShowModal(false);
        setSelectedUser(null);
        setConnectionType('');
    };

    const handleReject = (id) => {
        // In a real app, this would be an async function making an API call.
        // e.g., await api.rejectConnectionRequest(id);
        setReceivedRequests(prev =>
            prev.filter(user => user.id !== id)
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">

            {/* Header */}
            <div className="bg-white shadow-sm p-4 sticky top-0">
                <div className="max-w-4xl mx-auto flex items-center">
                    <Link to="/start-trip">
                        <ArrowLeft size={24} />
                    </Link>
                    <div className="ml-4">
                        <h1 className="text-xl font-bold">Match Making</h1>
                        <p className="text-sm text-gray-500">
                            {tripDetails.start} {tripDetails.end}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-6">

                {/* Tabs */}
                <div className="flex bg-white rounded-xl shadow mb-6">
                    <button
                        onClick={() => setActiveTab("send")}
                        className={`flex-1 py-3 ${
                            activeTab === "send"
                                ? "bg-pink-50 text-pink-600 border-b-2 border-pink-600"
                                : "text-gray-500"
                        }`}
                    >
                        Send Request
                    </button>

                    <button
                        onClick={() => setActiveTab("received")}
                        className={`flex-1 py-3 ${
                            activeTab === "received"
                                ? "bg-pink-50 text-pink-600 border-b-2 border-pink-600"
                                : "text-gray-500"
                        }`}
                    >
                        Received Requests
                        {receivedRequests.length > 0 && (
                            <span className="ml-2 bg-pink-600 text-white text-xs px-2 py-0.5 rounded-full">
                                {receivedRequests.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* SEND TAB */}
                {activeTab === "send" && (
                    <div className="space-y-4">
                        {potentialMatches.map(user => (
                            <div key={user.id} className="bg-white p-5 rounded-xl shadow flex justify-between items-center">
                                <div>
                                    <h3 className="font-semibold">{user.name}</h3>
                                    <p className="text-sm text-gray-500">
                                        {user.start} → {user.end} | {user.mode}
                                    </p>
                                </div>

                                <button
                                    onClick={() => openModal(user, "send")}
                                    disabled={user.status === "Requested"}
                                    className={`px-4 py-2 rounded-lg ${
                                        user.status === "Requested"
                                            ? "bg-gray-200 text-gray-500"
                                            : "bg-pink-600 text-white"
                                    }`}
                                >
                                    {user.status === "Requested" ? "Sent" : "Connect"}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* RECEIVED TAB */}
                {activeTab === "received" && (
                    <div className="space-y-4">
                        {receivedRequests.map(user => (
                            <div key={user.id} className="bg-white p-5 rounded-xl shadow flex justify-between items-center">
                                <div>
                                    <h3 className="font-semibold">{user.name}</h3>
                                    <p className="text-sm text-gray-500">
                                        {user.start} → {user.end} | {user.mode}
                                    </p>
                                    <p className="text-xs mt-1 text-gray-400">
                                        Connected via: {user.connectionType === "anonymous" ? "Anonymous" : "Shared Details"}
                                    </p>
                                </div>

                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => openModal(user, "receive")}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg"
                                    >
                                        Accept
                                    </button>

                                    <button
                                        onClick={() => handleReject(user.id)}
                                        className="bg-red-100 text-red-600 px-4 py-2 rounded-lg"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-xl w-96 shadow-lg m-4">
                        <h2 className="text-lg font-semibold mb-4">
                            {modalType === 'send' ? 'Choose how you want to connect' : 'Choose how you want to accept'}
                        </h2>

                        <button
                            onClick={() => setConnectionType("anonymous")}
                            className={`w-full p-3 mb-3 border rounded-lg ${
                                connectionType === "anonymous"
                                    ? "border-pink-600 bg-pink-50"
                                    : "border-gray-300"
                            }`}
                        >
                            Stay Anonymous
                        </button>

                        <button
                            onClick={() => setConnectionType("details")}
                            className={`w-full p-3 mb-4 border rounded-lg ${
                                connectionType === "details"
                                    ? "border-pink-600 bg-pink-50"
                                    : "border-gray-300"
                            }`}
                        >
                             Share Personal Details
                        </button>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleConfirm}
                                disabled={!connectionType || !selectedUser}
                                className={`px-4 py-2 rounded-lg text-white ${
                                    connectionType
                                        ? "bg-pink-600"
                                        : "bg-gray-300"
                                }`}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MatchMaking;
