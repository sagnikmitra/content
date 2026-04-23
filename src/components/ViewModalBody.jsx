import clsx from "clsx";
import React, { useState } from "react";
import { MdContentCopy, MdOutlineSaveAlt } from "react-icons/md";
import Select from "react-select";
import { toast } from "react-toastify";

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
        backgroundColor: "#000",
        borderColor: state.isFocused ? "#484d5d" : "#484d5d", // Change border color on focus
        borderWidth: 0,
        color: "#ffffffe0",
        borderStyle: "solid",
        cursor: "pointer",
        borderRadius: "6px",
        width: "100%",
        boxShadow: "none",
        "&:hover": {
          borderColor: "#484d5d", // Correct way to add hover effect
        },
      };
    },

    option: (provided) => ({
      ...provided,
      color: "#ffffff",
      cursor: "pointer",
      backgroundColor: "#484d5d",
      padding: "10px",
      "&:hover": {
        backgroundColor: "#000",
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#ffffff",

      padding: "5px 10px",
      borderRadius: "6px",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#484d5d",

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
              "border-[#fff] border px-4 py-2 rounded-md w-[100px] text-center transition-all duration-300",
              tab.condition
                ? "cursor-pointer"
                : "opacity-50 cursor-not-allowed",
              activeView === tab.id ? "bg-white text-black" : "text-white"
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
        <p className="text-base leading-relaxed text-gray-400 whitespace-pre-line bg-[#000] rounded-md p-4 relative h-[320px] overflow-y-auto">
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
              className="flex items-center justify-between px-4 py-2 bg-[#000] rounded-md"
            >
              <p className="text-gray-300 text-sm truncate">{image.filename}</p>
              <button
                className="cursor-pointer text-white text-[18px]"
                onClick={() => {
                  const href =
                    image.url ||
                    (image.id
                      ? `https://drive.google.com/uc?export=download&id=${image.id}`
                      : "");
                  if (!href) {
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
