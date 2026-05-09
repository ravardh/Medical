import nodemailer from "nodemailer";

const sendExtensionResponseEmail = async (
  employeeEmail,
  employeeName,
  requestedDate,
  status,
  isWarning,
  adminNote
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const formattedDate = new Date(requestedDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  let subject, html;

  if (status === "approved") {
    if (isWarning) {
      subject = "Extension Request Approved with Warning - Medi-Tech Remedies";
      html = `
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
      background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
      padding: 40px 30px;
      text-align: center;
      border-bottom: 4px solid #fbbf24;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #ffffff;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }
    .tagline {
      color: #fef3c7;
      font-size: 14px;
      margin-top: 5px;
      font-weight: 500;
    }
    .content {
      padding: 40px 30px;
      color: #333333;
      line-height: 1.6;
    }
    .title {
      font-size: 24px;
      color: #d97706;
      margin-bottom: 20px;
      font-weight: 600;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
      color: #1e293b;
    }
    .info-box {
      background-color: #fef3c7;
      border-left: 4px solid #d97706;
      padding: 20px;
      margin: 25px 0;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(217, 119, 6, 0.1);
    }
    .info-title {
      font-weight: 600;
      color: #d97706;
      margin-bottom: 15px;
      font-size: 16px;
    }
    .info-item {
      margin: 10px 0;
      font-size: 15px;
    }
    .info-label {
      font-weight: 600;
      color: #475569;
      display: inline-block;
      width: 140px;
    }
    .info-value {
      color: #1e293b;
      background-color: #ffffff;
      padding: 5px 10px;
      border-radius: 4px;
      display: inline-block;
      border: 1px solid #e2e8f0;
    }
    .warning-box {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 20px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .warning-box strong {
      color: #92400e;
      display: block;
      margin-bottom: 10px;
      font-size: 16px;
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
    .highlight {
      color: #d97706;
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
      <div class="logo">Extension Request Update</div>
      <div class="tagline">Medi-Tech Remedies - Division of Alvin Willcure Labs Pvt Ltd.</div>
    </div>

    <!-- Content -->
    <div class="content">
      <div class="title">Extension Request Status Update</div>
      
      <div class="greeting">Dear <strong>${employeeName}</strong>,</div>
      
      <p style="font-size: 15px; line-height: 1.8;">
        Your time extension request has been reviewed and <span class="highlight">approved with an official warning</span>. 
        You may now proceed to submit your daily call report for the requested date.
      </p>

      <!-- Request Details -->
      <div class="info-box">
        <div class="info-title">Request Summary</div>
        <div class="info-item">
          <span class="info-label">Requested Date:</span>
          <span class="info-value">${formattedDate}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Request Status:</span>
          <span class="info-value">Approved with Warning</span>
        </div>
        <div class="info-item">
          <span class="info-label">Action Required:</span>
          <span class="info-value">Submit Daily Call Report</span>
        </div>
      </div>

      <!-- Warning Message -->
      <div class="warning-box">
        <strong>OFFICIAL WARNING</strong>
        <p style="margin: 10px 0 0 0; color: #1e293b; font-size: 15px; line-height: 1.6;">
          ${adminNote || "This is a formal warning regarding late submission. Please ensure all future daily call reports are submitted within the designated timeframe to maintain compliance with company policies."}
        </p>
      </div>

      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 4px; margin: 25px 0;">
        <p style="margin: 0 0 15px 0; font-weight: 600; color: #1e293b; font-size: 15px;">Important Notice:</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px; color: #475569;">
          <tr>
            <td width="20" valign="top" style="color: #d97706; font-weight: bold;">•</td>
            <td style="padding-bottom: 8px;">This warning has been permanently recorded in your employee profile</td>
          </tr>
          <tr>
            <td width="20" valign="top" style="color: #d97706; font-weight: bold;">•</td>
            <td style="padding-bottom: 8px;">You can view all warnings in your employee dashboard under "My Warnings"</td>
          </tr>
          <tr>
            <td width="20" valign="top" style="color: #d97706; font-weight: bold;">•</td>
            <td style="padding-bottom: 8px;">Repeated violations may result in further disciplinary action</td>
          </tr>
          <tr>
            <td width="20" valign="top" style="color: #d97706; font-weight: bold;">•</td>
            <td>Submit your report for ${formattedDate} as soon as possible</td>
          </tr>
        </table>
      </div>

      <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
        We trust that you will adhere to submission deadlines going forward.
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
    } else {
      subject = "Extension Request Approved - Medi-Tech Remedies";
      html = `
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
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      padding: 40px 30px;
      text-align: center;
      border-bottom: 4px solid #34d399;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #ffffff;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }
    .tagline {
      color: #d1fae5;
      font-size: 14px;
      margin-top: 5px;
      font-weight: 500;
    }
    .content {
      padding: 40px 30px;
      color: #333333;
      line-height: 1.6;
    }
    .title {
      font-size: 24px;
      color: #059669;
      margin-bottom: 20px;
      font-weight: 600;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
      color: #1e293b;
    }
    .info-box {
      background-color: #d1fae5;
      border-left: 4px solid #059669;
      padding: 20px;
      margin: 25px 0;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(5, 150, 105, 0.1);
    }
    .info-title {
      font-weight: 600;
      color: #059669;
      margin-bottom: 15px;
      font-size: 16px;
    }
    .info-item {
      margin: 10px 0;
      font-size: 15px;
    }
    .info-label {
      font-weight: 600;
      color: #475569;
      display: inline-block;
      width: 140px;
    }
    .info-value {
      color: #1e293b;
      background-color: #ffffff;
      padding: 5px 10px;
      border-radius: 4px;
      display: inline-block;
      border: 1px solid #e2e8f0;
    }
    .note-box {
      background-color: #dbeafe;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
      font-size: 14px;
    }
    .note-box strong {
      color: #1e40af;
      display: block;
      margin-bottom: 8px;
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
    .highlight {
      color: #059669;
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
      <div class="logo">Extension Request Approved</div>
      <div class="tagline">Medi-Tech Remedies - Division of Alvin Willcure Labs Pvt Ltd.</div>
    </div>

    <!-- Content -->
    <div class="content">
      <div class="title">Extension Request Approved</div>
      
      <div class="greeting">Dear <strong>${employeeName}</strong>,</div>
      
      <p style="font-size: 15px; line-height: 1.8;">
        We are pleased to inform you that your time extension request has been <span class="highlight">approved</span>. 
        You may now proceed to submit your daily call report for the requested date.
      </p>

      <!-- Request Details -->
      <div class="info-box">
        <div class="info-title">Request Summary</div>
        <div class="info-item">
          <span class="info-label">Requested Date:</span>
          <span class="info-value">${formattedDate}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Request Status:</span>
          <span class="info-value">Approved</span>
        </div>
        <div class="info-item">
          <span class="info-label">Action Required:</span>
          <span class="info-value">Submit Daily Call Report</span>
        </div>
      </div>

      ${adminNote ? `
      <!-- Admin Note -->
      <div class="note-box">
        <strong>Message from Management:</strong>
        <p style="margin: 10px 0 0 0; color: #1e293b; font-size: 15px; line-height: 1.6;">
          ${adminNote}
        </p>
      </div>
      ` : ''}

      <div style="background-color: #f0fdf4; padding: 20px; border-radius: 4px; margin: 25px 0; border: 1px solid #bbf7d0;">
        <p style="margin: 0 0 15px 0; font-weight: 600; color: #1e293b; font-size: 15px;">Next Steps:</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px; color: #475569;">
          <tr>
            <td width="30" align="center" valign="top">
              <div style="width: 24px; height: 24px; border-radius: 50%; background: #059669; color: white; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center;">1</div>
            </td>
            <td style="padding-bottom: 12px; padding-left: 10px;">Log in to your employee portal account</td>
          </tr>
          <tr>
            <td width="30" align="center" valign="top">
              <div style="width: 24px; height: 24px; border-radius: 50%; background: #059669; color: white; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center;">2</div>
            </td>
            <td style="padding-bottom: 12px; padding-left: 10px;">Navigate to the "Daily Call Reports" section</td>
          </tr>
          <tr>
            <td width="30" align="center" valign="top">
              <div style="width: 24px; height: 24px; border-radius: 50%; background: #059669; color: white; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center;">3</div>
            </td>
            <td style="padding-bottom: 12px; padding-left: 10px;">Submit your detailed report for ${formattedDate}</td>
          </tr>
          <tr>
            <td width="30" align="center" valign="top">
              <div style="width: 24px; height: 24px; border-radius: 50%; background: #059669; color: white; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center;">4</div>
            </td>
            <td style="padding-left: 10px;">Ensure all information is accurate before submission</td>
          </tr>
        </table>
      </div>

      <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
        Please ensure timely submissions for future reports to avoid the need for extension requests.
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
    }
  }

  const mailOptions = {
    from: `"Medi-Tech Remedies" <${process.env.MAIL_USER}>`,
    to: employeeEmail,
    subject: subject,
    html: html,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("[EMAIL ERROR] Failed to send extension response email:", error);
    return { success: false, error: error.message };
  }
};

export { sendExtensionResponseEmail };
