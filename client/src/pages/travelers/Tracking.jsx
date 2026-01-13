import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Card from "../../components/Card";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaClock,
  FaCheckCircle,
  FaCircle,
} from "react-icons/fa";

const Tracking = () => {
  const navigate = useNavigate();
  const [bookingId, setBookingId] = useState("");
  const [trackingData, setTrackingData] = useState(null);

  const handleTrack = (e) => {
    e.preventDefault();
    // Simulate tracking data
    setTrackingData({
      bookingId: bookingId || "BK-123456",
      status: "In Transit",
      from: "Lagos",
      to: "Abuja",
      company: "Swift Transport",
      departureTime: "08:00 AM",
      estimatedArrival: "06:00 PM",
      currentLocation: "Lokoja",
      progress: 60,
      timeline: [
        { status: "Booking Confirmed", time: "07:30 AM", completed: true },
        { status: "Departed Lagos", time: "08:00 AM", completed: true },
        { status: "Passed Ibadan", time: "10:30 AM", completed: true },
        {
          status: "Currently at Lokoja",
          time: "02:00 PM",
          completed: true,
          current: true,
        },
        { status: "Expected at Abuja", time: "06:00 PM", completed: false },
      ],
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar variant="desktop" />

      <div className="flex-1 py-8 px-4">
        <div className="container-custom max-w-3xl">
          <h1 className="text-2xl font-raleway font-bold text-charcoal mb-6">
            Track Your Trip
          </h1>

          {/* Search Form */}
          <Card className="mb-6">
            <form onSubmit={handleTrack} className="space-y-4">
              <Input
                label="Booking Reference"
                name="bookingId"
                placeholder="Enter your booking ID (e.g., BK-123456)"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                icon={FaSearch}
                required
              />
              <Button type="submit" variant="primary" fullWidth>
                Track Booking
              </Button>
            </form>
          </Card>

          {/* Tracking Results */}
          {trackingData && (
            <>
              {/* Status Card */}
              <Card className="mb-6 bg-gradient-to-r from-primary to-primary-dark text-white">
                <div className="text-center">
                  <p className="text-sm opacity-90 mb-2">Current Status</p>
                  <h2 className="text-3xl font-bold mb-4">
                    {trackingData.status}
                  </h2>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <FaMapMarkerAlt />
                    <span className="text-lg">
                      {trackingData.currentLocation}
                    </span>
                  </div>
                  <div className="bg-white/20 rounded-full h-2 mb-2">
                    <div
                      className="bg-white h-2 rounded-full transition-all duration-500"
                      style={{ width: `${trackingData.progress}%` }}
                    />
                  </div>
                  <p className="text-sm opacity-90">
                    {trackingData.progress}% Complete
                  </p>
                </div>
              </Card>

              {/* Trip Details */}
              <Card className="mb-6">
                <h3 className="font-semibold mb-4">Trip Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Booking ID:</span>
                    <span className="font-semibold">
                      {trackingData.bookingId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Company:</span>
                    <span className="font-semibold">
                      {trackingData.company}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Route:</span>
                    <span className="font-semibold">
                      {trackingData.from} → {trackingData.to}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Departure:</span>
                    <span className="font-semibold">
                      {trackingData.departureTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Est. Arrival:</span>
                    <span className="font-semibold">
                      {trackingData.estimatedArrival}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Timeline */}
              <Card>
                <h3 className="font-semibold mb-4">Journey Timeline</h3>
                <div className="space-y-4">
                  {trackingData.timeline.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            item.completed ? "bg-green-100" : "bg-neutral-100"
                          }`}>
                          {item.completed ? (
                            <FaCheckCircle
                              className={`text-xl ${
                                item.current ? "text-primary" : "text-green-600"
                              }`}
                            />
                          ) : (
                            <FaCircle className="text-neutral-400" />
                          )}
                        </div>
                        {index < trackingData.timeline.length - 1 && (
                          <div
                            className={`w-0.5 h-12 ${
                              item.completed ? "bg-green-600" : "bg-neutral-300"
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p
                          className={`font-semibold ${
                            item.current
                              ? "text-primary"
                              : item.completed
                              ? "text-charcoal"
                              : "text-neutral-500"
                          }`}>
                          {item.status}
                        </p>
                        <p className="text-sm text-neutral-600 flex items-center gap-1">
                          <FaClock className="text-xs" />
                          {item.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          {!trackingData && (
            <Card className="text-center py-12">
              <FaMapMarkerAlt className="text-6xl text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-600 mb-2">
                Enter your booking ID to track your trip
              </p>
              <p className="text-sm text-neutral-500">
                You can find your booking ID in your confirmation email
              </p>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Tracking;
