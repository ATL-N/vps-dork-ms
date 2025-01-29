// pages/dashboard/events/index.js
"use client";

import React, { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaPlus,
  FaEdit,
  FaInfoCircle,
  FaCalendarCheck,
} from "react-icons/fa";
import StatCard from "../statcard";
import Modal from "../modal/modal";
import AddNewEvent from "./addnewevent";
import EditEvent from "./editevent";
import EventDetails from "./eventdetails";
import EventCalendar from "./eventcalendar";

const EventManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [events, setEvents] = useState([]);
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'calendar'

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    // Replace with actual API call
    const data = [
      {
        id: 1,
        title: "Parent-Teacher Conference",
        date: "2024-08-15",
        type: "Meeting",
      },
      { id: 2, title: "Annual Sports Day", date: "2024-09-20", type: "Sports" },
      { id: 3, title: "Science Fair", date: "2024-10-05", type: "Academic" },
      { id: 4, title: "School Concert", date: "2024-11-10", type: "Cultural" },
    ];
    setEvents(data);
  };

  const handleAddEvent = () => {
    setModalContent(
      <AddNewEvent onClose={() => setShowModal(false)} onAdd={fetchEvents} />
    );
    setShowModal(true);
  };

  const handleEditEvent = (event) => {
    setModalContent(
      <EditEvent
        event={event}
        onClose={() => setShowModal(false)}
        onEdit={fetchEvents}
      />
    );
    setShowModal(true);
  };

  const handleEventDetails = (event) => {
    setModalContent(
      <EventDetails event={event} onClose={() => setShowModal(false)} />
    );
    setShowModal(true);
  };

  return (
    <>
      <div className="pb-16">
        <h1 className="text-3xl font-bold mb-6 text-cyan-700">
          Event Management
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<FaCalendarAlt />}
            title="Total Events"
            value={events.length}
          />
          <StatCard
            icon={<FaCalendarCheck />}
            title="Upcoming Events"
            value={events.filter((e) => new Date(e.date) > new Date()).length}
          />
          <StatCard
            icon={<FaCalendarAlt />}
            title="This Month"
            value={
              events.filter(
                (e) => new Date(e.date).getMonth() === new Date().getMonth()
              ).length
            }
          />
          <StatCard
            icon={<FaCalendarAlt />}
            title="This Year"
            value={
              events.filter(
                (e) =>
                  new Date(e.date).getFullYear() === new Date().getFullYear()
              ).length
            }
          />
        </div>
        <div className="bg-white p-4 rounded shadow mb-6 text-cyan-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-cyan-700">
              Event Management
            </h2>
            <div>
              <button
                onClick={handleAddEvent}
                className="p-2 bg-cyan-700 text-white rounded hover:bg-cyan-900 flex items-center mb-4"
              >
                <FaPlus className="mr-2" /> Add New Event
              </button>
            <div className="flex p-3 rounded-full border bg-gray-100" >
              <button
                onClick={() => setViewMode("list")}
                className={`ml-2 p-2  ${
                  viewMode === "list" ? "bg-cyan-500 text-white" : "bg-gray-200"
                } rounded`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`mr-2 p-2 ${
                  viewMode === "calendar"
                    ? "bg-cyan-500 text-white"
                    : "bg-gray-200"
                } rounded`}
              >
                Calendar View
              </button>
              </div>
            </div>
          </div>
          {viewMode === "list" ? (
            <div className="overflow-x-auto tableWrap height-45vh">
              <table className="w-full table-auto overflow-y-scroll">
                <thead className="header-overlay">
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="border-b text-cyan-700">
                      <td className="px-4 py-2">{event.title}</td>
                      <td className="px-4 py-2">{event.date}</td>
                      <td className="px-4 py-2">{event.type}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="mr-2 text-blue-500 hover:text-blue-700"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleEventDetails(event)}
                          className="text-green-500 hover:text-green-700"
                        >
                          <FaInfoCircle />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EventCalendar events={events} onEventClick={handleEventDetails} />
          )}
        </div>
      </div>
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>{modalContent}</Modal>
      )}
    </>
  );
};

export default EventManagement;
