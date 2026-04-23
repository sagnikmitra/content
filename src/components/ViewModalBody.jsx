import clsx from "clsx";
import React, { useState } from "react";
import { MdContentCopy, MdOutlineSaveAlt } from "react-icons/md";
import Select from "react-select";
import { toast } from "react-toastify";
import { resolvePictureDownloadUrl } from "../utils/supabaseStorage";

const ViewModalBody = ({ content }) => {
  const [activeView, setActiveView] = useState("instagram");

  const socialOptions = [
    { value: "instagram", label: "Instagram" },
    { value: "twitter", label: "Twitter" },
    { value: "linkedin", label: "Linkedin" },
    { value: "discord", label: "Discord" },
    { value: "assets", label: "Assets" },
  ];

  const platforms = {
    instagram: content.instagram,
    twitter: content.twitter,
    linkedin: content.linkedin,
    discord: content.discord,
  };

  const copyToClipboard = (text) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    toast.success("Copied to clipboard!");
  };

  const customStyles = {
    control: (provided, state) => {
      return {
        ...provided,
        backgroundColor: "#252526",
        borderColor: state.isFocused ? "#4f4f4f" : "#3c3c3c",
        borderWidth: 1,
        color: "#d4d4d4",
        borderStyle: "solid",
        cursor: "pointer",
        borderRadius: "6px",
        width: "100%",
        boxShadow: "none",
        "&:hover": {
          borderColor: "#4f4f4f",
        },
      };
    },

    option: (provided) => ({
      ...provided,
      color: "#d4d4d4",
      cursor: "pointer",
      backgroundColor: "#2d2d30",
      padding: "10px",
      "&:hover": {
        backgroundColor: "#333338",
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#d4d4d4",
      padding: "5px 10px",
      borderRadius: "6px",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#252526",
      zIndex: 9999,
      borderRadius: "6px",
      marginTop: "5px",
    }),
  };

  const tabs = [
    {
      id: "instagram",
      label: "Instagram",
      condition: content?.instagram !== "",
    },
    { id: "twitter", label: "Twitter", condition: content?.twitter !== "" },
    { id: "linkedin", label: "Linkedin", condition: content?.linkedin !== "" },
    {
      id: "discord",
      label: "Discord",
      condition: content?.discord !== "",
    },
    { id: "assets", label: "Assets", condition: content?.pictures?.length > 0 },
  ];

  return (
    <div className="md:p-4 space-y-4 overflow-y-auto h-full">
      <div className="md:flex hidden items-center justify-center gap-[10px] ">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={clsx(
              "w-[100px] rounded-md border border-[#3c3c3c] bg-[#252526] px-4 py-2 text-center text-[#d4d4d4] transition-all duration-300",
              tab.condition
                ? "cursor-pointer"
                : "opacity-50 cursor-not-allowed",
              activeView === tab.id ? "border-[#666] bg-[#37373d]" : ""
            )}
            onClick={() => {
              if (!tab.condition) {
                return;
              }
              setActiveView(tab.id);
            }}
          >
            {tab.label}
          </div>
        ))}
      </div>

      <div className="block md:hidden mt-4">
        <Select
          options={socialOptions}
          value={socialOptions.find((option) => option.value === activeView)}
          onChange={(selectedOption) => setActiveView(selectedOption.value)}
          styles={customStyles}
          isSearchable={false}
        />
      </div>

      {activeView in platforms ? (
        <p className="relative h-[320px] overflow-y-auto whitespace-pre-line rounded-md border border-[#3c3c3c] bg-[#252526] p-4 text-base leading-relaxed text-[#c5c5c5]">
          {platforms[activeView]}

          <MdContentCopy
            className="absolute top-[10px] right-[10px] text-[18px] cursor-pointer"
            onClick={() => copyToClipboard(platforms[activeView])}
          />
        </p>
      ) : (
        <div className="mt-10 space-y-2">
          {content?.pictures?.map((image, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-4 py-2 bg-[#252526] border border-[#3c3c3c] rounded-md"
            >
              <p className="text-[#d4d4d4] text-sm truncate">{image.filename}</p>
              <button
                className="cursor-pointer text-[#d4d4d4] text-[18px]"
                onClick={() => {
                  const href = resolvePictureDownloadUrl(image);
                  if (!href) {
                    toast.error("Download link unavailable");
                    return;
                  }
                  const link = document.createElement("a");
                  link.href = href;
                  link.download = image.filename;
                  link.target = "_blank";
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                <MdOutlineSaveAlt />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewModalBody;
