const express = require("express");
const User = require("../models/User");

const authRouter = express.Router();

// Get a user
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

module.exports = authRouter;
