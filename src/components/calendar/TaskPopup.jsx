import { format } from "date-fns";
import React, { useState } from "react";
import { FiExternalLink } from "react-icons/fi";
import { MdOutlineDelete, MdOutlineEdit } from "react-icons/md";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { deleteContent, getContentById } from "../../api/queries";
import { flipReRenderSwitch } from "../../store/slices/globalSlice";
import { updateTask } from "../../store/slices/taskSlice";
import { parseDateValue } from "../../utils/date";
import DeleteConfirmationModal from "./DeleteModal";

const TaskPopup = ({ task, position, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!task) {
    return null;
  }

  const formattedDate = format(parseDateValue(task.date), "EEEE, MMMM d");
  const formattedStart = format(parseDateValue(task.time), "h:mm a");

  const handleDelete = async () => {
    try {
      await deleteContent(task?._id);
      onClose();
      toast.success("Content deleted successfully.");
      setShowDeleteModal(false);
      dispatch(flipReRenderSwitch());
    } catch {
      toast.error("Failed to delete content.");
    }
  };

  const fetchContent = async ({ mode }) => {
    try {
      const data = await getContentById(task?._id);
      dispatch(updateTask(data));

      if (mode === "view") {
        navigate("/view");
      } else if (mode === "edit") {
        navigate("/edit");
      }
    } catch (error) {
      console.error("Error fetching contents:", error);
    }
  };

  return (
    <>
      <div
        className="absolute z-50 w-[calc(100vw-20px)] rounded-xl border border-[#3c3c3c] bg-[#252526] p-4 text-sm text-[#e3e3e3] shadow-[0_20px_45px_rgba(0,0,0,0.45)] md:w-[340px]"
        style={{ top: position.top, left: position.left }}
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.18em] text-[#9da1a6]">
            Scheduled Post
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                fetchContent({ mode: "edit" });
              }}
              className="cursor-pointer text-[18px] text-[#9da1a6] transition hover:text-white"
              title="Edit"
            >
              <MdOutlineEdit />
            </button>
            <button
              onClick={() => {
                setShowDeleteModal(true);
              }}
              className="cursor-pointer text-[18px] text-[#9da1a6] transition hover:text-white"
              title="Delete"
            >
              <MdOutlineDelete />
            </button>
            <button
              onClick={onClose}
              className="cursor-pointer text-[16px] text-[#9da1a6] transition hover:text-white"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="mb-2 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <h3 className="font-semibold m-0 text-[17px] break-words max-w-[300px] line-clamp-2 leading-snug">
              {task.title}
            </h3>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2">
          {task.type === "static" ? (
            <div className="border-[#246942] border-[1px] mt-[1px] aspect-square w-4 h-4 text-[#78ca9e] bg-[#044327e2] rounded-[3px]">
              &nbsp;
            </div>
          ) : task?.type === "video" ? (
            <div className="border-[#1e4658] border-[1px] mt-[1px] aspect-square w-4 h-4 text-[#78ca9e] bg-[#042f43e2] rounded-[3px]">
              &nbsp;
            </div>
          ) : (
            <div className="border-[#663939] border-[1px] mt-[1px] aspect-square w-4 h-4 text-[#ff9c9c] bg-[#4a1e1ee2] rounded-[3px]">
              &nbsp;
            </div>
          )}

          <p className="flex items-center gap-2 text-[13px] font-normal text-[#c8c8c8]">
            <span>{formattedDate} </span>
            <span>at</span>
            <span>{formattedStart} </span>
          </p>
        </div>

        <p className="mt-4 max-w-[320px] break-words text-[14px] leading-snug text-[#d4d4d4] opacity-85 line-clamp-3">
          {task.description}
        </p>

        <div
          className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-md border border-[#4a4a4f] bg-[#2d2d30] px-4 py-2 text-[14px] font-medium text-[#f2f2f2] transition hover:bg-[#3a3a3f]"
          onClick={() => {
            fetchContent({ mode: "view" });
            onClose();
          }}
        >
          See Event Details <FiExternalLink />
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  );
};

export default TaskPopup;
