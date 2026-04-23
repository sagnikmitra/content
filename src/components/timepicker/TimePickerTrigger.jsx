import clsx from "clsx";
import { format } from "date-fns";
import React, { useEffect, useRef, useState } from "react";
import { RxCaretDown } from "react-icons/rx";
import TimePicker from "./TimePicker";

const TimePickerTrigger = ({ selectedTime, setSelectedTime, mode }) => {
  const [isOpen, setIsOpen] = useState(false);
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
          "flex items-center justify-between gap-2 px-4 py-2 rounded-md border border-[#1a1b1b] bg-[#0e0e0e] font-outfit text-[#e7e7e7] font-normal tracking-[1.2px] text-[18px] min-w-[150px]",
          mode === "view" ? "cursor-default" : "cursor-pointer"
        )}
      >
        <span>{format(selectedTime, "h:mm a")}</span>
        {mode !== "view" && (
          <RxCaretDown
            className={`transition-transform duration-300 text-[20px] ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      <TimePicker
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onSelect={(time) => setSelectedTime(time)}
        selected={selectedTime}
      />
    </div>
  );
};

export default TimePickerTrigger;
