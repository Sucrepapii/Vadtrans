import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api, { tripAPI, privateRideAPI } from "../../services/api";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Card from "../../components/Card";
import Button from "../../components/Button";
import {
  FaBus,
  FaClock,
  FaInfoCircle,
  FaArrowRight,
  FaSearch,
  FaMapMarkerAlt,
  FaUserSecret,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { subscribeUserToPush } from "../../utils/pushHelper";

const DriverConsoleList = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [trips, setTrips] = useState([]);
  const [privateRequests, setPrivateRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("shared");
  const [privateFilter, setPrivateFilter] = useState("active");
  const displayedPrivateRequests = privateRequests.filter(req => privateFilter === "active" ? !['completed', 'cancelled'].includes(req.status) : ['completed', 'cancelled'].includes(req.status));
  const [isOnline, setIsOnline] = useState(user?.isOnline || false);
  const [bidAmount, setBidAmount] = useState({});
  const [bidData, setBidData] = useState({});
  const [counterOfferAmount, setCounterOfferAmount] = useState({});

  useEffect(() => {
    fetchTrips();
    fetchPrivateRequests();

    // Poll for private requests every 5 seconds so they see new ones and cancelled ones clear out
    const interval = setInterval(() => {
      fetchPrivateRequests();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchPrivateRequests = async () => {
    try {
      const res = await api.get("/private-rides");
      // Only keep non-cancelled requests in the driver's view unless they are assigned
      const activeRequests = res.data.requests?.filter(req => req.status !== "cancelled" || req.driverId === user?.id) || [];
      setPrivateRequests(activeRequests);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleOnline = async () => {
    try {
      const newStatus = !isOnline;
      await api.put("/auth/profile", { isOnline: newStatus });
      setIsOnline(newStatus);
      updateUser({ isOnline: newStatus });
      toast.success(newStatus ? "You are now ONLINE" : "You are now OFFLINE");

      // Subscribe to push notifications if they just went online
      if (newStatus) {
        const subscription = await subscribeUserToPush();
        if (subscription) {
          await api.post("/auth/push-subscribe", { subscription });
        }
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleBid = async (requestId) => {
    try {
      const reqBid = bidData[requestId] || {};
      const amount = reqBid.amount || bidAmount[requestId];
      if (!amount) return toast.error("Please enter a bid amount");
      await privateRideAPI.placeBid(requestId, {
        bidAmount: amount,
        luggageDescription: reqBid.luggageDescription || "",
        vehicleDetails: reqBid.vehicleDetails || "",
        furtherInformation: reqBid.furtherInformation || "",
      });
      toast.success("Bid placed successfully!");
      fetchPrivateRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place bid");
    }
  };

  const handleDismissBid = async (bidId) => {
    try {
      await privateRideAPI.dismissBid(bidId);
      toast.info("Request dismissed from your console.");
      fetchPrivateRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to dismiss request");
    }
  };

  const handleCounter = async (bidId, amount) => {
    try {
      if (!amount) return toast.error("Please enter a final price offer");
      await privateRideAPI.counterOfferBid(bidId, amount);
      toast.success("Final offer submitted successfully!");
      fetchPrivateRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit counter-offer");
    }
  };

  const handleDriverAccept = async (bidId) => {
    try {
      await privateRideAPI.driverAcceptBid(bidId);
      toast.success("Passenger's proposed price accepted! Waiting for their payment.");
      fetchPrivateRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to accept proposed price");
    }
  };

  const fetchTrips = async () => {
    try {
      const response = await tripAPI.getMyTrips();
      setTrips(response.data.trips || []);
    } catch (error) {
      console.error("Error fetching trips:", error);
      toast.error("Failed to load your trips");
    } finally {
      setLoading(false);
    }
  };

  const filteredTrips = trips.filter((trip) => {
    const term = searchTerm.toLowerCase();
    return (
      trip.from?.toLowerCase().includes(term) ||
      trip.to?.toLowerCase().includes(term) ||
      trip.transportType?.toLowerCase().includes(term)
    );
  });

  const pendingRequestsCount = privateRequests.filter(req => req.status === "searching").length;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar variant="desktop" portalLabel="DRIVER CONSOLE" />

      <div className="flex-1 py-8 px-4">
        <div className="container-custom max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-raleway font-bold text-charcoal mb-2">
                Driver Console
              </h1>
              <p className="text-neutral-600">
                Manage your trips and private requests.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
              <div className="flex items-center justify-between sm:justify-center gap-3 bg-white px-4 py-3 sm:py-2 rounded-lg border border-neutral-200 shadow-sm">
                <span className="text-sm font-bold text-charcoal">Status:</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleOnline}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                      isOnline ? "bg-green-500" : "bg-neutral-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        isOnline ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span className={`text-sm font-bold ${isOnline ? "text-green-600" : "text-neutral-500"}`}>
                    {isOnline ? "ONLINE" : "OFFLINE"}
                  </span>
                </div>
              </div>

              <div className="relative w-full sm:w-64 shadow-sm">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search routes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 sm:py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
        </div>

          {/* Banner for pending requests */}
          {pendingRequestsCount > 0 && activeTab !== "private" && (
            <div 
              onClick={() => setActiveTab("private")}
              className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-red-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚨</span>
                <div>
                  <h4 className="text-red-700 font-bold">New Private Ride Requests!</h4>
                  <p className="text-sm text-red-600">You have {pendingRequestsCount} pending request(s) waiting for bids. Click to view.</p>
                </div>
              </div>
              <Button onClick={() => setActiveTab("private")} variant="primary" className="bg-red-600 hover:bg-red-700 border-none">View Requests</Button>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-neutral-200 pb-2">
            <button
              onClick={() => setActiveTab("shared")}
              className={`px-4 py-2 font-bold transition-colors ${
                activeTab === "shared" ? "text-primary border-b-2 border-primary" : "text-neutral-500 hover:text-charcoal"
              }`}
            >
              Shared Trips
            </button>
            <button
              onClick={() => setActiveTab("private")}
              className={`px-4 py-2 font-bold transition-colors flex items-center gap-2 ${
                activeTab === "private" ? "text-primary border-b-2 border-primary" : "text-neutral-500 hover:text-charcoal"
              }`}
            >
              Private Requests
              {pendingRequestsCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-neutral-500">Loading trips...</p>
            </div>
          ) : activeTab === "shared" ? (
            filteredTrips.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-neutral-100">
                <FaBus className="mx-auto text-4xl text-neutral-300 mb-4" />
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  No trips found
                </h3>
                <p className="text-neutral-500 mb-6">
                  You haven't created any trips yet, or none matched your search.
                </p>
                <Button
                  variant="primary"
                  onClick={() => navigate("/company/tickets")}>
                  Create New Trip
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md transition-all group">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
                          {trip.transportType}
                        </span>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded ${
                            trip.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-neutral-100 text-neutral-600"
                          }`}>
                          {trip.status}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-charcoal mb-1 flex items-center gap-2">
                        {trip.from}{" "}
                        <FaArrowRight className="text-sm text-neutral-400" />{" "}
                        {trip.to}
                      </h3>

                      <div className="flex items-center gap-2 text-neutral-500 text-sm mb-6">
                        <FaClock className="text-primary" />
                        {trip.departureTime}
                      </div>

                      <div className="border-t border-neutral-100 pt-4 mt-auto">
                        <Button
                          variant="primary"
                          fullWidth
                          onClick={() =>
                            navigate(`/company/driver-console/${trip.id}`)
                          }
                          className="flex items-center justify-center gap-2 group-hover:bg-primary-dark transition-colors">
                          <FaMapMarkerAlt /> Start Trip
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : activeTab === "private" ? (
            <div className="space-y-4">
              <div className="flex gap-2 mb-4">
                <button onClick={() => setPrivateFilter("active")} className={`px-4 py-2 text-sm font-bold rounded-lg ${privateFilter === "active" ? "bg-primary text-white" : "bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200"}`}>Active</button>
                <button onClick={() => setPrivateFilter("archived")} className={`px-4 py-2 text-sm font-bold rounded-lg ${privateFilter === "archived" ? "bg-primary text-white" : "bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200"}`}>Archived</button>
              </div>
              {displayedPrivateRequests.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-neutral-100">
                <FaUserSecret className="mx-auto text-4xl text-neutral-300 mb-4" />
                <h3 className="text-lg font-semibold text-charcoal mb-2">No Private Requests</h3>
                <p className="text-neutral-500">Go online to receive private ride requests.</p>
              </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {displayedPrivateRequests.map(req => {
                  const myBid = req.bids?.find(b => b.driverId === user?.id);
                  return (
                    <div key={req.id} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full uppercase">
                          {req.rideType}
                        </span>
                        <span className={`ml-2 text-xs font-bold px-2 py-1 rounded ${
                          req.status === "searching" ? "bg-yellow-100 text-yellow-700" :
                          req.status === "driver_assigned" ? "bg-blue-100 text-blue-700" :
                          "bg-green-100 text-green-700"
                        }`}>
                          {req.status.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mb-4 p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                      {req.passenger?.avatar ? (
                        <img src={req.passenger.avatar} alt="Passenger" className="w-10 h-10 rounded-full object-cover shadow-sm" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {req.passenger?.name?.charAt(0) || "P"}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-charcoal text-sm">{req.passenger?.name || "Passenger"}</p>
                        <p className="text-xs text-neutral-500 font-medium">📞 {req.passenger?.phone || "No phone"}</p>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-charcoal mb-1 flex flex-col gap-1">
                      <span className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">●</span> 
                        <span className="text-sm">{req.pickupLocation}{req.pickupState ? `, ${req.pickupState}` : ''}</span>
                      </span>
                      <span className="flex items-start gap-2">
                        <FaMapMarkerAlt className="text-red-500 mt-1" />
                        <span className="text-sm">{req.destination}{req.destinationState ? `, ${req.destinationState}` : ''}</span>
                      </span>
                    </h3>
                    
                    {req.stops && req.stops.length > 0 && (
                      <div className="mb-3 p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                        <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Intermediate Stops</p>
                        <ul className="text-sm text-charcoal space-y-1">
                          {req.stops.map((stop, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">{i+1}</span>
                              {stop}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex gap-4 text-sm text-neutral-600 mb-4 mt-2 border-t border-neutral-100 pt-3">
                      <span className="flex items-center gap-1"><FaClock /> {req.pickupDate} at {req.pickupTime}</span>
                      <span>Passengers: {req.passengersCount}</span>
                    </div>

                    {myBid ? (
                      <div className="mt-4 pt-4 border-t border-neutral-100 bg-neutral-50/50 p-4 rounded-xl border border-neutral-100">
                        {myBid.status === "negotiating" ? (
                          <div className="space-y-3">
                            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                              <div>
                                <p className="text-sm font-bold text-amber-700 flex items-center gap-1.5">
                                  <span>🚨</span> Passenger Counter-Offer
                                </p>
                                <p className="text-xs text-neutral-600 mt-1">They proposed: <span className="font-bold text-lg text-amber-600">₦{myBid.passengerCounterOffer?.toLocaleString() || myBid.bidAmount.toLocaleString()}</span></p>
                                <p className="text-[10px] text-neutral-500 mt-1">Your original bid was ₦{myBid.bidAmount.toLocaleString()}</p>
                              </div>
                              <Button 
                                onClick={() => handleDriverAccept(myBid.id)} 
                                variant="primary" 
                                className="py-2 px-4 bg-green-600 hover:bg-green-700 text-sm border-0 w-full md:w-auto"
                              >
                                Accept Proposed Price
                              </Button>
                            </div>
                            <div className="mt-4 border-t border-neutral-200 pt-3">
                              <p className="text-xs font-bold text-neutral-600 mb-2">Or, reject their offer and submit your final price:</p>
                              <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                  type="number"
                                  placeholder="Final Offer (₦)"
                                  value={counterOfferAmount[myBid.id] || ""}
                                  onChange={(e) => setCounterOfferAmount({...counterOfferAmount, [myBid.id]: e.target.value})}
                                  className="w-full sm:flex-1 px-4 py-3 sm:py-2 border border-neutral-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white text-sm"
                                />
                                <Button 
                                  onClick={() => handleCounter(myBid.id, counterOfferAmount[myBid.id])} 
                                  variant="primary" 
                                  className="w-full sm:w-auto py-3 sm:py-2 bg-amber-600 hover:bg-amber-700 text-sm border-0"
                                >
                                  Reject & Submit Final Price
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : myBid.status === "counter_offered" ? (
                          <p className="text-sm font-semibold text-green-700">
                            ✓ You submitted a final counter-offer of ₦{myBid.bidAmount.toLocaleString()}. Awaiting passenger response.
                          </p>
                        ) : myBid.status === "pending" ? (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-neutral-500 font-medium">Your active bid:</span>
                            <span className="font-bold text-primary">₦{myBid.bidAmount.toLocaleString()}</span>
                          </div>
                        ) : myBid.status === "not_interested" ? (
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-2.5 bg-neutral-100 rounded-lg">
                            <div>
                              <p className="text-sm font-bold text-neutral-700 flex items-center gap-1.5">
                                <span className="text-neutral-500">🚫</span> Passenger is no longer interested
                              </p>
                              <p className="text-xs text-neutral-500">Your price offer was discarded by the passenger.</p>
                            </div>
                            <Button
                              onClick={() => handleDismissBid(myBid.id)}
                              variant="secondary"
                              className="py-1.5 px-3 text-xs text-neutral-600 hover:bg-neutral-200 border border-neutral-300"
                            >
                              Dismiss from Console
                            </Button>
                          </div>
                        ) : myBid.status === "rejected" ? (
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-2.5 bg-red-50 rounded-lg border border-red-100">
                            <div>
                              <p className="text-sm font-bold text-red-600 flex items-center gap-1.5">
                                <span>✗</span> Passenger selected another driver
                              </p>
                              <p className="text-xs text-neutral-500">Trip was booked with another offer.</p>
                            </div>
                            <Button
                              onClick={() => handleDismissBid(myBid.id)}
                              variant="secondary"
                              className="py-1.5 px-3 text-xs text-neutral-600 hover:bg-neutral-100 border border-neutral-300"
                            >
                              Dismiss from Console
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      req.status === "searching" && (
                        <div className="mt-4 pt-4 border-t border-neutral-100 space-y-3">
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <input
                              type="number"
                              placeholder="Your bid amount (₦) *"
                              value={bidData[req.id]?.amount || bidAmount[req.id] || ""}
                              onChange={(e) => {
                                setBidAmount({ ...bidAmount, [req.id]: e.target.value });
                                setBidData({ ...bidData, [req.id]: { ...(bidData[req.id] || {}), amount: e.target.value } });
                              }}
                              className="w-full sm:flex-1 px-4 py-3 sm:py-2 border border-neutral-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-bold text-charcoal"
                              required
                            />
                            <Button 
                              onClick={() => handleBid(req.id)} 
                              variant="primary" 
                              className="w-full sm:w-auto py-3 sm:py-2 px-6 font-bold"
                            >
                              Place Bid
                            </Button>
                          </div>

                          {/* Expandable Luggage & Vehicle Info */}
                          <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 space-y-2 text-xs">
                            <div className="font-bold text-neutral-600 uppercase tracking-wider text-[10px] flex items-center justify-between">
                              <span>Trip Details for Passenger (Recommended)</span>
                              <span className="text-[9px] text-primary font-normal">Increases chance of acceptance</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] text-neutral-500 font-medium mb-0.5">Luggage Allowance / Boot Space</label>
                                <input
                                  type="text"
                                  placeholder="e.g. 2 large suitcases & 1 handbag"
                                  value={bidData[req.id]?.luggageDescription || ""}
                                  onChange={(e) => setBidData({ ...bidData, [req.id]: { ...(bidData[req.id] || {}), luggageDescription: e.target.value } })}
                                  className="w-full px-2.5 py-1.5 border border-neutral-300 rounded bg-white text-neutral-700 outline-none focus:border-primary text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-neutral-500 font-medium mb-0.5">Vehicle Information</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Toyota Sienna (Black) - KJA-123-XY"
                                  value={bidData[req.id]?.vehicleDetails || ""}
                                  onChange={(e) => setBidData({ ...bidData, [req.id]: { ...(bidData[req.id] || {}), vehicleDetails: e.target.value } })}
                                  className="w-full px-2.5 py-1.5 border border-neutral-300 rounded bg-white text-neutral-700 outline-none focus:border-primary text-xs"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] text-neutral-500 font-medium mb-0.5">Driver Notes / Further Information</label>
                              <input
                                type="text"
                                placeholder="e.g. AC works perfectly, gentle driving, on-time pickup"
                                value={bidData[req.id]?.furtherInformation || ""}
                                onChange={(e) => setBidData({ ...bidData, [req.id]: { ...(bidData[req.id] || {}), furtherInformation: e.target.value } })}
                                className="w-full px-2.5 py-1.5 border border-neutral-300 rounded bg-white text-neutral-700 outline-none focus:border-primary text-xs"
                              />
                            </div>
                          </div>

                          <p className="text-[10px] text-neutral-400 italic">
                            Note: Platform commission of 20% applies to private rides. You will receive 80% of your accepted bid.
                          </p>
                        </div>
                      )
                    )}

                    {req.status !== "searching" && req.driverId === user?.id && (
                      <div className="mt-4 pt-4 border-t border-neutral-100">
                        <Button variant="primary" fullWidth onClick={() => navigate(`/company/private-driver-console/${req.id}`)}>
                          Go to Tracking Console
                        </Button>
                      </div>
                    )}
                  </div>
                )})}
              </div>
            )}
            </div>
          ) : null}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DriverConsoleList;
