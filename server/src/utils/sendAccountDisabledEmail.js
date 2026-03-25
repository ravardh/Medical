import nodemailer from "nodemailer";

// Send account disabled email with same design as welcome email
export const sendAccountDisabledEmail = async ({ name, email }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const subject = "Your Medi-Tech Remedies Account Has Been Disabled";
    const text = `
Dear ${name},

Your account on Medi-Tech Remedies has been disabled by the administrator. You will not be able to log in or access the portal until your account is re-enabled.

If you believe this is a mistake or have any questions, please contact your administrator.

Best regards,
Medi-Tech Remedies Team
Division of Alvin Willcure Labs Pvt Ltd.
`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff; }
    .email-container { width: 100%; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #325946 0%, #4a7a5d 100%); padding: 40px 30px; text-align: center; border-bottom: 4px solid #a1cc59; }
    .logo { font-size: 32px; font-weight: bold; color: #ffffff; margin-bottom: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.2); }
    .tagline { color: #a1cc59; font-size: 14px; margin-top: 5px; font-weight: 500; }
    .content { padding: 40px 30px; color: #333333; line-height: 1.6; }
    .alert-box { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 4px; font-size: 16px; color: #92400e; font-weight: 600; }
    .footer { background-color: #325946; padding: 30px; text-align: center; border-top: 4px solid #a1cc59; }
    .footer-text { color: #ffffff; font-size: 13px; line-height: 1.8; }
    .footer-company { color: #a1cc59; font-weight: 600; font-size: 15px; margin-bottom: 5px; }
    .divider { height: 1px; background-color: #e2e8f0; margin: 25px 0; }
    .highlight { color: #325946; font-weight: 600; }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
        <tr>
          <td align="center">
            <div style="display:inline-block;width:100px;height:100px;background:#fff;border-radius:50%;box-shadow:0 4px 6px rgba(0,0,0,0.1);text-align:center;vertical-align:middle;">
              <img src="https://res.cloudinary.com/df8ogfg2p/image/upload/v1768554157/Untitled_design_pr93ga.png" alt="Medi-Tech Remedies Logo" style="width:70px;height:70px;border-radius:50%;display:block;margin:15px auto;object-fit:contain;" />
            </div>
          </td>
        </tr>
      </table>
      <div class="logo">Medi-Tech Remedies</div>
      <div class="tagline">Division of Alvin Willcure Labs Pvt Ltd.</div>
    </div>
    <div class="content">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="display: inline-block; background: #fef2f2; border: 2px solid #dc2626; border-radius: 8px; padding: 15px 30px;">
          <p style="margin: 0; font-size: 18px; font-weight: 600; color: #b91c1c;">Account Access Disabled</p>
        </div>
      </div>
      
      <p style="font-size: 16px; margin-bottom: 10px;">Dear <strong>${name}</strong>,</p>
      
      <p style="font-size: 15px; line-height: 1.8; color: #475569;">
        This is to inform you that your employee account with <span class="highlight">Medi-Tech Remedies</span> 
        has been <strong style="color: #b91c1c;">permanently disabled</strong> by the administration.
      </p>

      <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 25px 0; border-radius: 4px;">
        <p style="margin: 0 0 15px 0; font-weight: 600; color: #1e293b; font-size: 15px;">Access Restrictions:</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px; color: #475569;">
          <tr>
            <td width="20" valign="top" style="color: #dc2626; font-weight: bold;">•</td>
            <td style="padding-bottom: 8px;">You will not be able to log in to the employee portal</td>
          </tr>
          <tr>
            <td width="20" valign="top" style="color: #dc2626; font-weight: bold;">•</td>
            <td style="padding-bottom: 8px;">All portal access and features have been suspended</td>
          </tr>
          <tr>
            <td width="20" valign="top" style="color: #dc2626; font-weight: bold;">•</td>
            <td style="padding-bottom: 8px;">Your account access has been permanently revoked by administration</td>
          </tr>
          <tr>
            <td width="20" valign="top" style="color: #dc2626; font-weight: bold;">•</td>
            <td>Any pending reports or data remain stored and will be accessible once re-enabled</td>
          </tr>
        </table>
      </div>

      <div style="background-color: #f0fdf4; padding: 15px; border-radius: 4px; border-left: 4px solid #059669; margin: 25px 0;">
        <p style="margin: 0; font-size: 14px; color: #1e293b; line-height: 1.6;">
          <strong>Need Clarification?</strong><br>
          If you believe this action was taken in error or require more information regarding your account status, 
          please contact your administrator or the HR department immediately.
        </p>
      </div>

      <div class="divider"></div>
      
      <p style="margin-top: 20px; color: #325946; font-weight: 600;">
        Best regards,<br>
        <span style="color: #1e293b;">Medi-Tech Remedies Team</span>
      </p>
    </div>
    <div class="footer">
      <div class="footer-text">
        <div class="footer-company">Medi-Tech Remedies</div>
        <div style="color: #a1cc59; font-size: 12px; margin-bottom: 10px;">Division of Alvin Willcure Labs Pvt Ltd.</div>
        Your trusted partner for quality healthcare products<br>and medical supplies<br><br>© ${new Date().getFullYear()} Medi-Tech Remedies. All rights reserved.<br>This is an automated email, please do not reply.
      </div>
    </div>
  </div>
</body>
</html>
`;

    const mailOptions = {
      from: `"Medi-Tech Remedies" <${process.env.MAIL_USER}>`,
      to: email,
      subject,
      text,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log("[EMAIL] Account disabled email sent to:", email);
    return { success: true };
  } catch (error) {
    console.error("[EMAIL ERROR] Failed to send account disabled email:", error.message);
    return { success: false, error: error.message };
  }
};
