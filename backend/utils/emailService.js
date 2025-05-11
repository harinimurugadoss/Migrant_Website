const sgMail = require('@sendgrid/mail');

/**
 * Send email using SendGrid
 * @param {Object} options - Email options including recipient, subject, and message
 */
const sendEmail = async (options) => {
  try {
    // Validate API key format
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey || !apiKey.startsWith('SG.')) {
      console.warn('Invalid SendGrid API key format. Email will not be sent.');
      console.log('Email that would have been sent:');
      console.log('To:', options.email);
      console.log('Subject:', options.subject);
      return false;
    }
    
    // Set SendGrid API Key
    sgMail.setApiKey(apiKey);

    // Define the email
    const msg = {
      to: options.email,
      from: 'tnmigrantportal@gmail.com', // Use your verified sender in SendGrid
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
