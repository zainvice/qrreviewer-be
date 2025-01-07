const Stand = require("../models/Stand");
const QRCode = require("qrcode");

module.exports = {
  async getStandDetails(req, res) {
    try {
      const { standId } = req.params;
      const stand = await Stand.findOne({ _id: standId }).populate("linkedBusiness user");
      if (!stand) return res.status(404).json({ message: "Stand not found." });
      res.status(200).json(stand);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },
  generateBulk: async (req, res) => {
    try {
      const { quantity, type } = req.body; 
      const signupBaseUrl = process.env.USER_SIGNUP_URL || "https://zeptocards.pages.dev/signup"; 
      const generatedData = [];
    
      for (let i = 0; i < quantity; i++) {
        const stand = await Stand.create({ status: "unlinked", type });
    
        // Generate a unique signup link for each stand
        const signupLink = `${signupBaseUrl}?standId=${stand._id}`;

        let qrCodeData = null;
        if (type === "QR" || type === "Both") {
          qrCodeData = await QRCode.toBuffer(signupLink); // Using toBuffer to store it as binary data
        }
        let nfcUrl = null;
        if (type === "NFC" || type === "Both") {
          nfcUrl = signupLink; // NFC URL is just the signup link
        }
    
        const updatedStand = await Stand.findByIdAndUpdate(
          stand._id,
          { 
            signupLink,
            qrCode: qrCodeData,  // Store QR Code as Buffer
            nfcUrl,
          },
          { new: true }
        );
    
        generatedData.push({
          standId: updatedStand._id,
          signupLink,
          qrCodeData: qrCodeData.toString('base64'),
          nfcUrl,
        });
      }
    
      res.status(201).json({
        message: "Bulk QRs/NFCs generated successfully.",
        data: generatedData,
      });
    } catch (error) {
      console.error("Error generating bulk QRs/NFCs:", error);
      res.status(500).json({ message: "Server error", error });
    }
  },
  handleRedirection: async (req, res) => {  
    try {  
        const { standId } = req.params;  
        // Fetch the stand details, populating the linked business
        if (!standId||standId==="null") return res.status(404).json({ message: "StandId not provided." });  
        const stand = await Stand.findOne({ _id: standId }).populate("linkedBusiness");  
        if (!stand) return res.status(404).json({ message: "Stand not found." });  

        // Check if the stand is linked to a business
        if (stand.status === "linked" && stand.linkedBusiness) {  
            // Increment scan count for analytics
            stand.scanCount += 1;  
            await stand.save();  

            return res.status(200).json({  
                googleReviewLink: stand.linkedBusiness.googleReviewLink,  
            });  
        }  

        // Stand is unlinked or not configured
        return res.status(200).json({  
            message: "Stand not configured yet. Please link a business to this stand.",  
        });  
    } catch (error) {  
        console.error("Error handling stand redirection:", error);  
        res.status(500).json({ message: "Server error", error });  
    }  
  },  


  async resetStand(req, res) {
    try {
      const { standId } = req.params;
      const stand = await Stand.findOneAndUpdate(
        { _id: standId },
        { status: "unlinked", linkedBusiness: null }, // User association remains
        { new: true }
      );
      if (!stand) return res.status(404).json({ message: "Stand not found." });
      res.status(200).json({ message: "Stand reset successfully.", stand });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },
  
  async unlinkStand(req, res) {
    try {
      const { standId } = req.params;
      const stand = await Stand.findOneAndUpdate(
        { standId },
        { status: "unlinked", linkedBusiness: null }, 
        { new: true }
      );
      if (!stand) return res.status(404).json({ message: "Stand not found." });
      res.status(200).json({ message: "Stand unlinked successfully.", stand });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },
  

  async linkStandToBusiness(req, res) {
    try {
      const { standId } = req.params;
      const { businessId } = req.body; 
      const stand = await Stand.findOneAndUpdate(
        { standId },
        { linkedBusiness: businessId, status: "linked" },
        { new: true }
      );
      if (!stand) return res.status(404).json({ message: "Stand not found." });
      res.status(200).json({ message: "Stand linked successfully.", stand });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },
  async getStandById(req, res) {
    try {
      const { standId } = req.params;
      
      const stand = await Stand.findOne({_id: standId}).populate("linkedBusiness user");
      if (!stand) return res.status(404).json({ message: "Stand not found." });
      res.status(200).json({ message: "Stand found.", stand });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },

  async getAllStands(req, res) {
    try {
      // Fetch all stands from the database
      const stands = await Stand.find();
  
      if (!stands.length) {
        return res.status(404).json({ message: "No stands found." });
      }
  
      res.status(200).json({
        message: "Stands retrieved successfully.",
        stands,
      });
    } catch (error) {
      console.error("Error fetching stands:", error);
      res.status(500).json({ message: "Server error", error });
    }
  },
  async getAllStandsUsingPaging(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query; // Pagination parameters with defaults
  
      const totalStands = await Stand.countDocuments();
      const stands = await Stand.find()
        .sort({ createdAt: -1 }) // Sort by creation date (latest first)
        .skip((page - 1) * limit) // Skip documents for pagination
        .limit(parseInt(limit)) // Limit the number of results
        .populate("linkedBusiness user"); // Populate references
  
      // Convert qrCodeData to base64 before returning to the client
      const standsWithBase64QR = stands.map(stand => {
        if (stand.qrCode) {
         
            stand.qrCode = stand.qrCode.toString('base64'); 
        
        }
        return stand;
      });
  
      res.status(200).json({
        data: standsWithBase64QR,
        pagination: {
          total: totalStands,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalStands / limit),
        },
      });
    } catch (error) {
      console.error("Error fetching stand reports:", error);
      res.status(500).json({ message: "Server error", error });
    }
  }
  

  
};
