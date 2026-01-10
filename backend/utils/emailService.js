const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  // 👇 Ye settings add ki hain stability ke liye
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000, // 10 seconds wait karega
  greetingTimeout: 10000
});

async function sendConfirmationEmail(registrationData, qrCodeDataURL) {
  const { name, email, event, registrationCode } = registrationData;

  const mailOptions = {
    from: `"Event Registration" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Registration Confirmed - ${event.title}`,
    html: `
      
      
      
        
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .qr-section { text-align: center; margin: 30px 0; padding: 20px; background: white; border-radius: 8px; }
          .qr-code { max-width: 250px; margin: 20px auto; }
          .registration-code { background: #667eea; color: white; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 2px; }
          .footer { text-align: center; color: #666; margin-top: 30px; font-size: 12px; }
        
      
      
        
          
            🎉 Registration Confirmed!
          
          
            Hi ${name},
            Thank you for registering! Your spot has been confirmed for the following event:
            
            
              📅 ${event.title}
              Date: ${new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              Time: ${event.event_time}
              Venue: ${event.venue}
            

            
              Your Entry QR Code
              Present this QR code at the event for check-in:
              
              Registration Code:
              ${registrationCode}
            

            Important:
            
              Save this email for event entry
              Arrive 15 minutes early for check-in
              Bring a valid ID
            

            We look forward to seeing you at the event!
            
            
              This is an automated confirmation email. Please do not reply.
              &copy; 2026 Event Registration System. All rights reserved.
            
          
        
      
      
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Email sending error:', error);
    // Error throw nahi karenge taaki server crash na ho, bas log karenge
    return false;
  }
}

module.exports = { sendConfirmationEmail };