const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    googlePlaceId: { type: String, required: true },
    googleReviewLink: { type: String, required: true },
    owner: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    stand: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Stand" 
    }, 
  },
  { timestamps: true }
);

module.exports = mongoose.model("Business", businessSchema);
