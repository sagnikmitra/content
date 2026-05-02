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
  const globalSelectedDate = parseDateValue(useSelector(selectSelectedDate));
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
    <div className="flex items-center justify-between px-2 py-2 font-outfit text-[#d4d4d4]">
      <h2 className="text-base font-semibold">
        {format(selectedDate, "MMMM yyyy")}
      </h2>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => dispatch(setSelectedDate(new Date()))}
          className="rounded-md border border-[#3c3c3c] bg-[#2d2d30] px-2 py-1 text-[11px] font-semibold text-[#d4d4d4]"
        >
          Today
        </button>
        <button type="button" onClick={prevMonth}>
          <RxCaretLeft className="cursor-pointer text-[20px]" />
        </button>
        <button type="button" onClick={nextMonth}>
          <RxCaretRight className="cursor-pointer text-[20px]" />
        </button>
      </div>
    </div>
  );

  const renderDaysOfWeek = () => {
    const dayNames = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
    return (
      <div className="mb-1 grid grid-cols-7 text-center text-[11px] font-semibold text-[#9da1a6]">
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
          className="relative flex min-h-[30px] cursor-pointer items-center justify-center rounded-lg p-1 text-[12px] hover:bg-[#2f2f34]"
        >
          {!isToday && isSelected && (
            <div className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#4b4b52]" />
          )}

          {isToday && (
            <div className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d4d4d4]" />
          )}
          <span
            className={clsx(
              "z-10",
              isCurrentMonth ? "text-[#d4d4d4]" : "text-[#d4d4d4] opacity-45",
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
    <div className="mx-auto w-full max-w-md overflow-hidden rounded-md font-outfit">
      {renderHeader()}
      {renderDaysOfWeek()}
      {renderCells()}
    </div>
  );
};

export default Calendar;
