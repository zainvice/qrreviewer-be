// models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true},
    role: { type: String, enum: ["admin", "user"], default: "user" },
    otp: { type: String, select: false },
    otpExpiresAt: { type: Date, select: false },
    stands: [{ type: mongoose.Schema.Types.ObjectId, ref: "Stand" }],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
