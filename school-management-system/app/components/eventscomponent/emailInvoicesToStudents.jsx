import sgMail from "@sendgrid/mail";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

// Set your SendGrid API key
sgMail.setApiKey("YOUR_SENDGRID_API_KEY");

export const emailInvoicesToStudents = async (invoicesData, studentsData) => {
  for (const invoiceData of invoicesData) {
    const { invoiceNumber, class: className } = invoiceData;

    // Find students in this class
    const classStudents = studentsData.filter(
      (student) => student.class === className
    );

    // Generate PDF
    const doc = new jsPDF();
    // ... (use the same PDF generation code as in the printInvoice function)

    // Convert PDF to base64
    const pdfBase64 = doc.output("datauristring");

    for (const student of classStudents) {
      try {
        const msg = {
          to: student.email,
          from: "your-email@your-domain.com", // Use the email address you verified with SendGrid
          subject: `Invoice ${invoiceNumber} for ${className}`,
          text: `Dear ${student.name},\n\nPlease find attached your invoice for ${className}.\n\nBest regards,\nSchool Administration`,
          attachments: [
            {
              content: pdfBase64.split(",")[1],
              filename: `Invoice_${invoiceNumber}.pdf`,
              type: "application/pdf",
              disposition: "attachment",
            },
          ],
        };

        await sgMail.send(msg);
        console.log(`Email sent to ${student.email}`);
      } catch (error) {
        console.error(`Failed to send email to ${student.email}:`, error);
      }
    }
  }
};
