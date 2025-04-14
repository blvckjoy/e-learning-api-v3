const express = require("express");
const Course = require("../models/Course");
const verifyToken = require("../middlewares/auth");

const courseRouter = express.Router();

// Get all courses
courseRouter.get("/", async (req, res) => {
   const courses = await Course.find();
   res.json(courses);
});

// Create Course (Only instructor)
courseRouter.post("/", verifyToken, async (req, res) => {
   try {
      if (req.user.role !== "instructor")
         return res.status(403).json({ message: "Forbidden" });

      const { title, description, duration, price } = req.body;
      const course = new Course({
         title,
         description,
         duration,
         price,
         instructor: req.user.id,
      });
      await course.save();

      res.status(201).json({
         message: "Course created successfully",
         course: course,
      });
   } catch (error) {
      console.error("Error creating a course:", error);
      res.status(500).json({ message: "Internal Server Error" });
   }
});

module.exports = courseRouter;
