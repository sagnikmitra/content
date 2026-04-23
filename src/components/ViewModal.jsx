import clsx from "clsx";
import React, { useState } from "react";
import { FaRegEdit, FaRegEye } from "react-icons/fa";
import EditModal from "./EditModal";
import ViewModalBody from "./ViewModalBody";

const ViewModal = ({ setIsOpen, content }) => {
  const [activeView, setActiveView] = useState("view");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-[#000000ba] font-outfit">
      <div
        className={clsx(
          "relative p-4 md:w-full w-[93%] max-w-2xl  bg-[#171717] rounded-lg shadow-sm  overflow-hidden",
          activeView === "view"
            ? "md:h-[510px] h-[460px]"
            : "md:h-[650px] h-[620px]"
        )}
      >
        <div className="flex items-center justify-between md:p-4 p-0 pt-0 border-b border-gray-600">
          <h3 className="text-[25px] font-semibold text-white flex items-center gap-[1rem] overflow-x-auto whitespace-nowrap max-w-[80%] scrollbar-hide">
            {activeView === "view" ? content?.title : "Edit Content"}{" "}
          </h3>
          <div className="flex items-center gap-[5px]">
            <button
              onClick={() => {
                setActiveView(activeView === "view" ? "edit" : "view");
              }}
              className="text-gray-400 cursor-pointer bg-transparent hover:bg-gray-600 hover:text-white rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
            >
              {activeView === "view" ? (
                <FaRegEdit className="text-[16px]" />
              ) : (
                <FaRegEye className="text-[16px]" />
              )}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 cursor-pointer bg-transparent hover:bg-gray-600 hover:text-white rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
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
