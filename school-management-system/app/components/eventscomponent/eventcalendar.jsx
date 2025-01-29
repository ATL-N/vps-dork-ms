import React, { useState } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const EventCalendar = ({ events, onEventClick }) => {
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());

  const calendarEvents = events?.map((event) => ({
    title: event.event_title,
    start: new Date(`${event.event_date.split("T")[0]}T${event.start_time}`),
    end: new Date(`${event.event_date.split("T")[0]}T${event.end_time}`),
    allDay: false,
    resource: event,
  }));

  const handleNavigate = (newDate) => {
    setDate(newDate);
  };

  const handleView = (newView) => {
    setView(newView);
  };

  const eventStyleGetter = (event, start, end, isSelected) => {
    const style = {
      backgroundColor: getEventColor(event.resource.event_type),
      borderRadius: "5px",
      opacity: 0.8,
      color: "white",
      border: "0px",
      display: "block",
    };
    return {
      style: style,
    };
  };

  const getEventColor = (eventType) => {
    const colors = {
      Sports: "#3174ad",
      Academic: "#33a853",
      Cultural: "#fbbc04",
      Other: "#ea4335",
    };
    return colors[eventType] || colors["Other"];
  };

  return (
    <div style={{ height: "500px", overflow: "auto" }}>
      {calendarEvents && (
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          onSelectEvent={(event) => onEventClick(event.resource)}
          view={view}
          onView={handleView}
          date={date}
          onNavigate={handleNavigate}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          eventPropGetter={eventStyleGetter}
          tooltipAccessor={(event) => event.resource.description}
        />
      )}
    </div>
  );
};

export default EventCalendar;
