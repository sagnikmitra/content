import clsx from "clsx";
import { format } from "date-fns";
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
  combineDateAndTime,
  isBackdatedSchedule,
} from "../utils/schedule";
import {
  cleanupUploadedPictures,
  normalizeExistingPictures,
  uploadPicturesToStorage,
} from "../utils/supabaseStorage";

const isStagedUpload = (image) => Boolean(image?.isStagedUpload);

const CreatePost = ({ mode }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const task = useSelector((state) => state.task.task);
  const globallySelectedDate = parseDateValue(useSelector(selectSelectedDate));
  const [selectedDate, setSelectedDate] = useState(
    mode === "edit" ? parseDateValue(task.date) : globallySelectedDate
  );

  useEffect(() => {
    if (task?.id === 0 && mode === "edit") {
      navigate("/");
    }
  }, [mode, navigate, task?.id]);

  useEffect(() => {
    setSelectedDate(
      mode === "edit" ? parseDateValue(task.date) : globallySelectedDate
    );
  }, [globallySelectedDate, mode, task.date]);

  const [loading, setLoading] = useState(false);
  const [openAssetsModal, setOpenAssetsModal] = useState(false);
  const [isUploadingAssets, setIsUploadingAssets] = useState(false);

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
  const skipStagedCleanupRef = useRef(false);
  const stagedImagesRef = useRef([]);
  const hasPrimaryContent =
    Boolean((content.description || "").trim()) ||
    Boolean((content.instagram || "").trim()) ||
    Boolean((content.twitter || "").trim()) ||
    Boolean((content.linkedin || "").trim()) ||
    Boolean((content.discord || "").trim());
  const canSchedule =
    Boolean((content.title || "").trim()) &&
    hasPrimaryContent &&
    !loading &&
    !isUploadingAssets;
  const scheduledAtLabel =
    selectedTime instanceof Date
      ? `${format(parseDateValue(selectedDate), "EEE, MMM d")} · ${format(selectedTime, "h:mm a")}`
      : "";

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.textContent = content[activeContent] || "";
    }
  }, [activeContent, content]);

  useEffect(() => {
    stagedImagesRef.current = (Array.isArray(images) ? images : []).filter(
      isStagedUpload
    );
  }, [images]);

  useEffect(
    () => () => {
      if (skipStagedCleanupRef.current || !stagedImagesRef.current.length) {
        return;
      }

      cleanupUploadedPictures(stagedImagesRef.current).catch((error) => {
        console.error("Failed to clean up abandoned staged uploads:", error);
      });
    },
    []
  );

  const cleanupAndRemoveStagedUploads = async (pictures) => {
    const stagedPictures = (Array.isArray(pictures) ? pictures : []).filter(
      isStagedUpload
    );
    if (!stagedPictures.length) {
      return;
    }

    await cleanupUploadedPictures(stagedPictures);
    setImages((prev) => prev.filter((image) => !isStagedUpload(image)));
  };

  const handleDiscard = async () => {
    await cleanupAndRemoveStagedUploads(stagedImagesRef.current);
    skipStagedCleanupRef.current = true;
    navigate("/");
    dispatch(resetTask());
  };

  const handleSave = async () => {
    setLoading(true);
    let stagedPictures = [];
    let uploadedPictures = [];
    let contentWriteStarted = false;

    if (!content.title.trim()) {
      toast.error("Title is required.");
      setLoading(false);
      return;
    }

    if (!hasPrimaryContent) {
      toast.error("Add description or channel copy before scheduling.");
      setLoading(false);
      return;
    }

    if (isUploadingAssets) {
      toast.error("Please wait for file uploads to finish.");
      setLoading(false);
      return;
    }

    try {
      if (isBackdatedSchedule(selectedDate, selectedTime)) {
        toast.error("Schedule date and time cannot be in the past.");
        return;
      }

      const scheduledAt = combineDateAndTime(selectedDate, selectedTime);
      const dateValue = formatDateKey(selectedDate);
      const timeValue = scheduledAt.toISOString();

      const existingPictures = normalizeExistingPictures(images);
      const newFiles = (Array.isArray(images) ? images : []).filter(
        (image) => !image?.id && !image?.path && image instanceof File
      );
      stagedPictures = (Array.isArray(images) ? images : []).filter(
        isStagedUpload
      );
      uploadedPictures = await uploadPicturesToStorage(newFiles);
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

      contentWriteStarted = true;
      if (mode === "edit") {
        await updateContent(payload, task?._id);
        toast.success("Post updated successfully!");
      } else {
        await createContent(payload);
        toast.success("Post created successfully!");
      }

      skipStagedCleanupRef.current = true;
      dispatch(resetTask());
      navigate("/");
    } catch (error) {
      if (contentWriteStarted) {
        await cleanupUploadedPictures([...stagedPictures, ...uploadedPictures]);
        setImages((prev) => prev.filter((image) => !isStagedUpload(image)));
      }
      console.error("Error saving post:", error);
      toast.error(
        error?.message ||
          error?.response?.data?.error ||
          "Failed to save post."
      );
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
            <div className="w-full lg:w-[64%]">
              <input
                type="text"
                className="h-[54px] w-full border-b border-[#3c3c3c] bg-transparent font-outfit text-[22px] font-semibold text-[#d4d4d4] outline-none placeholder:text-[#8e8e90] ring-0 focus:ring-0 md:text-[30px]"
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
              <p className="mt-2 text-xs text-[#9da1a6]">
                Publishing slot: {scheduledAtLabel || "Select date & time"}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <button
                className="pill-btn text-[16px] font-semibold flex-1 lg:flex-none rounded-xl cursor-pointer justify-center py-3 px-6 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!canSchedule}
                onClick={handleSave}
              >
                {isUploadingAssets
                  ? "Uploading files..."
                  : `${mode === "edit" ? "Update" : "Schedule"} Post`}
              </button>

              <button
                className="justify-center rounded-xl border border-[#3c3c3c] px-6 py-3 text-[16px] font-semibold text-[#d4d4d4] cursor-pointer"
                onClick={handleDiscard}
              >
                {mode === "edit" ? "Cancel" : "Discard"}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <DatePickerTrigger
              mode={mode}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
            <TimePickerTrigger
              selectedTime={selectedTime}
              setSelectedTime={setSelectedTime}
              selectedDate={selectedDate}
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
              onUploadingChange={setIsUploadingAssets}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              className={clsx(
                "rounded-full border px-3 py-1",
                content.title.trim()
                  ? "border-[#4e5d52] bg-[#213128] text-[#96c7a5]"
                  : "border-[#4f4f4f] bg-[#2d2d30] text-[#9da1a6]"
              )}
            >
              {content.title.trim() ? "Title ready" : "Add title"}
            </span>
            <span
              className={clsx(
                "rounded-full border px-3 py-1",
                hasPrimaryContent
                  ? "border-[#4e5d52] bg-[#213128] text-[#96c7a5]"
                  : "border-[#4f4f4f] bg-[#2d2d30] text-[#9da1a6]"
              )}
            >
              {hasPrimaryContent ? "Content ready" : "Add channel copy"}
            </span>
            <span
              className={clsx(
                "rounded-full border px-3 py-1",
                isUploadingAssets
                  ? "border-[#5b4f3b] bg-[#322a1f] text-[#d6c399]"
                  : "border-[#4e5d52] bg-[#213128] text-[#96c7a5]"
              )}
            >
              {isUploadingAssets ? "Uploading assets…" : "Assets synced"}
            </span>
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
