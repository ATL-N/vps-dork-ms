import React from 'react';
import { FaUserMd, FaAllergies, FaTint, FaSyringe, FaCalendarAlt, FaPrint } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const UserHealthRecordpage = ({ healthRecord }) => {
  const {
    medical_conditions,
    allergies,
    blood_group,
    vaccination_status,
    last_physical_exam_date,
    created_at,
    updated_at,
  } = healthRecord;

  console.log('healthRecord', medical_conditions)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePrint = () => {
    const doc = new jsPDF();

    // Add content to the PDF
    doc.setFontSize(20);
    doc.text('Student Health Record', 105, 15, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Medical Conditions: ${medical_conditions || 'None reported'}`, 20, 30);
    doc.text(`Allergies: ${allergies || 'None reported'}`, 20, 40);
    doc.text(`Blood Group: ${blood_group || 'Not specified'}`, 20, 50);
    doc.text(`Vaccination Status: ${vaccination_status || 'Not specified'}`, 20, 60);
    doc.text(`Last Physical Exam: ${last_physical_exam_date ? formatDate(last_physical_exam_date) : 'Not available'}`, 20, 70);

    doc.setFontSize(10);
    doc.text(`Record created: ${formatDate(created_at)}`, 20, 90);
    doc.text(`Last updated: ${formatDate(updated_at)}`, 20, 100);

    // Open print dialog
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="bg-cyan-700 text-white p-4">
        <h2 className="text-2xl font-bold flex items-center">
          <FaUserMd className="mr-2" /> Student Health Record
        </h2>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="mb-6">
            <p className="text-gray-700 font-bold mb-2 flex items-center">
              <FaUserMd className="mr-2 text-cyan-700" /> Medical Conditions:
            </p>
            <p>{medical_conditions || 'None reported'}</p>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-700 font-bold mb-2 flex items-center">
              <FaAllergies className="mr-2 text-cyan-700" /> Allergies:
            </p>
            <p>{allergies || 'None reported'}</p>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-700 font-bold mb-2 flex items-center">
              <FaTint className="mr-2 text-cyan-700" /> Blood Group:
            </p>
            <p>{blood_group || 'Not specified'}</p>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-700 font-bold mb-2 flex items-center">
              <FaSyringe className="mr-2 text-cyan-700" /> Vaccination Status:
            </p>
            <p>{vaccination_status || 'Not specified'}</p>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-700 font-bold mb-2 flex items-center">
              <FaCalendarAlt className="mr-2 text-cyan-700" /> Last Physical Exam:
            </p>
            <p>{last_physical_exam_date ? formatDate(last_physical_exam_date) : 'Not available'}</p>
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          <p>Record created: {formatDate(created_at)}</p>
          <p>Last updated: {formatDate(updated_at)}</p>
        </div>
      </div>

      <div className="bg-gray-100 p-4 text-center text-sm text-gray-600">
        This health record is confidential and should only be accessed by authorized personnel.
      </div>

      <div className="mt-6 flex justify-end p-4">
        <button
          className="bg-cyan-700 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
          onClick={handlePrint}
        >
          <FaPrint className="mr-2" /> Print
        </button>
      </div>
    </div>
  );
};

export default UserHealthRecordpage;