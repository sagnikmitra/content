import React from "react";

const DeleteConfirmationModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000be] bg-opacity-50">
      <div className="bg-[#1e1f21] text-[#ffffff] w-[320px] p-6 rounded-xl shadow-xl">
        <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
        <p className="text-[14px] mb-6 opacity-80">
          Are you sure you want to delete this task? This action cannot be
          undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 cursor-pointer bg-[#333] rounded-md text-[#e3e3e3] hover:bg-[#444]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 cursor-pointer bg-red-600 rounded-md text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
