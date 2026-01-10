const nodemailer = require('nodemailer');
require('dotenv').config();

// 👇 Sirf 'service: gmail' use karenge, ye automatic best settings le lega
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // App Password hi hona chahiye
  },
  // Extra stability settings
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000
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
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Email sending error:', error);
    return false;
  }
}

module.exports = { sendConfirmationEmail };