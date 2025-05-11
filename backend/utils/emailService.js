const sgMail = require('@sendgrid/mail');

/**
 * Send email using SendGrid
 * @param {Object} options - Email options including recipient, subject, and message
 */
const sendEmail = async (options) => {
  try {
    // Set SendGrid API Key
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // Define the email
    const msg = {
      to: options.email,
      from: 'noreply@tnmigrantportal.gov.in', // Use your verified sender in SendGrid
      subject: options.subject,
      text: options.message,
      html: options.html || options.message.replace(/\n/g, '<br>')
    };

    // Send the email
    await sgMail.send(msg);
    console.log(`Email sent to ${options.email}`);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    if (error.response) {
      console.error(error.response.body);
    }
    // For development, don't throw the error - return false instead
    return false;
  }
};

module.exports = sendEmail;
