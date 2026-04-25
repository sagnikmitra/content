import CalendarLarge from "@components/home/CalendarLarge";
import LeftSidebar from "@components/home/LeftSidebar";
import useContents from "@hooks/useContents";
import { selectReRenderSwitch } from "@store/slices/globalSlice";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const reRenderSwitch = useSelector(selectReRenderSwitch);
  const contents = useContents(reRenderSwitch);
  const navigate = useNavigate();

  return (
    <div className="app-shell overflow-hidden">
      <div className="mb-3 flex items-center justify-between rounded-2xl border border-[#3c3c3c] bg-[#252526] px-4 py-3 md:hidden">
        <div>
          <p className="text-sm text-[#9da1a6]">ContentOS</p>
          <h1 className="text-lg font-semibold">Publishing Calendar</h1>
          <p className="text-xs text-[#9da1a6]">{contents.length} scheduled posts</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/create")}
          className="pill-btn px-4 py-2 text-sm font-semibold"
        >
          Schedule
        </button>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[280px_1fr]">
        <LeftSidebar />
        <div className="glass-panel w-full rounded-[22px] p-2 md:p-4">
          <div className="mb-3 hidden items-center justify-between rounded-xl border border-[#3c3c3c] bg-[#252526] px-4 py-3 md:flex">
            <div>
              <h1 className="text-lg font-semibold">Publishing Calendar</h1>
              <p className="text-xs text-[#9da1a6]">
                {contents.length} scheduled posts · Click any day or event to focus
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/create")}
              className="pill-btn px-4 py-2 text-sm font-semibold"
            >
              Schedule
            </button>
          </div>
          <CalendarLarge tasks={contents} />
        </div>
      </div>
    </div>
  );
};

export default Home;
