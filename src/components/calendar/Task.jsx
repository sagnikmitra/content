import React from "react";
import { getTaskHeight, getTaskTop } from "../../utils/Calendar";

const Task = ({ task, setPopupPos, setSelectedTask }) => {
  const startTime = new Date(task.time);
  const endTime = new Date(startTime.getTime() + 45 * 60 * 1000);
  const top = getTaskTop(startTime);
  const height = Math.max(30, getTaskHeight(startTime, endTime));

  let cardStyle = "border-[#5f5f68] bg-[#35353c]";
  if (task.type === "static") {
    cardStyle = "border-[#365245] bg-[#203329]";
  } else if (task.type === "video") {
    cardStyle = "border-[#3e4f5c] bg-[#25313a]";
  } else if (task.type === "live") {
    cardStyle = "border-[#5b3a3a] bg-[#3a2525]";
  }

  return (
    <div
      key={task._id || task.id}
      className={`absolute left-1 right-1 cursor-pointer overflow-hidden rounded-md border px-2 py-1 text-[11px] leading-[14px] text-[#f1f1f3] shadow-md md:left-2 md:right-2 md:text-[13px] ${cardStyle}`}
      style={{ top: `${top}px`, height: `${height}px` }}
      title={` ${task.title}, ${new Date(task.time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const container = document.getElementById("calendar-scroll-container");
        if (!container) {
          return;
        }

        const popupHeight = 320;
        const popupWidth = window.innerWidth < 960 ? 280 : 340;
        const padding = 10;
        const containerRect = container.getBoundingClientRect();
        let calculatedTop = rect.top + window.scrollY;
        let calculatedLeft =
          window.innerWidth < 960
            ? rect.left + window.scrollX
            : rect.left + window.scrollX - popupWidth - 12;

        if (
          calculatedTop + popupHeight >
          containerRect.bottom + window.scrollY
        ) {
          calculatedTop =
            containerRect.bottom + window.scrollY - popupHeight - padding;
        } else if (calculatedTop < containerRect.top + window.scrollY) {
          calculatedTop = containerRect.top + window.scrollY + padding;
        }

        const minLeft = padding + window.scrollX;
        const maxLeft =
          window.scrollX + window.innerWidth - popupWidth - padding;
        calculatedLeft = Math.min(Math.max(calculatedLeft, minLeft), maxLeft);

        setPopupPos({
          top: calculatedTop,
          left: calculatedLeft,
        });

        setSelectedTask(task);
      }}
    >
      <p className="truncate font-medium">{task.title}</p>
      <p className="text-[10px] text-[#d3d3d7] md:text-[11px]">
        {new Date(task.time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  );
};

export default Task;
