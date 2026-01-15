import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Please provide your full name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
  },
  phone: {
    type: String,
    required: [true, "Please provide a phone number"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ["traveler", "company", "admin"],
    default: "traveler",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  // Company-specific fields
  verificationStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: function () {
      return this.role === "company" ? "pending" : "approved";
    },
  },
  address: {
    type: String,
    default: "",
  },
  businessRegNo: {
    type: String,
    default: "",
  },
  taxId: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  founded: {
    type: String,
    default: "",
  },
  vehicles: {
    type: Number,
    default: 0,
  },
  routes: {
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
      name: {
        type: String,
        required: true,
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
