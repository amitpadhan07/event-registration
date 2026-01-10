const nodemailer = require('nodemailer');
require('dotenv').config();

// Configure Transporter for Port 587 (Standard Cloud Email Port)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,              // 👈 Changing to 587 (More reliable on Cloud)
  secure: false,          // 👈 587 ke liye ye FALSE hona chahiye
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  family: 4,              // 👈 Force IPv4 (Connection drop fix)
  tls: {
    rejectUnauthorized: false
  },
  // 👇 Stability & Debug Settings
  connectionTimeout: 20000, // 20 seconds
  greetingTimeout: 20000,
  socketTimeout: 20000,
  debug: true,            // 👈 Logs mein detailed error dikhayega
  logger: true            // 👈 Console mein print karega
});

async function sendConfirmationEmail(registrationData, qrCodeDataURL) {
  const { name, email, event, registrationCode } = registrationData;

  const mailOptions = {
    from: `"Event Registration" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Registration Confirmed - ${event.title}`,
    html: `
      <h2>🎉 Registration Confirmed!</h2>
      <p>Hi ${name},</p>
      <p>Thank you for registering for <strong>${event.title}</strong>.</p>
      <p><strong>Your Registration Code:</strong> ${registrationCode}</p>
      <p>Please find your QR code attached below.</p>
      <br>
      <img src="${qrCodeDataURL}" alt="QR Code" style="width: 200px; height: 200px;"/>
      <br>
      <p>See you at the event!</p>
    `,
    attachments: [
      {
        filename: 'qrcode.png',
        content: qrCodeDataURL.split("base64,")[1],
        encoding: 'base64'
      }
    ]
  };

  try {
    console.log(`📨 Attempting to send email to ${email} via Port 587...`);
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Email sending error details:', error);
    return false;
  }
}

module.exports = { sendConfirmationEmail };