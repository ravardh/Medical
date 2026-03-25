import nodemailer from "nodemailer";

export const sendLeaveApplicationEmail = async (admin, employee, leaveDetails) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const leaveTypeLabels = {
      sick: "Sick Leave",
      casual: "Casual Leave",
      annual: "Annual Leave",
      emergency: "Emergency Leave",
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    };

    const calculateDays = (start, end) => {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    };

    const mailOptions = {
      from: `"Medi-Tech Remedies" <${process.env.MAIL_USER}>`,
      to: process.env.ADMIN_MAIL,
      subject: `New Leave Application from ${employee.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #ffffff;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #325946; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header with Logo -->
                  <tr>
                    <td align="center" style="padding: 30px 20px;">
                      <img src="https://res.cloudinary.com/df8ogfg2p/image/upload/v1768554157/Untitled_design_pr93ga.png" alt="Medi-Tech Remedies Logo" style="max-width: 150px; height: auto;">
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td style="background-color: #ffffff; padding: 40px 30px;">
                      <div style="text-align: center; margin-bottom: 25px;">
                        <h1 style="color: #1f2937; font-size: 24px; font-weight: bold; margin: 0;">📅 New Leave Application</h1>
                      </div>
                      
                      <p style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 0 0 10px 0;">
                        Hello Admin,
                      </p>
                      
                      <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 0 0 25px 0;">
                        <strong>${employee.name}</strong> has submitted a new leave application that requires your review.
                      </p>

                      <!-- Leave Details Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-left: 4px solid #325946; border-radius: 8px; padding: 20px; margin: 25px 0;">
                        <tr>
                          <td>
                            <p style="color: #325946; font-size: 16px; font-weight: 700; margin: 0 0 15px 0;">Leave Details</p>
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding-bottom: 10px;">
                                  <p style="color: #6b7280; font-size: 13px; font-weight: 600; margin: 0;">Employee:</p>
                                  <p style="color: #1f2937; font-size: 15px; font-weight: 600; margin: 0;">${employee.name}</p>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding-bottom: 10px;">
                                  <p style="color: #6b7280; font-size: 13px; font-weight: 600; margin: 0;">Email:</p>
                                  <p style="color: #1f2937; font-size: 14px; margin: 0;">${employee.email}</p>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding-bottom: 10px;">
                                  <p style="color: #6b7280; font-size: 13px; font-weight: 600; margin: 0;">Leave Type:</p>
                                  <p style="color: #1f2937; font-size: 15px; font-weight: 600; margin: 0;">${leaveTypeLabels[leaveDetails.leaveType] || leaveDetails.leaveType}</p>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding-bottom: 10px;">
                                  <p style="color: #6b7280; font-size: 13px; font-weight: 600; margin: 0;">Start Date:</p>
                                  <p style="color: #1f2937; font-size: 14px; margin: 0;">${formatDate(leaveDetails.startDate)}</p>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding-bottom: 10px;">
                                  <p style="color: #6b7280; font-size: 13px; font-weight: 600; margin: 0;">End Date:</p>
                                  <p style="color: #1f2937; font-size: 14px; margin: 0;">${formatDate(leaveDetails.endDate)}</p>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <p style="color: #6b7280; font-size: 13px; font-weight: 600; margin: 0;">Total Days:</p>
                                  <p style="color: #325946; font-size: 16px; font-weight: 700; margin: 0;">${calculateDays(leaveDetails.startDate, leaveDetails.endDate)} day(s)</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Reason Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-left: 3px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 25px 0;">
                        <tr>
                          <td>
                            <p style="color: #92400e; font-size: 14px; font-weight: 600; margin: 0 0 10px 0; text-transform: uppercase;">Reason for Leave:</p>
                            <p style="color: #78350f; font-size: 14px; line-height: 1.6; margin: 0;">${leaveDetails.reason}</p>
                          </td>
                        </tr>
                      </table>

                      <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                        Please log in to your admin dashboard to review and respond to this leave application.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #325946; padding: 25px; text-align: center; border-top: 3px solid #a1cc59;">
                      <p style="color: #ffffff; font-size: 13px; margin: 0 0 5px 0;">
                        Best regards,<br>
                        <strong style="color: #a1cc59;">Medi-Tech Remedies Team</strong>
                      </p>
                      <p style="color: #a1cc59; font-size: 11px; margin: 5px 0 0 0;">
                        Division of Alvin Willcure Labs Pvt Ltd.
                      </p>
                      <p style="color: rgba(255,255,255,0.7); font-size: 11px; margin: 10px 0 0 0;">
                        This is an official automated notification.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending leave application email:", error);
    return { success: false, error: error.message };
  }
};

export const sendLeaveResponseEmail = async (employee, leaveDetails, response) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const leaveTypeLabels = {
      sick: "Sick Leave",
      casual: "Casual Leave",
      annual: "Annual Leave",
      emergency: "Emergency Leave",
      unpaid: "Unpaid Leave",
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    };

    const calculateDays = (start, end) => {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    };

    const isApproved = response.status === "approved";
    const statusColor = isApproved ? "#10b981" : "#ef4444";
    const statusBg = isApproved ? "#d1fae5" : "#fee2e2";
    const statusIcon = isApproved ? "✅" : "❌";

    const mailOptions = {
      from: `"Medi-Tech Remedies" <${process.env.MAIL_USER}>`,
      to: employee.email,
      subject: `Leave Application ${isApproved ? "Approved" : "Rejected"}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #ffffff;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #325946; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header with Logo -->
                  <tr>
                    <td align="center" style="padding: 30px 20px;">
                      <img src="https://res.cloudinary.com/df8ogfg2p/image/upload/v1768554157/Untitled_design_pr93ga.png" alt="Medi-Tech Remedies Logo" style="max-width: 150px; height: auto;">
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td style="background-color: #ffffff; padding: 40px 30px;">
                      <div style="text-align: center; margin-bottom: 25px;">
                        <h1 style="color: #1f2937; font-size: 24px; font-weight: bold; margin: 0;">📅 Leave Application Update</h1>
                      </div>
                      
                      <p style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 0 0 10px 0;">
                        Dear ${employee.name},
                      </p>
                      
                      <!-- Status Badge -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${statusBg}; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
                        <tr>
                          <td>
                            <p style="color: ${statusColor}; font-size: 18px; font-weight: 700; margin: 0;">
                              ${statusIcon} Your leave application has been ${response.status}
                            </p>
                          </td>
                        </tr>
                      </table>

                      <!-- Leave Details Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-left: 4px solid #325946; border-radius: 8px; padding: 20px; margin: 25px 0;">
                        <tr>
                          <td>
                            <p style="color: #325946; font-size: 16px; font-weight: 700; margin: 0 0 15px 0;">Leave Details</p>
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding-bottom: 10px;">
                                  <p style="color: #6b7280; font-size: 13px; font-weight: 600; margin: 0;">Leave Type:</p>
                                  <p style="color: #1f2937; font-size: 15px; font-weight: 600; margin: 0;">${leaveTypeLabels[leaveDetails.leaveType] || leaveDetails.leaveType}</p>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding-bottom: 10px;">
                                  <p style="color: #6b7280; font-size: 13px; font-weight: 600; margin: 0;">Start Date:</p>
                                  <p style="color: #1f2937; font-size: 14px; margin: 0;">${formatDate(leaveDetails.startDate)}</p>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding-bottom: 10px;">
                                  <p style="color: #6b7280; font-size: 13px; font-weight: 600; margin: 0;">End Date:</p>
                                  <p style="color: #1f2937; font-size: 14px; margin: 0;">${formatDate(leaveDetails.endDate)}</p>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding-bottom: 10px;">
                                  <p style="color: #6b7280; font-size: 13px; font-weight: 600; margin: 0;">Total Days:</p>
                                  <p style="color: #325946; font-size: 16px; font-weight: 700; margin: 0;">${calculateDays(leaveDetails.startDate, leaveDetails.endDate)} day(s)</p>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <p style="color: #6b7280; font-size: 13px; font-weight: 600; margin: 0;">Status:</p>
                                  <p style="color: ${statusColor}; font-size: 15px; font-weight: 700; margin: 0; text-transform: uppercase;">${response.status}</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      ${response.adminNote ? `
                      <!-- Admin Note Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${statusBg}; border-left: 3px solid ${statusColor}; border-radius: 8px; padding: 20px; margin: 25px 0;">
                        <tr>
                          <td>
                            <p style="color: ${statusColor}; font-size: 14px; font-weight: 600; margin: 0 0 10px 0; text-transform: uppercase;">Admin's Note:</p>
                            <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0;">${response.adminNote}</p>
                          </td>
                        </tr>
                      </table>
                      ` : ''}

                      <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                        ${isApproved 
                          ? 'Your leave has been approved. Please plan accordingly and ensure a smooth handover if needed.' 
                          : 'If you have any questions or concerns, please contact your supervisor or the HR department.'}
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #325946; padding: 25px; text-align: center; border-top: 3px solid #a1cc59;">
                      <p style="color: #ffffff; font-size: 13px; margin: 0 0 5px 0;">
                        Best regards,<br>
                        <strong style="color: #a1cc59;">Medi-Tech Remedies Team</strong>
                      </p>
                      <p style="color: #a1cc59; font-size: 11px; margin: 5px 0 0 0;">
                        Division of Alvin Willcure Labs Pvt Ltd.
                      </p>
                      <p style="color: rgba(255,255,255,0.7); font-size: 11px; margin: 10px 0 0 0;">
                        This is an official automated notification.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending leave response email:", error);
    return { success: false, error: error.message };
  }
};
