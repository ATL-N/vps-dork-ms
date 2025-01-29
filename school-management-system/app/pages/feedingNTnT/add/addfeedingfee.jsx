import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import InfoModal from "../../../components/modal/infoModal";
import ConfirmModal from "../../../components/modal/confirmModal";
import { useSession } from "next-auth/react";
import LoadingPage from "../../../components/generalLoadingpage";
import { submitData, fetchData } from "../../../config/configFile";
import { getTodayString } from "../../../config/configFile";

const FeeCollectionPage = ({
  classesData,
  onCancel,
  readonly = false,
  classId,
  useDate,
}) => {
  const { data: session, status } = useSession();
  const today = getTodayString();

  // Combined initial state
  const initialFeeState = {
    student_id: "",
    student_name: "",
    class_id: "",
    default_feeding_fee: 0,
    default_transport_fee: 0,
    current_feeding_fee: 0,
    current_transport_fee: 0,
    feeding_valid_until: today,
    transport_valid_until: today,
    transportation_method: "",
    pick_up_point: "",
    total_fee: 0,
    collected_by: "",
  };

  // States
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedDate, setSelectedDate] = useState(today);
  const [feeEntries, setFeeEntries] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [overallTotal, setOverallTotal] = useState(0);
  const [expectedTotal, setExpectedTotal] = useState(0);
  const [userid, setUserid] = useState("");
  const [isAuthorised, setIsAuthorised] = useState(false);

  useEffect(() => {
    const authorizedRoles = ["admin"];
    const authorizedPermissions = ["take feeding and tnt"];

    if (
      session?.user?.permissions?.some((permission) =>
        authorizedPermissions.includes(permission)
      ) ||
      session?.user?.role === "admin"
    ) {
      setIsAuthorised(true);
    } else {
      setIsAuthorised(false);
    }

    if (status === "authenticated") {
      setUserid(session?.user?.id);
      console.log("session?.user?.id", session?.user?.id);
    }
  }, [session, status]);

  // Modified fetch function to use merged data
  const fetchStudentsAndFees = async (classId, date) => {
    setIsLoading(true);
    try {
      const data = await fetchData(
        `/api/feedingNtransport/getclassfeedingfees?class_id=${classId}&payment_date=${date}`,
        "",
        false
      );
      // await new Promise((resolve) => setTimeout(resolve, 1000));

      const classEntries = data?.filter(
        (entry) =>
          entry.class_id === parseInt(classId) && entry.status === "active"
      );

      console.log("classEntries", classEntries);

      const newFeeEntries = classEntries.map((entry) => ({
        student_id: entry?.student_id,
        student_name: entry?.student_name,
        class_id: entry?.class_id,
        default_feeding_fee: entry?.default_feeding_fee,
        default_transport_fee: entry?.default_transport_fee,
        current_feeding_fee: entry?.current_feeding_fee,
        current_transport_fee: entry?.current_transport_fee,
        feeding_valid_until: entry?.feeding_valid_until || selectedDate,
        transport_valid_until: entry?.transport_valid_until || selectedDate,
        transportation_method: entry?.transportation_method,
        pick_up_point: entry?.pick_up_point,
        total_fee:
          entry?.current_feeding_fee + entry?.current_transport_fee || 0,
        expected_total: entry?.expected_total,
        staff_name: entry?.staff_name,
        staff_id: entry?.staff_id,
      }));

      setFeeEntries(newFeeEntries);
      calculateOverallTotal(newFeeEntries);
      calculateExpectedTotal(newFeeEntries);
    } catch (error) {
      // toast.error("Failed to fetch student data");
      console.error(error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (selectedClassId && selectedDate) {
      fetchStudentsAndFees(selectedClassId, selectedDate);
    }
  }, [selectedClassId, selectedDate]);

  useEffect(() => {
    console.log("classId", classId);
    if (typeof classId == "number" && useDate) {
      setSelectedClassId(classId);
      // console.log("classId22222222222222", classId);
      setSelectedClassId(classId);
      setSelectedDate(useDate);
      fetchStudentsAndFees(classId, useDate);
    } else if (typeof classId == "number") {
      setSelectedClassId(classId);
      // console.log("classId22222222222222", classId);
      setSelectedClassId(classId);
      setSelectedDate(today);
      fetchStudentsAndFees(classId, today);
    }
  }, []);

  const calculateOverallTotal = (entries) => {
    const total = entries.reduce(
      (sum, entry) => sum + (entry.total_fee || 0),
      0
    );
    setOverallTotal(total);
  };

  const calculateExpectedTotal = (entries) => {
    const total = entries.reduce(
      (sum, entry) => sum + (entry.expected_total || 0),
      0
    );
    setExpectedTotal(total);
  };

  const handleValueChange = (index, field, value) => {
    const updatedEntries = [...feeEntries];
    updatedEntries[index] = {
      ...updatedEntries[index],
      [field]: value,
    };

    if (field === "current_feeding_fee" || field === "current_transport_fee") {
      const feeding =
        parseFloat(updatedEntries[index].current_feeding_fee) || 0;
      const transport =
        parseFloat(updatedEntries[index].current_transport_fee) || 0;
      updatedEntries[index].total_fee = feeding + transport;
    }

    setFeeEntries(updatedEntries);
    calculateOverallTotal(updatedEntries);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (feeEntries.length === 0 || !selectedClassId) {
      setIsInfoModalOpen(true);
      return;
    }
    setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    setIsModalOpen(false);
    setIsLoading(true);

    try {
      const payload = feeEntries.map((entry) => ({
        ...entry,
        collected_by: session?.user?.id,
        payment_date: selectedDate,
      }));

      console.log("payload", payload);

      submitData({
        apiUrl: "/api/feedingNtransport/makeclasspayements",
        data: payload,
        successMessage: "Feeding & transport updated successfully",
        errorMessage: "Failed to update fedding and transport",
        resetForm: () => {
          resetForm();
          if (!isEditing) {
            setSelectedSupplierId("");
            setSelectedDate("");
          }
        },
        onSuccess: async (result) => {
          // Any additional actions on success
          await fetchStudentsAndFees(selectedClassId, selectedDate);
        },
        onError: (error) => {
          // Any additional actions on error
        },
      });

      // await new Promise((resolve) => setTimeout(resolve, 1000));
      // console.log("Submitting:", payload);

      // toast.success("Fees collected successfully");
    } catch (error) {
      toast.error("Failed to collect fees");
    }

    setIsLoading(false);
  };

  if (isLoading || status === "loading") {
    return <LoadingPage />;
  }

    if (!isAuthorised) {
      return (
        <div className="flex items-center">
          You are not authorised "take feeding and tnt" to be on this page...!
        </div>
      );
    }

  return (
    <div className="space-y-3 text-gray-800">
      <h2 className="text-3xl font-bold text-cyan-700 mb-8 text-left">
        Feeding & Transport Fee Collection
      </h2>

      <div className="flex space-x-4 mb-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Class
          </label>
          <select
            className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            // disabled={readonly}
          >
            <option value="">Select Class</option>
            {classesData?.map((class_) => (
              <option key={class_.class_id} value={class_.class_id}>
                {class_.class_name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Date
          </label>
          <input
            type="date"
            className="pl-10 w-full p-1 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={today}
            disabled={true}
          />
        </div>
      </div>

      {selectedClassId && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-blue-700 text-white">
                  <th className="p-2 min-w-[200px]">Student</th>
                  <th className="p-2">Collected by</th>
                  <th className="p-2">Feeding Fee</th>
                  <th className="p-2">Valid Until (Feeding)</th>
                  <th className="p-2">Transport Fee</th>
                  <th className="p-2">Valid Until (Transport)</th>
                  <th className="p-2 min-w-[100px]">Total</th>
                </tr>
              </thead>
              <tbody>
                {feeEntries.map((entry, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">
                      <div className="font-bold">{entry?.student_name}</div>
                      <div className="text-sm text-gray-600">
                        {entry?.transportation_method} ({entry?.pick_up_point})
                      </div>
                      <div className="text-sm text-gray-500">
                        ({entry?.default_feeding_fee} +{" "}
                        {entry?.default_transport_fee} ={" "}
                        {entry?.default_feeding_fee +
                          entry?.default_transport_fee}
                        )
                      </div>
                    </td>

                    <td className="p-2">
                      <input
                        type="text"
                        className=" w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                        value={entry?.staff_name}
                        onChange={(e) =>
                          handleValueChange(index, "staff_name", e.target.value)
                        }
                        disabled={true}
                      />
                    </td>

                    <td className="p-2">
                      <input
                        type="number"
                        className=" w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                        value={entry?.current_feeding_fee}
                        onChange={(e) =>
                          handleValueChange(
                            index,
                            "current_feeding_fee",
                            e.target.value
                          )
                        }
                        disabled={
                          readonly ||
                          today !== entry.transport_valid_until ||
                          today !== selectedDate ||
                          (entry.collected_by &&
                            parseInt(entry.collected_by) == parseInt(userid))
                        }
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="date"
                        className=" w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                        value={entry?.feeding_valid_until}
                        onChange={(e) =>
                          handleValueChange(
                            index,
                            "feeding_valid_until",
                            e.target.value
                          )
                        }
                        disabled={
                          readonly ||
                          today !== entry.transport_valid_until ||
                          today !== selectedDate ||
                          (entry.collected_by &&
                            parseInt(entry.collected_by) == parseInt(userid))
                        }
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        className=" w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                        value={entry?.current_transport_fee}
                        onChange={(e) =>
                          handleValueChange(
                            index,
                            "current_transport_fee",
                            e.target.value
                          )
                        }
                        disabled={
                          readonly ||
                          today !== entry.transport_valid_until ||
                          today !== selectedDate ||
                          (entry.collected_by &&
                            parseInt(entry.collected_by) == parseInt(userid))
                        }
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="date"
                        className=" w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                        value={entry?.transport_valid_until}
                        min={selectedDate}
                        onChange={(e) =>
                          handleValueChange(
                            index,
                            "transport_valid_until",
                            e.target.value
                          )
                        }
                        disabled={
                          readonly ||
                          today !== entry.transport_valid_until ||
                          today !== selectedDate ||
                          (entry.collected_by &&
                            parseInt(entry.collected_by) == parseInt(userid))
                        }
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        className=" w-full p-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                        value={entry?.total_fee}
                        readOnly
                      />
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-100 font-bold rounded">
                  <td colSpan="6" className="p-2">
                    Expected Total:
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 items-center"
                      value={expectedTotal?.toFixed(2)}
                      readOnly
                    />
                  </td>
                </tr>
                <tr className="bg-gray-100 font-bold">
                  <td colSpan="6" className="p-2 text-left">
                    Overall Total:
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 items-center"
                      value={overallTotal?.toFixed(2)}
                      readOnly
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {(!readonly || today == selectedDate) && (
            <div className="mt-4 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setSelectedClassId("");
                  setFeeEntries([]);
                  setOverallTotal(0);
                  setExpectedTotal(0);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
              >
                Reset
              </button>
              <button
                type="submit"
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors"
              >
                Save Fee Collection
              </button>
            </div>
          )}
        </form>
      )}

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title="Confirm Fee Collection"
        message="Are you sure you want to save these fee collections?"
      />

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title="Information Required"
        message="Please select a class and add at least one fee entry before submitting."
      />
    </div>
  );
};

export default FeeCollectionPage;
