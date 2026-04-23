import React from "react";
import { MdAddToDrive } from "react-icons/md";
import FilePicker from "./FilePicker";

const FilePickerTrigger = ({
  openAssetsModal,
  setOpenAssetsModal,
  images,
  setImages,
  mode,
}) => {
  return (
    <>
      <button
        className="flex items-center gap-3 px-4 py-2 cursor-pointer rounded-md border border-[#1a1b1b] bg-[#0e0e0e] font-outfit text-[#e7e7e7] font-normal tracking-[1.2px] text-[18px] w-auto"
        onClick={() => {
          setOpenAssetsModal(true);
        }}
      >
        <MdAddToDrive />
        {images?.length === 0
          ? mode === "view"
            ? "View Files"
            : "Add Files"
          : `${images?.length} File${images?.length > 1 ? "s" : ""}`}
      </button>

      {openAssetsModal && (
        <FilePicker
          setIsOpen={setOpenAssetsModal}
          images={images}
          setImages={setImages}
          mode={mode}
        />
      )}
    </>
  );
};

export default FilePickerTrigger;
