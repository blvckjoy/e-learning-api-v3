require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
   service: "gmail",
   auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
   },
});

transporter.verify((error, success) => {
   if (error) {
      console.error("Mailer connection error:", error);
   } else {
      console.log("Mailer is ready to send messages", success);
   }
});

module.exports = transporter;
