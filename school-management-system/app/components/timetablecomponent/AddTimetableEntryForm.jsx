import { FaSave, FaUndo, FaPlusCircle, FaMinusCircle } from "react-icons/fa";

const EnterTimetable = ({
  classesData,
  subjectsData,
  semesterData,
  staffData,
  roomsData,
  selectedClassId,
  selectedSemesterId,
  timetable,
  periods,
  daysOfWeek,
  handleClassChange,
  handleTimetableChange,
  handlePeriodChange,
  addPeriod,
  removePeriod,
  handleSubmit,
  resetTimetable,
  handleSemesterChange,
}) => {
  let teachingStaff;

  function extractStaffData(staffData) {
    return staffData.map((staff) => ({
      staff_name: `${staff.first_name.trim()} ${staff.middle_name.trim()} ${staff.last_name.trim()}`,
      role: staff.role,
      staff_id: staff.staff_id,
    }));
  }

  staffData = extractStaffData(staffData);

  if (staffData) {
    teachingStaff = staffData.filter(
      (teacher) => teacher.role === "teaching staff"
    );
  }


  return (
    <div className="space-y-6 text-cyan-800">
      <h2 className="text-2xl font-bold text-cyan-700">Enter Timetable</h2>

      <div className="flex space-x-4 mb-4">
        <div className="flex-1">
          <label
            htmlFor="class-select"
            className="block text-sm font-medium text-cyan-700"
          >
            Select Class
          </label>
          <select
            id="class-select"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-cyan-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md"
            value={selectedClassId}
            onChange={handleClassChange}
          >
            <option value="">Select a class</option>
            {classesData?.map((class_) => (
              <option key={class_.class_id} value={class_.class_id}>
                {class_.class_name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label
            htmlFor="semester-select"
            className="block text-sm font-medium text-cyan-700"
          >
            Select Semester
          </label>
          <select
            id="semester-select"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-cyan-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md"
            value={selectedSemesterId}
            onChange={handleSemesterChange}
          >
            <option value="">Select a semester</option>
            {semesterData?.map((semester) => (
              <option key={semester.id} value={semester.id}>
                {`${semester?.semester_name}(${semester?.start_date})`}
              </option>
            ))}
          </select>
        </div>
      </div>
      {selectedClassId && selectedSemesterId && (
        <div className="pb-3 bg-white p-0 rounded-lg shadow">
          <form onSubmit={handleSubmit} className="mt-6">
            <div className="tableWrap overflow-x-auto">
              <table className="w-full border-collapse">
                <colgroup>
                  <col className="w-1/6" />
                  {periods.map((period) => (
                    <col
                      key={period.number}
                      className={`w-${Math.floor(5 / periods.length)}/6`}
                    />
                  ))}
                  <col className="w-16" /> {/* For add/remove period buttons */}
                </colgroup>
                <thead>
                  <tr className="bg-cyan-700 text-white">
                    <th className="p-2 border-4 border-cyan-200">Day / Period</th>
                    {periods.map((period) => (
                      <th
                        key={period.number}
                        className="p-2 border-4 border-cyan-200"
                      >
                        <div className="flex items-center space-x-2 flex-col">
                          <span>Period {period.number}</span>
                          <input
                            type="time"
                            value={period.startTime}
                            onChange={(e) =>
                              handlePeriodChange(
                                period.number - 1,
                                "startTime",
                                e.target.value
                              )
                            }
                            className="w-full border-1 border-cyan-300 rounded-md p-1 mb-1 text-cyan-700"
                          />
                          <input
                            type="time"
                            value={period.endTime}
                            onChange={(e) =>
                              handlePeriodChange(
                                period.number - 1,
                                "endTime",
                                e.target.value
                              )
                            }
                            className="w-full border-1 border-cyan-300 rounded-md p-1 mb-0 text-cyan-600"
                          />
                        </div>
                      </th>
                    ))}
                    <th className="p-2 border border-cyan-600">
                      <div className="flex flex-col">
                        <button
                          type="button"
                          onClick={addPeriod}
                          title="Add period"
                          className="text-white pb-6"
                        >
                          <FaPlusCircle size={"1.5rem"} />
                        </button>

                        <button
                          type="button"
                          title="remove period"
                          onClick={() => removePeriod(periods.length - 1)}
                          className="text-red-500"
                        >
                          <FaMinusCircle size={"1.5rem"} />
                        </button>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {daysOfWeek.map((day) => (
                    <tr key={day} className="border-b">
                      <td className="p-2 font-bold border-4 border-cyan-200">
                        {day}
                      </td>
                      {periods.map((period) => (
                        <td
                          key={`${day}-${period.number}`}
                          className="p-2 border-4 border-cyan-200"
                        >
                          <div className="flex flex-col space-y-1">
                            <select
                              className="w-full border-1 border-cyan-300 rounded-md p-1"
                              // required
                              onChange={(e) =>
                                handleTimetableChange(
                                  day,
                                  period.number,
                                  "subject",
                                  e.target.value
                                )
                              }
                              value={
                                timetable[day]?.[period.number]?.subject || ""
                              }
                            >
                              <option value="">Select Subject</option>
                              {subjectsData?.map((subject) => (
                                <option key={subject.id} value={subject.id}>
                                  {subject.subject_name}
                                </option>
                              ))}
                            </select>
                            <select
                              className="w-full border-1 border-cyan-300 rounded-md p-1"
                              // required
                              onChange={(e) =>
                                handleTimetableChange(
                                  day,
                                  period.number,
                                  "teacher",
                                  e.target.value
                                )
                              }
                              value={
                                timetable[day]?.[period.number]?.teacher || ""
                              }
                            >
                              <option value="">Select Teacher</option>
                              {teachingStaff?.map((teacher) => (
                                <option
                                  key={teacher.staff_id}
                                  value={teacher.staff_id}
                                >
                                  {teacher.staff_name}
                                </option>
                              ))}
                            </select>
                            {/* <select
                              className="w-full border-cyan-300 rounded-md p-1"
                              onChange={(e) =>
                                handleTimetableChange(
                                  day,
                                  period.number,
                                  "room",
                                  e.target.value
                                )
                              }
                              value={
                                timetable[day]?.[period.number]?.room || ""
                              }
                            >
                              <option value="">Select Room</option>
                              {roomsData?.map((room) => (
                                <option key={room.id} value={room.id}>
                                  {room.name}
                                </option>
                              ))}
                            </select> */}
                          </div>
                        </td>
                      ))}
                      <td className=" border-cyan-200"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end space-x-4">
              {/* <button
                type="button"
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center"
                onClick={resetTimetable}
              >
                <FaUndo className="mr-2" />
                Reset
              </button> */}
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 flex items-center"
              >
                <FaSave className="mr-2" />
                Save Timetable
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default EnterTimetable;
