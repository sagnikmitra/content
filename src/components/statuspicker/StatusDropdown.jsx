import React from "react";
import { statusOptions } from "../../constants/Constants";

const StatusDropdown = ({ open, onClose, onSelect, selected }) => {
  if (!open) {
    return null;
  }

  return (
    <div className="absolute z-50 top-[50px] left-0 w-[180px] bg-[#131313] rounded-md border border-[#1a1b1b] shadow-lg p-2 font-outfit">
      {statusOptions.map((status, idx) => (
        <div
          key={idx}
          onClick={() => {
            onSelect(status);
            onClose();
          }}
          className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer hover:bg-[#1f1f1f] ${
            selected?.label === status.label ? "bg-[#1f1f1f]" : ""
          }`}
        >
          <div
            className="aspect-square w-4 h-4 rounded-[3px] border-[1px]"
            style={{
              backgroundColor: status.bg,
              borderColor: status.color,
            }}
          />
          <p className="text-sm text-[#c6c6c6]">{status.label}</p>
        </div>
      ))}
    </div>
  );
};

export default StatusDropdown;
