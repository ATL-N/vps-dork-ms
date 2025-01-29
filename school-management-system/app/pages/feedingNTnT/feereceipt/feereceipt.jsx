import React from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const ReceiptGenerator = ({ receiptData, onClose }) => {
  console.log("receiptData", receiptData);

  // Hard-coded school information
  const schoolInfo = {
    name: "Your School Name",
    phone: "+233 123 456 7890",
    logo: "/favicon.ico", // Assuming the favicon is in the public folder
  };

  const generateReceipt = () => {
    // A5 dimensions in mm (landscape)
    const pageWidth = 210;
    const pageHeight = 148;

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [pageWidth, pageHeight],
    });

    // Add school logo (favicon)
    doc.addImage(schoolInfo.logo, "ICO", 10, 10, 20, 20);

    // Set font
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(schoolInfo.name.toUpperCase(), pageWidth / 2, 20, {
      align: "center",
    });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(schoolInfo.phone, pageWidth / 2, 27, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("PAYMENT RECEIPT", pageWidth / 2, 37, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    // Add receipt details
    const startY = 45;
    const lineHeight = 7;
    doc.text(`Receipt No: ${receiptData.collection_id}`, 10, startY);
    doc.text(
      `Date: ${new Date(receiptData.payment_date).toLocaleDateString()}`,
      pageWidth - 60,
      startY
    );

    doc.text(
      `Student Name: ${receiptData.student_name}`,
      10,
      startY + lineHeight
    );
    doc.text(
      `Payment Mode: ${receiptData.payment_mode}`,
      pageWidth - 60,
      startY + lineHeight
    );

    const amount = parseFloat(receiptData.amount_received).toFixed(2);
    doc.text(`Amount Received: GHS ${amount}`, 10, startY + 2 * lineHeight);
    doc.text(
      `In Words: ${numberToWords(amount)} only`,
      10,
      startY + 3 * lineHeight
    );

    // Add a table for payment details
    const tableStartY = startY + 4 * lineHeight;
    doc.autoTable({
      startY: tableStartY,
      head: [["Description", "Amount (GHS)"]],
      body: [
        ["Old Balance", receiptData.old_balance],
        ["Amount Paid", amount],
        ["New Balance", receiptData.new_balance],
      ],
      theme: "grid",
      headStyles: { fillColor: [0, 150, 150] },
      margin: { left: 10, right: 10 },
    });

    // Add signature lines
    const signatureY = pageHeight - 25;
    doc.line(10, signatureY, 70, signatureY);
    doc.line(pageWidth - 70, signatureY, pageWidth - 10, signatureY);
    doc.text(`Received By: ${receiptData.receiver_name}`, 10, signatureY + 5);
    doc.text("Student Signature:", pageWidth - 70, signatureY + 5);

    // Add footer
    doc.setFontSize(8);
    doc.text(
      "This is a computer-generated document and does not require a signature.",
      pageWidth / 2,
      pageHeight - 5,
      { align: "center" }
    );

    // Open PDF in a new tab
    window.open(doc.output("bloburl"), "_blank");
  };

  // Helper function to convert number to words with decimal support
  const numberToWords = (num) => {
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];

    const convertWholeNumber = (n) => {
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100)
        return (
          tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "")
        );
      if (n < 1000)
        return (
          ones[Math.floor(n / 100)] +
          " Hundred" +
          (n % 100 !== 0 ? " and " + convertWholeNumber(n % 100) : "")
        );
      return "Number too large";
    };

    const [wholeNum, decimal] = num.toString().split(".");
    let result = convertWholeNumber(parseInt(wholeNum)) + " Ghana Cedis";

    if (decimal) {
      const pesewas = parseInt(decimal);
      if (pesewas > 0) {
        result += " and " + convertWholeNumber(pesewas) + " Pesewas";
      }
    }

    return result;
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Payment Receipt</h2>
        <p>Receipt generated successfully!</p>
        <div className="mt-6 flex justify-between">
          <button
            onClick={generateReceipt}
            className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700 transition-colors"
          >
            Print Receipt
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptGenerator;
