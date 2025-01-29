import React from "react";
import {
  FaFileInvoice,
  FaSchool,
  FaCalendarAlt,
  FaMoneyBillWave,
} from "react-icons/fa";

const InvoiceDisplayPage = ({ invoiceData, handlePrint }) => {
  const {
    invoiceNumber,
    class: className,
    semester,
    invoiceItems,
    totalAmount,
    dateIssued,
  } = invoiceData;

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="bg-cyan-700 text-white p-4">
        <h1 className="text-2xl font-bold flex items-center">
          <FaFileInvoice className="mr-2" /> Bill
        </h1>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* <div className="flex justify-between mb-6"> */}
          {/* <div className="mb-6">
            <p className="text-gray-700 font-bold mb-2">Invoice Number:</p>
            <p>{invoiceNumber}</p>
          </div> */}
          <div className="mb-6">
            <p className="text-gray-700 font-bold mb-2">Date Issued:</p>
            <p>{dateIssued}</p>
          </div>
          {/* </div> */}

          <div className="mb-6">
            <p className="text-gray-700 font-bold mb-2 flex items-center">
              <FaSchool className="mr-2" /> Class:
            </p>
            <p>{className}</p>
          </div>

          <div className="mb-6">
            <p className="text-gray-700 font-bold mb-2 flex items-center">
              <FaCalendarAlt className="mr-2" /> Semester:
            </p>
            <p>{semester}</p>
          </div>
        </div>

        <table className="w-full mb-6">
          <thead>
            <tr className="bg-cyan-100">
              <th className="text-left p-2">Description</th>
              <th className="text-right p-2">Amount (GHC)</th>
            </tr>
          </thead>
          <tbody>
            {invoiceItems.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="p-2 uppercase">{item.description}</td>
                <td className="text-right p-2 uppercase">
                  {item.amount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="text-right">
            <p className="text-gray-700 font-bold mb-2 flex items-center justify-end">
              <FaMoneyBillWave className="mr-2" /> Total Amount:
            </p>
            <p className="text-2xl text-cyan-700 font-bold">
              GHC {totalAmount.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 p-4 text-center text-sm text-gray-600">
        Please do your best to pay the fees on time. For any queries, please
        contact the school administration.
      </div>
      <div className="mt-6 flex justify-end">
        {/* <button
          className="bg-gray-400 hover:bg-gray-300 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
          onClick={onCancel}
        >
          Close
        </button> */}
        <button
          className="bg-cyan-700 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={handlePrint}
        >
          Print
        </button>
      </div>
    </div>
  );
};

export default InvoiceDisplayPage;
