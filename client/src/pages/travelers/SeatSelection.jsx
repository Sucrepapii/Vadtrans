import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { FaCheck, FaArrowLeft } from "react-icons/fa";

const SeatSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tripData, passengers } = location.state || {};

  const [selectedSeats, setSelectedSeats] = useState([]);

  // Generate seat layout based on trip data
  const generateSeats = () => {
    const seats = [];
    const totalSeats = tripData?.seats || 40; // Default to 40 if not provided
    const availableSeats = tripData?.availableSeats || totalSeats;
    const seatsPerRow = 4;
    const rows = Math.ceil(totalSeats / seatsPerRow);

    // Calculate number of booked seats
    const bookedSeatsCount = totalSeats - availableSeats;

    // Generate random booked seat numbers for demo
    // In production, this should come from the API
    const bookedSeats = [];
    for (let i = 0; i < bookedSeatsCount; i++) {
      let randomSeat;
      do {
        randomSeat = Math.floor(Math.random() * totalSeats) + 1;
      } while (bookedSeats.includes(randomSeat));
      bookedSeats.push(randomSeat);
    }

    for (let row = 1; row <= rows; row++) {
      for (let seat = 1; seat <= seatsPerRow; seat++) {
        const seatNumber = (row - 1) * seatsPerRow + seat;
        if (seatNumber <= totalSeats) {
          seats.push({
            number: seatNumber,
            row,
            position: seat,
            isBooked: bookedSeats.includes(seatNumber),
          });
        }
      }
    }
    return seats;
  };

  const seats = generateSeats();

  const toggleSeat = (seatNumber) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatNumber));
    } else {
      if (selectedSeats.length < passengers?.length) {
        setSelectedSeats([...selectedSeats, seatNumber]);
      } else {
        toast.warning(
          `You can only select ${passengers?.length} seat(s) for ${passengers?.length} passenger(s)`
        );
      }
    }
  };

  const handleContinue = () => {
    if (selectedSeats.length !== passengers?.length) {
      toast.warning(`Please select exactly ${passengers?.length} seat(s)`);
      return;
    }
    navigate("/booking/payment-method", {
      state: { tripData, passengers, selectedSeats },
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar variant="desktop" />

      <div className="flex-1 py-8 px-4">
        <div className="container-custom max-w-4xl px-4">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {["Passenger Info", "Seat Selection", "Payment", "Review"].map(
                (step, idx) => (
                  <div key={step} className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        idx <= 1
                          ? "bg-primary text-white"
                          : "bg-neutral-200 text-neutral-600"
                      }`}>
                      {idx + 1}
                    </div>
                    {idx < 3 && (
                      <div className="w-12 md:w-24 h-1 bg-neutral-200 mx-1"></div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Back Button */}
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm mb-4">
            <FaArrowLeft />
            <span>Back</span>
          </Button>

          <h1 className="text-xl sm:text-2xl font-raleway font-bold text-charcoal mb-2">
            Select Your Seats
          </h1>
          <p className="text-neutral-600 mb-6">
            Select {passengers?.length} seat(s) for your passenger
            {passengers?.length > 1 ? "s" : ""}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Seat Map */}
            <Card className="lg:col-span-2">
              {/* Legend */}
              <div className="flex items-center gap-6 mb-6 pb-4 border-b">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-neutral-200 rounded"></div>
                  <span className="text-sm">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded"></div>
                  <span className="text-sm">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-neutral-400 rounded"></div>
                  <span className="text-sm">Booked</span>
                </div>
              </div>

              {/* Driver indicator */}
              <div className="mb-4 text-center">
                <div className="inline-block px-4 py-2 bg-neutral-800 text-white rounded-t-lg">
                  Driver
                </div>
              </div>

              {/* Seat Grid */}
              <div className="grid grid-cols-4 gap-3">
                {seats.map((seat) => (
                  <button
                    key={seat.number}
                    type="button"
                    onClick={() => !seat.isBooked && toggleSeat(seat.number)}
                    disabled={seat.isBooked}
                    className={`aspect-square rounded flex items-center justify-center text-sm font-medium transition-all ${
                      seat.isBooked
                        ? "bg-neutral-400 text-white cursor-not-allowed"
                        : selectedSeats.includes(seat.number)
                        ? "bg-primary text-white"
                        : "bg-neutral-200 hover:bg-neutral-300"
                    }`}>
                    {selectedSeats.includes(seat.number) ? (
                      <FaCheck />
                    ) : (
                      seat.number
                    )}
                  </button>
                ))}
              </div>
            </Card>

            {/* Summary */}
            <Card>
              <h3 className="font-semibold mb-4">Selected Seats</h3>
              {selectedSeats.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {selectedSeats.map((seatNum, idx) => (
                    <div
                      key={seatNum}
                      className="flex items-center justify-between p-2 bg-neutral-50 rounded">
                      <span className="text-sm">
                        Passenger {idx + 1}: Seat {seatNum}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500 text-sm mb-4">
                  No seats selected yet
                </p>
              )}

              <div className="pt-4 border-t">
                <p className="text-sm text-neutral-600">
                  {selectedSeats.length} of {passengers?.length} seat(s)
                  selected
                </p>
              </div>
            </Card>
          </div>

          <div className="flex gap-4 mt-6">
            <Button variant="secondary" onClick={() => navigate(-1)} fullWidth>
              Back
            </Button>
            <Button variant="primary" onClick={handleContinue} fullWidth>
              Continue to Payment
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SeatSelection;
