const mongoose = require("mongoose");

const AnalyticsSchema = new mongoose.Schema({
  stand: { type: mongoose.Schema.Types.ObjectId, ref: 'Stand', required: true },
  scans: { type: Number, default: 0 },
  lastScanned: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Analytics', AnalyticsSchema);
