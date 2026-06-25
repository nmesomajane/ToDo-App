
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, 
  },
});

/**
 * Notify a user that their task is now overdue.
 */
export const sendOverdueEmail = async (toEmail, taskTitle, dueDate) => {
  const formattedDate = new Date(dueDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  await transporter.sendMail({
    from: `"Todo App" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: ` Task overdue: ${taskTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #ef4444;">Task Overdue</h2>
        <p>Your task <strong>${taskTitle}</strong> was due on <strong>${formattedDate}</strong> and has not been completed.</p>
        <p>Log in to update or dismiss it.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="font-size: 12px; color: #9ca3af;">You received this because you are a Todo App user.</p>
      </div>
    `,
  });
};

/**
 * Notify a user that their task has been completed.
 */
export const sendCompletedEmail = async (toEmail, taskTitle) => {
  await transporter.sendMail({
    from: `"Todo App" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: ` Task completed: ${taskTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #22c55e;">Task Completed</h2>
        <p>Great work! Your task <strong>${taskTitle}</strong> has been marked as completed.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="font-size: 12px; color: #9ca3af;">You received this because you are a Todo App user.</p>
      </div>
    `,
  });
};