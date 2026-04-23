import React from "react";
import { IoMdAdd } from "react-icons/io";
import logo from "../assets/logo.png";

const Navbar = ({ setAdd }) => {
  return (
    <nav
      className=" bg-[#212121] font-outfit"
      onClick={() => {
        setAdd(true);
      }}
    >
      <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl p-4">
        <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <img src={logo} className="h-8" alt="Flowbite Logo" />
        </a>
        <div className="flex items-center space-x-6 rtl:space-x-reverse">
          <div className="text-white flex items-center gap-[1.3rem] bg-black w-[150px] rounded-md cursor-pointer justify-center p-2">
            <IoMdAdd /> Add Content
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
