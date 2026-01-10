const SibApiV3Sdk = require('sib-api-v3-sdk');
require('dotenv').config();

// 1. Brevo Client Setup
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

async function sendConfirmationEmail(registrationData, qrCodeDataURL) {
  const { name, email, event, registrationCode } = registrationData;

  // 2. Prepare Email Data
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.subject = `Registration Confirmed - ${event.title}`;
  sendSmtpEmail.sender = { "name": "Event Team", "email": process.env.EMAIL_FROM };
  sendSmtpEmail.to = [{ "email": email, "name": name }];
  
  sendSmtpEmail.htmlContent = `
    <html>
      <body>
        <h2>🎉 Registration Confirmed!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for registering for <strong>${event.title}</strong>.</p>
        <p><strong>Your Registration Code:</strong> ${registrationCode}</p>
        <p>Please find your QR code attached below.</p>
        <br>
        <img src="${qrCodeDataURL}" alt="QR Code" style="width: 200px; height: 200px;"/>
        <p>See you at the event!</p>
      </body>
    </html>
  `;

  // 3. Attach QR Code
  // Base64 string se "data:image/png;base64," hatana padta hai
  const base64Content = qrCodeDataURL.split("base64,")[1];
  
  sendSmtpEmail.attachment = [
    {
      "content": base64Content,
      "name": "qrcode.png"
    }
  ];

  try {
    console.log(`📨 Sending email via Brevo API to ${email}...`);
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Email sending error:', error.response ? error.response.text : error);
    return false;
  }
}

module.exports = { sendConfirmationEmail };