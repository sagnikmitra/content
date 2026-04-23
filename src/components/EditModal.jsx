import clsx from "clsx";
import { format } from "date-fns";
import React, { useMemo, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { toast } from "react-toastify";
import { updateContent } from "../api/queries";
import { statusOptions } from "../constants/Constants";
import { formatDateKey, parseDateValue } from "../utils/date";
import {
  normalizeExistingPictures,
  uploadPicturesToStorage,
} from "../utils/supabaseStorage";

const contentTabs = [
  { value: "instagram", label: "Instagram" },
  { value: "twitter", label: "Twitter" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "discord", label: "Discord" },
  { value: "assets", label: "Assets" },
  { value: "schedule", label: "Schedule" },
];

const toTimeInput = (value) => {
  const parsed = parseDateValue(value);
  return format(parsed, "HH:mm");
};

const EditModal = ({ setIsOpen, content }) => {
  const [activeView, setActiveView] = useState("instagram");
  const [title, setTitle] = useState(content.title || "");
  const [description, setDescription] = useState(content.description || "");
  const [selectedDate, setSelectedDate] = useState(
    formatDateKey(parseDateValue(content.date))
  );
  const [selectedTime, setSelectedTime] = useState(toTimeInput(content.time));
  const [selectedType, setSelectedType] = useState(content.type || "static");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState(content?.pictures || []);
  const [editedContent, setEditedContent] = useState({
    instagram: content.instagram || "",
    twitter: content.twitter || "",
    linkedin: content.linkedin || "",
    discord: content.discord || "",
  });

  const activeStatus = useMemo(
    () =>
      statusOptions.find((option) => option.type === selectedType) ||
      statusOptions[0],
    [selectedType]
  );

  const handleChange = (platform, value) => {
    setEditedContent((prev) => ({ ...prev, [platform]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) {
      return;
    }

    const existingFiles = images.map((file) =>
      (file.name || file.filename || "").toLowerCase()
    );

    const newFiles = files.filter(
      (file) => !existingFiles.includes(file.name.toLowerCase())
    );

    if (!newFiles.length) {
      toast.error("This file is already added.");
      return;
    }

    setImages((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      if (!title.trim() || !description.trim()) {
        throw new Error("Title and description are required");
      }

      if (!selectedDate || !selectedTime) {
        throw new Error("Date and time are required");
      }

      const timeValue = new Date(`${selectedDate}T${selectedTime}:00`);
      if (Number.isNaN(timeValue.getTime())) {
        throw new Error("Invalid date/time");
      }

      const existingPictures = normalizeExistingPictures(images);
      const newFiles = images.filter(
        (image) => !image?.id && !image?.path && image instanceof File
      );
      const uploadedPictures = await uploadPicturesToStorage(newFiles);
      const pictures = [...existingPictures, ...uploadedPictures];

      const payload = {
        title: title.trim(),
        description: description.trim(),
        instagram: editedContent.instagram,
        twitter: editedContent.twitter,
        linkedin: editedContent.linkedin,
        discord: editedContent.discord,
        date: selectedDate,
        time: timeValue.toISOString(),
        type: selectedType,
        pictures,
      };

      await updateContent(payload, content._id);
      toast.success("Content updated successfully!");
      setIsOpen(false);
    } catch (error) {
      toast.error(error?.message || "Failed to update content.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 overflow-y-auto pt-2 md:px-2">
      <input
        type="text"
        className="w-full rounded-md border border-[#3c3c3c] bg-[#252526] p-2 text-[#d4d4d4] placeholder:text-[#9da1a6]"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter title..."
      />

      <input
        type="text"
        className="w-full rounded-md border border-[#3c3c3c] bg-[#252526] p-2 text-[#d4d4d4] placeholder:text-[#9da1a6]"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Short description"
      />

      <div className="flex flex-wrap items-center gap-2">
        {contentTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={clsx(
              "rounded-md border px-3 py-2 text-sm transition",
              activeView === tab.value
                ? "border-[#666] bg-[#37373d] text-[#d4d4d4]"
                : "border-[#3c3c3c] bg-[#252526] text-[#9da1a6]"
            )}
            onClick={() => setActiveView(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {["instagram", "twitter", "linkedin", "discord"].includes(activeView) && (
        <textarea
          className="h-[320px] w-full resize-none rounded-md border border-[#3c3c3c] bg-[#252526] p-4 text-base leading-relaxed text-[#d4d4d4]"
          value={editedContent[activeView]}
          onChange={(e) => handleChange(activeView, e.target.value)}
          placeholder={`Enter ${activeView} content...`}
        />
      )}

      {activeView === "assets" && (
        <div className="flex flex-col gap-2">
          {images?.map((image, index) => (
            <div
              key={`${image.filename || image.name || "file"}-${index}`}
              className="flex items-center justify-between rounded-md border border-[#3c3c3c] bg-[#252526] px-4 py-2"
            >
              <p className="truncate text-sm text-[#d4d4d4]">
                {image.filename || image.name}
              </p>
              <button
                className="cursor-pointer text-[18px] text-[#9da1a6] transition hover:text-[#d4d4d4]"
                onClick={() => handleRemoveImage(index)}
                type="button"
              >
                <RxCross2 />
              </button>
            </div>
          ))}

          <label
            htmlFor="edit-file-upload"
            className="mt-2 cursor-pointer rounded-md border border-dashed border-[#4f4f4f] bg-[#252526] px-4 py-3 text-center text-[#d4d4d4] transition hover:bg-[#2d2d30]"
          >
            Select files to upload
          </label>
          <input
            id="edit-file-upload"
            type="file"
            multiple
            accept="*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
      )}

      {activeView === "schedule" && (
        <div className="grid gap-3 rounded-md border border-[#3c3c3c] bg-[#252526] p-4">
          <label className="grid gap-1">
            <span className="text-xs text-[#9da1a6]">Date</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-md border border-[#3c3c3c] bg-[#1e1e1e] px-3 py-2 text-[#d4d4d4]"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs text-[#9da1a6]">Time</span>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="rounded-md border border-[#3c3c3c] bg-[#1e1e1e] px-3 py-2 text-[#d4d4d4]"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs text-[#9da1a6]">Type</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="rounded-md border border-[#3c3c3c] bg-[#1e1e1e] px-3 py-2 text-[#d4d4d4]"
            >
              {statusOptions.map((status) => (
                <option key={status.type} value={status.type}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>

          <div className="text-xs text-[#9da1a6]">
            Active status: {activeStatus.label}
          </div>
        </div>
      )}

      <div className="sticky bottom-0 mt-3 flex items-center justify-end gap-3 bg-[#1e1e1e] py-2">
        <button
          type="button"
          className="rounded-md border border-[#3c3c3c] bg-[#252526] px-4 py-2 text-[#d4d4d4]"
          onClick={() => setIsOpen(false)}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          className="rounded-md border border-[#666] bg-[#3a3d41] px-4 py-2 text-[#f0f0f0] disabled:cursor-not-allowed disabled:opacity-60"
          onClick={handleSave}
          disabled={loading}
          type="button"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default EditModal;
