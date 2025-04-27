const express = require("express");
const Course = require("../models/Course");
const authMiddleware = require("../middlewares/auth");
const { authRole } = require("../middlewares/authRole");
const { sendEmail } = require("../utils/sendEmail");
const mongoose = require("mongoose");
const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

const courseRouter = express.Router();

// Get all courses
courseRouter.get("/", async (req, res) => {
   const courses = await Course.find().populate("instructor", "name");
   res.json(courses);
});

// Create Course (Only instructor)
courseRouter.post(
   "/",
   authMiddleware,
   authRole("instructor"),
   async (req, res) => {
      try {
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
   }
);

// Enroll Student (Only student)
courseRouter.post(
   "/:courseId/enroll",
   authMiddleware,
   authRole("student"),
   async (req, res) => {
      try {
         // Validate courseID = MongoDB objectId format
         if (!mongoose.Types.ObjectId.isValid(req.params.courseId))
            return res.status(400).json({ message: "Invalid ID format" });

         const course = await Course.findById(req.params.courseId);
         if (!course)
            return res.status(404).json({ message: "Course Not Found!" });

         if (course.students.includes(req.user.id))
            return res
               .status(400)
               .json({ message: "Already enrolled to this course" });

         course.students.push(req.user.id);
         await course.save();

         res.status(201).json({
            message: "Enrolled successfully",
            course: course,
         });

         await sendEmail(
            req.user.email,
            "Enrollment confirmation!",
            "Thank you for enrolling to this course. Let's start learning"
         );
      } catch (error) {
         console.error("Error enrolling student:", error);
         res.status(500).json({ message: "Internal Server Error" });
      }
   }
);

// Update course (Only instructor)
courseRouter.patch(
   "/:courseId",
   authMiddleware,
   authRole("instructor"),
   async (req, res) => {
      if (!mongoose.Types.ObjectId.isValid(req.params.courseId))
         return res.status(400).json({ message: "Invalid ID format" });

      const course = await Course.findById(req.params.courseId);
      if (!course) return res.status(404).json({ message: "Course Not Found" });

      // Ensure the logged-in instructor owns the course
      if (course.instructor.toString() !== req.user.id)
         return res
            .status(403)
            .json({ message: "Forbidden: You do not own this course" });

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
   }
);

// Delete course (Only instructor)
courseRouter.delete(
   "/:courseId",
   authMiddleware,
   authRole("instructor"),
   async (req, res) => {
      try {
         if (!mongoose.Types.ObjectId.isValid(req.params.courseId))
            return res.status(400).json({ message: "Invalid ID format" });

         const course = await Course.findById(req.params.courseId);
         if (!course)
            return res.status(404).json({ message: "Course Not Found" });

         // Ensure the logged-in instructor owns the course
         if (course.instructor.toString() !== req.user.id)
            return res
               .status(403)
               .json({ message: "Forbidden: You do not own this course" });

         await Course.findByIdAndDelete(req.params.courseId);

         res.status(200).json({ message: "Course deleted successfully" });
      } catch (error) {
         console.error("Error deleting course:", error);
         res.status(500).json({ message: "Internal Server Error" });
      }
   }
);

const storage = new CloudinaryStorage({
   cloudinary: cloudinary,
   params: {
      folder: "course-media",
      format: ["png", "mp4", "pdf", "jpg"],
   },
});

const upload = multer({
   storage: storage,
   limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

// Upload course media (Only instructor)
courseRouter.post(
   "/:courseId/upload",
   authMiddleware,
   authRole("instructor"),
   upload.single("media"),
   async (req, res) => {
      if (!req.file)
         return res.status(400).json({ message: "No file uploaded" });

      res.json({
         message: "Media file uploaded successfully",
         file: req.file,
      });
   }
);

// Course Analytics (Only instructor)
courseRouter.get(
   "/analytics/summary",
   authMiddleware,
   authRole("instructor"),
   async (req, res) => {
      try {
         const totalCourses = await Course.countDocuments();
         const totalEnrollments = await Course.aggregate([
            {
               $unwind: "$students",
            },
            {
               $group: {
                  _id: "null",
                  total: { $sum: 1 },
               },
            },
         ]);

         res.json({
            totalCourses,
            totalEnrollments: totalEnrollments[0]
               ? totalEnrollments[0].total
               : 0,
         });
      } catch (error) {
         console.error("Analytic Error:", error);
         res.status(500).json({ message: "Internal Server Error" });
      }
   }
);

module.exports = courseRouter;
