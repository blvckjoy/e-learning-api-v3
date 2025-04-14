const express = require("express");
const Course = require("../models/Course");

const courseRouter = express.Router();

// Get all courses
courseRouter.get("/", async (req, res) => {
   const courses = await Course.find();
   res.json(courses);
});

module.exports = courseRouter;
