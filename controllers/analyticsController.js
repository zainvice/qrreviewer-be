const Stand = require("../models/Stand");
const Business = require("../models/Business");

module.exports = {
  async getStandAnalytics(req, res) {
    try {
      const { standId } = req.params;
      const stand = await Stand.findOne({ standId }).populate("linkedBusiness");
      if (!stand) return res.status(404).json({ message: "Stand not found." });
      res.status(200).json({ stand, scans: stand.scanCount });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },

  async getUserAnalytics(req, res) {
    try {
      const { userId } = req.params;
      const stands = await Stand.find({ user: userId }).populate("linkedBusiness");
      res.status(200).json(stands);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
  
};
