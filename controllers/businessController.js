const Business = require("../models/Business");
const Stand = require("../models/Stand");

module.exports = {
  async linkBusinessToStand(req, res) {
    try {
      const { standId } = req.params;
      const { name, address, googlePlaceId, ownerId, googleReviewLink } = req.body;
      const stand = await Stand.findOne({ _id: standId });

      if (!stand || stand.status === "linked") {
        return res.status(400).json({ message: "Stand is already linked or not found." });
      }

      const newBusiness = await Business.create({ name, address, googlePlaceId, owner: ownerId, googleReviewLink });
      stand.linkedBusiness = newBusiness._id;
      stand.status = "linked";
      await stand.save();

      res.status(200).json({ message: "Business linked successfully.", stand });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },
};
