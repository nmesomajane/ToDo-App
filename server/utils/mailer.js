import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',   // or 'outlook', or use SMTP host/port
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, 
  }
});

const sendOverdueEmail = async (toEmail, taskTitle) => {
  await transporter.sendMail({
    from: `"Todo App" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Task overdue',
    html: `<p>Your task <strong>${taskTitle}</strong> is now overdue.</p>`
  });
};

module.exports = { sendOverdueEmail };