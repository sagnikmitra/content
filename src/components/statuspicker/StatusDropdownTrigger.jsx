import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";
import { RxCaretDown } from "react-icons/rx";
import StatusDropdown from "./StatusDropdown";

const StatusDropdownTrigger = ({ selectedStatus, setSelectedStatus, mode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef();

  // Detect clicks outside
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

  const handleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={() => {
          if (mode === "view") {
            return;
          }

          handleOpen();
        }}
        className={clsx(
          "flex items-center justify-between  gap-2 px-4 py-2 rounded-md border border-[#1a1b1b] bg-[#0e0e0e] font-outfit text-[#e7e7e7] font-normal tracking-[1.2px] text-[16px] min-w-[180px]",
          mode === "view" ? "cursor-default" : "cursor-pointer"
        )}
      >
        {selectedStatus ? (
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-[3px] border"
              style={{
                backgroundColor: selectedStatus.bg,
                borderColor: selectedStatus.color,
              }}
            />
            <span>{selectedStatus.label}</span>
          </div>
        ) : (
          <span className="text-[#888]">Choose Status</span>
        )}
        {mode !== "view" && (
          <RxCaretDown
            className={`transition-transform duration-300 text-[20px] ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      <StatusDropdown
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onSelect={(status) => setSelectedStatus(status)}
        selected={selectedStatus}
      />
    </div>
  );
};

export default StatusDropdownTrigger;
