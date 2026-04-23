import { logoutUser as requestLogout } from "@api/auth";
import Calendar from "@components/home/Calendar";
import CalendarLegends from "@components/home/CalendarLegends";
import {
  clearCredentials,
  clearPersistedCredentials,
  selectProfile,
} from "@store/slices/profileSlice";
import { useMemo, useState } from "react";
import { FiLogOut } from "react-icons/fi";
import { IoMdAdd } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector(selectProfile);
  const [loggingOut, setLoggingOut] = useState(false);

  const { displayName, initial, emailLabel } = useMemo(() => {
    const organization = user?.organizationName?.trim();
    const fullName = user?.name?.trim?.();
    const email = user?.email?.trim?.();
    const username = user?.username?.trim?.();
    const firstName = fullName?.split(/\s+/)[0] || "";
    const emailHandle = email?.split("@")[0] || "";
    const derivedInitial =
      firstName?.charAt(0)?.toUpperCase() ||
      username?.charAt(0)?.toUpperCase() ||
      emailHandle?.charAt(0)?.toUpperCase() ||
      organization?.charAt(0)?.toUpperCase() ||
      "U";
    const primaryLabel = organization || fullName || username || emailHandle || "User";
    return {
      displayName: primaryLabel,
      initial: derivedInitial,
      emailLabel: email || "",
    };
  }, [user]);

  const handleLogout = async () => {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);
    let hadError = false;

    try {
      if (token) {
        await requestLogout(token);
      }
    } catch (error) {
      hadError = true;
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to logout user"
      );
    } finally {
      dispatch(clearCredentials());
      clearPersistedCredentials();
      setLoggingOut(false);
      if (!hadError) {
        toast.success("You have been logged out");
      }
      navigate("/auth", { replace: true });
    }
  };

  return (
    <div className="hidden lg:flex w-[280px] flex-col gap-4 min-h-[calc(100vh-2rem)]">
      <div className="glass-panel rounded-2xl px-4 py-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[#8eb2df]">Workspace</p>
        <h2 className="mt-1 text-2xl font-semibold">contentOS</h2>
        <p className="mt-1 text-xs text-[#aac2e8]">Marketing planning cockpit</p>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        <div className="glass-panel rounded-2xl p-3">
          <Calendar mode={"view"} />
        </div>
        <button
          type="button"
          className="pill-btn flex items-center justify-center text-[16px] font-semibold gap-[10px] rounded-xl cursor-pointer p-3 transition"
          onClick={() => navigate("/create")}
        >
          <IoMdAdd /> Schedule Post
        </button>
        <div className="glass-panel rounded-2xl p-4">
          <CalendarLegends />
        </div>
      </div>

      <div className="mt-auto">
        <div className="glass-panel flex items-center gap-3 rounded-2xl px-3 py-3">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={displayName}
              className="h-9 w-9 min-h-9 min-w-9 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 min-h-8 min-w-8 items-center justify-center rounded-full bg-[#274571] text-base font-semibold uppercase text-neutral-100">
              {initial}
            </div>
          )}
          <div className="flex flex-col flex-1">
            <span className="text-sm font-medium text-neutral-100">{displayName}</span>
            {emailLabel && (
              <span className="text-xs text-neutral-300 truncate">{emailLabel}</span>
            )}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 rounded-lg aspect-square cursor-pointer bg-[#1f3559] px-3 py-2 text-sm font-medium text-neutral-200 transition hover:bg-[#2a4774] disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Logout"
          >
            <FiLogOut />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;
