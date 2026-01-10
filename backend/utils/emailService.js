const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Service 'gmail' hata ke direct host use kar rahe hain
  port: 465,              // SSL Port
  secure: true,           // SSL ON
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  // 👇 YE HAI MAGIC FIX (Force IPv4) 👇
  family: 4, 
  // 👇 Stability Settings
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 15000, // Thoda timeout aur badha diya (15s)
  greetingTimeout: 15000
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
    console.log(`📨 Attempting to send email to ${email}...`);
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Email sending error:', error);
    return false;
  }
}

module.exports = { sendConfirmationEmail };