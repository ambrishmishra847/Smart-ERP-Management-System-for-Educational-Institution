import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // eslint-disable-next-line no-console
    console.log('Initializing Nodemailer transporter...');
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    transporter.verify((error, success) => {
      if (error) {
        console.error('SMTP connection failed:', error);
      } else {
        console.log('SMTP server ready to send emails');
      }
    });
  }
  return transporter;
};

/**
 * Send email. No-op if email not configured.
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  const trans = getTransporter();
  if (!trans) return;
  try {
    console.log('Preparing to send email...');
    console.log('Recipient:', to);
    console.log('Subject:', subject);
    await trans.sendMail({
      from: process.env.EMAIL_FROM || 'Smart ERP <noreply@smart-erp.com>',
      to,
      subject,
      text: text || html,
      html: html || text,
    }).then((info) => {
      console.log('Email sent successfully:', info.messageId || info);
    });
  } catch (err) {
    console.error('Email send error:', err.message);
  }
};

export const sendAssignmentEmail = async (students, assignment) => {
  const subject = `New Assignment: ${assignment.title}`;
  const text = `Assignment: ${assignment.title}\nDescription: ${assignment.description || 'N/A'}\nDeadline: ${assignment.deadline}`;
  const html = `<h2>Smart ERP Notification</h2>
<p><strong>New Assignment Uploaded</strong></p>
<p><strong>Title:</strong> ${assignment.title}</p>
<p><strong>Description:</strong> ${assignment.description || 'N/A'}</p>
<p><strong>Deadline:</strong> ${assignment.deadline}</p>`;
  for (const s of students) {
    if (s.userId?.email) {
      await sendEmail({ to: s.userId.email, subject, text, html });
    }
  }
};

export const sendResultPublishedEmail = async (studentEmail, subjectName) => {
  await sendEmail({
    to: studentEmail,
    subject: 'Results Published',
    text: `Results for ${subjectName} have been published. Check your dashboard.`,
    html: `<h2>Smart ERP Notification</h2>
<p>Results for <strong>${subjectName}</strong> have been published. Please check your dashboard.</p>`,
  });
};

export const sendFeeReminderEmail = async (studentEmail, amount, dueDate) => {
  await sendEmail({
    to: studentEmail,
    subject: 'Fee Reminder',
    text: `Reminder: Fee of ${amount} is due on ${dueDate}. Please pay at the earliest.`,
    html: `<h2>Smart ERP Notification</h2>
<p>This is a reminder that a fee of <strong>${amount}</strong> is due on <strong>${dueDate}</strong>. Please pay at the earliest.</p>`,
  });
};

export const sendAnnouncementEmail = async (emails, notice) => {
  const subject = `Announcement: ${notice.title}`;
  const text = notice.description || notice.title;
  const html = `<h2>Smart ERP Notification</h2>
<p><strong>New Announcement from Smart ERP</strong></p>
<p><strong>Title:</strong> ${notice.title}</p>
<p><strong>Message:</strong> ${notice.description || notice.title}</p>
<p><strong>Date:</strong> ${notice.date || notice.createdAt || new Date().toISOString()}</p>`;
  for (const email of emails) {
    await sendEmail({ to: email, subject, text, html });
  }
};

export const sendPlacementEmail = async (emails, placement) => {
  const subject = `New Placement Drive: ${placement.companyName}`;
  const text = `Company: ${placement.companyName}\nRole: ${placement.role}\nDeadline: ${placement.deadline}\nRegistration: ${placement.registrationLink}`;
  const html = `<h2>Smart ERP Notification</h2>
<p><strong>New Placement Drive Posted</strong></p>
<p><strong>Company:</strong> ${placement.companyName}</p>
<p><strong>Role:</strong> ${placement.role}</p>
<p><strong>Deadline:</strong> ${placement.deadline}</p>
<p><strong>Registration Link:</strong> <a href="${placement.registrationLink}">${placement.registrationLink}</a></p>`;
  for (const email of emails) {
    await sendEmail({ to: email, subject, text, html });
  }
};
