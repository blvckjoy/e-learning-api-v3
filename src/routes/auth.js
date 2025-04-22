const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validateUser } = require("../validators/userValidation");
const authMiddleware = require("../middlewares/auth");
const { authRole } = require("../middlewares/authRole");
const { sendEmail } = require("../utils/sendEmail");
const crypto = require("crypto");
const { format } = require("path");
require("dotenv").config();

const authRouter = express.Router();

// Get all users
authRouter.get(
   "/",
   authMiddleware,
   authRole("instructor"),
   async (req, res) => {
      const users = await User.find();
      res.json(users);
   }
);

// Sign Up
authRouter.post("/signup", async (req, res) => {
   try {
      const { error } = validateUser(req.body);
      if (error) return res.status(400).send(error.details[0].message);

      const { name, email, password, role } = req.body;
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ message: "User already exists" });

      user = new User({ name, email, password, role });
      await user.save();

      res.status(201).json({
         message: "User created successfully",
         user: user,
      });

      if (user.role === "instructor")
         sendEmail(
            user.email,
            `Welcome ${user.name}`,
            "Your instructor account has been created successfully"
         );
      else if (user.role === "student")
         sendEmail(
            user.email,
            `Welcome ${user.name}`,
            "Your student account has been created successfully"
         );
   } catch (error) {
      console.error("Error creating a new user:", error);
      res.status(500).json({ message: "Internal Server Error" });
   }
});

// Login
authRouter.post("/login", async (req, res) => {
   try {
      const { email, password } = req.body;
      const validUser = await User.findOne({ email });
      if (!validUser)
         return res.status(404).json({ message: "User Not Found!" });

      const validPass = await bcrypt.compare(password, validUser.password);
      if (!validPass)
         return res.status(400).json({ message: "Invalid credentials" });

      const token = jwt.sign(
         { id: validUser._id, role: validUser.role },
         process.env.ACCESS_TOKEN_SECRET,
         {
            expiresIn: "2h",
         }
      );
      res.json({ token });
   } catch (error) {
      console.error("Error signing in user:", error);
      res.status(500).json({ message: "Internal Server Error" });
   }
});

// Forgot password
authRouter.post("/forgot-password", async (req, res) => {
   try {
      const { email } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found" });

      // Generate a reset token that expires in 30mins
      const resetToken = crypto.randomBytes(24).toString("hex");
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpiry = Date.now() + 30 * 60 * 1000; // Resets in 30mins

      await user.save();

      // Dynamically construct the reset URL based on the request
      const resetURL = `${process.env.APP_URL}/api/auth/reset-password/${resetToken}`;
      const message =
         `Hello ${user.name || "there"},\n\n` +
         `You requested a password reset. Click the link below to reset your password:\n\n` +
         `${resetURL}\n\n` +
         `This link will expire in 30 minutes.`;

      // Send a reset email
      await sendEmail(user.email, "Password Reset Request", message);

      res.status(200).json({ message: "Password reset email has been sent" });
   } catch (error) {
      console.error("Forgot password error", error);
      res.status(500).json({ message: "Failed to send reset email" });
   }
});

// Reset password
authRouter.post("/reset-password/:resetToken", async (req, res) => {
   try {
      const { resetToken } = req.params;
      const { newPassword } = req.body;

      // Find user with a valid, non-expired reset token
      const user = await User.findOne({
         resetPasswordToken: resetToken,
         resetPasswordExpiry: { $gt: Date.now() },
      });
      if (!user)
         return res.status(400).json({ message: "Invalid or expired token" });

      // Check if the token has expired
      if (user.resetPasswordExpiry < Date.now())
         return res.status(400).json({ message: "Token has expired" });

      // Update password with a hashed password for security and clear reset fields
      user.password = await bcrypt.hash(newPassword, 10);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpiry = undefined;
      await user.save();

      // Send a confirmation email
      const currentTime = format(new Date(), "MMMM, d, yyyy, h:mm a"); // e.g., "April 22, 2025, 10:30 AM"
      const message =
         `Hello ${user.name || "there"},\n\n` +
         `Your password was successfully reset on ${currentTime}.\n` +
         `If you did not initiate this change, please contact us on support@email.com.\n\n` +
         `Best regards,\nThe Team`;

      await sendEmail(user.email, "Password Reset Confirmation", message);

      res.status(200).json({ message: "Password has been reset successfully" });
   } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Internal Server Error" });
   }
});

module.exports = authRouter;
