import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide company name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please provide business email"],
    unique: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: [true, "Please provide phone number"],
  },
  transportType: {
    type: String,
    enum: ["bus", "train", "flight", "other"],
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalTrips: {
    type: Number,
    default: 0,
  },
  documents: [
    {
      type: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  isVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Company = mongoose.model("Company", companySchema);

export default Company;
