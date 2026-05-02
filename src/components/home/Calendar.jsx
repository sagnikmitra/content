import clsx from "clsx";
import {
  addDays,
  addMonths,
  format,
  getDaysInMonth,
  isBefore,
  isSameDay,
  isSameMonth,
  setDate,
  startOfMonth,
  startOfDay,
  startOfWeek,
  subMonths,
} from "date-fns";
import React, { useEffect, useState } from "react";
import { RxCaretLeft, RxCaretRight } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import {
  selectSelectedDate,
  setSelectedDate,
} from "../../store/slices/globalSlice";
import { selectTask } from "../../store/slices/taskSlice";
import { parseDateValue } from "../../utils/date";
import { isPastDate } from "../../utils/schedule";

const Calendar = ({ mode, selectedDate: controlledDate, onDateSelect }) => {
  const task = useSelector(selectTask);
  const globalSelectedDate = parseDateValue(useSelector(selectSelectedDate));
  const selectedDate = controlledDate
    ? parseDateValue(controlledDate)
    : mode === "view" || mode === "create"
      ? globalSelectedDate
      : parseDateValue(task.date);
  const selectedDateTime = selectedDate.getTime();
  const [viewDate, setViewDate] = useState(selectedDate);
  const preventsPastDates = mode === "create" || mode === "edit";

  const dispatch = useDispatch();

  useEffect(() => {
    setViewDate(selectedDate);
  }, [selectedDateTime]);

  const weekStartsOnOption = { weekStartsOn: 1 }; // Monday start
  const monthStart = startOfMonth(viewDate);
  const startDate = startOfWeek(monthStart, weekStartsOnOption);

  const navigateMonth = (direction) => {
    const currentDay = viewDate ? viewDate.getDate() : new Date().getDate();
    let newDate;

    if (direction === "prev") {
      newDate = subMonths(viewDate, 1);
    } else {
      newDate = addMonths(viewDate, 1);
    }

    // Handle cases where the target month doesn't have the same day
    const daysInTargetMonth = getDaysInMonth(newDate);
    const targetDay = Math.min(currentDay, daysInTargetMonth);

    const dateWithSameDay = setDate(newDate, targetDay);

    setViewDate(dateWithSameDay);
    if (typeof onDateSelect !== "function") {
      dispatch(setSelectedDate(dateWithSameDay));
    }
  };

  const nextMonth = () => navigateMonth("next");
  const prevMonth = () => navigateMonth("prev");
  const selectDate = (date) => {
    if (typeof onDateSelect === "function") {
      onDateSelect(date);
    } else {
      dispatch(setSelectedDate(date));
    }
  };

  const handleDateClick = (day) => {
    if (preventsPastDates && isPastDate(day)) {
      return;
    }

    if (!isSameMonth(day, monthStart)) {
      setViewDate(day);
    }

    //setCurrentDate(day);
    selectDate(day);
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between px-2 py-2 font-outfit text-[#d4d4d4]">
      <h2 className="text-base font-semibold">
        {format(viewDate, "MMMM yyyy")}
      </h2>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            const today = new Date();
            setViewDate(today);
            selectDate(today);
          }}
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
      const isDisabledPast =
        preventsPastDates && isBefore(day, startOfDay(new Date()));

      cells.push(
        <div
          key={day.toISOString()}
          onClick={() => handleDateClick(dateForCell)}
          className={clsx(
            "relative flex min-h-[30px] items-center justify-center rounded-lg p-1 text-[12px]",
            isDisabledPast
              ? "cursor-not-allowed opacity-35"
              : "cursor-pointer hover:bg-[#2f2f34]"
          )}
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
