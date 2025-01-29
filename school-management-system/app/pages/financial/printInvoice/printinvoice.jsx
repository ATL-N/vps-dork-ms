import jsPDF from "jspdf";
import "jspdf-autotable";

const printInvoice = (invoiceData) => {
  const {
    invoiceNumber,
    class: className,
    semester,
    invoiceItems,
    totalAmount,
    dateIssued,
  } = invoiceData;

  const institutionName = process.env.NEXT_PUBLIC_SCHOOL_NAME;
  const institutionEmail = process.env.NEXT_PUBLIC_SCHOOL_EMAIL;
  const institutionPhone = process.env.NEXT_PUBLIC_SCHOOL_PHONE;

    const schoolName = process.env.NEXT_PUBLIC_SCHOOL_NAME;
    const schoolEmail = process.env.NEXT_PUBLIC_SCHOOL_EMAIL;
    const schoolPhone = process.env.NEXT_PUBLIC_SCHOOL_PHONE;


  const doc = new jsPDF({
    format: "a5",
    orientation: "landscape",
    unit: "mm",
  });

  // Set font
  doc.setFont("helvetica");

  // Colors
  const primaryColor = "#555555";
  const secondaryColor = "#777777";

  // Institution details
  doc.setFontSize(16);
  doc.setTextColor(primaryColor);
  doc.text(institutionName, 10, 15);
  doc.setFontSize(10);
  doc.setTextColor(secondaryColor);
  doc.text(institutionEmail, 10, 22);
  doc.text(institutionPhone, 10, 28);

  // Logo
  const logoUrl = "/favicon.ico";
  const logoSize = 15;
  const img = new Image();
  img.src = logoUrl;

  img.onload = function () {
    doc.addImage(img, "PNG", 190, 10, logoSize, logoSize);
    continueRendering();
  };

  img.onerror = function () {
    console.error("Error loading the logo image");
    continueRendering();
  };

  function continueRendering() {
    // Invoice title
    doc.setFontSize(18);
    doc.setTextColor(primaryColor);
    doc.text("BILL", 105, 25, { align: "center" });

    // Subtle separator line
    doc.setDrawColor(secondaryColor);
    doc.setLineWidth(0.5);
    doc.line(10, 32, 200, 32);

    // Invoice details
    doc.setFontSize(10);
    doc.setTextColor(secondaryColor);
    // doc.text(`Invoice Number: ${invoiceNumber}`, 10, 40);
    doc.text(`Date Issued: ${dateIssued}`, 10, 46);
    doc.text(`Class: ${className}`, 10, 52);
    doc.text(`Semester: ${semester}`, 10, 58);

    // Bill To section
    doc.setFontSize(12);
    doc.setTextColor(primaryColor);
    doc.text("Bill To:", 150, 40);
    doc.setFontSize(10);
    doc.setTextColor(secondaryColor);
    doc.text("Student Name", 150, 46);
    doc.text("Student ID", 150, 52);

    // Invoice items table
    const tableColumn = ["Description", "Amount (GHC)"];
    const tableRows = invoiceItems.map((item) => [
      item.description,
      item.amount.toFixed(2),
    ]);

    doc.autoTable({
      startY: 65,
      head: [tableColumn],
      body: tableRows,
      theme: "plain",
      headStyles: {
        fillColor: "#f3f3f3",
        textColor: primaryColor,
        fontStyle: "bold",
      },
      columnStyles: { 1: { halign: "right" } },
      styles: { fontSize: 9 },
    });

    // Total amount
    const finalY = doc.lastAutoTable.finalY || 65;
    doc.setFontSize(12);
    doc.setTextColor(primaryColor);
    doc.text("Total:", 150, finalY + 10);
    doc.setFontSize(12);
    doc.text(`GHC ${totalAmount.toFixed(2)}`, 200, finalY + 10, {
      align: "right",
    });

    // Footer
    doc.setTextColor(secondaryColor);
    doc.setFontSize(8);
    const footerText =
      "Please pay the fees on time. For queries, contact the school administration.";
    doc.text(footerText, 105, 135, { align: "center", maxWidth: 180 });

    // Subtle bottom line
    doc.setDrawColor(secondaryColor);
    doc.setLineWidth(0.5);
    doc.line(10, 140, 200, 140);

    // Open print dialog
    doc.autoPrint();
    window.open(doc.output("bloburl"), "_blank");
  }
};

export default printInvoice;
