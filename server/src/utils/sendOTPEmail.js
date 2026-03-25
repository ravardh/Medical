import nodemailer from "nodemailer";

export const sendOTPEmail = async (adminEmail, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Medi-Tech Remedies" <${process.env.MAIL_USER}>`,
      to: adminEmail,
      subject: "Account Re-Enable OTP Verification",
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
                <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #325946 0%, #4a7a5d 100%); border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
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
                        <h1 style="color: #1f2937; font-size: 24px; font-weight: bold; margin: 0;">Security Verification Required</h1>
                      </div>
                      
                      <p style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 0 0 10px 0;">
                        Dear Administrator,
                      </p>
                      
                      <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 0 0 30px 0;">
                        A request to re-enable a disabled employee account has been initiated. Please use the verification code below to authorize this action.
                      </p>

                      <!-- OTP Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <div style="background-color: #f0fdf4; border: 2px solid #a1cc59; border-radius: 12px; padding: 25px 40px; display: inline-block;">
                              <p style="color: #325946; font-size: 12px; font-weight: 600; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">
                                Your Verification Code
                              </p>
                              <p style="color: #325946; font-size: 40px; font-weight: 900; margin: 0; letter-spacing: 10px; font-family: 'Courier New', monospace;">
                                ${otp}
                              </p>
                              <p style="color: #4a7a5d; font-size: 11px; margin: 10px 0 0 0;">
                                Valid for 10 minutes
                              </p>
                            </div>
                          </td>
                        </tr>
                      </table>

                      <div style="background-color: #f0fdf4; border-left: 3px solid #325946; border-radius: 6px; padding: 15px 20px; margin: 25px 0;">
                        <p style="color: #1e293b; font-size: 14px; line-height: 1.6; margin: 0;">
                          Enter this code in the verification dialog on your admin dashboard to re-enable the employee account.
                        </p>
                      </div>

                      <!-- Security Notice -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-left: 3px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0;">
                        <tr>
                          <td>
                            <p style="color: #78350f; font-size: 13px; font-weight: 600; margin: 0 0 8px 0;">
                              Security Information:
                            </p>
                            <p style="color: #92400e; font-size: 13px; line-height: 1.6; margin: 0;">
                              • This code expires in 10 minutes<br>
                              • Do not share this code with anyone<br>
                              • If you didn't request this, ignore this email
                            </p>
                          </td>
                        </tr>
                      </table>
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
                        This is an automated email. Please do not reply.
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
    console.error("Error sending OTP email:", error);
    return { success: false, error: error.message };
  }
};
