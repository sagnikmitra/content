import clsx from "clsx";
import { format } from "date-fns";
import React, { useEffect, useRef, useState } from "react";
import { RxCaretDown } from "react-icons/rx";
import { useSelector } from "react-redux";
import { selectSelectedDate } from "../../store/slices/globalSlice";
import { selectTask } from "../../store/slices/taskSlice";
import { parseDateValue } from "../../utils/date";
import DatePicker from "./DatePicker";

const DatePickerTrigger = ({ mode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedDate = parseDateValue(useSelector(selectSelectedDate));
  const task = useSelector(selectTask);
  const wrapperRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        onClick={() => {
          if (mode === "view") {
            return;
          }

          setIsOpen((prev) => !prev);
        }}
        className={clsx(
          "flex items-center justify-between gap-2 px-4 py-2  rounded-md border border-[#1a1b1b] bg-[#0e0e0e] font-outfit text-[#e7e7e7] font-normal tracking-[1.2px] text-[18px] min-w-[275px]",
          mode === "view" ? "cursor-default" : "cursor-pointer"
        )}
      >
        <span>
          {format(
            mode === "view" || mode === "create"
              ? selectedDate
              : parseDateValue(task?.date),
            "EEEE, MMMM d"
          )}
        </span>
        {mode !== "view" && (
          <RxCaretDown
            className={`transition-transform duration-300 text-[20px] ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      <DatePicker open={isOpen} onClose={() => setIsOpen(false)} mode={mode} />
    </div>
  );
};

export default DatePickerTrigger;
