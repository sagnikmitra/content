import clsx from "clsx";
import {
  addDays,
  endOfDay,
  format,
  isSameDay,
  isToday,
  startOfDay,
  startOfWeek,
  subDays,
} from "date-fns";
import React, { useEffect, useMemo, useState } from "react";
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

const ROW_HEIGHT = 50;

const CalendarLarge = ({ tasks }) => {
  const dispatch = useDispatch();
  const selectedDate = parseDateValue(useSelector(selectSelectedDate));
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState(null);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const [isMobile, setIsMobile] = useState(false);

  const totalDays = isMobile ? 3 : 5;
  const rangeStart = parseDateValue(selectedDate);
  const rangeEnd = addDays(rangeStart, totalDays - 1);
  const weekStart = startOfWeek(rangeStart, { weekStartsOn: 1 });

  const visibleTasks = useMemo(() => {
    const safeTasks = Array.isArray(tasks) ? tasks : [];
    return safeTasks.filter((task) => {
      const taskDate = parseDateValue(task.date);
      return taskDate >= startOfDay(rangeStart) && taskDate <= endOfDay(rangeEnd);
    });
  }, [rangeEnd, rangeStart, tasks]);

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
      container.scrollTop = Math.max(0, top - ROW_HEIGHT);
    }
  }, [currentTime]);

  const renderHeader = () => {
    const days = [];

    days.push(
      <div
        key="time-label"
        className="sticky left-0 z-20 w-[64px] border-r border-[#3c3c3c] bg-[#1f1f22] md:w-[84px]"
      />
    );

    let currentDate = new Date(rangeStart);

    for (let index = 0; index < totalDays; index++) {
      const dateForCell = new Date(currentDate);
      const isTodayDate = isToday(dateForCell);
      const isSelectedDate = isSameDay(dateForCell, parseDateValue(selectedDate));

      days.push(
        <button
          key={formatDateKey(dateForCell)}
          type="button"
          className={clsx(
            "flex-1 border-r border-[#3c3c3c] py-2 text-xs md:text-sm",
            isSelectedDate ? "bg-[#313136]" : "bg-[#252526]"
          )}
          onClick={() => dispatch(setSelectedDate(dateForCell))}
        >
          <div className="font-medium text-[#a5a7ab]">
            {isTodayDate ? "Today" : format(dateForCell, "EEE")}
          </div>
          <div
            className={clsx(
              "mx-auto mt-1 flex h-8 w-8 items-center justify-center rounded-full text-[16px] md:h-9 md:w-9 md:text-[18px]",
              isTodayDate
                ? "bg-[#d4d4d4] text-[#1e1e1e]"
                : isSelectedDate
                  ? "bg-[#4b4b52] text-[#f4f4f4]"
                  : "text-[#d4d4d4]"
            )}
          >
            {format(dateForCell, "d")}
          </div>
        </button>
      );
      currentDate = addDays(currentDate, 1);
    }

    return <div className="sticky top-0 z-20 flex w-full border-b border-[#3c3c3c]">{days}</div>;
  };

  const renderGrid = () => {
    return (
      <div className="flex w-full">
        {[...Array(totalDays + 1)].map((_, dayIndex) => {
          if (dayIndex === 0) {
            return (
              <div
                key="time-col"
                className="sticky left-0 z-10 flex w-[64px] flex-col border-r border-[#3c3c3c] bg-[#1f1f22] md:w-[84px]"
              >
                {hours.map((timeLabel, idx) => (
                  <div
                    key={idx}
                    className="flex h-[50px] items-center justify-end pr-2 text-right text-[10px] text-[#8e8e90] md:text-xs"
                  >
                    {timeLabel === "12 AM" ? "" : timeLabel}
                  </div>
                ))}
              </div>
            );
          }

          const date = addDays(parseDateValue(rangeStart), dayIndex - 1);
          const dateKey = formatDateKey(date);
          const dayTasks = visibleTasks
            .filter((task) => formatDateKey(task.date) === dateKey)
            .sort(
              (first, second) =>
                parseDateValue(first.time).getTime() -
                parseDateValue(second.time).getTime()
            );
          const isSelectedDate = isSameDay(date, parseDateValue(selectedDate));

          return (
            <div
              key={dateKey}
              className={clsx(
                "relative flex flex-1 flex-col border-r border-[#3c3c3c]",
                isSelectedDate ? "bg-[#242429]" : "bg-[#202022]"
              )}
            >
              {hours.map((_, timeIndex) => (
                <div key={timeIndex} className="h-[50px] border-b border-[#2d2d30]" />
              ))}

              {isToday(date) && (
                <>
                  <div
                    className="absolute left-0 right-0 z-50 h-[2px] bg-[#9b9ba2]"
                    style={{ top: `${getTaskTop(currentTime)}px` }}
                  />
                  <div
                    className="absolute z-50 h-3 w-3 rounded-full bg-[#9b9ba2]"
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
    const newDate =
      direction === "next"
        ? addDays(selectedDate, totalDays)
        : subDays(selectedDate, totalDays);

    dispatch(setSelectedDate(newDate));
  };

  return (
    <div className="relative w-full font-outfit text-[#d4d4d4]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
        <div>
          <h2 className="text-base font-semibold md:text-lg">
            {format(rangeStart, "MMM d")} - {format(rangeEnd, "MMM d")}
          </h2>
          <p className="text-xs text-[#9da1a6]">
            Week of {format(weekStart, "MMM d")} · {visibleTasks.length} scheduled
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => dispatch(setSelectedDate(new Date()))}
            className="rounded-full border border-[#4a4a4f] bg-[#2d2d30] px-3 py-1.5 text-xs font-semibold text-[#e6e6e6]"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => navigateDays("prev")}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#4a4a4f] bg-[#2d2d30] text-[22px]"
          >
            <RxCaretLeft />
          </button>
          <button
            type="button"
            onClick={() => navigateDays("next")}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#4a4a4f] bg-[#2d2d30] text-[22px]"
          >
            <RxCaretRight />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#3c3c3c] bg-[#1f1f22]">
        {renderHeader()}
        <div
          id="calendar-scroll-container"
          className={clsx(
            "overflow-y-auto",
            isMobile ? "max-h-[calc(100vh-240px)]" : "max-h-[calc(100vh-280px)]"
          )}
        >
          {renderGrid()}
        </div>
      </div>

      {visibleTasks.length === 0 && (
        <div className="pointer-events-none absolute inset-x-0 top-[76px] mx-auto w-fit rounded-xl border border-[#3c3c3c] bg-[#252526]/95 px-4 py-2 text-xs text-[#9da1a6]">
          No posts scheduled in this range
        </div>
      )}

      <TaskPopup
        task={selectedTask}
        position={popupPos}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
};

export default CalendarLarge;
