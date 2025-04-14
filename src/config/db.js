const mongoose = require("mongoose");
require("dotenv").config();

mongoose
   .connect(process.env.MONGODB_URI)
   .then(() => console.log("Connected to Database"))
   .catch((error) => {
      console.error("Connection Failed!", error);
      process.exit(1); // Exit the process if database connection fails
   });

module.exports = mongoose;
