import React, { useRef } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { IoCloudUploadOutline } from "react-icons/io5";
import { MdOutlineSaveAlt } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import { toast } from "react-toastify";
import { resolvePictureDownloadUrl } from "../../utils/supabaseStorage";

const FilePicker = ({ setIsOpen, images, setImages, mode }) => {
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) {
      return;
    }

    setImages((prevImages) => {
      const existingFiles = prevImages.map((file) =>
        (file.name || file.filename).toLowerCase()
      );

      const newFiles = files.filter(
        (file) => !existingFiles.includes(file.name.toLowerCase())
      );

      if (newFiles.length === 0) {
        toast.error("This file is already added.");
        return prevImages;
      }

      return [...prevImages, ...newFiles];
    });
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => {
      const updatedImages = prev.filter((_, i) => i !== index);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return updatedImages;
    });
  };

  const triggerDownload = (image) => {
    const href = resolvePictureDownloadUrl(image);
    if (!href) {
      toast.error("Download link unavailable");
      return;
    }

    const link = document.createElement("a");
    link.href = href;
    link.download = image.filename || image.name || "asset";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex h-full w-full items-center justify-center bg-[#000000c2] font-outfit">
      <div className="relative flex h-[620px] w-[92%] max-w-2xl flex-col rounded-xl border border-[#3c3c3c] bg-[#1e1e1e] p-3 shadow-2xl md:w-full md:p-4">
        <div className="flex items-center justify-between border-b border-[#3c3c3c] p-2 pb-3">
          <h3 className="text-[22px] font-semibold text-[#d4d4d4]">
            {mode === "view" ? "Attached Files" : "Upload Files"}
          </h3>

          <button
            onClick={() => setIsOpen(false)}
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-sm text-[#9da1a6] transition hover:bg-[#2d2d30] hover:text-[#d4d4d4]"
            type="button"
          >
            <RxCross2 />
          </button>
        </div>

        <div className="h-full space-y-3 overflow-y-auto px-1 pt-3 pb-2">
          <div className="flex flex-col gap-2">
            {!images?.length && (
              <div className="rounded-lg border border-dashed border-[#3c3c3c] bg-[#252526] px-4 py-6 text-center text-sm text-[#9da1a6]">
                No files yet.
              </div>
            )}

            {images?.map((image, index) => {
              const fileName = image.filename || image.name || "file";
              return (
                <div
                  key={`${fileName}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-md border border-[#3c3c3c] bg-[#252526] px-4 py-2"
                >
                  <p className="truncate text-sm text-[#d4d4d4]">{fileName}</p>
                  {mode !== "view" ? (
                    <button
                      className="cursor-pointer text-[18px] text-[#9da1a6] transition hover:text-[#d4d4d4]"
                      onClick={() => handleRemoveImage(index)}
                      type="button"
                    >
                      <RxCross2 />
                    </button>
                  ) : (
                    <button
                      className="cursor-pointer text-[18px] text-[#9da1a6] transition hover:text-[#d4d4d4]"
                      onClick={() => triggerDownload(image)}
                      type="button"
                    >
                      <MdOutlineSaveAlt />
                    </button>
                  )}
                </div>
              );
            })}

            {mode !== "view" && (
              <label
                htmlFor="file-upload"
                className="mt-2 flex cursor-pointer items-center justify-center gap-3 rounded-md border border-dashed border-[#4f4f4f] bg-[#252526] px-4 py-3 text-center text-[#d4d4d4] transition hover:border-[#6b6b6b] hover:bg-[#2d2d30]"
              >
                <IoCloudUploadOutline className="text-[20px]" />
                Select files to upload
              </label>
            )}

            <input
              id="file-upload"
              type="file"
              multiple
              accept="*"
              onChange={handleImageChange}
              className="hidden"
              ref={fileInputRef}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilePicker;
