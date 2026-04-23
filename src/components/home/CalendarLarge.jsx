import clsx from "clsx";
import { addDays, format, isToday, startOfWeek, subDays } from "date-fns";
import React, { useEffect, useState } from "react";
import { RxCaretLeft, RxCaretRight } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import {
  selectSelectedDate,
  setSelectedDate,
} from "../../store/slices/globalSlice";
import { getTaskTop } from "../../utils/Calendar";
import { formatDateKey, parseDateValue } from "../../utils/date";
import Task from "../calendar/Task";
import TaskPopup from "../calendar/TaskPopup";

const CalendarLarge = ({ tasks }) => {
  const dispatch = useDispatch();
  const selectedDate = useSelector(selectSelectedDate);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState(null);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const [isMobile, setIsMobile] = useState(false);

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = i % 12 === 0 ? 12 : i % 12;
    const suffix = i < 12 ? "AM" : "PM";
    return `${hour} ${suffix}`;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const container = document.getElementById("calendar-scroll-container");
    if (container) {
      const top = getTaskTop(currentTime);
      container.scrollTop = top - 36;
    }
  }, [currentTime]);

  const totalDays = isMobile ? 3 : 5;

  const renderHeader = () => {
    const days = [];

    days.push(
      <div
        key="time-label"
        className="border-r border-[#2d4c77] md:w-[76px] w-[56px]"
      />
    );

    let currentDate = new Date(selectedDate);

    for (let i = 0; i < totalDays; i++) {
      const isTodayDate = isToday(currentDate);
      days.push(
        <div
          key={i}
          className="flex-1 flex flex-col items-center justify-center py-2 border-r border-[#2d4c77] text-xs md:text-sm font-medium"
        >
          <div className="text-[#acc7eb]">{format(currentDate, "EEE")}</div>
          <div
            className={clsx(
              "mt-1 text-[16px] md:text-[18px] w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full",
              isTodayDate ? "bg-[#3ec6ff] text-[#00111f]" : "text-[#e8f2ff]"
            )}
          >
            {format(currentDate, "d")}
          </div>
        </div>
      );
      currentDate = addDays(currentDate, 1);
    }

    return <div className="flex w-full border-b border-[#2d4c77]">{days}</div>;
  };

  const renderGrid = () => {
    return (
      <div className="flex w-full">
        {[...Array(totalDays + 1)].map((_, dayIndex) => {
          const isTimeColumn = dayIndex === 0;

          if (isTimeColumn) {
            return (
              <div
                key="time-col"
                className="md:w-[76px] w-[56px] flex flex-col border-r border-[#2d4c77]"
              >
                {hours.map((time, idx) => (
                  <div
                    key={idx}
                    className="h-[50px] text-right pr-2 text-[10px] md:text-xs text-[#8dabd4] relative top-[-25px] flex items-center justify-end"
                  >
                    {time === "12 AM" ? "" : time}
                  </div>
                ))}
              </div>
            );
          }

          const date = addDays(parseDateValue(selectedDate), dayIndex - 1);
          const dateKey = formatDateKey(date);
          const dayTasks = tasks.filter((task) => {
            return formatDateKey(task.date) === dateKey;
          });

          return (
            <div
              key={dayIndex}
              className="flex-1 flex flex-col border-r border-[#2d4c77] relative"
            >
              {hours.map((_, timeIndex) => (
                <div key={timeIndex} className="h-[50px] border-b border-[#1f3760]" />
              ))}

              {isToday(date) && (
                <>
                  <div
                    className="absolute left-0 right-0 h-[2px] bg-[#ff8a66] z-50"
                    style={{ top: `${getTaskTop(currentTime)}px` }}
                  />
                  <div
                    className="absolute w-3 h-3 bg-[#ff8a66] rounded-full z-50"
                    style={{
                      top: `${getTaskTop(currentTime) - 5}px`,
                      left: "-6px",
                    }}
                  />
                </>
              )}

              {dayTasks.map((task) => (
                <Task
                  key={task._id || task.id}
                  task={task}
                  setPopupPos={setPopupPos}
                  setSelectedTask={setSelectedTask}
                />
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  const navigateDays = (direction) => {
    const daysToNavigate = totalDays;
    const newDate =
      direction === "next"
        ? addDays(selectedDate, daysToNavigate)
        : subDays(selectedDate, daysToNavigate);

    dispatch(setSelectedDate(newDate));
  };

  return (
    <div className="w-full font-outfit text-[#cfe1ff] relative">
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-base md:text-lg font-semibold">
          Week of {format(weekStart, "MMM d")}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateDays("prev")}
            className="h-9 w-9 rounded-full border border-[#315585] bg-[#112546] flex items-center justify-center text-[22px] cursor-pointer"
          >
            <RxCaretLeft />
          </button>
          <button
            onClick={() => navigateDays("next")}
            className="h-9 w-9 rounded-full border border-[#315585] bg-[#112546] flex items-center justify-center text-[22px] cursor-pointer"
          >
            <RxCaretRight />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#2d4c77] bg-[#0f1f35]/70">
        {renderHeader()}

        <div
          id="calendar-scroll-container"
          className={clsx(
            "overflow-y-auto",
            isMobile ? "max-h-[calc(100vh-240px)]" : "max-h-[calc(100vh-210px)]"
          )}
        >
          {renderGrid()}
        </div>
      </div>

      <TaskPopup
        task={selectedTask}
        position={popupPos}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
};

export default CalendarLarge;
