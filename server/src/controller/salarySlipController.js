import SalarySlip from "../models/salarySlipModel.js";
import User from "../models/userModel.js";
import PDFDocument from "pdfkit";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all salary slips
export const getAllSalarySlips = async (req, res) => {
  try {
    const salarySlips = await SalarySlip.find()
      .populate("employeeId", "name email")
      .populate("generatedBy", "name")
      .sort({ createdAt: -1 });
    res.json(salarySlips);
  } catch (error) {
    console.error("Error fetching salary slips:", error);
    res.status(500).json({ message: "Failed to fetch salary slips" });
  }
};

// Get salary slip by ID
export const getSalarySlipById = async (req, res) => {
  try {
    const { id } = req.params;
    const salarySlip = await SalarySlip.findById(id)
      .populate("employeeId", "name email")
      .populate("generatedBy", "name");
    
    if (!salarySlip) {
      return res.status(404).json({ message: "Salary slip not found" });
    }
    
    res.json(salarySlip);
  } catch (error) {
    console.error("Error fetching salary slip:", error);
    res.status(500).json({ message: "Failed to fetch salary slip" });
  }
};

// Create salary slip
export const createSalarySlip = async (req, res) => {
  try {
    const salaryData = req.body;
    
    // Calculate totals
    const totalEarnings = Object.values(salaryData.earnings).reduce(
      (sum, val) => sum + Number(val),
      0
    );
    const totalDeductions = Object.values(salaryData.deductions).reduce(
      (sum, val) => sum + Number(val),
      0
    );
    const netSalary = totalEarnings - totalDeductions;

    const salarySlip = new SalarySlip({
      ...salaryData,
      totalEarnings,
      totalDeductions,
      netSalary,
      generatedBy: req.admin.id,
    });

    await salarySlip.save();
    res.status(201).json(salarySlip);
  } catch (error) {
    console.error("Error creating salary slip:", error);
    res.status(500).json({ message: "Failed to create salary slip" });
  }
};

// Generate PDF for salary slip
export const generateSalarySlipPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const salarySlip = await SalarySlip.findById(id)
      .populate("employeeId", "name email")
      .populate("generatedBy", "name");

    if (!salarySlip) {
      return res.status(404).json({ message: "Salary slip not found" });
    }

    // Create PDF document
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=salary_slip_${salarySlip.employeeName}_${salarySlip.month}_${salarySlip.year}.pdf`
    );

    // Pipe the PDF to the response
    doc.pipe(res);

    // Use standard Rs. notation (Helvetica doesn't support ₹ symbol)
    const rupeeSymbol = "Rs ";

    // Define color theme (exact colors from navbar)
    const darkGreen = "#325946"; // Navbar background
    const limeGreen = "#a1cc59"; // Accent color from navbar
    const lightGreen = "#f1f8e9"; // Very light background
    const mediumGreen = "#e8f5e9"; // Light green for alternating rows
    const borderGray = "#cccccc"; // Professional border color

    // ==================== PROFESSIONAL HEADER ====================
    // Header Background - Dark Green (reduced height)
    doc.rect(0, 0, 595, 90).fillAndStroke(darkGreen, darkGreen);
    
    // Decorative accent strip - Lime Green
    doc.rect(0, 90, 595, 3).fillAndStroke(limeGreen, limeGreen);
    
    // Company Logo (smaller)
    const logoPath = path.join(__dirname, "../../..", "client", "src", "assets", "logo.png");
    try {
      doc.image(logoPath, 45, 22, { width: 45, height: 45 });
    } catch (error) {
      // Fallback circle for logo
      doc.circle(67, 44, 22).lineWidth(1).stroke("#ffffff");
    }

    // Company Name and Details (smaller fonts)
    doc.fontSize(16)
       .fillColor("#ffffff")
       .font("Helvetica-Bold")
       .text("MEDI-TECH REMEDIES", 105, 25);
    
    doc.fontSize(7)
       .fillColor("#ffffff")
       .font("Helvetica")
       .text("Division of Alvin Willcure Labs Pvt Ltd.", 105, 44)
       .text("8, Chaitanya Market, Bhopal 462001", 105, 56)
       .text("Phone: +91 9425010528 | Email: meditechremedie@gmail.com", 105, 68);

    // SALARY SLIP Title in Lime Green Rounded Box (smaller)
    const titleBoxY = 100;
    doc.roundedRect(230, titleBoxY, 135, 26, 4).fillAndStroke(limeGreen, limeGreen);
    doc.fontSize(14)
       .fillColor("#ffffff")
       .font("Helvetica-Bold")
       .text("SALARY SLIP", 0, titleBoxY + 7, { align: "center", width: 595 });

    // Month-Year below title box (smaller)
    doc.fontSize(7)
       .fillColor("#888888")
       .font("Helvetica")
       .text(`${salarySlip.month} ${salarySlip.year}`, 0, titleBoxY + 32, { align: "center", width: 595 });

    // ==================== EMPLOYEE DETAILS SECTION ====================
    const empBoxY = 145;
    
    // Employee Details Card - Clean and Professional (compact)
    doc.lineWidth(0.5);
    
    // Header strip (smaller)
    doc.rect(45, empBoxY, 505, 20).fillAndStroke(darkGreen, darkGreen);
    doc.fontSize(8)
       .fillColor("#ffffff")
       .font("Helvetica-Bold")
       .text("EMPLOYEE INFORMATION", 52, empBoxY + 7);

    // Content area with border (reduced height)
    doc.rect(45, empBoxY + 20, 505, 48).fillAndStroke("#ffffff", borderGray);
    
    // Left column (smaller fonts, tighter spacing)
    doc.fontSize(7)
       .fillColor("#555555")
       .font("Helvetica")
       .text("Employee Name:", 52, empBoxY + 28)
       .text("Email Address:", 52, empBoxY + 40)
       .text("Designation:", 52, empBoxY + 52);
    
    doc.fillColor("#000000")
       .font("Helvetica-Bold")
       .fontSize(8)
       .text(salarySlip.employeeName, 130, empBoxY + 28)
       .text(salarySlip.employeeEmail, 130, empBoxY + 40)
       .text(salarySlip.designation, 130, empBoxY + 52);

    // Vertical divider
    doc.moveTo(310, empBoxY + 23).lineTo(310, empBoxY + 65).lineWidth(0.5).stroke(borderGray);

    // Right column
    doc.fontSize(7)
       .fillColor("#555555")
       .font("Helvetica")
       .text("Department:", 318, empBoxY + 28)
       .text("Payment Date:", 318, empBoxY + 40)
       .text("Period:", 318, empBoxY + 52);
    
    doc.fillColor("#000000")
       .font("Helvetica-Bold")
       .fontSize(8)
       .text(salarySlip.department, 390, empBoxY + 28)
       .text(new Date(salarySlip.paymentDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }), 390, empBoxY + 40)
       .text(`${salarySlip.month} ${salarySlip.year}`, 390, empBoxY + 52);

    // ==================== SALARY BREAKDOWN TABLE ====================
    const tableStartY = empBoxY + 78;
    
    // Table border (smaller header)
    doc.lineWidth(0.5).rect(45, tableStartY, 505, 18).fillAndStroke(darkGreen, darkGreen);
    
    // Table Header with improved spacing (smaller font)
    doc.fillColor("#ffffff")
       .font("Helvetica-Bold")
       .fontSize(7)
       .text("EARNINGS", 52, tableStartY + 6, { width: 150 })
       .text("AMOUNT (Rs)", 185, tableStartY + 6, { width: 80, align: "right" })
       .text("DEDUCTIONS", 285, tableStartY + 6, { width: 160 })
       .text("AMOUNT (Rs)", 455, tableStartY + 6, { width: 85, align: "right" });

    // Vertical separator in header
    doc.moveTo(275, tableStartY).lineTo(275, tableStartY + 18).lineWidth(0.5).stroke("#ffffff");

    // Table Content with improved styling
    let yPos = tableStartY + 18;
    const earnings = [
      { label: "Basic Salary", value: salarySlip.earnings.basicSalary },
      { label: "House Rent Allowance", value: salarySlip.earnings.houseRentAllowance },
      { label: "Ex-Station Allowance", value: salarySlip.earnings.conveyanceAllowance },
      { label: "Out Station Allowance", value: salarySlip.earnings.medicalAllowance },
      { label: "Daily Allowance", value: salarySlip.earnings.specialAllowance },
      { label: "Other Allowance", value: salarySlip.earnings.otherAllowance },
    ];

    const deductions = [
      { label: "Provident Fund", value: salarySlip.deductions.providentFund },
      { label: "Professional Tax", value: salarySlip.deductions.professionalTax },
      { label: "Income Tax", value: salarySlip.deductions.incomeTax },
      { label: "Loan", value: salarySlip.deductions.loan },
      { label: "Other Deductions", value: salarySlip.deductions.otherDeductions },
    ];

    // Show all rows regardless of value
    const maxRows = Math.max(earnings.length, deductions.length);
    
    doc.font("Helvetica").fontSize(7);
    
    for (let i = 0; i < maxRows; i++) {
      const rowHeight = 16;
      
      // Simple white rows with borders
      doc.rect(45, yPos, 505, rowHeight).stroke(borderGray);

      // Vertical separator with proper color
      doc.moveTo(275, yPos).lineTo(275, yPos + rowHeight).lineWidth(0.5).stroke(borderGray);

      doc.fillColor("#000000");
      
      // Earnings column - show all items
      if (i < earnings.length) {
        const amt = earnings[i].value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        doc.font("Helvetica")
           .text(earnings[i].label, 52, yPos + 5, { width: 130 });
        doc.text(`${rupeeSymbol}${amt}`, 185, yPos + 5, { width: 80, align: "right" });
      }

      // Deductions column - show all items
      if (i < deductions.length) {
        const amt = deductions[i].value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        doc.font("Helvetica")
           .text(deductions[i].label, 282, yPos + 5, { width: 165 });
        doc.text(`${rupeeSymbol}${amt}`, 455, yPos + 5, { width: 85, align: "right" });
      }

      yPos += rowHeight;
    }

    // Total Row - Clean and minimal (smaller)
    doc.lineWidth(0.5);
    doc.rect(45, yPos, 505, 20).stroke(borderGray);
    
    // Vertical separator in total row
    doc.moveTo(275, yPos).lineTo(275, yPos + 20).lineWidth(0.5).stroke(borderGray);
    
    doc.fillColor("#000000")
       .font("Helvetica-Bold")
       .fontSize(7)
       .text("TOTAL EARNINGS", 52, yPos + 7, { width: 125 })
       .text(`${rupeeSymbol}${salarySlip.totalEarnings.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 185, yPos + 7, {
         width: 80,
         align: "right",
       })
       .text("TOTAL DEDUCTIONS", 282, yPos + 7, { width: 160 })
       .text(`${rupeeSymbol}${salarySlip.totalDeductions.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 455, yPos + 7, {
         width: 85,
         align: "right",
       });

    // ==================== NET SALARY HIGHLIGHT ====================
    yPos += 35;
    
    // Clean net salary box (smaller)
    doc.lineWidth(0.5);
    doc.rect(45, yPos, 505, 26).fillAndStroke(darkGreen, darkGreen);
    
    doc.fillColor("#ffffff")
       .font("Helvetica-Bold")
       .fontSize(9)
       .text("NET SALARY (TAKE HOME PAY)", 52, yPos + 9);
       
    doc.fontSize(13)
       .text(`${rupeeSymbol}${salarySlip.netSalary.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 45, yPos + 9, {
         width: 495,
         align: "right",
       });

    // ==================== BANK DETAILS & REMARKS ====================
    yPos += 40;
    
    // Payment Information Section (Always show) - compact
    doc.rect(45, yPos, 505, 18).fillAndStroke(darkGreen, darkGreen);
    
    doc.fillColor("#ffffff")
       .font("Helvetica-Bold")
       .fontSize(7)
       .text("PAYMENT INFORMATION", 52, yPos + 6);
    
    const paymentHeight = salarySlip.paymentMethod === "UPI" ? 50 : 40;
    doc.rect(45, yPos + 18, 505, paymentHeight).fillAndStroke("#ffffff", borderGray);
    
    let paymentY = yPos + 25;
    
    doc.fillColor("#555555")
       .font("Helvetica")
       .fontSize(7)
       .text("Payment Method:", 52, paymentY);
    
    doc.fillColor("#000000")
       .font("Helvetica-Bold")
       .text(salarySlip.paymentMethod || "N/A", 135, paymentY);
    
    paymentY += 10;
    
    doc.fillColor("#555555")
       .font("Helvetica")
       .text("Transfer ID:", 52, paymentY);
    
    doc.fillColor("#000000")
       .font("Helvetica-Bold")
       .text(salarySlip.transferId || "N/A", 135, paymentY);
    
    paymentY += 10;
    
    if (salarySlip.paymentMethod === "UPI") {
      doc.fillColor("#555555")
         .font("Helvetica")
         .text("UPI ID:", 52, paymentY);
      
      doc.fillColor("#000000")
         .font("Helvetica-Bold")
         .text(salarySlip.upiId || "N/A", 135, paymentY);
      
      paymentY += 10;
    }
    
    yPos += paymentHeight + 24;
    
    // Bank Details (if available) - compact
    if (salarySlip.bankDetails.bankName || salarySlip.bankDetails.accountNumber) {
      doc.rect(45, yPos, 505, 18).fillAndStroke(darkGreen, darkGreen);
      
      doc.fillColor("#ffffff")
         .font("Helvetica-Bold")
         .fontSize(7)
         .text("BANK DETAILS", 52, yPos + 6);
      
      doc.rect(45, yPos + 18, 505, 28).fillAndStroke("#ffffff", borderGray);
      
      doc.fillColor("#555555")
         .font("Helvetica")
         .fontSize(7)
         .text("Bank Name:", 52, yPos + 25);

      doc.fillColor("#000000")
         .font("Helvetica-Bold")
         .text(salarySlip.bankDetails.bankName || "N/A", 135, yPos + 25);
      
      doc.fillColor("#555555")
         .font("Helvetica")
         .text("Account Number:", 52, yPos + 35);
      
      doc.fillColor("#000000")
         .font("Helvetica-Bold")
         .text(salarySlip.bankDetails.accountNumber || "N/A", 135, yPos + 35);
      
      yPos += 52;
    }

    // Remarks Section (compact)
    if (salarySlip.remarks) {
      doc.rect(45, yPos, 505, 18).fillAndStroke(darkGreen, darkGreen);
      
      doc.fillColor("#ffffff")
         .font("Helvetica-Bold")
         .fontSize(7)
         .text("REMARKS", 52, yPos + 6);
      
      doc.rect(45, yPos + 18, 505, 22).fillAndStroke("#ffffff", borderGray);
      
      doc.fillColor("#333333")
         .font("Helvetica")
         .fontSize(7)
         .text(salarySlip.remarks, 52, yPos + 25, { width: 485, lineGap: 1 });
      
      yPos += 45;
    }

    // ==================== PROFESSIONAL FOOTER ====================
    const footerY = 750;
    
    // Decorative line
    doc.moveTo(45, footerY - 8).lineTo(550, footerY - 8).lineWidth(0.5).stroke(borderGray);
    
    doc.fontSize(6)
       .fillColor("#888888")
       .font("Helvetica-Oblique")
       .text(
         "This is a computer-generated salary slip and does not require a physical signature.",
         50,
         footerY,
         { align: "center", width: 495 }
       );
    
    doc.fontSize(6)
       .fillColor(darkGreen)
       .font("Helvetica-Bold")
       .text(
         `Generated on: ${new Date().toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" })} | Medi-Tech Remedies`,
         50,
         footerY + 10,
         { align: "center", width: 495 }
       );

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ message: "Failed to generate PDF" });
  }
};

// Delete salary slip
export const deleteSalarySlip = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSlip = await SalarySlip.findByIdAndDelete(id);
    
    if (!deletedSlip) {
      return res.status(404).json({ message: "Salary slip not found" });
    }
    
    res.json({ message: "Salary slip deleted successfully" });
  } catch (error) {
    console.error("Error deleting salary slip:", error);
    res.status(500).json({ message: "Failed to delete salary slip" });
  }
};

// Get employee list for salary slip creation
export const getEmployeesForSalarySlip = async (req, res) => {
  try {
    const employees = await User.find({ role: "employee" })
      .select("name email")
      .sort({ name: 1 });
    res.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ message: "Failed to fetch employees" });
  }
};
