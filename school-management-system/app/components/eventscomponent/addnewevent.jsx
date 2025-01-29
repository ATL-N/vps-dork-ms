// pages/dashboard/events/addeditneweventpage.js
import { SelectField, InputField } from "../inputFieldSelectField";
import { FaBook, FaCalendar, FaClock, FaVenusMars } from "react-icons/fa";
import { FaLocationPin } from "react-icons/fa6";

const Addeditneweventpage = ({
  formData,
  handleSubmit,
  handleChange,
  onCancel,
  id,
}) => {
  const title = id ? `Edit ${formData?.event_title} event` : "Add New event";
  console.log('event_date', formData?.event_date)
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded-lg p-8 max-w-4xl mx-auto text-cyan-600"
    >
      <h2 className="text-3xl font-bold text-cyan-700 mb-8 text-center">
        {title}
      </h2>
      <div className="space-y-8">
        <section className="text-cyan-600">
          <h3 className="text-2xl font-semibold text-cyan-600 mb-6 border-b border-cyan-200 pb-2">
            Event Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Event Title"
              name="event_title"
              icon={<FaBook />}
              value={formData.event_title}
              onChange={handleChange}
              placeholder="e.g End of term exams, Staff Meeting... etc"
            />

            <InputField
              type="date"
              label="Event Date"
              name="event_date"
              icon={<FaCalendar />}
              value={formData.event_date}
              onChange={handleChange}
            />

            <SelectField
              label="Event type"
              name="event_type"
              icon={<FaVenusMars />}
              value={formData.event_type}
              onChange={handleChange}
              options={[
                { value: "", label: "Select event type" },
                { value: "Holiday", label: "Holiday" },
                { value: "Meeting", label: "Meeting" },
                { value: "Sports", label: "Sports" },
                { value: "Academic", label: "Academic" },
                { value: "Cultural", label: "Cultural" },
              ]}
            />

            <SelectField
              label="Target Audience"
              name="target_audience"
              icon={<FaVenusMars />}
              value={formData.target_audience}
              onChange={handleChange}
              options={[
                { value: "", label: "Select the target audience" },
                { value: "Staff", label: "Staff" },
                { value: "Students", label: "Students" },
                { value: "Parents", label: "Parents" },
                { value: "Everyone", label: "Everyone" },
              ]}
            />

            <InputField
              type="time"
              label="Start Time"
              name="start_time"
              icon={<FaClock />}
              value={formData.start_time}
              onChange={handleChange}
            />

            <InputField
              type="time"
              label="End Time"
              name="end_time"
              icon={<FaClock />}
              value={formData.end_time}
              onChange={handleChange}
            />

            <InputField
              label="Location"
              name="location"
              icon={<FaLocationPin />}
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g Assembly hall, Offic... etc"
              isRequired={false}
            />

            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="description"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows="3"
              ></textarea>
            </div>
          </div>
        </section>
      </div>
      <div className="flex justify-end space-x-4 mt-8">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
        >
          Close
        </button>
        <button
          type="submit"
          className="bg-cyan-500 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded"
        >
          {id ? "Update Event" : "Add Event"}
        </button>
      </div>
    </form>
  );
};
export default Addeditneweventpage;
