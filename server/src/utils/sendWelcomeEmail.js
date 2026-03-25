import nodemailer from "nodemailer";

// Professional welcome email template
export const sendWelcomeEmail = async (userDetails) => {
  const { name, email, password } = userDetails;
  
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
    
    const subject = "Welcome to Medi-Tech Remedies Portal - Your Account is Ready";
    
    const text = `
Welcome to Medi-Tech Remedies!

Dear ${name},

We are delighted to welcome you to the Medi-Tech Remedies family! Your account has been successfully created and is now ready to use.

Division of Alvin Willcure Labs Pvt Ltd.

Your Login Credentials:
Email: ${email}
Temporary Password: ${password}

Important: Please change your password after your first login for security purposes.

Getting Started:
1. Visit our portal and log in with your credentials
2. Start submitting your daily call reports
3. Track your activities and performance

If you have any questions or need assistance, please don't hesitate to reach out to your administrator.

We look forward to your success!

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
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #ffffff;
    }
    .email-container {
      width: 100%;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #325946 0%, #4a7a5d 100%);
      padding: 40px 30px;
      text-align: center;
      border-bottom: 4px solid #a1cc59;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #ffffff;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }
    .tagline {
      color: #a1cc59;
      font-size: 14px;
      margin-top: 5px;
      font-weight: 500;
    }
    .content {
      padding: 40px 30px;
      color: #333333;
      line-height: 1.6;
    }
    .welcome-title {
      font-size: 24px;
      color: #325946;
      margin-bottom: 20px;
      font-weight: 600;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
      color: #1e293b;
    }
    .credentials-box {
      background-color: #f0fdf4;
      border-left: 4px solid #325946;
      padding: 20px;
      margin: 25px 0;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(50, 89, 70, 0.1);
    }
    .credentials-title {
      font-weight: 600;
      color: #325946;
      margin-bottom: 15px;
      font-size: 16px;
    }
    .credential-item {
      margin: 10px 0;
      font-size: 15px;
    }
    .credential-label {
      font-weight: 600;
      color: #475569;
      display: inline-block;
      width: 140px;
    }
    .credential-value {
      color: #1e293b;
      background-color: #ffffff;
      padding: 5px 10px;
      border-radius: 4px;
      display: inline-block;
      font-family: 'Courier New', monospace;
      border: 1px solid #e2e8f0;
    }
    .security-notice {
      background-color: #fef3c7;
      border-left: 4px solid #a1cc59;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
      font-size: 14px;
    }
    .security-notice strong {
      color: #92400e;
    }
    .steps-section {
      margin: 25px 0;
    }
    .steps-title {
      font-weight: 600;
      color: #325946;
      margin-bottom: 15px;
      font-size: 16px;
    }
    .step-item {
      padding: 10px 0;
      padding-left: 38px;
      position: relative;
      font-size: 15px;
      min-height: 32px;
    }
    .step-number {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      background-color: #325946;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      text-align: center;
      line-height: 32px;
      font-size: 15px;
      font-weight: 600;
      border: 2px solid #a1cc59;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .footer {
      background-color: #325946;
      padding: 30px;
      text-align: center;
      border-top: 4px solid #a1cc59;
    }
    .footer-text {
      color: #ffffff;
      font-size: 13px;
      line-height: 1.8;
    }
    .footer-company {
      color: #a1cc59;
      font-weight: 600;
      font-size: 15px;
      margin-bottom: 5px;
    }
    .divider {
      height: 1px;
      background-color: #e2e8f0;
      margin: 25px 0;
    }
    .highlight {
      color: #325946;
      font-weight: 600;
    }
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

    <!-- Content -->
    <div class="content">
      <div class="welcome-title">Welcome to Medi-Tech Remedies</div>
      
      <div class="greeting">Dear <strong>${name}</strong>,</div>
      
      <p style="font-size: 15px; line-height: 1.8;">
        We are pleased to welcome you to <span class="highlight">Medi-Tech Remedies</span>, a division of <span class="highlight">Alvin Willcure Labs Pvt Ltd</span>. 
        Your employee account has been successfully created and is now active.
      </p>

      <p style="font-size: 14px; color: #64748b; margin-top: 15px; line-height: 1.6;">
        As a member of our team, you will have access to our employee portal where you can submit daily call reports, 
        manage your profile, and access important company resources.
      </p>

      <!-- Credentials Box -->
      <div class="credentials-box">
        <div class="credentials-title">Your Login Credentials</div>
        <div class="credential-item">
          <span class="credential-label">Email Address:</span>
          <span class="credential-value">${email}</span>
        </div>
        <div class="credential-item">
          <span class="credential-label">Temporary Password:</span>
          <span class="credential-value">${password}</span>
        </div>
      </div>

      <!-- Security Notice -->
      <div class="security-notice">
        <strong>Security Notice:</strong> This is a temporary password for your first login. For security purposes, 
        please keep these credentials confidential and do not share them with anyone.
      </div>

      <!-- Getting Started Steps -->
      <div class="steps-section">
        <div class="steps-title">Getting Started with Your Account</div>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 10px;">
          <tr>
            <td width="60" align="center" valign="middle" style="vertical-align:middle;">
              <div style="background:#325946;color:#fff;width:40px;height:40px;border-radius:50%;border:2px solid #a1cc59;display:table-cell;vertical-align:middle;text-align:center;font-size:20px;font-weight:700;line-height:40px;">1</div>
            </td>
            <td style="padding-left:10px;font-size:16px;color:#1e293b;vertical-align:middle;line-height:1.6;">
              Access the employee portal and log in using your credentials provided above
            </td>
          </tr>
          <tr><td height="18"></td></tr>
          <tr>
            <td width="60" align="center" valign="middle" style="vertical-align:middle;">
              <div style="background:#325946;color:#fff;width:40px;height:40px;border-radius:50%;border:2px solid #a1cc59;display:table-cell;vertical-align:middle;text-align:center;font-size:20px;font-weight:700;line-height:40px;">2</div>
            </td>
            <td style="padding-left:10px;font-size:16px;color:#1e293b;vertical-align:middle;line-height:1.6;">
              Complete your profile information and review company policies
            </td>
          </tr>
          <tr><td height="18"></td></tr>
          <tr>
            <td width="60" align="center" valign="middle" style="vertical-align:middle;">
              <div style="background:#325946;color:#fff;width:40px;height:40px;border-radius:50%;border:2px solid #a1cc59;display:table-cell;vertical-align:middle;text-align:center;font-size:20px;font-weight:700;line-height:40px;">3</div>
            </td>
            <td style="padding-left:10px;font-size:16px;color:#1e293b;vertical-align:middle;line-height:1.6;">
              Begin submitting your daily call reports and tracking your activities
            </td>
          </tr>
        </table>
      </div>

      <div class="divider"></div>

      <div style="background-color: #f0fdf4; padding: 15px; border-radius: 4px; border-left: 4px solid #059669;">
        <p style="margin: 0; font-size: 14px; color: #1e293b; line-height: 1.6;">
          <strong>Need Help?</strong><br>
          If you encounter any issues accessing your account or have questions about the portal, 
          please contact your administrator or the HR department for immediate assistance.
        </p>
      </div>

      <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
        We look forward to working with you and wish you success in your role.
      </p>
      
      <p style="margin-top: 20px; color: #325946; font-weight: 600;">
        Best regards,<br>
        <span style="color: #1e293b;">Medi-Tech Remedies Team</span>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-text">
        <div class="footer-company">Medi-Tech Remedies</div>
        <div style="color: #a1cc59; font-size: 12px; margin-bottom: 10px;">
          Division of Alvin Willcure Labs Pvt Ltd.
        </div>
        Your trusted partner for quality healthcare products<br>
        and medical supplies<br><br>
        © ${new Date().getFullYear()} Medi-Tech Remedies. All rights reserved.<br>
        This is an automated email, please do not reply.
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
    console.log("[EMAIL] Welcome email sent to:", email);
    return { success: true };
  } catch (error) {
    console.error("[EMAIL ERROR] Failed to send welcome email:", error.message);
    return { success: false, error: error.message };
  }
};
