import React, { useState } from "react";
import { CiCalendar } from "react-icons/ci";
import { IoSettingsOutline, IoVideocamOutline } from "react-icons/io5";
import { SlPicture } from "react-icons/sl";
import { getContentById } from "../api/queries"; // Import the API function
import ViewModal from "./ViewModal";

const Content = ({ content }) => {
  const [openContentModal, setOpenContentModal] = useState(false);
  const [contentDetails, setContentDetails] = useState(null); // Store fetched content

  const handleViewClick = async () => {
    try {
      const data = await getContentById(content._id);
      setContentDetails(data);
      setOpenContentModal(true);
    } catch (error) {
      console.error("Error fetching content details:", error);
    }
  };

  const formatDeadline = (deadline) => {
    const date = new Date(deadline);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    // Remove time part for accurate comparison
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() < today.getTime()) {
      return "Overdue";
    }
    if (date.getTime() === today.getTime()) {
      return "By Today";
    }
    if (date.getTime() === tomorrow.getTime()) {
      return "By Tomorrow";
    }

    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
    });
  };

  return (
    <div className="border-solid border-[1px] border-[#fff3] rounded-[10px] shadow-md shadow-[#ffffff0c] font-outfit md:w-[350px] h-[auto] p-4 group contentbox relative cursor-pointer">
      <p className="text-white text-[23px] w-full flex items-start m-0 p-0 justify-between">
        <span className="w-full truncate whitespace-nowrap overflow-hidden leading-[25px] font-semibold tracking-[1.1px]">
          {content?.title}
        </span>
      </p>

      <p className="text-[#ffffffa9] text-[13px] w-full flex items-start m-0 p-0 justify-between">
        <span className="w-full truncate whitespace-nowrap overflow-hidden leading-[25px] font-light tracking-[1.1px]">
          {content?.description}
        </span>
      </p>

      <div className="font-outfit w-auto mt-10 flex items-center justify-between gap-[10px]">
        <div className="flex items-center gap-[10px]">
          {content?.type === "Reel" ? (
            <div className="border-[#1e4658] border-[1px] text-[13px] text-[#78b1ca] bg-[#042f43e2] px-[5px] py-[2px] rounded-[5px] inline-block">
              <span className="flex items-center gap-[4px]">
                <IoVideocamOutline className="text-[15px]" /> Reel
              </span>
            </div>
          ) : (
            <div className="border-[#246942] border-[1px] text-[13px] text-[#78ca9e] bg-[#044327e2] px-[5px] py-[2px] rounded-[5px] inline-block">
              <span className="flex items-center gap-[4px]">
                <SlPicture className="text-[13px]" /> Static
              </span>
            </div>
          )}

          <div className="border-[#5749d6] border-[1px] text-[13px] text-[#ffffffd8] px-[5px] py-[2px] rounded-[5px] inline-block">
            <span className="flex items-center gap-[7px]">
              <CiCalendar className="text-[15px]" />{" "}
              {formatDeadline(content?.deadline)}
            </span>
          </div>
        </div>

        <IoSettingsOutline
          className="text-[#ffffffd8] cursor-pointer text-[20px] block md:hidden md:group-hover:block duration-200 ease-in-out transition-all"
          onClick={() => {
            handleViewClick();
          }}
        />
      </div>

      {openContentModal && (
        <ViewModal setIsOpen={setOpenContentModal} content={contentDetails} />
      )}
    </div>
  );
};

export default Content;
