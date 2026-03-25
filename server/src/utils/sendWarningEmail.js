import nodemailer from "nodemailer";

export const sendWarningEmail = async (employeeData, warningData) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const severityColors = {
      low: { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" },
      medium: { bg: "#fed7aa", border: "#f97316", text: "#7c2d12" },
      high: { bg: "#fecaca", border: "#dc2626", text: "#7f1d1d" }
    };

    const colors = severityColors[warningData.severity] || severityColors.medium;

    const mailOptions = {
      from: `"Medi-Tech Remedies" <${process.env.MAIL_USER}>`,
      to: employeeData.email,
      subject: `Official Warning - ${warningData.title}`,
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
                        <h1 style="color: #1f2937; font-size: 24px; font-weight: bold; margin: 0;">Official Warning Issued</h1>
                      </div>
                      
                      <p style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 0 0 10px 0;">
                        Dear ${employeeData.name},
                      </p>
                      
                      <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 0 0 25px 0;">
                        This is an official notification that a warning has been issued to you by the management of Medi-Tech Remedies.
                      </p>

                      <!-- Warning Details Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${colors.bg}; border-left: 4px solid ${colors.border}; border-radius: 8px; padding: 20px; margin: 25px 0;">
                        <tr>
                          <td>
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding-bottom: 15px;">
                                  <p style="color: ${colors.text}; font-size: 13px; font-weight: 600; margin: 0 0 5px 0; text-transform: uppercase;">Warning Title</p>
                                  <p style="color: #1f2937; font-size: 16px; font-weight: 700; margin: 0;">${warningData.title}</p>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding-bottom: 15px;">
                                  <p style="color: ${colors.text}; font-size: 13px; font-weight: 600; margin: 0 0 5px 0; text-transform: uppercase;">Severity Level</p>
                                  <p style="color: #1f2937; font-size: 15px; font-weight: 600; margin: 0; text-transform: capitalize;">${warningData.severity}</p>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <p style="color: ${colors.text}; font-size: 13px; font-weight: 600; margin: 0 0 5px 0; text-transform: uppercase;">Description</p>
                                  <p style="color: #1f2937; font-size: 14px; line-height: 1.6; margin: 0;">${warningData.description}</p>
                                </td>
                              </tr>
                              ${warningData.notes ? `
                              <tr>
                                <td style="padding-top: 15px; border-top: 1px solid ${colors.border}; margin-top: 15px;">
                                  <p style="color: ${colors.text}; font-size: 13px; font-weight: 600; margin: 0 0 5px 0; text-transform: uppercase;">Additional Notes</p>
                                  <p style="color: #1f2937; font-size: 14px; line-height: 1.6; margin: 0;">${warningData.notes}</p>
                                </td>
                              </tr>
                              ` : ''}
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Important Notice -->
                      <div style="background-color: #fef3c7; border-left: 3px solid #f59e0b; border-radius: 6px; padding: 15px 20px; margin: 25px 0;">
                        <p style="color: #92400e; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">
                          Important Notice:
                        </p>
                        <p style="color: #78350f; font-size: 13px; line-height: 1.6; margin: 0;">
                          Please take this warning seriously and ensure that such issues do not occur in the future. Repeated violations may result in further disciplinary action, including account suspension or termination.
                        </p>
                      </div>

                      <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                        If you have any questions or wish to discuss this matter, please contact your supervisor or the HR department.
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
    console.error("Error sending warning email:", error);
    return { success: false, error: error.message };
  }
};
