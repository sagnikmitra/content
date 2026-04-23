export const socialOptions = [
  { value: "instagram", label: "Instagram" },
  { value: "twitter", label: "Twitter" },
  { value: "linkedin", label: "Linkedin" },
  { value: "discord", label: "Discord" },
  { value: "assets", label: "Assets" },
  { value: "settings", label: "Settings" },
];

export const formatOptions = [
  { value: "Static", label: "Static" }, // Yellow
  { value: "Reel", label: "Reel" }, // Blue
];

export const tasks = [
  {
    id: 3,
    title: "Reminder - Think. Build. Win. Discord Session",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
    date: "2025-04-18T19:41:38.000Z",
    time: "2025-04-18T19:41:38.000Z",
    type: "video",
    instagram: `Design Thinking Unlocked! ✨

  Did "All Things UI/UX" answer your questions? We sure hope so!

  Kaustav took us through the world of empathy-driven design, inclusivity, and the roadmap to kickstarting a UI/UX career.

  Missed it?

  Stay tuned for more sessions that help you build, innovate, and create!  🚀

  #Hack4Bengal #H4B`,
    discord: `Design Thinking Unlocked! ✨

  Did "All Things UI/UX" answer your questions? We sure hope so!

  Kaustav took us through the world of empathy-driven design, inclusivity, and the roadmap to kickstarting a UI/UX career.

  Missed it?

  Stay tuned for more sessions that help you build, innovate, and create!  🚀

  #Hack4Bengal #H4B`,
    twitter: `Design Thinking Unlocked! ✨

  Did "All Things UI/UX" answer your questions? We sure hope so!

  Kaustav took us through the world of empathy-driven design, inclusivity, and the roadmap to kickstarting a UI/UX career.

  Missed it?

  Stay tuned for more sessions that help you build, innovate, and create!  🚀

  #Hack4Bengal #H4B`,
    linkedin: `Design Thinking Unlocked! ✨

  Did "All Things UI/UX" answer your questions? We sure hope so!

  Kaustav took us through the world of empathy-driven design, inclusivity, and the roadmap to kickstarting a UI/UX career.

  Missed it?

  Stay tuned for more sessions that help you build, innovate, and create!  🚀

  #Hack4Bengal #H4B`,
    pictures: [
      {
        id: "1yY_lWMmPa_4cn54Y7mDqWg6CLpnvf4Ca",
        url: "https://drive.google.com/uc?id=1yY_lWMmPa_4cn54Y7mDqWg6CLpnvf4Ca",
        filename: "315-179-banner.png",
      },
      {
        id: "1S28Myp6wysd4_4y9HBpwwAUxRE038pCE",
        url: "https://drive.google.com/uc?id=1S28Myp6wysd4_4y9HBpwwAUxRE038pCE",
        filename: "live-evan-1-1-i2.png",
      },
    ],
    createdAt: new Date("2025-04-15T17:35:59.799Z"),
    updatedAt: new Date("2025-04-15T17:35:59.799Z"),
  },
];

export const customStyles = {
  control: (provided, state) => {
    return {
      ...provided,
      backgroundColor: "#171b27",
      borderColor: state.isFocused ? "#484d5d" : "#484d5d", // Change border color on focus
      borderWidth: 1,
      color: "#ffffffe0",
      borderStyle: "solid",
      cursor: "pointer",
      borderRadius: "6px",
      width: "100%",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#484d5d", // Correct way to add hover effect
      },
    };
  },

  option: (provided) => ({
    ...provided,
    color: "#ffffff",
    cursor: "pointer",
    padding: "10px",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#ffffff",

    padding: "5px 10px",
    borderRadius: "6px",
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "#171b27",
    zIndex: 9999,
    borderRadius: "6px",
    marginTop: "5px",
  }),
};

export const statusOptions = [
  {
    label: "Static Post",
    color: "#246942",
    bg: "#044327e2",
    text: "#78ca9e",
    type: "static",
  },
  {
    label: "Video/Reel",
    color: "#1e4658",
    bg: "#042f43e2",
    text: "#78ca9e",
    type: "video",
  },
  {
    label: "Live Event",
    color: "#663939",
    bg: "#4a1e1ee2",
    text: "#ff9c9c",
    type: "live",
  },
];
