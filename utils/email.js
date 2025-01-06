const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: `Invito AI ${process.env.EMAIL_USER}`,
    to,
    subject,
    text,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
