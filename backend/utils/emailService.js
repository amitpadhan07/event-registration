const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp.googlemail.com', // 👈 TRICK 1: Google ka alternate host address
  port: 465,                   // 👈 TRICK 2: Port 465 wapis use kar rahe hain
  secure: true,                // 👈 465 ke liye ye true hona chahiye
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  family: 4,                   // 👈 Force IPv4 (Ye zaroori hai)
  pool: true,                  // 👈 Connection pool on kiya stability ke liye
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 30000,    // 30 seconds timeout
  greetingTimeout: 30000,
  debug: true,                 // Logs on rahenge
  logger: true
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
    console.log(`📨 Attempting to send email to ${email} via smtp.googlemail.com...`);
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Email sending error details:', error);
    return false;
  }
}

module.exports = { sendConfirmationEmail };