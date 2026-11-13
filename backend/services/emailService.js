
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

const sendMagicLinkEmail = async (email, magicLink) => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error("Gmail SMTP credentials are missing.");
  }

  return transporter.sendMail({
    from: `"ClientLocker" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Your ClientLocker Login Link",
    text: `Use this link to log in to ClientLocker:\n\n${magicLink}\n\nThis link expires in 15 minutes and can only be used once.\n\nIf you did not request this link, ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>ClientLocker Login</h2>
        <p>You requested a secure login link.</p>
        <a href="${magicLink}"
           style="background:#2563eb;color:white;padding:12px 20px;
           text-decoration:none;border-radius:6px;">
           Log in to ClientLocker
        </a>
        <p>This link expires in 15 minutes and works only once.</p>
        <p>If you did not request this link, ignore this email.</p>
      </div>
    `
  });
};

module.exports = {
  sendMagicLinkEmail
};
