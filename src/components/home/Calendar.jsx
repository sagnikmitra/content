import clsx from "clsx";
import {
  addDays,
  addMonths,
  format,
  getDaysInMonth,
  isSameDay,
  isSameMonth,
  setDate,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import React from "react";
import { RxCaretLeft, RxCaretRight } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import {
  selectSelectedDate,
  setSelectedDate,
} from "../../store/slices/globalSlice";
import { selectTask } from "../../store/slices/taskSlice";
import { parseDateValue } from "../../utils/date";

const Calendar = ({ mode }) => {
  const task = useSelector(selectTask);
  const globalSelectedDate = useSelector(selectSelectedDate);
  const selectedDate =
    mode === "view" || mode === "create"
      ? globalSelectedDate
      : parseDateValue(task.date);

  const dispatch = useDispatch();

  const weekStartsOnOption = { weekStartsOn: 1 }; // Monday start
  const monthStart = startOfMonth(selectedDate);
  const startDate = startOfWeek(monthStart, weekStartsOnOption);

  const navigateMonth = (direction) => {
    const currentDay = selectedDate
      ? selectedDate.getDate()
      : new Date().getDate();
    let newDate;

    if (direction === "prev") {
      newDate = subMonths(selectedDate, 1);
    } else {
      newDate = addMonths(selectedDate, 1);
    }

    // Handle cases where the target month doesn't have the same day
    const daysInTargetMonth = getDaysInMonth(newDate);
    const targetDay = Math.min(currentDay, daysInTargetMonth);

    const dateWithSameDay = setDate(newDate, targetDay);

    dispatch(setSelectedDate(dateWithSameDay));
  };

  const nextMonth = () => navigateMonth("next");
  const prevMonth = () => navigateMonth("prev");

  const handleDateClick = (day) => {
    if (!isSameMonth(day, monthStart)) {
      // setCurrentDate(
      //   day < monthStart ? subMonths(selectedDate, 1) : addMonths(selectedDate, 1)
      // );

      dispatch(
        setSelectedDate(
          day < monthStart ? subMonths(selectedDate, 1) : addMonths(selectedDate, 1)
        )
      );
    }

    //setCurrentDate(day);
    dispatch(setSelectedDate(day));
  };

  const renderHeader = () => (
    <div className="flex justify-between items-center font-outfit px-2 py-2 text-[#dbe8ff]">
      <h2 className="text-lg font-semibold">
        {format(selectedDate, "MMMM yyyy")}
      </h2>

      <div className="flex items-center gap-2">
        <RxCaretLeft
          onClick={prevMonth}
          className="text-[20px] cursor-pointer"
        />

        <RxCaretRight
          onClick={nextMonth}
          className="text-[20px] cursor-pointer"
        />
      </div>
    </div>
  );

  const renderDaysOfWeek = () => {
    const dayNames = ["M", "T", "W", "T", "F", "S", "S"];
    return (
      <div className="grid grid-cols-7 text-[#bbd2f6] font-outfit mb-1 font-semibold text-center text-xs">
        {dayNames.map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const cells = [];
    let day = startDate;

    for (let i = 0; i < 42; i++) {
      const dateForCell = day;
      const dayOfMonth = format(day, "d");
      const isCurrentMonth = isSameMonth(day, monthStart);
      const isToday = isSameDay(day, new Date());
      const isSelected = selectedDate && isSameDay(day, selectedDate);

      cells.push(
        <div
          key={day.toISOString()}
          onClick={() => handleDateClick(dateForCell)}
          className="min-h-[30px] p-1 text-[12px] relative cursor-pointer flex items-center justify-center rounded-lg hover:bg-[#1d355a]"
        >
          {!isToday && isSelected && (
            <div className="absolute w-6 h-6 rounded-full bg-[#004a77] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          )}

          {isToday && (
            <div className="absolute w-6 h-6 rounded-full bg-[#a8c9fb] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          )}
          <span
            className={clsx(
              "z-10",
              isCurrentMonth ? "text-[#c6c6c6]" : "text-[#c6c6c6] opacity-50",
              isToday && "text-black font-medium",
              !isToday && isSelected && "text-white font-medium"
            )}
          >
            {dayOfMonth}
          </span>
        </div>
      );

      day = addDays(day, 1);
    }

    return <div className="grid grid-cols-7">{cells}</div>;
  };

  return (
    <div className="w-full max-w-md rounded-md overflow-hidden font-outfit mx-auto">
      {renderHeader()}
      {renderDaysOfWeek()}
      {renderCells()}
    </div>
  );
};

export default Calendar;
