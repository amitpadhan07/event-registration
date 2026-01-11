const SibApiV3Sdk = require('sib-api-v3-sdk');
require('dotenv').config();

// 1. Brevo Client Setup
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

async function sendConfirmationEmail(registrationData, qrCodeDataURL) {
  const { name, email, event, registrationCode } = registrationData;

  // Format Date (e.g., "Sun Feb 15 2026")
  const formattedDate = new Date(event.event_date).toDateString();

  // 👇 Generate Public QR URL (Reliable for Gmail)
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${registrationCode}`;

  // 2. Prepare Email Data
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.subject = `✅ Registration Confirmed - ${event.title}`;
  sendSmtpEmail.sender = { "name": "IEEE-SB GEHU", "email": process.env.EMAIL_FROM };
  sendSmtpEmail.to = [{ "email": email, "name": name }];
  
  // 👇 ADDED HEADER BACK + IEEE TEXT
  sendSmtpEmail.htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        
        /* 👇 THIS IS THE HEADER YOU MISSED */
        .header { background-color: #2c3e50; color: #ffffff; padding: 25px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 1px; }

        .content { padding: 30px; }
        .details { background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-left: 4px solid #2c3e50; }
        .qr-block { text-align: center; margin: 30px 0; padding: 20px; border: 1px dashed #ccc; border-radius: 8px; }
        .footer { font-size: 12px; color: #777; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        
        <div class="header">
          <h1>Registration Confirmed!</h1>
        </div>
        
        <div class="content">
          <p>Dear <strong>${name}</strong>,</p>
          
          <p>We are pleased to inform you that your registration for the IEEE event <strong>${event.title}</strong> has been successfully confirmed.</p>
          
          <div class="details">
            <p style="margin: 5px 0;"><strong>Event Date:</strong> ${formattedDate}</p>
            <p style="margin: 5px 0;"><strong>Event Time:</strong> ${event.event_time}</p>
            <p style="margin: 5px 0;"><strong>Venue:</strong> ${event.venue}</p>
            <p style="margin: 5px 0;"><strong>Registration Code:</strong> ${registrationCode}</p>
          </div>

          <p>Please present the QR code below at the venue for entry verification. This QR code serves as your official entry pass.</p>

          <div class="qr-block">
            <h3 style="margin-top: 0; color: #2c3e50;">Entry Pass (QR Code)</h3>
            <img src="${qrImageSrc}" alt="Entry QR Code" width="200" height="200" style="display:block; margin: 0 auto;" />
            <p style="font-size: 13px; color: #555; margin-top: 10px;">Kindly keep this QR code accessible on your device.</p>
          </div>

          <p>If you have any questions, feel free to contact the event coordination team.</p>
          
          <p>We look forward to welcoming you and hope you have a valuable learning experience.</p>
          
          <p>Sincerely,<br>
          <strong>IEEE-SB GEHU</strong></p>

          <div class="footer">
            <p>This is an automated message. Please do not reply directly to this email.</p>
            <p>&copy; ${new Date().getFullYear()} IEEE Student Branch GEHU</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;


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