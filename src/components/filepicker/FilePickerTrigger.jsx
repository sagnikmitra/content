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
        className="flex w-auto cursor-pointer items-center gap-3 rounded-md border border-[#3c3c3c] bg-[#252526] px-4 py-2 font-outfit text-[16px] font-medium tracking-[0.2px] text-[#d4d4d4] transition hover:bg-[#2d2d30]"
        type="button"
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
