// components/semesters/semestercalendar.js
import React, { useState } from "react";
import { FaCalendarPlus, FaTrash } from "react-icons/fa";

const SemesterCalendar = ({ semester, onClose }) => {
  const [events, setEvents] = useState([
    { id: 1, title: "Start of Classes", date: semester.startDate },
    { id: 2, title: "Midterm Exams", date: "2023-10-15" },
    { id: 3, title: "End of Classes", date: semester.endDate },
  ]);
  const [newEvent, setNewEvent] = useState({ title: "", date: "" });

  const handleAddEvent = (e) => {
    e.preventDefault();
    const id = events.length + 1;
    setEvents([...events, { id, ...newEvent }]);
    setNewEvent({ title: "", date: "" });
  };

  const handleDeleteEvent = (id) => {
    setEvents(events.filter((event) => event.id !== id));
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-cyan-700">
        {semester.name} Calendar
      </h2>
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2 text-cyan-600">
          Add New Event
        </h3>
        <form onSubmit={handleAddEvent} className="flex flex-col space-y-2">
          <input
            type="text"
            value={newEvent.title}
            onChange={(e) =>
              setNewEvent({ ...newEvent, title: e.target.value })
            }
            placeholder="Event Title"
            className="p-2 border rounded"
            required
          />
          <input
            type="date"
            value={newEvent.date}
            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
            className="p-2 border rounded"
            required
          />
          <button
            type="submit"
            className="bg-cyan-700 text-white p-2 rounded hover:bg-cyan-600 flex items-center justify-center"
          >
            <FaCalendarPlus className="mr-2" /> Add Event
          </button>
        </form>
      </div>
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2 text-cyan-600">Events</h3>
        <ul className="space-y-2">
          {events.map((event) => (
            <li
              key={event.id}
              className="flex justify-between items-center bg-gray-100 p-2 rounded"
            >
              <span>
                {event.title} - {event.date}
              </span>
              <button
                onClick={() => handleDeleteEvent(event.id)}
                className="text-red-500 hover:text-red-700"
              >
                <FaTrash />
              </button>
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={onClose}
        className="bg-cyan-700 text-white p-2 rounded hover:bg-cyan-600 w-full"
      >
        Close
      </button>
    </div>
  );
};

export default SemesterCalendar;
