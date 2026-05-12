const nodemailer = require('nodemailer');
const { Resend } = require('resend');

// Use Resend for production (Vercel), nodemailer for local dev
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Sender address: use verified Resend domain in production, Gmail locally
const getFromAddress = () => {
  if (resend) {
    // Resend requires a verified domain, or use 'onboarding@resend.dev' for testing
    return process.env.RESEND_FROM_EMAIL || 'CricBuddy <onboarding@resend.dev>';
  }
  return `"CricBuddy" <${process.env.EMAIL_USER}>`;
};

const sendOTPEmail = async (email, otp) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #2c3e50; text-align: center;">Welcome to CricBuddy!</h2>
      <p style="font-size: 16px; color: #34495e;">Thank you for signing up. Please use the OTP below to verify your email address:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; color: #2ecc71; letter-spacing: 5px; background: #f9f9f9; padding: 10px 20px; border-radius: 5px; border: 1px dashed #2ecc71;">${otp}</span>
      </div>
      <p style="font-size: 14px; color: #7f8c8d; text-align: center;">This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #95a5a6; text-align: center;">© 2026 CricBuddy. Play hard, play fair.</p>
    </div>
  `;

  try {
    if (resend) {
      // Production: Use Resend API (works on Vercel serverless)
      await resend.emails.send({
        from: getFromAddress(),
        to: [email],
        subject: 'Your OTP for CricBuddy Signup',
        html: htmlContent
      });
      console.log('OTP email sent via Resend to:', email);
    } else {
      // Local dev: Use nodemailer/Gmail SMTP
      await transporter.sendMail({
        from: getFromAddress(),
        to: email,
        subject: 'Your OTP for CricBuddy Signup',
        html: htmlContent
      });
      console.log('OTP email sent via Nodemailer to:', email);
    }
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};

const sendWelcomeEmail = async (email, name) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #2c3e50; text-align: center;">You're in, ${name}!</h2>
      <p style="font-size: 16px; color: #34495e;">Welcome to CricBuddy. Your profile is now verified and ready to go.</p>
      <p style="font-size: 16px; color: #34495e;">Start discovering matches near you and connect with other cricket enthusiasts.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="background-color: #2ecc71; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Dashboard</a>
      </div>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #95a5a6; text-align: center;">© 2026 CricBuddy. Play hard, play fair.</p>
    </div>
  `;

  try {
    if (resend) {
      await resend.emails.send({
        from: getFromAddress(),
        to: [email],
        subject: 'Welcome to the Squad! 🏏',
        html: htmlContent
      });
      console.log('Welcome email sent via Resend to:', email);
    } else {
      await transporter.sendMail({
        from: getFromAddress(),
        to: email,
        subject: 'Welcome to the Squad! 🏏',
        html: htmlContent
      });
      console.log('Welcome email sent via Nodemailer to:', email);
    }
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error for welcome email as the user is already created
  }
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail
};
