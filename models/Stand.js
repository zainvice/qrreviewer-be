const mongoose = require("mongoose");

const standSchema = new mongoose.Schema(
  {
    standId: {
        type: mongoose.Schema.Types.ObjectId, 
        default: () => new mongoose.Types.ObjectId(), 
        required: true,
        unique: true,
    },
    linkedBusiness: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Business",
      default: null 
    },
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      default: null 
    }, // User who registered the stand
    status: { 
      type: String, 
      enum: ["linked", "unlinked"], 
      default: "unlinked" 
    },
    scanCount: { 
      type: Number, 
      default: 0 
    }, // Tracking analytics
    type: { 
      type: String, 
      enum: ["QR", "NFC", "Both"], 
      required: true 
    }, // Type of stand
    qrCode: {
        type: Object,  // This will store the QR code as binary data
        default: null
    },
    signupLink: {
        type: String, 
        default: null 
    },
    nfcUrl: {
        type: String, 
        default: null 
    },
    dynamicRedirect: { 
      type: Boolean, 
      default: false 
    }, // For dynamic business link updates
  },
  { timestamps: true }
);

module.exports = mongoose.model("Stand", standSchema);
