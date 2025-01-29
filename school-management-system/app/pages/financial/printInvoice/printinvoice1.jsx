// import jsPDF from "jspdf";

// const printInvoice = () => {
//   const institutionName = "DORK-MS";
//   const institutionPhone = 'Tel: 0551577446';

//   const doc = new jsPDF({
//     format: "a4",
//     orientation: "portrait",
//     unit: "mm",
//   });

//   // Set font
//   doc.setFont("helvetica");

//   // Colors
//   const primaryColor = "#000000";
//   const secondaryColor = "#444444";

//   // Starting positions
//   let currentY = 12;
//   const leftColumnX = 15;
//   const rightColumnX = 110;
//   const fieldWidth = 85;
//   const pageHeight = doc.internal.pageSize.height;
//   const checkboxSize = 4; //Size of the checkbox

//   // Helper function to add a field with writing space
//   const addField = (
//     label,
//     x,
//     width = 80,
//     isTextArea = false,
//     isCheckBox = false
//   ) => {
//     doc.setFontSize(10);
//     doc.setTextColor(primaryColor);
//     doc.text(label, x, currentY);

//     doc.setDrawColor(primaryColor);
//     doc.setLineWidth(0.1);

//     if (!isTextArea && !isCheckBox) {
//       doc.line(x + doc.getTextWidth(label) + 2, currentY, x + width, currentY);
//       currentY += 7; // Reduced spacing
//     } else if (isTextArea) {
//       const lineHeight = 6; // Reduced line height
//       const lines = 3;
//       currentY += 4; // Reduced spacing
//       for (let i = 0; i < lines; i++) {
//         doc.line(
//           x,
//           currentY + i * lineHeight,
//           x + width,
//           currentY + i * lineHeight
//         );
//       }
//       currentY += lines * lineHeight + 4; // Reduced spacing
//     } else if (isCheckBox) {
//       doc.rect(
//         x + doc.getTextWidth(label) + 2,
//         currentY - 4,
//         checkboxSize,
//         checkboxSize
//       ); // Drawing the check box
//       currentY += 7;
//     }
//   };

//   // Section helper
//   const addSection = (title) => {
//     doc.setFontSize(12);
//     doc.setTextColor(primaryColor);
//     doc.setFont("helvetica", "bold");
//     doc.text(title, leftColumnX, currentY);
//     currentY += 2;
//     doc.line(leftColumnX, currentY, 190, currentY);
//     currentY += 7;
//     doc.setFont("helvetica", "normal");
//   };

//   // === PAGE 1 ===

//   // Header
//   doc.setFontSize(14);
//   doc.setTextColor(primaryColor);
//   doc.text(institutionName, leftColumnX, currentY);
//   currentY += 5;
//   doc.setFontSize(10);
//   doc.setTextColor(secondaryColor);
//   doc.text(institutionPhone || "Phone:", leftColumnX, currentY);
//   currentY += 8;

//   // Form title
//   doc.setFontSize(18);
//   doc.setTextColor(primaryColor);
//   doc.text("Student Registration Form", 105, currentY, { align: "center" });
//   currentY += 10;

//   // Student Information Section
//   addSection("Student Information");
//   addField("First Name:", leftColumnX);
//   addField("Last Name:", rightColumnX);
//   addField("Other Names:", leftColumnX);
//   addField("Date of Birth:", rightColumnX);
//   addField("Gender:", leftColumnX);
//   addField("Student Class:", rightColumnX);
//   addField("Current Fees Owed:", leftColumnX);
//   addField("Phone:", rightColumnX);
//   addField("Email:", leftColumnX);
//   addField("Enrollment Date:", rightColumnX);
//   addField("National ID NO.:", leftColumnX);
//   addField("Birth Certificate ID:", rightColumnX);
//   addField("Address:", leftColumnX, 180, true);

//   // Feeding and Transportation Section
//   addSection("Feeding And Transportation Information");
//   addField("Mode of Transportation:", leftColumnX);
//   addField("Pick Up Point:", rightColumnX);
//   addField("Transport Fair (Daily):", leftColumnX);
//   addField("Feeding Fee:", rightColumnX);

//   // Medical Information Section
//   addSection("Medical Information");
//   addField("Health Insurance ID:", leftColumnX);
//   addField("Blood Group:", rightColumnX);
//   addField("Medical Conditions:", leftColumnX, 180, true);
//   addField("Allergies:", leftColumnX, 180, true);
//   addField("Vaccination Status:", leftColumnX, 180, true);

//   // === PAGE 2 ===
//   doc.addPage();
//   currentY = 15;

//   // Parent 1 Information
//   addSection("Parent 1 Information");
//   // addField("Select Parent 1:", leftColumnX, 180);
//   addField(
//     "Parent 1 has student in the school?",
//     leftColumnX,
//     180,
//     false,
//     true
//   );
//   addField("First Name:", leftColumnX);
//   addField("Last Name:", rightColumnX);
//   addField("Phone:", leftColumnX);
//   addField("Email:", rightColumnX);
//   addField("Occupation:", leftColumnX, 180);
//   addField("Address:", leftColumnX, 180, true);

//   // Parent 2 Information
//   addSection("Parent 2 Information");
//   // addField("Select Parent 2:", leftColumnX, 180);
//   addField(
//     "Parent 2 has student in the school?",
//     leftColumnX,
//     180,
//     false,
//     true
//   );
//   addField("First Name:", leftColumnX);
//   addField("Last Name:", rightColumnX);
//   addField("Phone:", leftColumnX);
//   addField("Email:", rightColumnX);
//   addField("Occupation:", leftColumnX, 180);
//   addField("Address:", leftColumnX, 180, true);

//   // Add footer and page numbers to both pages
//   for (let i = 1; i <= 2; i++) {
//     doc.setPage(i);

//     // Page numbers
//     doc.text(`Page ${i} of 2`, 105, 292, { align: "center" });
//   }

//   // Save the PDF
//   doc.save("student_registration_form.pdf");
// };

// export default printInvoice;




// import jsPDF from "jspdf";

// const printStaffForm = () => {
//   const institutionName = "DORK-MS";
//   const institutionPhone = process.env.NEXT_PUBLIC_SCHOOL_PHONE;

//   const doc = new jsPDF({
//     format: "a4",
//     orientation: "portrait",
//     unit: "mm",
//   });

//   // Set font
//   doc.setFont("helvetica");

//   // Colors
//   const primaryColor = "#000000";
//   const secondaryColor = "#444444";

//   // Starting positions
//   let currentY = 12;
//   const leftColumnX = 15;
//   const rightColumnX = 110;
//   const fieldWidth = 85;

//   // Helper function to add a field with writing space
//   const addField = (label, x, width = 80, isTextArea = false) => {
//     doc.setFontSize(10);
//     doc.setTextColor(primaryColor);
//     doc.text(label, x, currentY);

//     doc.setDrawColor(primaryColor);
//     doc.setLineWidth(0.1);

//     if (!isTextArea) {
//       doc.line(x + doc.getTextWidth(label) + 2, currentY, x + width, currentY);
//       currentY += 7;
//     } else {
//       const lineHeight = 6;
//       const lines = 3;
//       currentY += 4;
//       for (let i = 0; i < lines; i++) {
//         doc.line(
//           x,
//           currentY + i * lineHeight,
//           x + width,
//           currentY + i * lineHeight
//         );
//       }
//       currentY += lines * lineHeight + 4;
//     }
//   };

//   // Section helper
//   const addSection = (title) => {
//     doc.setFontSize(12);
//     doc.setTextColor(primaryColor);
//     doc.setFont("helvetica", "bold");
//     doc.text(title, leftColumnX, currentY);
//     currentY += 5;
//     doc.line(leftColumnX, currentY, 190, currentY);
//     currentY += 5;
//     doc.setFont("helvetica", "normal");
//   };

//   // === PAGE 1 ===

//   // Header
//   doc.setFontSize(14);
//   doc.setTextColor(primaryColor);
//   doc.text(institutionName, leftColumnX, currentY);
//   currentY += 5;
//   doc.setFontSize(10);
//   doc.setTextColor(secondaryColor);
//   doc.text(institutionPhone || "Phone:", leftColumnX, currentY);
//   currentY += 8;

//   // Form title
//   doc.setFontSize(18);
//   doc.setTextColor(primaryColor);
//   doc.text("Staff Registration Form", 105, currentY, { align: "center" });
//   currentY += 10;

//   // Personal Information Section
//   addSection("Personal Information");
//   addField("First Name:", leftColumnX);
//   addField("Last Name:", rightColumnX);
//   addField("Middle Name:", leftColumnX);
//   addField("Date of Birth:", rightColumnX);
//   addField("Gender:", leftColumnX);
//   addField("Marital Status:", rightColumnX);
//   addField("Phone Number:", leftColumnX);
//   addField("Email:", rightColumnX);
//   addField("Emergency Contact:", leftColumnX);
//   addField("National ID:", rightColumnX);
//   addField("Passport Number:", leftColumnX);
//   addField("Blood Group:", rightColumnX);
//   addField("Address:", leftColumnX, 180, true);

//   // Employment Information Section
//   addSection("Employment Information");
//   addField("Date of Joining:", leftColumnX);
//   addField("Designation:", rightColumnX);
//   addField("Department:", leftColumnX);
//   addField("Teaching Subject:", rightColumnX);
//   addField("Role:", leftColumnX);
//   addField("Contract Type:", rightColumnX);
//   addField("Employment Status:", leftColumnX);
//   addField("Salary:", rightColumnX);
//   addField("Account Number:", leftColumnX, 180);

//   // === PAGE 2 ===
//   doc.addPage();
//   currentY = 15;

//   // Qualifications & Experience Section
//   addSection("Qualifications & Experience");
//   addField("Qualification:", leftColumnX, 180);
//   addField("Experience:", leftColumnX, 180, true);

//   // Medical Information Section
//   addSection("Medical Information");
//   addField("Medical Conditions:", leftColumnX, 180, true);
//   addField("Allergies:", leftColumnX, 180, true);
//   addField("Vaccination Status:", leftColumnX, 180, true);

//   // Photo Box Section
//   addSection("Photograph");
//   // Draw photo box
//   doc.rect(leftColumnX, currentY, 35, 45);
//   doc.setFontSize(8);
//   doc.text("Affix recent passport", leftColumnX + 2, currentY + 20);
//   doc.text("size photograph", leftColumnX + 5, currentY + 25);
//   currentY += 50;

//   // Add page numbers to both pages
//   for (let i = 1; i <= 2; i++) {
//     doc.setPage(i);
//     doc.setFontSize(8);
//     doc.text(`Page ${i} of 2`, 105, 292, { align: "center" });
//   }

//   // Save the PDF
//   doc.save("staff_registration_form.pdf");
// };

// export default printStaffForm;


import jsPDF from "jspdf";
import "jspdf-autotable";

const printInvoice = () => {
  const institutionName = "DORK-MS";
  const institutionPhone = 'Tel: 0551577446';

  const doc = new jsPDF({
    format: "a4",
    orientation: "landscape",
    unit: "mm",
  });

  // Set font
  doc.setFont("helvetica");

  // Colors
  const primaryColor = "#000000";
  const secondaryColor = "#444444";

  // Starting positions
  let currentY = 15;
  const leftMargin = 15;
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;

  // Header
  doc.setFontSize(14);
  doc.setTextColor(primaryColor);
  doc.text(institutionName, leftMargin, currentY);
  currentY += 5;
  doc.setFontSize(10);
  doc.setTextColor(secondaryColor);
  doc.text(institutionPhone || "Phone:", leftMargin, currentY);
  currentY += 10;

  // Form title
  doc.setFontSize(18);
  doc.setTextColor(primaryColor);
  doc.text("Class Details Form", pageWidth / 2, currentY, { align: "center" });
  currentY += 10;

  // Table setup
  const headerRow = [
    "Class Name",
    "Class Level",
    "Capacity",
    "Room Number",
    "Class Teacher",
  ];

  const numRows = 20;
  const bodyRows = Array(numRows).fill(["", "", "", "", ""]); // Create array of 20 empty rows

  const columnWidth = (pageWidth - leftMargin * 2) / headerRow.length;
  console.log(columnWidth);

  doc.autoTable({
    head: [headerRow],
    body: bodyRows,
    startY: currentY,
    theme: "plain",
    headStyles: {
      fillColor: "#f3f3f3",
      textColor: primaryColor,
      fontStyle: "bold",
      halign: "center",
      lineColor: primaryColor,
    },
    styles: {
      lineColor: primaryColor,
      fontSize: 9,
      valign: "middle",
    },
    columnStyles: {
      0: { halign: "center", cellWidth: columnWidth },
      1: { halign: "center", cellWidth: columnWidth },
      2: { halign: "center", cellWidth: columnWidth },
      3: { halign: "center", cellWidth: columnWidth },
      4: { halign: "center", cellWidth: columnWidth },
    },
    willDrawCell: (data) => {
      doc.setDrawColor(primaryColor);
      doc.setLineWidth(0.1);
      const { cell } = data;
      doc.rect(cell.x, cell.y, cell.width, cell.height);
    },
    didDrawPage: (data) => {
      // Footer and page number at the bottom
      doc.setTextColor(secondaryColor);
      doc.setFontSize(8);
      const footerText =
        "Please fill out the form completely and accurately. For queries, contact the school administration.";
      doc.text(footerText, pageWidth / 2, pageHeight - 15, {
        align: "center",
        maxWidth: pageWidth - 20,
      });
      doc.text(
        `Page ${data.pageNumber}`,
        pageWidth - leftMargin,
        pageHeight - 15,
        { align: "right" }
      );
    },
  });

  // Save the PDF
  doc.save("class_details_form.pdf");
};

export default printInvoice;