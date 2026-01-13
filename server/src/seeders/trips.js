const { sequelize } = require("../config/database");
const Trip = require("../models/Trip");

// Sample trips data
const sampleTrips = [
  // Bus trips
  {
    companyName: "Swift Transport",
    from: "Lagos",
    to: "Abuja",
    departureTime: "08:00 AM",
    arrivalTime: "06:00 PM",
    departureDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    duration: "10h",
    price: 4500,
    type: "bus",
    totalSeats: 50,
    availableSeats: 50,
    bookedSeats: [],
    amenities: ["AC", "WiFi", "Charging Port", "Reclining Seats"],
    status: "scheduled",
    rating: 4.8,
  },
  {
    companyName: "Metro Express",
    from: "Lagos",
    to: "Port Harcourt",
    departureTime: "07:00 AM",
    arrivalTime: "02:00 PM",
    departureDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    duration: "7h",
    price: 3500,
    type: "bus",
    totalSeats: 45,
    availableSeats: 45,
    bookedSeats: [],
    amenities: ["AC", "Movies", "Snacks"],
    status: "scheduled",
    rating: 4.6,
  },
  {
    companyName: "Swift Transport",
    from: "Abuja",
    to: "Kano",
    departureTime: "09:00 AM",
    arrivalTime: "04:00 PM",
    departureDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    duration: "7h",
    price: 3800,
    type: "bus",
    totalSeats: 50,
    availableSeats: 50,
    bookedSeats: [],
    amenities: ["AC", "WiFi", "Charging Port"],
    status: "scheduled",
    rating: 4.7,
  },
  // Train trips
  {
    companyName: "Rail Express",
    from: "Lagos",
    to: "Ibadan",
    departureTime: "07:00 AM",
    arrivalTime: "10:00 AM",
    departureDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    duration: "3h",
    price: 5000,
    type: "train",
    totalSeats: 100,
    availableSeats: 100,
    bookedSeats: [],
    amenities: ["AC", "Dining Car", "WiFi", "Power Outlets"],
    status: "scheduled",
    rating: 4.9,
  },
  {
    companyName: "Rail Express",
    from: "Abuja",
    to: "Kaduna",
    departureTime: "06:30 AM",
    arrivalTime: "09:00 AM",
    departureDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    duration: "2h 30m",
    price: 4200,
    type: "train",
    totalSeats: 120,
    availableSeats: 120,
    bookedSeats: [],
    amenities: ["AC", "WiFi", "Comfort Class"],
    status: "scheduled",
    rating: 4.8,
  },
  // Flight trips
  {
    companyName: "Sky Airlines",
    from: "Lagos",
    to: "Abuja",
    departureTime: "10:30 AM",
    arrivalTime: "12:00 PM",
    departureDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    duration: "1h 30m",
    price: 32000,
    type: "flight",
    totalSeats: 150,
    availableSeats: 150,
    bookedSeats: [],
    amenities: ["Meals", "Entertainment", "Baggage", "Priority Boarding"],
    status: "scheduled",
    rating: 4.9,
  },
  {
    companyName: "Sky Airlines",
    from: "Abuja",
    to: "Lagos",
    departureTime: "03:00 PM",
    arrivalTime: "04:30 PM",
    departureDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    duration: "1h 30m",
    price: 32000,
    type: "flight",
    totalSeats: 150,
    availableSeats: 150,
    bookedSeats: [],
    amenities: ["Meals", "Entertainment", "Baggage", "Priority Boarding"],
    status: "scheduled",
    rating: 4.9,
  },
  {
    companyName: "Sky Airlines",
    from: "Lagos",
    to: "Port Harcourt",
    departureTime: "08:00 AM",
    arrivalTime: "09:00 AM",
    departureDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    duration: "1h",
    price: 28000,
    type: "flight",
    totalSeats: 120,
    availableSeats: 120,
    bookedSeats: [],
    amenities: ["Snacks", "Entertainment", "Baggage"],
    status: "scheduled",
    rating: 4.8,
  },
];

// Seed function
const seedTrips = async () => {
  try {
    // Clear existing trips
    await Trip.destroy({ where: {}, truncate: true });
    console.log("✅ Cleared existing trips");

    // Insert sample trips
    const trips = await Trip.bulkCreate(sampleTrips);
    console.log(`✅ Inserted ${trips.length} sample trips`);

    return trips;
  } catch (error) {
    console.error("❌ Error seeding trips:", error);
    throw error;
  }
};

module.exports = { seedTrips, sampleTrips };
