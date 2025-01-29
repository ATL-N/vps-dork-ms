// pages/dashboard/events/eventdetails.js
import React from "react";
import { FaCalendarAlt, FaTag, FaInfoCircle } from "react-icons/fa";

const EventDetails = ({ event, onClose }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-cyan-700">{event?.title}</h2>
      <div className="mb-4 text-cyan-900">
        <div className="flex items-center mb-2 text-cyan-900">
          <FaCalendarAlt className="text-cyan-500 mr-2" />
          <p>
            <strong>Date:</strong> {event?.date}
          </p>
        </div>

        <div className="flex items-center mb-2 text-cyan-900">
          <FaCalendarAlt className="text-cyan-500 mr-2" />
          <p>
            <strong>Created at:</strong> {event?.created_at}
          </p>
        </div>

        <div className="flex items-center mb-2 text-cyan-900">
          <FaCalendarAlt className="text-cyan-500 mr-2" />
          <p>
            <strong>Start Time:</strong>{" "}
            {event?.start_time || "No start time specified"}
          </p>
        </div>

        <div className="flex items-center mb-2 text-cyan-900">
          <FaCalendarAlt className="text-cyan-500 mr-2" />
          <p>
            <strong>End Time:</strong>{" "}
            {event?.end_time || "No end time specified"}
          </p>
        </div>

        <div className="flex items-center mb-2 text-cyan-900">
          <FaCalendarAlt className="text-cyan-500 mr-2" />
          <p>
            <strong>Location:</strong>{" "}
            {event?.location || "No end time specified"}
          </p>
        </div>

        <div className="flex items-center mb-2">
          <FaTag className="text-cyan-500 mr-2" />
          <p>
            <strong>Type:</strong> {event?.type}
          </p>
        </div>

        <div className="flex items-center mb-2 text-cyan-900">
          <FaCalendarAlt className="text-cyan-500 mr-2" />
          <p>
            <strong>Target Audience:</strong>{" "}
            {event?.target_audience || "No end time specified"}
          </p>
        </div>

        <div className="flex items-start mb-2">
          <FaInfoCircle className="text-cyan-500 mr-2 mt-1" />
          <div>
            <p>
              <strong>Description:</strong>
            </p>
            <p>{event?.description || "No description available."}</p>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="bg-cyan-500 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default EventDetails;
