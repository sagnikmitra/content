import React from "react";
import Calendar from "../home/Calendar";

const DatePicker = ({ open, onClose, mode, selectedDate, onDateSelect }) => {
  if (!open) {
    return null;
  }

  return (
    <div className="absolute z-50 mt-2 bg-[#0e0e0e] rounded-md shadow-lg p-3 border border-[#1a1b1b] font-outfit">
      <Calendar
        selectedDate={selectedDate}
        onDateSelect={(date) => {
          if (typeof onDateSelect === "function") {
            onDateSelect(date);
          }
          onClose();
        }}
        mode={mode}
      />
    </div>
  );
};

export default DatePicker;
