import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  from: {
    type: String,
    required: [true, "Please provide departure location"],
  },
  to: {
    type: String,
    required: [true, "Please provide destination"],
  },
  travelDate: {
    type: Date,
    required: [true, "Please provide travel date"],
  },
  passengers: {
    type: Number,
    default: 1,
    min: 1,
  },
  amount: {
    type: Number,
    required: [true, "Please provide booking amount"],
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "completed", "cancelled"],
    default: "pending",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "refunded"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Generate booking ID before saving
bookingSchema.pre("save", async function (next) {
  if (!this.bookingId) {
    this.bookingId = `BK-${Date.now().toString().slice(-6)}`;
  }
  next();
});

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
