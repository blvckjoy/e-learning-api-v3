const express = require("express");
const Course = require("../models/Course");
const verifyToken = require("../middlewares/auth");
const mongoose = require("mongoose");

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

// Enroll Student
courseRouter.post("/:courseId/enroll", verifyToken, async (req, res) => {
   try {
      // Check if authenticator is a student
      if (req.user.role !== "student")
         return res
            .status(403)
            .json({ message: "Only students can enroll in courses" });

      // Validate courseID = MongoDB objectId format
      if (!mongoose.Types.ObjectId.isValid(req.params.courseId))
         return res.status(400).json({ message: "Invalid ID format" });

      const course = await Course.findById(req.params.courseId);
      if (!course)
         return res.status(404).json({ message: "Course Not Found!" });

      if (course.students.includes(req.user.id))
         return res
            .status(400)
            .json({ message: "Already enroll to this course" });

      course.students.push(req.user.id);
      await course.save();

      res.status(201).json({
         message: "Enrolled successfully",
         course: course,
      });
   } catch (error) {
      console.error("Error enrolling student:", error);
      res.status(500).json({ message: "Internal Server Error" });
   }
});

// Update course (Only instructor)
courseRouter.patch("/:courseId", verifyToken, async (req, res) => {
   if (req.user.role !== "instructor")
      return res.status(403).json({ message: "Forbidden" });

   if (!mongoose.Types.ObjectId.isValid(req.params.courseId))
      return res.status(400).json({ message: "Invalid ID format" });

   const course = await Course.findById(req.params.courseId);
   if (!course) return res.status(404).json({ message: "Course Not Found" });

   const { title, description, duration, price } = req.body;
   const updatedCourse = await Course.findByIdAndUpdate(
      req.params.courseId,
      { ...req.body },
      { new: true }
   );

   res.status(200).json({
      message: "Course updated successfully",
      course: updatedCourse,
   });
});

module.exports = courseRouter;
