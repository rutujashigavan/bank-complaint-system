const nodemailer = require("nodemailer");

console.log(process.env.EMAIL_USER);
console.log(process.env.EMAIL_PASS);


const sendEmail = async (to, subject, message) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"Secure Bank" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text: message
  });
};

module.exports = sendEmail;