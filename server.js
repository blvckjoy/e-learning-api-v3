require("dotenv").config();
const express = require("express");
const connectDB = require("./src/config/db");
const PORT = process.env.PORT;

connectDB;

const app = express();
app.use(express.json());

const authRouter = require("./src/routes/auth");
const courseRouter = require("./src/routes/courses");

app.use("/users", authRouter);
app.use("/courses", courseRouter);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
