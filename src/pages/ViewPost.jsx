import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";
import { AiOutlineDiscord } from "react-icons/ai";
import { FaXTwitter } from "react-icons/fa6";
import { GrLinkedinOption } from "react-icons/gr";
import { IoLogoInstagram } from "react-icons/io5";
import { MdContentCopy } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DatePickerTrigger from "../components/datepicker/DatePickerTrigger";
import FilePickerTrigger from "../components/filepicker/FilePickerTrigger";
import StatusDropdownTrigger from "../components/statuspicker/StatusDropdownTrigger";
import TimePickerTrigger from "../components/timepicker/TimePickerTrigger";
import { statusOptions } from "../constants/Constants";
import { resetTask } from "../store/slices/taskSlice";
import { parseDateValue } from "../utils/date";

const ViewPost = () => {
  const navigate = useNavigate();
  const task = useSelector((state) => state.task.task);
  const dispatch = useDispatch();

  useEffect(() => {
    if (task?.id === 0) {
      navigate("/");
    }
  }, [navigate, task?.id]);

  const [openAssetsModal, setOpenAssetsModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(parseDateValue(task.date));
  const [selectedTime, setSelectedTime] = useState(parseDateValue(task.time));
  const [selectedStatus, setSelectedStatus] = useState(
    statusOptions?.find((item) => item?.type === task?.type)
  );
  const [content, setContent] = useState({
    title: task.title,
    description: task.description,
    instagram: task.instagram,
    twitter: task.twitter,
    linkedin: task.linkedin,
    discord: task.discord,
  });
  const [images, setImages] = useState(task.pictures || []);
  const [activeContent, setActiveContent] = useState("instagram");
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerText = content[activeContent] || "";
    }
  }, [activeContent, content]);

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
            <p className="font-outfit text-[24px] md:text-[32px] font-semibold text-[#f3f8ff] w-full lg:w-[64%] min-h-[48px]">
              {task.title}
            </p>

            <button
              className="text-[#d8e8ff] text-[16px] font-semibold border border-[#41618f] rounded-xl cursor-pointer py-3 px-6 w-full lg:w-auto"
              onClick={() => {
                navigate("/");
                dispatch(resetTask());
              }}
            >
              Go Back
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <DatePickerTrigger
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              mode={"view"}
            />
            <TimePickerTrigger
              selectedTime={selectedTime}
              setSelectedTime={setSelectedTime}
              mode={"view"}
            />
            <StatusDropdownTrigger
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              mode={"view"}
            />
            <FilePickerTrigger
              openAssetsModal={openAssetsModal}
              setOpenAssetsModal={setOpenAssetsModal}
              images={images}
              setImages={setImages}
              mode={"view"}
            />
          </div>

          <textarea
            className="glass-panel border border-[#2d4c77] min-h-[100px] w-full resize-none rounded-xl outline-none text-[#e7f1ff] p-4 text-[16px]"
            value={content.description || ""}
            onChange={(e) =>
              setContent((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
          />

          <div className="rounded-2xl border border-[#2d4c77] overflow-hidden bg-[#0f1f35]/70">
            <div className="w-full px-4 md:px-5 py-4 flex flex-wrap justify-between gap-4 text-white">
              <div className="flex gap-2 md:gap-3">
                {platformButtons.map(({ key, icon: Icon, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveContent(key)}
                    className={clsx(
                      "h-10 px-3 rounded-lg border text-sm md:text-base flex items-center gap-2 cursor-pointer",
                      activeContent === key
                        ? "border-[#59d6ff] bg-[#1f3559]"
                        : "border-[#35577f] bg-transparent text-[#a6c2e8]"
                    )}
                  >
                    <Icon className="text-lg" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="h-10 px-3 rounded-lg border border-[#35577f] text-[#cfe3ff] cursor-pointer"
                onClick={() => {
                  navigator.clipboard.writeText(content[activeContent] || "");
                  toast.success("Copied to clipboard");
                }}
              >
                <MdContentCopy className="text-lg" />
              </button>
            </div>

            <div
              ref={editorRef}
              className="min-h-[300px] md:min-h-[420px] bg-transparent w-full outline-none text-[#e7e7e7] p-4 md:p-5 text-[16px] md:text-[18px] overflow-y-auto"
              onInput={(e) => {
                const value = e.currentTarget.innerText;
                setContent((prev) => ({
                  ...prev,
                  [activeContent]: value,
                }));
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPost;
