const nodemailer = require('nodemailer');

// 👇 YAHAN APNI DETAILS DAAL CHECK KARNE KE LIYE 👇
const MY_EMAIL = 'padhanamit072006@gmail.com';         // Apna Gmail yahan likh
const MY_PASSWORD = 'kbhn tabg lfxk ctfw'; // Apna App Password yahan likh

async function checkLogin() {
  console.log('🔄 Checking credentials...');

  // Transporter setup
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // 587 ke liye false hi rakhna
    auth: {
      user: MY_EMAIL,
      pass: MY_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false // Local testing ke liye help karta hai
    },
    connectionTimeout: 10000 // 10 second wait karega
  });

  try {
    // 1. Sirf Login Check karega
    await transporter.verify();
    console.log('✅ LOGIN SUCCESS! Tera Email aur Password 100% sahi hai.');

    // 2. Ek Test Email bhejega khud ko
    console.log('📨 Sending test email...');
    await transporter.sendMail({
      from: MY_EMAIL,
      to: MY_EMAIL, // Khud ko hi bhej raha hai
      subject: "Test Mail - Login Verified",
      text: "Badhai ho! Tera email setup bilkul sahi chal raha hai.",
    });

    console.log('✅ EMAIL SENT! Inbox check kar le.');

  } catch (error) {
    console.error('❌ LOGIN FAILED!');
    console.error('Error Details:', error.message);

    if (error.code === 'EAUTH') {
      console.log('👉 Gadbad: Password galat hai ya App Password use nahi kiya.');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('👉 Gadbad: Internet slow hai ya Port block hai.');
    }
  }
}

checkLogin();