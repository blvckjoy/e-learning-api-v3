const transporter = require("./mailer");

async function sendEmail(to, subject, htmlContent) {
   try {
      const info = await transporter.sendMail({
         from: `E-Learning <${process.env.EMAIL_USERNAME}>`,
         to,
         subject,
         html: htmlContent,
      });
      console.log("Email Sent", info.messageId);
   } catch (error) {
      console.error("Error sending email:", error);
   }
}

module.exports = { sendEmail };
