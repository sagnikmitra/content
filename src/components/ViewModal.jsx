import clsx from "clsx";
import React, { useState } from "react";
import { FaRegEdit, FaRegEye } from "react-icons/fa";
import EditModal from "./EditModal";
import ViewModalBody from "./ViewModalBody";

const ViewModal = ({ setIsOpen, content }) => {
  const [activeView, setActiveView] = useState("view");

  return (
    <div className="fixed inset-0 z-50 flex h-full w-full items-center justify-center bg-[#000000c2] font-outfit">
      <div
        className={clsx(
          "relative w-[93%] max-w-2xl overflow-hidden rounded-lg border border-[#3c3c3c] bg-[#1e1e1e] p-4 shadow-2xl md:w-full",
          activeView === "view"
            ? "md:h-[510px] h-[460px]"
            : "md:h-[650px] h-[620px]"
        )}
      >
        <div className="flex items-center justify-between border-b border-[#3c3c3c] p-0 pt-0 md:p-4">
          <h3 className="scrollbar-hide flex max-w-[80%] items-center gap-[1rem] overflow-x-auto whitespace-nowrap text-[25px] font-semibold text-[#d4d4d4]">
            {activeView === "view" ? content?.title : "Edit Content"}{" "}
          </h3>
          <div className="flex items-center gap-[5px]">
            <button
              onClick={() => {
                setActiveView(activeView === "view" ? "edit" : "view");
              }}
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-transparent text-sm text-[#9da1a6] transition hover:bg-[#2d2d30] hover:text-[#d4d4d4]"
              type="button"
            >
              {activeView === "view" ? (
                <FaRegEdit className="text-[16px]" />
              ) : (
                <FaRegEye className="text-[16px]" />
              )}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-transparent text-sm text-[#9da1a6] transition hover:bg-[#2d2d30] hover:text-[#d4d4d4]"
              type="button"
            >
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7L1 13"
                />
              </svg>
            </button>
          </div>
        </div>

        {activeView === "view" ? (
          <ViewModalBody content={content} />
        ) : (
          <EditModal content={content} setIsOpen={setIsOpen} />
        )}
      </div>
    </div>
  );
};

export default ViewModal;
