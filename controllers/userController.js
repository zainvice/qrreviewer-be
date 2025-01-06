// controllers/UserController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Stand = require("../models/Stand");
const sendEmail = require("../utils/email");
const generateOTP = require("../utils/otp");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name, stands: user.stands },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const UserController = {

  register: async (req, res) => {
    try {
      const { email, password, name, standId } = req.body;
  

      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create the user with the hashed password
      const user = await User.create({ email, password: hashedPassword, name });
  
      // If standId is provided, associate the stand with the user
      if (standId) {
        const stand = await Stand.findOneAndUpdate(
          { _id: standId },
          { user: user._id }, // Link the user to the stand
          { new: true }
        );
       
        if (!stand) return res.status(404).json({ message: "Stand not found." });
        user.stands.push(stand._id)
        user.save()
      }
      const token = generateToken(user);

      res.status(201).json({ message: "User registered successfully.", user, token });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },
  

  // Login a user
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found." });

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) return res.status(401).json({ message: "Invalid credentials." });

      const token = generateToken(user);
      res.status(200).json({ message: "Login successful.", token, user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error logging in." });
    }
  },

  requestOtp: async (req, res) => {
    try {
      const { email, name } = req.body;
      const otp = generateOTP();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 mins

      let user = await User.findOne({ email });
      if (!user) {
        // If new user, create an account
        user = await User.create({ email, name, otp, otpExpiresAt });
      } else {
        // Update OTP for existing user
        user.otp = otp;
        user.otpExpiresAt = otpExpiresAt;
        await user.save();
      }

      // Send OTP via email
      await sendEmail(email, "Your OTP for Login/Signup", `Your OTP is: ${otp}`);
      res.status(200).json({ message: "OTP sent to your email." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error });
    }
  },

  // Verify OTP for signup/login
  verifyOtp: async (req, res) => {
    try {
      const { email, otp } = req.body;
      const user = await User.findOne({ email }).select("otp otpExpiresAt stands role");

      if (!user || user.otp !== otp || user.otpExpiresAt < new Date()) {
        return res.status(400).json({ message: "Invalid or expired OTP." });
      }

      // Clear OTP after successful verification
      user.otp = null;
      user.otpExpiresAt = null;
      await user.save();

      // Handle user-stand association (e.g., via QR link)
      if (req.body.standId) {
        const stand = await Stand.findOneAndUpdate(
          { standId: req.body.standId },
          { user: user._id },
          { new: true }
        );
        if (!stand) return res.status(404).json({ message: "Stand not found." });
      }

      res.status(200).json({
        message: "Authentication successful.",
        user: { id: user._id, email: user.email, role: user.role, stands: user.stands },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error });
    }
  },
  // Get user profile
  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select("-password");
      if (!user) return res.status(404).json({ message: "User not found." });

      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching profile." });
    }
  },

  // Update user details
  updateProfile: async (req, res) => {
    try {
      const { name, password } = req.body;

      const updatedData = {};
      if (name) updatedData.name = name;
      if (password) updatedData.password = await bcrypt.hash(password, 10);

      const user = await User.findByIdAndUpdate(req.email, updatedData, { new: true }).select("-password");
      res.status(200).json({ message: "Profile updated successfully.", user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating profile." });
    }
  },

  // Admin: Get all users
  getAllUsers: async (req, res) => {
    try {
      if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied." });

      const users = await User.find().select("-password");
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching users." });
    }
  },

  // Admin: Delete a user
  deleteUser: async (req, res) => {
    try {
      if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied." });

      const { id } = req.params;
      await User.findByIdAndDelete(id);

      res.status(200).json({ message: "User deleted successfully." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error deleting user." });
    }
  },
  // Admin: Create a new admin
  createAdmin: async (req, res) => {
    try {
      
      // Extract the new admin details from the request body
      const { email, password, name } = req.body;

      // Check if the email already exists
      const existingAdmin = await User.findOne({ email });
      if (existingAdmin) {
        return res.status(400).json({ message: "Admin with this email already exists." });
      }

      // Create the new admin user
      const hashedPassword = await bcrypt.hash(password, 10);
      const newAdmin = await User.create({
        email,
        password: hashedPassword,
        name,
        role: "admin", 
      });

      res.status(201).json({ message: "Admin created successfully.", newAdmin });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error creating admin." });
    }
  },
};

module.exports = UserController;
