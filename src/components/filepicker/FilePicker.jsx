import React, { useRef } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { IoCloudUploadOutline } from "react-icons/io5";
import { MdOutlineSaveAlt } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import { toast } from "react-toastify";

const FilePicker = ({ setIsOpen, images, setImages, mode }) => {
  const fileInputRef = useRef(null); // Create a ref for the file input

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    setImages((prevImages) => {
      const existingFiles = prevImages.map((file) =>
        (file.name || file.filename).toLowerCase()
      );

      // Filter out files that already exist
      const newFiles = files.filter(
        (file) => !existingFiles.includes(file.name.toLowerCase())
      );

      if (newFiles.length === 0) {
        toast.error("This file is already added.");
        return prevImages; // Return the previous state unchanged
      }

      return [...prevImages, ...newFiles];
    });
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => {
      const updatedImages = prev.filter((_, i) => i !== index);

      // Reset input field to allow re-uploading the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return updatedImages;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-[#000000ba] font-outfit">
      <div className="relative flex flex-col md:p-4 p-2 md:w-full w-[90%] max-w-2xl  h-[600px] bg-[#1a1b1b] rounded-lg shadow-sm ">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 pt-0 pb-2 border-b border-gray-600">
          <h3 className="text-[25px] font-semibold text-white">
            {mode === "view" ? "Attached Files" : "Upload Files"}
          </h3>

          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 cursor-pointer hover:bg-gray-600 hover:text-white rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
          >
            ❌
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-2 pt-2 space-y-4 overflow-y-scroll h-full pb-4">
          <div className="flex flex-col gap-2">
            {images?.map((image, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-4 py-2 bg-[#000] rounded-md"
              >
                <p className="text-gray-300 text-sm truncate">
                  {image.filename || image.name}
                </p>
                {mode !== "view" ? (
                  <button
                    className="cursor-pointer text-white text-[18px]"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <RxCross2 />
                  </button>
                ) : (
                  <button
                    className="cursor-pointer text-white text-[18px]"
                    onClick={() => {
                      const href =
                        image.url ||
                        (image.id
                          ? `https://drive.google.com/uc?export=download&id=${image.id}`
                          : "");
                      if (!href) {
                        return;
                      }
                      const link = document.createElement("a");
                      link.href = href;
                      link.download = image.filename;
                      link.target = "_blank";
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    <MdOutlineSaveAlt />
                  </button>
                )}
              </div>
            ))}

            {mode !== "view" && (
              <label
                htmlFor="file-upload"
                className="cursor-pointer mt-2 text-gray-200 border border-dashed border-gray-500 rounded-md px-4 py-3 text-center  flex items-center gap-3 justify-center"
              >
                <IoCloudUploadOutline className="text-[20px]" /> Click to Upload
                Files
              </label>
            )}

            <input
              id="file-upload"
              type="file"
              multiple
              accept="*"
              onChange={handleImageChange}
              className="hidden"
              ref={fileInputRef} // Attach ref
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilePicker;
