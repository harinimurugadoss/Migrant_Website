const nodemailer = require('nodemailer');

/**
 * Send email using nodemailer
 * @param {Object} options - Email options including recipient, subject, and message
 */
const sendEmail = async (options) => {
  // Get email configurations from environment variables
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER || 'tnmigrantportal@gmail.com';
  const pass = process.env.SMTP_PASSWORD || 'defaultpassword';
  const from = process.env.FROM_EMAIL || 'TN Migrant Portal <tnmigrantportal@gmail.com>';

  // Create transporter
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass
    }
  });

  // Define email options
  const mailOptions = {
    from,
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  // Send email
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${options.email}`);
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Email could not be sent');
  }
};

module.exports = sendEmail;
