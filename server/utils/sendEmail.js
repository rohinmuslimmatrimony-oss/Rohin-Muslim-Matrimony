const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Safe Guard: If credentials are not set or left as placeholder, log output and return
  if (
    !process.env.EMAIL_USER || 
    process.env.EMAIL_USER === 'your-smtp-email@domain.com' || 
    !process.env.EMAIL_PASS
  ) {
    console.log(`\n--- 📬 [Transactional Mail System] ---`);
    console.log(`To:      ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Content: ${options.html.replace(/<[^>]*>/g, ' ')}`); // Strip HTML tags for clean log view
    console.log(`---------------------------------------\n`);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true', // true for port 465, false for 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Rohin Muslim Matrimony" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully: ${info.messageId}`);
  } catch (error) {
    console.error('Error sending transactional email:', error.message);
  }
};

module.exports = sendEmail;
