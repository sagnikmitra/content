import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";
import { AiOutlineDiscord } from "react-icons/ai";
import { FaXTwitter } from "react-icons/fa6";
import { GrLinkedinOption } from "react-icons/gr";
import { IoLogoInstagram } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createContent, updateContent } from "../api/queries";
import DatePickerTrigger from "../components/datepicker/DatePickerTrigger";
import FilePickerTrigger from "../components/filepicker/FilePickerTrigger";
import StatusDropdownTrigger from "../components/statuspicker/StatusDropdownTrigger";
import TimePickerTrigger from "../components/timepicker/TimePickerTrigger";
import { statusOptions } from "../constants/Constants";
import { selectSelectedDate } from "../store/slices/globalSlice";
import { resetTask } from "../store/slices/taskSlice";
import { formatDateKey, parseDateValue } from "../utils/date";
import {
  normalizeExistingPictures,
  uploadPicturesToStorage,
} from "../utils/supabaseStorage";

const CreatePost = ({ mode }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const task = useSelector((state) => state.task.task);
  const globallySelectedDate = useSelector(selectSelectedDate);
  const selectedDate =
    mode === "edit" ? parseDateValue(task.date) : globallySelectedDate;

  useEffect(() => {
    if (task?.id === 0 && mode === "edit") {
      navigate("/");
    }
  }, [mode, navigate, task?.id]);

  const [loading, setLoading] = useState(false);
  const [openAssetsModal, setOpenAssetsModal] = useState(false);

  const initialTime =
    task?.time && !Number.isNaN(new Date(task.time).getTime())
      ? new Date(task.time)
      : new Date();

  const [selectedTime, setSelectedTime] = useState(initialTime);

  const [selectedStatus, setSelectedStatus] = useState(
    statusOptions.find((option) => option.type === task?.type) ||
      statusOptions?.find((option) => option.type === "static")
  );

  const [content, setContent] = useState({
    title: task?.title || ``,
    description: task?.description || ``,
    instagram: task?.instagram || ``,
    twitter: task?.twitter || ``,
    linkedin: task?.linkedin || ``,
    discord: task?.discord || ``,
  });

  const [images, setImages] = useState(task?.pictures || []);
  const [activeContent, setActiveContent] = useState("instagram");
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.textContent = content[activeContent] || "";
    }
  }, [activeContent, content]);

  const handleSave = async () => {
    setLoading(true);

    if (content.title === "" || content.description === "") {
      toast.error("Title and Description are required.");
      setLoading(false);
      return;
    }

    try {
      const currentDate = parseDateValue(selectedDate);
      const dateValue = formatDateKey(currentDate);
      const timeValue =
        selectedTime instanceof Date
          ? selectedTime.toISOString()
          : new Date(selectedTime).toISOString();

      const existingPictures = normalizeExistingPictures(images);
      const newFiles = (Array.isArray(images) ? images : []).filter(
        (image) => !image?.id && !image?.path && image instanceof File
      );
      const uploadedPictures = await uploadPicturesToStorage(newFiles);
      const pictures = [...existingPictures, ...uploadedPictures];

      const payload = {
        instagram: content.instagram,
        discord: content.discord,
        twitter: content.twitter,
        linkedin: content.linkedin,
        date: dateValue,
        time: timeValue,
        type: selectedStatus?.type || "static",
        title: content.title,
        description: content.description,
        pictures,
      };

      if (mode === "edit") {
        await updateContent(payload, task?._id);
        toast.success("Post updated successfully!");
      } else {
        await createContent(payload);
        toast.success("Post created successfully!");
      }

      dispatch(resetTask());
      navigate("/");
    } catch (error) {
      console.error("Error saving post:", error);
      toast.error("Failed to save post.");
    } finally {
      setLoading(false);
    }
  };

  const platformButtons = [
    { key: "instagram", icon: IoLogoInstagram, label: "Instagram" },
    { key: "twitter", icon: FaXTwitter, label: "X" },
    { key: "linkedin", icon: GrLinkedinOption, label: "LinkedIn" },
    { key: "discord", icon: AiOutlineDiscord, label: "Discord" },
  ];

  return (
    <div className="app-shell">
      <div className="mx-auto max-w-6xl glass-panel rounded-3xl p-4 md:p-6">
        <div className="flex flex-col gap-4 md:gap-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <input
              type="text"
              className="h-[54px] w-full border-b border-[#3c3c3c] bg-transparent font-outfit text-[22px] font-semibold text-[#d4d4d4] outline-none placeholder:text-[#8e8e90] ring-0 focus:ring-0 md:text-[30px] lg:w-[64%]"
              placeholder="Add a title"
              autoFocus
              onChange={(e) =>
                setContent((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              value={content.title || ""}
            />

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <button
                className="pill-btn text-[16px] font-semibold flex-1 lg:flex-none rounded-xl cursor-pointer justify-center py-3 px-6 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!content.title || !content.description || loading}
                onClick={handleSave}
              >
                {mode === "edit" ? "Update" : "Schedule"} Post
              </button>

              <button
                className="justify-center rounded-xl border border-[#3c3c3c] px-6 py-3 text-[16px] font-semibold text-[#d4d4d4] cursor-pointer"
                onClick={() => {
                  navigate("/");
                  dispatch(resetTask());
                }}
              >
                {mode === "edit" ? "Cancel" : "Discard"}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <DatePickerTrigger mode={mode} />
            <TimePickerTrigger
              selectedTime={selectedTime}
              setSelectedTime={setSelectedTime}
            />
            <StatusDropdownTrigger
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
            />
            <FilePickerTrigger
              openAssetsModal={openAssetsModal}
              setOpenAssetsModal={setOpenAssetsModal}
              images={images}
              setImages={setImages}
            />
          </div>

          <textarea
            className="glass-panel min-h-[100px] w-full resize-none rounded-xl border border-[#3c3c3c] p-4 text-[16px] text-[#d4d4d4] outline-none"
            placeholder="Write a brief description for this post"
            onChange={(e) =>
              setContent((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            value={content.description || ""}
          />

          <div className="overflow-hidden rounded-2xl border border-[#3c3c3c] bg-[#252526]/80">
            <div className="flex w-full flex-wrap justify-between gap-4 px-4 py-4 text-white md:px-5">
              <div className="flex gap-2 md:gap-3">
                {platformButtons.map(({ key, icon: Icon, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveContent(key)}
                    className={clsx(
                      "h-10 px-3 rounded-lg border text-sm md:text-base flex items-center gap-2 cursor-pointer",
                      activeContent === key
                        ? "border-[#666] bg-[#37373d] text-[#f2f2f2]"
                        : "border-[#3c3c3c] bg-transparent text-[#9da1a6]"
                    )}
                  >
                    <Icon className="text-lg" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <textarea
              className="min-h-[300px] w-full resize-none bg-transparent p-4 text-[16px] text-[#d4d4d4] outline-none md:min-h-[420px] md:p-5 md:text-[18px]"
              placeholder="Write your post here..."
              value={content[activeContent] || ""}
              onChange={(e) =>
                setContent((prev) => ({
                  ...prev,
                  [activeContent]: e.target.value,
                }))
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
