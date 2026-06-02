const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendEmail = async ({ to, subject, text, attachments }) => {
  await transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject,
    text,
    attachments,
  });
};