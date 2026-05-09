import nodemailer from "nodemailer";
import Doctor from "../models/doctorModel.js";

/**
 * Send birthday reminder email to admin for upcoming doctor birthdays
 * @param {Array} doctors - Array of doctors with upcoming birthdays
 */
const sendBirthdayReminderEmail = async (doctors) => {
  try {
    if (!doctors || doctors.length === 0) {
      return;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // Format the doctor list for the email
    let doctorList = doctors.map((doctor, index) => {
      const birthDate = new Date(doctor.birthdate);
      const formattedDate = birthDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric'
      });

      return `${index + 1}. ${doctor.name}
   - Clinic: ${doctor.clinicName || 'N/A'}
   - Place: ${doctor.place || 'N/A'}
   - Birthday: ${formattedDate}
   - Phone: ${doctor.phone || 'N/A'}
   - Email: ${doctor.email || 'N/A'}`;
    }).join('\n\n');

    const emailSubject = `🎂 Upcoming Doctor Birthdays - ${doctors.length} Birthday${doctors.length > 1 ? 's' : ''} This Week`;

    const emailText = `Hello Admin,

This is a friendly reminder about upcoming doctor birthdays:

${doctorList}

Please consider sending them birthday wishes or gifts to maintain good relationships.

---
This is an automated reminder from MediTech Remedies System.
`;

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: process.env.ADMIN_MAIL,
      subject: emailSubject,
      text: emailText,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("❌ Failed to send birthday reminder email:", error.message);
  }
};

/**
 * Check for upcoming doctor birthdays and send reminder
 * Checks for birthdays in the next 7 days
 */
export const checkUpcomingBirthdays = async () => {
  try {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    // Get all doctors with birthdate
    const allDoctors = await Doctor.find({
      birthdate: { $exists: true, $ne: null }
    });

    // Filter doctors with birthdays in the next 7 days
    const upcomingBirthdays = allDoctors.filter(doctor => {
      const birthdate = new Date(doctor.birthdate);

      // Get birthday this year
      const birthdayThisYear = new Date(
        today.getFullYear(),
        birthdate.getMonth(),
        birthdate.getDate()
      );

      // If birthday already passed this year, check next year
      const birthdayToCheck = birthdayThisYear < today
        ? new Date(today.getFullYear() + 1, birthdate.getMonth(), birthdate.getDate())
        : birthdayThisYear;

      // Check if birthday is within the next 7 days
      return birthdayToCheck >= today && birthdayToCheck <= nextWeek;
    });

    if (upcomingBirthdays.length > 0) {
      // Sort by upcoming date
      upcomingBirthdays.sort((a, b) => {
        const dateA = new Date(today.getFullYear(), new Date(a.birthdate).getMonth(), new Date(a.birthdate).getDate());
        const dateB = new Date(today.getFullYear(), new Date(b.birthdate).getMonth(), new Date(b.birthdate).getDate());
        return dateA - dateB;
      });

      await sendBirthdayReminderEmail(upcomingBirthdays);
    } else {
    }
  } catch (error) {
    console.error("❌ Error checking upcoming birthdays:", error.message);
  }
};

/**
 * Schedule birthday check to run every 7 days
 */
export const scheduleBirthdayReminders = () => {
  // Run immediately on startup
  checkUpcomingBirthdays();

  // Then run every 7 days (weekly)
  setInterval(() => {
    checkUpcomingBirthdays();
  }, 7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds

};

export default sendBirthdayReminderEmail;
