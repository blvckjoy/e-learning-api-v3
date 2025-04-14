const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
   title: {
      type: String,
      required: true,
   },
   description: String,
   instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
   },
   duration: {
      type: String,
      required: true,
   },
   price: {
      type: Number,
      required: true,
   },
   students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("Course", CourseSchema);
