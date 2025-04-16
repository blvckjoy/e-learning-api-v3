const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authRouter = express.Router();

// Get all users
authRouter.get("/", async (req, res) => {
   const users = await User.find();
   res.json(users);
});

// Sign Up
authRouter.post("/signup", async (req, res) => {
   try {
      const { name, email, password, role } = req.body;
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ message: "User already exists" });

      user = new User({ name, email, password, role });
      await user.save();

      res.status(201).json({
         message: "User created successfully",
         user: user,
      });
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

module.exports = authRouter;
