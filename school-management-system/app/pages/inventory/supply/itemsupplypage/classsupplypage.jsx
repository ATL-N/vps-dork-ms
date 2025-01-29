"use client";
import React, { useState, useMemo, useEffect } from "react";
import { FaBook, FaSave, FaUndo, FaCalendar } from "react-icons/fa";
import { useSession } from "next-auth/react";
import LoadingPage from "../../../../components/generalLoadingpage";
import { fetchData, submitData } from "../../../../config/configFile";
import { toast } from "react-toastify";
import InfoModal from "../../../../components/modal/infoModal";
import ConfirmModal from "../../../../components/modal/confirmModal";

const loadExistingSupplies = async (classId, semesterId) => {
  const data = await fetchData(
    `/api/inventory/getclassstudentsupplies?class_id=${classId}&semester_id=${semesterId}`,
    "",
    false
  );
  return data;
};

const ClassSupplyManagement = ({ onCancel, isReadOnly = false }) => {
  const { data: session, status } = useSession();
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorised, setIsAuthorised] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classData, setClassData] = useState([]);
  const [semesterData, setSemesterData] = useState([]);
  const [itemsData, setItemsData] = useState([]);
  const [error, setError] = useState("");

  const findSupplyForItem = (studentSupplies, itemId) => {
    return (
      studentSupplies.find((supply) => supply.item_id === itemId) || {
        quantity: 0,
      }
    );
  };

  const totalSupplies = useMemo(() => {
    const totals = {};

    // Initialize totals for all items with 0
    itemsData?.forEach((item) => {
      totals[item.item_id] = 0;
    });

    // Sum up quantities for each item
    supplies?.forEach((student) => {
      itemsData?.forEach((item) => {
        const supply = findSupplyForItem(student.supplies, item.item_id);
        totals[item.item_id] += Number(supply.quantity) || 0;
      });
    });

    return totals;
  }, [supplies, itemsData]);

  useEffect(() => {
    setIsLoading(true);
    fetchClassandSemester();
    setIsLoading(false);
    if (
      status === "authenticated" &&
      session?.user?.activeSemester?.semester_id
    ) {
      const activesem = session?.user?.activeSemester?.semester_id;
      setSelectedSemesterId(activesem);
    }
  }, [status, session]);

  useEffect(() => {
    const authorizedRoles = ["admin"];
    const authorizedPermissions = ["supply items"];

    if (
      session?.user?.permissions?.some((permission) =>
        authorizedPermissions.includes(permission)
      ) ||
      authorizedRoles.includes(session?.user?.role)
    ) {
      setIsAuthorised(true);
    } else {
      setIsAuthorised(false);
    }
  }, [session]);

  useEffect(() => {
    if (selectedClassId && selectedSemesterId) {
      fetchItemData(selectedClassId, selectedSemesterId);
      loadSupplies(selectedClassId, selectedSemesterId);
    }
  }, [selectedClassId, selectedSemesterId]);

  const fetchClassandSemester = async () => {
    try {
      const [semesterdata, classdata, items] = await Promise.all([
        fetchData("/api/semester/all", "semester", false),
        fetchData("/api/classes/all", "item", false),
        fetchData("/api/inventory/getitems/", "item", false),
      ]);
      setClassData(classdata?.classes);
      setSemesterData(semesterdata);
    } catch (err) {
      setError(err.message);
      console.log("error", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchItemData = async (classId, semesterId) => {
    const data = await fetchData(
      `/api/inventory/getclassitems?class_id=${classId}&semester_id=${semesterId}`,
      "",
      false
    );
    setItemsData(data?.items);
    return data;
  };

  const handleClassChange = (e) => {
    setSelectedClassId(e.target.value);
  };

  const handleSemesterChange = (e) => {
    setSelectedSemesterId(e.target.value);
  };

  const loadSupplies = async (classId, semesterId) => {
    setLoading(true);
    try {
      const existingSupplies = await loadExistingSupplies(classId, semesterId);
      setSupplies(existingSupplies);
    } catch (error) {
      console.error("Error loading supplies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (studentId, itemId, quantity) => {
    setSupplies(
      supplies.map((student) =>
        student.student_id === studentId
          ? {
              ...student,
              supplies: student.supplies.map((supply) =>
                supply.item_id === itemId ? { ...supply, quantity } : supply
              ),
            }
          : student
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (supplies.length === 0) {
      setIsInfoModalOpen(true);
      return;
    }
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    setIsModalOpen(false);
    setIsLoading(true);

    const formattedSupplies = supplies.flatMap((student) =>
      student.supplies.map((supply) => ({
        student_id: student.student_id,
        item_id: supply.item_id,
        quantity: supply.quantity,
      }))
    );

    submitData({
      apiUrl: "/api/inventory/addclasssemestersupplies",
      data: {
        user_id: session.user?.id,
        class_id: selectedClassId,
        semester_id: selectedSemesterId,
        supplies: formattedSupplies,
      },
      successMessage: "Supplies added successfully",
      errorMessage: "Failed to add supplies",
      onSuccess: (result) => {
        resetForm();
      },
      onError: (error) => {
        // Handle error
      },
    });
    setIsLoading(false);
  };

  const resetForm = () => {
    setSelectedClassId("");
    setSelectedSemesterId("");
    setSupplies([]);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="text-cyan-700">
        <LoadingPage />
      </div>
    );
  }

  if (!isAuthorised) {
    return (
      <div className="flex items-center">
        You are not authorised to be on this page
      </div>
    );
  }

  return (
    <>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title="Supply Class items?"
        message="Are you sure you want to supply these new items?"
      />

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title="Information"
        message="Please add at least one class item before submitting."
      />
      {isLoading ? (
        <LoadingPage />
      ) : (
        <div className="space-y-3 text-cyan-800">
          <h2 className="text-2xl font-bold text-cyan-700">
            Class Supply Management
          </h2>

          {classData?.length > 0 && semesterData?.length > 0 ? (
            <div className="flex space-x-4 mb-4">
              <div className="flex-1 text-cyan-600">
                <label className="block text-sm font-medium text-cyan-700">
                  Select Class
                </label>
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-cyan-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md"
                  value={selectedClassId}
                  onChange={handleClassChange}
                >
                  <option value="">Select class</option>
                  {classData?.map((cls) => (
                    <option key={cls.class_id} value={cls.class_id}>
                      {cls.class_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 text-cyan-600">
                <label className="block text-sm font-medium text-cyan-700">
                  Select Semester
                </label>
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-cyan-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md"
                  value={selectedSemesterId}
                  onChange={handleSemesterChange}
                >
                  <option value="">Select semester</option>
                  {semesterData.map((semester) => (
                    <option key={semester.id} value={semester.id}>
                      {semester.semester_name}
                      {semester?.start_date}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div>
              No class data and semester data found in the system.
            </div>
          )}

          {selectedClassId && selectedSemesterId && (
            <div className="bg-white p-6 pt-0 rounded-lg shadow">
              {loading ? (
                <div className="text-center py-4">Loading supplies...</div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6">
                  <div className="overflow-x-auto max-h-[50vh]">
                    <table className="w-full overflow-scroll">
                      <thead>
                        <tr className="bg-cyan-700 text-white">
                          <th className="p-2">Student Name</th>
                          {itemsData?.map((item) => (
                            <th key={item.item_id} className="p-2">
                              {item.item_name} ({item.quantity_per_student})
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="overflow-scroll">
                        {supplies?.map((student) => (
                          <tr key={student.student_id} className="border-b">
                            <td className="p-2">
                              {student.student_name}({student.amountowed})
                            </td>
                            {itemsData?.map((item) => {
                              const supply = findSupplyForItem(
                                student.supplies,
                                item.item_id
                              );
                              return (
                                <td key={item.item_id} className="p-2">
                                  <input
                                    type="number"
                                    min="0"
                                    disabled={isReadOnly}
                                    value={supply.quantity}
                                    onChange={(e) =>
                                      handleQuantityChange(
                                        student.student_id,
                                        item.item_id,
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                    className="w-full border-2 border-cyan-300 rounded-md p-1"
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-cyan-100">
                          <td className="p-2 font-bold">Total</td>
                          {itemsData?.map((item) => (
                            <td key={item.item_id} className="p-2 font-bold">
                              {totalSupplies[item.item_id]}
                            </td>
                          ))}
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="mt-4 flex justify-between">
                    <div className="space-x-4 flex justify-around">
                      <button
                        type="button"
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center"
                        onClick={onCancel}
                      >
                        Close
                      </button>
                    </div>

                    <div className="space-x-4 flex justify-around">
                      <button
                        type="button"
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center"
                        onClick={resetForm}
                      >
                        <FaUndo className="mr-2" />
                        Reset Form
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 flex items-center"
                      >
                        <FaSave className="mr-2" />
                        Save Supplies
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          ) 
          // : (
          //   <div className="text-center text-gray-500 mt-4">
          //     Please select a class and semester to manage supplies.
          //   </div>
          // )
          }
        </div>
      )}
    </>
  );
};

export default ClassSupplyManagement;
