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
        className="absolute z-50 w-[calc(100vw-20px)] md:w-[350px] p-4 bg-[#172b49] border border-[#2f527f] rounded-xl text-sm text-[#e3e3e3] shadow-[0_20px_45px_rgba(0,0,0,0.35)]"
        style={{ top: position.top, left: position.left }}
      >
        <div className="flex justify-end gap-8 items-center mb-5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                fetchContent({ mode: "edit" });
              }}
              className="text-gray-400 hover:text-white text-[20px] cursor-pointer"
            >
              <MdOutlineEdit />
            </button>
            <button
              onClick={() => {
                setShowDeleteModal(true);
              }}
              className="text-gray-400 hover:text-white text-[20px] cursor-pointer"
            >
              <MdOutlineDelete />
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-[17px] cursor-pointer"
          >
            ✕
          </button>
        </div>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-start gap-3">
            <h3 className="font-semibold m-0 text-[17px] break-words max-w-[300px] line-clamp-2 leading-snug">
              {task.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center mb-4 gap-2">
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

          <p className="text-[14px] font-normal text-[#e3e3e3]  flex items-center gap-2">
            <span>{formattedDate} </span>
            <span>at</span>
            <span>{formattedStart} </span>
          </p>
        </div>

        <p className="text-[16px] mt-[30px] font-normal text-[#e3e3e3] opacity-80 break-words max-w-[320px] line-clamp-2 leading-snug">
          {task.description}
        </p>

        <div
          className="mt-6 inline-flex items-center gap-3 bg-[#a8c8fb] cursor-pointer text-[#000000] font-medium text-[16px] py-2 px-5 rounded-md transition-colors"
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
