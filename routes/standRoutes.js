const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/authMiddleware");
const StandController = require("../controllers/standController");
const BusinessController = require("../controllers/businessController")

router.get("/", authenticate, StandController.getAllStandsUsingPaging);

router.get("/:standId", authenticate, StandController.getStandDetails);
router.get("/stand/:standId", authenticate, StandController.getStandById);


router.get("/redirect/:standId", StandController.handleRedirection);


router.post("/generate-bulk", authenticate, StandController.generateBulk);


router.post("/reset/:standId", authenticate, StandController.resetStand);


router.post("/unlink/:standId", authenticate, StandController.unlinkStand);

router.post("/link/:standId", authenticate, BusinessController.linkBusinessToStand);

router.get("/stands", authenticate, StandController.getAllStands)

module.exports = router;
