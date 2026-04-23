import clsx from "clsx";
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { RxCross2 } from "react-icons/rx";
import Select from "react-select";
import { toast } from "react-toastify";
import { updateContent } from "../api/queries";
import {
  formatOptions,
  socialOptions,
  statusOptions,
} from "../constants/Constants";

const EditModal = ({ setIsOpen, content }) => {
  const [editedContent, setEditedContent] = useState({
    instagram: content.instagram,
    twitter: content.twitter,
    linkedin: content.linkedin,
    discord: content.discord,
  });

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

  const [activeView, setActiveView] = useState("instagram");
  const [title, setTitle] = useState(content.title);
  const [description, setDescription] = useState(content.description);
  const [deadline, setDeadline] = useState(new Date(content.deadline));
  const [status, setStatus] = useState(content.status);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("Static");
  const [images, setImages] = useState(content?.pictures || []);

  // Handle text input changes
  const handleChange = (platform, value) => {
    setEditedContent((prev) => ({ ...prev, [platform]: value }));
  };

  // Handle image uploads
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const existingFiles = images.map((file) =>
      (file.name || file.filename).toLowerCase()
    );

    const newFiles = files.filter(
      (file) => !existingFiles.includes(file.name.toLowerCase())
    );

    if (newFiles.length === 0) {
      toast.error("This file is already added.");
      return;
    }

    setImages((prev) => [...prev, ...newFiles]);
  };

  // Handle image removal
  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle content save/update
  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("instagram", editedContent.instagram);
      formData.append("twitter", editedContent.twitter);
      formData.append("linkedin", editedContent.linkedin);
      formData.append("discord", editedContent.discord);
      formData.append("deadline", deadline.toISOString());
      formData.append("status", status);
      formData.append("type", type);
      formData.append("description", description);
      formData.append("title", title);

      // Extract existing images (ones with an ID)
      const existingPictures = images
        .filter((img) => img.id) // Already in DB
        .map(({ id, url, filename }) => ({ id, url, filename }));

      // Send existing images as JSON string
      formData.append("existingPictures", JSON.stringify(existingPictures));

      // Upload only new images (File objects)
      images
        .filter((img) => !img.id) // New images
        .forEach((file) => formData.append("pictures", file));

      await updateContent(formData, content._id);
      toast.success("Content updated successfully!");
      setIsOpen(false);
    } catch {
      toast.error("Failed to update content.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Modal Header */}

      {/* Modal Body */}
      <div className="md:px-2 pt-2 space-y-4 overflow-y-auto h-full">
        {/* Title Input */}
        <input
          type="text"
          className="w-full p-2 rounded-md bg-[#000] text-white placeholder:font-extralight placeholder:text-[14px]"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter title..."
        />

        <input
          type="text"
          className="w-full p-2 rounded-md bg-[#000] text-white placeholder:font-extralight placeholder:text-[14px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short & concise description of the post"
        />

        <div className="hidden md:flex items-center justify-between gap-[10px] ">
          {socialOptions.map((tab) => (
            <div
              key={tab.value}
              className={clsx(
                "border-[#fff] border px-4 py-2 rounded-md w-full text-center transition-all duration-300 cursor-pointer",
                activeView === tab.value ? "bg-white text-black" : "text-white"
              )}
              onClick={() => setActiveView(tab.value)}
            >
              {tab.label}
            </div>
          ))}
        </div>

        <div className="block md:hidden mt-0">
          <Select
            options={socialOptions}
            value={socialOptions.find((option) => option.value === activeView)}
            onChange={(selectedOption) => setActiveView(selectedOption.value)}
            styles={customStyles}
            isSearchable={false}
          />
        </div>

        {activeView === "instagram" ? (
          <textarea
            className="w-full text-base leading-relaxed text-gray-400 bg-[#000] rounded-md p-4 resize-none h-[320px] overflow-y-auto"
            value={editedContent["instagram"]}
            onChange={(e) => handleChange("instagram", e.target.value)}
            placeholder={`Enter ${"instagram"} content...`}
          />
        ) : activeView === "twitter" ? (
          <textarea
            className="w-full text-base leading-relaxed text-gray-400 bg-[#000] rounded-md p-4 resize-none h-[320px] overflow-y-auto"
            value={editedContent["twitter"]}
            onChange={(e) => handleChange("twitter", e.target.value)}
            placeholder={`Enter ${"twitter"} content...`}
          />
        ) : activeView === "linkedin" ? (
          <textarea
            className="w-full text-base leading-relaxed text-gray-400 bg-[#000] rounded-md p-4 resize-none h-[320px] overflow-y-auto"
            value={editedContent["linkedin"]}
            onChange={(e) => handleChange("linkedin", e.target.value)}
            placeholder={`Enter ${"linkedin"} content...`}
          />
        ) : activeView === "discord" ? (
          <textarea
            className="w-full text-base leading-relaxed text-gray-400 bg-[#000] rounded-md p-4 resize-none h-[320px] overflow-y-auto"
            value={editedContent["discord"]}
            onChange={(e) => handleChange("discord", e.target.value)}
            placeholder={`Enter ${"discord"} content...`}
          />
        ) : activeView === "assets" ? (
          <div className="flex flex-col gap-2">
            {images?.map((image, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-4 py-2 bg-[#000] rounded-md"
              >
                <p className="text-gray-300 text-sm truncate">
                  {image.filename || image.name}
                </p>
                <button
                  className="cursor-pointer text-white text-[18px]"
                  onClick={() => handleRemoveImage(index)}
                >
                  <RxCross2 />
                </button>
              </div>
            ))}

            <label
              htmlFor="file-upload"
              className="cursor-pointer mt-2 text-gray-400 border border-dashed border-gray-500 rounded-md px-4 py-2 text-center block"
            >
              Click to Upload Images
            </label>
            <input
              id="file-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between gap-[1rem]">
              <div className="w-1/2">
                <DatePicker
                  selected={deadline}
                  onChange={(date) => setDeadline(date)}
                  showTimeSelect
                  dateFormat="Pp"
                  className="bg-[#000] text-white p-2 rounded-md w-full"
                />
              </div>
              <div className="w-1/2">
                <Select
                  options={statusOptions}
                  value={statusOptions.find(
                    (option) => option.value === status
                  )}
                  onChange={(selectedOption) => setStatus(selectedOption.value)}
                  styles={customStyles}
                  isSearchable={false}
                />
              </div>
            </div>

            <div className="w-[49%] mt-[1rem]">
              <Select
                options={formatOptions}
                value={formatOptions.find((option) => option.value === type)}
                onChange={(selectedOption) => setType(selectedOption.value)}
                styles={customStyles}
                isSearchable={false}
              />
            </div>
          </div>
        )}

        <div className="flex justify-center mt-6 absolute bottom-[14px] md:px-6 px-4 w-full -translate-x-2/4  left-2/4">
          <button
            className={`text-[16px] w-full font-normal px-4 py-2 text-white rounded-md focus:outline-none ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-[#5540fb] hover:bg-[#5540fb] cursor-pointer"
            }`}
            onClick={() => {
              handleSave();
            }}
            disabled={loading}
          >
            {loading ? "Saving..." : "Publish Post"}
          </button>
        </div>
      </div>
    </>
  );
};

export default EditModal;
