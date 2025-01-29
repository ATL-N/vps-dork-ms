"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FaCalendarAlt,
  FaPlus,
  FaEdit,
  FaInfoCircle,
  FaCalendarCheck,
  FaListUl,
} from "react-icons/fa";
import { Tab } from "@headlessui/react";
import DeleteUser from "../../components/deleteuser";
import StatCard from "../../components/statcard";
import Modal from "../../components/modal/modal";
import Addeditevent from "./addeditevent/addevent";
import EventDetails from "../../components/eventscomponent/eventdetails";
import EventCalendar from "../../components/eventscomponent/eventcalendar";
import CustomTable from "../../components/listtableForm";
import { fetchData } from "../../config/configFile";
import { useSession } from "next-auth/react";
import LoadingPage from "../../components/generalLoadingpage";

const EventManagement = () => {
  const { data: session, status } = useSession();

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [events, setEvents] = useState([]);
  const [tableEvents, setTableEvents] = useState([]);
  const [eventsStats, setEventsStats] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isDeleteAuthorised, setIsDeleteAuthorised] = useState(false);
  const [activeSem, setActiveSem] = useState();
  const [isAuthorised, setIsAuthorised] = useState(true);
  const [activeSemester, setActiveSemester] = useState();

  const headerNames = ["ID", "Title", "Date", "Type"];

  useEffect(() => {
    const authorizedRoles = ["admin"];
    const authorizedPermissions = ["view events"];

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

    if (
      status === "authenticated" &&
      session?.user?.activeSemester?.semester_id
    ) {
      setActiveSemester(session?.user?.activeSemester?.semester_id);
      // setUserId(session?.user?.id);
    }
  }, [session, status]);

  useEffect(() => {
    const authorizedRoles = ["admin"];
    const authorizedPermissions = ["delete event"];

    if (
      session?.user?.role === "admin" ||
      session?.user?.permissions?.some((permission) =>
        authorizedPermissions.includes(permission)
      )
    ) {
      setIsDeleteAuthorised(true);
    } else {
      setIsDeleteAuthorised(false);
    }
  }, [session]);

  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user?.activeSemester?.semester_id
    ) {
      const activeSemester = session?.user?.activeSemester?.semester_id;
      setActiveSem(activeSemester);
      fetchEvents(activeSemester);
      setIsLoading(false);
    }
  }, [status, session]);

  const fetchEvents = async (semester_id) => {
    setLoading(true);
    const eventdata = await fetchData(
      `/api/events/getallevents/${semester_id}`,
      "",
      false
    );

    function extractEventsData(events) {
      return events?.map((event) => ({
        id: event.id,
        title: event.title,
        date: event.date,
        type: event.type,
      }));
    }

    setTableEvents(extractEventsData(eventdata?.events) || []);
    setEvents(eventdata?.events);
    setEventsStats(eventdata?.stats);
    setLoading(false);
  };

  const handleAddEvent = () => {
    setModalContent(
      <Addeditevent
        onCancel={() => setShowModal(false)}
        onAdd={fetchEvents(activeSem)}
      />
    );
    setShowModal(true);
  };

  const onClose = () => {
    setShowModal(false);
    fetchEvents(activeSem);
  };

  const handleAddeditevent = (event_id) => {
    const event = events?.find((event) => event?.id === event_id);
    if (event) {
      setModalContent(
        <Addeditevent id={event_id} eventData={event} onCancel={onClose} />
      );
      setShowModal(true);
    }
  };

  const handleTableEventDetails = (event_id) => {
    const event = events.find((event) => event?.id === event_id);
    if (event) {
      setModalContent(
        <EventDetails event={event} onClose={() => setShowModal(false)} />
      );
      setShowModal(true);
    }
  };

  const handleEventDetails = (event) => {
    setModalContent(
      <EventDetails event={event} onClose={() => setShowModal(false)} />
    );
    setShowModal(true);
  };

  const handleDeleteEvent = async (event_id) => {
    if (!isDeleteAuthorised) {
      setModalContent(
        <div className="flex items-center text-cyan-700">
          You are not authorised "delete event" to perform this action
        </div>
      );
      setShowModal(true);
    } else {
      try {
        setIsLoading(true);
        setModalContent(
          <div>
            <DeleteUser
              userData={event_id}
              onClose={() => setShowModal(false)}
              onDelete={async () => {
                const toastId2 = toast.loading("Processing...");

                const eventData = {
                  user_id: session.user?.id,
                };

                try {
                  const response = await fetch(
                    `/api/events/deleteevent/${event_id}`,
                    {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(eventData),
                    }
                  );

                  if (!response.ok) {
                    // throw new Error(
                    //   id ? "Failed to delete event" : "Failed to add event"
                    // );

                    toast.update(toastId2, {
                      render: "Failed to delete event!!.",
                      type: "error",
                      isLoading: false,
                      autoClose: 2000,
                    });
                  }

                  // Add API call to delete event
                  await fetchEvents(activeSem);
                  // toast.success("event deleted successfully...");
                  toast.update(toastId2, {
                    render: "Event deleted successfully...",
                    type: "success",
                    isLoading: false,
                    autoClose: 2000,
                  });
                  setShowModal(false);
                  // alert("event deleted successfully!");
                } catch (error) {
                  console.error("Error deleting event:", error);
                  // toast.error("An error occurred. Please try again.");
                  toast.update(toastId2, {
                    render: "An error occurred. Please try again.",
                    type: "error",
                    isLoading: false,
                    autoClose: 2000,
                  });

                  // alert("An error occurred. Please try again.");
                }
              }}
            />
          </div>
        );
      } catch (error) {
        console.log(error);
      } finally {
        setShowModal(true);
        setIsLoading(false);
      }
    }
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
      <div className="flex items-center text-cyan-700">
        You are not authorised "view events" to be on this page...!
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-cyan-700">
        Event Management
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<FaCalendarAlt className="text-2xl" />}
          title="Total Events"
          value={eventsStats?.totalEvents}
        />
        <StatCard
          icon={<FaCalendarCheck className="text-2xl" />}
          title="Upcoming Events"
          value={eventsStats?.upcomingEvents}
        />
        <StatCard
          icon={<FaCalendarAlt className="text-2xl" />}
          title="This Month"
          value={eventsStats?.eventsThisMonth}
        />
        <StatCard
          icon={<FaCalendarAlt className="text-2xl" />}
          title="This Week"
          value={eventsStats?.eventsThisWeek}
        />
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-cyan-700 mb-4 sm:mb-0">
            Event Management
          </h2>
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {(session?.user?.role === "admin" ||
              session?.user?.permissions?.some(
                (permission) => permission === "add event"
              ) ||
              session?.user?.role === "head teacher") && (
              <button
                onClick={handleAddEvent}
                className="w-full sm:w-auto px-4 py-2 bg-cyan-700 text-white rounded-md hover:bg-cyan-800 transition duration-300 ease-in-out flex items-center justify-center"
              >
                <FaPlus className="mr-2" /> Add New Event
              </button>
            )}
            <Tab.Group>
              <Tab.List className="flex p-1 px-3 space-x-1 bg-cyan-900/20 rounded-xl">
                <Tab
                  className={({ selected }) =>
                    `w-full px-4 text-sm font-medium leading-5 text-cyan-700 rounded-lg
                    focus:outline-none focus:ring-2 ring-offset-2 ring-offset-cyan-400 ring-white ring-opacity-60
                    ${
                      selected
                        ? "bg-white shadow"
                        : "text-cyan-400 hover:bg-white/[0.12] hover:text-cyan-300"
                    }`
                  }
                  onClick={() => setViewMode("list")}
                >
                  <FaListUl className="w-5 h-5 mx-auto" />
                </Tab>
                <Tab
                  className={({ selected }) =>
                    `w-full px-4 py-2.5 text-sm font-medium leading-5 text-cyan-700 rounded-lg
                    focus:outline-none focus:ring-2 ring-offset-2 ring-offset-cyan-400 ring-white ring-opacity-60
                    ${
                      selected
                        ? "bg-white shadow"
                        : "text-cyan-400 hover:bg-white/[0.12] hover:text-cyan-300"
                    }`
                  }
                  onClick={() => setViewMode("calendar")}
                >
                  <FaCalendarAlt className="w-5 h-5 mx-auto" />
                </Tab>
              </Tab.List>
            </Tab.Group>
          </div>
        </div>

        <div className="mt-6 text-cyan-700">
          {loading ? (
            <div className="text-cyan-700">
              <LoadingPage />
            </div>
          ) : viewMode === "list" ? (
            <div className="overflow-x-auto">
              <CustomTable
                data={tableEvents}
                headerNames={headerNames}
                maxTableHeight="calc(100vh - 400px)"
                height="auto"
                handleDetails={handleTableEventDetails}
                searchPlaceholder="Search by date or event"
                handleEdit={handleAddeditevent}
                handleDelete={handleDeleteEvent}
                displaySearchBar={false}
                displayDelBtn={
                  session?.user?.role === "admin" ||
                  session?.user?.role === "head teacher"
                }
                displayEditBtn={
                  session?.user?.role === "admin" ||
                  session?.user?.role === "head teacher"
                }
              />
            </div>
          ) : (
            <EventCalendar events={events} onEventClick={handleEventDetails} />
          )}
        </div>
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>{modalContent}</Modal>
      )}
    </div>
  );
};

export default EventManagement;
