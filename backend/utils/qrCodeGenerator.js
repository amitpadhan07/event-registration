const QRCode = require('qrcode');

async function generateQRCode(registrationCode) {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(registrationCode, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
}

module.exports = { generateQRCode };