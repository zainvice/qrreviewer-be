const express = require("express");
const router = express.Router();
const { authenticate, isAdmin } = require("../middlewares/authMiddleware");
const UserController = require("../controllers/UserController");

router.post("/register", UserController.register);


router.post("/login", UserController.login);

router.post("/request-otp", UserController.requestOtp);

router.post("/verify-otp", UserController.verifyOtp);

router.post("/create-admin", UserController.createAdmin);

router.get("/profile", authenticate, UserController.getProfile);

router.put("/profile", authenticate, UserController.updateProfile);


router.get("/admin/all", authenticate, isAdmin, UserController.getAllUsers);


router.delete("/admin/delete/:id", authenticate, isAdmin, UserController.deleteUser);

module.exports = router;
