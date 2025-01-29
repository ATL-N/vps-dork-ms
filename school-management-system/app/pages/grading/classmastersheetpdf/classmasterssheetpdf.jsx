import jsPDF from "jspdf";
import "jspdf-autotable";

const GenerateClassMasterSheetPDF = async (
  studentsData,
  subjects,
  semesterData,
  classesData,
  selectedClass,
  selectedSemester,
  classAverage
) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
    const margin = 10;
    const logoMarginTop = margin - 6;


    const schoolName = process.env.NEXT_PUBLIC_SCHOOL_NAME;
    const logoUrl = "/favicon.ico"; // Path to your favicon in the public folder
    const logoSize = 15;

    const img = new Image();
    img.src = logoUrl;

    await new Promise((resolve, reject) => {
      img.onload = () => {
        doc.addImage(img, 'PNG', margin, logoMarginTop, logoSize, logoSize);
            resolve();
          };
      img.onerror = reject;
    });

  // Helper function to calculate total and positions
  const calculateTotalAndPositions = (students) => {
    return students
      .map((student) => ({
        ...student,
        total: Object.values(student.grades).reduce(
          (sum, grade) => sum + grade,
          0
        ),
      }))
      .sort((a, b) => b.total - a.total)
      .map((student, index) => ({ ...student, position: index + 1 }));
  };

  const studentsWithPositions = calculateTotalAndPositions(studentsData);

    // Header
    doc.setFontSize(16);
    doc.text(schoolName?.toUpperCase(), pageWidth / 2, margin, {
        align: "center",
    });
    doc.setFontSize(12);
    doc.text("Class Master Sheet", pageWidth / 2, margin + 7, {
      align: "center",
    });

  // Class and Semester information
    const className =
        classesData.find((cls) => cls.class_id === parseInt(selectedClass))
            ?.class_name || "Unknown Class";
    const semesterName =
        semesterData.find((sem) => sem.id === parseInt(selectedSemester))
            ?.semester_name || "Unknown Semester";

    doc.setFontSize(10);
    doc.text(`Class: ${className}`, margin, margin + 12);
    doc.text(`Semester: ${semesterName}`, pageWidth - margin, margin + 12, {
        align: "right",
    });


  // Table
  const tableHeaders = ["ID", "Name", ...subjects, "Total", "Position"];

  const tableData = studentsWithPositions.map((student) => [
      student.id,
      student.name
          .split(" ")
          .map(
              (word) =>
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" "),
      ...subjects.map((subject) => student.grades[subject] || "-"),
        student.total,
      student.position,
  ]);

  // Add class average row
  const classAverageRow = [
    "",
    "Class Average",
    ...subjects.map((subject) =>
      classAverage[subject]
        ? classAverage[subject].toFixed(2)
        : "-"
    ),
    "",
    "",
  ];
  tableData.push(classAverageRow);

  doc.autoTable({
    head: [tableHeaders],
    body: tableData,
    startY: margin + 15,
    styles: { fontSize: 11, cellPadding: 1 },
    headStyles: { fillColor: [0, 128, 128], textColor: 255, fontStyle: 'bold' },
     columnStyles: {
            0: { cellWidth: 15 }, // ID
            1: { cellWidth: 40 }, // Name
            [tableHeaders.length - 2]: { cellWidth: 20 }, // Total
            [tableHeaders.length - 1]: { cellWidth: 20 }, // Position
    },
    didDrawPage: (data) => {
      // Footer
      doc.setFontSize(8);
      doc.text(
        `Page ${data.pageNumber} of ${data.pageCount}`,
        pageWidth - margin,
        pageHeight - margin,
        { align: "right" }
      );
      doc.text(
        `Printed on ${new Date().toLocaleDateString()}`,
        margin,
        pageHeight - margin
      );
    },
    didParseCell: (data) => {
      // Highlight the class average row
      if (data.row.index === tableData.length - 1) {
        data.cell.styles.fillColor = [240, 240, 240];
          data.cell.styles.fontStyle = "bold";
      }
    },
  });

  // Additional information
    const finalY = doc.lastAutoTable.finalY || 200;
    doc.setFontSize(10);
  doc.text(
        `Total Students: ${studentsWithPositions.length}`,
    margin,
      finalY + 10
    );

  return doc;
};

export default GenerateClassMasterSheetPDF;