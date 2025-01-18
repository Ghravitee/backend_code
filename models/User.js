import mongoose from "mongoose";
import bcrypt from "bcrypt";
import healthStatsSchema from "../models/HealthStats.js";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: { type: String, enum: ["Male", "Female"], required: true },
    weight: { type: Number, required: true },
    height: { type: Number, required: true },
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    confirmPassword: { type: String },
    healthStats: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HealthStats",
      default: null, // Initially, no health stats linked
    },
  },
  { timestamps: true }
);

// Hash password before saving to database
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  if (this.password !== this.confirmPassword) {
    throw new Error("Passwords do not match");
  }

  this.password = await bcrypt.hash(this.password, 10);
  this.confirmPassword = undefined;
  next();
});

// Exclude sensitive information when converting to JSON
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.confirmPassword;

    return ret;
  },
});

const User = new mongoose.model("User", userSchema);

export default User;
