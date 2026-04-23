import { format, isEqual, setHours, setMinutes } from "date-fns";
import React, { useEffect, useRef, useState } from "react";

const generateTimeSlots = (interval = 30) => {
  const slots = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += interval) {
      slots.push({ hours: h, minutes: m });
    }
  }
  return slots;
};

const TimePicker = ({ open, onClose, onSelect, selected }) => {
  const wrapperRef = useRef();
  const selectedRef = useRef(null);
  const [search, setSearch] = useState("");
  const timeSlots = generateTimeSlots();

  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const matchesSearch = ({ hours, minutes }) => {
    if (!search) {
      return true;
    }

    const input = search.toLowerCase().replace(/\s+/g, "");
    const numericInput = input.replace(/\D/g, "");

    // Format display time in 12-hour digit form, e.g.:
    // 4:30 AM => 430, 11:00 PM => 1100
    const hour = hours % 12 === 0 ? 12 : hours % 12;
    const displayDigits = `${hour}${minutes === 30 ? "30" : "00"}`;

    // Support partial matches like 4, 43, 430, etc.
    return displayDigits.startsWith(numericInput);
  };

  const filteredSlots = timeSlots.filter(matchesSearch);

  return (
    <div
      ref={wrapperRef}
      className="absolute z-50 w-[150px] max-h-[300px] overflow-y-auto bg-[#0e0e0e] rounded-md shadow-lg border border-[#1a1b1b] p-2 font-outfit mt-2"
    >
      <input
        type="text"
        placeholder="Search"
        className="w-full p-2 mb-2 text-sm rounded bg-[#1a1b1b] text-white border border-[#2a2a2a] outline-none"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filteredSlots.map(({ hours, minutes }, i) => {
        const time = setMinutes(setHours(new Date(), hours), minutes);
        const isSelected =
          selected &&
          isEqual(
            setMinutes(
              setHours(new Date(), selected.getHours()),
              selected.getMinutes()
            ),
            time
          );

        return (
          <div
            key={i}
            ref={isSelected ? selectedRef : null}
            onClick={() => {
              onSelect(time);
              onClose();
            }}
            className={`text-[#dfdede] text-sm px-3 py-2 hover:bg-[#004a77] hover:text-white rounded cursor-pointer ${
              isSelected ? "bg-[#004a77] text-white font-medium" : ""
            }`}
          >
            {format(time, "h:mm a")}
          </div>
        );
      })}

      {filteredSlots.length === 0 && (
        <div className="text-gray-400 text-sm px-3 py-2">
          No options available
        </div>
      )}
    </div>
  );
};

export default TimePicker;
